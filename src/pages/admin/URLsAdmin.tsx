import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

interface RouteInfo {
  path: string;
  name: string;
  description: string;
  type: "public" | "admin" | "content";
}

const routes: RouteInfo[] = [
  // Public Pages
  { path: "/", name: "Homepage", description: "Main landing page with hero, featured centers, and CTAs", type: "public" },
  { path: "/california-addiction-rehabs", name: "California Rehabs", description: "State page with treatment centers, statistics, and resources", type: "public" },
  { path: "/texas-addiction-rehabs", name: "Texas Rehabs", description: "Texas state rehab centers page", type: "public" },
  { path: "/florida-addiction-rehabs", name: "Florida Rehabs", description: "Florida state rehab centers page", type: "public" },
  { path: "/new-york-addiction-rehabs", name: "New York Rehabs", description: "New York state rehab centers page", type: "public" },
  { path: "/terms-of-service", name: "Terms of Service", description: "Legal terms and conditions", type: "public" },
  { path: "/privacy-policy", name: "Privacy Policy", description: "Privacy and data handling policy", type: "public" },
  
  // Content Pages
  { path: "/blog", name: "Blog Listing", description: "All published blog posts", type: "content" },
  { path: "/news", name: "News Listing", description: "All published news articles", type: "content" },
  { path: "/article", name: "Articles Listing", description: "All published articles", type: "content" },
  { path: "/guide", name: "Guides Listing", description: "All published recovery guides", type: "content" },
  { path: "/guide/understanding-addiction-complete-guide-recovery", name: "Sample Guide", description: "Sample article with full content", type: "content" },
  { path: "/shortcodes", name: "Shortcode Showcase", description: "Visual preview of all available shortcodes", type: "content" },
  
  // Admin Pages
  { path: "/admin/login", name: "Admin Login", description: "Admin authentication page", type: "admin" },
  { path: "/admin", name: "Admin Dashboard", description: "Overview and quick stats", type: "admin" },
  { path: "/admin/articles", name: "Articles CMS", description: "Manage blogs, news, articles, and guides", type: "admin" },
  { path: "/admin/statistics", name: "State Statistics", description: "Manage addiction statistics by state", type: "admin" },
  { path: "/admin/substance", name: "Substance Stats", description: "Manage substance-specific statistics", type: "admin" },
  { path: "/admin/resources", name: "Free Resources", description: "Manage helplines and free resources", type: "admin" },
  { path: "/admin/sources", name: "Data Sources", description: "Manage data sources and citations", type: "admin" },
  { path: "/admin/guides", name: "Rehab Guides", description: "Manage treatment guides", type: "admin" },
  { path: "/admin/faqs", name: "FAQs", description: "Manage frequently asked questions", type: "admin" },
  { path: "/admin/content", name: "Page Content", description: "Manage page sections and content blocks", type: "admin" },
  { path: "/admin/seo", name: "Page SEO", description: "Manage SEO metadata for pages", type: "admin" },
  { path: "/admin/urls", name: "Site URLs", description: "View all site URLs (this page)", type: "admin" },
];

const typeColors: Record<string, string> = {
  public: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  content: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

export default function URLsAdmin() {
  const baseUrl = window.location.origin;

  const copyUrl = (path: string) => {
    navigator.clipboard.writeText(`${baseUrl}${path}`);
    toast.success("URL copied to clipboard!");
  };

  const openUrl = (path: string) => {
    window.open(path, "_blank");
  };

  const groupedRoutes = {
    public: routes.filter((r) => r.type === "public"),
    content: routes.filter((r) => r.type === "content"),
    admin: routes.filter((r) => r.type === "admin"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Site URLs</h2>
        <p className="text-muted-foreground">All available pages and routes in your application</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Badge className={typeColors.public}>Public Pages: {groupedRoutes.public.length}</Badge>
        <Badge className={typeColors.content}>Content Pages: {groupedRoutes.content.length}</Badge>
        <Badge className={typeColors.admin}>Admin Pages: {groupedRoutes.admin.length}</Badge>
      </div>

      {/* Public Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            Public Pages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {groupedRoutes.public.map((route) => (
            <div
              key={route.path}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{route.name}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{route.description}</p>
                <code className="text-xs bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                  {route.path}
                </code>
              </div>
              <div className="flex gap-1 ml-4">
                <Button variant="ghost" size="sm" onClick={() => copyUrl(route.path)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openUrl(route.path)}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Content Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            Content Pages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {groupedRoutes.content.map((route) => (
            <div
              key={route.path}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{route.name}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{route.description}</p>
                <code className="text-xs bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                  {route.path}
                </code>
              </div>
              <div className="flex gap-1 ml-4">
                <Button variant="ghost" size="sm" onClick={() => copyUrl(route.path)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openUrl(route.path)}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Admin Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            Admin Pages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {groupedRoutes.admin.map((route) => (
            <div
              key={route.path}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{route.name}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{route.description}</p>
                <code className="text-xs bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                  {route.path}
                </code>
              </div>
              <div className="flex gap-1 ml-4">
                <Button variant="ghost" size="sm" onClick={() => copyUrl(route.path)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openUrl(route.path)}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
