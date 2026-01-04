import { TreatmentCard } from "./TreatmentCard";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { TreatmentCenter, FilterOption } from "@/types";

interface TreatmentGridProps {
  centers: TreatmentCenter[];
  conditions: FilterOption[];
  hasMore: boolean;
  onLoadMore: () => void;
}

export function TreatmentGrid({ centers, conditions, hasMore, onLoadMore }: TreatmentGridProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {centers.map((center) => (
          <TreatmentCard key={center.id} center={center} conditions={conditions} />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" className="gap-2" onClick={onLoadMore}>
            Show More
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
