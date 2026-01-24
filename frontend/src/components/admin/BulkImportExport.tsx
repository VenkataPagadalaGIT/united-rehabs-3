import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Download, Upload, FileJson, AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ContentRecord {
  id?: string;
  page_key: string;
  section_key: string;
  content_type: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  is_active: boolean | null;
  sort_order: number | null;
  country_code: string | null;
  state_id: string | null;
  city_id: string | null;
}

interface BulkImportExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "import" | "export";
  content?: ContentRecord[];
}

export function BulkImportExport({ open, onOpenChange, mode, content }: BulkImportExportProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<ContentRecord[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<"add" | "replace">("add");

  const handleExport = () => {
    if (!content || content.length === 0) {
      toast.error("No content to export");
      return;
    }

    // Remove IDs for cleaner export
    const exportData = content.map(({ id, ...rest }) => rest);
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `page-content-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${content.length} entries`);
    onOpenChange(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportData(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error("File must contain an array of content entries");
      }

      // Validate structure
      const requiredFields = ["page_key", "section_key"];
      for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        for (const field of requiredFields) {
          if (!entry[field]) {
            throw new Error(`Entry ${i + 1} is missing required field: ${field}`);
          }
        }
      }

      setImportData(data);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Invalid JSON file");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!importData) throw new Error("No data to import");

      if (importMode === "replace") {
        // Get unique page_keys to replace
        const pageKeys = [...new Set(importData.map(d => d.page_key))];
        
        // Delete existing entries for these pages
        const { error: deleteError } = await supabase
          .from("page_content")
          .delete()
          .in("page_key", pageKeys);
        
        if (deleteError) throw deleteError;
      }

      // Prepare entries for insert
      const entries = importData.map(entry => ({
        page_key: entry.page_key,
        section_key: entry.section_key,
        content_type: entry.content_type || "text",
        title: entry.title || null,
        subtitle: entry.subtitle || null,
        body: entry.body || null,
        is_active: entry.is_active ?? true,
        sort_order: entry.sort_order || 0,
        country_code: entry.country_code || "us",
        state_id: entry.state_id || null,
        city_id: entry.city_id || null,
      }));

      // Insert in batches of 50
      const batchSize = 50;
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        const { error } = await supabase.from("page_content").insert(batch);
        if (error) throw error;
      }

      return entries.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      toast.success(`Imported ${count} entries successfully`);
      onOpenChange(false);
      setImportData(null);
    },
    onError: (error) => {
      toast.error("Import failed: " + error.message);
    },
  });

  if (mode === "export") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Content
            </DialogTitle>
            <DialogDescription>
              Download all content entries as a JSON file for backup or migration.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <FileJson className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">{content?.length || 0} entries ready to export</p>
              <p className="text-sm text-muted-foreground mt-1">
                Includes all fields except internal IDs
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={!content?.length}>
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Content
          </DialogTitle>
          <DialogDescription>
            Upload a JSON file to bulk import content entries.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Select JSON File</Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to select or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JSON files only
              </p>
            </div>
          </div>

          {/* Error Display */}
          {importError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {importData && (
            <div className="space-y-3">
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Found {importData.length} entries to import
                </AlertDescription>
              </Alert>

              {/* Import Mode */}
              <div className="space-y-2">
                <Label>Import Mode</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={importMode === "add" ? "default" : "outline"}
                    onClick={() => setImportMode("add")}
                    className="justify-start"
                  >
                    <Check className={`mr-2 h-4 w-4 ${importMode === "add" ? "opacity-100" : "opacity-0"}`} />
                    Add to existing
                  </Button>
                  <Button
                    variant={importMode === "replace" ? "default" : "outline"}
                    onClick={() => setImportMode("replace")}
                    className="justify-start"
                  >
                    <Check className={`mr-2 h-4 w-4 ${importMode === "replace" ? "opacity-100" : "opacity-0"}`} />
                    Replace pages
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {importMode === "add" 
                    ? "New entries will be added alongside existing content"
                    : "Existing content for imported page_keys will be replaced"}
                </p>
              </div>

              {/* Preview Table */}
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">Page Key</th>
                      <th className="text-left p-2 font-medium">Section</th>
                      <th className="text-left p-2 font-medium">Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.slice(0, 10).map((entry, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 font-mono text-xs">{entry.page_key}</td>
                        <td className="p-2">{entry.section_key}</td>
                        <td className="p-2 truncate max-w-32">{entry.title || "-"}</td>
                      </tr>
                    ))}
                    {importData.length > 10 && (
                      <tr className="border-t">
                        <td colSpan={3} className="p-2 text-center text-muted-foreground">
                          ... and {importData.length - 10} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { onOpenChange(false); setImportData(null); setImportError(null); }}>
            Cancel
          </Button>
          <Button
            onClick={() => importMutation.mutate()}
            disabled={!importData || importMutation.isPending}
          >
            {importMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Import {importData?.length || 0} Entries
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
