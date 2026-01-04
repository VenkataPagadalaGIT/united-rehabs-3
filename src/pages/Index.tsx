import { useState } from "react";
import { Header } from "@/components/listing/Header";
import { Breadcrumb } from "@/components/listing/Breadcrumb";
import { PageHero } from "@/components/listing/PageHero";
import { FilterTabs } from "@/components/listing/FilterTabs";
import { ImageGallery } from "@/components/listing/ImageGallery";
import { LocationTags } from "@/components/listing/LocationTags";
import { TreatmentGrid } from "@/components/listing/TreatmentGrid";
import { Sidebar } from "@/components/listing/Sidebar";
import { Categories } from "@/components/listing/Categories";
import { FAQ } from "@/components/listing/FAQ";
import { RelatedRehabs } from "@/components/listing/RelatedRehabs";
import { Footer } from "@/components/listing/Footer";
import { useFilters } from "@/hooks/useFilters";
import {
  mockState,
  mockCities,
  mockFAQs,
  mockHealthResources,
  mockStatisticsCards,
  mockTreatmentCenters,
  mockNavItems,
  mockFooterLinks,
} from "@/data/mockData";

const Index = () => {
  const {
    filters,
    activeFilters,
    toggleFilter,
    setCity,
    loadMore,
    centers,
    hasMore,
    conditions,
  } = useFilters();

  const [activeCityId, setActiveCityId] = useState<string>();

  const handleCityClick = (cityId: string) => {
    setActiveCityId(activeCityId === cityId ? undefined : cityId);
    setCity(cityId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4">
        <Breadcrumb />
        <PageHero state={mockState} />
        <FilterTabs
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={toggleFilter}
        />
        <ImageGallery state={mockState} />
        <LocationTags
          cities={mockCities}
          activeCityId={activeCityId}
          onCityClick={handleCityClick}
        />
        
        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
          <div className="lg:col-span-2">
            <TreatmentGrid
              centers={centers}
              conditions={conditions}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          </div>
          <div className="lg:col-span-1">
            <Sidebar
              healthResources={mockHealthResources}
              statisticsCards={mockStatisticsCards}
            />
          </div>
        </div>
      </main>

      <Categories />
      <FAQ faqs={mockFAQs} />
      <RelatedRehabs centers={mockTreatmentCenters} />
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default Index;
