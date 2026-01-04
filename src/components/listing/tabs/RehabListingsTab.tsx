import { TreatmentGrid } from "../TreatmentGrid";
import { Sidebar } from "../Sidebar";
import { LocationTags } from "../LocationTags";
import { RehabGuides } from "../RehabGuides";
import { mockHealthResources, mockStatisticsCards } from "@/data/mockData";
import type { TreatmentCenter, FilterOption, City } from "@/types";

interface RehabListingsTabProps {
  centers: TreatmentCenter[];
  conditions: FilterOption[];
  hasMore: boolean;
  onLoadMore: () => void;
  cities: City[];
  activeCityId?: string;
  onCityClick: (cityId: string) => void;
}

export const RehabListingsTab = ({
  centers,
  conditions,
  hasMore,
  onLoadMore,
  cities,
  activeCityId,
  onCityClick,
}: RehabListingsTabProps) => {
  return (
    <div className="space-y-8">
      {/* Rehab Guides Section */}
      <RehabGuides />

      {/* Top Treatment Locations */}
      <LocationTags
        cities={cities}
        activeCityId={activeCityId}
        onCityClick={onCityClick}
      />
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TreatmentGrid
            centers={centers}
            conditions={conditions}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
          />
        </div>
        <div className="lg:col-span-1">
          <Sidebar
            healthResources={mockHealthResources}
            statisticsCards={mockStatisticsCards}
          />
        </div>
      </div>
    </div>
  );
};
