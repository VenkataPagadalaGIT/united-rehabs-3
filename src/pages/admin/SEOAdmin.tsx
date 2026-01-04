import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Globe, ExternalLink } from "lucide-react";

interface PageSEO {
  id: string;
  page_slug: string;
  page_type: string;
  state_id: string | null;
  meta_title: string;
  meta_description: string | null;
  meta_keywords: string[] | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  robots: string | null;
  h1_title: string | null;
  intro_text: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

const pageTypes = [
  { value: "state_stats", label: "State Statistics" },
  { value: "state_rehabs", label: "State Rehab Centers" },
  { value: "state_resources", label: "State Free Resources" },
  { value: "landing", label: "Landing Page" },
  { value: "general", label: "General Page" },
];

const defaultSEO: Partial<PageSEO> = {
  page_slug: "",
  page_type: "state_stats",
  state_id: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: [],
  og_title: "",
  og_description: "",
  og_image_url: "",
  canonical_url: "",
  robots: "index, follow",
  h1_title: "",
  intro_text: "",
  is_active: true,
};

const SEOAdmin = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSEO, setEditingSEO] = useState<Partial<PageSEO> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: seoPages, isLoading } = useQuery({
    queryKey: ["admin-page-seo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_seo")
        .select("*")
        .order("page_slug", { ascending: true });
      if (error) throw error;
      return data as PageSEO[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (seo: Partial<PageSEO>) => {
      const keywords = keywordsInput.split(",").map(k => k.trim()).filter(Boolean);
      const payload = {
        page_slug: seo.page_slug!,
        page_type: seo.page_type || "state_stats",
        state_id: seo.state_id || null,
        meta_title: seo.meta_title!,
        meta_description: seo.meta_description || null,
        meta_keywords: keywords.length > 0 ? keywords : null,
        og_title: seo.og_title || null,
        og_description: seo.og_description || null,
        og_image_url: seo.og_image_url || null,
        canonical_url: seo.canonical_url || null,
        robots: seo.robots || "index, follow",
        h1_title: seo.h1_title || null,
        intro_text: seo.intro_text || null,
        is_active: seo.is_active ?? true,
      };

      if (seo.id) {
        const { error } = await supabase
          .from("page_seo")
          .update(payload)
          .eq("id", seo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("page_seo")
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-page-seo"] });
      setIsDialogOpen(false);
      setEditingSEO(null);
      setKeywordsInput("");
      toast({ title: "Saved", description: "Page SEO updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("page_seo").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-page-seo"] });
      toast({ title: "Deleted", description: "Page SEO removed" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (seo: PageSEO) => {
    setEditingSEO(seo);
    setKeywordsInput(seo.meta_keywords?.join(", ") || "");
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingSEO({ ...defaultSEO });
    setKeywordsInput("");
    setIsDialogOpen(true);
  };

  const filteredPages = seoPages?.filter(
    (page) =>
      page.page_slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.meta_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPageTypeLabel = (type: string) => {
    return pageTypes.find(pt => pt.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Page SEO Management</h1>
          <p className="text-muted-foreground">
            Manage meta tags, titles, and descriptions for all pages
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Page SEO
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Pages</CardTitle>
          <CardDescription>
            {filteredPages?.length || 0} pages configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page Slug</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Meta Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages?.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        /{page.page_slug}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getPageTypeLabel(page.page_type)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {page.meta_title}
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.is_active ? "default" : "secondary"}>
                        {page.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(page)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(page.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPages?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No pages found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSEO?.id ? "Edit Page SEO" : "Add Page SEO"}
            </DialogTitle>
            <DialogDescription>
              Configure SEO settings for this page
            </DialogDescription>
          </DialogHeader>

          {editingSEO && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="page_slug">Page Slug *</Label>
                  <Input
                    id="page_slug"
                    value={editingSEO.page_slug || ""}
                    onChange={(e) => setEditingSEO({ ...editingSEO, page_slug: e.target.value })}
                    placeholder="california-addiction-stats"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="page_type">Page Type</Label>
                  <Select
                    value={editingSEO.page_type || "state_stats"}
                    onValueChange={(value) => setEditingSEO({ ...editingSEO, page_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state_id">State ID</Label>
                <Input
                  id="state_id"
                  value={editingSEO.state_id || ""}
                  onChange={(e) => setEditingSEO({ ...editingSEO, state_id: e.target.value })}
                  placeholder="ca"
                />
              </div>

              {/* Meta Tags */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Meta Tags</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title * (60 chars max)</Label>
                  <Input
                    id="meta_title"
                    value={editingSEO.meta_title || ""}
                    onChange={(e) => setEditingSEO({ ...editingSEO, meta_title: e.target.value })}
                    maxLength={60}
                    placeholder="California Addiction Statistics 2024"
                  />
                  <p className="text-xs text-muted-foreground">
                    {(editingSEO.meta_title?.length || 0)}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description (160 chars max)</Label>
                  <Textarea
                    id="meta_description"
                    value={editingSEO.meta_description || ""}
                    onChange={(e) => setEditingSEO({ ...editingSEO, meta_description: e.target.value })}
                    maxLength={160}
                    rows={3}
                    placeholder="Comprehensive California addiction statistics..."
                  />
                  <p className="text-xs text-muted-foreground">
                    {(editingSEO.meta_description?.length || 0)}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="meta_keywords"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    placeholder="addiction, rehab, california, treatment"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="robots">Robots</Label>
                  <Select
                    value={editingSEO.robots || "index, follow"}
                    onValueChange={(value) => setEditingSEO({ ...editingSEO, robots: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index, follow">Index, Follow</SelectItem>
                      <SelectItem value="noindex, follow">NoIndex, Follow</SelectItem>
                      <SelectItem value="index, nofollow">Index, NoFollow</SelectItem>
                      <SelectItem value="noindex, nofollow">NoIndex, NoFollow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Open Graph */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Open Graph (Social Sharing)</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="og_title">OG Title</Label>
                  <Input
                    id="og_title"
                    value={editingSEO.og_title || ""}
                    onChange={(e) => setEditingSEO({ ...editingSEO, og_title: e.target.value })}
                    placeholder="Leave empty to use Meta Title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_description">OG Description</Label>
                  <Textarea
                    id="og_description"
                    value={editingSEO.og_description || ""}
                    onChange={(e) => setEditingSEO({ ...editingSEO, og_description: e.target.value })}
                    rows={2}
                    placeholder="Leave empty to use Meta Description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_image_url">OG Image URL</Label>
                  <Input
                    id="og_image_url"
                    value={editingSEO.og_image_url || ""}
                    onChange={(e) => setEditingSEO({ ...editingSEO, og_image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical_url">Canonical URL</Label>
                  <Input
                    id="canonical_url"
                    value={editingSEO.canonical_url || ""}
                    onChange={(e) => setEditingSEO({ ...editingSEO, canonical_url: e.target.value })}
                    placeholder="https://example.com/page"
                  />
                </div>
              </div>

              {/* Page Content */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Page Content</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="h1_title">H1 Title</Label>
                  <Input
                    id="h1_title"
                    value={editingSEO.h1_title || ""}
                    onChange={(e) => setEditingSEO({ ...editingSEO, h1_title: e.target.value })}
                    placeholder="Main heading displayed on page"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intro_text">Intro Text</Label>
                  <Textarea
                    id="intro_text"
                    value={editingSEO.intro_text || ""}
                    onChange={(e) => setEditingSEO({ ...editingSEO, intro_text: e.target.value })}
                    rows={3}
                    placeholder="Introduction paragraph for the page"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 border-t pt-4">
                <Switch
                  checked={editingSEO.is_active ?? true}
                  onCheckedChange={(checked) => setEditingSEO({ ...editingSEO, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingSEO && saveMutation.mutate(editingSEO)}
              disabled={saveMutation.isPending || !editingSEO?.page_slug || !editingSEO?.meta_title}
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SEOAdmin;
