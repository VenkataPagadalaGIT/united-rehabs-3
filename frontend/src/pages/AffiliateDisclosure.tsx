import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Link2, AlertTriangle, Building2, CheckCircle } from "lucide-react";

export default function AffiliateDisclosure() {
  const lastUpdated = "January 26, 2026";

  return (
    <div className="min-h-screen bg-background">
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Affiliate & Advertising Disclosure</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          {/* Transparency Notice */}
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-foreground mb-2">Our Commitment to Transparency</h2>
                  <p className="text-sm text-muted-foreground">
                    At United Rehabs, we believe in full transparency about our business relationships. This disclosure explains how we may receive compensation and how it affects (or doesn't affect) the information we provide.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">What This Disclosure Covers</h2>
              <p className="text-muted-foreground leading-relaxed">
                This disclosure is provided in accordance with guidelines from the U.S. Federal Trade Commission (FTC), Advertising Standards Authority (UK), and similar regulatory bodies worldwide. It applies to all content on unitedrehabs.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Treatment Facility Relationships
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                United Rehabs may have financial relationships with some treatment facilities listed on our website. These relationships may include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Referral fees:</strong> We may receive compensation when users contact or are admitted to certain facilities</li>
                <li><strong>Advertising fees:</strong> Facilities may pay for enhanced listings or sponsored placements</li>
                <li><strong>Partnership arrangements:</strong> Some facilities may be featured through paid partnerships</li>
              </ul>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg mt-4">
                <p className="text-foreground font-medium flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Important Disclosure
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Financial relationships DO NOT influence which facilities appear in our search results or how they are ranked. Our editorial content and data remain independent of advertising relationships.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Link2 className="h-6 w-6 text-primary" />
                Affiliate Links
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Some links on our website may be "affiliate links." This means:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>If you click on certain links and take action (such as contacting a facility), we may receive a commission</li>
                <li>The price you pay is NOT affected by affiliate commissions</li>
                <li>Affiliate relationships do not influence our editorial recommendations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                How We're Compensated
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                United Rehabs may receive revenue through:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2">Call Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Phone calls to listed facilities may be routed through tracking numbers. We may receive compensation for calls that result in admissions.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2">Form Submissions</h3>
                    <p className="text-sm text-muted-foreground">
                      When you submit inquiry forms for certain facilities, we may receive compensation for qualified leads.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2">Sponsored Listings</h3>
                    <p className="text-sm text-muted-foreground">
                      Some listings may be marked as "Sponsored" or "Featured." These facilities pay for enhanced visibility.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2">Display Advertising</h3>
                    <p className="text-sm text-muted-foreground">
                      We may display advertisements from advertising networks. Ad content is not endorsed by us.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">How to Identify Paid Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                We clearly identify paid or sponsored content using labels such as:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>"Sponsored"</li>
                <li>"Featured Partner"</li>
                <li>"Advertisement" or "Ad"</li>
                <li>"Paid Listing"</li>
                <li>"Partner Content"</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Editorial Independence</h2>
              <p className="text-muted-foreground leading-relaxed">
                Despite financial relationships, we maintain strict editorial independence:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Statistics and data</strong> are sourced from official government agencies and are not influenced by advertisers</li>
                <li><strong>Educational content</strong> is written by qualified professionals without advertiser input</li>
                <li><strong>Search rankings</strong> are based on objective criteria, not payment</li>
                <li><strong>Negative information</strong> about paying partners is not suppressed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Our Recommendations</h2>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-muted-foreground leading-relaxed">
                  <strong>We strongly recommend that you:</strong>
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                  <li>Research multiple treatment options before making decisions</li>
                  <li>Verify facility credentials, licensing, and accreditation independently</li>
                  <li>Consult with healthcare professionals about treatment options</li>
                  <li>Contact your insurance provider about coverage</li>
                  <li>Read reviews from multiple sources</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">International Compliance</h2>
              <p className="text-muted-foreground leading-relaxed">
                This disclosure complies with advertising regulations in multiple jurisdictions:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>United States:</strong> FTC Endorsement Guides (16 CFR Part 255)</li>
                <li><strong>United Kingdom:</strong> ASA CAP Code</li>
                <li><strong>European Union:</strong> Unfair Commercial Practices Directive</li>
                <li><strong>Australia:</strong> Australian Consumer Law</li>
                <li><strong>Canada:</strong> Competition Act advertising provisions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Questions About Compensation</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about our business relationships or how we're compensated, please contact us:
              </p>
              <div className="bg-muted/30 p-6 rounded-lg mt-4">
                <p className="text-muted-foreground">Email: partnerships@unitedrehabs.com</p>
                <p className="text-muted-foreground">Subject: Affiliate/Advertising Inquiry</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Updates to This Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this disclosure as our business relationships change. The "Last updated" date at the top of this page indicates when it was last revised.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
