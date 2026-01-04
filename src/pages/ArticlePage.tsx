import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ArticlePage = () => {
  const { type, slug } = useParams();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", type, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("content_type", type)
        .eq("is_published", true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug && !!type,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header navItems={mockNavItems} />
        <main className="container mx-auto px-4 py-12">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer linkGroups={mockFooterLinks} />
      </div>
    );
  }

  if (error || !article) {
    return <Navigate to="/404" replace />;
  }

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Simple markdown-like rendering for content
  const renderContent = (content: string) => {
    return content
      .split("\n\n")
      .map((paragraph, index) => {
        // Check for headers
        if (paragraph.startsWith("## ")) {
          return (
            <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
              {paragraph.replace("## ", "")}
            </h2>
          );
        }
        if (paragraph.startsWith("### ")) {
          return (
            <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
              {paragraph.replace("### ", "")}
            </h3>
          );
        }
        // Check for lists
        if (paragraph.startsWith("- ")) {
          const items = paragraph.split("\n").filter((l) => l.startsWith("- "));
          return (
            <ul key={index} className="list-disc pl-6 my-4 space-y-2">
              {items.map((item, i) => (
                <li key={i}>{item.replace("- ", "")}</li>
              ))}
            </ul>
          );
        }
        // Regular paragraph
        return (
          <p key={index} className="mb-4 leading-relaxed">
            {paragraph}
          </p>
        );
      });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        pageSlug={`${type}/${slug}`}
        fallbackTitle={article.meta_title || article.title}
        fallbackDescription={article.meta_description || article.excerpt || ""}
      />
      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link to={`/${type}`}>
          <Button variant="ghost" className="mb-6 -ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {type === "blog" ? "Blog" : type === "news" ? "News" : "Articles"}
          </Button>
        </Link>

        <article className="max-w-3xl mx-auto">
          {/* Category badge */}
          {article.category && (
            <Badge variant="secondary" className="mb-4">
              {article.category}
            </Badge>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            {article.author_name && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {article.author_name}
              </span>
            )}
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
            )}
            {article.read_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.read_time}
              </span>
            )}
          </div>

          {/* Featured image */}
          {article.featured_image_url && (
            <img
              src={article.featured_image_url}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
            />
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg text-muted-foreground mb-8 font-medium">
              {article.excerpt}
            </p>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {article.content && renderContent(article.content)}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default ArticlePage;
