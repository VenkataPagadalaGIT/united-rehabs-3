import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, ExternalLink, AlertTriangle, CheckCircle, Info, HelpCircle, Star } from "lucide-react";

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
    syntax: "[cta-find-treatment text=\"Find Treatment\"]",
    category: "CTA",
  },
  "cta-insurance": {
    name: "Insurance Check CTA",
    description: "Verify insurance coverage",
    syntax: "[cta-insurance]",
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
  // Feature Shortcodes
  "stat-card": {
    name: "Statistic Card",
    description: "Display a key statistic",
    syntax: "[stat-card number=\"2.1M\" label=\"People Affected\"]",
    category: "Feature",
  },
  "testimonial": {
    name: "Testimonial",
    description: "Quote from a person",
    syntax: "[testimonial author=\"John D.\" location=\"California\"]Recovery is possible![/testimonial]",
    category: "Feature",
  },
  "faq": {
    name: "FAQ Item",
    description: "Expandable FAQ",
    syntax: "[faq question=\"What is addiction?\"]Answer goes here[/faq]",
    category: "Feature",
  },
  "checklist": {
    name: "Checklist",
    description: "Bulleted checklist with checkmarks",
    syntax: "[checklist]Item 1|Item 2|Item 3[/checklist]",
    category: "Feature",
  },
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

  "stat-card": ({ number, label }: { number: string; label: string }) => (
    <Card className="my-4 text-center">
      <CardContent className="p-6">
        <p className="text-4xl font-bold text-primary">{number}</p>
        <p className="text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  ),

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
    const items = children.split("|").map((item) => item.trim());
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
};

// Parse and render shortcodes in content
export function renderShortcodes(content: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Pattern to match shortcodes: [shortcode attr="value"]content[/shortcode] or [shortcode attr="value"]
  const shortcodePattern = /\[(\w+(?:-\w+)*)((?:\s+\w+="[^"]*")*)\](?:([\s\S]*?)\[\/\1\])?/g;

  let match;
  while ((match = shortcodePattern.exec(content)) !== null) {
    // Add text before shortcode
    if (match.index > lastIndex) {
      elements.push(content.slice(lastIndex, match.index));
    }

    const [fullMatch, shortcodeName, attrsString, innerContent] = match;

    // Parse attributes
    const attrs: Record<string, string> = {};
    const attrPattern = /(\w+)="([^"]*)"/g;
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
