import { useParams, Navigate } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Breadcrumb } from "@/components/listing/Breadcrumb";
import { PageHero } from "@/components/listing/PageHero";
import { StatisticsTab } from "@/components/listing/tabs/StatisticsTab";
import { DynamicFAQ } from "@/components/listing/DynamicFAQ";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { getStateBySlug, toState } from "@/data/stateConfig";

const StateStatsPage = () => {
  const { slug } = useParams();
  
  // Extract the state part from the URL (e.g., "california" from "california-addiction-stats")
  const stateKey = slug?.replace(/-addiction-stats$/, "") || "";
  const stateConfig = getStateBySlug(stateKey);
  
  if (!stateConfig) {
    return <Navigate to="/" replace />;
  }

  // Create state object from config
  const state = toState(stateConfig);

  // Dynamic breadcrumb items - geographic hierarchy
  const breadcrumbItems = [
    { label: "United States", href: "/united-states" },
    { label: stateConfig.name, href: `/${stateKey}-addiction-stats` },
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
          <StatisticsTab stateId={stateConfig.abbreviation} stateName={state.name} />
        </div>
      </main>

      <DynamicFAQ stateId={stateConfig.abbreviation} stateName={state.name} />
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default StateStatsPage;
