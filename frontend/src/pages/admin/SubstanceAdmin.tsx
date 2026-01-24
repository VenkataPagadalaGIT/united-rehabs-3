import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface SubstanceRecord {
  id: string;
  state_id: string;
  state_name: string;
  year: number;
  alcohol_use_disorder: number | null;
  opioid_use_disorder: number | null;
  fentanyl_deaths: number | null;
  cocaine_use_disorder: number | null;
  meth_use_disorder: number | null;
  marijuana_use_disorder: number | null;
}

const SubstanceAdmin = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SubstanceRecord | null>(null);
  const [formData, setFormData] = useState({
    state_id: "",
    state_name: "",
    year: new Date().getFullYear(),
    alcohol_use_disorder: "",
    opioid_use_disorder: "",
    fentanyl_deaths: "",
    cocaine_use_disorder: "",
    meth_use_disorder: "",
    marijuana_use_disorder: "",
  });

  const { data: substances, isLoading } = useQuery({
    queryKey: ["admin-substances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("substance_statistics")
        .select("*")
        .order("state_name")
        .order("year", { ascending: false });

      if (error) throw error;
      return data as SubstanceRecord[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { error } = await supabase.from("substance_statistics").insert([data as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-substances"] });
      toast.success("Record created successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create record: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SubstanceRecord> }) => {
      const { error } = await supabase.from("substance_statistics").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-substances"] });
      toast.success("Record updated successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update record: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("substance_statistics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-substances"] });
      toast.success("Record deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete record: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      state_id: "",
      state_name: "",
      year: new Date().getFullYear(),
      alcohol_use_disorder: "",
      opioid_use_disorder: "",
      fentanyl_deaths: "",
      cocaine_use_disorder: "",
      meth_use_disorder: "",
      marijuana_use_disorder: "",
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: SubstanceRecord) => {
    setEditingRecord(record);
    setFormData({
      state_id: record.state_id,
      state_name: record.state_name,
      year: record.year,
      alcohol_use_disorder: record.alcohol_use_disorder?.toString() || "",
      opioid_use_disorder: record.opioid_use_disorder?.toString() || "",
      fentanyl_deaths: record.fentanyl_deaths?.toString() || "",
      cocaine_use_disorder: record.cocaine_use_disorder?.toString() || "",
      meth_use_disorder: record.meth_use_disorder?.toString() || "",
      marijuana_use_disorder: record.marijuana_use_disorder?.toString() || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      state_id: formData.state_id,
      state_name: formData.state_name,
      year: formData.year,
      alcohol_use_disorder: formData.alcohol_use_disorder ? parseInt(formData.alcohol_use_disorder) : null,
      opioid_use_disorder: formData.opioid_use_disorder ? parseInt(formData.opioid_use_disorder) : null,
      fentanyl_deaths: formData.fentanyl_deaths ? parseInt(formData.fentanyl_deaths) : null,
      cocaine_use_disorder: formData.cocaine_use_disorder ? parseInt(formData.cocaine_use_disorder) : null,
      meth_use_disorder: formData.meth_use_disorder ? parseInt(formData.meth_use_disorder) : null,
      marijuana_use_disorder: formData.marijuana_use_disorder ? parseInt(formData.marijuana_use_disorder) : null,
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
          <p className="text-muted-foreground">
            Manage substance-specific statistics by state.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit Record" : "Add Record"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>State ID</Label>
                  <Input
                    value={formData.state_id}
                    onChange={(e) => setFormData({ ...formData, state_id: e.target.value })}
                    placeholder="CA"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>State Name</Label>
                  <Input
                    value={formData.state_name}
                    onChange={(e) => setFormData({ ...formData, state_name: e.target.value })}
                    placeholder="California"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Alcohol Use Disorder</Label>
                  <Input
                    type="number"
                    value={formData.alcohol_use_disorder}
                    onChange={(e) => setFormData({ ...formData, alcohol_use_disorder: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Opioid Use Disorder</Label>
                  <Input
                    type="number"
                    value={formData.opioid_use_disorder}
                    onChange={(e) => setFormData({ ...formData, opioid_use_disorder: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fentanyl Deaths</Label>
                  <Input
                    type="number"
                    value={formData.fentanyl_deaths}
                    onChange={(e) => setFormData({ ...formData, fentanyl_deaths: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cocaine Use Disorder</Label>
                  <Input
                    type="number"
                    value={formData.cocaine_use_disorder}
                    onChange={(e) => setFormData({ ...formData, cocaine_use_disorder: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meth Use Disorder</Label>
                  <Input
                    type="number"
                    value={formData.meth_use_disorder}
                    onChange={(e) => setFormData({ ...formData, meth_use_disorder: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marijuana Use Disorder</Label>
                  <Input
                    type="number"
                    value={formData.marijuana_use_disorder}
                    onChange={(e) => setFormData({ ...formData, marijuana_use_disorder: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
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
              <TableHead>Alcohol</TableHead>
              <TableHead>Opioid</TableHead>
              <TableHead>Fentanyl Deaths</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {substances?.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.state_name}</TableCell>
                <TableCell>{record.year}</TableCell>
                <TableCell>{record.alcohol_use_disorder?.toLocaleString() || "-"}</TableCell>
                <TableCell>{record.opioid_use_disorder?.toLocaleString() || "-"}</TableCell>
                <TableCell>{record.fentanyl_deaths?.toLocaleString() || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(record)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm("Delete this record?")) {
                          deleteMutation.mutate(record.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {substances?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No records yet. Click "Add Record" to create one.
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
