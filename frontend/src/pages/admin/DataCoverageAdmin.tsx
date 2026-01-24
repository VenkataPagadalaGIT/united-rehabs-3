import { useQuery } from "@tanstack/react-query";
import { dashboardApi, statisticsApi, substanceStatisticsApi, resourcesApi, faqsApi, dataSourcesApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ALL_STATES } from "@/data/allStates";
import { CheckCircle, AlertCircle, BarChart3, Database, Gift, HelpCircle, FileText } from "lucide-react";

const DataCoverageAdmin = () => {
  const { data: counts } = useQuery({
    queryKey: ["admin-dashboard-counts"],
    queryFn: () => dashboardApi.getCounts(),
  });

  const { data: statistics } = useQuery({
    queryKey: ["admin-statistics-coverage"],
    queryFn: () => statisticsApi.getAll({ limit: 1000 }),
  });

  const { data: substances } = useQuery({
    queryKey: ["admin-substance-coverage"],
    queryFn: () => substanceStatisticsApi.getAll({ limit: 1000 }),
  });

  const { data: resources } = useQuery({
    queryKey: ["admin-resources-coverage"],
    queryFn: () => resourcesApi.getAll({ limit: 1000 }),
  });

  const { data: faqs } = useQuery({
    queryKey: ["admin-faqs-coverage"],
    queryFn: () => faqsApi.getAll({ is_active: undefined, limit: 1000 }),
  });

  const { data: sources } = useQuery({
    queryKey: ["admin-sources-coverage"],
    queryFn: () => dataSourcesApi.getAll({ limit: 1000 }),
  });

  // Calculate coverage
  const totalStates = ALL_STATES.length;
  
  const statesWithStats = new Set(statistics?.map((s: any) => s.state_id) || []);
  const statesWithSubstance = new Set(substances?.map((s: any) => s.state_id) || []);
  const statesWithResources = new Set(resources?.filter((r: any) => r.state_id).map((r: any) => r.state_id) || []);
  const statesWithFaqs = new Set(faqs?.filter((f: any) => f.state_id).map((f: any) => f.state_id) || []);

  const statsProgress = (statesWithStats.size / totalStates) * 100;
  const substanceProgress = (statesWithSubstance.size / totalStates) * 100;
  const resourcesProgress = (statesWithResources.size / totalStates) * 100;
  const faqsProgress = (statesWithFaqs.size / totalStates) * 100;

  const coverageItems = [
    {
      title: "State Statistics",
      icon: BarChart3,
      covered: statesWithStats.size,
      total: totalStates,
      progress: statsProgress,
      records: counts?.statistics_count || 0,
    },
    {
      title: "Substance Statistics",
      icon: Database,
      covered: statesWithSubstance.size,
      total: totalStates,
      progress: substanceProgress,
      records: counts?.substance_count || 0,
    },
    {
      title: "Free Resources",
      icon: Gift,
      covered: statesWithResources.size,
      total: totalStates,
      progress: resourcesProgress,
      records: counts?.resources_count || 0,
    },
    {
      title: "FAQs",
      icon: HelpCircle,
      covered: statesWithFaqs.size,
      total: totalStates,
      progress: faqsProgress,
      records: counts?.faqs_count || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Data Coverage</h2>
        <p className="text-muted-foreground">Monitor data coverage across all 50 states.</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {coverageItems.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.covered}/{item.total}</div>
              <Progress value={item.progress} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{item.records} total records</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Sources ({sources?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sources && sources.length > 0 ? (
            <div className="grid gap-2">
              {sources.map((source: any) => (
                <div key={source.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{source.source_abbreviation}</span>
                    <span className="text-sm text-muted-foreground">{source.agency}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{source.last_updated_year}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data sources configured yet.</p>
          )}
        </CardContent>
      </Card>

      {/* State Coverage Table */}
      <Card>
        <CardHeader>
          <CardTitle>State Coverage Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 max-h-96 overflow-y-auto">
            {ALL_STATES.map((state) => {
              const hasStats = statesWithStats.has(state.abbreviation);
              const hasSubstance = statesWithSubstance.has(state.abbreviation);
              const hasResources = statesWithResources.has(state.abbreviation);
              const hasFaqs = statesWithFaqs.has(state.abbreviation);
              const coverage = [hasStats, hasSubstance, hasResources, hasFaqs].filter(Boolean).length;
              
              return (
                <div key={state.abbreviation} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    {coverage === 4 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="font-medium">{state.name}</span>
                    <span className="text-sm text-muted-foreground">({state.abbreviation})</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${hasStats ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>Stats</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${hasSubstance ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>Substance</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${hasResources ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>Resources</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${hasFaqs ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>FAQs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataCoverageAdmin;
