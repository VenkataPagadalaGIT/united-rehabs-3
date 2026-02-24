import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Eye, Tag, ArrowRight } from "lucide-react";

const API = import.meta.env.REACT_APP_BACKEND_URL || "";

async function fetchNews(tag?: string) {
  const params = new URLSearchParams({ content_type: "news", is_published: "true", limit: "50" });
  if (tag) params.set("tag", tag);
  const res = await fetch(`${API}/api/articles?${params}`);
  return res.json();
}

async function fetchTags() {
  const res = await fetch(`${API}/api/articles/tags`);
  return res.json();
}

export default function NewsPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data: newsData, isLoading } = useQuery({
    queryKey: ["news", activeTag],
    queryFn: () => fetchNews(activeTag || undefined),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["news-tags"],
    queryFn: fetchTags,
  });

  const articles = newsData?.items || newsData || [];

  return (
    <div className="min-h-screen bg-background" data-testid="news-page">
      <SEOHead
        pageSlug="news"
        fallbackTitle="Addiction News & Data Reports - Latest Statistics"
        fallbackDescription="Latest addiction news, drug crisis reports, and substance use data analysis. Trending statistics from WHO, CDC, SAMHSA covering 195 countries."
        keywords="addiction news, drug crisis 2025, overdose statistics, fentanyl crisis, substance abuse report, opioid epidemic data"
      />
      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="news-heading">
            Addiction News & Data Reports
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Latest statistics, trends, and data analysis on global substance use disorders
          </p>

          {/* Tags Filter */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8" data-testid="news-tags-filter">
              <Badge
                variant={activeTag === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveTag(null)}
              >
                All
              </Badge>
              {tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant={activeTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveTag(tag)}
                  data-testid={`tag-${tag}`}
                >
                  {tag.replace(/-/g, " ")}
                </Badge>
              ))}
            </div>
          )}

          {/* Articles List */}
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border">
              <p className="text-muted-foreground">No news articles yet. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map((article: any) => (
                <Link
                  key={article.id}
                  to={`/news/${article.slug}`}
                  className="block bg-card rounded-xl border p-6 hover:shadow-md transition-shadow"
                  data-testid={`news-${article.slug}`}
                >
                  <div className="flex gap-6">
                    {article.featured_image_url && (
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-48 h-32 object-cover rounded-lg hidden md:block"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{article.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {article.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </span>
                        )}
                        {article.read_time && <span>{article.read_time}</span>}
                        {article.views_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {article.views_count}
                          </span>
                        )}
                      </div>
                      {article.tags?.length > 0 && (
                        <div className="flex gap-1 mt-3">
                          {article.tags.slice(0, 4).map((tag: string) => (
                            <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                              {tag.replace(/-/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 self-center hidden sm:block" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
