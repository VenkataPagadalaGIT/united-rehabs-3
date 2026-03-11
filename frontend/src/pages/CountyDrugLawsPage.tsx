import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/listing/Header";
import { Breadcrumb } from "@/components/listing/Breadcrumb";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { getStateBySlug } from "@/data/stateConfig";
import api from "@/lib/api";
import {
  Scale, Shield, Gavel, Heart, Phone, ExternalLink,
  MapPin, HelpCircle, Building2, BookOpen, AlertTriangle, ChevronRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleToolbar } from "@/components/ArticleToolbar";

const BASE_URL = "https://unitedrehabs.com";

interface CountyDrugLaw {
  state_id: string;
  state_name: string;
  county_name: string;
  county_slug: string;
  population?: number;
  overview?: string;
  local_enforcement?: string;
  drug_courts?: string;
  treatment_resources?: string;
  diversion_programs?: string;
  legal_resources?: string;
  local_statistics?: string;
  notable_local_laws?: string;
  key_facts?: string[];
  da_office_url?: string;
  public_defender_url?: string;
  drug_court_url?: string;
  treatment_hotline?: string;
  faqs?: { question: string; answer: string }[];
  sources?: { title: string; url: string; description?: string }[];
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
}

// Content section renderer
function ContentSection({ icon: Icon, title, content, id }: {
  icon: React.ElementType; title: string; content?: string; id: string;
}) {
  if (!content) return null;
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="flex items-center gap-2 text-xl font-bold text-foreground mb-3 mt-8">
        <Icon className="h-5 w-5 text-primary" /> {title}
      </h2>
      <div
        className="prose prose-slate max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
}

