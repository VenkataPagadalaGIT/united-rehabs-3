// Content generator - simplified version without LLM integration
// Will be enhanced with LLM integration upon request

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, AlertCircle } from "lucide-react";
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
  const [contentType, setContentType] = useState("statistics");
  const [generatedContent, setGeneratedContent] = useState("");

  const contentTypes = [
    { value: "statistics", label: "State Statistics" },
    { value: "resources", label: "Free Resources" },
    { value: "faqs", label: "FAQs" },
    { value: "article", label: "Article" },
  ];

  const handleGenerate = () => {
    if (!selectedState) {
      toast.error("Please select a state");
      return;
    }
    
    const state = ALL_STATES.find(s => s.abbreviation === selectedState);
    
    // Placeholder content - actual LLM integration would go here
    const placeholder = `Generated ${contentType} content for ${state?.name}:

This feature will use AI/LLM to generate:
- Research data from official sources (CDC, SAMHSA, NSDUH)
- State-specific addiction statistics
- Treatment center information
- Local resources and helplines

To enable AI generation:
1. Contact admin to configure LLM integration
2. Provide API keys for research tools
3. Configure data verification workflow`;
    
    setGeneratedContent(placeholder);
    toast.success("Content template generated");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          AI Content Generator
        </h2>
        <p className="text-muted-foreground">Generate and verify content using AI.</p>
      </div>

      {/* Configuration Notice */}
      <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-5 w-5" />
            LLM Integration Required
          </CardTitle>
          <CardDescription>
            AI content generation requires LLM configuration. Contact admin to set up:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Research Agent (for data gathering from official sources)</li>
            <li>Content Generator (for creating state-specific content)</li>
            <li>QA Reviewer (for verifying accuracy against CDC/SAMHSA data)</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Generator Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
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

            <Button onClick={handleGenerate} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Content Template
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              placeholder="Generated content will appear here..."
              rows={12}
              className="font-mono text-sm"
            />
            {generatedContent && (
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generatedContent).then(() => toast.success("Copied!"))}>
                  Copy to Clipboard
                </Button>
                <Button variant="outline" size="sm" onClick={() => setGeneratedContent("")}>
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Content Generation Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <Badge className="mb-2">Step 1</Badge>
              <h4 className="font-medium">Research</h4>
              <p className="text-sm text-muted-foreground">AI searches official sources for accurate data</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge className="mb-2">Step 2</Badge>
              <h4 className="font-medium">Generate</h4>
              <p className="text-sm text-muted-foreground">Content is created based on research</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge className="mb-2">Step 3</Badge>
              <h4 className="font-medium">QA Review</h4>
              <p className="text-sm text-muted-foreground">AI verifies data against CDC WONDER</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge className="mb-2">Step 4</Badge>
              <h4 className="font-medium">Publish</h4>
              <p className="text-sm text-muted-foreground">Save verified content to database</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentGeneratorAdmin;
