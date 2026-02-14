import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Building2, Gift } from "lucide-react";
import { StatisticsTab } from "./tabs/StatisticsTab";
import { FreeResourcesTab } from "./tabs/FreeResourcesTab";
import { Link } from "react-router-dom";

interface StateTabsProps {
  stateId: string;
  stateName: string;
  stateSlug: string;
}

export const StateTabs = ({
  stateId,
  stateName,
  stateSlug,
}: StateTabsProps) => {
  return (
    <Tabs defaultValue="statistics" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-muted p-1 rounded-lg gap-1">
        <TabsTrigger value="statistics" className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Statistics</span>
          <span className="sm:hidden">Stats</span>
        </TabsTrigger>
        <TabsTrigger value="resources" className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
          <Gift className="h-4 w-4" />
          Resources
        </TabsTrigger>
        <TabsTrigger value="listings" className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Rehab Listings</span>
          <span className="sm:hidden">Rehabs</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="statistics">
        <StatisticsTab stateId={stateId} stateName={stateName} stateSlug={stateSlug} />
      </TabsContent>

      <TabsContent value="resources">
        <FreeResourcesTab stateId={stateId} stateName={stateName} />
      </TabsContent>

      <TabsContent value="listings">
        <div className="text-center py-16 bg-card rounded-xl border" data-testid="rehab-coming-soon">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {stateName} Rehab Listings - Coming Soon
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We're building a comprehensive directory of verified treatment centers in {stateName}. 
            In the meantime, explore the addiction statistics and resources above.
          </p>
          <div className="flex justify-center gap-3">
            <Link 
              to={`/${stateSlug}-addiction-stats`}
              className="text-primary hover:underline text-sm font-medium"
            >
              View {stateName} Statistics
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link 
              to="/compare"
              className="text-primary hover:underline text-sm font-medium"
            >
              Compare Regions
            </Link>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
