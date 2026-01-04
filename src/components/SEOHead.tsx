import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SEOHeadProps {
  pageSlug: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

interface PageSEO {
  meta_title: string;
  meta_description: string | null;
  meta_keywords: string[] | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  robots: string | null;
}

export const SEOHead = ({ pageSlug, fallbackTitle, fallbackDescription }: SEOHeadProps) => {
  const { data: seo } = useQuery({
    queryKey: ["page-seo", pageSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_seo")
        .select("meta_title, meta_description, meta_keywords, og_title, og_description, og_image_url, canonical_url, robots")
        .eq("page_slug", pageSlug)
        .eq("is_active", true)
        .single();
      
      if (error) return null;
      return data as PageSEO;
    },
  });

  useEffect(() => {
    // Update document title
    const title = seo?.meta_title || fallbackTitle || "United Rehabs";
    document.title = title;

    // Update or create meta tags
    const updateMeta = (name: string, content: string | null, isProperty = false) => {
      if (!content) return;
      
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute("content", content);
    };

    // Meta description
    updateMeta("description", seo?.meta_description || fallbackDescription || null);
    
    // Keywords
    if (seo?.meta_keywords?.length) {
      updateMeta("keywords", seo.meta_keywords.join(", "));
    }
    
    // Robots
    updateMeta("robots", seo?.robots || "index, follow");
    
    // Open Graph
    updateMeta("og:title", seo?.og_title || seo?.meta_title || fallbackTitle || null, true);
    updateMeta("og:description", seo?.og_description || seo?.meta_description || fallbackDescription || null, true);
    updateMeta("og:type", "website", true);
    
    if (seo?.og_image_url) {
      updateMeta("og:image", seo.og_image_url, true);
    }
    
    // Twitter Card
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", seo?.og_title || seo?.meta_title || fallbackTitle || null);
    updateMeta("twitter:description", seo?.og_description || seo?.meta_description || fallbackDescription || null);
    
    if (seo?.og_image_url) {
      updateMeta("twitter:image", seo.og_image_url);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (seo?.canonical_url) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", seo.canonical_url);
    } else if (canonical) {
      canonical.remove();
    }

    // Cleanup on unmount
    return () => {
      document.title = "United Rehabs";
    };
  }, [seo, fallbackTitle, fallbackDescription]);

  return null; // This component doesn't render anything
};

// Hook to get SEO content data (h1, intro) for use in page components
export const usePageSEO = (pageSlug: string) => {
  return useQuery({
    queryKey: ["page-seo-content", pageSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_seo")
        .select("h1_title, intro_text, meta_title")
        .eq("page_slug", pageSlug)
        .eq("is_active", true)
        .single();
      
      if (error) return null;
      return data;
    },
  });
};
