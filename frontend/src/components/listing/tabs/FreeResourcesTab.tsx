import { useQuery } from "@tanstack/react-query";
import { resourcesApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Phone, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FreeResourcesTabProps {
  stateId?: string;
}

export const FreeResourcesTab = ({ stateId }: FreeResourcesTabProps) => {
  const { data: resources, isLoading } = useQuery({
    queryKey: ["state-resources", stateId],
    queryFn: async () => {
      return await resourcesApi.getAll({ state_id: stateId, limit: 20 });
    },
    enabled: !!stateId,
  });

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No free resources available for this area.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="h-5 w-5 text-green-600" />
        <h3 className="text-xl font-bold">Free Treatment Resources</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((resource: any) => (
          <Card key={resource.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{resource.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {resource.description && (
                <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
              )}
              <div className="space-y-2">
                {resource.phone && (
                  <a href={`tel:${resource.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FreeResourcesTab;
