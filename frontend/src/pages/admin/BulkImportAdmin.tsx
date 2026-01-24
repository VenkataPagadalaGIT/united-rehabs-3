// Bulk Import Admin - Support for both AI and Manual data input
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, 
  Loader2, Copy, Eye, FileText, Brain 
} from "lucide-react";
import { toast } from "sonner";

const BulkImportAdmin = () => {
  const [inputData, setInputData] = useState("");
  const [dataFormat, setDataFormat] = useState("table");
  const [importMode, setImportMode] = useState("upsert");
  const [previewData, setPreviewData] = useState<any>(null);

  // Get template
  const { data: templateData } = useQuery({
    queryKey: ["bulk-template", "statistics", dataFormat],
    queryFn: async () => {
      const response = await api.get(`/api/bulk/template/statistics?format=${dataFormat}`);
      return response.data;
    },
  });

  // Validate mutation
  const validateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/bulk/validate", {
        data: inputData,
        format: dataFormat,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setPreviewData(data.preview);
      if (data.summary.invalid_rows > 0) {
        toast.warning(`${data.summary.valid_rows} valid, ${data.summary.invalid_rows} invalid rows`);
      } else {
        toast.success(`All ${data.summary.total_rows} rows are valid!`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Validation failed");
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/bulk/import", {
        data: inputData,
        data_type: "statistics",
        format: dataFormat,
        mode: importMode,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setInputData("");
      setPreviewData(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Import failed");
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get("/api/bulk/export/statistics?format=csv");
      return response.data;
    },
    onSuccess: (data) => {
      // Download as file
      const blob = new Blob([data.content], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `statistics_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      toast.success("Data exported successfully!");
    },
    onError: (error: any) => {
      toast.error("Export failed");
    },
  });

  const copyTemplate = () => {
    if (templateData?.template) {
      navigator.clipboard.writeText(templateData.template);
      toast.success("Template copied to clipboard!");
    }
  };

  const loadSampleData = () => {
    const sampleTable = `| State | State Name | Year | Total Affected | Overdose Deaths | Opioid Deaths | Recovery Rate | Data Source |
|-------|------------|------|----------------|-----------------|---------------|---------------|-------------|
| GA | Georgia | 2024 | 890000 | 4200 | 3100 | 38.5 | NotebookLM Import |
| GA | Georgia | 2023 | 875000 | 4500 | 3300 | 37.2 | NotebookLM Import |
| GA | Georgia | 2022 | 860000 | 4800 | 3500 | 36.0 | NotebookLM Import |
| NY | New York | 2024 | 1650000 | 5800 | 4200 | 41.0 | NotebookLM Import |
| NY | New York | 2023 | 1620000 | 6200 | 4500 | 39.5 | NotebookLM Import |`;
    setInputData(sampleTable);
    setDataFormat("table");
    toast.info("Sample data loaded - click Preview to validate");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="h-6 w-6 text-primary" />
          Bulk Data Import
        </h2>
        <p className="text-muted-foreground">
          Import data from NotebookLM, Excel, or any spreadsheet. Supports CSV and table formats.
        </p>
      </div>

      {/* Data Input Methods */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Method 1: AI Pipeline */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Method 1: AI Agents
            </CardTitle>
            <CardDescription>
              Use 4 AI agents to research, generate, fact-check, and QA data automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Agent 1</Badge>
                <span>Research Agent - Gathers from CDC, SAMHSA</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Agent 2</Badge>
                <span>Content Generator - Creates SEO content</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Agent 3</Badge>
                <span>Fact Checker - Verifies accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Agent 4</Badge>
                <span>QA Agent - Ensures data consistency</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline" asChild>
              <a href="/admin/content-generator">Go to AI Generator →</a>
            </Button>
          </CardContent>
        </Card>

        {/* Method 2: Manual Import */}
        <Card className="border-green-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              Method 2: Manual Import
            </CardTitle>
            <CardDescription>
              Paste table data from NotebookLM, Excel, Google Sheets, or CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>✓ Copy table from NotebookLM</p>
              <p>✓ Copy from Excel/Google Sheets</p>
              <p>✓ Paste CSV data</p>
              <p>✓ Auto-validates against benchmarks</p>
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={loadSampleData}>
              Load Sample Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Import Form */}
      <Card>
        <CardHeader>
          <CardTitle>Paste Your Data</CardTitle>
          <CardDescription>
            Paste table data from NotebookLM or any spreadsheet. The system will auto-detect columns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format and Mode Selection */}
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>Data Format</Label>
              <Select value={dataFormat} onValueChange={setDataFormat}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table (Pipe/Tab)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Import Mode</Label>
              <Select value={importMode} onValueChange={setImportMode}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upsert">Update existing</SelectItem>
                  <SelectItem value="insert">Skip existing</SelectItem>
                  <SelectItem value="replace">Replace all</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={copyTemplate}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Template
              </Button>
            </div>
          </div>

          {/* Template Preview */}
          {templateData && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Expected format:</strong> state_id, state_name, year, total_affected, overdose_deaths, opioid_deaths, recovery_rate, data_source
              </AlertDescription>
            </Alert>
          )}

          {/* Data Input */}
          <div className="space-y-2">
            <Label>Data (paste from NotebookLM, Excel, or any spreadsheet)</Label>
            <Textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder={`Paste your table data here...

Example:
| State | State Name | Year | Total Affected | Overdose Deaths | Recovery Rate |
|-------|------------|------|----------------|-----------------|---------------|
| TX | Texas | 2024 | 2100000 | 5600 | 39.5 |`}
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => validateMutation.mutate()}
              disabled={!inputData || validateMutation.isPending}
              variant="outline"
            >
              {validateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Preview & Validate
            </Button>
            <Button
              onClick={() => importMutation.mutate()}
              disabled={!inputData || importMutation.isPending}
            >
              {importMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Import Data
            </Button>
            <Button
              variant="outline"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Results */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Data Preview
            </CardTitle>
            <CardDescription>
              {previewData.valid_count} of {previewData.total} rows are valid
            </CardDescription>
          </CardHeader>
          <CardContent>
            {previewData.errors && previewData.errors.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Errors:</strong> {previewData.errors.join(", ")}
                </AlertDescription>
              </Alert>
            )}

            <div className="border rounded-lg overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Affected</TableHead>
                    <TableHead>Deaths</TableHead>
                    <TableHead>Recovery %</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.rows?.map((row: any, idx: number) => (
                    <TableRow key={idx} className={row._validation?.valid ? "" : "bg-red-50"}>
                      <TableCell>
                        {row._validation?.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{row.state_id}</TableCell>
                      <TableCell>{row.year}</TableCell>
                      <TableCell>{row.total_affected?.toLocaleString() || "-"}</TableCell>
                      <TableCell>{row.overdose_deaths?.toLocaleString() || "-"}</TableCell>
                      <TableCell>{row.recovery_rate ? `${row.recovery_rate}%` : "-"}</TableCell>
                      <TableCell className="text-xs text-red-600 max-w-xs">
                        {row._validation?.issues?.join(", ") || row._validation?.warnings?.join(", ") || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use NotebookLM Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Step 1: Get Data from NotebookLM</h4>
              <p className="text-sm text-muted-foreground">
                Ask NotebookLM to generate a table with state addiction statistics. 
                Request columns: State, Year, Total Affected, Overdose Deaths, etc.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Step 2: Copy the Table</h4>
              <p className="text-sm text-muted-foreground">
                Select and copy the entire table from NotebookLM's response. 
                The system accepts markdown tables, tab-separated, or CSV format.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Step 3: Paste & Preview</h4>
              <p className="text-sm text-muted-foreground">
                Paste the data above and click "Preview & Validate". 
                The system will check for accuracy issues automatically.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Step 4: Import</h4>
              <p className="text-sm text-muted-foreground">
                Review the preview, fix any issues, then click "Import Data". 
                Data is stored in the database and cached for frontend use.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkImportAdmin;
