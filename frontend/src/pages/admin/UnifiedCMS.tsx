import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, Save, Upload, Image, Search, FileText, Globe, Link2 } from "lucide-react";

const API = import.meta.env.REACT_APP_BACKEND_URL || "";

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
}

// ============================================
// IMAGE UPLOADER
// ============================================
function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${API}/api/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Upload failed");
    }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <Label>Featured Image</Label>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image URL or upload" className="flex-1" />
        <label className="cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <Button variant="outline" size="sm" asChild disabled={uploading}>
            <span><Upload className="h-4 w-4 mr-1" />{uploading ? "..." : "Upload"}</span>
          </Button>
        </label>
      </div>
      {value && <img src={value.startsWith("/") ? `${API}${value}` : value} alt="Preview" className="h-24 rounded border object-cover" />}
    </div>
  );
}

// ============================================
// SEO FIELDS (reusable)
// ============================================
function SEOFields({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="space-y-3 bg-muted/30 rounded-lg p-4 border">
      <div className="flex items-center gap-2 mb-2">
        <Search className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">SEO Settings</span>
      </div>
      <div>
        <Label className="text-xs">Meta Title <span className="text-muted-foreground">({(data.meta_title || "").length}/60)</span></Label>
        <Input value={data.meta_title || ""} onChange={(e) => onChange({ ...data, meta_title: e.target.value })} placeholder="SEO title (60 chars max)" maxLength={65} />
      </div>
      <div>
        <Label className="text-xs">Meta Description <span className="text-muted-foreground">({(data.meta_description || "").length}/155)</span></Label>
        <Textarea value={data.meta_description || ""} onChange={(e) => onChange({ ...data, meta_description: e.target.value })} placeholder="SEO description (155 chars max)" maxLength={160} rows={2} />
      </div>
      <div>
        <Label className="text-xs">Keywords</Label>
        <Input value={data.meta_keywords || ""} onChange={(e) => onChange({ ...data, meta_keywords: e.target.value })} placeholder="comma, separated, keywords" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Canonical URL</Label>
          <Input value={data.canonical_url || ""} onChange={(e) => onChange({ ...data, canonical_url: e.target.value })} placeholder="/page-slug" />
        </div>
        <div>
          <Label className="text-xs">Robots</Label>
          <Select value={data.robots || "index,follow"} onValueChange={(v) => onChange({ ...data, robots: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="index,follow">Index, Follow</SelectItem>
              <SelectItem value="noindex,follow">No Index, Follow</SelectItem>
              <SelectItem value="noindex,nofollow">No Index, No Follow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ARTICLES TAB
// ============================================
function ArticlesTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/articles?limit=100`, { headers: authHeaders() });
      return res.json();
    },
  });

  const articles = articlesData?.items || articlesData || [];

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = data.id ? `${API}/api/articles/${data.id}` : `${API}/api/articles`;
      const method = data.id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(data) });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-articles"] }); toast.success("Saved"); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`${API}/api/articles/${id}`, { method: "DELETE", headers: authHeaders() });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-articles"] }); toast.success("Deleted"); },
  });

  const openEditor = (article?: any) => {
    setForm(article || { title: "", slug: "", content: "", content_type: "news", tags: [], is_published: false, meta_title: "", meta_description: "", meta_keywords: "", featured_image_url: "", faq_items: [], related_countries: [], related_states: [] });
    setEditing(article || "new");
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{form.id ? "Edit Article" : "New Article"}</h3>
          <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Type</Label>
            <Select value={form.content_type || "news"} onValueChange={(v) => setForm({ ...form, content_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="guide">Guide</SelectItem>
                <SelectItem value="article">Article</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Author</Label>
            <Input value={form.author_name || ""} onChange={(e) => setForm({ ...form, author_name: e.target.value })} />
          </div>
          <div>
            <Label>Read Time</Label>
            <Input value={form.read_time || ""} onChange={(e) => setForm({ ...form, read_time: e.target.value })} placeholder="5 min read" />
          </div>
        </div>

        <div>
          <Label>Excerpt</Label>
          <Textarea value={form.excerpt || ""} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
        </div>

        <ImageUploader value={form.featured_image_url || ""} onChange={(url) => setForm({ ...form, featured_image_url: url })} />

        <div>
          <Label>Content (HTML)</Label>
          <Textarea value={form.content || ""} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={15} className="font-mono text-sm" />
        </div>

        <div>
          <Label>Tags (comma separated)</Label>
          <Input value={(form.tags || []).join(", ")} onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean) })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Related Countries (comma: USA,GBR)</Label>
            <Input value={(form.related_countries || []).join(",")} onChange={(e) => setForm({ ...form, related_countries: e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean) })} />
          </div>
          <div>
            <Label>Related States (comma: CA,NY)</Label>
            <Input value={(form.related_states || []).join(",")} onChange={(e) => setForm({ ...form, related_states: e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean) })} />
          </div>
        </div>

        <SEOFields data={form} onChange={setForm} />

        <div>
          <Label>FAQ Items (JSON array)</Label>
          <Textarea value={JSON.stringify(form.faq_items || [], null, 2)} onChange={(e) => { try { setForm({ ...form, faq_items: JSON.parse(e.target.value) }); } catch {} }} rows={4} className="font-mono text-xs" />
        </div>

        <div className="flex items-center gap-4">
          <Switch checked={form.is_published || false} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
          <Label>Published</Label>
          <Switch checked={form.is_featured || false} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
          <Label>Featured</Label>
        </div>

        <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />{saveMutation.isPending ? "Saving..." : "Save Article"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-sm text-muted-foreground">{articles.length} articles</span>
        <Button size="sm" onClick={() => openEditor()}><Plus className="h-4 w-4 mr-1" />New Article</Button>
      </div>
      {articles.map((a: any) => (
        <div key={a.id} className="flex items-center gap-3 p-3 border rounded-lg">
          {a.featured_image_url && <img src={a.featured_image_url.startsWith("/") ? `${API}${a.featured_image_url}` : a.featured_image_url} className="w-16 h-12 rounded object-cover" />}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{a.title}</div>
            <div className="text-xs text-muted-foreground">{a.content_type} | /news/{a.slug}</div>
          </div>
          <Badge variant={a.is_published ? "default" : "outline"}>{a.is_published ? "Live" : "Draft"}</Badge>
          <Button variant="ghost" size="icon" onClick={() => openEditor(a)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(a.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ))}
    </div>
  );
}

// ============================================
// SEO TEMPLATES TAB
// ============================================
function SEOTemplatesTab() {
  const qc = useQueryClient();
  const pageTypes = [
    { type: "state", label: "State Pages", example: "{state_name} Addiction Statistics | United Rehabs" },
    { type: "country", label: "Country Pages", example: "{country_name} Addiction Statistics | United Rehabs" },
    { type: "news", label: "News Articles", example: "{title} | United Rehabs" },
    { type: "drug-laws", label: "Drug Law Pages", example: "{state_name} Drug Laws | United Rehabs" },
  ];

  const { data: templates = [] } = useQuery({
    queryKey: ["seo-templates"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/seo/templates`, { headers: authHeaders() });
      return res.json();
    },
  });

  const [forms, setForms] = useState<Record<string, any>>({});

  const getTemplate = (type: string) => {
    return forms[type] || templates.find((t: any) => t.page_type === type) || {};
  };

  const saveMutation = useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any }) => {
      await fetch(`${API}/api/seo/templates/${type}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["seo-templates"] }); toast.success("Template saved"); },
  });

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Set SEO templates for page types. Use variables like {"{state_name}"}, {"{country_name}"}, {"{title}"}, {"{year}"}.</p>
      {pageTypes.map(({ type, label, example }) => {
        const t = getTemplate(type);
        return (
          <Card key={type}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{label}</CardTitle>
              <p className="text-xs text-muted-foreground">Example: {example}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Title Template</Label>
                <Input value={t.title_template || ""} onChange={(e) => setForms({ ...forms, [type]: { ...t, title_template: e.target.value } })} placeholder="{state_name} Addiction Statistics | United Rehabs" />
              </div>
              <div>
                <Label className="text-xs">Description Template</Label>
                <Textarea value={t.description_template || ""} onChange={(e) => setForms({ ...forms, [type]: { ...t, description_template: e.target.value } })} placeholder="{state_name} addiction statistics..." rows={2} />
              </div>
              <div>
                <Label className="text-xs">Keywords Template</Label>
                <Input value={t.keywords_template || ""} onChange={(e) => setForms({ ...forms, [type]: { ...t, keywords_template: e.target.value } })} placeholder="{state_name} addiction, {state_name} overdose..." />
              </div>
              <Button size="sm" onClick={() => saveMutation.mutate({ type, data: getTemplate(type) })}>
                <Save className="h-3 w-3 mr-1" />Save Template
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================
// CMS PAGES TAB
// ============================================
function CMSPagesTab() {
  const qc = useQueryClient();
  const pages = [
    { slug: "about-us", label: "About Us" },
    { slug: "privacy-policy", label: "Privacy Policy" },
    { slug: "terms-of-service", label: "Terms of Service" },
    { slug: "legal-disclaimer", label: "Legal Disclaimer" },
    { slug: "accessibility", label: "Accessibility" },
    { slug: "affiliate-disclosure", label: "Affiliate Disclosure" },
  ];

  const [selected, setSelected] = useState("about-us");
  const [form, setForm] = useState<any>({});

  const { data: pageData } = useQuery({
    queryKey: ["cms-page", selected],
    queryFn: async () => {
      const res = await fetch(`${API}/api/pages/${selected}`);
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await fetch(`${API}/api/pages/${selected}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ slug: selected, title: form.title || pageData?.title, content: form.content || pageData?.content, content_format: "html", meta_title: form.meta_title || "", meta_description: form.meta_description || "", is_published: true }),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cms-page", selected] }); toast.success("Page saved"); },
  });

  const currentData = { ...pageData, ...form };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {pages.map((p) => (
          <Button key={p.slug} variant={selected === p.slug ? "default" : "outline"} size="sm" onClick={() => { setSelected(p.slug); setForm({}); }}>
            {p.label}
          </Button>
        ))}
      </div>
      <div>
        <Label>Page Title</Label>
        <Input value={currentData.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <SEOFields data={currentData} onChange={(d) => setForm({ ...form, ...d })} />
      <div>
        <Label>Content (HTML)</Label>
        <Textarea value={currentData.content || ""} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={15} className="font-mono text-sm" />
      </div>
      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
        <Save className="h-4 w-4 mr-2" />Save Page
      </Button>
    </div>
  );
}

