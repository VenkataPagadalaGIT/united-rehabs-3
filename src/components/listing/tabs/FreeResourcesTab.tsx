import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Globe, MapPin, Star, ExternalLink } from "lucide-react";

interface FreeResourcesTabProps {
  stateId: string;
  stateName: string;
}

interface FreeResource {
  id: string;
  state_id: string | null;
  title: string;
  description: string | null;
  resource_type: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  is_nationwide: boolean | null;
  is_free: boolean | null;
  featured: boolean | null;
  sort_order: number | null;
}

const resourceTypeLabels: Record<string, { label: string; color: string }> = {
  hotline: { label: "24/7 Hotline", color: "bg-red-500" },
  program: { label: "Treatment Program", color: "bg-blue-500" },
  support_group: { label: "Support Group", color: "bg-green-500" },
  government: { label: "Government", color: "bg-purple-500" },
  nonprofit: { label: "Nonprofit", color: "bg-orange-500" },
};

export const FreeResourcesTab = ({ stateId, stateName }: FreeResourcesTabProps) => {
  const { data: resources, isLoading } = useQuery({
    queryKey: ["free-resources", stateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("free_resources")
        .select("*")
        .or(`state_id.eq.${stateId},is_nationwide.eq.true`)
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as FreeResource[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No free resources available for {stateName} at this time.
        </CardContent>
      </Card>
    );
  }

  const featuredResources = resources.filter((r) => r.featured);
  const otherResources = resources.filter((r) => !r.featured);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Free Resources for {stateName}</h2>
        <p className="text-muted-foreground">
          Free helplines, support groups, and programs to help you or your loved ones
        </p>
      </div>

      {/* Featured Resources */}
      {featuredResources.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} featured />
            ))}
          </div>
        </div>
      )}

      {/* Other Resources */}
      {otherResources.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">All Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        All resources listed are free or offer free services. Contact individual organizations for specific eligibility requirements.
      </p>
    </div>
  );
};

const ResourceCard = ({ resource, featured = false }: { resource: FreeResource; featured?: boolean }) => {
  const typeInfo = resourceTypeLabels[resource.resource_type] || { label: resource.resource_type, color: "bg-gray-500" };

  return (
    <Card className={featured ? "border-2 border-primary/50 bg-primary/5" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-lg">{resource.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`${typeInfo.color} text-white`}>
                {typeInfo.label}
              </Badge>
              {resource.is_nationwide && (
                <Badge variant="outline">Nationwide</Badge>
              )}
              {resource.is_free && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Free
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {resource.description && (
          <CardDescription className="text-sm">{resource.description}</CardDescription>
        )}

        <div className="flex flex-wrap gap-2">
          {resource.phone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${resource.phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                {resource.phone}
              </a>
            </Button>
          )}
          {resource.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={resource.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4 mr-2" />
                Website
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>

        {resource.address && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {resource.address}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
