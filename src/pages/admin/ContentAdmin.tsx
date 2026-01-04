import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { PageTemplateGenerator } from "@/components/admin/PageTemplateGenerator";
import { BulkImportExport } from "@/components/admin/BulkImportExport";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search, Filter, X, Wand2, Download, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  country_code: string | null;
  state_id: string | null;
  city_id: string | null;
}

// Extensible location data - add more as you expand
const COUNTRIES = [
  { code: "us", name: "United States" },
  { code: "ca", name: "Canada" },
  { code: "uk", name: "United Kingdom" },
  { code: "au", name: "Australia" },
];

const STATES: Record<string, { id: string; name: string }[]> = {
  us: [
    { id: "ca", name: "California" },
    { id: "tx", name: "Texas" },
    { id: "fl", name: "Florida" },
    { id: "ny", name: "New York" },
    { id: "il", name: "Illinois" },
    { id: "pa", name: "Pennsylvania" },
    { id: "oh", name: "Ohio" },
    { id: "ga", name: "Georgia" },
    { id: "nc", name: "North Carolina" },
    { id: "mi", name: "Michigan" },
  ],
  ca: [
    { id: "on", name: "Ontario" },
    { id: "bc", name: "British Columbia" },
    { id: "ab", name: "Alberta" },
    { id: "qc", name: "Quebec" },
  ],
  uk: [
    { id: "eng", name: "England" },
    { id: "sco", name: "Scotland" },
    { id: "wal", name: "Wales" },
  ],
  au: [
    { id: "nsw", name: "New South Wales" },
    { id: "vic", name: "Victoria" },
    { id: "qld", name: "Queensland" },
  ],
};

// Example cities - expand as needed
const CITIES: Record<string, { id: string; name: string }[]> = {
  ca: [
    { id: "los-angeles", name: "Los Angeles" },
    { id: "san-francisco", name: "San Francisco" },
    { id: "san-diego", name: "San Diego" },
    { id: "sacramento", name: "Sacramento" },
  ],
  tx: [
    { id: "houston", name: "Houston" },
    { id: "dallas", name: "Dallas" },
    { id: "austin", name: "Austin" },
    { id: "san-antonio", name: "San Antonio" },
  ],
  fl: [
    { id: "miami", name: "Miami" },
    { id: "orlando", name: "Orlando" },
    { id: "tampa", name: "Tampa" },
  ],
  ny: [
    { id: "new-york-city", name: "New York City" },
    { id: "buffalo", name: "Buffalo" },
    { id: "albany", name: "Albany" },
  ],
};

