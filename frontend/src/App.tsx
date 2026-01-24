import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './i18n';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AccessibilityStatement from "./pages/AccessibilityStatement";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import DoNotSell from "./pages/DoNotSell";
import AffiliateDisclosure from "./pages/AffiliateDisclosure";
import LegalDisclaimer from "./pages/LegalDisclaimer";
import StatePage from "./pages/StatePage";
import CountryPage from "./pages/CountryPage";
import RehabCenters from "./pages/RehabCenters";
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
import ComparePage from "./pages/ComparePage";
import { CrisisHotlineBanner } from "./components/CrisisHotlineBanner";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { isValidCountrySlug } from "./data/countryConfig";
import { isValidStateSlug } from "./data/stateConfig";

const queryClient = new QueryClient();

// Helper component to route between state and country pages
const LocationPage = () => {
  const slug = window.location.pathname.slice(1).replace(/-addiction-rehabs$/, "").replace(/-addiction-stats$/, "");
  
  if (isValidCountrySlug(slug)) {
    return <CountryPage />;
  }
  
  if (isValidStateSlug(slug)) {
    return <StatePage />;
  }
  
  return <NotFound />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CrisisHotlineBanner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/accessibility" element={<AccessibilityStatement />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/do-not-sell" element={<DoNotSell />} />
          <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
          <Route path="/legal-disclaimer" element={<LegalDisclaimer />} />
          
          {/* Treatment Centers - International */}
          <Route path="/rehab-centers" element={<RehabCenters />} />
          
          {/* Blog, News, Articles routes */}
          <Route path="/blog" element={<ArticlesListPage />} />
          <Route path="/news" element={<ArticlesListPage />} />
          <Route path="/article" element={<ArticlesListPage />} />
          <Route path="/guide" element={<ArticlesListPage />} />
          <Route path="/shortcodes" element={<ShortcodeShowcase />} />
          <Route path="/:type/:slug" element={<ArticlePage />} />
          
          {/* SEO-Optimized Location Pages (States + Countries) */}
          <Route path="/:slug" element={<LocationPage />} />
          
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />}>
            <Route index element={<Dashboard />} />
            <Route path="statistics" element={<StatisticsAdmin />} />
            <Route path="substance" element={<SubstanceAdmin />} />
            <Route path="resources" element={<ResourcesAdmin />} />
            <Route path="sources" element={<SourcesAdmin />} />
            <Route path="guides" element={<GuidesAdmin />} />
            <Route path="faqs" element={<FAQsAdmin />} />
            <Route path="content" element={<ContentAdmin />} />
            <Route path="seo" element={<SEOAdmin />} />
            <Route path="articles" element={<ArticlesAdmin />} />
            <Route path="urls" element={<URLsAdmin />} />
            <Route path="security" element={<SecurityAdmin />} />
            <Route path="content-generator" element={<ContentGeneratorAdmin />} />
            <Route path="data-coverage" element={<DataCoverageAdmin />} />
            <Route path="bulk-import" element={<BulkImportAdmin />} />
            <Route path="cms" element={<CMSAdmin />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsentBanner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
