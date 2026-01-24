import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, BookOpen, HelpCircle, Gift, Database, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { data: counts, isLoading } = useQuery({
    queryKey: ["admin-dashboard-counts"],
    queryFn: () => dashboardApi.getCounts(),
  });

  const cards = [
    { title: "State Statistics", count: counts?.statistics_count, icon: BarChart3, href: "/admin/statistics", color: "text-blue-500" },
    { title: "Substance Stats", count: counts?.substance_count, icon: Database, href: "/admin/substance", color: "text-purple-500" },
    { title: "Free Resources", count: counts?.resources_count, icon: Gift, href: "/admin/resources", color: "text-green-500" },
    { title: "Data Sources", count: counts?.sources_count, icon: FileText, href: "/admin/sources", color: "text-orange-500" },
    { title: "Rehab Guides", count: counts?.guides_count, icon: BookOpen, href: "/admin/guides", color: "text-cyan-500" },
    { title: "FAQs", count: counts?.faqs_count, icon: HelpCircle, href: "/admin/faqs", color: "text-pink-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome to the Admin CMS</h2>
        <p className="text-muted-foreground">
          Manage all content and data for your rehab directory website.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.title} to={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? "..." : (card.count ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total records
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Use the sidebar to navigate to different sections and manage your content.
            Each section allows you to create, edit, and delete records.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
