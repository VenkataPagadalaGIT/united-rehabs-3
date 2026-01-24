import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { guidesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string | null;
  icon_name: string | null;
  read_time: string | null;
  is_active: boolean;
  sort_order: number;
}

const GuidesAdmin = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Guide | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    content: "",
    icon_name: "",
    read_time: "",
    is_active: true,
    sort_order: 0,
  });

  const { data: guides, isLoading } = useQuery({
    queryKey: ["admin-guides"],
    queryFn: async () => {
      return await guidesApi.getAll({ is_active: undefined, limit: 1000 });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await guidesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-guides"] });
      toast.success("Guide created successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to create guide: " + error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await guidesApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-guides"] });
      toast.success("Guide updated successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to update guide: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await guidesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-guides"] });
      toast.success("Guide deleted successfully");
    },
    onError: (error: any) => toast.error("Failed to delete guide: " + error.message),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      content: "",
      icon_name: "",
      read_time: "",
      is_active: true,
      sort_order: 0,
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: Guide) => {
    setEditingRecord(record);
    setFormData({
      title: record.title,
      description: record.description,
      category: record.category,
      content: record.content || "",
      icon_name: record.icon_name || "",
      read_time: record.read_time || "",
      is_active: record.is_active,
      sort_order: record.sort_order,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      content: formData.content || null,
      icon_name: formData.icon_name || null,
      read_time: formData.read_time || null,
      is_active: formData.is_active,
      sort_order: formData.sort_order,
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
          <h2 className="text-2xl font-bold">Rehab Guides</h2>
          <p className="text-muted-foreground">Manage rehab and treatment guides.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Guide</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit Guide" : "Add Guide"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Treatment, Recovery, etc." required />
                </div>
                <div className="space-y-2">
                  <Label>Read Time</Label>
                  <Input value={formData.read_time} onChange={(e) => setFormData({ ...formData, read_time: e.target.value })} placeholder="5 min read" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} placeholder="Full guide content..." />
              </div>
              <div className="space-y-2">
                <Label>Icon Name (Lucide icon)</Label>
                <Input value={formData.icon_name} onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })} placeholder="book-open" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                <Label>Active</Label>
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
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Read Time</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guides?.map((record: Guide) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.title}</TableCell>
                <TableCell>{record.category}</TableCell>
                <TableCell>{record.read_time || "-"}</TableCell>
                <TableCell>{record.is_active ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(record)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Delete this guide?")) deleteMutation.mutate(record.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!guides || guides.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No guides found. Add your first one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GuidesAdmin;
