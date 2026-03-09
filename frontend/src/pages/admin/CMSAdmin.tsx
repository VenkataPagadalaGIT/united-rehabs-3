import { useState } from "react";
import { sanitizeHtml } from "@/lib/sanitize";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cmsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FileText, Save, Eye, RefreshCw, ExternalLink } from "lucide-react";

const CMS_PAGES = [
  { slug: "about-us", title: "About Us", path: "/about" },
  { slug: "privacy-policy", title: "Privacy Policy", path: "/privacy-policy" },
  { slug: "terms-of-service", title: "Terms of Service", path: "/terms-of-service" },
  { slug: "legal-disclaimer", title: "Legal Disclaimer", path: "/legal-disclaimer" },
  { slug: "accessibility", title: "Accessibility", path: "/accessibility" },
  { slug: "affiliate-disclosure", title: "Affiliate Disclosure", path: "/affiliate-disclosure" },
];

interface PageContent {
  slug: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  version?: number;
  updated_at?: string;
  last_edited_by?: string;
}

export default function CMSAdmin() {
  const [selectedPage, setSelectedPage] = useState("about-us");
  const [editedContent, setEditedContent] = useState<Partial<PageContent>>({});
  const [isPreview, setIsPreview] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pageContent, isLoading, refetch } = useQuery({
    queryKey: ["cms-page", selectedPage],
    queryFn: () => cmsApi.getPage(selectedPage),
    staleTime: 0,
  });

  const updateMutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) =>
      cmsApi.updatePage(slug, data),
    onSuccess: () => {
      toast({ title: "Page Updated", description: "Content saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["cms-page", selectedPage] });
      setEditedContent({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save",
        variant: "destructive",
      });
    },
  });

  const currentTitle = editedContent.title ?? pageContent?.title ?? "";
  const currentContent = editedContent.content ?? pageContent?.content ?? "";
  const currentMetaTitle = editedContent.meta_title ?? pageContent?.meta_title ?? "";
  const currentMetaDesc = editedContent.meta_description ?? pageContent?.meta_description ?? "";
  const isPublished = editedContent.is_published ?? pageContent?.is_published ?? true;

  const handleSave = () => {
    updateMutation.mutate({
      slug: selectedPage,
      data: {
        title: currentTitle,
        content: currentContent,
        meta_title: currentMetaTitle,
        meta_description: currentMetaDesc,
        is_published: isPublished,
      },
    });
  };

  const handlePageChange = (slug: string) => {
    setSelectedPage(slug);
    setEditedContent({});
    setIsPreview(false);
  };

  const hasChanges = Object.keys(editedContent).length > 0;
  const currentPageConfig = CMS_PAGES.find((p) => p.slug === selectedPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8" />
            CMS Pages
          </h1>
          <p className="text-muted-foreground mt-1">Edit legal and static page content</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {currentPageConfig && (
            <Button variant="outline" asChild>
              <a href={currentPageConfig.path} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Page
              </a>
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs value={selectedPage} onValueChange={handlePageChange}>
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
          {CMS_PAGES.map((page) => (
            <TabsTrigger key={page.slug} value={page.slug} className="text-sm">
              {page.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {CMS_PAGES.map((page) => (
          <TabsContent key={page.slug} value={page.slug}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Page Title</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input
                        value={currentTitle}
                        onChange={(e) =>
                          setEditedContent((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="Page title..."
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Content (HTML)</CardTitle>
                      <Button
                        variant={isPreview ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsPreview(!isPreview)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {isPreview ? "Edit" : "Preview"}
                      </Button>
                    </div>
                    <CardDescription>Enter HTML content for the page.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-96 w-full" />
                    ) : isPreview ? (
                      <div
                        className="prose prose-sm max-w-none p-4 bg-muted/50 rounded-lg min-h-96 overflow-auto"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentContent) }}
                      />
                    ) : (
                      <Textarea
                        value={currentContent}
                        onChange={(e) =>
                          setEditedContent((prev) => ({ ...prev, content: e.target.value }))
                        }
                        placeholder="Page content in HTML..."
                        className="min-h-96 font-mono text-sm"
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="published">Published</Label>
                      <Switch
                        id="published"
                        checked={isPublished}
                        onCheckedChange={(checked) =>
                          setEditedContent((prev) => ({ ...prev, is_published: checked }))
                        }
                      />
                    </div>
                    {pageContent?.version && (
                      <p className="text-xs text-muted-foreground mt-4">
                        Version: {pageContent.version}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">SEO Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="meta-title">Meta Title</Label>
                      <Input
                        id="meta-title"
                        value={currentMetaTitle}
                        onChange={(e) =>
                          setEditedContent((prev) => ({ ...prev, meta_title: e.target.value }))
                        }
                        placeholder="SEO title..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="meta-desc">Meta Description</Label>
                      <Textarea
                        id="meta-desc"
                        value={currentMetaDesc}
                        onChange={(e) =>
                          setEditedContent((prev) => ({ ...prev, meta_description: e.target.value }))
                        }
                        placeholder="SEO description..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
