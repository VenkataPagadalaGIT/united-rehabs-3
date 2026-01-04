import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DataSource {
  id: string;
  source_name: string;
  source_abbreviation: string;
  source_url: string;
  description: string | null;
  data_types: string[] | null;
  last_updated_year: number | null;
  agency: string;
}

export const DataSourcesSection = () => {
  const { data: sources, isLoading } = useQuery({
    queryKey: ["data-sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_sources")
        .select("*")
        .order("source_name");

      if (error) throw error;
      return data as DataSource[];
    },
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sources?.length) return null;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-b from-card to-card/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Official Government Data Sources
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          All statistics presented on this page are sourced exclusively from official U.S. government agencies. 
          We do not manipulate or generate any data—accuracy and transparency are our top priorities.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {sources.map((source) => (
          <div
            key={source.id}
            className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <h4 className="font-semibold">{source.source_name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {source.source_abbreviation}
                  </Badge>
                  {source.last_updated_year && (
                    <Badge variant="secondary" className="text-xs">
                      Updated {source.last_updated_year}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1.5">{source.agency}</p>
                {source.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {source.description}
                  </p>
                )}
                {source.data_types && source.data_types.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {source.data_types.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs bg-primary/5">
                        {type}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <a
                href={source.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 rounded-md transition-colors shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Visit Source
              </a>
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              <strong>Data Integrity Notice:</strong> The statistics displayed are collected from publicly available 
              government databases. Data may have a 1-2 year lag due to official reporting timelines. For the most 
              current data, please visit the source websites directly.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
