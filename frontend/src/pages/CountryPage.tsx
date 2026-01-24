import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { countriesApi } from "@/lib/api";
import { getCountryBySlug, isValidCountrySlug } from "@/data/countryConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building2, 
  AlertTriangle, 
  TrendingUp, 
  ExternalLink,
  MapPin,
  Calendar,
  FileText,
  Globe
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import NotFound from "./NotFound";

const formatNumber = (num: number | undefined): string => {
  if (!num) return "N/A";
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toLocaleString();
};

const CountryPage = () => {
  const { slug } = useParams();
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  // Extract country slug from URL pattern: /country-name-addiction-rehabs
  const countrySlug = slug?.replace(/-addiction-rehabs$/, "").replace(/-addiction-stats$/, "") || "";

  // Validate country slug
  if (!isValidCountrySlug(countrySlug)) {
    return <NotFound />;
  }

  const countryConfig = getCountryBySlug(countrySlug);

  // Fetch country data from API
  const { data: countryData, isLoading: countryLoading } = useQuery({
    queryKey: ["country", countryConfig?.code],
    queryFn: () => countriesApi.getByCode(countryConfig?.code || ""),
    enabled: !!countryConfig?.code,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch statistics for all years (for charts)
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["country-stats", countryConfig?.code],
    queryFn: () => countriesApi.getStatistics(countryConfig?.code || ""),
    enabled: !!countryConfig?.code,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch treatment centers for this country
  const { data: centersData, isLoading: centersLoading } = useQuery({
    queryKey: ["country-centers", countryConfig?.code],
    queryFn: () => countriesApi.getCenters(countryConfig?.code || "", { limit: 6 }),
    enabled: !!countryConfig?.code,
    staleTime: 5 * 60 * 1000,
  });

  const availableYears = countryData?.available_years || [2025, 2024, 2023, 2022, 2021, 2020, 2019];
  const currentStats = statsData?.statistics?.find((s: any) => s.year === selectedYear) || countryData?.latest_statistics;
  const allStats = statsData?.statistics || [];
  const centers = centersData?.centers || [];

  // Prepare chart data
  const chartData = allStats
    .sort((a: any, b: any) => a.year - b.year)
    .map((s: any) => ({
      year: s.year,
      affected: s.total_affected,
      deaths: s.drug_overdose_deaths,
      alcoholDeaths: s.alcohol_related_deaths,
      centers: s.treatment_centers,
    }));

  const isLoading = countryLoading || statsLoading;

  return (
    <div className="min-h-screen bg-background" data-testid="country-page">
      <Header navItems={mockNavItems} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{countryConfig?.flag}</span>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Globe className="h-4 w-4" />
                <span>{countryConfig?.region}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {countryConfig?.name} Addiction Statistics & Treatment Centers
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            Comprehensive addiction statistics and treatment resources for {countryConfig?.name}. 
            Data sourced from {currentStats?.primary_source || "WHO, UNODC, and national health agencies"}.
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
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Key Statistics */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Key Statistics ({selectedYear})</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-muted-foreground">People Affected</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(currentStats?.total_affected)}</p>
                <p className="text-xs text-muted-foreground">
                  {currentStats?.prevalence_rate?.toFixed(1)}% of population
                </p>
              </div>

              <div className="bg-card rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Drug Overdose Deaths</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(currentStats?.drug_overdose_deaths)}</p>
                <p className="text-xs text-muted-foreground">
                  Opioid: {formatNumber(currentStats?.opioid_deaths)}
                </p>
              </div>

              <div className="bg-card rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Treatment Centers</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(currentStats?.treatment_centers)}</p>
                <p className="text-xs text-muted-foreground">Verified facilities</p>
              </div>

              <div className="bg-card rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Treatment Gap</span>
                </div>
                <p className="text-2xl font-bold">{currentStats?.treatment_gap_percent?.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Not receiving treatment</p>
              </div>
            </div>
          )}

          {/* Data Source Citation */}
          {currentStats?.primary_source && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Source:</span>
              <span className="font-medium">{currentStats.primary_source}</span>
              {currentStats.primary_source_url && (
                <a 
                  href={currentStats.primary_source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  View Source <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Charts Section */}
      {chartData.length > 1 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Historical Trends (2019-2025)</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Affected Population Trend */}
              <div className="bg-card rounded-xl border p-4">
                <h3 className="font-semibold mb-4">People Affected Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip formatter={(v: number) => formatNumber(v)} />
                    <Line 
                      type="monotone" 
                      dataKey="affected" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="People Affected"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Deaths Comparison */}
              <div className="bg-card rounded-xl border p-4">
                <h3 className="font-semibold mb-4">Drug vs Alcohol Related Deaths</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip formatter={(v: number) => formatNumber(v)} />
                    <Legend />
                    <Bar dataKey="deaths" fill="#f97316" name="Drug Overdose" />
                    <Bar dataKey="alcoholDeaths" fill="#8b5cf6" name="Alcohol Related" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Treatment Centers Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Treatment Centers in {countryConfig?.name}</h2>
            <Link 
              to={`/rehab-centers?country=${countryConfig?.code}`}
              className="text-primary hover:underline flex items-center gap-1"
            >
              View All <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          {centersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : centers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {centers.map((center: any) => (
                <div 
                  key={center.id} 
                  className="bg-card rounded-xl border p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{center.name}</h3>
                    {center.is_verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    {center.city}, {center.state_name || center.country_name}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {center.treatment_types?.slice(0, 3).map((type: string) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Rating: {center.rating?.toFixed(1) || "N/A"} ({center.reviews_count || 0} reviews)
                    </span>
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

      {/* Additional Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Additional Statistics ({selectedYear})</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-card rounded-xl border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{formatNumber(currentStats?.population)}</p>
              <p className="text-sm text-muted-foreground">Population</p>
            </div>
            <div className="bg-card rounded-xl border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{formatNumber(currentStats?.alcohol_related_deaths)}</p>
              <p className="text-sm text-muted-foreground">Alcohol Deaths</p>
            </div>
            <div className="bg-card rounded-xl border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{formatNumber(currentStats?.opioid_deaths)}</p>
              <p className="text-sm text-muted-foreground">Opioid Deaths</p>
            </div>
            <div className="bg-card rounded-xl border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">${currentStats?.economic_cost_billions?.toFixed(0) || "N/A"}B</p>
              <p className="text-sm text-muted-foreground">Economic Cost</p>
            </div>
            <div className="bg-card rounded-xl border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{currentStats?.prevalence_rate?.toFixed(1) || "N/A"}%</p>
              <p className="text-sm text-muted-foreground">Prevalence Rate</p>
            </div>
            <div className="bg-card rounded-xl border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{countryData?.treatment_centers_count || "N/A"}</p>
              <p className="text-sm text-muted-foreground">Listed Centers</p>
            </div>
          </div>
        </div>
      </section>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default CountryPage;
