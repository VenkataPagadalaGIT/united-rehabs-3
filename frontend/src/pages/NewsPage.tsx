import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Eye, ChevronLeft, ChevronRight, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

const API = import.meta.env.REACT_APP_BACKEND_URL || "";
const PAGE_SIZE = 12;

async function fetchNews(tag?: string, page: number = 1) {
  const skip = (page - 1) * PAGE_SIZE;
  const params = new URLSearchParams({ content_type: "news", is_published: "true", limit: String(PAGE_SIZE), skip: String(skip) });
  if (tag) params.set("tag", tag);
  const res = await fetch(`${API}/api/articles?${params}`);
  return res.json();
}

async function fetchTags() {
  const res = await fetch(`${API}/api/articles/tags`);
  return res.json();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Generate a topic-relevant gradient thumbnail when no featured image exists
const TAG_COLORS: Record<string, [string, string]> = {
  fentanyl: ["#dc2626", "#7f1d1d"],
  opioid: ["#ea580c", "#7c2d12"],
  naloxone: ["#059669", "#064e3b"],
  policy: ["#2563eb", "#1e3a5f"],
  cartel: ["#7c3aed", "#3b0764"],
  trafficking: ["#b91c1c", "#450a0a"],
  legislation: ["#0369a1", "#0c4a6e"],
  default: ["#f97316", "#1e293b"],
};

function getTagColor(tags?: string[]): [string, string] {
  if (!tags?.length) return TAG_COLORS.default;
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    for (const [key, colors] of Object.entries(TAG_COLORS)) {
      if (lower.includes(key)) return colors;
    }
  }
  return TAG_COLORS.default;
}

function PlaceholderThumb({ article, className }: { article: any; className?: string }) {
  const [c1, c2] = getTagColor(article.tags);
  const initials = article.title
    ?.split(/\s+/)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join("") || "UR";
  return (
    <div
      className={`flex items-center justify-center ${className || ""}`}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    >
      <span className="text-white/90 font-extrabold text-2xl tracking-wider">{initials}</span>
    </div>
  );
}

