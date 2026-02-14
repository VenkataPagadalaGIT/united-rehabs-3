import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { StatisticsSection } from "@/components/home/StatisticsSection";
import { BrowseBySection } from "@/components/home/BrowseBySection";
import { BrowseTabsSection } from "@/components/home/BrowseTabsSection";
import { DynamicFAQ } from "@/components/listing/DynamicFAQ";
import { InteractiveGlobalMap } from "@/components/InteractiveGlobalMap";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { homepageApi, HomepageData } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
const Index = () => {
  const { t } = useTranslation();
  
  // ONE API call for entire homepage - maximum efficiency
  const { data: homepageData, isLoading, error } = useQuery<HomepageData>({
    queryKey: ["homepage-data"],
    queryFn: homepageApi.getData,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  return (
    <div className="min-h-screen bg-background" data-testid="homepage">
      <Header navItems={mockNavItems} />
      
      <main>
        <HeroSection />
        <TrustIndicators 
          nationalStats={homepageData?.national_stats} 
          isLoading={isLoading} 
        />
        
        {/* Interactive Global Map Section */}
        <section className="py-12 bg-muted/30" data-testid="global-map-section">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {t('map.exploreGlobally')}
                </h2>
                <p className="text-muted-foreground">
                  {t('map.clickCountry')}
                </p>
              </div>
              <Link 
                to="/compare" 
                className="mt-4 md:mt-0 text-primary hover:underline font-medium"
                data-testid="compare-link"
              >
                {t('map.compareCountries')} →
              </Link>
            </div>
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <InteractiveGlobalMap height={450} showLegend={true} />
            </div>
          </div>
        </section>
        
        <BrowseTabsSection />
        <LocationsSection 
          stateCounts={homepageData?.state_counts}
          isLoading={isLoading}
        />
        <StatisticsSection />
        <DynamicFeaturedCenters 
          centers={homepageData?.featured_centers || []}
          isLoading={isLoading}
        />
        <HowItWorks />
        <TestimonialsSection />
        <DynamicFAQ />
        <SupportCTA />
        <BrowseBySection />
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default Index;
