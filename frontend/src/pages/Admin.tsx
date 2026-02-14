import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  BarChart3,
  BookOpen,
  HelpCircle,
  FileText,
  Gift,
  Database,
  LogOut,
  Home,
  Loader2,
  Settings,
  Search,
  Newspaper,
  Link2,
  Shield,
  Brain,
  PieChart,
  Upload,
  Globe,
  CheckCircle,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/you-are-the-admin", icon: Home },
  { title: "AI Generator", url: "/you-are-the-admin/content-generator", icon: Brain },
  { title: "SERP Validation", url: "/you-are-the-admin/serp-validation", icon: CheckCircle },
  { title: "Bulk Import", url: "/you-are-the-admin/bulk-import", icon: Upload },
  { title: "Data Coverage", url: "/you-are-the-admin/data-coverage", icon: PieChart },
  { title: "Articles", url: "/you-are-the-admin/articles", icon: Newspaper },
  { title: "CMS Pages", url: "/you-are-the-admin/cms", icon: Globe },
  { title: "Statistics", url: "/you-are-the-admin/statistics", icon: BarChart3 },
  { title: "Substance Stats", url: "/you-are-the-admin/substance", icon: Database },
  { title: "Free Resources", url: "/you-are-the-admin/resources", icon: Gift },
  { title: "Data Sources", url: "/you-are-the-admin/sources", icon: FileText },
  { title: "Rehab Guides", url: "/you-are-the-admin/guides", icon: BookOpen },
  { title: "FAQs", url: "/you-are-the-admin/faqs", icon: HelpCircle },
  { title: "Page Content", url: "/you-are-the-admin/content", icon: Settings },
  { title: "Page SEO", url: "/you-are-the-admin/seo", icon: Search },
  { title: "Site URLs", url: "/you-are-the-admin/urls", icon: Link2 },
  { title: "Security", url: "/you-are-the-admin/security", icon: Shield },
];

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    } else if (!loading && user && !isAdmin) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-lg font-bold px-4 py-6">
                Admin CMS
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/admin"}
                          className="hover:bg-muted/50"
                          activeClassName="bg-muted text-primary font-medium"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/")}
              >
                <Home className="mr-2 h-4 w-4" />
                View Website
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-lg font-semibold">
                  {menuItems.find((item) => 
                    item.url === "/admin" 
                      ? location.pathname === "/admin" 
                      : location.pathname.startsWith(item.url)
                  )?.title || "Admin"}
                </h1>
              </div>
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
