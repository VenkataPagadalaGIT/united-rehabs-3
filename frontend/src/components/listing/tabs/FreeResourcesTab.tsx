import { useQuery } from "@tanstack/react-query";
import { resourcesApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Phone, Globe, MapPin, Star } from "lucide-react";

interface FreeResourcesTabProps {
  stateId?: string;
  stateName?: string;
}

export const FreeResourcesTab = ({ stateId, stateName }: FreeResourcesTabProps) => {
  const { data: resources, isLoading } = useQuery({
    queryKey: ["state-resources", stateId],
    queryFn: async () => {
      return await resourcesApi.getAll({ state_id: stateId, limit: 20 });
    },
    enabled: !!stateId,
  });

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" data-testid="resources-loading" />;
  }

  if (!resources || resources.length === 0) {
    return (
      <Card data-testid="resources-empty">
        <CardContent className="py-8 text-center text-muted-foreground">
          No free resources available for this area.
        </CardContent>
      </Card>
    );
  }

  // Separate nationwide and state-specific resources
  const nationwideResources = resources.filter((r: any) => r.is_nationwide);
  const stateResources = resources.filter((r: any) => !r.is_nationwide);

  return (
    <div className="space-y-6" data-testid="resources-content">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="h-5 w-5 text-green-600" />
        <h3 className="text-xl font-bold">
          {stateName ? `Free Resources in ${stateName}` : "Free Treatment Resources"}
        </h3>
      </div>

      {/* Nationwide Resources */}
      {nationwideResources.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-muted-foreground">Nationwide Resources</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {nationwideResources.map((resource: any) => (
              <Card key={resource.id} className="border-primary/20" data-testid={`resource-${resource.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {resource.title}
                    {resource.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resource.description && (
                    <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                  )}
                  <div className="space-y-2">
                    {resource.phone && (
                      <a href={`tel:${resource.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium">
                        <Phone className="h-4 w-4" />
                        {resource.phone}
                      </a>
                    )}
                    {resource.website && (
                      <a href={resource.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                        <Globe className="h-4 w-4" />
                        Visit Website
                      </a>
                    )}
                    {resource.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {resource.address}
                      </div>
                    )}
                  </div>
                  {resource.is_free && (
                    <span className="inline-block mt-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Free Service
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* State-specific Resources */}
      {stateResources.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-muted-foreground">
            {stateName ? `${stateName} Resources` : "Local Resources"}
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            {stateResources.map((resource: any) => (
              <Card key={resource.id} data-testid={`resource-${resource.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {resource.title}
                    {resource.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resource.description && (
                    <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                  )}
                  <div className="space-y-2">
                    {resource.phone && (
                      <a href={`tel:${resource.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium">
                        <Phone className="h-4 w-4" />
                        {resource.phone}
                      </a>
                    )}
                    {resource.website && (
                      <a href={resource.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                        <Globe className="h-4 w-4" />
                        Visit Website
                      </a>
                    )}
                    {resource.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {resource.address}
                      </div>
                    )}
                  </div>
                  {resource.is_free && (
                    <span className="inline-block mt-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Free Service
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeResourcesTab;
