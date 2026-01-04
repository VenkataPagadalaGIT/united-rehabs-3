import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Breadcrumb } from "@/components/listing/Breadcrumb";
import { PageHero } from "@/components/listing/PageHero";
import { FilterTabs } from "@/components/listing/FilterTabs";
import { ImageGallery } from "@/components/listing/ImageGallery";
import { StateTabs } from "@/components/listing/StateTabs";
import { Categories } from "@/components/listing/Categories";
import { FAQ } from "@/components/listing/FAQ";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { useFilters } from "@/hooks/useFilters";
import { mockNavItems, mockFooterLinks, mockFAQs, mockCities, mockState } from "@/data/mockData";

// Map slug to state ID - will be expanded with more states
const stateSlugMap: Record<string, { id: string; name: string }> = {
  california: { id: "ca", name: "California" },
  texas: { id: "tx", name: "Texas" },
  florida: { id: "fl", name: "Florida" },
  "new-york": { id: "ny", name: "New York" },
};

const StateRehabsPage = () => {
  const { slug } = useParams();
  
  // Extract the state part from the URL - support both patterns
  const stateKey = slug?.replace(/-addiction-rehab-centers$/, "").replace(/-addiction-rehabs$/, "") || "";
  const stateInfo = stateSlugMap[stateKey];
  
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
  
  if (!stateInfo) {
    return <Navigate to="/" replace />;
  }

  // Create dynamic state object
  const state = {
    ...mockState,
    id: stateInfo.id,
    name: stateInfo.name,
  };

  // Dynamic breadcrumb items - geographic hierarchy
  const breadcrumbItems = [
    { label: "United States", href: "/united-states" },
    { label: stateInfo.name, href: `/${stateKey}-addiction-rehabs` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        pageSlug={slug || ""} 
        fallbackTitle={`${state.name} Rehab Centers`}
        fallbackDescription={`Find addiction treatment and rehab centers in ${state.name}`}
      />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />
        <PageHero state={state} />
        <FilterTabs
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={toggleFilter}
        />
        <ImageGallery state={state} />
      </main>
      
      {/* Full-width separator */}
      <div className="border-t border-border mt-8" />
      
      {/* Tabs section with proper container */}
      <section className="container mx-auto px-4 py-8">
        <StateTabs
          stateId={stateInfo.id}
          stateName={state.name}
          centers={centers}
          conditions={conditions}
          hasMore={hasMore}
          onLoadMore={loadMore}
          cities={mockCities}
          activeCityId={activeCityId}
          onCityClick={handleCityClick}
        />
      </section>

      <Categories />
      <FAQ faqs={mockFAQs} />
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default StateRehabsPage;
