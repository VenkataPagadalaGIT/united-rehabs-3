import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface ContentRecord {
  id: string;
  page_key: string;
  section_key: string;
  content_type: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  is_active: boolean | null;
  sort_order: number | null;
}

const ContentAdmin = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ContentRecord | null>(null);
  const [formData, setFormData] = useState({
    page_key: "",
    section_key: "",
    content_type: "text",
    title: "",
    subtitle: "",
    body: "",
    is_active: true,
    sort_order: 0,
  });

  const { data: content, isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .order("page_key")
        .order("sort_order");

      if (error) throw error;
      return data as ContentRecord[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { error } = await supabase.from("page_content").insert([data as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      toast.success("Content created successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create content: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContentRecord> }) => {
      const { error } = await supabase.from("page_content").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      toast.success("Content updated successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update content: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("page_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      toast.success("Content deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete content: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      page_key: "",
      section_key: "",
      content_type: "text",
      title: "",
      subtitle: "",
      body: "",
      is_active: true,
      sort_order: 0,
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: ContentRecord) => {
    setEditingRecord(record);
    setFormData({
      page_key: record.page_key,
      section_key: record.section_key,
      content_type: record.content_type,
      title: record.title || "",
      subtitle: record.subtitle || "",
      body: record.body || "",
      is_active: record.is_active ?? true,
      sort_order: record.sort_order || 0,
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
          <p className="text-muted-foreground">
            Manage editable page content (hero text, headings, etc.).
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit Content" : "Add Content"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Page Key</Label>
                  <Input
                    value={formData.page_key}
                    onChange={(e) => setFormData({ ...formData, page_key: e.target.value })}
                    placeholder="home_hero"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Section Key</Label>
                  <Input
                    value={formData.section_key}
                    onChange={(e) => setFormData({ ...formData, section_key: e.target.value })}
                    placeholder="hero"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Input
                    value={formData.content_type}
                    onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                    placeholder="text"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Find the Best Rehab Centers"
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Your recovery journey starts here"
                />
              </div>
              <div className="space-y-2">
                <Label>Body Content</Label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Full body text..."
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
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
              <TableHead>Page Key</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content?.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.page_key}</TableCell>
                <TableCell>{record.section_key}</TableCell>
                <TableCell className="max-w-32 truncate">{record.title || "-"}</TableCell>
                <TableCell>{record.content_type}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${record.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {record.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
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
                        if (confirm("Delete this content?")) {
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
            {content?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No content yet. Click "Add Content" to create page content.
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
