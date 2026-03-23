import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { Helmet } from "react-helmet-async";
import { AlertTriangle, ArrowLeft, Clock } from "lucide-react";

const API = import.meta.env.REACT_APP_BACKEND_URL || "";

export default function DrugGuidePage() {
  const { slug } = useParams();

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

  return (
    <div className="min-h-screen bg-background">
      {hasContent ? (
        <SEOHead
          pageSlug={`drugs/${slug}`}
          fallbackTitle={`${drugName} - Effects, Dangers, Addiction & Treatment`}
          fallbackDescription={guide.meta_description || `Complete guide to ${drugName}: short and long-term effects, overdose risks, addiction signs, statistics, and treatment options.`}
          keywords={guide.meta_keywords || `${drugName}, ${drugName} effects, ${drugName} addiction, ${drugName} overdose, ${drugName} treatment`}
        />
      ) : (
        <>
          <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
          <SEOHead
            pageSlug={`drugs/${slug}`}
            fallbackTitle={`${drugName} Guide - Coming Soon`}
            fallbackDescription={`Information about ${drugName} is coming soon to United Rehabs.`}
          />
        </>
      )}
      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
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
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-64 bg-muted rounded" />
            </div>
          ) : hasContent ? (
            /* Full drug guide page */
            <article>
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
                        <span className="text-primary mt-1">&gt;</span>{point}
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
                  prose-li:text-[15px] prose-li:leading-[1.75] prose-li:text-muted-foreground
                  prose-ul:my-3 prose-ol:my-3
                  prose-strong:text-foreground
                  prose-a:text-primary hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: guide.content }}
              />

              {/* FAQ */}
              {guide.faq_items?.length > 0 && (
                <section className="mt-10 bg-muted/30 rounded-xl p-6 border">
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

              {/* Sources */}
              {guide.sources?.length > 0 && (
                <section className="mt-8 pt-6 border-t">
                  <h2 className="text-sm font-semibold mb-3">Sources</h2>
                  <ul className="space-y-1">
                    {guide.sources.map((s: any, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        {s.url ? <a href={s.url} rel="nofollow" className="text-primary hover:underline">{s.name}</a> : s.name}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
          ) : (
            /* Coming Soon - noindex already set above */
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">{drugName} Guide</h1>
              <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                Our comprehensive guide to {drugName} - including effects, dangers, addiction signs, and treatment options - is coming soon.
              </p>
              <p className="text-xs text-muted-foreground mb-8">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                If you need immediate help, call <strong>988</strong> (Crisis Lifeline) or <strong>1-800-662-4357</strong> (SAMHSA)
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
