import { useParams, Navigate } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Breadcrumb } from "@/components/listing/Breadcrumb";
import { PageHero } from "@/components/listing/PageHero";
import { FreeResourcesTab } from "@/components/listing/tabs/FreeResourcesTab";
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

const StateResourcesPage = () => {
  const { slug } = useParams();
  
  // Extract the state part from the URL
  const stateKey = slug?.replace(/-addiction-free-resources$/, "") || "";
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
    { label: "Free Resources", href: "/free-resources" },
    { label: stateInfo.name, href: `/${stateKey}-addiction-free-resources` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        pageSlug={slug || ""} 
        fallbackTitle={`Free Addiction Resources in ${state.name}`}
        fallbackDescription={`Free addiction resources, hotlines, and support in ${state.name}`}
      />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />
        <PageHero state={state} />
        
        <div className="py-8">
          <FreeResourcesTab stateId={stateInfo.id} stateName={state.name} />
        </div>
      </main>

      <FAQ faqs={mockFAQs} />
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default StateResourcesPage;