export default function CountyDrugLawsPage() {
  const { state: stateSlug, county: countySlug } = useParams();
  const stateConfig = getStateBySlug(stateSlug || "");

  const { data: county, isLoading, error } = useQuery<CountyDrugLaw>({
    queryKey: ["county-law", stateConfig?.abbreviation, countySlug],
    queryFn: async () => {
      const res = await api.get(`/api/county-laws/${stateConfig!.abbreviation}/${countySlug}`);
      return res.data;
    },
    enabled: !!stateConfig && !!countySlug,
    retry: false,
  });

  // Also fetch other counties in this state for sidebar
  const { data: siblingCounties = [] } = useQuery<CountyDrugLaw[]>({
    queryKey: ["county-laws-list", stateConfig?.abbreviation],
    queryFn: async () => {
      const res = await api.get(`/api/county-laws/${stateConfig!.abbreviation}`);
      return res.data;
    },
    enabled: !!stateConfig,
  });

  if (!stateConfig) return <Navigate to="/drug-laws" replace />;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header navItems={mockNavItems} />
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !county) {
    return (
      <div className="min-h-screen bg-background">
        <Header navItems={mockNavItems} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">County Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We don't have drug law data for this county yet.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to={`/drug-laws/${stateSlug}`} className="text-primary hover:underline">
              View {stateConfig.name} Drug Laws
            </Link>
            <Link to="/drug-laws" className="text-primary hover:underline">
              All State Drug Laws
            </Link>
          </div>
        </div>
        <Footer linkGroups={mockFooterLinks} />
      </div>
    );
  }

  const stateName = county.state_name;
  const countyName = county.county_name;
  const pageSlug = `drug-laws/${stateSlug}/${countySlug}`;

  const breadcrumbItems = [
    { label: "Drug Laws", href: "/drug-laws" },
    { label: `${stateName} Drug Laws`, href: `/drug-laws/${stateSlug}` },
    { label: countyName, href: `/${pageSlug}` },
  ];

  const faqJsonLd = county.faqs?.length ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: county.faqs.map(f => ({
      "@type": "Question", name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  const articleJsonLd = {
    "@context": "https://schema.org", "@type": "Article",
    headline: `${countyName} Drug Laws & Penalties - ${stateName}`,
    description: county.meta_description || `Drug laws, enforcement, and treatment resources in ${countyName}, ${stateName}`,
    url: `${BASE_URL}/${pageSlug}`,
    dateModified: county.updated_at || new Date().toISOString(),
    publisher: { "@type": "Organization", name: "United Rehabs", url: BASE_URL },
    spatialCoverage: { "@type": "Place", name: `${countyName}, ${stateName}, United States` },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Drug Laws", item: `${BASE_URL}/drug-laws` },
      { "@type": "ListItem", position: 3, name: `${stateName} Drug Laws`, item: `${BASE_URL}/drug-laws/${stateSlug}` },
      { "@type": "ListItem", position: 4, name: countyName, item: `${BASE_URL}/${pageSlug}` },
    ],
  };

  const otherCounties = siblingCounties.filter(c => c.county_slug !== countySlug).slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        fallbackTitle={county.meta_title || `${countyName} Drug Laws - Penalties, Enforcement & Resources (${stateName})`}
        fallbackDescription={county.meta_description || `${countyName}, ${stateName} drug laws: local enforcement, drug courts, treatment resources, diversion programs, and legal aid.`}
        keywords={`${countyName} drug laws, ${countyName} drug court, ${countyName} drug penalties, ${countyName} treatment, ${stateName} drug laws`}
        pageSlug={pageSlug}
        ogImage="https://unitedrehabs.com/og-drug-laws.png"
        jsonLd={articleJsonLd}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
      </Helmet>
      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />

        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="pt-4 pb-3 border-b border-gray-200 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {countyName} Drug Laws: Enforcement, Courts & Resources
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {countyName}, {stateName}
              </span>
              {county.population && (
                <span>Pop: {county.population.toLocaleString()}</span>
              )}
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> For educational purposes only — not legal advice
              </span>
            </div>
          </div>

          <ArticleToolbar
            title={`${countyName} Drug Laws - ${stateName}`}
            url={`${BASE_URL}/${pageSlug}`}
            content={county.overview || ""}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mt-6">
            {/* Main Content */}
            <article>
              {/* Key Facts */}
              {county.key_facts && county.key_facts.length > 0 && (
                <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-5 mb-6">
                  <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" /> Key Facts
                  </h2>
                  <ul className="space-y-2">
                    {county.key_facts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Note about state law */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Drug laws in {countyName} are governed by {stateName} state law.
                  County-level differences exist in enforcement priorities, drug court availability,
                  prosecution policies, and treatment resources.{" "}
                  <Link to={`/drug-laws/${stateSlug}`} className="underline hover:no-underline">
                    View full {stateName} drug laws
                  </Link>
                </p>
              </div>

              <ContentSection icon={BookOpen} title="Overview" content={county.overview} id="overview" />
              <ContentSection icon={Gavel} title="Local Enforcement" content={county.local_enforcement} id="enforcement" />
              <ContentSection icon={Building2} title="Drug Courts" content={county.drug_courts} id="drug-courts" />
              <ContentSection icon={Heart} title="Treatment Resources" content={county.treatment_resources} id="treatment" />
              <ContentSection icon={Shield} title="Diversion Programs" content={county.diversion_programs} id="diversion" />
              <ContentSection icon={Scale} title="Notable Local Laws & Ordinances" content={county.notable_local_laws} id="local-laws" />
              <ContentSection icon={BookOpen} title="Legal Resources" content={county.legal_resources} id="legal" />

              {/* Local Statistics */}
              {county.local_statistics && (
                <ContentSection icon={MapPin} title="Local Statistics" content={county.local_statistics} id="stats" />
              )}

              {/* FAQs */}
              {county.faqs && county.faqs.length > 0 && (
                <section className="mt-10 bg-muted/30 rounded-xl p-6 border" id="faq">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" /> Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {county.faqs.map((faq, i) => (
                      <div key={i}>
                        <h3 className="font-medium text-foreground mb-1">{faq.question}</h3>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Sources */}
              {county.sources && county.sources.length > 0 && (
                <section className="mt-8 border-t pt-6" id="sources">
                  <h2 className="text-lg font-semibold mb-3">Sources</h2>
                  <ul className="space-y-2">
                    {county.sources.map((src, i) => (
                      <li key={i} className="text-sm">
                        {src.url ? (
                          <a href={src.url} target="_blank" rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" /> {src.title}
                          </a>
                        ) : (
                          <span>{src.title}</span>
                        )}
                        {src.description && (
                          <span className="text-muted-foreground ml-2">— {src.description}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Quick Contacts */}
              <div className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> Local Contacts
                </h3>
                <ul className="space-y-2 text-sm">
                  {county.da_office_url && (
                    <li>
                      <a href={county.da_office_url} target="_blank" rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> District Attorney's Office
                      </a>
                    </li>
                  )}
                  {county.public_defender_url && (
                    <li>
                      <a href={county.public_defender_url} target="_blank" rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Public Defender
                      </a>
                    </li>
                  )}
                  {county.drug_court_url && (
                    <li>
                      <a href={county.drug_court_url} target="_blank" rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Drug Court Program
                      </a>
                    </li>
                  )}
                  {county.treatment_hotline && (
                    <li className="text-muted-foreground">
                      <strong>Hotline:</strong> {county.treatment_hotline}
                    </li>
                  )}
                  {!county.da_office_url && !county.public_defender_url && !county.drug_court_url && (
                    <li className="text-muted-foreground">Contact info coming soon</li>
                  )}
                </ul>
              </div>

              {/* State Law Link */}
              <div className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold text-foreground mb-3 text-sm">{stateName} Pages</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to={`/drug-laws/${stateSlug}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Scale className="h-3 w-3" /> {stateName} Drug Laws
                    </Link>
                  </li>
                  <li>
                    <Link to={`/${stateSlug}-addiction-stats`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {stateName} Statistics
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Other Counties */}
              {otherCounties.length > 0 && (
                <div className="bg-card rounded-xl border p-5">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">
                    Other {stateName} Counties
                  </h3>
                  <ul className="space-y-1.5">
                    {otherCounties.map(c => (
                      <li key={c.county_slug}>
                        <Link
                          to={`/drug-laws/${stateSlug}/${c.county_slug}`}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {c.county_name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
