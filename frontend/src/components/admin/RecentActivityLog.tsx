import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  Database, 
  HelpCircle, 
  FileText, 
  Search,
  Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "statistics" | "substance" | "faqs" | "resources" | "seo";
  state: string;
  year?: number;
  timestamp: Date;
}

const typeConfig = {
  statistics: { icon: BarChart3, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", label: "Statistics" },
  substance: { icon: Database, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30", label: "Substance Stats" },
  faqs: { icon: HelpCircle, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30", label: "FAQs" },
  resources: { icon: FileText, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30", label: "Resources" },
  seo: { icon: Search, color: "text-teal-500", bg: "bg-teal-100 dark:bg-teal-900/30", label: "SEO" },
};

const stateNames: Record<string, string> = {
  al: "Alabama", ak: "Alaska", az: "Arizona", ar: "Arkansas", ca: "California",
  co: "Colorado", ct: "Connecticut", de: "Delaware", fl: "Florida", ga: "Georgia",
  hi: "Hawaii", id: "Idaho", il: "Illinois", in: "Indiana", ia: "Iowa",
  ks: "Kansas", ky: "Kentucky", la: "Louisiana", me: "Maine", md: "Maryland",
  ma: "Massachusetts", mi: "Michigan", mn: "Minnesota", ms: "Mississippi", mo: "Missouri",
  mt: "Montana", ne: "Nebraska", nv: "Nevada", nh: "New Hampshire", nj: "New Jersey",
  nm: "New Mexico", ny: "New York", nc: "North Carolina", nd: "North Dakota", oh: "Ohio",
  ok: "Oklahoma", or: "Oregon", pa: "Pennsylvania", ri: "Rhode Island", sc: "South Carolina",
  sd: "South Dakota", tn: "Tennessee", tx: "Texas", ut: "Utah", vt: "Vermont",
  va: "Virginia", wa: "Washington", wv: "West Virginia", wi: "Wisconsin", wy: "Wyoming",
};

export default function RecentActivityLog() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent records from all tables in parallel
      const [statsRes, substanceRes, faqsRes, resourcesRes, seoRes] = await Promise.all([
        supabase
          .from("state_addiction_statistics")
          .select("id, state_id, state_name, year, updated_at")
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("substance_statistics")
          .select("id, state_id, state_name, year, updated_at")
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("faqs")
          .select("id, state_id, updated_at")
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("free_resources")
          .select("id, state_id, updated_at")
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("page_seo")
          .select("id, state_id, updated_at")
          .eq("page_type", "state")
          .order("updated_at", { ascending: false })
          .limit(5),
      ]);

      const allActivities: ActivityItem[] = [];

      // Process statistics
      (statsRes.data || []).forEach((item) => {
        allActivities.push({
          id: `stats-${item.id}`,
          type: "statistics",
          state: item.state_name || stateNames[item.state_id] || item.state_id,
          year: item.year,
          timestamp: new Date(item.updated_at),
        });
      });

      // Process substance stats
      (substanceRes.data || []).forEach((item) => {
        allActivities.push({
          id: `substance-${item.id}`,
          type: "substance",
          state: item.state_name || stateNames[item.state_id] || item.state_id,
          year: item.year,
          timestamp: new Date(item.updated_at),
        });
      });

      // Process FAQs
      (faqsRes.data || []).forEach((item) => {
        if (item.state_id) {
          allActivities.push({
            id: `faq-${item.id}`,
            type: "faqs",
            state: stateNames[item.state_id] || item.state_id,
            timestamp: new Date(item.updated_at),
          });
        }
      });

      // Process resources
      (resourcesRes.data || []).forEach((item) => {
        if (item.state_id) {
          allActivities.push({
            id: `resource-${item.id}`,
            type: "resources",
            state: stateNames[item.state_id] || item.state_id,
            timestamp: new Date(item.updated_at),
          });
        }
      });

      // Process SEO
      (seoRes.data || []).forEach((item) => {
        if (item.state_id) {
          allActivities.push({
            id: `seo-${item.id}`,
            type: "seo",
            state: stateNames[item.state_id] || item.state_id,
            timestamp: new Date(item.updated_at),
          });
        }
      });

      // Sort by timestamp and take top 5
      allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setActivities(allActivities.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchRecentActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && activities.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/4 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500 animate-pulse" />
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <Badge variant="outline" className="ml-auto text-xs">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const config = typeConfig[activity.type];
              const Icon = config.icon;
              
              return (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {config.label} for {activity.state}
                      {activity.year && ` (${activity.year})`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
