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
  const [selectedYear, setSelectedYear] = useState<string>("2024");

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

  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const availableYears = statistics?.map((s) => s.year) || [];

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

      {/* Data Disclaimer */}
      {parseInt(selectedYear) >= 2024 && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            <strong>Note:</strong> {selectedYear} data is provisional and subject to revision. 
            Final figures from CDC and SAMHSA may differ once official reports are published.
          </AlertDescription>
        </Alert>
      )}

      {/* Estimated Data Notice */}
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
          <strong>Data Notes:</strong> "Total Affected" and "Treatment Admissions" are estimates based on SAMHSA NSDUH surveys. 
          "Recovery Rate" is a derived metric not officially tracked by CDC/SAMHSA. 
          Overdose deaths are from CDC WONDER and CDPH vital statistics.
        </AlertDescription>
      </Alert>

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

      {/* Trend Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Affected Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">People Affected Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAffected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis tickFormatter={formatCompactNumber} className="text-xs" />
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), "Affected"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
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
          <CardHeader>
            <CardTitle className="text-lg">Overdose & Opioid Deaths</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis tickFormatter={formatCompactNumber} className="text-xs" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatNumber(value),
                    name === "overdoseDeaths" ? "Overdose Deaths" : "Opioid Deaths",
                  ]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="overdoseDeaths"
                  name="Overdose Deaths"
                  stroke={CHART_COLORS.red}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.red }}
                />
                <Line
                  type="monotone"
                  dataKey="opioidDeaths"
                  name="Opioid Deaths"
                  stroke={CHART_COLORS.orange}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.orange }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Substance Abuse Rates Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Substance Abuse & Recovery Rates (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ratesData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    alcoholRate: "Alcohol Abuse",
                    drugRate: "Drug Abuse",
                    recoveryRate: "Recovery Rate",
                  };
                  return [`${value}%`, labels[name] || name];
                }}
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              />
              <Legend />
              <Bar dataKey="alcoholRate" name="Alcohol Abuse" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} />
              <Bar dataKey="drugRate" name="Drug Abuse" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
              <Bar dataKey="recoveryRate" name="Recovery Rate" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Demographics and Facilities Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Affected by Age Group ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {ageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), "People"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Treatment Facilities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Treatment Facilities ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={facilityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatNumber(value)}`}
                >
                  <Cell fill={CHART_COLORS.blue} />
                  <Cell fill={CHART_COLORS.cyan} />
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), "Facilities"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center">
              <div className="text-3xl font-bold">{formatNumber(currentYearData.total_treatment_centers)}</div>
              <p className="text-muted-foreground">Total Treatment Centers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Economic Impact Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Economic Impact Over Time (Billions USD)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={economicData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(v) => `$${v}B`} />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(1)} Billion`, "Economic Cost"]}
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
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
    </div>
  );
};
