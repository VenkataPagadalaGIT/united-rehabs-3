import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye, FileText, Newspaper, BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  content_type: string;
  featured_image_url: string | null;
  author_name: string | null;
  state_id: string | null;
  category: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  is_featured: boolean | null;
  is_published: boolean | null;
  published_at: string | null;
  views_count: number | null;
  read_time: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

const defaultArticle: Partial<Article> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  content_type: "blog",
  featured_image_url: "",
  author_name: "",
  state_id: "",
  category: "",
  tags: [],
  meta_title: "",
  meta_description: "",
  is_featured: false,
  is_published: false,
  read_time: "5 min read",
  sort_order: 0,
};

const contentTypes = [
  { value: "blog", label: "Blog Post", icon: BookOpen },
  { value: "news", label: "News", icon: Newspaper },
  { value: "article", label: "Article", icon: FileText },
  { value: "guide", label: "Guide", icon: BookOpen },
];

export default function ArticlesAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: articles, isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Article[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (article: Partial<Article>) => {
      if (!article.title || !article.slug) {
        throw new Error("Title and slug are required");
      }
      const { error } = await supabase.from("articles").insert([{
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || null,
        content: article.content || null,
        content_type: article.content_type || "blog",
        featured_image_url: article.featured_image_url || null,
        author_name: article.author_name || null,
        state_id: article.state_id || null,
        category: article.category || null,
        tags: article.tags || null,
        meta_title: article.meta_title || null,
        meta_description: article.meta_description || null,
        is_featured: article.is_featured || false,
        is_published: article.is_published || false,
        read_time: article.read_time || "5 min read",
        sort_order: article.sort_order || 0,
        published_at: article.is_published ? new Date().toISOString() : null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article created successfully");
      setIsDialogOpen(false);
      setEditingArticle(null);
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async (article: Partial<Article>) => {
      const { error } = await supabase
        .from("articles")
        .update({
          ...article,
          published_at: article.is_published && !editingArticle?.published_at 
            ? new Date().toISOString() 
            : article.published_at,
        })
        .eq("id", article.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article updated successfully");
      setIsDialogOpen(false);
      setEditingArticle(null);
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article deleted successfully");
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    
    if (editingArticle.id) {
      updateMutation.mutate(editingArticle);
    } else {
      createMutation.mutate(editingArticle);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const filteredArticles = articles?.filter(
    (a) => filterType === "all" || a.content_type === filterType
  );

  const getTypeIcon = (type: string) => {
    const found = contentTypes.find((t) => t.value === type);
    return found ? found.icon : FileText;
  };

  if (isLoading) {
    return <div className="p-6">Loading articles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Articles & Content</h2>
          <p className="text-muted-foreground">Manage blogs, news, and articles for SEO</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {contentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingArticle(defaultArticle)}>
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingArticle?.id ? "Edit Article" : "Create New Article"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Title</Label>
                    <Input
                      value={editingArticle?.title || ""}
                      onChange={(e) => {
                        const title = e.target.value;
                        setEditingArticle((prev) => ({
                          ...prev,
                          title,
                          slug: prev?.slug || generateSlug(title),
                        }));
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={editingArticle?.slug || ""}
                      onChange={(e) =>
                        setEditingArticle((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Content Type</Label>
                    <Select
                      value={editingArticle?.content_type || "blog"}
                      onValueChange={(value) =>
                        setEditingArticle((prev) => ({ ...prev, content_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Excerpt</Label>
                    <Textarea
                      value={editingArticle?.excerpt || ""}
                      onChange={(e) =>
                        setEditingArticle((prev) => ({ ...prev, excerpt: e.target.value }))
                      }
                      rows={2}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Content (Markdown supported)</Label>
                    <Textarea
                      value={editingArticle?.content || ""}
                      onChange={(e) =>
                        setEditingArticle((prev) => ({ ...prev, content: e.target.value }))
                      }
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label>Author Name</Label>
                    <Input
                      value={editingArticle?.author_name || ""}
                      onChange={(e) =>
                        setEditingArticle((prev) => ({ ...prev, author_name: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={editingArticle?.category || ""}
                      onChange={(e) =>
                        setEditingArticle((prev) => ({ ...prev, category: e.target.value }))
                      }
                      placeholder="e.g., Treatment, Recovery"
                    />
                  </div>
                  <div>
                    <Label>Featured Image URL</Label>
                    <Input
                      value={editingArticle?.featured_image_url || ""}
                      onChange={(e) =>
                        setEditingArticle((prev) => ({
                          ...prev,
                          featured_image_url: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Read Time</Label>
                    <Input
                      value={editingArticle?.read_time || ""}
                      onChange={(e) =>
                        setEditingArticle((prev) => ({ ...prev, read_time: e.target.value }))
                      }
                      placeholder="5 min read"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Meta Title (SEO)</Label>
                    <Input
                      value={editingArticle?.meta_title || ""}
                      onChange={(e) =>
                        setEditingArticle((prev) => ({ ...prev, meta_title: e.target.value }))
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Meta Description (SEO)</Label>
                    <Textarea
                      value={editingArticle?.meta_description || ""}
                      onChange={(e) =>
                        setEditingArticle((prev) => ({
                          ...prev,
                          meta_description: e.target.value,
                        }))
                      }
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingArticle?.is_featured || false}
                        onCheckedChange={(checked) =>
                          setEditingArticle((prev) => ({ ...prev, is_featured: checked }))
                        }
                      />
                      <Label>Featured</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingArticle?.is_published || false}
                        onCheckedChange={(checked) =>
                          setEditingArticle((prev) => ({ ...prev, is_published: checked }))
                        }
                      />
                      <Label>Published</Label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingArticle?.id ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredArticles?.map((article) => {
          const TypeIcon = getTypeIcon(article.content_type);
          return (
            <Card key={article.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        /{article.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={article.is_published ? "default" : "secondary"}>
                      {article.is_published ? "Published" : "Draft"}
                    </Badge>
                    {article.is_featured && <Badge variant="outline">Featured</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="capitalize">{article.content_type}</span>
                  {article.author_name && <span>By {article.author_name}</span>}
                  {article.category && <span>{article.category}</span>}
                  {article.read_time && <span>{article.read_time}</span>}
                  <span>{article.views_count || 0} views</span>
                </div>
                {article.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/${article.content_type}/${article.slug}`, "_blank")}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingArticle(article);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("Delete this article?")) {
                        deleteMutation.mutate(article.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredArticles?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No articles found. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}
