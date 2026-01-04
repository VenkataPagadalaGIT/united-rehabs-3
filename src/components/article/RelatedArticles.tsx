import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ArrowRight } from "lucide-react";

interface RelatedArticlesProps {
  currentArticleId: string;
  category?: string | null;
  contentType: string;
  tags?: string[] | null;
}

export function RelatedArticles({
  currentArticleId,
  category,
  contentType,
  tags,
}: RelatedArticlesProps) {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["related-articles", currentArticleId, category, contentType],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select("id, title, slug, excerpt, content_type, category, read_time, featured_image_url")
        .eq("is_published", true)
        .neq("id", currentArticleId)
        .limit(4);

      // Prioritize same category, then same content type
      if (category) {
        query = query.eq("category", category);
      } else {
        query = query.eq("content_type", contentType);
      }

      const { data, error } = await query.order("published_at", { ascending: false });

      if (error) throw error;

      // If not enough results from same category, get more from same content type
      if (data && data.length < 3 && category) {
        const { data: moreData } = await supabase
          .from("articles")
          .select("id, title, slug, excerpt, content_type, category, read_time, featured_image_url")
          .eq("is_published", true)
          .neq("id", currentArticleId)
          .eq("content_type", contentType)
          .neq("category", category)
          .order("published_at", { ascending: false })
          .limit(4 - data.length);

        return [...data, ...(moreData || [])];
      }

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Related Articles</h3>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Related Articles</h3>
      <div className="space-y-3">
        {articles.map((article) => (
          <Link key={article.id} to={`/${article.content_type}/${article.slug}`}>
            <Card className="hover:bg-muted/50 transition-colors group">
              <CardContent className="p-3">
                {article.featured_image_url && (
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                )}
                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  {article.category && (
                    <Badge variant="outline" className="text-xs py-0">
                      {article.category}
                    </Badge>
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

      <Link
        to={`/${contentType}`}
        className="flex items-center gap-1 text-sm text-primary hover:underline"
      >
        View all {contentType === "blog" ? "posts" : contentType}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
