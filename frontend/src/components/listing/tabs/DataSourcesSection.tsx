import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FileText, ShieldCheck, BookOpen, Database, RefreshCw, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  return (
    <div className="space-y-6">
      {/* Methodology Section */}
      <Card className="border-2 border-blue-500/20 bg-gradient-to-b from-blue-50/50 to-card dark:from-blue-950/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <BookOpen className="h-6 w-6 text-blue-500" />
            Data Methodology & Sources
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Understanding how we collect, process, and present addiction statistics for accuracy and transparency.
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="collection">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span>Data Collection Process</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>
                  All statistics displayed on this website are collected exclusively from official U.S. government sources. 
                  We aggregate data from multiple federal agencies to provide a comprehensive view of addiction trends.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>SAMHSA NSDUH:</strong> National surveys on drug use and health, conducted annually with approximately 70,000 respondents</li>
                  <li><strong>CDC WONDER:</strong> Multiple cause of death data from death certificates filed in all 50 states</li>
                  <li><strong>TEDS:</strong> Treatment Episode Data Set tracking admissions to substance abuse treatment facilities</li>
                  <li><strong>State Health Departments:</strong> State-specific mortality and treatment data</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="processing">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-green-500" />
                  <span>Data Processing & Validation</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>
                  We do not manipulate, estimate, or generate any statistics. Our process involves:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Direct extraction:</strong> Data is pulled directly from official government databases and reports</li>
                  <li><strong>No interpolation:</strong> Missing data points are shown as "N/A" rather than estimated</li>
                  <li><strong>Cross-validation:</strong> Where possible, figures are verified across multiple sources</li>
                  <li><strong>Timestamp tracking:</strong> Each data point includes the source year and publication date</li>
                  <li><strong>Regular updates:</strong> Data is refreshed when new government reports are released</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="limitations">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>Data Limitations & Considerations</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>
                  Users should be aware of the following limitations when interpreting our statistics:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Reporting lag:</strong> Government data typically has a 1-2 year delay from the data collection period</li>
                  <li><strong>Underreporting:</strong> Overdose deaths and substance use may be underreported due to stigma or classification issues</li>
                  <li><strong>Methodology changes:</strong> Survey methods may change between years, affecting trend comparisons</li>
                  <li><strong>Sample sizes:</strong> State-level estimates may have larger margins of error than national figures</li>
                  <li><strong>Economic estimates:</strong> Cost figures are modeled estimates based on multiple data inputs</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="definitions">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span>Key Definitions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong>Substance Use Disorder (SUD):</strong> A medical condition defined by DSM-5 criteria, characterized by recurrent use causing impairment</li>
                  <li><strong>Overdose Deaths:</strong> Deaths where drug overdose is listed as the underlying cause on death certificates</li>
                  <li><strong>Opioid Deaths:</strong> Overdose deaths involving any opioid, including prescription opioids, heroin, and synthetic opioids</li>
                  <li><strong>Recovery Rate:</strong> Percentage of treatment admissions resulting in completion or transfer to continued care</li>
                  <li><strong>Binge Drinking:</strong> Consuming 5+ drinks (men) or 4+ drinks (women) on a single occasion in the past 30 days</li>
                  <li><strong>MAT Recipients:</strong> Individuals receiving Medication-Assisted Treatment including methadone, buprenorphine, or naltrexone</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Official Sources Card */}
      {sources && sources.length > 0 && (
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
      )}
    </div>
  );
};
