import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { ALL_COUNTRIES, CountryBasicConfig } from "@/data/countryConfig";
import { countriesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Plus, X, BarChart3, TrendingUp, Users } from "lucide-react";

interface CountryStats {
  country_code: string;
  country_name: string;
  year: number;
  population: number;
  total_affected: number;
  drug_overdose_deaths: number;
  alcohol_related_deaths: number;
  treatment_centers: number;
  treatment_gap_percent: number;
  prevalence_rate: number;
}

export default function ComparePage() {
  const { t } = useTranslation();
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["USA", "GBR", "DEU"]);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  
  // Fetch stats for selected countries
  const { data: countryStats, isLoading } = useQuery({
    queryKey: ["compare-countries", selectedCountries, selectedYear],
    queryFn: async () => {
      const stats: CountryStats[] = [];
      for (const code of selectedCountries) {
        try {
          const response = await countriesApi.getCountryStats(code, selectedYear);
          if (response.statistics?.[0]) {
            stats.push(response.statistics[0]);
          }
        } catch (e) {
          console.error(`Failed to fetch stats for ${code}`);
        }
      }
      return stats;
    },
    enabled: selectedCountries.length > 0,
  });

  const addCountry = (code: string) => {
    if (selectedCountries.length < 4 && !selectedCountries.includes(code)) {
      setSelectedCountries([...selectedCountries, code]);
    }
  };

  const removeCountry = (code: string) => {
    setSelectedCountries(selectedCountries.filter(c => c !== code));
  };

  const getCountryInfo = (code: string): CountryBasicConfig | undefined => {
    return ALL_COUNTRIES.find(c => c.code === code);
  };

  // Show EXACT numbers - NO rounding to K/M
  const formatNumber = (num: number | undefined): string => {
    if (!num && num !== 0) return "N/A";
    return num.toLocaleString(); // Shows exact numbers
  };

  // Prepare chart data
  const barChartData = countryStats?.map(stat => ({
    name: stat.country_name,
    affected: stat.total_affected,
    overdoseDeaths: stat.drug_overdose_deaths,
    alcoholDeaths: stat.alcohol_related_deaths,
    centers: stat.treatment_centers,
  })) || [];

  const radarData = countryStats?.length ? [
    { subject: "Prevalence Rate", ...Object.fromEntries(countryStats.map(s => [s.country_code, s.prevalence_rate || 0])) },
    { subject: "Treatment Gap %", ...Object.fromEntries(countryStats.map(s => [s.country_code, s.treatment_gap_percent || 0])) },
    { subject: "Deaths per 100K", ...Object.fromEntries(countryStats.map(s => [s.country_code, ((s.drug_overdose_deaths + s.alcohol_related_deaths) / (s.population / 100000)) || 0])) },
  ] : [];

  const availableCountries = ALL_COUNTRIES.filter(c => !selectedCountries.includes(c.code));
  const colors = ["#f97316", "#3b82f6", "#22c55e", "#a855f7"];

  return (
    <div className="min-h-screen bg-background" data-testid="compare-page">
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Compare Countries</h1>
              <p className="text-muted-foreground">Side-by-side addiction statistics comparison</p>
            </div>
          </div>

          {/* Country Selection */}
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Select Countries (up to 4)</span>
                <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map(y => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCountries.map((code, idx) => {
                  const country = getCountryInfo(code);
                  return (
                    <Badge
                      key={code}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm flex items-center gap-2"
                      style={{ borderLeftColor: colors[idx], borderLeftWidth: 3 }}
                    >
                      <span>{country?.flag}</span>
                      <span>{country?.name}</span>
                      <button
                        onClick={() => removeCountry(code)}
                        className="ml-1 hover:text-destructive"
                        data-testid={`remove-${code}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
                
                {selectedCountries.length < 4 && (
                  <Select onValueChange={addCountry}>
                    <SelectTrigger className="w-48" data-testid="add-country-select">
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Add Country</span>
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {availableCountries.slice(0, 50).map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="mr-2">{country.flag}</span>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Stats Comparison Cards */}
          {!isLoading && countryStats && countryStats.length > 0 && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {countryStats.map((stat, idx) => {
                  const country = getCountryInfo(stat.country_code);
                  return (
                    <Card key={stat.country_code} style={{ borderTopColor: colors[idx], borderTopWidth: 3 }}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="text-xl">{country?.flag}</span>
                          {stat.country_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Population</span>
                          <span className="font-medium">{formatNumber(stat.population)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">People Affected</span>
                          <span className="font-medium">{formatNumber(stat.total_affected)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Drug Deaths</span>
                          <span className="font-medium text-red-500">{formatNumber(stat.drug_overdose_deaths)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Treatment Centers</span>
                          <span className="font-medium text-green-500">{formatNumber(stat.treatment_centers)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Treatment Gap</span>
                          <span className="font-medium">{stat.treatment_gap_percent?.toFixed(1)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* People Affected Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      People Affected by Addiction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => formatNumber(v)} />
                        <Bar dataKey="affected" fill="#f97316" name="People Affected" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Deaths Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Deaths Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => formatNumber(v)} />
                        <Legend />
                        <Bar dataKey="overdoseDeaths" fill="#ef4444" name="Drug Overdose" />
                        <Bar dataKey="alcoholDeaths" fill="#f59e0b" name="Alcohol-Related" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Treatment Centers */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Treatment Centers Available</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={barChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis type="number" tickFormatter={(v) => formatNumber(v)} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(v: number) => formatNumber(v)} />
                        <Bar dataKey="centers" fill="#22c55e" name="Treatment Centers" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Empty State */}
          {!isLoading && (!countryStats || countryStats.length === 0) && selectedCountries.length > 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No statistics available for the selected countries and year.</p>
                <p className="text-sm text-muted-foreground mt-2">Try selecting different countries or years.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
