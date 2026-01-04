import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Globe, MapPin, Star, ExternalLink, Building2, HeartHandshake, PhoneCall } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  free_rehab: { label: "Free Rehab", color: "bg-emerald-600" },
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

  // Categorize resources
  const hotlines = resources?.filter((r) => r.resource_type === "hotline") || [];
  const programs = resources?.filter((r) => r.resource_type === "program" || r.resource_type === "free_rehab") || [];
  const supportGroups = resources?.filter((r) => r.resource_type === "support_group") || [];
  const governmentResources = resources?.filter((r) => r.resource_type === "government" || r.resource_type === "nonprofit") || [];
  const allResources = resources || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Free Resources for {stateName}</h2>
        <p className="text-muted-foreground">
          Free helplines, rehab programs, support groups, and resources to help you or your loved ones
        </p>
      </div>

      {/* Sub-tabs for different resource types */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all" className="flex items-center gap-1 text-xs sm:text-sm">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">All</span>
          </TabsTrigger>
          <TabsTrigger value="hotlines" className="flex items-center gap-1 text-xs sm:text-sm">
            <PhoneCall className="h-4 w-4" />
            <span className="hidden sm:inline">Hotlines</span>
          </TabsTrigger>
          <TabsTrigger value="rehabs" className="flex items-center gap-1 text-xs sm:text-sm">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Free Rehabs</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-1 text-xs sm:text-sm">
            <HeartHandshake className="h-4 w-4" />
            <span className="hidden sm:inline">Support</span>
          </TabsTrigger>
          <TabsTrigger value="government" className="flex items-center gap-1 text-xs sm:text-sm">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Gov</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ResourceGrid resources={allResources} emptyMessage={`No free resources available for ${stateName}`} />
        </TabsContent>

        <TabsContent value="hotlines">
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-1">24/7 Crisis Support</h3>
              <p className="text-sm text-red-600 dark:text-red-300">
                These hotlines provide immediate, confidential support around the clock. Don't hesitate to reach out.
              </p>
            </div>
            <ResourceGrid resources={hotlines} emptyMessage="No hotlines available" />
          </div>
        </TabsContent>

        <TabsContent value="rehabs">
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg p-4">
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Free Treatment Programs</h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-300">
                These programs offer free or low-cost addiction treatment. Eligibility requirements may apply.
              </p>
            </div>
            <ResourceGrid resources={programs} emptyMessage="No free rehab programs available" />
          </div>
        </TabsContent>

        <TabsContent value="support">
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
              <h3 className="font-semibold text-green-700 dark:text-green-400 mb-1">Peer Support Groups</h3>
              <p className="text-sm text-green-600 dark:text-green-300">
                Free peer-led meetings and support communities for addiction recovery.
              </p>
            </div>
            <ResourceGrid resources={supportGroups} emptyMessage="No support groups available" />
          </div>
        </TabsContent>

        <TabsContent value="government">
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-lg p-4">
              <h3 className="font-semibold text-purple-700 dark:text-purple-400 mb-1">Government & Nonprofit Resources</h3>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                Official state and federal programs, plus nonprofit organizations providing free services.
              </p>
            </div>
            <ResourceGrid resources={governmentResources} emptyMessage="No government resources available" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        All resources listed are free or offer free services. Contact individual organizations for specific eligibility requirements.
      </p>
    </div>
  );
};

const ResourceGrid = ({ resources, emptyMessage }: { resources: FreeResource[]; emptyMessage: string }) => {
  if (resources.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  const featuredResources = resources.filter((r) => r.featured);
  const otherResources = resources.filter((r) => !r.featured);

  return (
    <div className="space-y-6">
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

      {otherResources.length > 0 && (
        <div>
          {featuredResources.length > 0 && <h3 className="text-lg font-semibold mb-4">More Resources</h3>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}
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
            <div className="flex items-center gap-2 flex-wrap">
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
