import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Breadcrumb } from "@/components/listing/Breadcrumb";
import { PageHero } from "@/components/listing/PageHero";
import { RehabListingsTab } from "@/components/listing/tabs/RehabListingsTab";
import { FAQ } from "@/components/listing/FAQ";
import { Footer } from "@/components/listing/Footer";
import { useFilters } from "@/hooks/useFilters";
import { mockNavItems, mockFooterLinks, mockFAQs, mockCities, mockState } from "@/data/mockData";

// Map slug to state ID - will be expanded with more states
const stateSlugMap: Record<string, string> = {
  california: "ca",
  texas: "tx",
  florida: "fl",
  "new-york": "ny",
};

const StateRehabsPage = () => {
  const { slug } = useParams();
  
  // Extract the state part from the URL
  const stateKey = slug?.replace(/-addiction-rehab-centers$/, "") || "";
  const stateId = stateSlugMap[stateKey];
  
  const {
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
  
  if (!stateId) {
    return <Navigate to="/" replace />;
  }

  // For now, use mockState for California, will expand later with DB
  const state = stateId === "ca" ? mockState : mockState;

  return (
    <div className="min-h-screen bg-background">
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4">
        <Breadcrumb />
        <PageHero state={state} />
        
        <div className="py-8">
          <RehabListingsTab
            centers={centers}
            conditions={conditions}
            hasMore={hasMore}
            onLoadMore={loadMore}
            cities={mockCities}
            activeCityId={activeCityId}
            onCityClick={handleCityClick}
          />
        </div>
      </main>

      <FAQ faqs={mockFAQs} />
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default StateRehabsPage;
