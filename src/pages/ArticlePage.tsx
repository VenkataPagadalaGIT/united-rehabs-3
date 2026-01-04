import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { Calendar, Clock, User, ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableOfContents, InlineTableOfContents } from "@/components/article/TableOfContents";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { renderShortcodes } from "@/components/article/ShortcodeRenderer";
import { toast } from "sonner";

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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: article?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header navItems={mockNavItems} />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
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

  // Enhanced markdown rendering with IDs for TOC and shortcode support
  const renderContent = (content: string) => {
    // First process shortcodes
    const shortcodeElements = renderShortcodes(content);

    return shortcodeElements.map((element, elementIndex) => {
      if (typeof element !== "string") {
        return element;
      }

      const lines = element.split("\n");
      const blocks: string[] = [];
      let currentBlock = "";

      lines.forEach((line) => {
        if (line === "" && currentBlock) {
          blocks.push(currentBlock);
          currentBlock = "";
        } else if (line !== "") {
          currentBlock += (currentBlock ? "\n" : "") + line;
        }
      });
      if (currentBlock) blocks.push(currentBlock);

      return blocks.map((block, blockIndex) => {
        const key = `${elementIndex}-${blockIndex}`;
        const lineIndex = lines.findIndex((l) => l === block.split("\n")[0]);

        // Headers with IDs
        if (block.startsWith("## ")) {
          const id = `section-${lineIndex}`;
          return (
            <h2 key={key} id={id} className="text-2xl font-bold mt-10 mb-4 scroll-mt-24">
              {block.replace("## ", "")}
            </h2>
          );
        }
        if (block.startsWith("### ")) {
          const id = `section-${lineIndex}`;
          return (
            <h3 key={key} id={id} className="text-xl font-semibold mt-8 mb-3 scroll-mt-24">
              {block.replace("### ", "")}
            </h3>
          );
        }
        // Blockquote
        if (block.startsWith("> ")) {
          return (
            <blockquote
              key={key}
              className="border-l-4 border-primary pl-4 my-6 italic text-muted-foreground bg-muted/30 py-3 pr-4 rounded-r-lg"
            >
              {block.replace("> ", "")}
            </blockquote>
          );
        }
        // Divider
        if (block.trim() === "---") {
          return <hr key={key} className="my-10 border-border" />;
        }
        // Lists
        if (block.startsWith("- ")) {
          const items = block.split("\n").filter((l) => l.startsWith("- "));
          return (
            <ul key={key} className="list-disc pl-6 my-4 space-y-2">
              {items.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item.replace("- ", "")}
                </li>
              ))}
            </ul>
          );
        }
        // Numbered list
        if (/^\d+\. /.test(block)) {
          const items = block.split("\n").filter((l) => /^\d+\. /.test(l));
          return (
            <ol key={key} className="list-decimal pl-6 my-4 space-y-2">
              {items.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item.replace(/^\d+\. /, "")}
                </li>
              ))}
            </ol>
          );
        }
        // Image
        const imageMatch = block.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          return (
            <figure key={key} className="my-8">
              <img
                src={imageMatch[2]}
                alt={imageMatch[1]}
                className="w-full rounded-lg shadow-lg"
              />
              {imageMatch[1] && (
                <figcaption className="text-sm text-muted-foreground text-center mt-3">
                  {imageMatch[1]}
                </figcaption>
              )}
            </figure>
          );
        }
        // Video embed
        if (block.includes("<video") || block.includes("<iframe")) {
          return (
            <div
              key={key}
              className="my-8 rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: block }}
            />
          );
        }

        // Skip empty blocks
        if (!block.trim()) return null;

        // Regular paragraph with inline formatting
        let text = block;
        text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
        text = text.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
        text = text.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" class="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        return (
          <p
            key={key}
            className="mb-5 leading-relaxed text-foreground/90"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      });
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

        <div className="flex gap-8">
          {/* Main content */}
          <article className="flex-1 max-w-3xl min-w-0">
            {/* Category badge */}
            {article.category && (
              <Badge variant="secondary" className="mb-4">
                {article.category}
              </Badge>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              {article.author_name && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {article.author_name}
                </span>
              )}
              {formattedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formattedDate}
                </span>
              )}
              {article.read_time && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {article.read_time}
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>

            {/* Featured image */}
            {article.featured_image_url && (
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg mb-8 shadow-lg"
              />
            )}

            {/* Summary/Excerpt */}
            {article.excerpt && (
              <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg mb-8">
                <h2 className="font-semibold mb-2 text-primary">Summary</h2>
                <p className="text-foreground/80 leading-relaxed">{article.excerpt}</p>
              </div>
            )}

            {/* Inline Table of Contents (mobile) */}
            {article.content && (
              <div className="lg:hidden">
                <InlineTableOfContents content={article.content} />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {article.content && renderContent(article.content)}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t">
                <h3 className="font-semibold mb-3">Related Topics</h3>
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

          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* Table of Contents */}
              {article.content && (
                <TableOfContents content={article.content} />
              )}

              {/* Related Articles */}
              <RelatedArticles
                currentArticleId={article.id}
                category={article.category}
                contentType={article.content_type}
                tags={article.tags}
              />
            </div>
          </aside>
        </div>

        {/* Related Articles (mobile) */}
        <div className="lg:hidden mt-12 pt-8 border-t">
          <RelatedArticles
            currentArticleId={article.id}
            category={article.category}
            contentType={article.content_type}
            tags={article.tags}
          />
        </div>
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default ArticlePage;
