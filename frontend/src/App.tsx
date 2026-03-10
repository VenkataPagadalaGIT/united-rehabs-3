import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import './i18n';
import { ErrorBoundary } from "./components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NewsPage from "./pages/NewsPage";
import NewsArticlePage from "./pages/NewsArticlePage";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import DataMethodology from "./pages/DataMethodology";
import AccessibilityStatement from "./pages/AccessibilityStatement";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import DoNotSell from "./pages/DoNotSell";
import AffiliateDisclosure from "./pages/AffiliateDisclosure";
import LegalDisclaimer from "./pages/LegalDisclaimer";
import StatePage from "./pages/StatePage";
import CountryPage from "./pages/EnhancedCountryPage";
import RehabCenters from "./pages/RehabCenters";
import ComingSoon from "./pages/ComingSoon";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import Dashboard from "./pages/admin/Dashboard";
import StatisticsAdmin from "./pages/admin/StatisticsAdmin";
import SubstanceAdmin from "./pages/admin/SubstanceAdmin";
import ResourcesAdmin from "./pages/admin/ResourcesAdmin";
import SourcesAdmin from "./pages/admin/SourcesAdmin";
import GuidesAdmin from "./pages/admin/GuidesAdmin";
import FAQsAdmin from "./pages/admin/FAQsAdmin";
import ContentAdmin from "./pages/admin/ContentAdmin";
import SEOAdmin from "./pages/admin/SEOAdmin";
import SEOManagerAdmin from "./pages/admin/SEOManagerAdmin";
import ArticlesAdmin from "./pages/admin/ArticlesAdmin";
import ArticlesListPage from "./pages/ArticlesListPage";
import ArticlePage from "./pages/ArticlePage";
import ShortcodeShowcase from "./pages/ShortcodeShowcase";
import URLsAdmin from "./pages/admin/URLsAdmin";
import SecurityAdmin from "./pages/admin/SecurityAdmin";
import ContentGeneratorAdmin from "./pages/admin/ContentGeneratorAdmin";
import DataCoverageAdmin from "./pages/admin/DataCoverageAdmin";
import BulkImportAdmin from "./pages/admin/BulkImportAdmin";
import CMSAdmin from "./pages/admin/CMSAdmin";
import SERPValidationAdmin from "./pages/admin/SERPValidationAdmin";
import ComparePage from "./pages/ComparePage";
import DrugLawsHubPage from "./pages/DrugLawsHubPage";
import StateLawsPage from "./pages/StateLawsPage";
import CountyDrugLawsPage from "./pages/CountyDrugLawsPage";
import { CrisisHotlineBanner } from "./components/CrisisHotlineBanner";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { isValidCountrySlug } from "./data/countryConfig";
import { isValidStateSlug } from "./data/stateConfig";

const queryClient = new QueryClient();

// Helper component to route between state and country pages
// Handles: /state-addiction-stats, /state-addiction-rehabs, /state-addiction-stats-2025, etc.
const LocationPage = () => {
  // IMPORTANT: Strip year suffix FIRST, then strip type suffixes
  const slug = window.location.pathname.slice(1)
    .replace(/-\d{4}$/, "") // Strip year suffix FIRST (e.g., -2025, -2024)
    .replace(/-addiction-rehabs$/, "")
    .replace(/-addiction-rehab-centers$/, "")
    .replace(/-addiction-stats$/, "")
    .replace(/-addiction-free-resources$/, "")
    .replace(/-drug-laws$/, "");
  
  // US States take priority over countries with same name
  if (isValidStateSlug(slug)) {
    return <StatePage />;
  }
  
  if (isValidCountrySlug(slug)) {
    return <CountryPage />;
  }
  
  return <NotFound />;
};

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
      <BrowserRouter>
        <CrisisHotlineBanner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/data-methodology" element={<DataMethodology />} />
          <Route path="/accessibility" element={<AccessibilityStatement />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/do-not-sell" element={<DoNotSell />} />
          <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
          <Route path="/legal-disclaimer" element={<LegalDisclaimer />} />
          
          {/* Treatment Centers - Coming Soon */}
          <Route path="/rehab-centers" element={<ComingSoon />} />
          
          {/* Drug Laws Hub + State + County Law Pages */}
          <Route path="/drug-laws" element={<DrugLawsHubPage />} />
          <Route path="/drug-laws/:slug" element={<StateLawsPage />} />
          <Route path="/drug-laws/:state/:county" element={<CountyDrugLawsPage />} />

          {/* Country Comparison Tool */}
          <Route path="/compare" element={<ComparePage />} />
          
          {/* News & Blog */}
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsArticlePage />} />
          <Route path="/blog" element={<NewsPage />} />
          <Route path="/article" element={<NewsPage />} />
          <Route path="/guide" element={<ComingSoon />} />
          <Route path="/shortcodes" element={<ShortcodeShowcase />} />
          <Route path="/:type/:slug" element={<ArticlePage />} />
          
          {/* SEO-Optimized Location Pages (States + Countries) */}
          <Route path="/:slug" element={<LocationPage />} />
          
          
          {/* Admin Routes - Hidden URL for security */}
          <Route path="/you-are-the-admin/login" element={<AdminLogin />} />
          <Route path="/you-are-the-admin" element={<Admin />}>
            <Route index element={<Dashboard />} />
            <Route path="statistics" element={<StatisticsAdmin />} />
            <Route path="substance" element={<SubstanceAdmin />} />
            <Route path="resources" element={<ResourcesAdmin />} />
            <Route path="sources" element={<SourcesAdmin />} />
            <Route path="guides" element={<GuidesAdmin />} />
            <Route path="faqs" element={<FAQsAdmin />} />
            <Route path="content" element={<ContentAdmin />} />
            <Route path="seo" element={<SEOAdmin />} />
            <Route path="seo-manager" element={<SEOManagerAdmin />} />
            <Route path="articles" element={<ArticlesAdmin />} />
            <Route path="urls" element={<URLsAdmin />} />
            <Route path="security" element={<SecurityAdmin />} />
            <Route path="content-generator" element={<ContentGeneratorAdmin />} />
            <Route path="serp-validation" element={<SERPValidationAdmin />} />
            <Route path="data-coverage" element={<DataCoverageAdmin />} />
            <Route path="bulk-import" element={<BulkImportAdmin />} />
            <Route path="cms" element={<CMSAdmin />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsentBanner />
      </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
