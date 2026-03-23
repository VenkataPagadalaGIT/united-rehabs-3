import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { Helmet } from "react-helmet-async";
import { AlertTriangle, ArrowLeft, ArrowUp, Clock, Phone, Mail, MessageSquare, ChevronUp, ChevronDown } from "lucide-react";
import { ALL_COUNTRIES } from "@/data/countryConfig";
import { ALL_STATES } from "@/data/allStates";

const API = import.meta.env.REACT_APP_BACKEND_URL || "";

// Auto-link drug names, countries, states in content (each name once)
function autoLinkContent(html: string, currentSlug: string): string {
  if (!html) return "";
  let result = html;
  const linked = new Set<string>();
  
  const DRUGS: Record<string, string> = {
    "cychlorphine":"cychlorphine","fentanyl":"fentanyl","heroin":"heroin","cocaine":"cocaine",
    "methamphetamine":"methamphetamine","oxycodone":"oxycodone","morphine":"morphine",
    "naloxone":"naloxone","buprenorphine":"buprenorphine","methadone":"methadone",
    "carfentanil":"carfentanil","xylazine":"xylazine","nitazenes":"nitazenes","ketamine":"ketamine",
  };
  
  // Drug names (skip current drug)
  Object.entries(DRUGS).forEach(([name, slug]) => {
    if (slug === currentSlug || linked.has(name)) return;
    const regex = new RegExp(`(?<!<a[^>]*>)\\b(${name})\\b(?![^<]*<\\/a>)`, "i");
    if (regex.test(result)) {
      result = result.replace(regex, `<a href="/drugs/${slug}" class="text-primary hover:underline font-medium">$1</a>`);
      linked.add(name);
    }
  });
  
  ALL_COUNTRIES.forEach(c => {
    if (linked.has(c.name.toLowerCase())) return;
    const regex = new RegExp(`(?<!<a[^>]*>)\\b(${c.name})\\b(?![^<]*<\\/a>)`, "i");
    if (regex.test(result)) {
      result = result.replace(regex, `<a href="/${c.slug}-addiction-stats" class="text-primary hover:underline font-medium">${c.name}</a>`);
      linked.add(c.name.toLowerCase());
    }
  });
  
  ALL_STATES.forEach(s => {
    if (linked.has(s.name.toLowerCase())) return;
    const regex = new RegExp(`(?<!<a[^>]*>)\\b(${s.name})\\b(?![^<]*<\\/a>)`, "i");
    if (regex.test(result)) {
      result = result.replace(regex, `<a href="/${s.slug}-addiction-stats" class="text-primary hover:underline font-medium">${s.name}</a>`);
      linked.add(s.name.toLowerCase());
    }
  });
  
  return result;
}

// Extract H2 headings from HTML for TOC
function extractHeadings(html: string): Array<{id: string; text: string}> {
  const regex = /<h2[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h2>/gi;
  const headings: Array<{id: string; text: string}> = [];
  let match;
  let idx = 0;
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    const id = match[1] || `section-${idx}`;
    headings.push({ id, text });
    idx++;
  }
  return headings;
}

