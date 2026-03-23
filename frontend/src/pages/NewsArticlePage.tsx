import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Eye, User, ArrowLeft, ExternalLink, MapPin, Share2, Copy, Check, Headphones, Play, Pause, Square } from "lucide-react";
import { ALL_COUNTRIES } from "@/data/countryConfig";
import { ALL_STATES } from "@/data/allStates";
import { Helmet } from "react-helmet-async";
import { useState, useRef, useEffect, useCallback } from "react";
import { sanitizeHtml } from "@/lib/sanitize";
import { ArticleToolbar } from "@/components/ArticleToolbar";
import { JumpToSection, extractTocFromHtml, extractSummaryBox } from "@/components/JumpToSection";

const API = import.meta.env.REACT_APP_BACKEND_URL || "";

// Build lookup maps for contextual linking
const countryMap = new Map(ALL_COUNTRIES.map(c => [c.name.toLowerCase(), c]));
const stateMap = new Map(ALL_STATES.map(s => [s.name.toLowerCase(), s]));


function contextualAutoLink(html: string): string {
  if (!html) return "";
  let result = html;
  const linked = new Set<string>();
  
  // RULE: Each name gets linked only ONCE (first occurrence)
  // Don't link inside existing <a> tags
  ALL_COUNTRIES.forEach(c => {
    if (linked.has(c.name.toLowerCase())) return;
    const regex = new RegExp(`(?<!<a[^>]*>)\\b(${c.name})\\b(?![^<]*<\\/a>)`, "i");
    if (regex.test(result)) {
      result = result.replace(regex, `<a href="/${c.slug}-addiction-stats" class="text-primary hover:underline font-medium" title="${c.name} Addiction Statistics">${c.name}</a>`);
      linked.add(c.name.toLowerCase());
    }
  });
  
  ALL_STATES.forEach(s => {
    if (linked.has(s.name.toLowerCase())) return;
    const regex = new RegExp(`(?<!<a[^>]*>)\\b(${s.name})\\b(?![^<]*<\\/a>)`, "i");
    if (regex.test(result)) {
      result = result.replace(regex, `<a href="/${s.slug}-addiction-stats" class="text-primary hover:underline font-medium" title="${s.name} Addiction Statistics">${s.name}</a>`);
      linked.add(s.name.toLowerCase());
    }
  });
  
  return result;
}

