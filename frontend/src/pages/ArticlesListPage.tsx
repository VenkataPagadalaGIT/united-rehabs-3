import { useQuery } from "@tanstack/react-query";
import { articlesApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Clock, User, FileText, Newspaper, BookOpen } from "lucide-react";
import { useState } from "react";

const contentTypeIcons: Record<string, any> = {
  blog: BookOpen,
  news: Newspaper,
  article: FileText,
  guide: BookOpen,
};

const ArticlesListPage = () => {
  const [filterType, setFilterType] = useState<string>("all");

  const { data: articles, isLoading } = useQuery({
    queryKey: ["articles-list"],
    queryFn: async () => {
      return await articlesApi.getAll({ is_published: true, limit: 100 });
    },
  });

  const contentTypes = ["all", "blog", "news", "article", "guide"];

  const filteredArticles = filterType === "all" 
    ? articles 
    : articles?.filter((a: any) => a.content_type === filterType);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-lg"></div>
              <div className="h-4 bg-muted rounded mt-4 w-3/4"></div>
              <div className="h-3 bg-muted rounded mt-2 w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Articles & Resources</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore our collection of articles, guides, and news about addiction treatment and recovery.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6 border-b">
        <div className="flex flex-wrap gap-2">
          {contentTypes.map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
              className="capitalize"
            >
              {type === "all" ? "All" : type}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredArticles && filteredArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article: any) => {
              const Icon = contentTypeIcons[article.content_type] || FileText;
              const formattedDate = article.published_at
                ? new Date(article.published_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })
                : null;

              return (
                <Link key={article.id} to={`/${article.content_type}/${article.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                    {article.featured_image_url && (
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="capitalize text-xs">
                          <Icon className="h-3 w-3 mr-1" />
                          {article.content_type}
                        </Badge>
                        {article.is_featured && <Badge className="text-xs">Featured</Badge>}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {article.author_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {article.author_name}
                          </span>
                        )}
                        {formattedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formattedDate}
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
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No articles found</h3>
            <p className="text-muted-foreground">Check back later for new content.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesListPage;
