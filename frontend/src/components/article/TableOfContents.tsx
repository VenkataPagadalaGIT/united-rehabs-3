import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);

  useEffect(() => {
    // Parse headers from content
    const lines = content.split("\n");
    const items: TOCItem[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith("## ")) {
        items.push({
          id: `section-${index}`,
          text: line.replace("## ", ""),
          level: 2,
        });
      } else if (line.startsWith("### ")) {
        items.push({
          id: `section-${index}`,
          text: line.replace("### ", ""),
          level: 3,
        });
      }
    });

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <nav className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
        <List className="h-4 w-4" />
        Table of Contents
      </div>
      <ul className="space-y-1">
        {tocItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollToSection(item.id)}
              className={cn(
                "text-sm text-left w-full py-1.5 px-3 rounded-md transition-colors hover:bg-muted",
                item.level === 3 && "pl-6",
                activeId === item.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Inline TOC for top of article
export function InlineTableOfContents({ content }: { content: string }) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const lines = content.split("\n");
    const items: TOCItem[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith("## ")) {
        items.push({
          id: `section-${index}`,
          text: line.replace("## ", ""),
          level: 2,
        });
      } else if (line.startsWith("### ")) {
        items.push({
          id: `section-${index}`,
          text: line.replace("### ", ""),
          level: 3,
        });
      }
    });

    setTocItems(items);
  }, [content]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  if (tocItems.length === 0) return null;

  const displayItems = isExpanded ? tocItems : tocItems.slice(0, 5);

  return (
    <div className="bg-muted/50 rounded-lg p-4 mb-8 border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <List className="h-4 w-4" />
          In This Article
        </h3>
        {tocItems.length > 5 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary hover:underline"
          >
            {isExpanded ? "Show less" : `Show all ${tocItems.length} sections`}
          </button>
        )}
      </div>
      <ul className="grid gap-1 sm:grid-cols-2">
        {displayItems.map((item, index) => (
          <li key={item.id}>
            <button
              onClick={() => scrollToSection(item.id)}
              className={cn(
                "text-sm text-left w-full py-1 px-2 rounded hover:bg-muted transition-colors flex items-center gap-2",
                item.level === 3 ? "text-muted-foreground" : "text-foreground"
              )}
            >
              <span className="text-primary font-medium">{index + 1}.</span>
              <span className="line-clamp-1">{item.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