// ============================================
// SIDEBAR LINKS TAB
// ============================================
function SidebarLinksTab() {
  const qc = useQueryClient();
  const { data: links = [] } = useQuery({
    queryKey: ["sidebar-links"],
    queryFn: async () => { const res = await fetch(`${API}/api/config/sidebar-links`); return res.json(); },
  });

  const [form, setForm] = useState<Array<{ label: string; url: string }>>([]);
  const currentLinks = form.length ? form : links;

  const saveMutation = useMutation({
    mutationFn: async () => {
      await fetch(`${API}/api/config/sidebar-links`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(currentLinks) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sidebar-links"] }); toast.success("Links saved"); },
  });

  const updateLink = (i: number, field: string, value: string) => {
    const updated = [...currentLinks];
    updated[i] = { ...updated[i], [field]: value };
    setForm(updated);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">These links appear in the news article sidebar.</p>
      {currentLinks.map((link: any, i: number) => (
        <div key={i} className="flex gap-2 items-center">
          <Input value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)} placeholder="Label" className="w-1/3" />
          <Input value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} placeholder="/url-or-https://..." className="flex-1" />
          <Button variant="ghost" size="icon" onClick={() => setForm(currentLinks.filter((_: any, j: number) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setForm([...currentLinks, { label: "", url: "" }])}><Plus className="h-4 w-4 mr-1" />Add Link</Button>
      <div><Button onClick={() => saveMutation.mutate()}><Save className="h-4 w-4 mr-2" />Save Links</Button></div>
    </div>
  );
}

// ============================================
// MAIN CMS PAGE
// ============================================
export default function UnifiedCMS() {
  return (
    <div className="space-y-4" data-testid="unified-cms">
      <h2 className="text-2xl font-bold">Content Management</h2>
      <p className="text-muted-foreground text-sm">Manage all content, SEO, images, and links. No deployment needed.</p>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="articles" className="gap-1"><FileText className="h-3 w-3" />Articles</TabsTrigger>
          <TabsTrigger value="pages" className="gap-1"><Globe className="h-3 w-3" />Pages</TabsTrigger>
          <TabsTrigger value="seo-templates" className="gap-1"><Search className="h-3 w-3" />SEO Templates</TabsTrigger>
          <TabsTrigger value="sidebar" className="gap-1"><Link2 className="h-3 w-3" />Sidebar Links</TabsTrigger>
        </TabsList>

        <TabsContent value="articles"><ArticlesTab /></TabsContent>
        <TabsContent value="pages"><CMSPagesTab /></TabsContent>
        <TabsContent value="seo-templates"><SEOTemplatesTab /></TabsContent>
        <TabsContent value="sidebar"><SidebarLinksTab /></TabsContent>
      </Tabs>
    </div>
  );
}
