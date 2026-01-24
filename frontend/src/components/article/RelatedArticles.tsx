import { useQuery } from "@tanstack/react-query";
import { articlesApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface RelatedArticlesProps {
  currentSlug?: string;
  category?: string;
  limit?: number;
}

export const RelatedArticles = ({ currentSlug, category, limit = 3 }: RelatedArticlesProps) => {
  const { data: articles } = useQuery({
    queryKey: ["related-articles", category],
    queryFn: async () => {
      return await articlesApi.getAll({ is_published: true, category, limit: limit + 1 });
    },
  });

  const relatedArticles = articles?.filter((a: any) => a.slug !== currentSlug).slice(0, limit);

  if (!relatedArticles || relatedArticles.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Related Articles</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {relatedArticles.map((article: any) => (
          <Link key={article.id} to={`/${article.content_type}/${article.slug}`}>
            <Card className="hover:shadow-md transition-shadow h-full">
              {article.featured_image_url && (
                <img src={article.featured_image_url} alt={article.title} className="w-full h-40 object-cover rounded-t-lg" />
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-base line-clamp-2">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedArticles;
