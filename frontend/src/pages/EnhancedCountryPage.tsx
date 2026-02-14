import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { countriesApi, statisticsApi, substanceStatisticsApi } from "@/lib/api";
import { getCountryBySlug, isValidCountrySlug } from "@/data/countryConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Users, Building2, AlertTriangle, TrendingUp, TrendingDown, ExternalLink,
  MapPin, Calendar, FileText, Globe, Activity, Heart, Info, DollarSign, BarChart3
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import NotFound from "./NotFound";
import { useTranslation } from "react-i18next";

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

// Show EXACT numbers with thousands separator - NO rounding to K/M
const formatNumber = (num: number | undefined): string => {
  if (!num && num !== 0) return "N/A";
  return num.toLocaleString(); // Shows exact: 4,039 not "4K"
};

const StatCard = ({ 
  icon: Icon, label, value, subValue, change, iconColor = "text-primary"
}: { 
  icon: any; label: string; value: string | number; subValue?: string;
  change?: number; iconColor?: string;
}) => (
  <div className="p-4 bg-card rounded-xl border shadow-sm" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </div>
    <div className="text-2xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</div>
    {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
    {change !== undefined && (
      <div className={`text-xs mt-1 flex items-center gap-1 ${change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
        {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(change).toFixed(1)}% from last year
      </div>
    )}
  </div>
);

const EnhancedCountryPage = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Parse year from URL
  const urlYearMatch = slug?.match(/-(\d{4})$/);
  const urlYear = urlYearMatch ? parseInt(urlYearMatch[1]) : null;
  const [selectedYear, setSelectedYear] = useState<number>(urlYear || 2025);

  const countrySlug = slug?.replace(/-addiction-rehabs$/, "").replace(/-addiction-stats$/, "").replace(/-\d{4}$/, "") || "";

  if (!isValidCountrySlug(countrySlug)) {
    return <NotFound />;
  }

  const countryConfig = getCountryBySlug(countrySlug);
  const isUSA = countryConfig?.code === "USA";

  // Fetch country data from API
  const { data: countryData, isLoading: countryLoading } = useQuery({
    queryKey: ["country", countryConfig?.code],
    queryFn: () => countriesApi.getByCode(countryConfig?.code || ""),
    enabled: !!countryConfig?.code && !isUSA,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all statistics for charts
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["country-stats", countryConfig?.code],
    queryFn: () => countriesApi.getStatistics(countryConfig?.code || ""),
    enabled: !!countryConfig?.code && !isUSA,
    staleTime: 5 * 60 * 1000,
  });

  // For USA - aggregate from all states
  const { data: usaStateStats = [] } = useQuery({
    queryKey: ["usa-state-stats"],
    queryFn: () => statisticsApi.getAll({ limit: 500 }),
    enabled: isUSA,
    staleTime: 5 * 60 * 1000,
  });

  // Also fetch USA national data for EXACT CDC figures
  const { data: usaNationalData } = useQuery({
    queryKey: ["usa-national-stats"],
    queryFn: () => countriesApi.getStatistics("USA"),
    enabled: isUSA,
    staleTime: 5 * 60 * 1000,
  });

  const { data: usaSubstanceStats = [] } = useQuery({
    queryKey: ["usa-substance-stats"],
    queryFn: () => substanceStatisticsApi.getAll({ limit: 500 }),
    enabled: isUSA,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch treatment centers
  const { data: centersData, isLoading: centersLoading } = useQuery({
    queryKey: ["country-centers", countryConfig?.code],
    queryFn: () => countriesApi.getCenters(countryConfig?.code || "", { limit: 6 }),
    enabled: !!countryConfig?.code,
    staleTime: 5 * 60 * 1000,
  });

  // Aggregate USA data by year, use OFFICIAL CDC national figures for deaths
  const usaAggregatedStats = useMemo(() => {
    if (!isUSA || !usaStateStats.length) return [];
    
    // Get official CDC national data
    const nationalStats = usaNationalData?.statistics || [];
    const nationalByYear: Record<number, any> = {};
    nationalStats.forEach((stat: any) => {
      nationalByYear[stat.year] = {
        drug_overdose_deaths: stat.drug_overdose_deaths,
        opioid_deaths: stat.opioid_deaths,
        primary_source: stat.primary_source,
        primary_source_url: stat.primary_source_url,
      };
    });
    
    const byYear: Record<number, any> = {};
    usaStateStats.forEach((stat: any) => {
      const year = stat.year;
      if (!byYear[year]) {
        byYear[year] = {
          year,
          total_affected: 0,
          drug_overdose_deaths: 0,
          opioid_deaths: 0,
          alcohol_related_deaths: 0,
          treatment_centers: 0,
          treatment_admissions: 0,
          economic_cost_billions: 0,
          population: 331000000, // US population
          affected_age_12_17: 0,
          affected_age_18_25: 0,
          affected_age_26_34: 0,
          affected_age_35_plus: 0,
          inpatient_facilities: 0,
          outpatient_facilities: 0,
          recovery_rate: 0,
          recovery_count: 0,
        };
      }
      byYear[year].total_affected += stat.total_affected || 0;
      byYear[year].drug_overdose_deaths += stat.overdose_deaths || 0;
      byYear[year].opioid_deaths += stat.opioid_deaths || 0;
      byYear[year].treatment_centers += stat.total_treatment_centers || 0;
      byYear[year].treatment_admissions += stat.treatment_admissions || 0;
      byYear[year].economic_cost_billions += stat.economic_cost_billions || 0;
      byYear[year].affected_age_12_17 += stat.affected_age_12_17 || 0;
      byYear[year].affected_age_18_25 += stat.affected_age_18_25 || 0;
      byYear[year].affected_age_26_34 += stat.affected_age_26_34 || 0;
      byYear[year].affected_age_35_plus += stat.affected_age_35_plus || 0;
      byYear[year].inpatient_facilities += stat.inpatient_facilities || 0;
      byYear[year].outpatient_facilities += stat.outpatient_facilities || 0;
      if (stat.recovery_rate) {
        byYear[year].recovery_rate += stat.recovery_rate;
        byYear[year].recovery_count += 1;
      }
    });

    // Override with OFFICIAL CDC national figures for drug overdose deaths
    return Object.values(byYear).map((stat: any) => {
      const national = nationalByYear[stat.year];
      return {
        ...stat,
        // Use OFFICIAL CDC figures if available
        drug_overdose_deaths: national?.drug_overdose_deaths || stat.drug_overdose_deaths,
        opioid_deaths: national?.opioid_deaths || stat.opioid_deaths,
        primary_source: national?.primary_source || 'CDC WONDER',
        primary_source_url: national?.primary_source_url || 'https://wonder.cdc.gov/',
        recovery_rate: stat.recovery_count > 0 ? stat.recovery_rate / stat.recovery_count : 0,
        prevalence_rate: (stat.total_affected / stat.population) * 100,
        treatment_gap_percent: stat.total_affected > 0 
          ? ((stat.total_affected - stat.treatment_admissions) / stat.total_affected) * 100 
          : 85,
      };
    }).sort((a, b) => b.year - a.year);
  }, [isUSA, usaStateStats, usaNationalData]);

  // Aggregate USA substance stats
  const usaAggregatedSubstance = useMemo(() => {
    if (!isUSA || !usaSubstanceStats.length) return null;
    
    const yearData = usaSubstanceStats.filter((s: any) => s.year === selectedYear);
    if (!yearData.length) return null;

    return yearData.reduce((acc: any, stat: any) => ({
      alcohol_related_deaths: (acc.alcohol_related_deaths || 0) + (stat.alcohol_related_deaths || 0),
      prescription_opioid_misuse: (acc.prescription_opioid_misuse || 0) + (stat.prescription_opioid_misuse || 0),
      heroin_use: (acc.heroin_use || 0) + (stat.heroin_use || 0),
      fentanyl_deaths: (acc.fentanyl_deaths || 0) + (stat.fentanyl_deaths || 0),
      opioid_use_disorder: (acc.opioid_use_disorder || 0) + (stat.opioid_use_disorder || 0),
      cocaine_use_past_year: (acc.cocaine_use_past_year || 0) + (stat.cocaine_use_past_year || 0),
      cocaine_related_deaths: (acc.cocaine_related_deaths || 0) + (stat.cocaine_related_deaths || 0),
      meth_use_past_year: (acc.meth_use_past_year || 0) + (stat.meth_use_past_year || 0),
      meth_related_deaths: (acc.meth_related_deaths || 0) + (stat.meth_related_deaths || 0),
      marijuana_use_past_month: (acc.marijuana_use_past_month || 0) + (stat.marijuana_use_past_month || 0),
      marijuana_use_disorder: (acc.marijuana_use_disorder || 0) + (stat.marijuana_use_disorder || 0),
      alcohol_use_disorder: (acc.alcohol_use_disorder || 0) + (stat.alcohol_use_disorder || 0),
    }), {});
  }, [isUSA, usaSubstanceStats, selectedYear]);

  const availableYears = isUSA 
    ? [...new Set(usaAggregatedStats.map(s => s.year))].sort((a, b) => b - a)
    : countryData?.available_years || [2025, 2024, 2023, 2022, 2021, 2020, 2019];
  
  const allStats = isUSA ? usaAggregatedStats : (statsData?.statistics || []);
  const currentStats = allStats.find((s: any) => s.year === selectedYear) || allStats[0];
  const centers = centersData?.centers || [];

  // Chart data
  const chartData = allStats
    .sort((a: any, b: any) => a.year - b.year)
    .map((s: any) => ({
      year: s.year,
      affected: s.total_affected,
      deaths: s.drug_overdose_deaths || s.overdose_deaths,
      opioidDeaths: s.opioid_deaths,
      alcoholDeaths: s.alcohol_related_deaths,
      centers: s.treatment_centers || s.total_treatment_centers,
      economicCost: s.economic_cost_billions,
      recoveryRate: s.recovery_rate,
    }));

  const ageGroupData = useMemo(() => {
    if (!currentStats) return [];
    return [
      { name: "Ages 12-17", value: currentStats.affected_age_12_17 || 0 },
      { name: "Ages 18-25", value: currentStats.affected_age_18_25 || 0 },
      { name: "Ages 26-34", value: currentStats.affected_age_26_34 || 0 },
      { name: "Ages 35+", value: currentStats.affected_age_35_plus || 0 },
    ].filter(d => d.value > 0);
  }, [currentStats]);

  const facilityData = useMemo(() => {
    if (!currentStats) return [];
    return [
      { name: "Inpatient", value: currentStats.inpatient_facilities || 0 },
      { name: "Outpatient", value: currentStats.outpatient_facilities || 0 },
    ].filter(d => d.value > 0);
  }, [currentStats]);

  const isLoading = isUSA ? false : (countryLoading || statsLoading);

  const dataSource = isUSA 
    ? "SAMHSA NSDUH, CDC WONDER" 
    : (currentStats?.primary_source || "WHO, UNODC, EMCDDA");

  return (
    <div className="min-h-screen bg-background" data-testid="country-page">
      <Header navItems={mockNavItems} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{countryConfig?.flag}</span>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Globe className="h-4 w-4" />
                <span>{countryConfig?.region}</span>
                {isUSA && <Badge variant="secondary" className="ml-2">51 States Aggregated</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {countryConfig?.name} Addiction Statistics
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            {isUSA 
              ? "Comprehensive addiction statistics aggregated from all 51 US states and territories. Data sourced from SAMHSA, CDC, and state health departments."
              : `Comprehensive addiction statistics and treatment resources for ${countryConfig?.name}. Data sourced from ${dataSource}.`
            }
          </p>

          {/* Year Selector */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-medium">Select Year:</span>
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-32" data-testid="year-selector">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year: number) => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link to="/compare" className="text-sm text-primary hover:underline flex items-center gap-1 ml-auto">
              <BarChart3 className="h-4 w-4" /> Compare with other countries
            </Link>
          </div>
        </div>
      </section>

      {/* Key Statistics Grid */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Key Statistics ({selectedYear})</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                icon={Users} 
                label="People Affected" 
                value={currentStats?.total_affected} 
                subValue={`${currentStats?.prevalence_rate?.toFixed(1) || "N/A"}% of population`}
                iconColor="text-red-500" 
              />
              <StatCard 
                icon={AlertTriangle} 
                label="Drug Overdose Deaths" 
                value={currentStats?.drug_overdose_deaths || currentStats?.overdose_deaths}
                subValue={`Opioid: ${formatNumber(currentStats?.opioid_deaths)}`}
                iconColor="text-orange-500" 
              />
              <StatCard 
                icon={Building2} 
                label="Treatment Centers" 
                value={currentStats?.treatment_centers || currentStats?.total_treatment_centers}
                subValue="Verified facilities"
                iconColor="text-primary" 
              />
              <StatCard 
                icon={TrendingUp} 
                label="Treatment Gap" 
                value={`${currentStats?.treatment_gap_percent?.toFixed(0) || 85}%`}
                subValue="Not receiving treatment"
                iconColor="text-purple-500" 
              />
            </div>
          )}

          {/* Secondary Stats */}
          {currentStats && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
              <StatCard icon={Users} label="Population" value={currentStats.population} iconColor="text-blue-500" />
              <StatCard icon={Activity} label="Alcohol Deaths" value={currentStats.alcohol_related_deaths} iconColor="text-amber-500" />
              <StatCard icon={DollarSign} label="Economic Cost" value={`$${currentStats.economic_cost_billions?.toFixed(0) || "N/A"}B`} iconColor="text-teal-500" />
              <StatCard icon={Heart} label="Recovery Rate" value={`${currentStats.recovery_rate?.toFixed(1) || "N/A"}%`} iconColor="text-green-500" />
              <StatCard icon={Building2} label="Treatment Admissions" value={currentStats.treatment_admissions} iconColor="text-indigo-500" />
              <StatCard icon={Activity} label="Prevalence Rate" value={`${currentStats.prevalence_rate?.toFixed(1) || "N/A"}%`} iconColor="text-pink-500" />
            </div>
          )}

          {/* Data Source */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Source:</span>
            <span className="font-medium">{dataSource}</span>
            {currentStats?.primary_source_url && (
              <a href={currentStats.primary_source_url} target="_blank" rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 ml-2">
                View Source <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      {chartData.length > 1 && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Historical Trends (2019-2025)</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* People Affected Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">People Affected Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => formatNumber(v)} />
                      <Area type="monotone" dataKey="affected" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} name="People Affected" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Deaths Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overdose & Opioid Deaths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => formatNumber(v)} />
                      <Legend />
                      <Line type="monotone" dataKey="deaths" stroke={COLORS.danger} strokeWidth={2} dot={{ r: 4 }} name="Drug Overdose" />
                      <Line type="monotone" dataKey="opioidDeaths" stroke={COLORS.warning} strokeWidth={2} dot={{ r: 4 }} name="Opioid Deaths" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Drug vs Alcohol Deaths */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Drug vs Alcohol Related Deaths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => formatNumber(v)} />
                      <Legend />
                      <Bar dataKey="deaths" fill={COLORS.danger} name="Drug Overdose" />
                      <Bar dataKey="alcoholDeaths" fill={COLORS.warning} name="Alcohol Related" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Economic Impact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Economic Impact (Billions USD)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `$${v}B`} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => [`$${v}B`, "Economic Cost"]} />
                      <Bar dataKey="economicCost" fill={COLORS.teal} radius={[4, 4, 0, 0]} name="Economic Cost" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Demographics Section (USA only or if data available) */}
      {(ageGroupData.length > 0 || facilityData.length > 0) && (
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Demographics & Facilities ({selectedYear})</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Age Group Distribution */}
              {ageGroupData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Affected by Age Group</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={ageGroupData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                          paddingAngle={2} dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {ageGroupData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [formatNumber(v), "People"]} />
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

              {/* Treatment Facilities */}
              {facilityData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Treatment Facilities</CardTitle>
                    <CardDescription>{formatNumber(currentStats?.treatment_centers || currentStats?.total_treatment_centers)} Total Centers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={facilityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                          paddingAngle={2} dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {facilityData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [formatNumber(v), "Facilities"]} />
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
          </div>
        </section>
      )}

      {/* Substance Statistics Section (USA only) */}
      {isUSA && usaAggregatedSubstance && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Substance Statistics ({selectedYear})
            </h2>

            {/* Opioid Statistics */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Opioid Crisis in the United States</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={AlertTriangle} label="Rx Opioid Misuse" value={usaAggregatedSubstance.prescription_opioid_misuse} iconColor="text-red-500" />
                  <StatCard icon={AlertTriangle} label="Heroin Use" value={usaAggregatedSubstance.heroin_use} iconColor="text-red-600" />
                  <StatCard icon={AlertTriangle} label="Fentanyl Deaths" value={usaAggregatedSubstance.fentanyl_deaths} iconColor="text-red-700" />
                  <StatCard icon={Heart} label="Opioid Disorder" value={usaAggregatedSubstance.opioid_use_disorder} iconColor="text-red-400" />
                </div>
              </CardContent>
            </Card>

            {/* Alcohol & Stimulants */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-amber-600">Alcohol Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard icon={Heart} label="Alcohol Use Disorder" value={usaAggregatedSubstance.alcohol_use_disorder} iconColor="text-amber-600" />
                    <StatCard icon={AlertTriangle} label="Related Deaths" value={usaAggregatedSubstance.alcohol_related_deaths} iconColor="text-amber-700" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-purple-600">Stimulant Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard icon={Activity} label="Cocaine Use" value={usaAggregatedSubstance.cocaine_use_past_year} iconColor="text-purple-500" />
                    <StatCard icon={AlertTriangle} label="Cocaine Deaths" value={usaAggregatedSubstance.cocaine_related_deaths} iconColor="text-purple-600" />
                    <StatCard icon={Activity} label="Meth Use" value={usaAggregatedSubstance.meth_use_past_year} iconColor="text-purple-700" />
                    <StatCard icon={AlertTriangle} label="Meth Deaths" value={usaAggregatedSubstance.meth_related_deaths} iconColor="text-purple-800" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cannabis */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Cannabis Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={Activity} label="Past Month Use" value={usaAggregatedSubstance.marijuana_use_past_month} iconColor="text-green-500" />
                  <StatCard icon={Heart} label="Cannabis Use Disorder" value={usaAggregatedSubstance.marijuana_use_disorder} iconColor="text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Treatment Centers Section */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Treatment Centers in {countryConfig?.name}</h2>
            <Link to={`/rehab-centers?country=${countryConfig?.code}`}
              className="text-primary hover:underline flex items-center gap-1">
              View All <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          {centersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : centers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {centers.map((center: any) => (
                <div key={center.id} className="bg-card rounded-xl border p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{center.name}</h3>
                    {center.is_verified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    {center.city}, {center.state_name || center.country_name}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {center.treatment_types?.slice(0, 3).map((type: string) => (
                      <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Rating: {center.rating?.toFixed(1) || "N/A"} ({center.reviews_count || 0} reviews)
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Treatment center data for {countryConfig?.name} coming soon.</p>
              <Link to="/rehab-centers" className="text-primary hover:underline mt-2 inline-block">
                Browse all international centers
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Data Methodology & Sources */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                Data Methodology & Sources
              </CardTitle>
              <CardDescription>Understanding how we collect and present addiction statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="sources">
                  <AccordionTrigger>Data Sources</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {isUSA ? (
                        <>
                          <li>SAMHSA National Survey on Drug Use and Health (NSDUH)</li>
                          <li>CDC WONDER Multiple Cause of Death Database</li>
                          <li>State Health Department Reports</li>
                          <li>Treatment Episode Data Set (TEDS)</li>
                        </>
                      ) : (
                        <>
                          <li>World Health Organization (WHO) Global Health Observatory</li>
                          <li>United Nations Office on Drugs and Crime (UNODC) World Drug Report</li>
                          <li>European Monitoring Centre for Drugs and Drug Addiction (EMCDDA)</li>
                          <li>National health ministries and vital statistics offices</li>
                        </>
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="methodology">
                  <AccordionTrigger>Methodology</AccordionTrigger>
                  <AccordionContent>
                    {isUSA 
                      ? "Statistics are aggregated from all 51 US states and territories. Data is collected annually from official government sources and validated for consistency."
                      : "Data is collected from official international health organizations and national health ministries. Some figures are estimates based on available survey data."
                    }
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="limitations">
                  <AccordionTrigger>Data Limitations</AccordionTrigger>
                  <AccordionContent>
                    Statistics may have a 1-2 year reporting lag. Some data points are estimates based on surveys and extrapolations. 
                    Treatment gap calculations are derived metrics. Data coverage varies by country and region.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Year-based internal links for SEO */}
      <nav className="container mx-auto px-4 py-8 border-t" aria-label="Historical data by year" data-testid="country-year-links">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {countryConfig?.name} Addiction Data by Year
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map((year) => (
            <Link
              key={year}
              to={`/${countrySlug}-addiction-stats-${year}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedYear === year
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'
              }`}
            >
              {year}
            </Link>
          ))}
        </div>
        {isUSA && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link to="/compare" className="text-primary hover:underline">Compare with Other Countries</Link>
          </div>
        )}
      </nav>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default EnhancedCountryPage;
