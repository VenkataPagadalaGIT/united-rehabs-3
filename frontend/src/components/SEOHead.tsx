import { Helmet } from "react-helmet-async";

const BASE_URL = "https://unitedrehabs.com";
const SITE_NAME = "United Rehabs";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

interface SEOHeadProps {
  pageSlug?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  keywords?: string;
  noIndex?: boolean;
  ogType?: string;
  ogImage?: string;
  jsonLd?: object;
}

export const SEOHead = ({
  pageSlug,
  fallbackTitle,
  fallbackDescription,
  keywords,
  noIndex = false,
  ogType = "website",
  ogImage,
  jsonLd,
}: SEOHeadProps) => {
  const title = fallbackTitle
    ? `${fallbackTitle} | ${SITE_NAME}`
    : `${SITE_NAME} - Global Addiction Statistics & Data`;

  const description = fallbackDescription
    || "Comprehensive addiction statistics and data for 195 countries. Verified data from WHO, CDC, SAMHSA and official health ministries worldwide.";

  const canonicalPath = pageSlug ? `/${pageSlug}` : "";
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  const defaultJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
    description,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
    },
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="author" content={SITE_NAME} />
      <meta name="publisher" content={SITE_NAME} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage || DEFAULT_OG_IMAGE} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || DEFAULT_OG_IMAGE} />
      <meta name="twitter:site" content="@UnitedRehabs" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd || defaultJsonLd)}
      </script>
    </Helmet>
  );
};

// Pre-built SEO configs for different page types
export function stateStatsSEO(stateName: string, stateSlug: string, year?: number | null) {
  const yearStr = year ? ` (${year})` : "";
  return {
    fallbackTitle: `${stateName} Addiction Statistics${yearStr} - Treatment Data & Trends`,
    fallbackDescription: `${stateName} addiction statistics${yearStr}: overdose deaths, treatment admissions, recovery rates, substance use data. Sourced from CDC, SAMHSA & state health departments.`,
    keywords: `${stateName} addiction statistics, ${stateName} drug overdose deaths, ${stateName} substance abuse data, ${stateName} treatment centers, ${stateName} recovery rate, ${stateName} opioid crisis${year ? `, ${year} data` : ""}`,
    pageSlug: year ? `${stateSlug}-addiction-stats-${year}` : `${stateSlug}-addiction-stats`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: `${stateName} Addiction Statistics${yearStr}`,
      description: `Comprehensive addiction and substance use disorder statistics for ${stateName}${yearStr}`,
      url: `${BASE_URL}/${stateSlug}-addiction-stats${year ? `-${year}` : ""}`,
      publisher: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
      temporalCoverage: year ? String(year) : "2019/2025",
      spatialCoverage: { "@type": "Place", name: `${stateName}, United States` },
      isAccessibleForFree: true,
      license: "https://creativecommons.org/licenses/by/4.0/",
    },
  };
}

export function stateRehabsSEO(stateName: string, stateSlug: string) {
  return {
    fallbackTitle: `${stateName} Addiction Treatment & Rehab Centers`,
    fallbackDescription: `Find addiction treatment centers and rehab facilities in ${stateName}. Compare statistics, view resources, and access recovery support services.`,
    keywords: `${stateName} rehab centers, ${stateName} addiction treatment, ${stateName} drug rehab, ${stateName} substance abuse treatment, ${stateName} recovery programs`,
    pageSlug: `${stateSlug}-addiction-rehabs`,
  };
}

export function countryStatsSEO(countryName: string, countrySlug: string, year?: number | null) {
  const yearStr = year ? ` (${year})` : "";
  return {
    fallbackTitle: `${countryName} Addiction Statistics${yearStr} - Global Substance Use Data`,
    fallbackDescription: `${countryName} addiction statistics${yearStr}: drug use prevalence, overdose deaths, treatment centers, recovery rates. Data from WHO, UNODC & national health agencies.`,
    keywords: `${countryName} addiction statistics, ${countryName} drug use data, ${countryName} substance abuse, ${countryName} overdose deaths, ${countryName} treatment gap, global addiction data${year ? `, ${year}` : ""}`,
    pageSlug: year ? `${countrySlug}-addiction-stats-${year}` : `${countrySlug}-addiction-stats`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: `${countryName} Addiction Statistics${yearStr}`,
      description: `Addiction and substance use disorder data for ${countryName}${yearStr}`,
      url: `${BASE_URL}/${countrySlug}-addiction-stats${year ? `-${year}` : ""}`,
      publisher: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
      temporalCoverage: year ? String(year) : "2019/2025",
      spatialCoverage: { "@type": "Place", name: countryName },
      isAccessibleForFree: true,
    },
  };
}

export default SEOHead;
