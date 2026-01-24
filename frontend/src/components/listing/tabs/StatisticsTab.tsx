import { useQuery } from "@tanstack/react-query";
import { statisticsApi, substanceStatisticsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingDown, TrendingUp, Users, Building2, DollarSign } from "lucide-react";

interface StatisticsTabProps {
  stateId?: string;
  stateName?: string;
}

export const StatisticsTab = ({ stateId, stateName }: StatisticsTabProps) => {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ["state-statistics", stateId],
    queryFn: async () => {
      return await statisticsApi.getAll({ state_id: stateId, limit: 10 });
    },
    enabled: !!stateId,
  });

  const { data: substances } = useQuery({
    queryKey: ["state-substances", stateId],
    queryFn: async () => {
      return await substanceStatisticsApi.getAll({ state_id: stateId, limit: 10 });
    },
    enabled: !!stateId,
  });

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" data-testid="statistics-loading" />;
  }

  const latestStat = statistics?.[0];
  const displayName = latestStat?.state_name || stateName || "State";

  if (!latestStat) {
    return (
      <Card data-testid="statistics-empty">
        <CardContent className="py-8 text-center text-muted-foreground">
          No statistics available for this state.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="statistics-content">
      {/* Main Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {displayName} Addiction Statistics ({latestStat.year})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg" data-testid="stat-total-affected">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Total Affected</span>
              </div>
              <div className="text-2xl font-bold">{latestStat.total_affected?.toLocaleString() || "N/A"}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg" data-testid="stat-overdose-deaths">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-xs text-muted-foreground">Overdose Deaths</span>
              </div>
              <div className="text-2xl font-bold">{latestStat.overdose_deaths?.toLocaleString() || "N/A"}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg" data-testid="stat-opioid-deaths">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Opioid Deaths</span>
              </div>
              <div className="text-2xl font-bold">{latestStat.opioid_deaths?.toLocaleString() || "N/A"}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg" data-testid="stat-recovery-rate">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Recovery Rate</span>
              </div>
              <div className="text-2xl font-bold">{latestStat.recovery_rate ? `${latestStat.recovery_rate}%` : "N/A"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Facilities Card */}
      {(latestStat.total_treatment_centers || latestStat.treatment_admissions) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Treatment Facilities & Admissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{latestStat.total_treatment_centers?.toLocaleString() || "N/A"}</div>
                <div className="text-sm text-muted-foreground">Total Centers</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{latestStat.inpatient_facilities?.toLocaleString() || "N/A"}</div>
                <div className="text-sm text-muted-foreground">Inpatient Facilities</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{latestStat.outpatient_facilities?.toLocaleString() || "N/A"}</div>
                <div className="text-sm text-muted-foreground">Outpatient Facilities</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{latestStat.treatment_admissions?.toLocaleString() || "N/A"}</div>
                <div className="text-sm text-muted-foreground">Annual Admissions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Age Demographics Card */}
      {(latestStat.affected_age_12_17 || latestStat.affected_age_18_25) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Age Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{latestStat.affected_age_12_17?.toLocaleString() || "N/A"}</div>
                <div className="text-sm text-muted-foreground">Ages 12-17</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{latestStat.affected_age_18_25?.toLocaleString() || "N/A"}</div>
                <div className="text-sm text-muted-foreground">Ages 18-25</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{latestStat.affected_age_26_34?.toLocaleString() || "N/A"}</div>
                <div className="text-sm text-muted-foreground">Ages 26-34</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{latestStat.affected_age_35_plus?.toLocaleString() || "N/A"}</div>
                <div className="text-sm text-muted-foreground">Ages 35+</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Economic Impact Card */}
      {latestStat.economic_cost_billions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Economic Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">${latestStat.economic_cost_billions}B</div>
                <div className="text-sm text-muted-foreground">Annual Cost</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{latestStat.drug_abuse_rate ? `${latestStat.drug_abuse_rate}%` : "N/A"}</div>
                <div className="text-sm text-muted-foreground">Drug Abuse Rate</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{latestStat.alcohol_abuse_rate ? `${latestStat.alcohol_abuse_rate}%` : "N/A"}</div>
                <div className="text-sm text-muted-foreground">Alcohol Abuse Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Source */}
      {latestStat.data_source && (
        <p className="text-xs text-muted-foreground text-center">
          Data Source: {latestStat.data_source}
        </p>
      )}
    </div>
  );
};

export default StatisticsTab;
