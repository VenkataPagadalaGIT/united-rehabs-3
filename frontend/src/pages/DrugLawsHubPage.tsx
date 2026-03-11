import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/listing/Header";
import { Breadcrumb } from "@/components/listing/Breadcrumb";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { ALL_STATES } from "@/data/allStates";
import { Scale, MapPin, Search } from "lucide-react";
import { useState } from "react";

const REGIONS: Record<string, string> = {
  northeast: "Northeast",
  southeast: "Southeast",
  midwest: "Midwest",
  southwest: "Southwest",
  west: "West",
};

export default function DrugLawsHubPage() {
  const [search, setSearch] = useState("");

  const filtered = search
    ? ALL_STATES.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : ALL_STATES;

  const grouped = Object.entries(REGIONS).map(([key, label]) => ({
    region: label,
    states: filtered.filter(s => s.region === key).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter(g => g.states.length > 0);

  const breadcrumbItems = [
    { label: "Drug Laws by State", href: "/drug-laws" },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://unitedrehabs.com" },
      { "@type": "ListItem", position: 2, name: "Drug Laws", item: "https://unitedrehabs.com/drug-laws" },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "US State Drug Laws - All 50 States",
    description: "Browse drug laws, penalties, and legal resources for all 50 US states. Possession charges, marijuana status, DUI/DWI laws, and treatment alternatives.",
    url: "https://unitedrehabs.com/drug-laws",
    publisher: { "@type": "Organization", name: "United Rehabs", url: "https://unitedrehabs.com" },
    numberOfItems: 50,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        fallbackTitle="Drug Laws by State - Possession Penalties, Marijuana Status & Legal Resources"
        fallbackDescription="Browse drug laws for all 50 US states. Find possession penalties, marijuana status, DUI/DWI laws, Good Samaritan protections, drug courts, and treatment alternatives."
        keywords="drug laws by state, state drug laws, drug possession penalties, marijuana laws by state, DUI laws, drug courts, Good Samaritan law"
        pageSlug="drug-laws"
        ogImage="https://unitedrehabs.com/og-drug-laws.png"
        jsonLd={jsonLd}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />

        {/* Hero */}
        <div className="max-w-5xl mx-auto pt-6 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Drug Laws by State
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mb-2">
            Comprehensive guide to drug possession penalties, marijuana status, DUI/DWI laws,
            Good Samaritan protections, drug courts, and treatment alternatives across all 50 US states.
          </p>
          <p className="text-sm text-amber-600 font-medium">
            For educational purposes only — not legal advice. Consult a licensed attorney for legal counsel.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search states..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* States by Region */}
        <div className="max-w-5xl mx-auto pb-12 space-y-8">
          {grouped.map(({ region, states }) => (
            <section key={region}>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {region}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {states.map((state) => (
                  <Link
                    key={state.id}
                    to={`/drug-laws/${state.slug}`}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border bg-card hover:border-primary hover:shadow-sm transition-all group"
                  >
                    <Scale className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {state.name}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">{state.abbreviation}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No states match "{search}"</p>
          )}
        </div>

        {/* SEO internal links */}
        <div className="max-w-5xl mx-auto pb-12 border-t pt-8">
          <h2 className="text-lg font-semibold mb-4">Related Resources</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/compare" className="text-primary hover:underline">Compare States</Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/news" className="text-primary hover:underline">Latest News</Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/data-methodology" className="text-primary hover:underline">Data Methodology</Link>
          </div>
        </div>
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
