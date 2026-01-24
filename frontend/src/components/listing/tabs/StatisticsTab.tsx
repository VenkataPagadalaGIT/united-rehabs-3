import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Users, Activity, DollarSign, AlertTriangle, Heart, Info } from "lucide-react";
import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { SubstanceCharts } from "./SubstanceCharts";
import { DataSourcesSection } from "./DataSourcesSection";
import { RehabGuides } from "../RehabGuides";
import { DataAccuracyDisclaimer } from "./DataAccuracyDisclaimer";

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

const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  muted: "hsl(var(--muted))",
  destructive: "hsl(var(--destructive))",
  blue: "#3b82f6",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#8b5cf6",
  red: "#ef4444",
  cyan: "#06b6d4",
};

const PIE_COLORS = [CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.orange, CHART_COLORS.purple];

export const StatisticsTab = ({ stateId, stateName }: StatisticsTabProps) => {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const { data: statistics, isLoading } = useQuery({
    queryKey: ["state-statistics", stateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("state_addiction_statistics")
        .select("*")
        .eq("state_id", stateId)
        .order("year", { ascending: true });

      if (error) throw error;
      return data as StateStatistics[];
    },
  });

  // Get available years from actual data - cap at 2025 as the latest complete data year
  const LATEST_COMPLETE_YEAR = 2025;
  const yearsWithData = statistics?.map(s => s.year).filter(y => y <= LATEST_COMPLETE_YEAR).sort((a, b) => b - a) || [];
  const mostRecentYear = yearsWithData.length > 0 ? yearsWithData[0].toString() : null;
  
  // Only use a year that actually has data (capped at 2025)
  const effectiveYear = selectedYear && yearsWithData.includes(parseInt(selectedYear)) 
    ? selectedYear 
    : mostRecentYear;

  const { data: substanceStats } = useQuery({
    queryKey: ["substance-statistics", stateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("substance_statistics")
        .select("*")
        .eq("state_id", stateId)
        .order("year", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const currentYearData = statistics?.find((s) => s.year === parseInt(effectiveYear));
  const previousYearData = statistics?.find((s) => s.year === parseInt(effectiveYear) - 1);

  const calculateChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    return ((current - previous) / previous) * 100;
  };

  const formatNumber = (num: number | null) => {
    if (!num) return "N/A";
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // Use years from actual data (yearsWithData is defined at top)

  // Prepare chart data
  const trendData = statistics?.map((s) => ({
    year: s.year.toString(),
    affected: s.total_affected,
    overdoseDeaths: s.overdose_deaths,
    opioidDeaths: s.opioid_deaths,
    admissions: s.treatment_admissions,
  })) || [];

  const ratesData = statistics?.map((s) => ({
    year: s.year.toString(),
    alcoholRate: Number(s.alcohol_abuse_rate),
    drugRate: Number(s.drug_abuse_rate),
    recoveryRate: Number(s.recovery_rate),
  })) || [];

  const ageData = currentYearData ? [
    { name: "12-17", value: currentYearData.affected_age_12_17 || 0 },
    { name: "18-25", value: currentYearData.affected_age_18_25 || 0 },
    { name: "26-34", value: currentYearData.affected_age_26_34 || 0 },
    { name: "35+", value: currentYearData.affected_age_35_plus || 0 },
  ] : [];

  const facilityData = currentYearData ? [
    { name: "Inpatient", value: currentYearData.inpatient_facilities || 0 },
    { name: "Outpatient", value: currentYearData.outpatient_facilities || 0 },
  ] : [];

  const economicData = statistics?.map((s) => ({
    year: s.year.toString(),
    cost: Number(s.economic_cost_billions),
  })) || [];

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

  if (!currentYearData || !effectiveYear) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold truncate">{stateName} Addiction Statistics</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Data sourced from SAMHSA, CDC, NIDA
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No statistics data available for {stateName} yet. Use the AI Generator in the admin panel to populate data for this state.
          </CardContent>
        </Card>
      </div>
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
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-2">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold truncate">
            {prefix}
            {typeof value === "number" ? formatNumber(value) : "N/A"}
            {suffix}
          </div>
          {change !== null && (
            <p className={`text-[10px] sm:text-xs flex items-center gap-1 mt-1 ${changeColor}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span className="truncate">{Math.abs(change).toFixed(1)}% from {parseInt(effectiveYear) - 1}</span>
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Year Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold truncate">{stateName} Addiction Statistics</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Data sourced from {currentYearData.data_source || "SAMHSA, CDC, NIDA"}
          </p>
        </div>
        {yearsWithData.length > 0 && (
          <Select value={effectiveYear || ""} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px] sm:w-[120px] flex-shrink-0">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {yearsWithData.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Data Disclaimer */}
      {parseInt(selectedYear) >= 2024 && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <Info className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <AlertDescription className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
            <strong>Note:</strong> {selectedYear} data is provisional and subject to revision. 
            Final figures from CDC and SAMHSA may differ once official reports are published.
          </AlertDescription>
        </Alert>
      )}

      {/* Estimated Data Notice */}
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <AlertDescription className="text-blue-700 dark:text-blue-400 text-xs sm:text-sm">
          <strong>Data Notes:</strong> "Total Affected" and "Treatment Admissions" are estimates based on SAMHSA NSDUH surveys. 
          "Recovery Rate" is a derived metric not officially tracked by CDC/SAMHSA. 
          Overdose deaths are from CDC WONDER and CDPH vital statistics.
        </AlertDescription>
      </Alert>

      {/* Key Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
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

      {/* Trend Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Total Affected Trend */}
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-lg">People Affected Over Time in {stateName}, USA</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
            <ResponsiveContainer width="100%" height={180} className="sm:!h-[250px]">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAffected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={formatCompactNumber} className="text-xs" tick={{ fontSize: 10 }} width={40} />
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), "Affected"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="affected"
                  stroke={CHART_COLORS.blue}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAffected)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deaths Trend */}
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-lg">Overdose & Opioid Deaths in {stateName}, USA</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
            <ResponsiveContainer width="100%" height={180} className="sm:!h-[250px]">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={formatCompactNumber} className="text-xs" tick={{ fontSize: 10 }} width={40} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatNumber(value),
                    name === "overdoseDeaths" ? "Overdose Deaths" : "Opioid Deaths",
                  ]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="overdoseDeaths"
                  name="Overdose"
                  stroke={CHART_COLORS.red}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.red, r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="opioidDeaths"
                  name="Opioid"
                  stroke={CHART_COLORS.orange}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.orange, r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Substance Abuse Rates Chart */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
          <CardTitle className="text-sm sm:text-lg">Substance Abuse & Recovery Rates in {stateName}, USA (%)</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
          <ResponsiveContainer width="100%" height={180} className="sm:!h-[250px]">
            <BarChart data={ratesData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" className="text-xs" tick={{ fontSize: 10 }} />
              <YAxis className="text-xs" tick={{ fontSize: 10 }} width={30} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    alcoholRate: "Alcohol Abuse",
                    drugRate: "Drug Abuse",
                    recoveryRate: "Recovery Rate",
                  };
                  return [`${value}%`, labels[name] || name];
                }}
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="alcoholRate" name="Alcohol" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} />
              <Bar dataKey="drugRate" name="Drug" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
              <Bar dataKey="recoveryRate" name="Recovery" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Demographics and Facilities Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Age Distribution Pie Chart */}
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-lg">Affected by Age Group in {stateName}, USA ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
            <ResponsiveContainer width="100%" height={200} className="sm:!h-[280px]">
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ strokeWidth: 1 }}
                >
                  {ageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), "People"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Treatment Facilities */}
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-lg">Treatment Facilities ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-2 sm:px-6 pb-3 sm:pb-6">
            <ResponsiveContainer width="100%" height={120} className="sm:!h-[150px]">
              <PieChart>
                <Pie
                  data={facilityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={45}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatNumber(value)}`}
                >
                  <Cell fill={CHART_COLORS.blue} />
                  <Cell fill={CHART_COLORS.cyan} />
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), "Facilities"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold">{formatNumber(currentYearData.total_treatment_centers)}</div>
              <p className="text-xs sm:text-base text-muted-foreground">Total Treatment Centers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Economic Impact Chart */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Economic Impact (Billions USD)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
          <ResponsiveContainer width="100%" height={160} className="sm:!h-[200px]">
            <BarChart data={economicData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" className="text-xs" tick={{ fontSize: 10 }} />
              <YAxis className="text-xs" tickFormatter={(v) => `$${v}B`} tick={{ fontSize: 10 }} width={40} />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(1)} Billion`, "Economic Cost"]}
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
              />
              <Bar dataKey="cost" fill={CHART_COLORS.orange} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Substance-Specific Statistics */}
      <SubstanceCharts 
        data={substanceStats || []} 
        selectedYear={selectedYear} 
        stateName={stateName} 
      />

      {/* Data Sources Section */}
      <DataSourcesSection />

      {/* Rehab Guides & Education */}
      <RehabGuides />

      {/* Legal Disclaimer */}
      <DataAccuracyDisclaimer />
    </div>
  );
};
