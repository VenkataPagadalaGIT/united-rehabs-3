import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { LocationsSection } from "@/components/home/LocationsSection";
import { StatisticsSection } from "@/components/home/StatisticsSection";
import { DynamicFeaturedCenters } from "@/components/home/DynamicFeaturedCenters";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { BrowseBySection } from "@/components/home/BrowseBySection";
import { BrowseTabsSection } from "@/components/home/BrowseTabsSection";
import { SupportCTA } from "@/components/home/SupportCTA";
import { DynamicFAQ } from "@/components/listing/DynamicFAQ";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { homepageApi, HomepageData } from "@/lib/api";

const Index = () => {
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