// Add IDs to H2 tags if missing
function addHeadingIds(html: string): string {
  let idx = 0;
  return html.replace(/<h2([^>]*)>/gi, (match, attrs) => {
    if (/id="/.test(attrs)) return match;
    const id = `section-${idx++}`;
    return `<h2${attrs} id="${id}">`;
  });
}

// Inject video after first table
function injectVideoAfterTable(html: string, videoId?: string): string {
  if (!videoId || html.includes("iframe")) return html;
  const tableEnd = html.indexOf("</table>");
  if (tableEnd === -1) return html;
  const pos = tableEnd + 8;
  const videoHtml = `<div style="margin:2rem 0;border-radius:12px;overflow:hidden"><div style="position:relative;padding-bottom:56.25%;height:0"><iframe src="https://www.youtube.com/embed/${videoId}" title="Related video" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div></div>`;
  return html.slice(0, pos) + videoHtml + html.slice(pos);
}

export default function DrugGuidePage() {
  const { slug } = useParams();
  const [activeSection, setActiveSection] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: guide, isLoading } = useQuery({
    queryKey: ["drug-guide", slug],
    queryFn: async () => {
      const res = await fetch(`${API}/api/drug-guides/${slug}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!slug,
    retry: false,
  });

  const hasContent = guide && guide.content && guide.content.length > 100;
  const drugName = guide?.name || slug?.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "";

  const processedContent = hasContent ? autoLinkContent(injectVideoAfterTable(addHeadingIds(guide.content), guide.youtube_id), slug || "") : "";
  const headings = hasContent ? extractHeadings(processedContent) : [];

  // Track active section on scroll
  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings, processedContent]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const currentIdx = headings.findIndex(h => h.id === activeSection);
  const prevSection = currentIdx > 0 ? headings[currentIdx - 1] : null;
  const nextSection = currentIdx < headings.length - 1 ? headings[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      {hasContent ? (
        <SEOHead
          pageSlug={`drugs/${slug}`}
          fallbackTitle={`${drugName} - Effects, Dangers, Addiction & Treatment`}
          fallbackDescription={guide.meta_description || `Complete guide to ${drugName}.`}
          keywords={guide.meta_keywords || `${drugName} effects, ${drugName} addiction`}
        />
      ) : (
        <>
          <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
          <SEOHead pageSlug={`drugs/${slug}`} fallbackTitle={`${drugName} Guide - Coming Soon`} />
        </>
      )}
      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/drugs" className="hover:text-primary">Drug Guide</Link>
            <span>/</span>
            <span className="text-foreground">{drugName}</span>
          </nav>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/2" />
              <div className="h-64 bg-muted rounded" />
            </div>
          ) : hasContent ? (
            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_250px] gap-8">

              {/* LEFT SIDEBAR - Table of Contents (sticky) */}
              <aside className="hidden lg:block">
                <div className="sticky top-20 space-y-4">
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-bold text-sm mb-3 text-foreground">{drugName}</h3>
                    <nav className="space-y-0.5 max-h-[60vh] overflow-y-auto">
                      {headings.map((h) => (
                        <button
                          key={h.id}
                          onClick={() => scrollToSection(h.id)}
                          className={`block w-full text-left text-xs py-1.5 px-2 rounded transition-colors ${
                            activeSection === h.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`}
                        >
                          {h.text}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Prev/Next navigation */}
                  <div className="flex flex-col gap-1">
                    {prevSection && (
                      <button onClick={() => scrollToSection(prevSection.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                        <ChevronUp className="h-3 w-3" /> {prevSection.text.slice(0, 25)}...
                      </button>
                    )}
                    {nextSection && (
                      <button onClick={() => scrollToSection(nextSection.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                        <ChevronDown className="h-3 w-3" /> {nextSection.text.slice(0, 25)}...
                      </button>
                    )}
                  </div>
                </div>
              </aside>

              {/* MAIN CONTENT */}
              <article ref={contentRef}>
                <h1 className="text-3xl font-bold text-foreground mb-2">{guide.name}</h1>
                {guide.category && (
                  <p className="text-sm text-muted-foreground mb-6">
                    Category: <Link to={`/drugs/category/${guide.category}`} className="text-primary hover:underline">{guide.category}</Link>
                  </p>
                )}

                {/* Key Takeaways */}
                {guide.key_takeaways?.length > 0 && (
                  <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-5 mb-8">
                    <h2 className="font-bold text-sm mb-3">Key Facts About {guide.name}</h2>
                    <ul className="space-y-1.5">
                      {guide.key_takeaways.map((point: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary mt-0.5">&gt;</span><span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Content */}
                <div
                  className="prose prose-slate max-w-none
                    prose-headings:font-bold prose-headings:text-foreground
                    prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-1.5 prose-h2:border-b prose-h2:border-border/50
                    prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
                    prose-p:text-[15px] prose-p:leading-[1.75] prose-p:mb-4 prose-p:text-muted-foreground
                    prose-li:text-[15px] prose-li:leading-[1.75] prose-li:text-muted-foreground prose-li:my-0.5
                    prose-ul:my-3 prose-ol:my-3
                    prose-strong:text-foreground
                    prose-a:text-primary hover:prose-a:underline
                    prose-table:text-sm prose-th:text-left prose-th:p-2 prose-th:bg-muted/50 prose-td:p-2 prose-td:border-t"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />

                {/* FAQ */}
                {guide.faq_items?.length > 0 && (
                  <section className="mt-10 bg-muted/30 rounded-xl p-6 border" id="faq">
                    <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                      {guide.faq_items.map((faq: any, i: number) => (
                        <div key={i}>
                          <h3 className="font-medium text-foreground text-sm mb-1">{faq.question}</h3>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </article>

              {/* RIGHT SIDEBAR */}
              <aside className="hidden lg:block">
                <div className="sticky top-20 space-y-4">
                  {/* Related Drugs */}
                  {guide.related_drugs?.length > 0 && (
                    <div className="bg-card border rounded-lg p-4">
                      <h3 className="font-bold text-sm mb-3">Related Drugs</h3>
                      <ul className="space-y-1.5">
                        {guide.related_drugs.map((d: string) => (
                          <li key={d}>
                            <Link to={`/drugs/${d}`} className="text-sm text-primary hover:underline">
                              {d.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Get Help */}
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-bold text-sm mb-3">Get Help</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-medium">Crisis Hotlines</div>
                          <div className="text-xs text-muted-foreground">988 (Suicide & Crisis)</div>
                          <div className="text-xs text-muted-foreground">1-800-662-4357 (SAMHSA)</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-medium">Email</div>
                          <Link to="/contact" className="text-xs text-primary hover:underline">Use the contact form</Link>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-medium">Contact Form</div>
                          <div className="text-xs text-muted-foreground">We'll get back to you</div>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Need Help */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-bold text-sm mb-2">Need Immediate Help?</h3>
                    <p className="text-xs text-muted-foreground">
                      If you or someone you know is in crisis, please call one of the hotlines above. They are available 24/7 and completely confidential.
                    </p>
                  </div>

                  {/* Back to top */}
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary w-full justify-center py-2 border rounded-lg"
                  >
                    <ArrowUp className="h-3 w-3" /> Back to top
                  </button>
                </div>
              </aside>
            </div>
          ) : (
            /* Coming Soon */
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">{drugName} Guide</h1>
              <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                Our comprehensive guide to {drugName} is coming soon.
              </p>
              <p className="text-xs text-muted-foreground mb-8">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                If you need help, call <strong>988</strong> or <strong>1-800-662-4357</strong>
              </p>
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
