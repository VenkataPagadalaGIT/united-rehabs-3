import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { substanceStatisticsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { ALL_STATES } from "@/data/allStates";

interface SubstanceRecord {
  id: string;
  state_id: string;
  state_name: string;
  year: number;
  alcohol_use_past_month_percent: number | null;
  opioid_use_disorder: number | null;
  marijuana_use_past_month: number | null;
  cocaine_use_past_year: number | null;
  meth_use_past_year: number | null;
}

const SubstanceAdmin = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SubstanceRecord | null>(null);
  const [formData, setFormData] = useState({
    state_id: "",
    state_name: "",
    year: new Date().getFullYear(),
    alcohol_use_past_month_percent: "",
    opioid_use_disorder: "",
    marijuana_use_past_month: "",
    cocaine_use_past_year: "",
    meth_use_past_year: "",
  });

  const { data: statistics, isLoading } = useQuery({
    queryKey: ["admin-substance-statistics"],
    queryFn: async () => {
      return await substanceStatisticsApi.getAll({ limit: 1000 });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await substanceStatisticsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-substance-statistics"] });
      toast.success("Record created successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to create record: " + error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await substanceStatisticsApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-substance-statistics"] });
      toast.success("Record updated successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to update record: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await substanceStatisticsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-substance-statistics"] });
      toast.success("Record deleted successfully");
    },
    onError: (error: any) => toast.error("Failed to delete record: " + error.message),
  });

  const resetForm = () => {
    setFormData({
      state_id: "",
      state_name: "",
      year: new Date().getFullYear(),
      alcohol_use_past_month_percent: "",
      opioid_use_disorder: "",
      marijuana_use_past_month: "",
      cocaine_use_past_year: "",
      meth_use_past_year: "",
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: SubstanceRecord) => {
    setEditingRecord(record);
    setFormData({
      state_id: record.state_id,
      state_name: record.state_name,
      year: record.year,
      alcohol_use_past_month_percent: record.alcohol_use_past_month_percent?.toString() || "",
      opioid_use_disorder: record.opioid_use_disorder?.toString() || "",
      marijuana_use_past_month: record.marijuana_use_past_month?.toString() || "",
      cocaine_use_past_year: record.cocaine_use_past_year?.toString() || "",
      meth_use_past_year: record.meth_use_past_year?.toString() || "",
    });
    setIsOpen(true);
  };

  const handleStateChange = (abbreviation: string) => {
    const state = ALL_STATES.find(s => s.abbreviation === abbreviation);
    if (state) {
      setFormData({
        ...formData,
        state_id: state.abbreviation,
        state_name: state.name,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      state_id: formData.state_id,
      state_name: formData.state_name,
      year: formData.year,
      alcohol_use_past_month_percent: formData.alcohol_use_past_month_percent ? parseFloat(formData.alcohol_use_past_month_percent) : null,
      opioid_use_disorder: formData.opioid_use_disorder ? parseInt(formData.opioid_use_disorder) : null,
      marijuana_use_past_month: formData.marijuana_use_past_month ? parseInt(formData.marijuana_use_past_month) : null,
      cocaine_use_past_year: formData.cocaine_use_past_year ? parseInt(formData.cocaine_use_past_year) : null,
      meth_use_past_year: formData.meth_use_past_year ? parseInt(formData.meth_use_past_year) : null,
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Substance Statistics</h2>
          <p className="text-muted-foreground">Manage detailed substance-specific statistics.</p>
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
                  <Label>State</Label>
                  <Select value={formData.state_id} onValueChange={handleStateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
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
                  <Label>Year</Label>
                  <Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label>Alcohol Use Past Month (%)</Label>
                  <Input type="number" step="0.1" value={formData.alcohol_use_past_month_percent} onChange={(e) => setFormData({ ...formData, alcohol_use_past_month_percent: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Opioid Use Disorder</Label>
                  <Input type="number" value={formData.opioid_use_disorder} onChange={(e) => setFormData({ ...formData, opioid_use_disorder: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Marijuana Use Past Month</Label>
                  <Input type="number" value={formData.marijuana_use_past_month} onChange={(e) => setFormData({ ...formData, marijuana_use_past_month: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Cocaine Use Past Year</Label>
                  <Input type="number" value={formData.cocaine_use_past_year} onChange={(e) => setFormData({ ...formData, cocaine_use_past_year: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Meth Use Past Year</Label>
                  <Input type="number" value={formData.meth_use_past_year} onChange={(e) => setFormData({ ...formData, meth_use_past_year: e.target.value })} />
                </div>
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>State</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Alcohol %</TableHead>
              <TableHead>Opioid Disorder</TableHead>
              <TableHead>Marijuana</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statistics?.map((record: SubstanceRecord) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.state_name}</TableCell>
                <TableCell>{record.year}</TableCell>
                <TableCell>{record.alcohol_use_past_month_percent?.toFixed(1) || "-"}%</TableCell>
                <TableCell>{record.opioid_use_disorder?.toLocaleString() || "-"}</TableCell>
                <TableCell>{record.marijuana_use_past_month?.toLocaleString() || "-"}</TableCell>
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
            {(!statistics || statistics.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No substance statistics found. Add your first record!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SubstanceAdmin;
