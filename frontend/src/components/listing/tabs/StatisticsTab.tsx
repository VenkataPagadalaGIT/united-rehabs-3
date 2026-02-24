import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { statisticsApi, substanceStatisticsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart3, TrendingDown, TrendingUp, Users, Building2, DollarSign, Activity, Heart, AlertTriangle, Info, ExternalLink } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from "recharts";

interface StatisticsTabProps {
  stateId?: string;
  stateName?: string;
  stateSlug?: string;
  urlYear?: number | null;
}

const COLORS = {
  primary: "#f97316",
  secondary: "#3b82f6",
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#eab308",
  purple: "#8b5cf6",
  teal: "#14b8a6",
  pink: "#ec4899",
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.purple];

// Show EXACT numbers - NO rounding to K/M
const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return "N/A";
  return num.toLocaleString(); // Shows exact: 10,898 not "11K"
};

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeLabel,
  iconColor = "text-primary"
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  change?: number; 
  changeLabel?: string;
  iconColor?: string;
}) => (
  <div className="p-4 bg-muted/50 rounded-lg border" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
    <div className="text-2xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</div>
    {change !== undefined && (
      <div className={`text-xs mt-1 flex items-center gap-1 ${change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
        {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(change).toFixed(1)}% {changeLabel || 'from last year'}
      </div>
    )}
  </div>
);

export const StatisticsTab = ({ stateId, stateName, stateSlug, urlYear }: StatisticsTabProps) => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<string>(urlYear ? String(urlYear) : "latest");

  // Sync with URL year when it changes
  useEffect(() => {
    setSelectedYear(urlYear ? String(urlYear) : "latest");
  }, [urlYear]);

  const { data: allStatistics = [], isLoading } = useQuery({
    queryKey: ["state-statistics", stateId],
    queryFn: async () => {
      const result = await statisticsApi.getAll({ state_id: stateId, limit: 20 });
      return Array.isArray(result) ? result.sort((a: any, b: any) => b.year - a.year) : [];
    },
    enabled: !!stateId,
  });

  const { data: allSubstanceStats = [] } = useQuery({
    queryKey: ["state-substances", stateId],
    queryFn: async () => {
      const result = await substanceStatisticsApi.getAll({ state_id: stateId, limit: 20 });
      return Array.isArray(result) ? result.sort((a: any, b: any) => b.year - a.year) : [];
    },
    enabled: !!stateId,
  });

  // Get available years
  const years = useMemo(() => {
    const yearSet = new Set(allStatistics.map((s: any) => s.year));
    return Array.from(yearSet).sort((a, b) => (b as number) - (a as number));
  }, [allStatistics]);

  // Get current year's data
  const currentStat = useMemo(() => {
    if (selectedYear === "latest") return allStatistics[0];
    return allStatistics.find((s: any) => s.year === parseInt(selectedYear));
  }, [allStatistics, selectedYear]);

  const currentSubstance = useMemo(() => {
    if (selectedYear === "latest") return allSubstanceStats[0];
    return allSubstanceStats.find((s: any) => s.year === parseInt(selectedYear));
  }, [allSubstanceStats, selectedYear]);

  // Prepare chart data
  const timeSeriesData = useMemo(() => {
    return [...allStatistics].reverse().map((s: any) => ({
      year: s.year,
      totalAffected: s.total_affected,
      overdoseDeaths: s.overdose_deaths,
      opioidDeaths: s.opioid_deaths,
      economicCost: s.economic_cost_billions,
      recoveryRate: s.recovery_rate,
      treatmentAdmissions: s.treatment_admissions,
    }));
  }, [allStatistics]);

  const ageGroupData = useMemo(() => {
    if (!currentStat) return [];
    return [
      { name: "Ages 12-17", value: currentStat.affected_age_12_17 || 0, color: COLORS.primary },
      { name: "Ages 18-25", value: currentStat.affected_age_18_25 || 0, color: COLORS.secondary },
      { name: "Ages 26-34", value: currentStat.affected_age_26_34 || 0, color: COLORS.success },
      { name: "Ages 35+", value: currentStat.affected_age_35_plus || 0, color: COLORS.purple },
    ].filter(d => d.value > 0);
  }, [currentStat]);

  const facilityData = useMemo(() => {
    if (!currentStat) return [];
    return [
      { name: "Inpatient", value: currentStat.inpatient_facilities || 0, color: COLORS.primary },
      { name: "Outpatient", value: currentStat.outpatient_facilities || 0, color: COLORS.secondary },
    ].filter(d => d.value > 0);
  }, [currentStat]);

  const treatmentGapData = useMemo(() => {
    if (!currentSubstance) return [];
    return [
      { name: "Received Treatment", value: currentSubstance.treatment_received || 0, color: COLORS.success },
      { name: "Needed, Not Received", value: currentSubstance.treatment_needed_not_received || 0, color: COLORS.danger },
    ].filter(d => d.value > 0);
  }, [currentSubstance]);

  // Substance trend data for charts
  const substanceTrendData = useMemo(() => {
    return [...allSubstanceStats].reverse().map((s: any) => ({
      year: s.year,
      rxOpioids: s.prescription_opioid_misuse,
      heroin: s.heroin_use,
      opioidDisorder: s.opioid_use_disorder,
      cocaine: s.cocaine_use_past_year,
      meth: s.meth_use_past_year,
      fentanylDeaths: s.fentanyl_deaths,
      alcoholDeaths: s.alcohol_related_deaths,
      methDeaths: s.meth_related_deaths,
      cocaineDeaths: s.cocaine_related_deaths,
    }));
  }, [allSubstanceStats]);

  const displayName = currentStat?.state_name || stateName || "State";
  const displayYear = currentStat?.year || new Date().getFullYear();

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="statistics-loading">
        <div className="animate-pulse h-12 bg-muted rounded-lg w-48" />
        <div className="animate-pulse h-64 bg-muted rounded-lg" />
        <div className="animate-pulse h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!currentStat) {
    return (
      <>
        <Helmet><meta name="robots" content="noindex" /></Helmet>
        <Card data-testid="statistics-empty">
          <CardContent className="py-8 text-center text-muted-foreground">
            No statistics available for this state.
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <div className="space-y-6" data-testid="statistics-content">
      {/* Header with Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{displayName} Addiction Statistics</h2>
          <p className="text-sm text-muted-foreground">Data sourced from CDC/SAMHSA</p>
        </div>
        <Select value={selectedYear} onValueChange={(val) => {
          setSelectedYear(val);
          if (stateSlug) {
            if (val === "latest") {
              navigate(`/${stateSlug}-addiction-stats`);
            } else {
              navigate(`/${stateSlug}-addiction-stats-${val}`);
            }
          }
        }}>
          <SelectTrigger className="w-[140px]" data-testid="year-selector">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest ({years[0]})</SelectItem>
            {years.map((year) => (
              <SelectItem key={year as number} value={String(year)}>{year as number}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        <strong>Data Notes:</strong> "Total Affected" and "Treatment Admissions" are estimates based on SAMHSA NSDUH surveys. 
        "Recovery Rate" is a derived metric. Overdose deaths are from CDC WONDER and state vital statistics.
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Affected" value={currentStat.total_affected} iconColor="text-blue-500" />
        <StatCard icon={AlertTriangle} label="Overdose Deaths" value={currentStat.overdose_deaths} iconColor="text-red-500" />
        <StatCard icon={Building2} label="Treatment Admissions" value={currentStat.treatment_admissions} iconColor="text-purple-500" />
        <StatCard icon={TrendingUp} label="Recovery Rate" value={currentStat.recovery_rate ? `${currentStat.recovery_rate}%` : "N/A"} iconColor="text-green-500" />
      </div>

      {/* People Affected Over Time Chart */}
      {timeSeriesData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">People Affected Over Time in {displayName}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [formatNumber(value), "Affected"]} />
                <Area type="monotone" dataKey="totalAffected" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} name="Total Affected" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Overdose & Opioid Deaths Chart */}
      {timeSeriesData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overdose & Opioid Deaths in {displayName}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [formatNumber(value), ""]} />
                <Legend />
                <Line type="monotone" dataKey="overdoseDeaths" stroke={COLORS.danger} strokeWidth={2} dot={{ r: 4 }} name="Overdose Deaths" />
                <Line type="monotone" dataKey="opioidDeaths" stroke={COLORS.warning} strokeWidth={2} dot={{ r: 4 }} name="Opioid Deaths" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Age Demographics & Treatment Facilities */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Age Group Pie Chart */}
        {ageGroupData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Affected by Age Group ({displayYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={ageGroupData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {ageGroupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatNumber(value), "People"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {ageGroupData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span>{entry.name}: {formatNumber(entry.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Treatment Facilities Pie Chart */}
        {facilityData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Treatment Facilities ({displayYear})</CardTitle>
              <CardDescription>{formatNumber(currentStat.total_treatment_centers)} Total Centers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={facilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {facilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatNumber(value), "Facilities"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {facilityData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span>{entry.name}: {formatNumber(entry.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Economic Impact Chart */}
      {timeSeriesData.length > 1 && currentStat.economic_cost_billions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Economic Impact (Billions USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${v}B`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`$${value}B`, "Economic Cost"]} />
                <Bar dataKey="economicCost" fill={COLORS.teal} radius={[4, 4, 0, 0]} name="Economic Cost" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Substance Statistics Section */}
      {currentSubstance && (
        <>
          <h3 className="text-xl font-bold mt-8 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Substance Statistics ({displayYear})
          </h3>

          {/* Opioid Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-600">Opioid Breakdown in {displayName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={AlertTriangle} label="Rx Opioid Misuse" value={currentSubstance.prescription_opioid_misuse} iconColor="text-red-500" />
                <StatCard icon={AlertTriangle} label="Heroin Use" value={currentSubstance.heroin_use} iconColor="text-red-600" />
                <StatCard icon={AlertTriangle} label="Fentanyl Deaths" value={currentSubstance.fentanyl_deaths} iconColor="text-red-700" />
                <StatCard icon={Heart} label="Opioid Disorder" value={currentSubstance.opioid_use_disorder} iconColor="text-red-400" />
              </div>
            </CardContent>
          </Card>

          {/* Alcohol Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-600">Alcohol Statistics in {displayName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Activity} label="Past Month Use" value={currentSubstance.alcohol_use_past_month_percent ? `${currentSubstance.alcohol_use_past_month_percent}%` : "N/A"} iconColor="text-amber-500" />
                <StatCard icon={Activity} label="Binge Drinking" value={currentSubstance.alcohol_binge_drinking_percent ? `${currentSubstance.alcohol_binge_drinking_percent}%` : "N/A"} iconColor="text-amber-600" />
                <StatCard icon={Heart} label="Alcohol Use Disorder" value={currentSubstance.alcohol_use_disorder} iconColor="text-amber-700" />
                <StatCard icon={AlertTriangle} label="Related Deaths" value={currentSubstance.alcohol_related_deaths} iconColor="text-amber-800" />
              </div>
            </CardContent>
          </Card>

          {/* Stimulant & Cannabis Statistics */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-purple-600">Stimulant Use in {displayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard icon={Activity} label="Cocaine Use (Year)" value={currentSubstance.cocaine_use_past_year} iconColor="text-purple-500" />
                  <StatCard icon={AlertTriangle} label="Cocaine Deaths" value={currentSubstance.cocaine_related_deaths} iconColor="text-purple-600" />
                  <StatCard icon={Activity} label="Meth Use (Year)" value={currentSubstance.meth_use_past_year} iconColor="text-purple-700" />
                  <StatCard icon={AlertTriangle} label="Meth Deaths" value={currentSubstance.meth_related_deaths} iconColor="text-purple-800" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Cannabis Statistics in {displayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard icon={Activity} label="Past Month Use" value={currentSubstance.marijuana_use_past_month} iconColor="text-green-500" />
                  <StatCard icon={Heart} label="Use Disorder" value={currentSubstance.marijuana_use_disorder} iconColor="text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Treatment Access Gap */}
          {treatmentGapData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Treatment Access Gap ({displayYear})</CardTitle>
                <CardDescription>Showing the gap between those who received treatment and those who needed but did not receive it</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={treatmentGapData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {treatmentGapData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatNumber(value), "People"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4">
                    {treatmentGapData.map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: entry.color }} />
                          <span className="font-medium">{entry.name}</span>
                        </div>
                        <span className="text-lg font-bold">{formatNumber(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Opioid Use Trends Chart */}
          {substanceTrendData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Opioid Use Trends in {displayName}</CardTitle>
                <CardDescription>Historical trends of opioid misuse and disorder</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={substanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [formatNumber(value), ""]} />
                    <Legend />
                    <Line type="monotone" dataKey="rxOpioids" stroke={COLORS.danger} strokeWidth={2} dot={{ r: 4 }} name="Rx Opioids" />
                    <Line type="monotone" dataKey="heroin" stroke={COLORS.warning} strokeWidth={2} dot={{ r: 4 }} name="Heroin" />
                    <Line type="monotone" dataKey="opioidDisorder" stroke={COLORS.purple} strokeWidth={2} dot={{ r: 4 }} name="Opioid Disorder" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Stimulant Use Trends Chart */}
          {substanceTrendData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stimulant Use Trends in {displayName}</CardTitle>
                <CardDescription>Historical trends of cocaine and methamphetamine use</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={substanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [formatNumber(value), ""]} />
                    <Legend />
                    <Line type="monotone" dataKey="cocaine" stroke={COLORS.purple} strokeWidth={2} dot={{ r: 4 }} name="Cocaine" />
                    <Line type="monotone" dataKey="meth" stroke={COLORS.pink} strokeWidth={2} dot={{ r: 4 }} name="Meth" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Annual Deaths by Substance Chart */}
          {substanceTrendData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Annual Deaths by Substance Type in {displayName}</CardTitle>
                <CardDescription>Yearly deaths attributed to different substances</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={substanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [formatNumber(value), ""]} />
                    <Legend />
                    <Bar dataKey="fentanylDeaths" fill={COLORS.danger} name="Fentanyl" stackId="a" />
                    <Bar dataKey="alcoholDeaths" fill={COLORS.warning} name="Alcohol" stackId="a" />
                    <Bar dataKey="methDeaths" fill={COLORS.pink} name="Meth" stackId="a" />
                    <Bar dataKey="cocaineDeaths" fill={COLORS.purple} name="Cocaine" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Data Methodology & Sources */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5" />
            Data Methodology & Sources
          </CardTitle>
          <CardDescription>Understanding how we collect, process, and present addiction statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="collection">
              <AccordionTrigger>Data Collection Process</AccordionTrigger>
              <AccordionContent>
                Statistics are collected from official government sources including SAMHSA's National Survey on Drug Use and Health (NSDUH), 
                CDC WONDER mortality database, and state health department reports. Data is updated annually as new official reports are released.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="validation">
              <AccordionTrigger>Data Processing & Validation</AccordionTrigger>
              <AccordionContent>
                All data undergoes validation to ensure consistency with source documents. Estimates are clearly labeled, 
                and methodology notes are provided for derived metrics like recovery rates.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="limitations">
              <AccordionTrigger>Data Limitations & Considerations</AccordionTrigger>
              <AccordionContent>
                Addiction statistics may have reporting delays of 1-2 years. Some data points are estimates based on surveys 
                and may not reflect exact counts. Rural areas may have underreported data due to limited surveillance.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="definitions">
              <AccordionTrigger>Key Definitions</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Total Affected:</strong> Estimated number of individuals with substance use disorder</li>
                  <li><strong>Overdose Deaths:</strong> Deaths attributed to drug overdose from any substance</li>
                  <li><strong>Opioid Deaths:</strong> Subset of overdose deaths involving opioids</li>
                  <li><strong>Recovery Rate:</strong> Percentage of those in treatment who maintain sobriety for 1+ years</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Official Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Official Government Data Sources</CardTitle>
          <CardDescription>All statistics are sourced from official U.S. government agencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: "SAMHSA NSDUH", agency: "SAMHSA", year: "2024", desc: "National Survey on Drug Use and Health", url: "https://www.samhsa.gov/data/nsduh" },
              { name: "CDC WONDER", agency: "CDC", year: "2023", desc: "Multiple Cause of Death Database", url: "https://wonder.cdc.gov/mcd.html" },
              { name: "NIDA", agency: "NIH", year: "2024", desc: "Drug use trends and research", url: "https://nida.nih.gov" },
              { name: "TEDS", agency: "SAMHSA", year: "2022", desc: "Treatment Episode Data Set", url: "https://www.samhsa.gov/data/data-we-collect/teds" },
            ].map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors flex items-start gap-3"
              >
                <div className="flex-1">
                  <div className="font-semibold text-primary">{source.name}</div>
                  <div className="text-xs text-muted-foreground">{source.agency} • Updated {source.year}</div>
                  <div className="text-sm mt-1">{source.desc}</div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Source Footer */}
      {currentStat.data_source && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          Data Source: {currentStat.data_source}
        </p>
      )}
    </div>
  );
};

export default StatisticsTab;
