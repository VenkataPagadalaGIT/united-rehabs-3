import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataSourcesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";

interface DataSource {
  id: string;
  source_name: string;
  source_abbreviation: string;
  agency: string;
  source_url: string;
  description: string | null;
  data_types: string[] | null;
  last_updated_year: number | null;
}

const SourcesAdmin = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataSource | null>(null);
  const [formData, setFormData] = useState({
    source_name: "",
    source_abbreviation: "",
    agency: "",
    source_url: "",
    description: "",
    data_types: "",
    last_updated_year: new Date().getFullYear(),
  });

  const { data: sources, isLoading } = useQuery({
    queryKey: ["admin-sources"],
    queryFn: async () => {
      return await dataSourcesApi.getAll({ limit: 1000 });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await dataSourcesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sources"] });
      toast.success("Data source created successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to create data source: " + error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await dataSourcesApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sources"] });
      toast.success("Data source updated successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to update data source: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await dataSourcesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sources"] });
      toast.success("Data source deleted successfully");
    },
    onError: (error: any) => toast.error("Failed to delete data source: " + error.message),
  });

  const resetForm = () => {
    setFormData({
      source_name: "",
      source_abbreviation: "",
      agency: "",
      source_url: "",
      description: "",
      data_types: "",
      last_updated_year: new Date().getFullYear(),
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: DataSource) => {
    setEditingRecord(record);
    setFormData({
      source_name: record.source_name,
      source_abbreviation: record.source_abbreviation,
      agency: record.agency,
      source_url: record.source_url,
      description: record.description || "",
      data_types: record.data_types?.join(", ") || "",
      last_updated_year: record.last_updated_year || new Date().getFullYear(),
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      source_name: formData.source_name,
      source_abbreviation: formData.source_abbreviation,
      agency: formData.agency,
      source_url: formData.source_url,
      description: formData.description || null,
      data_types: formData.data_types ? formData.data_types.split(",").map(s => s.trim()) : null,
      last_updated_year: formData.last_updated_year,
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
          <h2 className="text-2xl font-bold">Data Sources</h2>
          <p className="text-muted-foreground">Manage official data sources and citations.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Source</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit Data Source" : "Add Data Source"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source Name</Label>
                  <Input value={formData.source_name} onChange={(e) => setFormData({ ...formData, source_name: e.target.value })} placeholder="National Survey on Drug Use and Health" required />
                </div>
                <div className="space-y-2">
                  <Label>Abbreviation</Label>
                  <Input value={formData.source_abbreviation} onChange={(e) => setFormData({ ...formData, source_abbreviation: e.target.value })} placeholder="NSDUH" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Agency</Label>
                <Input value={formData.agency} onChange={(e) => setFormData({ ...formData, agency: e.target.value })} placeholder="SAMHSA" required />
              </div>
              <div className="space-y-2">
                <Label>Source URL</Label>
                <Input value={formData.source_url} onChange={(e) => setFormData({ ...formData, source_url: e.target.value })} placeholder="https://" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Types (comma separated)</Label>
                  <Input value={formData.data_types} onChange={(e) => setFormData({ ...formData, data_types: e.target.value })} placeholder="overdose, treatment, prevalence" />
                </div>
                <div className="space-y-2">
                  <Label>Last Updated Year</Label>
                  <Input type="number" value={formData.last_updated_year} onChange={(e) => setFormData({ ...formData, last_updated_year: parseInt(e.target.value) })} />
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
              <TableHead>Source</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources?.map((record: DataSource) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{record.source_name}</div>
                    <div className="text-sm text-muted-foreground">{record.source_abbreviation}</div>
                  </div>
                </TableCell>
                <TableCell>{record.agency}</TableCell>
                <TableCell>{record.last_updated_year || "-"}</TableCell>
                <TableCell>
                  <a href={record.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <ExternalLink className="h-3 w-3" />
                    Link
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(record)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Delete this source?")) deleteMutation.mutate(record.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!sources || sources.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No data sources found. Add your first one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SourcesAdmin;
