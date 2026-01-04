import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { LocationsSection } from "@/components/home/LocationsSection";
import { StatisticsSection } from "@/components/home/StatisticsSection";
import { FeaturedCenters } from "@/components/home/FeaturedCenters";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { BrowseBySection } from "@/components/home/BrowseBySection";
import { BrowseTabsSection } from "@/components/home/BrowseTabsSection";
import { SupportCTA } from "@/components/home/SupportCTA";
import { FAQ } from "@/components/listing/FAQ";
import { mockNavItems, mockFooterLinks, mockFAQs } from "@/data/mockData";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header navItems={mockNavItems} />
      
      <main>
        <HeroSection />
        <TrustIndicators />
        <BrowseTabsSection />
        <LocationsSection />
        <StatisticsSection />
        <FeaturedCenters />
        <HowItWorks />
        <TestimonialsSection />
        <FAQ faqs={mockFAQs} />
        <SupportCTA />
        <BrowseBySection />
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default Index;
