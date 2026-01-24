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
import { mockNavItems, mockFooterLinks, mockFAQs } from "@/data/mockData";
import { getStateBySlug, toState, getStateCities } from "@/data/stateConfig";

const StateRehabsPage = () => {
  const { slug } = useParams();
  
  // Extract the state part from the URL - support both patterns
  const stateKey = slug?.replace(/-addiction-rehab-centers$/, "").replace(/-addiction-rehabs$/, "") || "";
  const stateConfig = getStateBySlug(stateKey);
  
  // Pass state name and ID to useFilters for dynamic data
  const {
    filters,
    activeFilters,
    toggleFilter,
    setCity,
    loadMore,
    centers,
    hasMore,
    conditions,
  } = useFilters(stateConfig?.name, stateConfig?.id);

  const [activeCityId, setActiveCityId] = useState<string>();

  const handleCityClick = (cityId: string) => {
    setActiveCityId(activeCityId === cityId ? undefined : cityId);
    setCity(cityId);
  };
  
  if (!stateConfig) {
    return <Navigate to="/" replace />;
  }

  // Create state object and get cities from config
  const state = toState(stateConfig);
  const cities = getStateCities(stateKey);

  // Dynamic breadcrumb items - geographic hierarchy
  const breadcrumbItems = [
    { label: "United States", href: "/united-states" },
    { label: stateConfig.name, href: `/${stateKey}-addiction-rehabs` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        pageSlug={slug || ""} 
        fallbackTitle={`${state.name} Rehab Centers`}
        fallbackDescription={`Find addiction treatment and rehab centers in ${state.name}`}
      />
      <Header navItems={mockNavItems} />
      
      <main id="main-content" className="container mx-auto px-4" role="main">
        <Breadcrumb items={breadcrumbItems} />
        <PageHero state={state} />
        <FilterTabs
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={toggleFilter}
        />
        <ImageGallery state={state} />
      </main>
      
      {/* Clear visual separator between gallery and tabs */}
      <div className="w-full bg-muted/30 py-6 my-8 border-y border-border" />
      
      {/* Tabs section with proper container */}
      <section className="container mx-auto px-4 pb-8">
        <StateTabs
          stateId={stateConfig.id}
          stateName={state.name}
          centers={centers}
          conditions={conditions}
          hasMore={hasMore}
          onLoadMore={loadMore}
          cities={cities}
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
