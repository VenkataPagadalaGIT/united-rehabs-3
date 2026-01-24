import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { ALL_STATES } from "@/data/allStates";

interface StatRecord {
  id: string;
  state_id: string;
  state_name: string;
  year: number;
  total_affected: number | null;
  overdose_deaths: number | null;
  opioid_deaths: number | null;
  treatment_admissions: number | null;
  recovery_rate: number | null;
  data_source: string | null;
}

interface VerifyResult {
  state: string;
  year?: number;
  verified?: boolean;
  changes?: Record<string, { old: number | null; new: number }>;
  sources?: string[];
  error?: string;
  recordsUpdated?: number;
  errors?: string[];
}

interface BatchResult {
  success: boolean;
  mode: string;
  statesProcessed: number;
  totalRecordsUpdated: number;
  apiCallsMade: number;
  results: VerifyResult[];
  errors: string[];
}

const StatisticsAdmin = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StatRecord | null>(null);
  const [verifyResults, setVerifyResults] = useState<VerifyResult[]>([]);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBatchVerifying, setIsBatchVerifying] = useState(false);
  const [selectedVerifyState, setSelectedVerifyState] = useState<string>("");
  const [selectedVerifyYear, setSelectedVerifyYear] = useState<string>("2023");
  const [formData, setFormData] = useState({
    state_id: "",
    state_name: "",
    year: new Date().getFullYear(),
    total_affected: "",
    overdose_deaths: "",
    opioid_deaths: "",
    treatment_admissions: "",
    recovery_rate: "",
    data_source: "",
  });

  const { data: statistics, isLoading } = useQuery({
    queryKey: ["admin-statistics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("state_addiction_statistics")
        .select("*")
        .order("state_name")
        .order("year", { ascending: false });

      if (error) throw error;
      return data as StatRecord[];
    },
  });

  // QA Verification handler - single state
  const handleVerifyData = async () => {
    if (!selectedVerifyState) {
      toast.error("Please select a state to verify");
      return;
    }
    
    setIsVerifying(true);
    setVerifyResults([]);
    setBatchResult(null);
    
    try {
      const stateInfo = ALL_STATES.find(s => s.abbreviation === selectedVerifyState);
      if (!stateInfo) throw new Error("State not found");

      const { data, error } = await supabase.functions.invoke("verify-state-data", {
        body: {
          stateName: stateInfo.name,
          stateAbbreviation: stateInfo.abbreviation
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Verified ${stateInfo.name}: ${data.recordsUpdated} records updated using 1 API call`);
        queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
        setVerifyResults([{
          state: stateInfo.name,
          recordsUpdated: data.recordsUpdated,
          errors: data.errors
        }]);
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      toast.error("Verification failed: " + (err.message || "Unknown error"));
    } finally {
      setIsVerifying(false);
    }
  };

  // BATCH: Verify ALL states with minimal API calls (50 total)
  const handleBatchVerifyAll = async () => {
    if (!confirm("This will verify ALL 50 states using 50 API calls (1 per state). This may take 2-3 minutes. Continue?")) {
      return;
    }
    
    setIsBatchVerifying(true);
    setVerifyResults([]);
    setBatchResult(null);
    
    try {
      toast.info("Starting batch verification for all 50 states...");
      
      const { data, error } = await supabase.functions.invoke("verify-state-data", {
        body: { batchAll: true }
      });

      if (error) throw error;

      if (data?.success) {
        setBatchResult(data);
        toast.success(`Batch complete! Updated ${data.totalRecordsUpdated} records across ${data.statesProcessed} states using only ${data.apiCallsMade} API calls`);
        queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
      }
    } catch (err: any) {
      console.error("Batch verification error:", err);
      toast.error("Batch verification failed: " + (err.message || "Unknown error"));
    } finally {
      setIsBatchVerifying(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { error } = await supabase.from("state_addiction_statistics").insert([data as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
      toast.success("Record created successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => toast.error("Failed to create record: " + error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StatRecord> }) => {
      const { error } = await supabase.from("state_addiction_statistics").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
      toast.success("Record updated successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => toast.error("Failed to update record: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("state_addiction_statistics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
      toast.success("Record deleted successfully");
    },
    onError: (error) => toast.error("Failed to delete record: " + error.message),
  });

  const resetForm = () => {
    setFormData({
      state_id: "",
      state_name: "",
      year: new Date().getFullYear(),
      total_affected: "",
      overdose_deaths: "",
      opioid_deaths: "",
      treatment_admissions: "",
      recovery_rate: "",
      data_source: "",
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: StatRecord) => {
    setEditingRecord(record);
    setFormData({
      state_id: record.state_id,
      state_name: record.state_name,
      year: record.year,
      total_affected: record.total_affected?.toString() || "",
      overdose_deaths: record.overdose_deaths?.toString() || "",
      opioid_deaths: record.opioid_deaths?.toString() || "",
      treatment_admissions: record.treatment_admissions?.toString() || "",
      recovery_rate: record.recovery_rate?.toString() || "",
      data_source: record.data_source || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      state_id: formData.state_id,
      state_name: formData.state_name,
      year: formData.year,
      total_affected: formData.total_affected ? parseInt(formData.total_affected) : null,
      overdose_deaths: formData.overdose_deaths ? parseInt(formData.overdose_deaths) : null,
      opioid_deaths: formData.opioid_deaths ? parseInt(formData.opioid_deaths) : null,
      treatment_admissions: formData.treatment_admissions ? parseInt(formData.treatment_admissions) : null,
      recovery_rate: formData.recovery_rate ? parseFloat(formData.recovery_rate) : null,
      data_source: formData.data_source || null,
    };
    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">State Addiction Statistics</h2>
          <p className="text-muted-foreground">Manage and verify addiction statistics by state and year.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Record</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit Statistics" : "Add Statistics"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>State ID</Label>
                  <Input value={formData.state_id} onChange={(e) => setFormData({ ...formData, state_id: e.target.value })} placeholder="CA" required />
                </div>
                <div className="space-y-2">
                  <Label>State Name</Label>
                  <Input value={formData.state_name} onChange={(e) => setFormData({ ...formData, state_name: e.target.value })} placeholder="California" required />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label>Total Affected</Label>
                  <Input type="number" value={formData.total_affected} onChange={(e) => setFormData({ ...formData, total_affected: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Overdose Deaths</Label>
                  <Input type="number" value={formData.overdose_deaths} onChange={(e) => setFormData({ ...formData, overdose_deaths: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Opioid Deaths</Label>
                  <Input type="number" value={formData.opioid_deaths} onChange={(e) => setFormData({ ...formData, opioid_deaths: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Treatment Admissions</Label>
                  <Input type="number" value={formData.treatment_admissions} onChange={(e) => setFormData({ ...formData, treatment_admissions: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Recovery Rate (%)</Label>
                  <Input type="number" step="0.1" value={formData.recovery_rate} onChange={(e) => setFormData({ ...formData, recovery_rate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data Source</Label>
                <Input value={formData.data_source} onChange={(e) => setFormData({ ...formData, data_source: e.target.value })} placeholder="CDC, SAMHSA" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingRecord ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* QA Verification Section */}
      <div className="bg-muted/50 border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">QA Data Verification</h3>
          <Badge variant="outline" className="ml-2">CDC WONDER</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Verify and correct data using official CDC WONDER sources. Single state = 1 API call. All states = 50 API calls.
        </p>
        
        {/* Single State Verification */}
        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div className="space-y-1">
            <Label className="text-xs">Single State</Label>
            <Select value={selectedVerifyState} onValueChange={setSelectedVerifyState}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {ALL_STATES.map((state) => (
                  <SelectItem key={state.abbreviation} value={state.abbreviation}>{state.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleVerifyData} disabled={isVerifying || isBatchVerifying || !selectedVerifyState} variant="secondary">
            {isVerifying ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>) : (<><ShieldCheck className="mr-2 h-4 w-4" />Verify State (1 API call)</>)}
          </Button>
          
          <div className="border-l pl-4 ml-2">
            <Button onClick={handleBatchVerifyAll} disabled={isVerifying || isBatchVerifying} variant="default" className="bg-green-600 hover:bg-green-700">
              {isBatchVerifying ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing all states...</>) : (<><ShieldCheck className="mr-2 h-4 w-4" />Verify ALL 50 States (50 API calls)</>)}
            </Button>
          </div>
        </div>

        {/* Batch Results */}
        {batchResult && (
          <Alert className="border-green-500/50 bg-green-500/10 mb-4">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm">
              <strong>Batch Complete!</strong> Processed {batchResult.statesProcessed} states using only {batchResult.apiCallsMade} API calls.
              Updated {batchResult.totalRecordsUpdated} records total.
              {batchResult.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-amber-600">{batchResult.errors.length} errors occurred</summary>
                  <ul className="mt-1 ml-4 list-disc text-xs text-red-600 max-h-32 overflow-auto">
                    {batchResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Single State Results */}
        {verifyResults.length > 0 && !batchResult && (
          <div className="mt-4 space-y-2">
            {verifyResults.map((result, idx) => (
              <Alert key={idx} className={result.error ? "border-red-500/50 bg-red-500/10" : "border-green-500/50 bg-green-500/10"}>
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm">
                  <strong>{result.state}:</strong>{" "}
                  {result.error ? (
                    <span className="text-red-600">{result.error}</span>
                  ) : (
                    <>Updated {result.recordsUpdated} records (years 2015-2023) using CDC WONDER data</>
                  )}
                  {result.errors && result.errors.length > 0 && (
                    <ul className="mt-1 ml-4 list-disc text-xs text-amber-600">
                      {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>State</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Affected</TableHead>
              <TableHead>Overdose Deaths</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statistics?.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.state_name}</TableCell>
                <TableCell>{record.year}</TableCell>
                <TableCell>{record.total_affected?.toLocaleString() || "-"}</TableCell>
                <TableCell>{record.overdose_deaths?.toLocaleString() || "-"}</TableCell>
                <TableCell className="max-w-32 truncate">
                  {record.data_source?.includes("Verified") ? (
                    <Badge variant="outline" className="text-green-600 border-green-500/50">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      {record.data_source}
                    </Badge>
                  ) : record.data_source || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(record)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Delete this record?")) deleteMutation.mutate(record.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StatisticsAdmin;
