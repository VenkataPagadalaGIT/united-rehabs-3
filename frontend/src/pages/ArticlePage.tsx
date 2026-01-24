import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { articlesApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Eye, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RelatedArticles from "@/components/article/RelatedArticles";
import ReactMarkdown from "react-markdown";

const ArticlePage = () => {
  const { type, slug } = useParams<{ type: string; slug: string }>();
  
  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", type, slug],
    queryFn: async () => {
      if (!type || !slug) throw new Error("Missing params");
      return await articlesApi.getBySlug(type, slug);
    },
    enabled: !!type && !!slug,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-4">The article you're looking for doesn't exist.</p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  const formattedDate = article.published_at 
    ? new Date(article.published_at).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <Link to="/articles" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Articles
          </Link>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="capitalize">{article.content_type}</Badge>
            {article.category && <Badge variant="outline">{article.category}</Badge>}
            {article.is_featured && <Badge>Featured</Badge>}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
          
          {article.excerpt && (
            <p className="text-lg text-muted-foreground max-w-3xl">{article.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground">
            {article.author_name && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {article.author_name}
              </div>
            )}
            {formattedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </div>
            )}
            {article.read_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.read_time}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.views_count || 0} views
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {article.featured_image_url && (
        <div className="container mx-auto px-4 -mt-6 mb-8">
          <img 
            src={article.featured_image_url} 
            alt={article.title}
            className="w-full max-h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {article.content ? (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-muted-foreground">No content available.</p>
          )}
        </div>
      </div>

      {/* Related Articles */}
      <div className="container mx-auto px-4 py-12">
        <RelatedArticles currentSlug={slug} category={article.category} />
      </div>
    </div>
  );
};

export default ArticlePage;
