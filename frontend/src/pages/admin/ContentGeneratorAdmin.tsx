import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  bulkGenerateContent, 
  ContentType, 
  StateGenerationResult 
} from "@/lib/api/contentGenerator";
import { 
  Brain, 
  Search, 
  FileCheck, 
  Upload, 
  Play, 
  Pause,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw
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

const CONTENT_TYPES: { value: ContentType; label: string; description: string }[] = [
  { value: "statistics", label: "General Statistics", description: "Overdose deaths, treatment centers, rates" },
  { value: "substance_statistics", label: "Substance Statistics", description: "Detailed per-substance data (alcohol, opioids, etc.)" },
  { value: "resources", label: "Resources", description: "Free treatment resources" },
  { value: "faqs", label: "FAQs", description: "Frequently asked questions" },
  { value: "seo", label: "SEO Content", description: "Page titles and descriptions" },
];

// Available years for statistics (1992-2026) - SAMHSA TEDS data available from 1992
const AVAILABLE_YEARS = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
  2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 
  2002, 2001, 2000, 1999, 1998, 1997, 1996, 1995, 1994, 1993, 1992
];

export default function ContentGeneratorAdmin() {
  const { toast } = useToast();
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>(["statistics", "substance_statistics", "resources", "faqs", "seo"]);
  const [selectedYears, setSelectedYears] = useState<number[]>(AVAILABLE_YEARS);
  const [skipQA, setSkipQA] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [results, setResults] = useState<StateGenerationResult[]>([]);
  const [activeTab, setActiveTab] = useState("select");

  const toggleState = (abbreviation: string) => {
    setSelectedStates(prev =>
      prev.includes(abbreviation)
        ? prev.filter(s => s !== abbreviation)
        : [...prev, abbreviation]
    );
  };

  const selectAllStates = () => {
    setSelectedStates(ALL_STATES.map(s => s.abbreviation));
  };

  const clearSelection = () => {
    setSelectedStates([]);
  };

  const toggleContentType = (type: ContentType) => {
    setSelectedContentTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleYear = (year: number) => {
    setSelectedYears(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year].sort((a, b) => b - a)
    );
  };

  const selectAllYears = () => {
    setSelectedYears([...AVAILABLE_YEARS]);
  };

  const clearYears = () => {
    setSelectedYears([]);
  };

  const startGeneration = async () => {
    if (selectedStates.length === 0) {
      toast({ title: "No states selected", description: "Please select at least one state", variant: "destructive" });
      return;
    }
    if (selectedContentTypes.length === 0) {
      toast({ title: "No content types selected", description: "Please select at least one content type", variant: "destructive" });
      return;
    }
    if (selectedContentTypes.includes("statistics") && selectedYears.length === 0) {
      toast({ title: "No years selected", description: "Please select at least one year for statistics", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setResults([]);
    setActiveTab("progress");

    const states = ALL_STATES.filter(s => selectedStates.includes(s.abbreviation));

    try {
      const generatedResults = await bulkGenerateContent(
        states,
        selectedContentTypes,
        (completed, total, current) => {
          setProgress((completed / total) * 100);
          setCurrentTask(current);
        },
        skipQA,
        3000, // 3 second delay between calls
        selectedYears // Pass selected years for statistics
      );

      setResults(generatedResults);
      setActiveTab("results");

      const approved = generatedResults.filter(r => r.approved).length;
      const failed = generatedResults.filter(r => !r.approved).length;

      toast({
        title: "Generation Complete",
        description: `${approved} approved, ${failed} need review`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const uploadApproved = async () => {
    const approvedResults = results.filter(r => r.approved && r.content);
    
    if (approvedResults.length === 0) {
      toast({ title: "No approved content", description: "No content is ready to upload", variant: "destructive" });
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const result of approvedResults) {
      try {
        if (result.contentType === "statistics" && result.content) {
          const statsData = result.content as Record<string, unknown>;
          const { error } = await supabase
            .from("state_addiction_statistics")
            .upsert({
              state_id: String(statsData.state_id || ""),
              state_name: String(statsData.state_name || ""),
              year: Number(statsData.year) || new Date().getFullYear(),
              total_affected: statsData.total_affected as number | null,
              overdose_deaths: statsData.overdose_deaths as number | null,
              opioid_deaths: statsData.opioid_deaths as number | null,
              drug_abuse_rate: statsData.drug_abuse_rate as number | null,
              alcohol_abuse_rate: statsData.alcohol_abuse_rate as number | null,
              affected_age_12_17: statsData.affected_age_12_17 as number | null,
              affected_age_18_25: statsData.affected_age_18_25 as number | null,
              affected_age_26_34: statsData.affected_age_26_34 as number | null,
              affected_age_35_plus: statsData.affected_age_35_plus as number | null,
              total_treatment_centers: statsData.total_treatment_centers as number | null,
              inpatient_facilities: statsData.inpatient_facilities as number | null,
              outpatient_facilities: statsData.outpatient_facilities as number | null,
              treatment_admissions: statsData.treatment_admissions as number | null,
              recovery_rate: statsData.recovery_rate as number | null,
              relapse_rate: statsData.relapse_rate as number | null,
              economic_cost_billions: statsData.economic_cost_billions as number | null,
              data_source: statsData.data_source as string | null,
              source_url: statsData.source_url as string | null,
            }, { onConflict: "state_id,year" });
          if (error) throw error;
          successCount++;
        } else if (result.contentType === "substance_statistics" && result.content) {
          const substanceData = result.content as Record<string, unknown>;
          const { error } = await supabase
            .from("substance_statistics")
            .upsert({
              state_id: String(substanceData.state_id || ""),
              state_name: String(substanceData.state_name || ""),
              year: Number(substanceData.year) || new Date().getFullYear(),
              alcohol_use_past_month_percent: substanceData.alcohol_use_past_month_percent as number | null,
              alcohol_binge_drinking_percent: substanceData.alcohol_binge_drinking_percent as number | null,
              alcohol_heavy_use_percent: substanceData.alcohol_heavy_use_percent as number | null,
              alcohol_use_disorder: substanceData.alcohol_use_disorder as number | null,
              alcohol_related_deaths: substanceData.alcohol_related_deaths as number | null,
              opioid_use_disorder: substanceData.opioid_use_disorder as number | null,
              opioid_misuse_past_year: substanceData.opioid_misuse_past_year as number | null,
              prescription_opioid_misuse: substanceData.prescription_opioid_misuse as number | null,
              heroin_use: substanceData.heroin_use as number | null,
              fentanyl_deaths: substanceData.fentanyl_deaths as number | null,
              fentanyl_involved_overdoses: substanceData.fentanyl_involved_overdoses as number | null,
              marijuana_use_past_month: substanceData.marijuana_use_past_month as number | null,
              marijuana_use_past_year: substanceData.marijuana_use_past_year as number | null,
              marijuana_use_disorder: substanceData.marijuana_use_disorder as number | null,
              cocaine_use_past_year: substanceData.cocaine_use_past_year as number | null,
              cocaine_use_disorder: substanceData.cocaine_use_disorder as number | null,
              cocaine_related_deaths: substanceData.cocaine_related_deaths as number | null,
              meth_use_past_year: substanceData.meth_use_past_year as number | null,
              meth_use_disorder: substanceData.meth_use_disorder as number | null,
              meth_related_deaths: substanceData.meth_related_deaths as number | null,
              prescription_stimulant_misuse: substanceData.prescription_stimulant_misuse as number | null,
              prescription_sedative_misuse: substanceData.prescription_sedative_misuse as number | null,
              prescription_tranquilizer_misuse: substanceData.prescription_tranquilizer_misuse as number | null,
              treatment_received: substanceData.treatment_received as number | null,
              treatment_needed_not_received: substanceData.treatment_needed_not_received as number | null,
              mat_recipients: substanceData.mat_recipients as number | null,
              mental_illness_with_sud: substanceData.mental_illness_with_sud as number | null,
              serious_mental_illness_with_sud: substanceData.serious_mental_illness_with_sud as number | null,
            }, { onConflict: "state_id,year" });
          if (error) throw error;
          successCount++;
        } else if (result.contentType === "resources" && Array.isArray(result.content)) {
          for (const resource of result.content) {
            const resourceData = resource as Record<string, unknown>;
            const { error } = await supabase
              .from("free_resources")
              .insert({
                title: String(resourceData.title || ""),
                description: resourceData.description as string | null,
                resource_type: String(resourceData.resource_type || "government_program"),
                phone: resourceData.phone as string | null,
                website: resourceData.website as string | null,
                address: resourceData.address as string | null,
                is_free: resourceData.is_free as boolean ?? true,
                is_nationwide: resourceData.is_nationwide as boolean ?? false,
                state_id: resourceData.state_id as string | null,
              });
            if (error) throw error;
          }
          successCount++;
        } else if (result.contentType === "faqs" && Array.isArray(result.content)) {
          for (const faq of result.content) {
            const faqData = faq as Record<string, unknown>;
            const { error } = await supabase
              .from("faqs")
              .insert({
                question: String(faqData.question || ""),
                answer: String(faqData.answer || ""),
                category: faqData.category as string | null,
                state_id: faqData.state_id as string | null,
              });
            if (error) throw error;
          }
          successCount++;
        } else if (result.contentType === "seo" && result.content) {
          const seoData = result.content as Record<string, unknown>;
          const { error } = await supabase
            .from("page_seo")
            .upsert({
              page_slug: String(seoData.page_slug || ""),
              page_type: String(seoData.page_type || "state"),
              meta_title: String(seoData.meta_title || ""),
              meta_description: seoData.meta_description as string | null,
              h1_title: seoData.h1_title as string | null,
              intro_text: seoData.intro_text as string | null,
              og_title: seoData.og_title as string | null,
              og_description: seoData.og_description as string | null,
              state_id: seoData.state_id as string | null,
            }, { onConflict: "page_slug" });
          if (error) throw error;
          successCount++;
        }
      } catch (error) {
        console.error("Upload error:", error);
        errorCount++;
      }
    }

    toast({
      title: "Upload Complete",
      description: `${successCount} uploaded, ${errorCount} failed`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Content Generator</h1>
          <p className="text-muted-foreground">
            Generate content for all 50 US states using AI research and content generation
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Research Agent</p>
                <p className="text-xs text-muted-foreground">Perplexity AI</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Content Generator</p>
                <p className="text-xs text-muted-foreground">Gemini 2.5 Flash</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">QA Review</p>
                <p className="text-xs text-muted-foreground">Gemini 2.5 Flash</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Bulk Upload</p>
                <p className="text-xs text-muted-foreground">Database</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="select">Select States</TabsTrigger>
          <TabsTrigger value="progress" disabled={!isGenerating && results.length === 0}>
            Progress
          </TabsTrigger>
          <TabsTrigger value="results" disabled={results.length === 0}>
            Results ({results.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Types</CardTitle>
              <CardDescription>Select what content to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {CONTENT_TYPES.map(type => (
                  <div
                    key={type.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedContentTypes.includes(type.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                    onClick={() => toggleContentType(type.value)}
                  >
                    <Checkbox
                      checked={selectedContentTypes.includes(type.value)}
                      onCheckedChange={() => toggleContentType(type.value)}
                    />
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Year Selection for Statistics */}
          {(selectedContentTypes.includes("statistics") || selectedContentTypes.includes("substance_statistics")) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Select Years ({selectedYears.length}/10)</CardTitle>
                    <CardDescription>Choose years for statistics data (2015-2024)</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllYears}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearYears}>
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 grid-cols-5 sm:grid-cols-10">
                  {AVAILABLE_YEARS.map(year => (
                    <div
                      key={year}
                      className={`flex items-center justify-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                        selectedYears.includes(year)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                      onClick={() => toggleYear(year)}
                    >
                      <Checkbox
                        checked={selectedYears.includes(year)}
                        onCheckedChange={() => toggleYear(year)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{year}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Select States ({selectedStates.length}/50)</CardTitle>
                  <CardDescription>Choose states to generate content for</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllStates}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {ALL_STATES.map(state => (
                    <div
                      key={state.abbreviation}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                        selectedStates.includes(state.abbreviation)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                      onClick={() => toggleState(state.abbreviation)}
                    >
                      <Checkbox
                        checked={selectedStates.includes(state.abbreviation)}
                        onCheckedChange={() => toggleState(state.abbreviation)}
                      />
                      <span className="text-sm">
                        <span className="font-medium">{state.abbreviation}</span>
                        <span className="text-muted-foreground ml-1">{state.name}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="skip-qa"
                      checked={skipQA}
                      onCheckedChange={setSkipQA}
                    />
                    <Label htmlFor="skip-qa">Skip QA Review</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      let count = 0;
                      for (const type of selectedContentTypes) {
                        if (type === "statistics" || type === "substance_statistics") {
                          count += selectedStates.length * selectedYears.length;
                        } else {
                          count += selectedStates.length;
                        }
                      }
                      return `${count} items to generate`;
                    })()}
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={startGeneration}
                  disabled={isGenerating || selectedStates.length === 0 || selectedContentTypes.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Generation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Generation Progress</p>
                <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
              </div>
              <Progress value={progress} />
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">{currentTask}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generation Results</CardTitle>
                  <CardDescription>
                    {results.filter(r => r.approved).length} approved, {results.filter(r => !r.approved).length} need review
                  </CardDescription>
                </div>
                <Button onClick={uploadApproved} disabled={results.filter(r => r.approved).length === 0}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Approved ({results.filter(r => r.approved).length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={`${result.stateAbbreviation}-${result.contentType}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {result.approved ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : result.qa.data?.review.flaggedForHumanReview ? (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {result.stateName} - {result.contentType}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {result.qa.data?.review.reviewNotes || result.qa.error || "Processing..."}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.qa.data?.review.score !== undefined && (
                          <Badge variant={result.qa.data.review.score >= 80 ? "default" : "secondary"}>
                            Score: {result.qa.data.review.score}
                          </Badge>
                        )}
                        <Badge variant={result.approved ? "default" : "destructive"}>
                          {result.approved ? "Approved" : "Review"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
