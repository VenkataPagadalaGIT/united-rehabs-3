import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Database,
  BarChart3,
  FileText,
  HelpCircle,
  Search
} from "lucide-react";

// All 50 US States
const ALL_STATES = [
  { name: "Alabama", abbreviation: "AL", slug: "alabama" },
  { name: "Alaska", abbreviation: "AK", slug: "alaska" },
  { name: "Arizona", abbreviation: "AZ", slug: "arizona" },
  { name: "Arkansas", abbreviation: "AR", slug: "arkansas" },
  { name: "California", abbreviation: "CA", slug: "california" },
  { name: "Colorado", abbreviation: "CO", slug: "colorado" },
  { name: "Connecticut", abbreviation: "CT", slug: "connecticut" },
  { name: "Delaware", abbreviation: "DE", slug: "delaware" },
  { name: "Florida", abbreviation: "FL", slug: "florida" },
  { name: "Georgia", abbreviation: "GA", slug: "georgia" },
  { name: "Hawaii", abbreviation: "HI", slug: "hawaii" },
  { name: "Idaho", abbreviation: "ID", slug: "idaho" },
  { name: "Illinois", abbreviation: "IL", slug: "illinois" },
  { name: "Indiana", abbreviation: "IN", slug: "indiana" },
  { name: "Iowa", abbreviation: "IA", slug: "iowa" },
  { name: "Kansas", abbreviation: "KS", slug: "kansas" },
  { name: "Kentucky", abbreviation: "KY", slug: "kentucky" },
  { name: "Louisiana", abbreviation: "LA", slug: "louisiana" },
  { name: "Maine", abbreviation: "ME", slug: "maine" },
  { name: "Maryland", abbreviation: "MD", slug: "maryland" },
  { name: "Massachusetts", abbreviation: "MA", slug: "massachusetts" },
  { name: "Michigan", abbreviation: "MI", slug: "michigan" },
  { name: "Minnesota", abbreviation: "MN", slug: "minnesota" },
  { name: "Mississippi", abbreviation: "MS", slug: "mississippi" },
  { name: "Missouri", abbreviation: "MO", slug: "missouri" },
  { name: "Montana", abbreviation: "MT", slug: "montana" },
  { name: "Nebraska", abbreviation: "NE", slug: "nebraska" },
  { name: "Nevada", abbreviation: "NV", slug: "nevada" },
  { name: "New Hampshire", abbreviation: "NH", slug: "new-hampshire" },
  { name: "New Jersey", abbreviation: "NJ", slug: "new-jersey" },
  { name: "New Mexico", abbreviation: "NM", slug: "new-mexico" },
  { name: "New York", abbreviation: "NY", slug: "new-york" },
  { name: "North Carolina", abbreviation: "NC", slug: "north-carolina" },
  { name: "North Dakota", abbreviation: "ND", slug: "north-dakota" },
  { name: "Ohio", abbreviation: "OH", slug: "ohio" },
  { name: "Oklahoma", abbreviation: "OK", slug: "oklahoma" },
  { name: "Oregon", abbreviation: "OR", slug: "oregon" },
  { name: "Pennsylvania", abbreviation: "PA", slug: "pennsylvania" },
  { name: "Rhode Island", abbreviation: "RI", slug: "rhode-island" },
  { name: "South Carolina", abbreviation: "SC", slug: "south-carolina" },
  { name: "South Dakota", abbreviation: "SD", slug: "south-dakota" },
  { name: "Tennessee", abbreviation: "TN", slug: "tennessee" },
  { name: "Texas", abbreviation: "TX", slug: "texas" },
  { name: "Utah", abbreviation: "UT", slug: "utah" },
  { name: "Vermont", abbreviation: "VT", slug: "vermont" },
  { name: "Virginia", abbreviation: "VA", slug: "virginia" },
  { name: "Washington", abbreviation: "WA", slug: "washington" },
  { name: "West Virginia", abbreviation: "WV", slug: "west-virginia" },
  { name: "Wisconsin", abbreviation: "WI", slug: "wisconsin" },
  { name: "Wyoming", abbreviation: "WY", slug: "wyoming" },
];

const ALL_YEARS = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
  2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000, 1999
];

interface StateCoverage {
  stateId: string;
  stateName: string;
  statistics: number[];
  substanceStatistics: number[];
  faqs: number;
  resources: number;
  seo: boolean;
}

