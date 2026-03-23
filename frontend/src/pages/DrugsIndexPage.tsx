import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";

const API = import.meta.env.REACT_APP_BACKEND_URL || "";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Drug categories relevant to addiction
const CATEGORIES = [
  { name: "Opioids", slug: "opioids" },
  { name: "Stimulants", slug: "stimulants" },
  { name: "Depressants", slug: "depressants" },
  { name: "Hallucinogens", slug: "hallucinogens" },
  { name: "Cannabis", slug: "cannabis" },
  { name: "Synthetic Drugs", slug: "synthetic-drugs" },
  { name: "Prescription Drugs", slug: "prescription-drugs" },
  { name: "Club Drugs", slug: "club-drugs" },
  { name: "Inhalants", slug: "inhalants" },
  { name: "Alcohol", slug: "alcohol" },
  { name: "Nicotine & Tobacco", slug: "nicotine" },
  { name: "Treatment Medications", slug: "treatment-medications" },
];

// Popular/most searched drugs
const POPULAR_DRUGS = [
  "Fentanyl", "Heroin", "Cocaine", "Methamphetamine", "Xanax", "Adderall",
  "Oxycodone", "Hydrocodone", "Morphine", "Tramadol", "Kratom", "MDMA",
  "LSD", "Psilocybin", "Ketamine", "PCP", "GHB", "Cychlorphine",
  "Carfentanil", "Buprenorphine", "Methadone", "Naloxone", "Naltrexone",
  "Gabapentin", "Clonazepam", "Alprazolam", "Diazepam", "Lorazepam",
  "Amphetamine", "Ritalin", "Modafinil", "Codeine", "Suboxone",
  "Vivitrol", "Marijuana", "THC", "CBD", "Nicotine", "Alcohol",
  "Xylazine", "Nitazenes", "Benzodiazepines", "Barbiturates",
  "Inhalants", "Spice", "K2", "Bath Salts", "Flakka", "Khat",
];

export default function DrugsIndexPage() {
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const { data: drugsData } = useQuery({
    queryKey: ["drug-guides-list"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/drug-guides?limit=500`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const drugs = Array.isArray(drugsData) ? drugsData : drugsData?.items || [];

  // Group drugs by first letter
  const drugsByLetter: Record<string, typeof drugs> = {};
  const allDrugNames = [...new Set([...POPULAR_DRUGS, ...drugs.map((d: any) => d.name)])].sort();
  
  for (const name of allDrugNames) {
    const letter = name[0].toUpperCase();
    if (!drugsByLetter[letter]) drugsByLetter[letter] = [];
    const dbDrug = drugs.find((d: any) => d.name?.toLowerCase() === name.toLowerCase());
    drugsByLetter[letter].push({
      name,
      slug: dbDrug?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-"),
      hasPage: !!dbDrug,
    });
  }

  const filteredDrugs = activeLetter ? { [activeLetter]: drugsByLetter[activeLetter] || [] } : drugsByLetter;

  return (
    <div className="min-h-screen bg-background" data-testid="drugs-index">
      <SEOHead
        pageSlug="drugs"
        fallbackTitle="Drug Guide A-Z - Types, Effects, Dangers & Statistics"
        fallbackDescription="Comprehensive drug guide covering opioids, stimulants, depressants, hallucinogens, and more. Effects, dangers, addiction signs, death rates, and treatment options."
        keywords="drug guide, drug types, drug effects, opioids, fentanyl, cocaine, methamphetamine, addiction, overdose, treatment"
      />
      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <h1 className="text-3xl font-bold text-foreground mb-2">Drug Guide A-Z</h1>
          <p className="text-muted-foreground mb-8">
            Comprehensive information on substances of abuse - effects, dangers, addiction signs, statistics, and treatment options.
          </p>

          {/* A-Z Browser */}
          <div className="mb-10" data-testid="az-browser">
            <h2 className="text-lg font-semibold text-foreground mb-3">Browse A-Z</h2>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveLetter(null)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  !activeLetter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All
              </button>
              {ALPHABET.map((letter) => {
                const hasItems = !!drugsByLetter[letter]?.length;
                return (
                  <button
                    key={letter}
                    onClick={() => setActiveLetter(letter === activeLetter ? null : letter)}
                    className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                      activeLetter === letter
                        ? "bg-primary text-primary-foreground"
                        : hasItems
                        ? "bg-muted text-foreground hover:bg-primary/10"
                        : "bg-muted/50 text-muted-foreground/50 cursor-default"
                    }`}
                    disabled={!hasItems}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Browse by Category */}
          <div className="mb-10" data-testid="drug-categories">
            <h2 className="text-lg font-semibold text-foreground mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/drugs/category/${cat.slug}`}
                  className="text-primary hover:underline text-sm py-1"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Drug Searches */}
          {!activeLetter && (
            <div className="mb-10" data-testid="popular-drugs">
              <h2 className="text-lg font-semibold text-foreground mb-4">Popular Drug Searches</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-1.5">
                {POPULAR_DRUGS.slice(0, 40).map((name) => {
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  const dbDrug = drugs.find((d: any) => d.name?.toLowerCase() === name.toLowerCase());
                  return (
                    <Link
                      key={name}
                      to={`/drugs/${slug}`}
                      className="text-primary hover:underline text-sm py-0.5"
                    >
                      {name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drug List by Letter */}
          <div data-testid="drug-list">
            {activeLetter && (
              <h2 className="text-2xl font-bold text-foreground mb-4">Drugs: {activeLetter}</h2>
            )}
            {Object.entries(filteredDrugs)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([letter, items]) => (
                <div key={letter} className="mb-6" id={`letter-${letter}`}>
                  {!activeLetter && (
                    <h3 className="text-base font-bold text-foreground border-b border-border pb-1 mb-3">{letter}</h3>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-1">
                    {(items as any[]).map((drug: any) => (
                      <Link
                        key={drug.slug}
                        to={`/drugs/${drug.slug}`}
                        className="text-primary hover:underline text-sm py-0.5"
                      >
                        {drug.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-10 pt-6 border-t text-xs text-muted-foreground">
            <p>This drug guide is for educational purposes only. It is not medical advice. Always consult a healthcare professional before making decisions about substance use or treatment. If you need help, call <strong>988</strong> (Crisis Lifeline) or <strong>1-800-662-4357</strong> (SAMHSA).</p>
          </div>
        </div>
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
