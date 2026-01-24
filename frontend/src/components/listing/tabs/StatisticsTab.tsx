import { useQuery } from "@tanstack/react-query";
import { statisticsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface StatisticsTabProps {
  stateId?: string;
}

export const StatisticsTab = ({ stateId }: StatisticsTabProps) => {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ["state-statistics", stateId],
    queryFn: async () => {
      return await statisticsApi.getAll({ state_id: stateId, limit: 10 });
    },
    enabled: !!stateId,
  });

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  const latestStat = statistics?.[0];

  if (!latestStat) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No statistics available for this state.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {latestStat.state_name} Addiction Statistics ({latestStat.year})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{latestStat.total_affected?.toLocaleString() || "N/A"}</div>
              <div className="text-sm text-muted-foreground">Total Affected</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{latestStat.overdose_deaths?.toLocaleString() || "N/A"}</div>
              <div className="text-sm text-muted-foreground">Overdose Deaths</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{latestStat.opioid_deaths?.toLocaleString() || "N/A"}</div>
              <div className="text-sm text-muted-foreground">Opioid Deaths</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{latestStat.recovery_rate ? `${latestStat.recovery_rate}%` : "N/A"}</div>
              <div className="text-sm text-muted-foreground">Recovery Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsTab;
