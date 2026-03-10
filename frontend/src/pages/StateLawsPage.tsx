import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/listing/Header";
import { Breadcrumb } from "@/components/listing/Breadcrumb";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { getStateBySlug } from "@/data/stateConfig";
import api from "@/lib/api";
import {
  AlertTriangle, ExternalLink, Scale, Shield, BookOpen, Gavel,
  FileText, Heart, Clock, ChevronRight, List, Phone, MapPin,
  Leaf, Syringe, Car, Building2, HelpCircle, ArrowUp, UserCheck
} from "lucide-react";
import { ArticleToolbar } from "@/components/ArticleToolbar";
import { sanitizeHtml } from "@/lib/sanitize";

const BASE_URL = "https://unitedrehabs.com";

// ----- Types -----
interface LawSource { name: string; section: string; url: string; accessed_date: string; }
interface PenaltyRow { offense: string; substance?: string; amount?: string; classification: string; jail_time: string; fine: string; }
interface DrugSchedule { schedule: string; description: string; examples: string; }
interface FAQ { question: string; answer: string; }

interface StateDrugLaw {
  _id: string; state_id: string; state_name: string;
  key_takeaways: string[]; overview: string; possession_penalties: string;
  dui_dwi_laws: string; marijuana_status: string; marijuana_details: string;
  good_samaritan_law: string; good_samaritan_exists: boolean;
  naloxone_access: string; drug_courts: string; mandatory_minimums: string;
  recent_changes: string; treatment_alternatives: string;
  penalty_table: PenaltyRow[]; drug_schedules: DrugSchedule[]; faqs: FAQ[];
  sources: LawSource[]; state_bar_url: string; state_bar_name: string;
  legal_aid_url: string; meta_title: string; meta_description: string;
  reviewed_by: string; reviewer_credentials: string;
  status: string; last_verified_date: string; confidence_score: number;
  created_at: string; updated_at: string;
}

// ----- TOC Config -----
const TOC_SECTIONS = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "drug-schedules", label: "Drug Schedules", icon: Syringe },
  { id: "penalties", label: "Penalty Chart", icon: Gavel },
  { id: "possession", label: "Possession Laws", icon: Scale },
  { id: "dui", label: "DUI / DWI", icon: Car },
  { id: "marijuana", label: "Marijuana", icon: Leaf },
  { id: "good-samaritan", label: "Good Samaritan", icon: Shield },
  { id: "naloxone", label: "Naloxone", icon: Heart },
  { id: "drug-courts", label: "Drug Courts", icon: Building2 },
  { id: "mandatory-minimums", label: "Mandatory Mins", icon: Gavel },
  { id: "treatment", label: "Treatment Alternatives", icon: UserCheck },
  { id: "recent-changes", label: "Recent Changes", icon: Clock },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "sources", label: "Sources", icon: BookOpen },
];

// ----- Components -----

