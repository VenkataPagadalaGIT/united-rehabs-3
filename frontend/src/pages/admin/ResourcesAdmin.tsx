import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourcesApi } from "@/lib/api";
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

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  is_free: boolean;
  is_nationwide: boolean;
  featured: boolean;
  state_id: string | null;
  sort_order: number;
}

const resourceTypes = [
  "government_program",
  "hotline",
  "support_group",
  "treatment_locator",
  "crisis_center",
  "sliding_scale",
  "other"
];

const ResourcesAdmin = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resource_type: "government_program",
    phone: "",
    website: "",
    address: "",
    is_free: true,
    is_nationwide: false,
    featured: false,
    state_id: "",
    sort_order: 0,
  });

  const { data: resources, isLoading } = useQuery({
    queryKey: ["admin-resources"],
    queryFn: async () => {
      return await resourcesApi.getAll({ limit: 1000 });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await resourcesApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      toast.success("Resource created successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to create resource: " + error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await resourcesApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      toast.success("Resource updated successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to update resource: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await resourcesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      toast.success("Resource deleted successfully");
    },
    onError: (error: any) => toast.error("Failed to delete resource: " + error.message),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      resource_type: "government_program",
      phone: "",
      website: "",
      address: "",
      is_free: true,
      is_nationwide: false,
      featured: false,
      state_id: "",
      sort_order: 0,
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: Resource) => {
    setEditingRecord(record);
    setFormData({
      title: record.title,
      description: record.description || "",
      resource_type: record.resource_type,
      phone: record.phone || "",
      website: record.website || "",
      address: record.address || "",
      is_free: record.is_free,
      is_nationwide: record.is_nationwide,
      featured: record.featured,
      state_id: record.state_id || "",
      sort_order: record.sort_order,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: formData.title,
      description: formData.description || null,
      resource_type: formData.resource_type,
      phone: formData.phone || null,
      website: formData.website || null,
      address: formData.address || null,
      is_free: formData.is_free,
      is_nationwide: formData.is_nationwide,
      featured: formData.featured,
      state_id: formData.state_id || null,
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
          <h2 className="text-2xl font-bold">Free Resources</h2>
          <p className="text-muted-foreground">Manage free treatment resources.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Resource</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit Resource" : "Add Resource"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Resource Type</Label>
                  <Select value={formData.resource_type} onValueChange={(value) => setFormData({ ...formData, resource_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>State (optional)</Label>
                  <Select value={formData.state_id} onValueChange={(value) => setFormData({ ...formData, state_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {ALL_STATES.map((state) => (
                        <SelectItem key={state.abbreviation} value={state.abbreviation}>{state.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="1-800-XXX-XXXX" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_free} onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })} />
                  <Label>Free</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_nationwide} onCheckedChange={(checked) => setFormData({ ...formData, is_nationwide: checked })} />
                  <Label>Nationwide</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.featured} onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })} />
                  <Label>Featured</Label>
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
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Nationwide</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources?.map((record: Resource) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium max-w-md truncate">{record.title}</TableCell>
                <TableCell className="capitalize">{record.resource_type.replace(/_/g, " ")}</TableCell>
                <TableCell>{record.phone || "-"}</TableCell>
                <TableCell>{record.is_nationwide ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(record)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Delete this resource?")) deleteMutation.mutate(record.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!resources || resources.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No resources found. Add your first one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ResourcesAdmin;
