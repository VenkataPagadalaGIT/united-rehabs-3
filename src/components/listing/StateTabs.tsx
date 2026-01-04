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
      <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
        <TabsTrigger value="statistics" className="flex items-center gap-1 sm:gap-2 px-2 py-2 sm:py-3 text-xs sm:text-sm">
          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="hidden xs:inline sm:inline">Stats</span>
          <span className="hidden sm:inline">istics</span>
        </TabsTrigger>
        <TabsTrigger value="listings" className="flex items-center gap-1 sm:gap-2 px-2 py-2 sm:py-3 text-xs sm:text-sm">
          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="hidden xs:inline">Rehabs</span>
          <span className="hidden sm:inline"> Listings</span>
        </TabsTrigger>
        <TabsTrigger value="resources" className="flex items-center gap-1 sm:gap-2 px-2 py-2 sm:py-3 text-xs sm:text-sm">
          <Gift className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="hidden xs:inline">Resources</span>
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