const KeyTakeaways = ({ items, stateName }: { items: string[]; stateName: string }) => {
  if (!items?.length) return null;
  return (
    <section id="key-takeaways" className="scroll-mt-20 mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h2 className="text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
          <List className="h-4 w-4" />
          {stateName} Drug Laws: Key Takeaways
        </h2>
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-blue-800 text-sm leading-snug">
              <ChevronRight className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const CompactTOC = ({ sections, law }: { sections: typeof TOC_SECTIONS; law: StateDrugLaw }) => {
  const visible = sections.filter(({ id }) => {
    if (id === "drug-schedules") return law.drug_schedules?.length > 0;
    if (id === "penalties") return law.penalty_table?.length > 0;
    if (id === "possession") return !!law.possession_penalties;
    if (id === "dui") return !!law.dui_dwi_laws;
    if (id === "marijuana") return !!law.marijuana_status || !!law.marijuana_details;
    if (id === "good-samaritan") return !!law.good_samaritan_law;
    if (id === "naloxone") return !!law.naloxone_access;
    if (id === "drug-courts") return !!law.drug_courts;
    if (id === "mandatory-minimums") return !!law.mandatory_minimums;
    if (id === "treatment") return !!law.treatment_alternatives;
    if (id === "recent-changes") return !!law.recent_changes;
    if (id === "faq") return law.faqs?.length > 0;
    if (id === "sources") return law.sources?.length > 0;
    return !!law.overview;
  });

  return (
    <nav className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-8" aria-label="Table of contents">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Jump to section</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-1">
        {visible.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="flex items-center gap-1.5 py-1 text-xs text-gray-600 hover:text-primary transition-colors truncate"
          >
            <Icon className="h-3 w-3 flex-shrink-0" />
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
};

const DrugScheduleTable = ({ schedules, stateName }: { schedules: DrugSchedule[]; stateName: string }) => {
  if (!schedules?.length) return null;
  return (
    <section id="drug-schedules" className="scroll-mt-20 mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Syringe className="h-5 w-5 text-primary" />
        {stateName} Drug Schedule Classifications
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="px-4 py-2.5 text-left font-semibold rounded-tl-lg">Schedule</th>
              <th className="px-4 py-2.5 text-left font-semibold">Description</th>
              <th className="px-4 py-2.5 text-left font-semibold rounded-tr-lg">Examples</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-2.5 font-semibold text-gray-900 border-b border-gray-100 whitespace-nowrap">{s.schedule}</td>
                <td className="px-4 py-2.5 text-gray-700 border-b border-gray-100">{s.description}</td>
                <td className="px-4 py-2.5 text-gray-600 border-b border-gray-100">{s.examples}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const PenaltyTable = ({ rows, stateName }: { rows: PenaltyRow[]; stateName: string }) => {
  if (!rows?.length) return null;
  const hasSub = rows.some(r => r.substance);
  const hasAmt = rows.some(r => r.amount);
  return (
    <section id="penalties" className="scroll-mt-20 mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Gavel className="h-5 w-5 text-primary" />
        {stateName} Drug Penalty Chart
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="px-3 py-2.5 text-left font-semibold rounded-tl-lg">Offense</th>
              {hasSub && <th className="px-3 py-2.5 text-left font-semibold">Substance</th>}
              {hasAmt && <th className="px-3 py-2.5 text-left font-semibold">Amount</th>}
              <th className="px-3 py-2.5 text-left font-semibold">Classification</th>
              <th className="px-3 py-2.5 text-left font-semibold">Jail / Prison</th>
              <th className="px-3 py-2.5 text-left font-semibold rounded-tr-lg">Max Fine</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-50 transition-colors`}>
                <td className="px-3 py-2 font-medium text-gray-900 border-b border-gray-100">{r.offense}</td>
                {hasSub && <td className="px-3 py-2 text-gray-700 border-b border-gray-100">{r.substance || "-"}</td>}
                {hasAmt && <td className="px-3 py-2 text-gray-700 border-b border-gray-100">{r.amount || "-"}</td>}
                <td className="px-3 py-2 border-b border-gray-100">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    r.classification.toLowerCase().includes("felony")
                      ? "bg-red-100 text-red-700"
                      : r.classification.toLowerCase().includes("misdemeanor")
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  }`}>{r.classification}</span>
                </td>
                <td className="px-3 py-2 text-gray-700 border-b border-gray-100">{r.jail_time}</td>
                <td className="px-3 py-2 text-gray-700 border-b border-gray-100">{r.fine}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const LawSection = ({ id, icon: Icon, title, content }: { id: string; icon: React.ElementType; title: string; content: string }) => {
  if (!content) return null;
  const hasHtml = /<[a-z][\s\S]*>/i.test(content);
  return (
    <section id={id} className="scroll-mt-20 mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h2>
      {hasHtml ? (
        <div
          className="prose prose-gray max-w-none text-gray-700 leading-relaxed prose-p:mb-3 prose-ul:my-2 prose-li:my-0 prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
        />
      ) : (
        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {content}
        </div>
      )}
    </section>
  );
};

const FAQSection = ({ faqs, stateName }: { faqs: FAQ[]; stateName: string }) => {
  const [open, setOpen] = useState<number | null>(null);
  if (!faqs?.length) return null;
  return (
    <section id="faq" className="scroll-mt-20 mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-primary" />
        Frequently Asked Questions: {stateName} Drug Laws
      </h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 text-sm pr-4">{faq.question}</span>
              <ChevronRight className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${open === i ? "rotate-90" : ""}`} />
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const SourceCitations = ({ sources, stateBarUrl, stateBarName, legalAidUrl }: {
  sources: LawSource[]; stateBarUrl: string; stateBarName: string; legalAidUrl: string;
}) => (
  <section id="sources" className="scroll-mt-20 mt-10 pt-8 border-t border-gray-200">
    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <BookOpen className="h-5 w-5 text-primary" />
      Sources & Citations
    </h2>
    {sources?.length > 0 && (
      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 mb-6">
        {sources.map((src, i) => (
          <li key={i}>
            <span className="font-medium text-gray-800">{src.name}</span>
            {src.section && <span className="text-gray-500"> — {src.section}</span>}
            {src.url && (
              <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1 inline-flex items-center gap-1">
                View source <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {src.accessed_date && <span className="text-gray-400 ml-1">(Accessed {src.accessed_date})</span>}
          </li>
        ))}
      </ol>
    )}
    <div className="flex flex-wrap gap-3">
      {stateBarUrl && (
        <a href={stateBarUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
          <Scale className="h-4 w-4" /> {stateBarName || "State Bar Association"} <ExternalLink className="h-3 w-3" />
        </a>
      )}
      {legalAidUrl && (
        <a href={legalAidUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
          <Heart className="h-4 w-4" /> Free Legal Aid <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  </section>
);

const TreatmentCTA = ({ stateName, stateKey }: { stateName: string; stateKey: string }) => (
  <div className="bg-gradient-to-r from-primary/10 to-orange-50 border border-primary/20 rounded-xl p-5 my-8">
    <h3 className="text-lg font-bold text-gray-900 mb-2">Facing Drug Charges in {stateName}?</h3>
    <p className="text-gray-700 text-sm mb-4">
      Many {stateName} courts offer treatment-based alternatives to incarceration. Drug court programs, diversion
      programs, and court-ordered rehab can help you get treatment instead of jail time.
    </p>
    <div className="flex flex-wrap gap-3">
      <Link to={`/${stateKey}-addiction-rehabs`}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
        <MapPin className="h-4 w-4" /> Find Treatment in {stateName}
      </Link>
      <a href="tel:1-800-662-4357"
        className="inline-flex items-center gap-2 px-5 py-2.5 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors">
        <Phone className="h-4 w-4" /> SAMHSA Helpline: 1-800-662-4357
      </a>
    </div>
  </div>
);

// Sticky sidebar for desktop
const Sidebar = ({ stateName, stateKey, law }: { stateName: string; stateKey: string; law: StateDrugLaw }) => (
  <aside className="hidden lg:block w-72 flex-shrink-0">
    <div className="sticky top-24 space-y-5">
      {/* Location pages hub */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{stateName} Pages</h3>
        <div className="space-y-1.5">
          <Link to={`/${stateKey}-addiction-stats`}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors">
            <FileText className="h-3.5 w-3.5 text-primary flex-shrink-0" /> {stateName} Addiction Statistics
          </Link>
          <div
            className="flex items-center gap-2 px-2 py-1.5 rounded text-sm font-medium text-primary bg-primary/5">
            <Gavel className="h-3.5 w-3.5 flex-shrink-0" /> {stateName} Drug Laws
          </div>
          <Link to={`/${stateKey}-addiction-rehabs`}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors">
            <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" /> {stateName} Treatment Centers
            <span className="text-[10px] text-gray-400 font-medium">(Coming Soon)</span>
          </Link>
        </div>
      </div>

      {/* Sitewide links */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Explore</h3>
        <div className="space-y-1.5">
          <Link to="/compare"
            className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors">
            <Scale className="h-3.5 w-3.5 text-primary flex-shrink-0" /> Compare All States
          </Link>
          <Link to="/news"
            className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors">
            <FileText className="h-3.5 w-3.5 text-primary flex-shrink-0" /> Latest News
          </Link>
        </div>
      </div>

      {/* Quick facts card */}
      {law && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Facts</h3>
          <div className="space-y-2.5 text-sm">
            {law.marijuana_status && (
              <div>
                <span className="text-gray-500 block text-xs">Marijuana</span>
                <span className={`font-medium ${
                  law.marijuana_status.toLowerCase().includes("legal") ? "text-green-700" :
                  law.marijuana_status.toLowerCase().includes("medical") ? "text-blue-700" :
                  law.marijuana_status.toLowerCase().includes("decriminalized") ? "text-yellow-700" :
                  "text-red-700"
                }`}>{law.marijuana_status}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500 block text-xs">Good Samaritan Law</span>
              <span className={`font-medium ${law.good_samaritan_exists ? "text-green-700" : "text-red-700"}`}>
                {law.good_samaritan_exists ? "Yes - Active" : "No"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Simple Possession</span>
              <span className="font-medium text-gray-800">Misdemeanor</span>
            </div>
            {law.last_verified_date && (
              <div>
                <span className="text-gray-500 block text-xs">Last Verified</span>
                <span className="font-medium text-gray-800">{law.last_verified_date}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SAMHSA CTA */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
        <p className="text-xs text-gray-600 mb-2">Need help now?</p>
        <a href="tel:1-800-662-4357" className="text-primary font-bold text-sm hover:underline flex items-center justify-center gap-1">
          <Phone className="h-3.5 w-3.5" /> 1-800-662-4357
        </a>
        <p className="text-xs text-gray-400 mt-1">SAMHSA Helpline (24/7)</p>
      </div>

      {/* External resources */}
      {(law?.state_bar_url || law?.legal_aid_url) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Legal Resources</h3>
          <div className="space-y-2">
            {law.state_bar_url && (
              <a href={law.state_bar_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
                <Scale className="h-3.5 w-3.5" /> {law.state_bar_name || "State Bar"} <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            )}
            {law.legal_aid_url && (
              <a href={law.legal_aid_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
                <Heart className="h-3.5 w-3.5" /> Free Legal Aid <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  </aside>
);

const BackToTop = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  if (!show) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
      aria-label="Back to top">
      <ArrowUp className="h-4 w-4" />
    </button>
  );
};

// ----- Main Page -----
const StateLawsPage = () => {
  const { slug } = useParams();
  // Support both /drug-laws/:slug (new) and /:slug-drug-laws (legacy)
  const rawSlug = slug || "";
  const stateKey = rawSlug.replace(/-\d{4}$/, "").replace(/-drug-laws$/, "");
  const stateConfig = getStateBySlug(stateKey);

  const { data: law, isLoading, error } = useQuery<StateDrugLaw>({
    queryKey: ["state-law", stateConfig?.abbreviation],
    queryFn: async () => {
      const res = await api.get(`/api/state-laws/${stateConfig!.abbreviation}`);
      return res.data;
    },
    enabled: !!stateConfig,
    retry: false,
  });

  // Fetch counties for this state
  const { data: counties = [] } = useQuery<{ county_name: string; county_slug: string; population?: number }[]>({
    queryKey: ["county-laws-list", stateConfig?.abbreviation],
    queryFn: async () => {
      const res = await api.get(`/api/county-laws/${stateConfig!.abbreviation}`);
      return res.data;
    },
    enabled: !!stateConfig,
  });

  if (!stateConfig) return <Navigate to="/" replace />;

  const stateName = stateConfig.name;
  const pageSlug = `drug-laws/${stateKey}`;

  const breadcrumbItems = [
    { label: "United States", href: "/united-states" },
    { label: "Drug Laws", href: "/drug-laws" },
    { label: stateName, href: `/${stateKey}-addiction-stats` },
    { label: "Drug Laws & Penalties", href: `/drug-laws/${stateKey}` },
  ];

  const faqJsonLd = law?.faqs?.length ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: law.faqs.map(f => ({
      "@type": "Question", name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  const articleJsonLd = {
    "@context": "https://schema.org", "@type": "Article",
    headline: `${stateName} Drug Laws: Penalties, Charges & Treatment Options (2026)`,
    description: `Comprehensive guide to drug laws and penalties in ${stateName}`,
    url: `${BASE_URL}/${pageSlug}`,
    datePublished: law?.created_at || new Date().toISOString(),
    dateModified: law?.updated_at || new Date().toISOString(),
    publisher: { "@type": "Organization", name: "United Rehabs", url: BASE_URL },
    ...(law?.reviewed_by ? { author: { "@type": "Person", name: law.reviewed_by, description: law.reviewer_credentials } } : {}),
    spatialCoverage: { "@type": "Place", name: `${stateName}, United States` },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem", position: i + 1, name: item.label, item: `${BASE_URL}${item.href}`,
    })),
  };

  const seoProps = {
    fallbackTitle: law?.meta_title || `${stateName} Drug Laws: Penalties, Charges & Treatment Options (2026)`,
    fallbackDescription: law?.meta_description || `${stateName} drug laws: possession penalties, marijuana status, DUI/DWI laws, Good Samaritan protections, drug courts, and free legal resources. Updated 2026.`,
    keywords: `${stateName} drug laws, ${stateName} drug possession penalties, ${stateName} marijuana laws, ${stateName} DUI laws, ${stateName} drug courts`,
    pageSlug,
    jsonLd: articleJsonLd,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...seoProps} />
      <Helmet>
        {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4">
        <Breadcrumb items={breadcrumbItems} />

        {/* Title + meta line — tight, no wasted space */}
        <div className="max-w-5xl mx-auto">
          <div className="pt-4 pb-3 border-b border-gray-200 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {stateName} Drug Laws: Penalties, Charges & Treatment Options
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              {law?.last_verified_date && (
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Verified {law.last_verified_date}</span>
              )}
              {law?.reviewed_by && (
                <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" /> {law.reviewed_by}</span>
              )}
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {stateName}, US</span>
              <a
                href="#legal-disclaimer"
                onClick={(e) => { e.preventDefault(); document.getElementById("legal-disclaimer")?.scrollIntoView({ behavior: "smooth" }); }}
                className="flex items-center gap-1 text-amber-600 hover:text-amber-800 hover:underline cursor-pointer transition-colors"
              >
                <AlertTriangle className="h-3 w-3" /> For educational purposes only — not legal advice
              </a>
            </div>
          </div>

          {/* Share / Listen toolbar */}
          <ArticleToolbar
            title={`${stateName} Drug Laws: Penalties, Charges & Treatment Options`}
            url={`${BASE_URL}/${pageSlug}`}
            content={law?.overview || ""}
          />

          {/* Loading */}
          {isLoading && (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-gray-500">Loading law data...</p>
            </div>
          )}

          {/* No Data */}
          {error && !law && (
            <div className="py-16 text-center">
              <Scale className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Law Data Coming Soon</h2>
              <p className="text-gray-500 mb-6">
                We are compiling verified drug law information for {stateName} with statutory citations.
              </p>
              <Link to={`/${stateKey}-addiction-stats`} className="text-primary hover:underline font-medium">
                View {stateName} Addiction Statistics
              </Link>
            </div>
          )}

          {/* Main Content: article + sidebar layout */}
          {law && (
            <div className="flex gap-8">
              {/* Article column */}
              <div className="flex-1 min-w-0">
                {/* Key Takeaways FIRST — above the fold */}
                <KeyTakeaways items={law.key_takeaways} stateName={stateName} />

                {/* Compact TOC */}
                <CompactTOC sections={TOC_SECTIONS} law={law} />

                {/* Overview */}
                <LawSection id="overview" icon={FileText} title={`${stateName} Drug Law Overview`} content={law.overview} />

                {/* Drug Schedule Table */}
                <DrugScheduleTable schedules={law.drug_schedules} stateName={stateName} />

                {/* Penalty Chart */}
                <PenaltyTable rows={law.penalty_table} stateName={stateName} />

                {/* Possession */}
                <LawSection id="possession" icon={Scale} title={`Is Drug Possession a Felony in ${stateName}?`} content={law.possession_penalties} />

                {/* DUI/DWI */}
                <LawSection id="dui" icon={Car} title={`${stateName} Drug DUI / DWI Laws`} content={law.dui_dwi_laws} />

                {/* Marijuana */}
                {(law.marijuana_status || law.marijuana_details) && (
                  <section id="marijuana" className="scroll-mt-20 mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-primary" />
                      {stateName} Marijuana Laws
                    </h2>
                    {law.marijuana_status && (
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-3 ${
                        law.marijuana_status.toLowerCase().includes("recreational") || law.marijuana_status.toLowerCase().includes("legal")
                          ? "bg-green-100 text-green-800"
                          : law.marijuana_status.toLowerCase().includes("medical")
                            ? "bg-blue-100 text-blue-800"
                            : law.marijuana_status.toLowerCase().includes("decriminalized")
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}>Status: {law.marijuana_status}</div>
                    )}
                    {law.marijuana_details && (
                      /<[a-z][\s\S]*>/i.test(law.marijuana_details)
                        ? <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed prose-p:mb-3 prose-strong:text-gray-900" dangerouslySetInnerHTML={{ __html: sanitizeHtml(law.marijuana_details) }} />
                        : <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">{law.marijuana_details}</div>
                    )}
                  </section>
                )}

                {/* Good Samaritan */}
                {law.good_samaritan_law && (
                  <section id="good-samaritan" className="scroll-mt-20 mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      {stateName} Good Samaritan Law
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        law.good_samaritan_exists ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>{law.good_samaritan_exists ? "Yes - Active" : "Not Enacted"}</span>
                    </h2>
                    {/<[a-z][\s\S]*>/i.test(law.good_samaritan_law)
                      ? <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed prose-p:mb-3 prose-strong:text-gray-900" dangerouslySetInnerHTML={{ __html: sanitizeHtml(law.good_samaritan_law) }} />
                      : <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">{law.good_samaritan_law}</div>
                    }
                  </section>
                )}

                <LawSection id="naloxone" icon={Heart} title={`${stateName} Naloxone (Narcan) Access`} content={law.naloxone_access} />
                <LawSection id="drug-courts" icon={Building2} title={`${stateName} Drug Courts & Diversion Programs`} content={law.drug_courts} />
                <LawSection id="mandatory-minimums" icon={Gavel} title={`Does ${stateName} Have Mandatory Minimums for Drugs?`} content={law.mandatory_minimums} />
                <LawSection id="treatment" icon={UserCheck} title="Treatment Alternatives to Incarceration" content={law.treatment_alternatives} />

                <TreatmentCTA stateName={stateName} stateKey={stateKey} />

                <LawSection id="recent-changes" icon={Clock} title={`New ${stateName} Drug Laws (2025-2026)`} content={law.recent_changes} />
                <FAQSection faqs={law.faqs} stateName={stateName} />

                <SourceCitations
                  sources={law.sources || []}
                  stateBarUrl={law.state_bar_url}
                  stateBarName={law.state_bar_name}
                  legalAidUrl={law.legal_aid_url}
                />

                {/* Full legal disclaimer — anchor target from top link */}
                <div id="legal-disclaimer" className="scroll-mt-20 bg-amber-50 border border-amber-200 rounded-lg p-5 mt-10 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-amber-800 font-bold text-sm mb-1">Legal Disclaimer</h3>
                      <p className="text-amber-700 text-sm leading-relaxed">
                        The information on this page is provided for <strong>general educational purposes only</strong> and
                        does <strong>not</strong> constitute legal advice. Laws change frequently, and their application
                        depends on specific facts and circumstances. This content should not be relied upon as a substitute
                        for consultation with a qualified attorney licensed in your state. United Rehabs is not a law firm
                        and does not provide legal services. If you need legal advice, contact a{" "}
                        {law.state_bar_url ? (
                          <a href={law.state_bar_url} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                            licensed attorney or your state bar association
                          </a>
                        ) : (
                          "licensed attorney or your state bar association"
                        )}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <Sidebar stateName={stateName} stateKey={stateKey} law={law} />
            </div>
          )}

          {/* Mobile cross-links (hidden on desktop where sidebar shows) */}
          {law && (
            <nav className="py-6 border-t lg:hidden" aria-label="Related pages">
              <h3 className="text-sm font-bold text-gray-900 mb-3">More {stateName} Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Link to={`/${stateKey}-addiction-stats`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-200">
                  <FileText className="h-4 w-4 text-primary" /> Addiction Statistics
                </Link>
                <Link to={`/${stateKey}-addiction-rehabs`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-200">
                  <MapPin className="h-4 w-4 text-primary" /> Treatment Centers <span className="text-[10px] text-gray-400">(Coming Soon)</span>
                </Link>
                <Link to="/compare"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-200">
                  <Scale className="h-4 w-4 text-primary" /> Compare States
                </Link>
              </div>
            </nav>
          )}
        </div>
      </main>

      {/* County Drug Laws Section */}
      {counties.length > 0 && (
        <section className="container mx-auto px-4 py-10 border-t">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              {stateName} Drug Laws by County
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              View county-specific enforcement, drug courts, treatment resources, and local legal aid.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {counties.map(c => (
                <Link
                  key={c.county_slug}
                  to={`/drug-laws/${stateKey}/${c.county_slug}`}
                  className="px-3 py-2 rounded-lg border bg-card hover:border-primary text-sm text-foreground hover:text-primary transition-colors"
                >
                  {c.county_name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer linkGroups={mockFooterLinks} />
      <BackToTop />
    </div>
  );
};

export default StateLawsPage;
