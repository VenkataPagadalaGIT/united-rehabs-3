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
  year: number;
  verified: boolean;
  changes: Record<string, { old: number | null; new: number }>;
  sources: string[];
  error?: string;
}

const StatisticsAdmin = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StatRecord | null>(null);
  const [verifyResults, setVerifyResults] = useState<VerifyResult[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
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

  // QA Verification handler
  const handleVerifyData = async () => {
    if (!selectedVerifyState) {
      toast.error("Please select a state to verify");
      return;
    }
    
    setIsVerifying(true);
    setVerifyResults([]);
    
    try {
      const stateInfo = ALL_STATES.find(s => s.abbreviation === selectedVerifyState);
      if (!stateInfo) throw new Error("State not found");

      const { data, error } = await supabase.functions.invoke("verify-state-data", {
        body: {
          stateName: stateInfo.name,
          stateAbbreviation: stateInfo.abbreviation,
          year: parseInt(selectedVerifyYear)
        }
      });

      if (error) throw error;

      if (data?.success && data.results) {
        setVerifyResults(data.results);
        const result = data.results[0];
        if (result.verified) {
          toast.success(`${stateInfo.name} ${selectedVerifyYear} data verified - no changes needed`);
        } else if (result.changes && Object.keys(result.changes).length > 0) {
          toast.success(`Updated ${Object.keys(result.changes).length} fields for ${stateInfo.name} ${selectedVerifyYear}`);
          queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
        } else if (result.error) {
          toast.error(`Verification failed: ${result.error}`);
        }
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      toast.error("Verification failed: " + (err.message || "Unknown error"));
    } finally {
      setIsVerifying(false);
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
          <Badge variant="outline" className="ml-2">CDC/SAMHSA</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Verify and correct state data using official CDC WONDER and SAMHSA sources for 100% accuracy.
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">State</Label>
            <Select value={selectedVerifyState} onValueChange={setSelectedVerifyState}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {ALL_STATES.map((state) => (
                  <SelectItem key={state.abbreviation} value={state.abbreviation}>{state.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Year</Label>
            <Select value={selectedVerifyYear} onValueChange={setSelectedVerifyYear}>
              <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2023, 2022, 2021, 2020, 2019].map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleVerifyData} disabled={isVerifying || !selectedVerifyState} variant="secondary">
            {isVerifying ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>) : (<><ShieldCheck className="mr-2 h-4 w-4" />Verify & Fix Data</>)}
          </Button>
        </div>

        {verifyResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {verifyResults.map((result, idx) => (
              <Alert key={idx} className={result.verified ? "border-green-500/50 bg-green-500/10" : result.error ? "border-red-500/50 bg-red-500/10" : "border-amber-500/50 bg-amber-500/10"}>
                {result.verified ? <ShieldCheck className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                <AlertDescription className="text-sm">
                  <strong>{result.state} ({result.year}):</strong>{" "}
                  {result.verified ? "All data verified - no corrections needed" : result.error ? (
                    <span className="text-red-600">{result.error}</span>
                  ) : (
                    <>
                      Corrected {Object.keys(result.changes || {}).length} field(s):
                      <ul className="mt-1 ml-4 list-disc text-xs">
                        {Object.entries(result.changes || {}).map(([field, change]) => (
                          <li key={field}>{field}: {change.old?.toLocaleString() || 'N/A'} → <strong>{change.new.toLocaleString()}</strong></li>
                        ))}
                      </ul>
                      {result.sources?.length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground">Sources: {result.sources.slice(0, 2).join(", ")}</div>
                      )}
                    </>
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
