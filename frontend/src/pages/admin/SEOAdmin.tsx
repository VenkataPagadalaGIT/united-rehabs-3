import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pageSeoApi } from "@/lib/api";
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

interface PageSEO {
  id: string;
  page_slug: string;
  page_type: string;
  meta_title: string;
  meta_description: string | null;
  h1_title: string | null;
  intro_text: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  state_id: string | null;
  is_active: boolean;
}

const pageTypes = ["state", "city", "treatment", "article", "home", "category"];

const SEOAdmin = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PageSEO | null>(null);
  const [formData, setFormData] = useState({
    page_slug: "",
    page_type: "state",
    meta_title: "",
    meta_description: "",
    h1_title: "",
    intro_text: "",
    og_title: "",
    og_description: "",
    og_image_url: "",
    canonical_url: "",
    state_id: "",
    is_active: true,
  });

  const { data: seoRecords, isLoading } = useQuery({
    queryKey: ["admin-page-seo"],
    queryFn: async () => {
      return await pageSeoApi.getAll({ is_active: undefined, limit: 1000 });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await pageSeoApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-page-seo"] });
      toast.success("SEO record created successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to create SEO record: " + error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await pageSeoApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-page-seo"] });
      toast.success("SEO record updated successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to update SEO record: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await pageSeoApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-page-seo"] });
      toast.success("SEO record deleted successfully");
    },
    onError: (error: any) => toast.error("Failed to delete SEO record: " + error.message),
  });

  const resetForm = () => {
    setFormData({
      page_slug: "",
      page_type: "state",
      meta_title: "",
      meta_description: "",
      h1_title: "",
      intro_text: "",
      og_title: "",
      og_description: "",
      og_image_url: "",
      canonical_url: "",
      state_id: "",
      is_active: true,
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: PageSEO) => {
    setEditingRecord(record);
    setFormData({
      page_slug: record.page_slug,
      page_type: record.page_type,
      meta_title: record.meta_title,
      meta_description: record.meta_description || "",
      h1_title: record.h1_title || "",
      intro_text: record.intro_text || "",
      og_title: record.og_title || "",
      og_description: record.og_description || "",
      og_image_url: record.og_image_url || "",
      canonical_url: record.canonical_url || "",
      state_id: record.state_id || "",
      is_active: record.is_active,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      page_slug: formData.page_slug,
      page_type: formData.page_type,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description || null,
      h1_title: formData.h1_title || null,
      intro_text: formData.intro_text || null,
      og_title: formData.og_title || null,
      og_description: formData.og_description || null,
      og_image_url: formData.og_image_url || null,
      canonical_url: formData.canonical_url || null,
      state_id: formData.state_id || null,
      is_active: formData.is_active,
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
          <h2 className="text-2xl font-bold">Page SEO</h2>
          <p className="text-muted-foreground">Manage SEO metadata for pages.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add SEO Record</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit SEO" : "Add SEO"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Page Slug</Label>
                  <Input value={formData.page_slug} onChange={(e) => setFormData({ ...formData, page_slug: e.target.value })} placeholder="/california" required />
                </div>
                <div className="space-y-2">
                  <Label>Page Type</Label>
                  <Select value={formData.page_type} onValueChange={(value) => setFormData({ ...formData, page_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input value={formData.meta_title} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>H1 Title</Label>
                  <Input value={formData.h1_title} onChange={(e) => setFormData({ ...formData, h1_title: e.target.value })} />
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
                <Label>Intro Text</Label>
                <Textarea value={formData.intro_text} onChange={(e) => setFormData({ ...formData, intro_text: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>OG Title</Label>
                  <Input value={formData.og_title} onChange={(e) => setFormData({ ...formData, og_title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>OG Image URL</Label>
                  <Input value={formData.og_image_url} onChange={(e) => setFormData({ ...formData, og_image_url: e.target.value })} />
                </div>
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
              <TableHead>Page Slug</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Meta Title</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seoRecords?.map((record: PageSEO) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.page_slug}</TableCell>
                <TableCell className="capitalize">{record.page_type}</TableCell>
                <TableCell className="max-w-xs truncate">{record.meta_title}</TableCell>
                <TableCell>{record.is_active ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(record)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Delete this SEO record?")) deleteMutation.mutate(record.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!seoRecords || seoRecords.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No SEO records found. Add your first one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SEOAdmin;
