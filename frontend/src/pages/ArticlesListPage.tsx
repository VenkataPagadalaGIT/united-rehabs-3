import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";

const typeLabels: Record<string, { title: string; description: string }> = {
  blog: {
    title: "Recovery Blog",
    description: "Insights, stories, and expert advice on addiction recovery and mental health.",
  },
  news: {
    title: "Addiction News",
    description: "Latest news and updates in addiction treatment, policy, and research.",
  },
  article: {
    title: "Helpful Articles",
    description: "In-depth articles about addiction, treatment options, and recovery resources.",
  },
  guide: {
    title: "Recovery Guides",
    description: "Step-by-step guides to help you navigate the recovery journey.",
  },
};

const ArticlesListPage = () => {
  const { type } = useParams();
  const contentType = type || "blog";

  const { data: articles, isLoading } = useQuery({
    queryKey: ["articles-list", contentType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("content_type", contentType)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: featuredArticles } = useQuery({
    queryKey: ["featured-articles", contentType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("content_type", contentType)
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const typeInfo = typeLabels[contentType] || typeLabels.blog;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        pageSlug={contentType}
        fallbackTitle={typeInfo.title}
        fallbackDescription={typeInfo.description}
      />
      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4 py-12">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{typeInfo.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {typeInfo.description}
          </p>
        </div>

        {/* Featured articles */}
        {featuredArticles && featuredArticles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <Link key={article.id} to={`/${contentType}/${article.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                    {article.featured_image_url && (
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardHeader className="pb-2">
                      {article.category && (
                        <Badge variant="secondary" className="w-fit mb-2">
                          {article.category}
                        </Badge>
                      )}
                      <h3 className="font-bold text-lg line-clamp-2">{article.title}</h3>
                    </CardHeader>
                    <CardContent>
                      {article.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {article.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(article.published_at)}
                          </span>
                        )}
                        {article.read_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.read_time}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All articles */}
        <section>
          <h2 className="text-2xl font-bold mb-6">All {typeInfo.title}</h2>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link key={article.id} to={`/${contentType}/${article.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow group">
                    {article.featured_image_url && (
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        {article.category && (
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                    </CardHeader>
                    <CardContent>
                      {article.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {article.author_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {article.author_name}
                            </span>
                          )}
                          {article.read_time && <span>{article.read_time}</span>}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No {contentType} posts published yet. Check back soon!
            </div>
          )}
        </section>
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default ArticlesListPage;
