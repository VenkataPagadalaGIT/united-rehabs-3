import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { seoApi } from "@/lib/api";
import { 
  Globe, Settings, FolderTree, FileText, Plus, Pencil, Trash2, 
  Search, Download, AlertCircle, CheckCircle, ExternalLink
} from "lucide-react";

interface GlobalSEOSettings {
  site_name: string;
  default_title_suffix: string;
  default_meta_description: string;
  default_og_image?: string;
  default_robots: string;
  google_site_verification?: string;
  bing_site_verification?: string;
  twitter_handle?: string;
  facebook_app_id?: string;
}

interface FolderRule {
  id: string;
  path_pattern: string;
  rule_name: string;
  title_template?: string;
  meta_description_template?: string;
  robots: string;
  canonical_rule: string;
  priority: number;
  include_in_sitemap: boolean;
  sitemap_priority: number;
  sitemap_changefreq: string;
  is_active: boolean;
}

interface PageSEO {
  page_slug: string;
  page_type: string;
  meta_title: string;
  meta_description?: string;
  canonical_url?: string;
  robots?: string;
  noindex: boolean;
  nofollow: boolean;
  include_in_sitemap: boolean;
}

export default function SEOManagerAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("global");
  const [editingRule, setEditingRule] = useState<FolderRule | null>(null);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch global settings
  const { data: globalSettings, isLoading: globalLoading } = useQuery({
    queryKey: ["seo-global"],
    queryFn: seoApi.getGlobalSettings,
  });

  // Fetch folder rules
  const { data: folderRulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ["seo-folder-rules"],
    queryFn: seoApi.getFolderRules,
  });

  // Fetch page SEO list
  const { data: pageSeoData, isLoading: pagesLoading } = useQuery({
    queryKey: ["seo-pages", searchQuery],
    queryFn: () => seoApi.getPageSeoList(searchQuery ? { search: searchQuery } : {}),
  });

  // Fetch audit data
  const { data: auditData } = useQuery({
    queryKey: ["seo-audit"],
    queryFn: seoApi.getAudit,
  });

  // Mutations
  const updateGlobalMutation = useMutation({
    mutationFn: seoApi.updateGlobalSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-global"] });
      toast({ title: "Global SEO settings saved" });
    },
    onError: () => toast({ title: "Error saving settings", variant: "destructive" }),
  });

  const createRuleMutation = useMutation({
    mutationFn: seoApi.createFolderRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-folder-rules"] });
      setIsAddingRule(false);
      toast({ title: "Folder rule created" });
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => seoApi.updateFolderRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-folder-rules"] });
      setEditingRule(null);
      toast({ title: "Folder rule updated" });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: seoApi.deleteFolderRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-folder-rules"] });
      toast({ title: "Folder rule deleted" });
    },
  });

  const folderRules = folderRulesData?.rules || [];
  const pageSeoList = pageSeoData?.pages || [];

  return (
    <div className="space-y-6" data-testid="seo-manager-admin">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">SEO Manager</h1>
              <p className="text-muted-foreground">Control site-wide, folder, and page-level SEO</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/api/seo/sitemap.xml" target="_blank" rel="noopener">
                <Download className="h-4 w-4 mr-2" /> Sitemap
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/api/seo/robots.txt" target="_blank" rel="noopener">
                <FileText className="h-4 w-4 mr-2" /> Robots.txt
              </a>
            </Button>
          </div>
        </div>

        {/* Audit Summary */}
        {auditData && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{auditData.total_state_pages}</div>
                <div className="text-sm text-muted-foreground">State Pages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{auditData.total_country_pages}</div>
                <div className="text-sm text-muted-foreground">Country Pages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{auditData.pages_with_custom_seo}</div>
                <div className="text-sm text-muted-foreground">Custom SEO</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-amber-600">{auditData.pages_using_defaults}</div>
                <div className="text-sm text-muted-foreground">Using Defaults</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{auditData.coverage_percent}%</div>
                <div className="text-sm text-muted-foreground">Coverage</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Global Settings
            </TabsTrigger>
            <TabsTrigger value="folders" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" /> Folder Rules
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Page Overrides
            </TabsTrigger>
          </TabsList>

          {/* Global Settings Tab */}
          <TabsContent value="global">
            <Card>
              <CardHeader>
                <CardTitle>Global SEO Settings</CardTitle>
                <CardDescription>Site-wide defaults applied to all pages unless overridden</CardDescription>
              </CardHeader>
              <CardContent>
                {globalLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      updateGlobalMutation.mutate({
                        site_name: formData.get("site_name") as string,
                        default_title_suffix: formData.get("default_title_suffix") as string,
                        default_meta_description: formData.get("default_meta_description") as string,
                        default_robots: formData.get("default_robots") as string,
                        default_og_image: formData.get("default_og_image") as string || undefined,
                        google_site_verification: formData.get("google_site_verification") as string || undefined,
                        twitter_handle: formData.get("twitter_handle") as string || undefined,
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="site_name">Site Name</Label>
                        <Input
                          id="site_name"
                          name="site_name"
                          defaultValue={globalSettings?.site_name || "United Rehabs"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="default_title_suffix">Title Suffix</Label>
                        <Input
                          id="default_title_suffix"
                          name="default_title_suffix"
                          defaultValue={globalSettings?.default_title_suffix || " | United Rehabs"}
                          placeholder=" | United Rehabs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default_meta_description">Default Meta Description</Label>
                      <Textarea
                        id="default_meta_description"
                        name="default_meta_description"
                        defaultValue={globalSettings?.default_meta_description || ""}
                        placeholder="Default description for pages without custom SEO"
                        rows={3}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="default_robots">Default Robots</Label>
                        <Select name="default_robots" defaultValue={globalSettings?.default_robots || "index, follow"}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="index, follow">Index, Follow</SelectItem>
                            <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                            <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                            <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="default_og_image">Default OG Image URL</Label>
                        <Input
                          id="default_og_image"
                          name="default_og_image"
                          defaultValue={globalSettings?.default_og_image || ""}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="google_site_verification">Google Verification</Label>
                        <Input
                          id="google_site_verification"
                          name="google_site_verification"
                          defaultValue={globalSettings?.google_site_verification || ""}
                          placeholder="Verification code"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter_handle">Twitter Handle</Label>
                        <Input
                          id="twitter_handle"
                          name="twitter_handle"
                          defaultValue={globalSettings?.twitter_handle || ""}
                          placeholder="@unitedrehabs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook_app_id">Facebook App ID</Label>
                        <Input
                          id="facebook_app_id"
                          name="facebook_app_id"
                          defaultValue={globalSettings?.facebook_app_id || ""}
                          placeholder="App ID"
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={updateGlobalMutation.isPending}>
                      {updateGlobalMutation.isPending ? "Saving..." : "Save Global Settings"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Folder Rules Tab */}
          <TabsContent value="folders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Folder-Level SEO Rules</CardTitle>
                  <CardDescription>Rules applied to URL patterns (e.g., all state pages)</CardDescription>
                </div>
                <Button onClick={() => setIsAddingRule(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Rule
                </Button>
              </CardHeader>
              <CardContent>
                {rulesLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : folderRules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No folder rules defined yet.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsAddingRule(true)}>
                      Create First Rule
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule Name</TableHead>
                        <TableHead>Path Pattern</TableHead>
                        <TableHead>Robots</TableHead>
                        <TableHead>Sitemap</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {folderRules.map((rule: FolderRule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.rule_name}</TableCell>
                          <TableCell><code className="text-xs bg-muted px-1 rounded">{rule.path_pattern}</code></TableCell>
                          <TableCell>
                            <Badge variant={rule.robots.includes("noindex") ? "destructive" : "secondary"}>
                              {rule.robots}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {rule.include_in_sitemap ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>{rule.priority}</TableCell>
                          <TableCell>
                            <Badge variant={rule.is_active ? "default" : "outline"}>
                              {rule.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setEditingRule(rule)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteRuleMutation.mutate(rule.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Page Overrides Tab */}
          <TabsContent value="pages">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Page-Level SEO Overrides</CardTitle>
                  <CardDescription>Custom SEO for specific pages (overrides folder & global)</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search pages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {pagesLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : pageSeoList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No page-level SEO overrides yet.</p>
                    <p className="text-sm">Pages use folder or global settings by default.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page Slug</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Meta Title</TableHead>
                        <TableHead>Index</TableHead>
                        <TableHead>Sitemap</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageSeoList.map((page: PageSEO) => (
                        <TableRow key={page.page_slug}>
                          <TableCell>
                            <a
                              href={`/${page.page_slug}`}
                              target="_blank"
                              rel="noopener"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {page.page_slug}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{page.page_type}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{page.meta_title}</TableCell>
                          <TableCell>
                            {page.noindex ? (
                              <Badge variant="destructive">NoIndex</Badge>
                            ) : (
                              <Badge variant="secondary">Index</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {page.include_in_sitemap ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Rule Dialog */}
        <FolderRuleDialog
          isOpen={isAddingRule || !!editingRule}
          onClose={() => {
            setIsAddingRule(false);
            setEditingRule(null);
          }}
          rule={editingRule}
          onSave={(data) => {
            if (editingRule) {
              updateRuleMutation.mutate({ id: editingRule.id, data });
            } else {
              createRuleMutation.mutate(data);
            }
          }}
          isLoading={createRuleMutation.isPending || updateRuleMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}

// Folder Rule Dialog Component
function FolderRuleDialog({
  isOpen,
  onClose,
  rule,
  onSave,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  rule: FolderRule | null;
  onSave: (data: any) => void;
  isLoading: boolean;
}) {
  const isEditing = !!rule;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Folder Rule" : "Add Folder Rule"}</DialogTitle>
          <DialogDescription>
            Define SEO rules for URL path patterns
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSave({
              id: rule?.id || crypto.randomUUID(),
              rule_name: formData.get("rule_name"),
              path_pattern: formData.get("path_pattern"),
              title_template: formData.get("title_template") || null,
              meta_description_template: formData.get("meta_description_template") || null,
              robots: formData.get("robots"),
              canonical_rule: formData.get("canonical_rule"),
              priority: parseInt(formData.get("priority") as string) || 0,
              include_in_sitemap: formData.get("include_in_sitemap") === "on",
              sitemap_priority: parseFloat(formData.get("sitemap_priority") as string) || 0.5,
              sitemap_changefreq: formData.get("sitemap_changefreq"),
              is_active: true,
            });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rule_name">Rule Name</Label>
              <Input
                id="rule_name"
                name="rule_name"
                defaultValue={rule?.rule_name || ""}
                placeholder="e.g., State Pages"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="path_pattern">Path Pattern</Label>
              <Input
                id="path_pattern"
                name="path_pattern"
                defaultValue={rule?.path_pattern || ""}
                placeholder="e.g., /*-addiction-rehabs"
                required
              />
              <p className="text-xs text-muted-foreground">Use * as wildcard</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title_template">Title Template (optional)</Label>
            <Input
              id="title_template"
              name="title_template"
              defaultValue={rule?.title_template || ""}
              placeholder="{page_name} Addiction Treatment | United Rehabs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description_template">Meta Description Template (optional)</Label>
            <Textarea
              id="meta_description_template"
              name="meta_description_template"
              defaultValue={rule?.meta_description_template || ""}
              placeholder="Find addiction treatment centers in {location}..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="robots">Robots Directive</Label>
              <Select name="robots" defaultValue={rule?.robots || "index, follow"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="index, follow">Index, Follow</SelectItem>
                  <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                  <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                  <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="canonical_rule">Canonical Rule</Label>
              <Select name="canonical_rule" defaultValue={rule?.canonical_rule || "self"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Self (default)</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="custom">Custom Pattern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Rule Priority</Label>
              <Input
                id="priority"
                name="priority"
                type="number"
                defaultValue={rule?.priority || 0}
                min={0}
                max={100}
              />
              <p className="text-xs text-muted-foreground">Higher = more specific</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sitemap_priority">Sitemap Priority</Label>
              <Input
                id="sitemap_priority"
                name="sitemap_priority"
                type="number"
                step="0.1"
                min="0"
                max="1"
                defaultValue={rule?.sitemap_priority || 0.5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sitemap_changefreq">Change Frequency</Label>
              <Select name="sitemap_changefreq" defaultValue={rule?.sitemap_changefreq || "weekly"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Always</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include_in_sitemap"
                  name="include_in_sitemap"
                  defaultChecked={rule?.include_in_sitemap ?? true}
                />
                <Label htmlFor="include_in_sitemap">Include in Sitemap</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update Rule" : "Create Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
