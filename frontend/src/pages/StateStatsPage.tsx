import { useParams, Navigate, Link } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Breadcrumb } from "@/components/listing/Breadcrumb";
import { PageHero } from "@/components/listing/PageHero";
import { StatisticsTab } from "@/components/listing/tabs/StatisticsTab";
import { DynamicFAQ } from "@/components/listing/DynamicFAQ";
import { Footer } from "@/components/listing/Footer";
import { SEOHead, stateStatsSEO } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { getStateBySlug, toState } from "@/data/stateConfig";
import { Calendar } from "lucide-react";

const AVAILABLE_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019];

const StateStatsPage = () => {
  const { slug } = useParams();
  
  // Parse year from URL if present
  const yearMatch = slug?.match(/-(\d{4})$/);
  const selectedYear = yearMatch ? parseInt(yearMatch[1]) : null;
  const baseSlug = yearMatch ? slug!.replace(/-\d{4}$/, "") : slug || "";
  
  const stateKey = baseSlug.replace(/-addiction-stats$/, "");
  const stateConfig = getStateBySlug(stateKey);
  
  if (!stateConfig) {
    return <Navigate to="/" replace />;
  }

  const state = toState(stateConfig);

  const breadcrumbItems = [
    { label: "United States", href: "/united-states" },
    { label: stateConfig.name, href: `/${stateKey}-addiction-stats` },
    ...(selectedYear ? [{ label: `${selectedYear} Data`, href: `/${stateKey}-addiction-stats-${selectedYear}` }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        pageSlug={slug || ""} 
        fallbackTitle={`${state.name} Addiction Statistics${selectedYear ? ` (${selectedYear})` : ''}`}
        fallbackDescription={`Comprehensive addiction statistics for ${state.name}${selectedYear ? ` - ${selectedYear} data` : ''}`}
      />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />
        <PageHero state={state} />
        
        <div className="py-8">
          <StatisticsTab stateId={stateConfig.abbreviation} stateName={state.name} stateSlug={stateKey} urlYear={selectedYear} />
        </div>

        {/* Year-based internal links for SEO */}
        <nav className="py-8 border-t" aria-label="Historical data by year" data-testid="year-links">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {state.name} Addiction Data by Year
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_YEARS.map((year) => (
              <Link
                key={year}
                to={`/${stateKey}-addiction-stats-${year}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  selectedYear === year
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'
                }`}
                data-testid={`year-link-${year}`}
              >
                {year}
              </Link>
            ))}
            {selectedYear && (
              <Link
                to={`/${stateKey}-addiction-stats`}
                className="px-4 py-2 rounded-lg text-sm font-medium border bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
              >
                Latest Data
              </Link>
            )}
          </div>
          {/* SEO: Also link to rehabs page */}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link to={`/${stateKey}-addiction-rehabs`} className="text-primary hover:underline">
              {state.name} Treatment Centers
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/compare" className="text-primary hover:underline">
              Compare with Other States
            </Link>
          </div>
        </nav>
      </main>

      <DynamicFAQ stateId={stateConfig.abbreviation} stateName={state.name} />
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default StateStatsPage;
