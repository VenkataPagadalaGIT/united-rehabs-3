import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Users, Activity, DollarSign, Building2, AlertTriangle, Heart } from "lucide-react";
import { useState } from "react";

interface StatisticsTabProps {
  stateId: string;
  stateName: string;
}

interface StateStatistics {
  id: string;
  state_id: string;
  state_name: string;
  year: number;
  total_affected: number | null;
  alcohol_abuse_rate: number | null;
  drug_abuse_rate: number | null;
  opioid_deaths: number | null;
  overdose_deaths: number | null;
  affected_age_12_17: number | null;
  affected_age_18_25: number | null;
  affected_age_26_34: number | null;
  affected_age_35_plus: number | null;
  treatment_admissions: number | null;
  recovery_rate: number | null;
  relapse_rate: number | null;
  total_treatment_centers: number | null;
  inpatient_facilities: number | null;
  outpatient_facilities: number | null;
  economic_cost_billions: number | null;
  data_source: string | null;
  source_url: string | null;
}

export const StatisticsTab = ({ stateId, stateName }: StatisticsTabProps) => {
  const [selectedYear, setSelectedYear] = useState<string>("2024");

  const { data: statistics, isLoading } = useQuery({
    queryKey: ["state-statistics", stateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("state_addiction_statistics")
        .select("*")
        .eq("state_id", stateId)
        .order("year", { ascending: false });

      if (error) throw error;
      return data as StateStatistics[];
    },
  });

  const currentYearData = statistics?.find((s) => s.year === parseInt(selectedYear));
  const previousYearData = statistics?.find((s) => s.year === parseInt(selectedYear) - 1);

  const calculateChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    return ((current - previous) / previous) * 100;
  };

  const formatNumber = (num: number | null) => {
    if (!num) return "N/A";
    return new Intl.NumberFormat("en-US").format(num);
  };

  const availableYears = statistics?.map((s) => s.year) || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!currentYearData) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No statistics available for {stateName}. Data will be updated as government sources release new information.
        </CardContent>
      </Card>
    );
  }

  const StatCard = ({
    title,
    value,
    previousValue,
    icon: Icon,
    suffix = "",
    prefix = "",
    inverseColor = false,
  }: {
    title: string;
    value: number | null;
    previousValue?: number | null;
    icon: React.ElementType;
    suffix?: string;
    prefix?: string;
    inverseColor?: boolean;
  }) => {
    const change = calculateChange(value, previousValue ?? null);
    const isPositive = change !== null && change > 0;
    const changeColor = inverseColor
      ? isPositive
        ? "text-red-500"
        : "text-green-500"
      : isPositive
      ? "text-green-500"
      : "text-red-500";

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {prefix}
            {typeof value === "number" ? formatNumber(value) : "N/A"}
            {suffix}
          </div>
          {change !== null && (
            <p className={`text-xs flex items-center gap-1 mt-1 ${changeColor}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(change).toFixed(1)}% from {parseInt(selectedYear) - 1}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Year Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{stateName} Addiction Statistics</h2>
          <p className="text-muted-foreground">
            Data sourced from {currentYearData.data_source || "government agencies"}
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Affected"
          value={currentYearData.total_affected}
          previousValue={previousYearData?.total_affected}
          icon={Users}
          inverseColor={true}
        />
        <StatCard
          title="Overdose Deaths"
          value={currentYearData.overdose_deaths}
          previousValue={previousYearData?.overdose_deaths}
          icon={AlertTriangle}
          inverseColor={true}
        />
        <StatCard
          title="Treatment Admissions"
          value={currentYearData.treatment_admissions}
          previousValue={previousYearData?.treatment_admissions}
          icon={Activity}
        />
        <StatCard
          title="Recovery Rate"
          value={currentYearData.recovery_rate ? Number(currentYearData.recovery_rate) : null}
          previousValue={previousYearData?.recovery_rate ? Number(previousYearData.recovery_rate) : null}
          icon={Heart}
          suffix="%"
        />
      </div>

      {/* Substance Abuse Rates */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Substance Abuse Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Alcohol Abuse Rate"
            value={currentYearData.alcohol_abuse_rate ? Number(currentYearData.alcohol_abuse_rate) : null}
            previousValue={previousYearData?.alcohol_abuse_rate ? Number(previousYearData.alcohol_abuse_rate) : null}
            icon={Activity}
            suffix="%"
            inverseColor={true}
          />
          <StatCard
            title="Drug Abuse Rate"
            value={currentYearData.drug_abuse_rate ? Number(currentYearData.drug_abuse_rate) : null}
            previousValue={previousYearData?.drug_abuse_rate ? Number(previousYearData.drug_abuse_rate) : null}
            icon={Activity}
            suffix="%"
            inverseColor={true}
          />
          <StatCard
            title="Opioid Deaths"
            value={currentYearData.opioid_deaths}
            previousValue={previousYearData?.opioid_deaths}
            icon={AlertTriangle}
            inverseColor={true}
          />
        </div>
      </div>

      {/* Age Demographics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Affected by Age Group</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ages 12-17</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(currentYearData.affected_age_12_17)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ages 18-25</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(currentYearData.affected_age_18_25)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ages 26-34</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(currentYearData.affected_age_26_34)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ages 35+</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(currentYearData.affected_age_35_plus)}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Treatment Facilities */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Treatment Facilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Centers"
            value={currentYearData.total_treatment_centers}
            previousValue={previousYearData?.total_treatment_centers}
            icon={Building2}
          />
          <StatCard
            title="Inpatient Facilities"
            value={currentYearData.inpatient_facilities}
            previousValue={previousYearData?.inpatient_facilities}
            icon={Building2}
          />
          <StatCard
            title="Outpatient Facilities"
            value={currentYearData.outpatient_facilities}
            previousValue={previousYearData?.outpatient_facilities}
            icon={Building2}
          />
        </div>
      </div>

      {/* Economic Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Economic Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            ${currentYearData.economic_cost_billions?.toFixed(1) || "N/A"} Billion
          </div>
          <p className="text-muted-foreground mt-2">
            Annual economic cost of substance abuse in {stateName} ({selectedYear})
          </p>
        </CardContent>
      </Card>

      {/* Data Source */}
      {currentYearData.source_url && (
        <p className="text-xs text-muted-foreground text-center">
          Data sources: {currentYearData.data_source}.{" "}
          <a href={currentYearData.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            View source
          </a>
        </p>
      )}
    </div>
  );
};
