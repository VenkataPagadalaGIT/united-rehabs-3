import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { faqsApi } from "@/lib/api";
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

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  state_id: string | null;
  is_active: boolean;
  sort_order: number;
}

const FAQsAdmin = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    state_id: "",
    is_active: true,
    sort_order: 0,
  });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      return await faqsApi.getAll({ is_active: undefined, limit: 1000 });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await faqsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success("FAQ created successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to create FAQ: " + error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await faqsApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success("FAQ updated successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error("Failed to update FAQ: " + error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await faqsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success("FAQ deleted successfully");
    },
    onError: (error: any) => toast.error("Failed to delete FAQ: " + error.message),
  });

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      category: "",
      state_id: "",
      is_active: true,
      sort_order: 0,
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: FAQ) => {
    setEditingRecord(record);
    setFormData({
      question: record.question,
      answer: record.answer,
      category: record.category || "",
      state_id: record.state_id || "",
      is_active: record.is_active,
      sort_order: record.sort_order,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      question: formData.question,
      answer: formData.answer,
      category: formData.category || null,
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
          <h2 className="text-2xl font-bold">FAQs</h2>
          <p className="text-muted-foreground">Manage frequently asked questions.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add FAQ</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} rows={4} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="General" />
                </div>
                <div className="space-y-2">
                  <Label>State (optional)</Label>
                  <Select value={formData.state_id} onValueChange={(value) => setFormData({ ...formData, state_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All states" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All states</SelectItem>
                      {ALL_STATES.map((state) => (
                        <SelectItem key={state.abbreviation} value={state.abbreviation}>{state.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs?.map((record: FAQ) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium max-w-md truncate">{record.question}</TableCell>
                <TableCell>{record.category || "-"}</TableCell>
                <TableCell>{record.state_id || "All"}</TableCell>
                <TableCell>{record.is_active ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(record)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Delete this FAQ?")) deleteMutation.mutate(record.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!faqs || faqs.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No FAQs found. Add your first one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FAQsAdmin;