const ContentAdmin = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ContentRecord | null>(null);
  
  // Dialog states for new features
  const [showTemplateGenerator, setShowTemplateGenerator] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterState, setFilterState] = useState<string>("all");
  const [filterCity, setFilterCity] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    page_key: "",
    section_key: "",
    content_type: "text",
    title: "",
    subtitle: "",
    body: "",
    is_active: true,
    sort_order: 0,
    country_code: "us",
    state_id: "",
    city_id: "",
  });

  const { data: content, isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .order("country_code")
        .order("state_id")
        .order("page_key")
        .order("sort_order");

      if (error) throw error;
      return data as ContentRecord[];
    },
  });

  // Filter logic
  const filteredContent = useMemo(() => {
    if (!content) return [];
    
    return content.filter((record) => {
      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const matchesSearch = 
          record.page_key.toLowerCase().includes(search) ||
          record.section_key.toLowerCase().includes(search) ||
          record.title?.toLowerCase().includes(search) ||
          record.body?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }
      
      // Country filter
      if (filterCountry !== "all" && record.country_code !== filterCountry) {
        return false;
      }
      
      // State filter
      if (filterState !== "all" && record.state_id !== filterState) {
        return false;
      }
      
      // City filter
      if (filterCity !== "all" && record.city_id !== filterCity) {
        return false;
      }
      
      return true;
    });
  }, [content, searchQuery, filterCountry, filterState, filterCity]);

  // Get available states based on selected filter country
  const availableFilterStates = useMemo(() => {
    if (filterCountry === "all") {
      // Get all unique states from content
      const states = new Set<string>();
      content?.forEach(r => { if (r.state_id) states.add(r.state_id); });
      return Array.from(states).map(id => ({ id, name: id.toUpperCase() }));
    }
    return STATES[filterCountry] || [];
  }, [filterCountry, content]);

  // Get available cities based on selected filter state
  const availableFilterCities = useMemo(() => {
    if (filterState === "all") return [];
    return CITIES[filterState] || [];
  }, [filterState]);

  // Get states for form based on selected country
  const formStates = useMemo(() => {
    return STATES[formData.country_code] || [];
  }, [formData.country_code]);

  // Get cities for form based on selected state
  const formCities = useMemo(() => {
    return CITIES[formData.state_id] || [];
  }, [formData.state_id]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCountry("all");
    setFilterState("all");
    setFilterCity("all");
  };

  const hasActiveFilters = searchQuery || filterCountry !== "all" || filterState !== "all" || filterCity !== "all";

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
      country_code: "us",
      state_id: "",
      city_id: "",
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
      country_code: record.country_code || "us",
      state_id: record.state_id || "",
      city_id: record.city_id || "",
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
      country_code: formData.country_code || null,
      state_id: formData.state_id || null,
      city_id: formData.city_id || null,
    };

    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getLocationLabel = (record: ContentRecord) => {
    const parts: string[] = [];
    if (record.country_code) {
      const country = COUNTRIES.find(c => c.code === record.country_code);
      parts.push(country?.name || record.country_code.toUpperCase());
    }
    if (record.state_id) {
      const stateList = STATES[record.country_code || "us"] || [];
      const state = stateList.find(s => s.id === record.state_id);
      parts.push(state?.name || record.state_id.toUpperCase());
    }
    if (record.city_id) {
      const cityList = CITIES[record.state_id || ""] || [];
      const city = cityList.find(c => c.id === record.city_id);
      parts.push(city?.name || record.city_id);
    }
    return parts.length > 0 ? parts.join(" › ") : "Global";
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
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold">Page Content</h2>
          <p className="text-muted-foreground">
            Manage editable page content (hero text, headings, etc.).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowTemplateGenerator(true)}>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate
          </Button>
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={() => setShowExport(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
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
              {/* Location Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Location (for filtering)
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <Select
                    value={formData.country_code}
                    onValueChange={(value) => setFormData({ ...formData, country_code: value, state_id: "", city_id: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.state_id || "none"}
                    onValueChange={(value) => setFormData({ ...formData, state_id: value === "none" ? "" : value, city_id: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="State/Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No State</SelectItem>
                      {formStates.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.city_id || "none"}
                    onValueChange={(value) => setFormData({ ...formData, city_id: value === "none" ? "" : value })}
                    disabled={!formData.state_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No City</SelectItem>
                      {formCities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Page Key (URL slug)</Label>
                  <Input
                    value={formData.page_key}
                    onChange={(e) => setFormData({ ...formData, page_key: e.target.value })}
                    placeholder="california-addiction-rehabs"
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
                  <Select
                    value={formData.content_type}
                    onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="hero">Hero</SelectItem>
                      <SelectItem value="section">Section</SelectItem>
                      <SelectItem value="cta">CTA</SelectItem>
                    </SelectContent>
                  </Select>
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
      </div>

      {/* Filters Section */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCountry} onValueChange={(v) => { setFilterCountry(v); setFilterState("all"); setFilterCity("all"); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterState} onValueChange={(v) => { setFilterState(v); setFilterCity("all"); }}>
            <SelectTrigger>
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {availableFilterStates.map((state) => (
                <SelectItem key={state.id} value={state.id}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCity} onValueChange={setFilterCity} disabled={filterState === "all"}>
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {availableFilterCities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Showing {filteredContent.length} of {content?.length || 0} entries
          </div>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Page Key</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContent.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {getLocationLabel(record)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium font-mono text-sm">{record.page_key}</TableCell>
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
            {filteredContent.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {hasActiveFilters 
                    ? "No content matches your filters." 
                    : "No content yet. Click \"Add Content\" to create page content."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Template Generator Dialog */}
      <PageTemplateGenerator
        open={showTemplateGenerator}
        onOpenChange={setShowTemplateGenerator}
      />

      {/* Import Dialog */}
      <BulkImportExport
        open={showImport}
        onOpenChange={setShowImport}
        mode="import"
      />

      {/* Export Dialog */}
      <BulkImportExport
        open={showExport}
        onOpenChange={setShowExport}
        mode="export"
        content={content}
      />
    </div>
  );
};

export default ContentAdmin;