// Rule 4: Freshness signal - show "Updated X ago" if modified after publish
function getFreshnessText(publishedAt: string, updatedAt: string): string | null {
  if (!publishedAt || !updatedAt) return null;
  const pub = new Date(publishedAt).getTime();
  const upd = new Date(updatedAt).getTime();
  const diffMs = upd - pub;
  if (diffMs < 3600000) return null; // less than 1 hour difference, skip
  const now = Date.now();
  const agoMs = now - upd;
  if (agoMs < 3600000) return "Updated just now";
  if (agoMs < 86400000) return `Updated ${Math.floor(agoMs / 3600000)}h ago`;
  if (agoMs < 604800000) return `Updated ${Math.floor(agoMs / 86400000)}d ago`;
  return `Updated ${new Date(updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export default function NewsArticlePage() {
  const { slug } = useParams();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["news-article", slug],
    queryFn: async () => {
      const res = await fetch(`${API}/api/news/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: sidebarLinks = [] } = useQuery({
    queryKey: ["sidebar-links"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/config/sidebar-links`);
      return res.json();
    },
  });

  // Related articles
  const { data: relatedData } = useQuery({
    queryKey: ["related-news", article?.tags?.[0]],
    queryFn: async () => {
      const tag = article?.tags?.[0];
      if (!tag) return { items: [] };
      const res = await fetch(`${API}/api/articles?content_type=news&is_published=true&tag=${tag}&limit=4`);
      return res.json();
    },
    enabled: !!article?.tags?.length,
  });

  const relatedArticles = (relatedData?.items || []).filter((a: any) => a.slug !== slug).slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header navItems={mockNavItems} />
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <Header navItems={mockNavItems} />
        <Helmet><meta name="robots" content="noindex" /></Helmet>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Link to="/news" className="text-primary hover:underline">Back to News</Link>
        </div>
        <Footer linkGroups={mockFooterLinks} />
      </div>
    );
  }

  // Build JSON-LD for NewsArticle schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.meta_description || article.excerpt || "",
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: (article.author_name && article.author_name !== "United Rehabs" && article.author_name !== "United Rehabs Data Team")
      ? { "@type": "Person", name: article.author_name }
      : { "@type": "Organization", name: article.author_name || "United Rehabs" },
    publisher: { "@type": "Organization", name: "United Rehabs", url: "https://unitedrehabs.com" },
    mainEntityOfPage: `https://unitedrehabs.com/news/${article.slug}`,
    ...(article.featured_image_url ? { image: article.featured_image_url } : {}),
  };

  // FAQ schema if article has FAQ items
  const faqJsonLd = article.faq_items?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq_items.map((faq: any) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  } : null;

  // Get related country/state links from article metadata
  const relatedCountryLinks = (article.related_countries || []).map((code: string) => {
    const country = ALL_COUNTRIES.find(c => c.code === code);
    return country ? { name: country.name, slug: country.slug, flag: country.flag } : null;
  }).filter(Boolean);

  const relatedStateLinks = (article.related_states || []).map((stateId: string) => {
    const state = ALL_STATES.find(s => s.id === stateId || s.name.toLowerCase().replace(/ /g, "-") === stateId.toLowerCase());
    return state ? { name: state.name, slug: state.slug } : null;
  }).filter(Boolean);

  const autoLinkedContent = contextualAutoLink(article.content || "");
  const { summaryHtml, contentWithoutSummary } = extractSummaryBox(autoLinkedContent);
  const { tocItems, contentWithoutToc } = extractTocFromHtml(contentWithoutSummary);

  return (
    <div className="min-h-screen bg-background" data-testid="news-article-page">
      <SEOHead
        pageSlug={`news/${article.slug}`}
        fallbackTitle={article.meta_title || article.title}
        fallbackDescription={article.meta_description || article.excerpt || `${article.title} - Latest addiction data and statistics from United Rehabs.`}
        keywords={article.meta_keywords || article.tags?.join(", ")}
        ogType="article"
        ogImage={article.featured_image_url}
        jsonLd={jsonLd}
      />
      {faqJsonLd && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        </Helmet>
      )}
      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/news" className="hover:text-primary">News</Link>
            <span>/</span>
            <span className="text-foreground truncate">{article.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_260px] gap-6">
            {/* LEFT SIDEBAR - Sticky TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                {tocItems.length > 0 && (
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-bold text-xs uppercase tracking-wide text-muted-foreground mb-3">Contents</h3>
                    <nav className="space-y-0.5 max-h-[60vh] overflow-y-auto">
                      {tocItems.map((item: any) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className="block text-xs py-1.5 px-2 rounded text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
                        >
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary w-full justify-center py-2 border rounded-lg"
                >
                  Back to top
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <article>
              {/* Header */}
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight" data-testid="article-title">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  {article.author_name && (
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> {article.author_name}
                    </span>
                  )}
                  {article.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(article.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  )}
                  {article.read_time && <span>{article.read_time}</span>}
                  {article.views_count > 0 && (
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {article.views_count} views</span>
                  )}
                  {getFreshnessText(article.published_at, article.updated_at) && (
                    <span className="text-primary font-medium">{getFreshnessText(article.published_at, article.updated_at)}</span>
                  )}
                </div>
                {article.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag: string) => (
                      <Link key={tag} to={`/news?tag=${tag}`}>
                        <Badge variant="outline" className="text-xs">{tag.replace(/-/g, " ")}</Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </header>

              {/* Unified Toolbar: Listen + Share + AI */}
              <ArticleToolbar
                title={article.title}
                url={`https://unitedrehabs.com/news/${article.slug}`}
                content={article.content || ""}
                readTime={article.read_time}
              />

              {/* Key Takeaways Summary Box */}
              {summaryHtml && (
                <div
                  className="bg-muted/30 border rounded-xl p-5 mb-6 prose prose-slate max-w-none
                    prose-h3:text-lg prose-h3:font-bold prose-h3:mb-3 prose-h3:flex prose-h3:items-center prose-h3:gap-2
                    prose-li:text-sm prose-li:leading-relaxed prose-li:text-muted-foreground prose-li:my-1
                    prose-ul:my-2 prose-strong:text-foreground"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(summaryHtml) }}
                />
              )}

              {/* Jump to Section TOC */}
              {tocItems.length > 0 && <JumpToSection items={tocItems} />}

              {/* Featured Image — skip if it's a YouTube thumbnail and content has the video embed */}
              {article.featured_image_url &&
                !(article.featured_image_url.includes("img.youtube.com") && article.content?.includes("youtube.com/embed")) && (
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                  className="w-full rounded-xl mb-8 max-h-96 object-cover"
                />
              )}

              {/* Content with contextual auto-links (TOC removed from HTML) */}
              <div
                className="prose prose-slate max-w-none
                  prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                  prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-1.5 prose-h2:border-b prose-h2:border-border/50
                  prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-h3:font-semibold
                  prose-p:text-[15px] prose-p:leading-[1.75] prose-p:mb-4 prose-p:text-muted-foreground
                  prose-li:text-[15px] prose-li:leading-[1.75] prose-li:text-muted-foreground prose-li:my-0.5
                  prose-ul:my-3 prose-ol:my-3
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                  prose-img:rounded-lg prose-img:my-4"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentWithoutToc) }}
                data-testid="article-content"
              />

              {/* FAQ Section */}
              {article.faq_items?.length > 0 && (
                <section className="mt-10 bg-muted/30 rounded-xl p-6 border" data-testid="article-faq">
                  <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {article.faq_items.map((faq: any, i: number) => (
                      <div key={i}>
                        <h3 className="font-medium text-foreground mb-1">{faq.question}</h3>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Back to News */}
              <div className="mt-8 pt-6 border-t">
                <Link to="/news" className="text-primary hover:underline flex items-center gap-1 text-sm font-medium">
                  <ArrowLeft className="h-4 w-4" /> Back to All News
                </Link>
              </div>
            </article>

            {/* Right Sidebar */}
            <aside className="space-y-4">
              {/* Get Help */}
              <div className="bg-card rounded-lg border p-4">
                <h3 className="font-bold text-sm mb-3">Get Help</h3>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">&#9742;</span>
                    <div><div className="font-medium">Crisis Hotlines</div><div className="text-xs text-muted-foreground">988 (Suicide & Crisis)<br/>1-800-662-4357 (SAMHSA)</div></div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">&#9993;</span>
                    <div><div className="font-medium">Contact</div><Link to="/contact" className="text-xs text-primary hover:underline">Use the contact form</Link></div>
                  </li>
                </ul>
              </div>

              {/* Admin-editable sidebar links */}
              {sidebarLinks.length > 0 && (
                <div className="bg-card rounded-xl border p-5" data-testid="sidebar-links">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">Quick Links</h3>
                  <ul className="space-y-2">
                    {sidebarLinks.map((link: any, i: number) => (
                      <li key={i}>
                        <a href={link.url} className="text-sm text-primary hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Countries */}
              {relatedCountryLinks.length > 0 && (
                <div className="bg-card rounded-xl border p-5" data-testid="sidebar-countries">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">Related Countries</h3>
                  <ul className="space-y-2">
                    {relatedCountryLinks.map((c: any) => (
                      <li key={c.slug}>
                        <Link to={`/${c.slug}-addiction-stats`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
                          <span>{c.flag}</span> {c.name} Statistics
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related States */}
              {relatedStateLinks.length > 0 && (
                <div className="bg-card rounded-xl border p-5" data-testid="sidebar-states">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">Related US States</h3>
                  <ul className="space-y-2">
                    {relatedStateLinks.map((s: any) => (
                      <li key={s.slug}>
                        <Link to={`/${s.slug}-addiction-stats`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
                          <MapPin className="h-3 w-3" /> {s.name} Statistics
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-card rounded-xl border p-5" data-testid="sidebar-related">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">Related Articles</h3>
                  <ul className="space-y-3">
                    {relatedArticles.map((a: any) => (
                      <li key={a.slug}>
                        <Link to={`/news/${a.slug}`} className="text-sm text-muted-foreground hover:text-primary leading-tight block">
                          {a.title}
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
