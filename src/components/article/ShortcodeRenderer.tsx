import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, ExternalLink, AlertTriangle, CheckCircle, Info, HelpCircle, Star,
  ThumbsUp, ThumbsDown, Play, Table, ArrowRight, Quote, Zap, Shield, Heart,
  Clock, DollarSign, Users, Award, TrendingUp, MapPin
} from "lucide-react";

// Shortcode definitions for the library
export const SHORTCODES = {
  // CTA Shortcodes
  "cta-helpline": {
    name: "Helpline CTA",
    description: "24/7 addiction helpline call-to-action",
    syntax: "[cta-helpline]",
    category: "CTA",
  },
  "cta-find-treatment": {
    name: "Find Treatment CTA",
    description: "Button to find treatment centers",
    syntax: '[cta-find-treatment text="Find Treatment"]',
    category: "CTA",
  },
  "cta-insurance": {
    name: "Insurance Check CTA",
    description: "Verify insurance coverage",
    syntax: "[cta-insurance]",
    category: "CTA",
  },
  "cta-button": {
    name: "Custom Button",
    description: "Customizable CTA button",
    syntax: '[cta-button text="Get Started" url="/contact" variant="primary"]',
    category: "CTA",
  },
  // Alert Shortcodes
  "alert-warning": {
    name: "Warning Alert",
    description: "Yellow warning box",
    syntax: "[alert-warning]Your warning text here[/alert-warning]",
    category: "Alert",
  },
  "alert-info": {
    name: "Info Alert",
    description: "Blue information box",
    syntax: "[alert-info]Your info text here[/alert-info]",
    category: "Alert",
  },
  "alert-success": {
    name: "Success Alert",
    description: "Green success box",
    syntax: "[alert-success]Your success text here[/alert-success]",
    category: "Alert",
  },
  "alert-danger": {
    name: "Danger Alert",
    description: "Red danger/error box",
    syntax: "[alert-danger]Critical information here[/alert-danger]",
    category: "Alert",
  },
  // Media Shortcodes
  "video-youtube": {
    name: "YouTube Video",
    description: "Embed a YouTube video",
    syntax: '[video-youtube id="dQw4w9WgXcQ" title="Video Title"]',
    category: "Media",
  },
  "video-vimeo": {
    name: "Vimeo Video",
    description: "Embed a Vimeo video",
    syntax: '[video-vimeo id="123456789" title="Video Title"]',
    category: "Media",
  },
  "video-embed": {
    name: "Custom Video",
    description: "Embed any video URL",
    syntax: '[video-embed url="https://example.com/video.mp4" poster="https://example.com/poster.jpg"]',
    category: "Media",
  },
  // Comparison Shortcodes
  "pros-cons": {
    name: "Pros & Cons",
    description: "Two-column pros and cons list",
    syntax: "[pros-cons pros=\"Pro 1|Pro 2|Pro 3\" cons=\"Con 1|Con 2|Con 3\"]",
    category: "Comparison",
  },
  "comparison-table": {
    name: "Comparison Table",
    description: "Compare features across options",
    syntax: '[comparison-table headers="Feature|Option A|Option B" rows="Price|$100|$150::Quality|High|Medium::Support|24/7|Business Hours"]',
    category: "Comparison",
  },
  "versus": {
    name: "Versus Block",
    description: "Compare two options side by side",
    syntax: '[versus left-title="Inpatient" left-items="24/7 care|Structured|Intensive" right-title="Outpatient" right-items="Flexible|Part-time|Home-based"]',
    category: "Comparison",
  },
  // Feature Shortcodes
  "stat-card": {
    name: "Statistic Card",
    description: "Display a key statistic",
    syntax: '[stat-card number="2.1M" label="People Affected"]',
    category: "Feature",
  },
  "stat-row": {
    name: "Stats Row",
    description: "Multiple stats in a row",
    syntax: '[stat-row stats="85%|Recovery Rate::2.1M|People Helped::500+|Treatment Centers"]',
    category: "Feature",
  },
  "testimonial": {
    name: "Testimonial",
    description: "Quote from a person",
    syntax: '[testimonial author="John D." location="California"]Recovery is possible![/testimonial]',
    category: "Feature",
  },
  "quote-block": {
    name: "Quote Block",
    description: "Highlighted quote with author",
    syntax: '[quote-block author="Dr. Smith" role="Addiction Specialist"]The journey to recovery begins with a single step.[/quote-block]',
    category: "Feature",
  },
  "faq": {
    name: "FAQ Item",
    description: "Expandable FAQ",
    syntax: '[faq question="What is addiction?"]Answer goes here[/faq]',
    category: "Feature",
  },
  "checklist": {
    name: "Checklist",
    description: "Bulleted checklist with checkmarks",
    syntax: "[checklist]Item 1|Item 2|Item 3[/checklist]",
    category: "Feature",
  },
  "feature-grid": {
    name: "Feature Grid",
    description: "Grid of features with icons",
    syntax: '[feature-grid items="Shield|Safe Environment|24/7 medical supervision::Heart|Compassionate Care|Personalized treatment::Users|Community|Peer support groups"]',
    category: "Feature",
  },
  "steps": {
    name: "Steps List",
    description: "Numbered steps with descriptions",
    syntax: '[steps items="Call Us|Speak with an advisor::Assessment|Get evaluated::Treatment|Begin your journey"]',
    category: "Feature",
  },
  "highlight-box": {
    name: "Highlight Box",
    description: "Highlighted content box",
    syntax: '[highlight-box title="Did You Know?" icon="Zap"]Interesting fact or important information here[/highlight-box]',
    category: "Feature",
  },
  "location-card": {
    name: "Location Card",
    description: "Display a treatment center location",
    syntax: '[location-card name="Recovery Center LA" address="123 Main St, Los Angeles, CA" phone="555-123-4567" rating="4.8"]',
    category: "Feature",
  },
};

