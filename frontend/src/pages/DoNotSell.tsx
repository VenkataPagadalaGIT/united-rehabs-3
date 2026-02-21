import { SEOHead } from "@/components/SEOHead";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX, Globe, CheckCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function DoNotSell() {
  const lastUpdated = "January 26, 2026";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead pageSlug="do-not-sell" fallbackTitle="Do Not Sell My Personal Information" fallbackDescription="Exercise your right to opt out of personal data sales. CCPA and privacy rights for United Rehabs users." keywords="do not sell, CCPA opt out, personal data, privacy rights" />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Do Not Sell or Share My Personal Information</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          {/* Key Message */}
          <Card className="mb-8 bg-green-500/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-foreground mb-2">United Rehabs Does NOT Sell Your Personal Information</h2>
                  <p className="text-sm text-muted-foreground">
                    We do not sell, rent, trade, or share your personal information with third parties for monetary consideration. This has always been our practice and remains our commitment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights Under Privacy Laws</h2>
              <p className="text-muted-foreground leading-relaxed">
                Various privacy laws around the world grant you the right to opt out of the "sale" or "sharing" of your personal information. This page explains these rights and how they apply to United Rehabs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                Applicable Laws
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2">🇺🇸 California (CCPA/CPRA)</h3>
                    <p className="text-sm text-muted-foreground">
                      California residents have the right to opt out of the "sale" or "sharing" of personal information. Under CPRA, "sharing" includes cross-context behavioral advertising.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2">🇺🇸 Virginia (VCDPA)</h3>
                    <p className="text-sm text-muted-foreground">
                      Virginia residents can opt out of the sale of personal data and targeted advertising.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2">🇺🇸 Colorado (CPA)</h3>
                    <p className="text-sm text-muted-foreground">
                      Colorado residents have rights to opt out of targeted advertising, sale of data, and profiling.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2">🇺🇸 Connecticut, Utah, etc.</h3>
                    <p className="text-sm text-muted-foreground">
                      Multiple US states have enacted similar privacy laws with opt-out rights.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">What "Sale" and "Sharing" Mean</h2>
              <p className="text-muted-foreground leading-relaxed">
                Under various privacy laws:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>"Sale"</strong> typically means exchanging personal information for monetary or other valuable consideration</li>
                <li><strong>"Sharing"</strong> (under CPRA) means making personal information available for cross-context behavioral advertising</li>
                <li>These definitions may include sharing data with advertising partners for targeted ads</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Our Practices</h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong>United Rehabs does NOT:</strong>
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Sell your personal information to third parties for money</li>
                <li>Share your personal information for cross-context behavioral advertising</li>
                <li>Provide your data to data brokers</li>
                <li>Trade your information for services</li>
              </ul>
              
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>We may share data with:</strong>
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Service providers who assist in operating our website (under contract)</li>
                <li>Analytics providers (with anonymization/aggregation where possible)</li>
                <li>Legal authorities when required by law</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                These disclosures are generally NOT considered "sales" under privacy laws as they are for operational purposes under contracts that restrict further use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                How to Exercise Your Rights
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Although we do not sell your personal information, we honor your privacy preferences:
              </p>
              
              <div className="bg-muted/30 p-6 rounded-lg mt-4">
                <h3 className="font-medium text-foreground mb-4">Opt-Out Options</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-foreground">1. Global Privacy Control (GPC)</p>
                    <p className="text-sm text-muted-foreground">
                      We honor GPC signals. Enable GPC in your browser, and we will treat this as a valid opt-out request.
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-foreground">2. Cookie Preferences</p>
                    <p className="text-sm text-muted-foreground">
                      Use our cookie banner to manage non-essential cookies, including any used for analytics or advertising.
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-foreground">3. Direct Request</p>
                    <p className="text-sm text-muted-foreground">
                      Email us at privacy@unitedrehabs.com with "Do Not Sell" in the subject line.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Authorized Agents</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may designate an authorized agent to submit opt-out requests on your behalf. The agent must:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide proof of authorization (power of attorney or signed permission)</li>
                <li>Verify their identity</li>
                <li>Provide your identity verification</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Non-Discrimination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We will not discriminate against you for exercising your privacy rights. You will receive the same service quality and pricing regardless of your privacy choices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Response Timeframe</h2>
              <p className="text-muted-foreground leading-relaxed">
                We will respond to opt-out requests within the timeframes required by applicable law:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>CCPA/CPRA: 15 business days to process, with confirmation</li>
                <li>Other state laws: As required by each respective law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <div className="bg-muted/30 p-6 rounded-lg">
                <p className="text-foreground font-medium mb-4">To exercise your rights or ask questions:</p>
                <p className="text-muted-foreground">Email: privacy@unitedrehabs.com</p>
                <p className="text-muted-foreground">Subject: "Do Not Sell Request" or "Privacy Rights"</p>
                
                <div className="mt-6">
                  <Link to="/privacy-policy">
                    <Button variant="outline">
                      View Full Privacy Policy
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Verification</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may need to verify your identity before processing certain requests. This helps protect your privacy and prevent fraudulent requests. We will only use information provided for verification purposes.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
