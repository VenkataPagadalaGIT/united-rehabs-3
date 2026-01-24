import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Wand2, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Location data - same as ContentAdmin
const COUNTRIES = [
  { code: "us", name: "United States" },
  { code: "ca", name: "Canada" },
  { code: "uk", name: "United Kingdom" },
  { code: "au", name: "Australia" },
];

const STATES: Record<string, { id: string; name: string; slug: string }[]> = {
  us: [
    { id: "ca", name: "California", slug: "california" },
    { id: "tx", name: "Texas", slug: "texas" },
    { id: "fl", name: "Florida", slug: "florida" },
    { id: "ny", name: "New York", slug: "new-york" },
    { id: "il", name: "Illinois", slug: "illinois" },
    { id: "pa", name: "Pennsylvania", slug: "pennsylvania" },
    { id: "oh", name: "Ohio", slug: "ohio" },
    { id: "ga", name: "Georgia", slug: "georgia" },
    { id: "nc", name: "North Carolina", slug: "north-carolina" },
    { id: "mi", name: "Michigan", slug: "michigan" },
    { id: "az", name: "Arizona", slug: "arizona" },
    { id: "wa", name: "Washington", slug: "washington" },
    { id: "co", name: "Colorado", slug: "colorado" },
    { id: "nv", name: "Nevada", slug: "nevada" },
    { id: "or", name: "Oregon", slug: "oregon" },
  ],
  ca: [
    { id: "on", name: "Ontario", slug: "ontario" },
    { id: "bc", name: "British Columbia", slug: "british-columbia" },
    { id: "ab", name: "Alberta", slug: "alberta" },
    { id: "qc", name: "Quebec", slug: "quebec" },
  ],
  uk: [
    { id: "eng", name: "England", slug: "england" },
    { id: "sco", name: "Scotland", slug: "scotland" },
    { id: "wal", name: "Wales", slug: "wales" },
  ],
  au: [
    { id: "nsw", name: "New South Wales", slug: "new-south-wales" },
    { id: "vic", name: "Victoria", slug: "victoria" },
    { id: "qld", name: "Queensland", slug: "queensland" },
  ],
};

const CITIES: Record<string, { id: string; name: string; slug: string }[]> = {
  ca: [
    { id: "los-angeles", name: "Los Angeles", slug: "los-angeles" },
    { id: "san-francisco", name: "San Francisco", slug: "san-francisco" },
    { id: "san-diego", name: "San Diego", slug: "san-diego" },
    { id: "sacramento", name: "Sacramento", slug: "sacramento" },
  ],
  tx: [
    { id: "houston", name: "Houston", slug: "houston" },
    { id: "dallas", name: "Dallas", slug: "dallas" },
    { id: "austin", name: "Austin", slug: "austin" },
    { id: "san-antonio", name: "San Antonio", slug: "san-antonio" },
  ],
  fl: [
    { id: "miami", name: "Miami", slug: "miami" },
    { id: "orlando", name: "Orlando", slug: "orlando" },
    { id: "tampa", name: "Tampa", slug: "tampa" },
  ],
  ny: [
    { id: "new-york-city", name: "New York City", slug: "new-york-city" },
    { id: "buffalo", name: "Buffalo", slug: "buffalo" },
    { id: "albany", name: "Albany", slug: "albany" },
  ],
};

// Page templates with placeholder content
const PAGE_TEMPLATES = [
  {
    id: "rehabs",
    name: "Rehab Listings Page",
    pageKeySuffix: "-addiction-rehabs",
    sections: [
      {
        section_key: "hero",
        content_type: "hero",
        titleTemplate: "Alcohol & Drug Addiction Treatment And Rehabs In {location}",
        subtitleTemplate: "Find accredited rehabilitation centers near you",
        bodyTemplate: "{location} offers a wide range of addiction treatment options, from inpatient rehabilitation to outpatient programs. Our directory helps you find the right facility for your recovery journey.",
      },
      {
        section_key: "intro",
        content_type: "text",
        titleTemplate: "Finding the Right Treatment in {location}",
        bodyTemplate: "Whether you're seeking help for yourself or a loved one, finding the right addiction treatment center is crucial. {location} has numerous accredited facilities offering evidence-based treatment programs.",
      },
    ],
  },
  {
    id: "stats",
    name: "Statistics Page",
    pageKeySuffix: "-addiction-stats",
    sections: [
      {
        section_key: "hero",
        content_type: "hero",
        titleTemplate: "Addiction Statistics in {location}",
        subtitleTemplate: "Understanding the scope of substance abuse",
        bodyTemplate: "Explore comprehensive addiction statistics for {location}, including substance abuse rates, treatment availability, and recovery outcomes.",
      },
      {
        section_key: "overview",
        content_type: "text",
        titleTemplate: "Substance Abuse Overview",
        bodyTemplate: "Understanding addiction statistics helps communities develop effective prevention and treatment strategies. Here's what the data tells us about substance abuse in {location}.",
      },
    ],
  },
  {
    id: "resources",
    name: "Free Resources Page",
    pageKeySuffix: "-addiction-free-resources",
    sections: [
      {
        section_key: "hero",
        content_type: "hero",
        titleTemplate: "Free Addiction Resources in {location}",
        subtitleTemplate: "Support services at no cost",
        bodyTemplate: "Access free addiction treatment resources, support groups, and community services available in {location}. Recovery is possible, and help is available.",
      },
      {
        section_key: "intro",
        content_type: "text",
        titleTemplate: "No-Cost Recovery Support",
        bodyTemplate: "Many organizations in {location} offer free or low-cost addiction services. From support groups to treatment programs, these resources can help start your recovery journey.",
      },
    ],
  },
];

