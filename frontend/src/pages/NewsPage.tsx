import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, ChevronDown, ChevronUp, Clock, TrendingUp, Loader2 } from "lucide-react";

const API = import.meta.env.REACT_APP_BACKEND_URL || "";
const BATCH_SIZE = 30;

async function fetchNewsBatch(tag?: string, page: number = 1) {
  const skip = (page - 1) * BATCH_SIZE;
  const params = new URLSearchParams({ content_type: "news", is_published: "true", limit: String(BATCH_SIZE), skip: String(skip) });
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

// Topic-relevant gradient thumbnails
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
  const match = article.content?.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function ArticleImage({ article, className, eager }: { article: any; className?: string; eager?: boolean }) {
  const loadProp = eager ? undefined : "lazy" as const;
  if (article.featured_image_url) {
    return <img src={article.featured_image_url} alt={article.title} className={className} loading={loadProp} />;
  }
  const ytId = getYouTubeId(article);
  if (ytId) {
    return <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={article.title} className={className} loading={loadProp} />;
  }
  return <PlaceholderThumb article={article} className={className} />;
}

/* ─── NYT-STYLE LAYOUT SECTIONS ─── */

// Section 1: Hero — full-width headline left + big image right (like NYT top story)
function HeroSection({ article }: { article: any }) {
  return (
    <Link to={`/news/${article.slug}`} className="block group" data-testid={`news-hero-${article.slug}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 lg:gap-10 pb-8 border-b border-border">
        <div className="flex flex-col justify-center">
          {article.tags?.[0] && (
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2">{article.tags[0].replace(/-/g, " ")}</span>
          )}
          <h2 className="text-3xl lg:text-[2.5rem] font-extrabold text-foreground leading-[1.1] tracking-tight mb-4 group-hover:text-primary transition-colors" style={{ fontFamily: "'Inter', Georgia, serif" }}>
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-4">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {article.author_name && <span className="font-semibold text-foreground">{article.author_name}</span>}
            {article.published_at && <span>{timeAgo(article.published_at)}</span>}
            {article.read_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.read_time}</span>}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <ArticleImage article={article} className="w-full h-72 lg:h-96 object-cover rounded-lg" eager />
        </div>
      </div>
    </Link>
  );
}

// Section 2: 4-column thumbnail strip (like NYT secondary stories row)
function ThumbStripSection({ articles }: { articles: any[] }) {
  if (!articles.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-border">
      {articles.map((article: any) => (
        <Link key={article.id} to={`/news/${article.slug}`} className="group" data-testid={`news-strip-${article.slug}`}>
          <ArticleImage article={article} className="w-full h-28 md:h-32 object-cover rounded-lg mb-2" />
          <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-3" style={{ fontFamily: "'Inter', Georgia, serif" }}>
            {article.title}
          </h3>
          {article.read_time && (
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{article.read_time}</p>
          )}
        </Link>
      ))}
    </div>
  );
}

// Section 3: Feature row — text left + big image right (NYT story block)
function FeatureRow({ article, reverse }: { article: any; reverse?: boolean }) {
  return (
    <Link to={`/news/${article.slug}`} className="block group" data-testid={`news-feature-${article.slug}`}>
      <div className={`grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6 lg:gap-8 py-8 border-b border-border ${reverse ? "lg:[direction:rtl]" : ""}`}>
        <div className={`flex flex-col justify-center ${reverse ? "lg:[direction:ltr]" : ""}`}>
          {article.tags?.[0] && (
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2">{article.tags[0].replace(/-/g, " ")}</span>
          )}
          <h3 className="text-xl lg:text-2xl font-extrabold text-foreground leading-snug tracking-tight mb-3 group-hover:text-primary transition-colors" style={{ fontFamily: "'Inter', Georgia, serif" }}>
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {article.author_name && <span className="font-semibold text-foreground">{article.author_name}</span>}
            {article.published_at && <span>{timeAgo(article.published_at)}</span>}
            {article.read_time && <span>{article.read_time}</span>}
          </div>
        </div>
        <div className={`flex flex-col justify-center ${reverse ? "lg:[direction:ltr]" : ""}`}>
          <ArticleImage article={article} className="w-full h-56 lg:h-72 object-cover rounded-lg" />
        </div>
      </div>
    </Link>
  );
}

// Section 4: Main content + Opinion/Trending sidebar (NYT mid-page)
function ContentWithSidebar({ mainArticles, sidebarArticles }: { mainArticles: any[]; sidebarArticles: any[] }) {
  if (!mainArticles.length && !sidebarArticles.length) return null;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 py-8 border-b border-border">
      {/* Main: 2-col grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mainArticles.map((article: any) => (
          <Link key={article.id} to={`/news/${article.slug}`} className="group" data-testid={`news-card-${article.slug}`}>
            <article>
              <ArticleImage article={article} className="w-full h-44 object-cover rounded-lg mb-3" />
              {article.tags?.[0] && (
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest">{article.tags[0].replace(/-/g, " ")}</span>
              )}
              <h3 className="text-lg font-bold text-foreground leading-snug tracking-tight mt-1 mb-2 group-hover:text-primary transition-colors" style={{ fontFamily: "'Inter', Georgia, serif" }}>
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{article.excerpt}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                {article.published_at && <span>{timeAgo(article.published_at)}</span>}
                {article.read_time && <span>{article.read_time}</span>}
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Sidebar: Trending/Opinion */}
      {sidebarArticles.length > 0 && (
        <aside className="lg:border-l lg:border-border lg:pl-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-primary font-bold text-sm uppercase tracking-widest" style={{ fontFamily: "'Inter', Georgia, serif" }}>
              Trending
            </h3>
          </div>
          <div className="space-y-0">
            {sidebarArticles.map((article: any, i: number) => (
              <Link key={article.id} to={`/news/${article.slug}`} className="flex gap-3 group py-3 border-b border-border last:border-0" data-testid={`news-trending-${article.slug}`}>
                <span className="text-2xl font-black text-muted-foreground/30 shrink-0 w-7 text-right">{i + 1}</span>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-3" style={{ fontFamily: "'Inter', Georgia, serif" }}>
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {article.author_name && <span>{article.author_name}</span>}
                    {article.read_time && <span>{article.read_time}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

// Section 5: 3-col dense grid for remaining articles
function DenseGrid({ articles }: { articles: any[] }) {
  if (!articles.length) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {articles.map((article: any) => (
        <Link key={article.id} to={`/news/${article.slug}`} className="group border-b border-border pb-4 last:border-0" data-testid={`news-dense-${article.slug}`}>
          <div className="flex gap-3">
            <ArticleImage article={article} className="w-20 h-20 object-cover rounded shrink-0" />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-3" style={{ fontFamily: "'Inter', Georgia, serif" }}>
                {article.title}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {article.published_at && <span>{timeAgo(article.published_at)}</span>}
                {article.views_count > 0 && (
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views_count}</span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

const VISIBLE_TAGS_COUNT = 12;

export default function NewsPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["news", activeTag],
    queryFn: ({ pageParam = 1 }) => fetchNewsBatch(activeTag || undefined, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const items = lastPage?.items || lastPage || [];
      const total = lastPage?.total || 0;
      const loaded = allPages.reduce((sum: number, p: any) => sum + (p?.items?.length || (Array.isArray(p) ? p.length : 0)), 0);
      if (loaded < total) return allPages.length + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  const handleTagChange = (tag: string | null) => {
    setActiveTag(tag);
  };

  const { data: tags = [] } = useQuery({
    queryKey: ["news-tags"],
    queryFn: fetchTags,
  });

  // Flatten all pages into one article list
  const articles = data?.pages?.flatMap((page: any) => page?.items || page || []) || [];
  const total = data?.pages?.[0]?.total || articles.length;

  // NYT-style layout distribution:
  // [0]       → Hero (big headline + big image)
  // [1-4]     → 4-col thumbnail strip
  // [5]       → Feature row (text + big image)
  // [6-9]     → 2-col cards + sidebar trending [10-13]
  // [14]      → Feature row reversed
  // [15+]     → Dense 3-col grid
  const hero = articles[0];
  const strip = articles.slice(1, 5);
  const feature1 = articles[5];
  const mainCards = articles.slice(6, 10);
  const sidebarItems = articles.slice(10, 14);
  const feature2 = articles[14];
  const denseItems = articles.slice(15);

  // When we have fewer articles, adapt layout gracefully
  const hasEnoughForSidebar = articles.length > 6;

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
          {/* Page Title — NYT style clean header with rule */}
          <div className="border-b-[3px] border-foreground pb-3 mb-6">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight" style={{ fontFamily: "'Inter', Georgia, serif" }} data-testid="news-heading">
              Addiction News & Data Reports
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Latest statistics, trends, and data analysis on global substance use disorders
            </p>
          </div>

          {/* Tags Filter */}
          {tags.length > 0 && (() => {
            const seen = new Map<string, string>();
            (tags as string[]).forEach((tag) => {
              const key = tag.toLowerCase().replace(/-/g, " ");
              if (!seen.has(key)) {
                seen.set(key, tag);
              } else {
                const existing = seen.get(key)!;
                if (tag[0] === tag[0].toUpperCase() && existing[0] !== existing[0].toUpperCase()) {
                  seen.set(key, tag);
                }
              }
            });
            const uniqueTags = Array.from(seen.values());
            const visibleTags = showAllTags ? uniqueTags : uniqueTags.slice(0, VISIBLE_TAGS_COUNT);
            const hiddenCount = uniqueTags.length - VISIBLE_TAGS_COUNT;

            return (
              <div className="mb-6 pb-4 border-b border-border" data-testid="news-tags-filter">
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
              <Skeleton className="h-72 rounded-xl" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
              <Skeleton className="h-56 rounded-xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border">
              <p className="text-muted-foreground">No news articles yet. Check back soon.</p>
            </div>
          ) : (
            <>
              {/* HERO: Top story */}
              {hero && <HeroSection article={hero} />}

              {/* 4-COL THUMBNAIL STRIP */}
              <ThumbStripSection articles={strip} />

              {/* FEATURE ROW 1 */}
              {feature1 && <FeatureRow article={feature1} />}

              {/* MAIN CARDS + TRENDING SIDEBAR */}
              {hasEnoughForSidebar ? (
                <ContentWithSidebar mainArticles={mainCards} sidebarArticles={sidebarItems} />
              ) : (
                /* Fewer articles: show everything in a simple grid */
                articles.length > 5 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8 border-b border-border">
                    {articles.slice(5).map((article: any) => (
                      <Link key={article.id} to={`/news/${article.slug}`} className="group">
                        <ArticleImage article={article} className="w-full h-40 object-cover rounded-lg mb-2" />
                        <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2" style={{ fontFamily: "'Inter', Georgia, serif" }}>
                          {article.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{article.published_at && timeAgo(article.published_at)}</p>
                      </Link>
                    ))}
                  </div>
                )
              )}

              {/* FEATURE ROW 2 (reversed) */}
              {feature2 && <FeatureRow article={feature2} reverse />}

              {/* DENSE 3-COL GRID for remaining */}
              <DenseGrid articles={denseItems} />
            </>
          )}

          {/* Load More button — keeps all content on page for SEO */}
          {hasNextPage && (
            <div className="flex justify-center py-10 border-t border-border mt-4">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border-2 border-foreground bg-background text-sm font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                {isFetchingNextPage ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
                ) : (
                  "Show More Stories"
                )}
              </button>
            </div>
          )}

          {/* Article count */}
          {total > 0 && (
            <p className="text-center text-xs text-muted-foreground mt-4 pb-4">
              Showing {articles.length} of {total} articles
            </p>
          )}
        </div>
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
