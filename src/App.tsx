import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          
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
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
