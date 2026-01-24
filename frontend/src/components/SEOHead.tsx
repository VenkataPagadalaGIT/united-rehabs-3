import { useQuery } from "@tanstack/react-query";
import { pageSeoApi } from "@/lib/api";

interface SEOData {
  page_slug: string;
  page_type: string;
  meta_title: string;
  meta_description: string | null;
  h1_title: string | null;
  intro_text: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  state_id: string | null;
  is_active: boolean;
}

interface SEOHeadProps {
  pageSlug?: string;
  defaultTitle?: string;
  defaultDescription?: string;
}

export const usePageSEO = (pageSlug?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["page-seo", pageSlug],
    queryFn: async () => {
      if (!pageSlug) return null;
      return await pageSeoApi.getBySlug(pageSlug);
    },
    enabled: !!pageSlug,
  });

  return {
    seo: data as SEOData | null,
    isLoading,
    error,
    // Helpers
    title: data?.meta_title || "",
    description: data?.meta_description || "",
    h1: data?.h1_title || "",
    intro: data?.intro_text || "",
  };
};

export const SEOHead = ({ pageSlug, defaultTitle, defaultDescription }: SEOHeadProps) => {
  const { seo } = usePageSEO(pageSlug);

  const title = seo?.meta_title || defaultTitle || "United Rehabs";
  const description = seo?.meta_description || defaultDescription || "Find addiction treatment centers nationwide";

  // Note: This component relies on document.title being set
  // For proper SEO, consider using react-helmet or similar
  if (typeof document !== 'undefined') {
    document.title = title;
  }

  return null; // SEO tags should be handled via react-helmet or similar
};

export default SEOHead;