// Icon mapping for dynamic icons
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Shield, Heart, Users, Award, TrendingUp, Zap, Clock, DollarSign, MapPin, Star,
  CheckCircle, AlertTriangle, Info, Phone, ThumbsUp, ThumbsDown, Quote,
};

// Component renderers for each shortcode
const ShortcodeComponents: Record<string, React.FC<any>> = {
  "cta-helpline": () => (
    <Card className="bg-primary text-primary-foreground my-6">
      <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <Phone className="h-8 w-8" />
          <div>
            <p className="font-semibold text-lg">Need Help Now?</p>
            <p className="text-primary-foreground/80 text-sm">
              Free, confidential 24/7 support
            </p>
          </div>
        </div>
        <Button variant="secondary" size="lg" asChild>
          <a href="tel:1-800-662-4357">
            <Phone className="h-4 w-4 mr-2" />
            1-800-662-4357
          </a>
        </Button>
      </CardContent>
    </Card>
  ),

  "cta-find-treatment": ({ text = "Find Treatment Centers" }) => (
    <div className="my-6 text-center">
      <Button size="lg" asChild>
        <a href="/california-addiction-rehabs">
          {text}
          <ExternalLink className="h-4 w-4 ml-2" />
        </a>
      </Button>
    </div>
  ),

  "cta-insurance": () => (
    <Card className="my-6 border-2 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Verify Your Insurance</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Check if your insurance covers addiction treatment - it takes less than a minute.
            </p>
            <Button variant="outline" size="sm">
              Check Coverage
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ),

  "cta-button": ({ text = "Get Started", url = "#", variant = "primary" }) => (
    <div className="my-6 text-center">
      <Button 
        size="lg" 
        variant={variant === "secondary" ? "secondary" : variant === "outline" ? "outline" : "default"}
        asChild
      >
        <a href={url}>
          {text}
          <ArrowRight className="h-4 w-4 ml-2" />
        </a>
      </Button>
    </div>
  ),

  "alert-warning": ({ children }: { children: string }) => (
    <div className="my-6 p-4 bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 rounded-r-lg flex gap-3">
      <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
      <p className="text-yellow-800 dark:text-yellow-200">{children}</p>
    </div>
  ),

  "alert-info": ({ children }: { children: string }) => (
    <div className="my-6 p-4 bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 rounded-r-lg flex gap-3">
      <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
      <p className="text-blue-800 dark:text-blue-200">{children}</p>
    </div>
  ),

  "alert-success": ({ children }: { children: string }) => (
    <div className="my-6 p-4 bg-green-50 dark:bg-green-950 border-l-4 border-green-500 rounded-r-lg flex gap-3">
      <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
      <p className="text-green-800 dark:text-green-200">{children}</p>
    </div>
  ),

  "alert-danger": ({ children }: { children: string }) => (
    <div className="my-6 p-4 bg-red-50 dark:bg-red-950 border-l-4 border-red-500 rounded-r-lg flex gap-3">
      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
      <p className="text-red-800 dark:text-red-200">{children}</p>
    </div>
  ),

  "video-youtube": ({ id, title = "Video" }: { id: string; title?: string }) => (
    <div className="my-6 aspect-video rounded-lg overflow-hidden shadow-lg">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  ),

  "video-vimeo": ({ id, title = "Video" }: { id: string; title?: string }) => (
    <div className="my-6 aspect-video rounded-lg overflow-hidden shadow-lg">
      <iframe
        src={`https://player.vimeo.com/video/${id}`}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  ),

  "video-embed": ({ url, poster }: { url: string; poster?: string }) => (
    <div className="my-6 rounded-lg overflow-hidden shadow-lg">
      <video
        src={url}
        poster={poster}
        controls
        className="w-full"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  ),

  "pros-cons": ({ pros, cons }: { pros: string; cons: string }) => {
    const prosList = pros?.split("|") || [];
    const consList = cons?.split("|") || [];
    return (
      <div className="my-6 grid md:grid-cols-2 gap-4">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-green-600">
              <ThumbsUp className="h-5 w-5" />
              Pros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {prosList.map((pro, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                  <span>{pro.trim()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-red-600">
              <ThumbsDown className="h-5 w-5" />
              Cons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {consList.map((con, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                  <span>{con.trim()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  },

  "comparison-table": ({ headers, rows }: { headers: string; rows: string }) => {
    const headerList = headers?.split("|") || [];
    const rowList = rows?.split("::").map(row => row.split("|")) || [];
    return (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              {headerList.map((header, i) => (
                <th key={i} className="border p-3 text-left font-semibold">
                  {header.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowList.map((row, i) => (
              <tr key={i} className="even:bg-muted/50">
                {row.map((cell, j) => (
                  <td key={j} className="border p-3">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },

  "versus": ({ 
    "left-title": leftTitle, 
    "left-items": leftItems, 
    "right-title": rightTitle, 
    "right-items": rightItems 
  }: { "left-title": string; "left-items": string; "right-title": string; "right-items": string }) => {
    const leftList = leftItems?.split("|") || [];
    const rightList = rightItems?.split("|") || [];
    return (
      <div className="my-6 grid md:grid-cols-2 gap-4">
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-center">{leftTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {leftList.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="text-center">{rightTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {rightList.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary-foreground shrink-0" />
                  <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  },

  "stat-card": ({ number, label }: { number: string; label: string }) => (
    <Card className="my-4 text-center">
      <CardContent className="p-6">
        <p className="text-4xl font-bold text-primary">{number}</p>
        <p className="text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  ),

  "stat-row": ({ stats }: { stats: string }) => {
    const statList = stats?.split("::").map(s => s.split("|")) || [];
    return (
      <div className="my-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {statList.map(([number, label], i) => (
          <Card key={i} className="text-center">
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-primary">{number?.trim()}</p>
              <p className="text-sm text-muted-foreground">{label?.trim()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  },

  "testimonial": ({ author, location, children }: { author: string; location?: string; children: string }) => (
    <Card className="my-6 bg-muted/30">
      <CardContent className="p-6">
        <div className="flex gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <blockquote className="text-lg italic mb-4">"{children}"</blockquote>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="font-semibold text-primary">
              {author?.charAt(0) || "A"}
            </span>
          </div>
          <div>
            <p className="font-semibold">{author}</p>
            {location && <p className="text-sm text-muted-foreground">{location}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  ),

  "quote-block": ({ author, role, children }: { author?: string; role?: string; children: string }) => (
    <div className="my-8 relative">
      <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
      <blockquote className="pl-8 pr-4 py-4 border-l-4 border-primary bg-primary/5 rounded-r-lg">
        <p className="text-xl italic text-foreground mb-3">{children}</p>
        {author && (
          <footer className="text-sm text-muted-foreground">
            — <strong>{author}</strong>{role && `, ${role}`}
          </footer>
        )}
      </blockquote>
    </div>
  ),

  "faq": ({ question, children }: { question: string; children: string }) => (
    <details className="my-4 group border rounded-lg">
      <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
        <span className="font-medium flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          {question}
        </span>
        <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
      </summary>
      <div className="p-4 pt-0 text-muted-foreground">{children}</div>
    </details>
  ),

  "checklist": ({ children }: { children: string }) => {
    const items = children?.split("|").map((item) => item.trim()) || [];
    return (
      <ul className="my-4 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  },

  "feature-grid": ({ items }: { items: string }) => {
    const featureList = items?.split("::").map(item => {
      const [icon, title, desc] = item.split("|");
      return { icon: icon?.trim(), title: title?.trim(), desc: desc?.trim() };
    }) || [];
    return (
      <div className="my-6 grid md:grid-cols-3 gap-4">
        {featureList.map((feature, i) => {
          const IconComponent = iconMap[feature.icon] || Shield;
          return (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  },

  "steps": ({ items }: { items: string }) => {
    const stepList = items?.split("::").map(item => {
      const [title, desc] = item.split("|");
      return { title: title?.trim(), desc: desc?.trim() };
    }) || [];
    return (
      <div className="my-6 space-y-4">
        {stepList.map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              {i + 1}
            </div>
            <div className="pt-1">
              <h4 className="font-semibold">{step.title}</h4>
              {step.desc && <p className="text-muted-foreground">{step.desc}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  },

  "highlight-box": ({ title, icon = "Info", children }: { title?: string; icon?: string; children: string }) => {
    const IconComponent = iconMap[icon] || Info;
    return (
      <Card className="my-6 border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <IconComponent className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <div>
              {title && <h4 className="font-semibold mb-1">{title}</h4>}
              <p className="text-muted-foreground">{children}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },

  "location-card": ({ name, address, phone, rating }: { name: string; address?: string; phone?: string; rating?: string }) => (
    <Card className="my-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-lg">{name}</h4>
            {address && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {address}
              </p>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="text-sm text-primary flex items-center gap-1 mt-1">
                <Phone className="h-4 w-4" />
                {phone}
              </a>
            )}
          </div>
          {rating && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {rating}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  ),
};

// Parse and render shortcodes in content
export function renderShortcodes(content: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Pattern to match shortcodes: [shortcode attr="value"]content[/shortcode] or [shortcode attr="value"]
  const shortcodePattern = /\[(\w+(?:-\w+)*)((?:\s+[\w-]+="[^"]*")*)\](?:([\s\S]*?)\[\/\1\])?/g;

  let match;
  while ((match = shortcodePattern.exec(content)) !== null) {
    // Add text before shortcode
    if (match.index > lastIndex) {
      elements.push(content.slice(lastIndex, match.index));
    }

    const [fullMatch, shortcodeName, attrsString, innerContent] = match;

    // Parse attributes
    const attrs: Record<string, string> = {};
    const attrPattern = /([\w-]+)="([^"]*)"/g;
    let attrMatch;
    while ((attrMatch = attrPattern.exec(attrsString)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2];
    }

    // Get component for shortcode
    const Component = ShortcodeComponents[shortcodeName];
    if (Component) {
      elements.push(
        <Component key={match.index} {...attrs}>
          {innerContent}
        </Component>
      );
    } else {
      // Unknown shortcode, render as-is
      elements.push(fullMatch);
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    elements.push(content.slice(lastIndex));
  }

  return elements;
}

// Shortcode Library Panel for admin
export function ShortcodeLibrary({ onInsert }: { onInsert: (syntax: string) => void }) {
  const categories = [...new Set(Object.values(SHORTCODES).map((s) => s.category))];

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Click a shortcode to insert it into your content
      </div>
      {categories.map((category) => (
        <div key={category}>
          <h4 className="font-semibold mb-2">{category}</h4>
          <div className="grid gap-2">
            {Object.entries(SHORTCODES)
              .filter(([_, s]) => s.category === category)
              .map(([key, shortcode]) => (
                <Card
                  key={key}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onInsert(shortcode.syntax)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{shortcode.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {shortcode.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    </div>
                    <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block overflow-x-auto">
                      {shortcode.syntax}
                    </code>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