export default function DataCoverageAdmin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [coverage, setCoverage] = useState<StateCoverage[]>([]);
  const [totals, setTotals] = useState({
    statesWithStats: 0,
    statesWithSubstance: 0,
    statesWithFaqs: 0,
    statesWithResources: 0,
    statesWithSeo: 0,
    totalStatRecords: 0,
    totalSubstanceRecords: 0,
    totalFaqs: 0,
    totalResources: 0,
  });

  const fetchCoverage = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [statsRes, substanceRes, faqsRes, resourcesRes, seoRes] = await Promise.all([
        supabase.from("state_addiction_statistics").select("state_id, year"),
        supabase.from("substance_statistics").select("state_id, year"),
        supabase.from("faqs").select("state_id"),
        supabase.from("free_resources").select("state_id"),
        supabase.from("page_seo").select("state_id, page_type").eq("page_type", "state"),
      ]);

      // Process statistics by state
      const statsMap = new Map<string, number[]>();
      (statsRes.data || []).forEach((row) => {
        const existing = statsMap.get(row.state_id) || [];
        if (!existing.includes(row.year)) {
          existing.push(row.year);
        }
        statsMap.set(row.state_id, existing);
      });

      // Process substance statistics by state
      const substanceMap = new Map<string, number[]>();
      (substanceRes.data || []).forEach((row) => {
        const existing = substanceMap.get(row.state_id) || [];
        if (!existing.includes(row.year)) {
          existing.push(row.year);
        }
        substanceMap.set(row.state_id, existing);
      });

      // Process FAQs by state
      const faqsMap = new Map<string, number>();
      (faqsRes.data || []).forEach((row) => {
        if (row.state_id) {
          faqsMap.set(row.state_id, (faqsMap.get(row.state_id) || 0) + 1);
        }
      });

      // Process resources by state
      const resourcesMap = new Map<string, number>();
      (resourcesRes.data || []).forEach((row) => {
        if (row.state_id) {
          resourcesMap.set(row.state_id, (resourcesMap.get(row.state_id) || 0) + 1);
        }
      });

      // Process SEO by state
      const seoSet = new Set<string>();
      (seoRes.data || []).forEach((row) => {
        if (row.state_id) {
          seoSet.add(row.state_id);
        }
      });

      // Build coverage array
      const coverageData: StateCoverage[] = ALL_STATES.map((state) => {
        const stateId = state.abbreviation.toLowerCase();
        return {
          stateId,
          stateName: state.name,
          statistics: statsMap.get(stateId) || [],
          substanceStatistics: substanceMap.get(stateId) || [],
          faqs: faqsMap.get(stateId) || 0,
          resources: resourcesMap.get(stateId) || 0,
          seo: seoSet.has(stateId),
        };
      });

      setCoverage(coverageData);

      // Calculate totals
      setTotals({
        statesWithStats: coverageData.filter(c => c.statistics.length > 0).length,
        statesWithSubstance: coverageData.filter(c => c.substanceStatistics.length > 0).length,
        statesWithFaqs: coverageData.filter(c => c.faqs > 0).length,
        statesWithResources: coverageData.filter(c => c.resources > 0).length,
        statesWithSeo: coverageData.filter(c => c.seo).length,
        totalStatRecords: (statsRes.data || []).length,
        totalSubstanceRecords: (substanceRes.data || []).length,
        totalFaqs: (faqsRes.data || []).length,
        totalResources: (resourcesRes.data || []).length,
      });
    } catch (error) {
      console.error("Error fetching coverage:", error);
      toast({ title: "Error", description: "Failed to fetch data coverage", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchCoverage();
  }, []);

  // Auto-refresh every 10 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchCoverage();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusIcon = (hasData: boolean) => {
    return hasData ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getYearCoverage = (years: number[]) => {
    if (years.length === 0) return "None";
    if (years.length === ALL_YEARS.length) return "Complete";
    const sorted = [...years].sort((a, b) => b - a);
    if (years.length <= 3) {
      return sorted.join(", ");
    }
    return `${sorted[0]}-${sorted[sorted.length - 1]} (${years.length}/${ALL_YEARS.length})`;
  };

  const overallProgress = (
    (totals.statesWithStats / 50) * 20 +
    (totals.statesWithSubstance / 50) * 20 +
    (totals.statesWithFaqs / 50) * 20 +
    (totals.statesWithResources / 50) * 20 +
    (totals.statesWithSeo / 50) * 20
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Coverage Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor data completeness across all 50 states
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
          </Button>
          <Button onClick={fetchCoverage} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totals.statesWithStats}/50</p>
                <p className="text-xs text-muted-foreground">States with Statistics</p>
                <p className="text-xs text-muted-foreground">{totals.totalStatRecords} total records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{totals.statesWithSubstance}/50</p>
                <p className="text-xs text-muted-foreground">States with Substance Stats</p>
                <p className="text-xs text-muted-foreground">{totals.totalSubstanceRecords} total records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{totals.statesWithFaqs}/50</p>
                <p className="text-xs text-muted-foreground">States with FAQs</p>
                <p className="text-xs text-muted-foreground">{totals.totalFaqs} total FAQs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totals.statesWithResources}/50</p>
                <p className="text-xs text-muted-foreground">States with Resources</p>
                <p className="text-xs text-muted-foreground">{totals.totalResources} total resources</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Search className="h-8 w-8 text-teal-500" />
              <div>
                <p className="text-2xl font-bold">{totals.statesWithSeo}/50</p>
                <p className="text-xs text-muted-foreground">States with SEO</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Data Completeness</CardTitle>
          <CardDescription>
            Combined progress across all content types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{overallProgress.toFixed(1)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
          <div className="mt-4 grid grid-cols-5 gap-4 text-center text-xs">
            <div>
              <div className="font-medium">{((totals.statesWithStats / 50) * 100).toFixed(0)}%</div>
              <div className="text-muted-foreground">Statistics</div>
            </div>
            <div>
              <div className="font-medium">{((totals.statesWithSubstance / 50) * 100).toFixed(0)}%</div>
              <div className="text-muted-foreground">Substance</div>
            </div>
            <div>
              <div className="font-medium">{((totals.statesWithFaqs / 50) * 100).toFixed(0)}%</div>
              <div className="text-muted-foreground">FAQs</div>
            </div>
            <div>
              <div className="font-medium">{((totals.statesWithResources / 50) * 100).toFixed(0)}%</div>
              <div className="text-muted-foreground">Resources</div>
            </div>
            <div>
              <div className="font-medium">{((totals.statesWithSeo / 50) * 100).toFixed(0)}%</div>
              <div className="text-muted-foreground">SEO</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed State Coverage */}
      <Card>
        <CardHeader>
          <CardTitle>State-by-State Coverage</CardTitle>
          <CardDescription>
            Detailed breakdown of data availability for each state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grid">
            <TabsList className="mb-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="missing">Missing Data</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {coverage.map((state) => {
                  const hasAll = 
                    state.statistics.length > 0 && 
                    state.substanceStatistics.length > 0 && 
                    state.faqs > 0 && 
                    state.resources > 0 && 
                    state.seo;
                  const hasNone = 
                    state.statistics.length === 0 && 
                    state.substanceStatistics.length === 0 && 
                    state.faqs === 0 && 
                    state.resources === 0 && 
                    !state.seo;
                  
                  return (
                    <div
                      key={state.stateId}
                      className={`p-2 rounded-lg text-center text-xs font-medium border ${
                        hasAll
                          ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300"
                          : hasNone
                          ? "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
                          : "bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300"
                      }`}
                      title={`${state.stateName}: Stats(${state.statistics.length}), Substance(${state.substanceStatistics.length}), FAQs(${state.faqs}), Resources(${state.resources}), SEO(${state.seo ? "Yes" : "No"})`}
                    >
                      {state.stateId.toUpperCase()}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border border-green-300 dark:bg-green-900/30 dark:border-green-700" />
                  <span>Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700" />
                  <span>Partial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100 border border-red-300 dark:bg-red-900/30 dark:border-red-700" />
                  <span>No Data</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="table">
              <ScrollArea className="h-[500px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background border-b">
                    <tr>
                      <th className="text-left py-2 px-2">State</th>
                      <th className="text-center py-2 px-2">Statistics</th>
                      <th className="text-center py-2 px-2">Substance</th>
                      <th className="text-center py-2 px-2">FAQs</th>
                      <th className="text-center py-2 px-2">Resources</th>
                      <th className="text-center py-2 px-2">SEO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverage.map((state) => (
                      <tr key={state.stateId} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2 font-medium">{state.stateName}</td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {getStatusIcon(state.statistics.length > 0)}
                            <span className="text-xs text-muted-foreground">
                              {getYearCoverage(state.statistics)}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {getStatusIcon(state.substanceStatistics.length > 0)}
                            <span className="text-xs text-muted-foreground">
                              {getYearCoverage(state.substanceStatistics)}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {getStatusIcon(state.faqs > 0)}
                            <span className="text-xs text-muted-foreground">{state.faqs}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {getStatusIcon(state.resources > 0)}
                            <span className="text-xs text-muted-foreground">{state.resources}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          {getStatusIcon(state.seo)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="missing">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      States Missing All Data ({coverage.filter(c => 
                        c.statistics.length === 0 && 
                        c.substanceStatistics.length === 0 && 
                        c.faqs === 0 && 
                        c.resources === 0 && 
                        !c.seo
                      ).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex flex-wrap gap-2">
                      {coverage
                        .filter(c => 
                          c.statistics.length === 0 && 
                          c.substanceStatistics.length === 0 && 
                          c.faqs === 0 && 
                          c.resources === 0 && 
                          !c.seo
                        )
                        .map(c => (
                          <Badge key={c.stateId} variant="destructive">
                            {c.stateName}
                          </Badge>
                        ))}
                      {coverage.filter(c => 
                        c.statistics.length === 0 && 
                        c.substanceStatistics.length === 0 && 
                        c.faqs === 0 && 
                        c.resources === 0 && 
                        !c.seo
                      ).length === 0 && (
                        <span className="text-muted-foreground text-sm">All states have some data</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      States Missing Statistics ({coverage.filter(c => c.statistics.length === 0).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex flex-wrap gap-2">
                      {coverage
                        .filter(c => c.statistics.length === 0)
                        .map(c => (
                          <Badge key={c.stateId} variant="outline">
                            {c.stateName}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      States Missing FAQs ({coverage.filter(c => c.faqs === 0).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex flex-wrap gap-2">
                      {coverage
                        .filter(c => c.faqs === 0)
                        .map(c => (
                          <Badge key={c.stateId} variant="outline">
                            {c.stateName}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      States Missing Resources ({coverage.filter(c => c.resources === 0).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex flex-wrap gap-2">
                      {coverage
                        .filter(c => c.resources === 0)
                        .map(c => (
                          <Badge key={c.stateId} variant="outline">
                            {c.stateName}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
