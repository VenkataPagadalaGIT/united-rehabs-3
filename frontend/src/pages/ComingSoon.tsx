import { SEOHead } from "@/components/SEOHead";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { Construction, ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  const location = useLocation();
  
  // Determine page title based on route
  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path.includes("rehab-centers")) return "Treatment Centers Directory";
    if (path.includes("blog")) return "Blog & Articles";
    return "This Feature";
  };

  const getDescription = () => {
    if (description) return description;
    const path = location.pathname;
    if (path.includes("rehab-centers")) {
      return "We're building a comprehensive directory of verified treatment centers worldwide. This feature will help you find and compare addiction treatment facilities based on location, specialties, and reviews.";
    }
    if (path.includes("blog")) {
      return "Our team is preparing educational articles, recovery guides, and expert insights about addiction treatment. Check back soon for valuable resources to support your recovery journey.";
    }
    return "We're working hard to bring you this feature. Please check back soon.";
  };

  return (
    <div className="min-h-screen bg-background" data-testid="coming-soon-page">
      <SEOHead pageSlug="coming-soon" fallbackTitle="Coming Soon" fallbackDescription="This feature is coming soon to United Rehabs. Explore our addiction statistics for 195 countries in the meantime." keywords="coming soon, united rehabs features" />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
            <Construction className="h-10 w-10 text-primary" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {getPageTitle()} - Coming Soon
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {getDescription()}
          </p>

          {/* Divider */}
          <div className="w-24 h-1 bg-primary/20 mx-auto mb-8 rounded-full" />

          {/* What's Available Now */}
          <div className="bg-card border rounded-xl p-6 mb-8 text-left">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              What's Available Now
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Global addiction statistics for 195 countries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>State-by-state data for the United States</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Compare statistics across different regions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Crisis hotline resources (988 & SAMHSA)</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="default" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link to="/compare">
              <Button variant="outline">
                Explore Statistics
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
