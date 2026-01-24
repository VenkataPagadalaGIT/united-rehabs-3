// AI Content Generator - Full LLM Integration
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, CheckCircle, AlertCircle, Loader2, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ALL_STATES } from "@/data/allStates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ContentGeneratorAdmin = () => {
  const [selectedState, setSelectedState] = useState("");
  const [dataType, setDataType] = useState("statistics");
  const [contentType, setContentType] = useState("page_intro");
  const [researchData, setResearchData] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [qaResult, setQaResult] = useState("");

  const stateName = ALL_STATES.find(s => s.abbreviation === selectedState)?.name || "";

  // Research mutation
  const researchMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/generate/research", {
        state_name: stateName,
        state_abbrev: selectedState,
        data_type: dataType,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setResearchData(data.data);
        toast.success("Research completed successfully!");
      } else {
        toast.error(data.error || "Research failed");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Research failed");
    },
  });

  // Content generation mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/generate/content", {
        state_name: stateName,
        state_abbrev: selectedState,
        content_type: contentType,
        research_data: researchData,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setGeneratedContent(data.content);
        toast.success("Content generated successfully!");
      } else {
        toast.error(data.error || "Generation failed");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Generation failed");
    },
  });

  // QA review mutation
  const qaMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/generate/qa", {
        content: generatedContent,
        state_name: stateName,
        state_abbrev: selectedState,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setQaResult(data.review);
        toast.success("QA review completed!");
      } else {
        toast.error(data.error || "QA review failed");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "QA review failed");
    },
  });

  const dataTypes = [
    { value: "statistics", label: "State Statistics" },
    { value: "resources", label: "Free Resources" },
    { value: "faqs", label: "FAQs" },
  ];

  const contentTypes = [
    { value: "page_intro", label: "Page Introduction" },
    { value: "seo_description", label: "SEO Meta Description" },
    { value: "article", label: "Full Article" },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          AI Content Generator
        </h2>
        <p className="text-muted-foreground">Generate and verify content using AI (Gemini 2.5 Flash).</p>
      </div>

      {/* State Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select State</CardTitle>
          <CardDescription>Choose a state to generate content for</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Choose a state" />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATES.map((state) => (
                <SelectItem key={state.abbreviation} value={state.abbreviation}>
                  {state.name} ({state.abbreviation})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedState && (
        <Tabs defaultValue="research" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="research">
              <span className="flex items-center gap-2">
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">1</Badge>
                Research
              </span>
            </TabsTrigger>
            <TabsTrigger value="generate">
              <span className="flex items-center gap-2">
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">2</Badge>
                Generate
              </span>
            </TabsTrigger>
            <TabsTrigger value="qa">
              <span className="flex items-center gap-2">
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">3</Badge>
                QA Review
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Research */}
          <TabsContent value="research">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Step 1: Research Data for {stateName}
                </CardTitle>
                <CardDescription>
                  AI will research addiction statistics and resources from official sources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Type to Research</Label>
                  <Select value={dataType} onValueChange={setDataType}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => researchMutation.mutate()} 
                  disabled={researchMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {researchMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start Research
                    </>
                  )}
                </Button>

                {researchData && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Research Results</Label>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(researchData)}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={researchData}
                      onChange={(e) => setResearchData(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Generate Content */}
          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Step 2: Generate Content for {stateName}
                </CardTitle>
                <CardDescription>
                  AI will generate SEO-optimized content based on research data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!researchData && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Complete Step 1 (Research) first to get data for content generation
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => generateMutation.mutate()} 
                  disabled={generateMutation.isPending || !researchData}
                  className="w-full md:w-auto"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>

                {generatedContent && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Generated Content</Label>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedContent)}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: QA Review */}
          <TabsContent value="qa">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Step 3: QA Review
                </CardTitle>
                <CardDescription>
                  AI will review content for accuracy, tone, and SEO optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!generatedContent && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Complete Step 2 (Generate) first to have content to review
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => qaMutation.mutate()} 
                  disabled={qaMutation.isPending || !generatedContent}
                  className="w-full md:w-auto"
                >
                  {qaMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Reviewing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Run QA Review
                    </>
                  )}
                </Button>

                {qaResult && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>QA Review Results</Label>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(qaResult)}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={qaResult}
                      readOnly
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Workflow Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Content Generation Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <Badge className="mb-2">Step 1</Badge>
              <h4 className="font-medium">Research</h4>
              <p className="text-sm text-muted-foreground">AI researches official sources (CDC, SAMHSA, NSDUH) for accurate state data</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge className="mb-2">Step 2</Badge>
              <h4 className="font-medium">Generate</h4>
              <p className="text-sm text-muted-foreground">SEO-optimized content created based on research data</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge className="mb-2">Step 3</Badge>
              <h4 className="font-medium">QA Review</h4>
              <p className="text-sm text-muted-foreground">AI verifies accuracy, tone, and SEO quality</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentGeneratorAdmin;
