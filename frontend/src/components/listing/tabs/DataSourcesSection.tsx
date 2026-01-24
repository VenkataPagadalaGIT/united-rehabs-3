import { useQuery } from "@tanstack/react-query";
import { dataSourcesApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, ExternalLink } from "lucide-react";

export const DataSourcesSection = () => {
  const { data: sources, isLoading } = useQuery({
    queryKey: ["data-sources"],
    queryFn: async () => {
      return await dataSourcesApi.getAll({ limit: 20 });
    },
  });

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Sources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Our statistics are sourced from official government agencies and research institutions:
        </p>
        <div className="grid gap-2">
          {sources.map((source: any) => (
            <div key={source.id} className="flex items-center justify-between p-2 bg-muted rounded">
              <div>
                <span className="font-medium">{source.source_abbreviation}</span>
                <span className="text-sm text-muted-foreground ml-2">{source.agency}</span>
              </div>
              <a href={source.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                <ExternalLink className="h-3 w-3" />
                Source
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSourcesSection;
