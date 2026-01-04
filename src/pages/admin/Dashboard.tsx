import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, BookOpen, HelpCircle, Gift, Database, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { data: statsCount } = useQuery({
    queryKey: ["admin-stats-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("state_addiction_statistics")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: substanceCount } = useQuery({
    queryKey: ["admin-substance-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("substance_statistics")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: resourcesCount } = useQuery({
    queryKey: ["admin-resources-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("free_resources")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: sourcesCount } = useQuery({
    queryKey: ["admin-sources-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("data_sources")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: guidesCount } = useQuery({
    queryKey: ["admin-guides-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("rehab_guides")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: faqsCount } = useQuery({
    queryKey: ["admin-faqs-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("faqs")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const cards = [
    { title: "State Statistics", count: statsCount, icon: BarChart3, href: "/admin/statistics", color: "text-blue-500" },
    { title: "Substance Stats", count: substanceCount, icon: Database, href: "/admin/substance", color: "text-purple-500" },
    { title: "Free Resources", count: resourcesCount, icon: Gift, href: "/admin/resources", color: "text-green-500" },
    { title: "Data Sources", count: sourcesCount, icon: FileText, href: "/admin/sources", color: "text-orange-500" },
    { title: "Rehab Guides", count: guidesCount, icon: BookOpen, href: "/admin/guides", color: "text-cyan-500" },
    { title: "FAQs", count: faqsCount, icon: HelpCircle, href: "/admin/faqs", color: "text-pink-500" },
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
                <div className="text-3xl font-bold">{card.count ?? "..."}</div>
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
