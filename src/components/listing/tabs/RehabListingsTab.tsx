import { TreatmentGrid } from "../TreatmentGrid";
import { Sidebar } from "../Sidebar";
import { mockHealthResources, mockStatisticsCards } from "@/data/mockData";
import type { TreatmentCenter, FilterOption } from "@/types";

interface RehabListingsTabProps {
  centers: TreatmentCenter[];
  conditions: FilterOption[];
  hasMore: boolean;
  onLoadMore: () => void;
}

export const RehabListingsTab = ({
  centers,
  conditions,
  hasMore,
  onLoadMore,
}: RehabListingsTabProps) => {
  return (
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
  );
};
