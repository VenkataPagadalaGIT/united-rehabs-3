import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";

const API = import.meta.env.REACT_APP_BACKEND_URL || "";

const CATEGORY_INFO: Record<string, { title: string; description: string }> = {
  opioids: { title: "Opioids", description: "Natural, semi-synthetic, and synthetic opioids including fentanyl, heroin, oxycodone, and morphine." },
  stimulants: { title: "Stimulants", description: "Drugs that increase alertness and energy including cocaine, methamphetamine, and prescription stimulants." },
  depressants: { title: "Depressants", description: "Central nervous system depressants including benzodiazepines, barbiturates, and sleep medications." },
  hallucinogens: { title: "Hallucinogens", description: "Substances that alter perception including LSD, psilocybin, DMT, and PCP." },
  cannabis: { title: "Cannabis", description: "Marijuana, THC, CBD, and related cannabis products." },
  "synthetic-drugs": { title: "Synthetic Drugs", description: "Lab-created substances including synthetic cannabinoids (K2/Spice), bath salts, and novel psychoactive substances." },
  "prescription-drugs": { title: "Prescription Drugs", description: "Commonly misused prescription medications including painkillers, sedatives, and stimulants." },
  "club-drugs": { title: "Club Drugs", description: "Substances associated with nightlife including MDMA, GHB, ketamine, and rohypnol." },
  inhalants: { title: "Inhalants", description: "Volatile substances inhaled for psychoactive effects including solvents, aerosols, and gases." },
  alcohol: { title: "Alcohol", description: "Ethanol-based beverages and their effects on health, addiction, and treatment." },
  nicotine: { title: "Nicotine & Tobacco", description: "Cigarettes, vaping, smokeless tobacco, and nicotine addiction." },
  "treatment-medications": { title: "Treatment Medications", description: "Medications used to treat addiction including naloxone, buprenorphine, methadone, and naltrexone." },
};

export default function DrugCategoryPage() {
  const { category } = useParams();
  const info = CATEGORY_INFO[category || ""] || { title: category?.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()), description: "" };

  const { data: guides = [] } = useQuery({
    queryKey: ["drug-guides-category", category],
    queryFn: async () => {
      const res = await fetch(`${API}/api/drug-guides?category=${category}`);
      if (!res.ok) return [];
      const d = await res.json();
      return Array.isArray(d) ? d : d.items || [];
    },
    enabled: !!category,
  });

  const hasGuides = guides.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {hasGuides ? (
        <SEOHead
          pageSlug={`drugs/category/${category}`}
          fallbackTitle={`${info.title} - Drug Guide & Information`}
          fallbackDescription={info.description}
          keywords={`${info.title}, ${info.title} drugs, ${info.title} effects, ${info.title} addiction, ${info.title} treatment`}
        />
      ) : (
        <>
          <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
          <SEOHead pageSlug={`drugs/category/${category}`} fallbackTitle={`${info.title} - Coming Soon`} />
        </>
      )}
      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/drugs" className="hover:text-primary">Drug Guide</Link>
            <span>/</span>
            <span className="text-foreground">{info.title}</span>
          </nav>

          <h1 className="text-3xl font-bold text-foreground mb-2">{info.title}</h1>
          <p className="text-muted-foreground mb-8">{info.description}</p>

          {hasGuides ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {guides.map((g: any) => (
                <Link key={g.slug} to={`/drugs/${g.slug}`} className="p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all">
                  <div className="font-medium text-sm text-foreground">{g.name}</div>
                  {g.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{g.excerpt}</p>}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border rounded-xl bg-muted/20">
              <p className="text-muted-foreground mb-2">Content for {info.title} is coming soon.</p>
              <Link to="/drugs" className="text-primary hover:underline text-sm flex items-center justify-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Browse All Drugs
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
