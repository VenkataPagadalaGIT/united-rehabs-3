import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { SEOHead } from "@/components/SEOHead";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { SHORTCODES, renderShortcodes } from "@/components/article/ShortcodeRenderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ShortcodeShowcase = () => {
  const categories = [...new Set(Object.values(SHORTCODES).map((s) => s.category))];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Sample shortcode content for each type
  const shortcodeExamples: Record<string, string> = {
    "cta-helpline": "[cta-helpline]",
    "cta-find-treatment": '[cta-find-treatment text="Find Treatment Near You"]',
    "cta-insurance": "[cta-insurance]",
    "cta-button": '[cta-button text="Get Started Today" url="/contact" variant="primary"]',
    "alert-warning": "[alert-warning]Mixing alcohol with prescription medications can be dangerous. Always consult your doctor.[/alert-warning]",
    "alert-info": "[alert-info]Most insurance plans cover addiction treatment. Check with your provider for details.[/alert-info]",
    "alert-success": "[alert-success]Recovery is possible! Millions of people have successfully overcome addiction.[/alert-success]",
    "alert-danger": "[alert-danger]If you or someone you know is experiencing an overdose, call 911 immediately.[/alert-danger]",
    "video-youtube": '[video-youtube id="dQw4w9WgXcQ" title="Understanding Addiction"]',
    "video-vimeo": '[video-vimeo id="76979871" title="Recovery Stories"]',
    "video-embed": '[video-embed url="https://www.w3schools.com/html/mov_bbb.mp4" poster=""]',
    "pros-cons": '[pros-cons pros="24/7 medical supervision|Structured environment|Peer support|Focus on recovery" cons="Time away from work/family|Higher cost|Less flexibility|May feel isolated"]',
    "comparison-table": '[comparison-table headers="Feature|Inpatient|Outpatient|Intensive Outpatient" rows="Duration|30-90 days|Varies|6-12 weeks::Hours/Week|24/7|2-5 hrs|9-20 hrs::Housing|Provided|Home|Home::Cost|$$$$|$$|$$$"]',
    "versus": '[versus left-title="Inpatient Treatment" left-items="24/7 care and supervision|Structured daily schedule|Medical detox available|No outside distractions" right-title="Outpatient Treatment" right-items="Continue working/school|Stay with family|Lower cost|Flexible scheduling"]',
    "stat-card": '[stat-card number="2.1M" label="Americans in Recovery"]',
    "stat-row": '[stat-row stats="85%|Recovery Rate::21M+|Affected Annually::14,000+|Treatment Facilities"]',
    "testimonial": '[testimonial author="Michael R." location="Los Angeles, CA"]After 15 years of struggling, I finally found a program that worked. Two years sober and counting. If I can do it, anyone can.[/testimonial]',
    "quote-block": '[quote-block author="Dr. Sarah Mitchell" role="Addiction Medicine Specialist"]The journey to recovery is not a straight line. Every step forward, no matter how small, is progress worth celebrating.[/quote-block]',
    "faq": '[faq question="How long does addiction treatment typically take?"]Treatment duration varies based on individual needs. Most programs range from 30-90 days for inpatient care, while outpatient programs may continue for several months. Long-term recovery is a lifelong journey that extends beyond formal treatment.[/faq]',
    "checklist": "[checklist]Medically supervised detox|Individual therapy sessions|Group counseling|Family therapy|Aftercare planning|Alumni support program[/checklist]",
    "feature-grid": '[feature-grid items="Shield|Safe Environment|24/7 medical supervision and security::Heart|Compassionate Care|Personalized treatment plans::Users|Community|Supportive peer groups"]',
    "steps": '[steps items="Call Us|Speak with a caring admission specialist::Assessment|Receive a personalized treatment evaluation::Verify Insurance|We handle all insurance verification::Begin Treatment|Start your journey to recovery]',
    "highlight-box": '[highlight-box title="Did You Know?" icon="Zap"]Addiction is classified as a chronic brain disorder, not a moral failing. With proper treatment, recovery rates are comparable to other chronic conditions like diabetes and heart disease.[/highlight-box]',
    "location-card": '[location-card name="Serenity Recovery Center" address="1234 Healing Way, Los Angeles, CA 90001" phone="555-123-4567" rating="4.9"]',
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        pageSlug="shortcode-showcase"
        fallbackTitle="Shortcode Library | Visual Preview"
        fallbackDescription="Preview all available shortcodes for your articles and pages"
      />
      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4 py-8">
        <Link to="/admin/articles">
          <Button variant="ghost" className="mb-6 -ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles Admin
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Shortcode Library</h1>
            <p className="text-xl text-muted-foreground">
              Visual preview of all available shortcodes. Click the code to copy.
            </p>
          </div>

          {categories.map((category) => (
            <section key={category} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {category}
                </Badge>
              </h2>

              <div className="space-y-8">
                {Object.entries(SHORTCODES)
                  .filter(([_, s]) => s.category === category)
                  .map(([key, shortcode]) => (
                    <Card key={key} className="overflow-hidden">
                      <CardHeader className="bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{shortcode.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {shortcode.description}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(shortcodeExamples[key] || shortcode.syntax)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        {/* Code block */}
                        <div className="bg-slate-950 text-slate-50 p-4 overflow-x-auto">
                          <code className="text-sm font-mono whitespace-pre-wrap break-all">
                            {shortcodeExamples[key] || shortcode.syntax}
                          </code>
                        </div>
                        
                        {/* Live preview */}
                        <div className="p-6 border-t">
                          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wide">
                            Live Preview
                          </p>
                          <div className="prose max-w-none">
                            {renderShortcodes(shortcodeExamples[key] || shortcode.syntax)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default ShortcodeShowcase;
