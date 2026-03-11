import {
  FileText, Scale, Pill, Shield, Heart, BookOpen, BarChart3, Users, Gavel, Globe,
  FlaskConical, DollarSign, AlertTriangle, HelpCircle, Library, Car, Leaf, HandHeart,
  Clock, Scroll, Siren, Briefcase, Building2, MessageCircleQuestion
} from "lucide-react";

// Icon matching by keyword — order matters (first match wins)
const ICON_RULES: [RegExp, React.ElementType][] = [
  [/overview|summary|introduction|about/i, FileText],
  [/schedule|classification|controlled/i, Scroll],
  [/penalty|chart|sentenc/i, Siren],
  [/possession|laws?$/i, Scale],
  [/dui|dwi|driving/i, Car],
  [/marijuana|cannabis|weed/i, Leaf],
  [/good samaritan|immunity/i, HandHeart],
  [/naloxone|narcan|overdose reversal/i, Heart],
  [/drug court|diversion/i, Building2],
  [/mandatory|minimum/i, Gavel],
  [/treatment|alternative|recovery|rehab/i, Users],
  [/recent|change|update|new/i, Clock],
  [/faq|question|asked/i, HelpCircle],
  [/source|reading|reference|further/i, Library],
  [/result|ballot|vote|election/i, BarChart3],
  [/measure|legislation|bill|law|legal/i, Scale],
  [/drug|substance|fentanyl|opioid|heroin/i, Pill],
  [/enforcement|police|dea|seizure|arrest|raid/i, Shield],
  [/health|naloxone|harm reduction/i, Heart],
  [/data|number|statistic|funding|budget|cost/i, DollarSign],
  [/international|global|context|nation|country|world/i, Globe],
  [/research|study|science|clinical/i, FlaskConical],
  [/court|ruling|trial|verdict/i, Gavel],
  [/community|people|youth|family|public/i, Users],
  [/expert|reaction|opinion|impact/i, BookOpen],
  [/warning|risk|threat|crisis|concern/i, AlertTriangle],
  [/what comes|next|future|outlook/i, Briefcase],
  [/expunge|record|criminal/i, Scale],
];

function getIcon(label: string): React.ElementType {
  for (const [pattern, Icon] of ICON_RULES) {
    if (pattern.test(label)) return Icon;
  }
  return FileText;
}

export interface TocItem {
  href: string;
  label: string;
}

interface JumpToSectionProps {
  items: TocItem[];
  activeId?: string | null;
}

/**
 * Extracts TOC items from article HTML content.
 * Looks for `<h2>Table of Contents</h2>` followed by `<ul>...</ul>` with anchor links.
 * Returns the items and the cleaned content with the TOC block removed.
 */
/**
 * Extracts the "Key Takeaways" summary box from article HTML.
 * Returns the summary HTML and the content with it removed.
 */
export function extractSummaryBox(html: string): { summaryHtml: string | null; contentWithoutSummary: string } {
  // Match the summary-box div — it contains <ul>...</ul> then closes with </div>
  // Some articles wrap with extra </div> so we match up to the closing </ul> then grab remaining </div> tags
  const summaryRegex = /<div\s+class="summary-box"[^>]*>[\s\S]*?<\/ul>\s*<\/div>/i;
  const match = html.match(summaryRegex);
  if (!match) return { summaryHtml: null, contentWithoutSummary: html };
  return { summaryHtml: match[0], contentWithoutSummary: html.replace(match[0], "").trim() };
}

export function extractTocFromHtml(html: string): { tocItems: TocItem[]; contentWithoutToc: string } {
  // Match the full TOC block: optional <nav>, <h2>Table of Contents</h2>, any content in between, then <ul>...</ul>, optional </nav>
  const tocRegex = /(?:<nav[^>]*>)?\s*<h2[^>]*>\s*Table of Contents\s*<\/h2>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>\s*(?:<\/nav>)?/i;
  const match = html.match(tocRegex);
  if (!match) return { tocItems: [], contentWithoutToc: html };

  const linkRegex = /<a\s+href="([^"]*)"[^>]*>([^<]+)<\/a>/gi;
  const items: TocItem[] = [];
  let linkMatch;
  while ((linkMatch = linkRegex.exec(match[1])) !== null) {
    items.push({ href: linkMatch[1], label: linkMatch[2] });
  }

  // Remove the entire matched TOC block from content
  const cleaned = html.replace(match[0], "");
  return { tocItems: items, contentWithoutToc: cleaned };
}

/**
 * Styled "JUMP TO SECTION" grid component.
 * Matches the drug laws page style: rounded card, 4-col grid, icons, active highlight.
 */
export function JumpToSection({ items, activeId }: JumpToSectionProps) {
  if (!items.length) return null;

  return (
    <nav className="bg-muted/30 border rounded-xl p-5 mb-8">
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
        Jump to Section
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
        {items.map((item) => {
          const Icon = getIcon(item.label);
          const id = item.href.replace("#", "");
          const isActive = activeId === id;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 text-sm transition-colors group ${
                isActive
                  ? "text-primary font-medium"
                  : "text-foreground hover:text-primary"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              }`} />
              <span className="truncate">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