interface PageTemplateGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PageTemplateGenerator({ open, onOpenChange }: PageTemplateGeneratorProps) {
  const queryClient = useQueryClient();
  const [country, setCountry] = useState("us");
  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(
    PAGE_TEMPLATES.map(t => t.id)
  );

  const states = useMemo(() => STATES[country] || [], [country]);
  const cities = useMemo(() => CITIES[stateId] || [], [stateId]);

  const selectedState = states.find(s => s.id === stateId);
  const selectedCity = cities.find(c => c.id === cityId);

  // Determine location name and slug
  const locationName = selectedCity?.name || selectedState?.name || "";
  const locationSlug = selectedCity?.slug || selectedState?.slug || "";

  // Generate preview of content to be created
  const previewEntries = useMemo(() => {
    if (!locationSlug) return [];
    
    return PAGE_TEMPLATES
      .filter(t => selectedTemplates.includes(t.id))
      .flatMap(template => 
        template.sections.map(section => ({
          page_key: `${locationSlug}${template.pageKeySuffix}`,
          section_key: section.section_key,
          content_type: section.content_type,
          title: section.titleTemplate.replace(/{location}/g, locationName),
        }))
      );
  }, [locationSlug, locationName, selectedTemplates]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!locationSlug || !locationName) {
        throw new Error("Please select a location");
      }

      const entries = PAGE_TEMPLATES
        .filter(t => selectedTemplates.includes(t.id))
        .flatMap(template => 
          template.sections.map((section, idx) => ({
            page_key: `${locationSlug}${template.pageKeySuffix}`,
            section_key: section.section_key,
            content_type: section.content_type,
            title: section.titleTemplate.replace(/{location}/g, locationName),
            subtitle: section.subtitleTemplate?.replace(/{location}/g, locationName) || null,
            body: section.bodyTemplate.replace(/{location}/g, locationName),
            country_code: country,
            state_id: stateId || null,
            city_id: cityId || null,
            is_active: true,
            sort_order: idx,
          }))
        );

      const { error } = await supabase.from("page_content").insert(entries);
      if (error) throw error;
      
      return entries.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      toast.success(`Created ${count} content entries for ${locationName}`);
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to generate content: " + error.message);
    },
  });

  const resetForm = () => {
    setCountry("us");
    setStateId("");
    setCityId("");
    setSelectedTemplates(PAGE_TEMPLATES.map(t => t.id));
  };

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Generate Page Content
          </DialogTitle>
          <DialogDescription>
            Automatically create content entries for a new state or city with placeholder text.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Location Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Select Location</Label>
            <div className="grid grid-cols-3 gap-3">
              <Select value={country} onValueChange={(v) => { setCountry(v); setStateId(""); setCityId(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stateId || "none"} onValueChange={(v) => { setStateId(v === "none" ? "" : v); setCityId(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="State/Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select State</SelectItem>
                  {states.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={cityId || "none"} onValueChange={(v) => setCityId(v === "none" ? "" : v)} disabled={!stateId || cities.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="City (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">State-level only</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Page Templates</Label>
            <div className="space-y-2">
              {PAGE_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleTemplate(template.id)}
                >
                  <Checkbox
                    checked={selectedTemplates.includes(template.id)}
                    onCheckedChange={() => toggleTemplate(template.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {locationSlug ? `${locationSlug}${template.pageKeySuffix}` : `{location}${template.pageKeySuffix}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {template.sections.length} sections
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {previewEntries.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Preview ({previewEntries.length} entries)</Label>
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">Page Key</th>
                      <th className="text-left p-2 font-medium">Section</th>
                      <th className="text-left p-2 font-medium">Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewEntries.map((entry, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 font-mono text-xs">{entry.page_key}</td>
                        <td className="p-2">{entry.section_key}</td>
                        <td className="p-2 truncate max-w-48">{entry.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!stateId || selectedTemplates.length === 0 || generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Generate {previewEntries.length} Entries
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