function getYouTubeId(article: any): string | null {
  if (article.youtube_video_id) return article.youtube_video_id;
  // Extract from embedded iframe in content
  const match = article.content?.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function ArticleImage({ article, className }: { article: any; className?: string }) {
  if (article.featured_image_url) {
    return <img src={article.featured_image_url} alt={article.title} className={className} />;
  }
  const ytId = getYouTubeId(article);
  if (ytId) {
    return <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={article.title} className={className} />;
  }
  return <PlaceholderThumb article={article} className={className} />;
}

// WSJ-style Hero Card - largest article at top
function HeroArticle({ article }: { article: any }) {
  return (
    <Link to={`/news/${article.slug}`} className="block group" data-testid={`news-hero-${article.slug}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 pb-8 border-b border-border">
        {/* Left: headline + excerpt */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground leading-[1.15] tracking-tight mb-4 group-hover:text-primary transition-colors" style={{ fontFamily: "'Inter', Georgia, serif" }}>
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-base text-muted-foreground leading-relaxed mb-4">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {article.author_name && <span className="font-medium text-foreground">{article.author_name}</span>}
            {article.published_at && <span>{formatDate(article.published_at)}</span>}
            {article.read_time && <span>{article.read_time}</span>}
            {article.views_count > 0 && (
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views_count}</span>
            )}
          </div>
        </div>
        {/* Right: featured image / YouTube thumbnail / gradient placeholder */}
        <div className="flex flex-col justify-center">
          <ArticleImage article={article} className="w-full h-64 object-cover rounded-lg" />
        </div>
      </div>
    </Link>
  );
}

// WSJ-style secondary article card (3-col grid)
function SecondaryArticle({ article }: { article: any }) {
  return (
    <Link to={`/news/${article.slug}`} className="block group" data-testid={`news-${article.slug}`}>
      <article className="h-full">
        <ArticleImage article={article} className="w-full h-44 object-cover rounded-lg mb-3" />
        <h3 className="text-lg font-bold text-foreground leading-snug tracking-tight mb-2 group-hover:text-primary transition-colors" style={{ fontFamily: "'Inter', Georgia, serif" }}>
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {article.published_at && <span>{formatDate(article.published_at)}</span>}
          {article.views_count > 0 && (
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {article.views_count}</span>
          )}
        </div>
      </article>
    </Link>
  );
}

// WSJ-style sidebar article (small thumbnail + title)
function SidebarArticle({ article }: { article: any }) {
  return (
    <Link to={`/news/${article.slug}`} className="flex gap-3 group py-3 border-b border-border last:border-0" data-testid={`news-sidebar-${article.slug}`}>
      <ArticleImage article={article} className="w-16 h-16 object-cover rounded shrink-0" />
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2" style={{ fontFamily: "'Inter', Georgia, serif" }}>
          {article.title}
        </h4>
        {article.author_name && (
          <p className="text-xs text-muted-foreground mt-1">By {article.author_name}</p>
        )}
      </div>
    </Link>
  );
}

const VISIBLE_TAGS_COUNT = 12;

export default function NewsPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showAllTags, setShowAllTags] = useState(false);

  const { data: newsData, isLoading } = useQuery({
    queryKey: ["news", activeTag, page],
    queryFn: () => fetchNews(activeTag || undefined, page),
  });

  const handleTagChange = (tag: string | null) => {
    setActiveTag(tag);
    setPage(1);
  };

  const { data: tags = [] } = useQuery({
    queryKey: ["news-tags"],
    queryFn: fetchTags,
  });

  const articles = newsData?.items || newsData || [];
  const total = newsData?.total || articles.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Split articles: hero (1st), secondary grid (next 3), sidebar (next 4+), remaining list
  const heroArticle = articles[0];
  const secondaryArticles = articles.slice(1, 4);
  const sidebarArticles = articles.slice(4, 8);
  const remainingArticles = articles.slice(8);

  return (
    <div className="min-h-screen bg-background" data-testid="news-page">
      <SEOHead
        pageSlug="news"
        fallbackTitle="Addiction News & Data Reports - Latest Statistics"
        fallbackDescription="Latest addiction news, drug crisis reports, and substance use data analysis. Trending statistics from WHO, CDC, SAMHSA covering 195 countries."
        keywords="addiction news, drug crisis 2025, overdose statistics, fentanyl crisis, substance abuse report, opioid epidemic data"
      />
      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title - WSJ style clean header */}
          <div className="border-b-2 border-foreground pb-3 mb-8">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight" style={{ fontFamily: "'Inter', Georgia, serif" }} data-testid="news-heading">
              Addiction News & Data Reports
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Latest statistics, trends, and data analysis on global substance use disorders
            </p>
          </div>

          {/* Tags Filter - deduplicated, collapsible WSJ section nav */}
          {tags.length > 0 && (() => {
            // Deduplicate tags case-insensitively, keeping the Title Case version
            const seen = new Map<string, string>();
            (tags as string[]).forEach((tag) => {
              const key = tag.toLowerCase().replace(/-/g, " ");
              if (!seen.has(key)) {
                // Prefer Title Case version
                seen.set(key, tag);
              } else {
                const existing = seen.get(key)!;
                // Keep whichever looks more like Title Case
                if (tag[0] === tag[0].toUpperCase() && existing[0] !== existing[0].toUpperCase()) {
                  seen.set(key, tag);
                }
              }
            });
            const uniqueTags = Array.from(seen.values());
            const visibleTags = showAllTags ? uniqueTags : uniqueTags.slice(0, VISIBLE_TAGS_COUNT);
            const hiddenCount = uniqueTags.length - VISIBLE_TAGS_COUNT;

            return (
              <div className="mb-8 pb-4 border-b border-border" data-testid="news-tags-filter">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={activeTag === null ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagChange(null)}
                  >
                    All
                  </Badge>
                  {visibleTags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant={activeTag === tag ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagChange(tag)}
                      data-testid={`tag-${tag}`}
                    >
                      {tag.replace(/-/g, " ")}
                    </Badge>
                  ))}
                  {hiddenCount > 0 && (
                    <button
                      onClick={() => setShowAllTags(!showAllTags)}
                      className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary transition-colors"
                    >
                      {showAllTags ? (
                        <>Show less <ChevronUp className="h-3 w-3" /></>
                      ) : (
                        <>+{hiddenCount} more <ChevronDown className="h-3 w-3" /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Loading State */}
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-64 rounded-xl" />
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border">
              <p className="text-muted-foreground">No news articles yet. Check back soon.</p>
            </div>
          ) : (
            <>
              {/* HERO: Featured Article (full width, WSJ top story style) */}
              {heroArticle && (
                <div className="mb-8">
                  <HeroArticle article={heroArticle} />
                </div>
              )}

              {/* SECONDARY + SIDEBAR: WSJ 3-col + sidebar layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 mb-8">
                {/* Left: 3-column secondary grid */}
                <div>
                  {secondaryArticles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-border">
                      {secondaryArticles.map((article: any) => (
                        <SecondaryArticle key={article.id} article={article} />
                      ))}
                    </div>
                  )}

                  {/* Remaining articles in 2-col grid */}
                  {remainingArticles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      {remainingArticles.map((article: any) => (
                        <SecondaryArticle key={article.id} article={article} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Sidebar - WSJ Opinion/trending style */}
                {sidebarArticles.length > 0 && (
                  <aside className="lg:border-l lg:border-border lg:pl-6">
                    <h3 className="text-primary font-bold text-lg mb-4 tracking-tight" style={{ fontFamily: "'Inter', Georgia, serif" }}>
                      Trending
                    </h3>
                    <div>
                      {sidebarArticles.map((article: any) => (
                        <SidebarArticle key={article.id} article={article} />
                      ))}
                    </div>
                  </aside>
                )}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10 pt-8 border-t border-border" data-testid="news-pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border bg-card hover:border-primary hover:text-primary"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Results count */}
          {total > 0 && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total} articles
            </p>
          )}
        </div>
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
