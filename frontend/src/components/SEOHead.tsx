import { useQuery } from "@tanstack/react-query";
import { pageSeoApi } from "@/lib/api";
import { Helmet } from "react-helmet";

interface SEOHeadProps {
  pageSlug?: string;
  defaultTitle?: string;
  defaultDescription?: string;
}

export const SEOHead = ({ pageSlug, defaultTitle, defaultDescription }: SEOHeadProps) => {
  const { data: seoData } = useQuery({
    queryKey: ["page-seo", pageSlug],
    queryFn: async () => {
      if (!pageSlug) return null;
      return await pageSeoApi.getBySlug(pageSlug);
    },
    enabled: !!pageSlug,
  });

  const title = seoData?.meta_title || defaultTitle || "United Rehabs";
  const description = seoData?.meta_description || defaultDescription || "Find addiction treatment centers nationwide";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {seoData?.og_title && <meta property="og:title" content={seoData.og_title} />}
      {seoData?.og_description && <meta property="og:description" content={seoData.og_description} />}
      {seoData?.og_image_url && <meta property="og:image" content={seoData.og_image_url} />}
      {seoData?.canonical_url && <link rel="canonical" href={seoData.canonical_url} />}
    </>
  );
};

export default SEOHead;
