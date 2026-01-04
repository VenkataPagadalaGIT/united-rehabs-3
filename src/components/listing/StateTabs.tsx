import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Building2, Gift } from "lucide-react";
import { StatisticsTab } from "./tabs/StatisticsTab";
import { RehabListingsTab } from "./tabs/RehabListingsTab";
import { FreeResourcesTab } from "./tabs/FreeResourcesTab";
import type { TreatmentCenter, FilterOption, City } from "@/types";

interface StateTabsProps {
  stateId: string;
  stateName: string;
  centers: TreatmentCenter[];
  conditions: FilterOption[];
  hasMore: boolean;
  onLoadMore: () => void;
  cities: City[];
  activeCityId?: string;
  onCityClick: (cityId: string) => void;
}

export const StateTabs = ({
  stateId,
  stateName,
  centers,
  conditions,
  hasMore,
  onLoadMore,
  cities,
  activeCityId,
  onCityClick,
}: StateTabsProps) => {
  return (
    <Tabs defaultValue="statistics" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8 h-14 bg-muted p-1.5 rounded-xl">
        <TabsTrigger value="statistics" className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Statistics</span>
          <span className="sm:hidden">Stats</span>
        </TabsTrigger>
        <TabsTrigger value="listings" className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Rehab Listings</span>
          <span className="sm:hidden">Rehabs</span>
        </TabsTrigger>
        <TabsTrigger value="resources" className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
          <Gift className="h-4 w-4" />
          <span>Resources</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="statistics">
        <StatisticsTab stateId={stateId} stateName={stateName} />
      </TabsContent>

      <TabsContent value="listings">
        <RehabListingsTab
          centers={centers}
          conditions={conditions}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          cities={cities}
          activeCityId={activeCityId}
          onCityClick={onCityClick}
        />
      </TabsContent>

      <TabsContent value="resources">
        <FreeResourcesTab stateId={stateId} stateName={stateName} />
      </TabsContent>
    </Tabs>
  );
};
