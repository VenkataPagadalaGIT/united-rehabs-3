import { useParams, Navigate } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Breadcrumb } from "@/components/listing/Breadcrumb";
import { PageHero } from "@/components/listing/PageHero";
import { StateTabs } from "@/components/listing/StateTabs";
import { DynamicFAQ } from "@/components/listing/DynamicFAQ";
import { Footer } from "@/components/listing/Footer";
import { SEOHead, stateRehabsSEO } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { getStateBySlug, toState } from "@/data/stateConfig";
import { ArticleToolbar } from "@/components/ArticleToolbar";

const StateRehabsPage = () => {
  const { slug } = useParams();
  
  const stateKey = slug?.replace(/-addiction-rehab-centers$/, "").replace(/-addiction-rehabs$/, "").replace(/-\d{4}$/, "") || "";
  const stateConfig = getStateBySlug(stateKey);
  
  if (!stateConfig) {
    return <Navigate to="/" replace />;
  }

  const state = toState(stateConfig);

  const breadcrumbItems = [
    { label: "United States", href: "/united-states" },
    { label: stateConfig.name, href: `/${stateKey}-addiction-rehabs` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...stateRehabsSEO(state.name, stateKey)} />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />
        <PageHero state={state} />

        <ArticleToolbar
          title={`${state.name} Addiction Treatment & Rehab Centers`}
          url={`https://unitedrehabs.com/${stateKey}-addiction-rehabs`}
          content={stateConfig.description || ""}
        />

        <div className="py-8">
          <StateTabs
            stateId={stateConfig.abbreviation}
            stateName={state.name}
            stateSlug={stateKey}
          />
        </div>
      </main>

      <DynamicFAQ stateId={stateConfig.abbreviation} stateName={state.name} />
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default StateRehabsPage;
