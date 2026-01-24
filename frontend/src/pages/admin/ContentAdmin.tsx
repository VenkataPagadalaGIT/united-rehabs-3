import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pageContentApi } from "@/lib/api";
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

interface PageContent {
  id: string;
  page_key: string;
  section_key: string;
  content_type: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  state_id: string | null;
  is_active: boolean;
  sort_order: number;
}

const contentTypes = ["text", "html", "json"];

const ContentAdmin = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PageContent | null>(null);
  const [formData, setFormData] = useState({
    page_key: "",
    section_key: "",
    content_type: "text",
    title: "",
    subtitle: "",
    body: "",
    state_id: "",
    is_active: true,
    sort_order: 0,
  });

  const { data: contents, isLoading } = useQuery({
    queryKey: ["admin-page-content"],
    queryFn: async () => {
      return await pageContentApi.getAll({ is_active: undefined, limit: 1000 });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await pageContentApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-page-content"] });
      toast.success("Content created successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to create content: " + error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await pageContentApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-page-content"] });
      toast.success("Content updated successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to update content: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await pageContentApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-page-content"] });
      toast.success("Content deleted successfully");
    },
    onError: (error: any) => toast.error("Failed to delete content: " + error.message),
  });

  const resetForm = () => {
    setFormData({
      page_key: "",
      section_key: "",
      content_type: "text",
      title: "",
      subtitle: "",
      body: "",
      state_id: "",
      is_active: true,
      sort_order: 0,
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: PageContent) => {
    setEditingRecord(record);
    setFormData({
      page_key: record.page_key,
      section_key: record.section_key,
      content_type: record.content_type,
      title: record.title || "",
      subtitle: record.subtitle || "",
      body: record.body || "",
      state_id: record.state_id || "",
      is_active: record.is_active,
      sort_order: record.sort_order,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      page_key: formData.page_key,
      section_key: formData.section_key,
      content_type: formData.content_type,
      title: formData.title || null,
      subtitle: formData.subtitle || null,
      body: formData.body || null,
      state_id: formData.state_id || null,
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
          <h2 className="text-2xl font-bold">Page Content</h2>
          <p className="text-muted-foreground">Manage dynamic page content.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Content</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit Content" : "Add Content"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Page Key</Label>
                  <Input value={formData.page_key} onChange={(e) => setFormData({ ...formData, page_key: e.target.value })} placeholder="home, state, about" required />
                </div>
                <div className="space-y-2">
                  <Label>Section Key</Label>
                  <Input value={formData.section_key} onChange={(e) => setFormData({ ...formData, section_key: e.target.value })} placeholder="hero, features, cta" required />
                </div>
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={formData.content_type} onValueChange={(value) => setFormData({ ...formData, content_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
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
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows={6} />
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
              <TableHead>Page / Section</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contents?.map((record: PageContent) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.page_key} / {record.section_key}</TableCell>
                <TableCell className="max-w-xs truncate">{record.title || "-"}</TableCell>
                <TableCell>{record.content_type}</TableCell>
                <TableCell>{record.is_active ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(record)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Delete this content?")) deleteMutation.mutate(record.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!contents || contents.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No content found. Add your first record!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ContentAdmin;
