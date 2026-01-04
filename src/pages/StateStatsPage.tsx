import { useParams, Navigate } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Breadcrumb } from "@/components/listing/Breadcrumb";
import { PageHero } from "@/components/listing/PageHero";
import { StatisticsTab } from "@/components/listing/tabs/StatisticsTab";
import { FAQ } from "@/components/listing/FAQ";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks, mockFAQs, mockState } from "@/data/mockData";

// Map slug to state ID - will be expanded with more states
const stateSlugMap: Record<string, { id: string; name: string }> = {
  california: { id: "ca", name: "California" },
  texas: { id: "tx", name: "Texas" },
  florida: { id: "fl", name: "Florida" },
  "new-york": { id: "ny", name: "New York" },
};

const StateStatsPage = () => {
  const { slug } = useParams();
  
  // Extract the state part from the URL (e.g., "california" from "california-addiction-stats")
  const stateKey = slug?.replace(/-addiction-stats$/, "") || "";
  const stateInfo = stateSlugMap[stateKey];
  
  if (!stateInfo) {
    return <Navigate to="/" replace />;
  }

  // Create dynamic state object
  const state = {
    ...mockState,
    id: stateInfo.id,
    name: stateInfo.name,
  };

  // Dynamic breadcrumb items
  const breadcrumbItems = [
    { label: "Statistics", href: "/statistics" },
    { label: stateInfo.name, href: `/${stateKey}-addiction-stats` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        pageSlug={slug || ""} 
        fallbackTitle={`${state.name} Addiction Statistics`}
        fallbackDescription={`Comprehensive addiction statistics for ${state.name}`}
      />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />
        <PageHero state={state} />
        
        <div className="py-8">
          <StatisticsTab stateId={stateInfo.id} stateName={state.name} />
        </div>
      </main>

      <FAQ faqs={mockFAQs} />
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default StateStatsPage;
