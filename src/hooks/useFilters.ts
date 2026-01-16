import { useState, useMemo, useCallback } from "react";
import type { FilterCategory, ActiveFilters, TreatmentCenter } from "@/types";
import { mockFilters, mockTreatmentCenters } from "@/data/mockData";

const initialFilters: ActiveFilters = {
  cityIds: [],
  conditionIds: [],
  insuranceIds: [],
  therapyIds: [],
  careTypeIds: [],
  approachIds: [],
  amenityIds: [],
  page: 1,
  pageSize: 6,
  sortBy: "relevance",
};

export function useFilters(stateName?: string) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(initialFilters);

  // Create filters with dynamic state name
  const dynamicFilters = useMemo(() => {
    return mockFilters.map(filter => 
      filter.category === "state" 
        ? { ...filter, label: stateName || "State" }
        : filter
    );
  }, [stateName]);

  // Convert to Record for component usage
  const filterRecord: Record<FilterCategory, string[]> = useMemo(() => ({
    state: activeFilters.stateId ? [activeFilters.stateId] : [],
    conditions: activeFilters.conditionIds,
    insurance: activeFilters.insuranceIds,
    therapies: activeFilters.therapyIds,
    care: activeFilters.careTypeIds,
    approaches: activeFilters.approachIds,
    amenities: activeFilters.amenityIds,
    prices: activeFilters.priceLevel ? [activeFilters.priceLevel] : [],
    activities: [],
    language: [],
    clientele: [],
    luxury: [],
    settings: [],
    special_considerations: [],
  }), [activeFilters]);

  const toggleFilter = useCallback((category: FilterCategory, optionId: string) => {
    setActiveFilters((prev) => {
      const categoryMap: Record<FilterCategory, keyof ActiveFilters> = {
        state: "stateId",
        conditions: "conditionIds",
        insurance: "insuranceIds",
        therapies: "therapyIds",
        care: "careTypeIds",
        approaches: "approachIds",
        amenities: "amenityIds",
        prices: "priceLevel",
        activities: "conditionIds", // placeholder
        language: "conditionIds", // placeholder
        clientele: "conditionIds", // placeholder
        luxury: "conditionIds", // placeholder
        settings: "conditionIds", // placeholder
        special_considerations: "conditionIds", // placeholder
      };

      const key = categoryMap[category];
      
      if (key === "stateId" || key === "priceLevel") {
        return { ...prev, [key]: prev[key] === optionId ? undefined : optionId };
      }

      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(optionId)
        ? currentArray.filter((id) => id !== optionId)
        : [...currentArray, optionId];

      return { ...prev, [key]: newArray, page: 1 };
    });
  }, []);

  const setCity = useCallback((cityId: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      cityIds: prev.cityIds.includes(cityId)
        ? prev.cityIds.filter((id) => id !== cityId)
        : [...prev.cityIds, cityId],
      page: 1,
    }));
  }, []);

  const loadMore = useCallback(() => {
    setActiveFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  }, []);

  // Filter treatment centers based on active filters
  const filteredCenters = useMemo(() => {
    let result = [...mockTreatmentCenters];

    // Filter by city
    if (activeFilters.cityIds.length > 0) {
      result = result.filter((center) =>
        activeFilters.cityIds.includes(center.cityId)
      );
    }

    // Filter by conditions
    if (activeFilters.conditionIds.length > 0) {
      result = result.filter((center) =>
        activeFilters.conditionIds.some((id) => center.conditionIds.includes(id))
      );
    }

    // Filter by insurance
    if (activeFilters.insuranceIds.length > 0) {
      result = result.filter((center) =>
        activeFilters.insuranceIds.some((id) => center.insuranceIds.includes(id))
      );
    }

    return result;
  }, [activeFilters]);

  // Paginate results
  const paginatedCenters = useMemo(() => {
    const endIndex = activeFilters.page * activeFilters.pageSize;
    return filteredCenters.slice(0, endIndex);
  }, [filteredCenters, activeFilters.page, activeFilters.pageSize]);

  const hasMore = paginatedCenters.length < filteredCenters.length;

  // Get conditions for card display
  const conditions = mockFilters.find((f) => f.category === "conditions")?.options || [];

  return {
    filters: dynamicFilters,
    activeFilters: filterRecord,
    toggleFilter,
    setCity,
    loadMore,
    centers: paginatedCenters,
    hasMore,
    conditions,
    totalCount: filteredCenters.length,
  };
}
