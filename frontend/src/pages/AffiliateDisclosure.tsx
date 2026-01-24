import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { AlertTriangle, DollarSign, Shield, FileText } from "lucide-react";

export default function AffiliateDisclosure() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header navItems={mockNavItems} />
      
      <main id="main-content" className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Affiliate & Advertising Disclosure</h1>
              <p className="text-muted-foreground">
                <strong>FTC Compliance Notice:</strong> This disclosure is provided in accordance with the Federal Trade Commission's 16 CFR Part 255 guidelines concerning the use of endorsements and testimonials in advertising.
              </p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-8">Last updated: January 16, 2026</p>
          
          {/* Material Connection Disclosure */}
          <section className="mb-10" aria-labelledby="material-connection">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 id="material-connection" className="text-xl font-semibold text-foreground">Material Connection Disclosure</h2>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-foreground mb-4">
                United Rehabs may receive compensation when you click on links to treatment centers listed on our website and/or submit a form requesting information or assistance. This compensation may impact:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground mb-4">
                <li>How and where treatment centers appear on our website</li>
                <li>The order in which they appear in listings</li>
                <li>Whether a treatment center is featured or highlighted</li>
              </ul>
              <p className="text-foreground">
                <strong>Important:</strong> Our acceptance of compensation does not constitute an endorsement of any treatment center. Compensation does not influence our editorial content, reviews, or data-driven statistics sourced from government databases.
              </p>
            </div>
          </section>
          
          {/* Types of Compensation */}
          <section className="mb-10" aria-labelledby="compensation-types">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 id="compensation-types" className="text-xl font-semibold text-foreground">Types of Compensation We May Receive</h2>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">1. Referral Fees</h3>
                <p className="text-muted-foreground">
                  We may receive a fee when a user contacts a treatment center through our website and subsequently enrolls in their program.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">2. Advertising Fees</h3>
                <p className="text-muted-foreground">
                  Treatment centers may pay for enhanced visibility, featured placement, or promotional content on our website.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">3. Lead Generation Fees</h3>
                <p className="text-muted-foreground">
                  We may receive compensation when users submit inquiry forms or request call-backs from treatment centers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">4. Pay-Per-Call Fees</h3>
                <p className="text-muted-foreground">
                  Some phone numbers displayed on our website may connect to call centers, and we may receive compensation for calls that meet certain duration or qualification criteria.
                </p>
              </div>
            </div>
          </section>
          
          {/* Editorial Independence */}
          <section className="mb-10" aria-labelledby="editorial-independence">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 id="editorial-independence" className="text-xl font-semibold text-foreground">Editorial Independence</h2>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-foreground mb-4">
                Despite our financial relationships with some treatment centers, we are committed to providing accurate, unbiased information to help you make informed decisions about addiction treatment:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li><strong>Statistics and Data:</strong> All statistics are sourced from official government databases (SAMHSA, CDC, NIDA) and are not influenced by advertising relationships</li>
                <li><strong>Verification Status:</strong> Treatment center verification is based on objective licensing and accreditation criteria, not payment</li>
                <li><strong>User Reviews:</strong> We do not modify or suppress user reviews based on advertising relationships</li>
                <li><strong>Educational Content:</strong> Our articles, guides, and resources are created independently and are not sponsored content unless explicitly labeled</li>
              </ul>
            </div>
          </section>
          
          {/* Sponsored Content */}
          <section className="mb-10" aria-labelledby="sponsored-content">
            <h2 id="sponsored-content" className="text-xl font-semibold text-foreground mb-4">Identifying Sponsored Content</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-foreground mb-4">
                When content is sponsored or paid for by a treatment center, we clearly identify it with labels such as:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground mb-4">
                <li>"Sponsored"</li>
                <li>"Featured Partner"</li>
                <li>"Advertisement"</li>
                <li>"Paid Placement"</li>
              </ul>
              <p className="text-muted-foreground">
                Treatment center cards may display an "Ad" indicator when that listing is a paid placement.
              </p>
            </div>
          </section>
          
          {/* Your Responsibility */}
          <section className="mb-10" aria-labelledby="your-responsibility">
            <h2 id="your-responsibility" className="text-xl font-semibold text-foreground mb-4">Your Responsibility</h2>
            <div className="bg-muted border border-border rounded-lg p-6">
              <p className="text-foreground mb-4">
                We encourage you to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Conduct your own research on any treatment center before making a decision</li>
                <li>Verify licensing and accreditation directly with state agencies</li>
                <li>Consult with healthcare professionals about your treatment options</li>
                <li>Read reviews from multiple sources</li>
                <li>Contact treatment centers directly to verify information</li>
              </ul>
            </div>
          </section>
          
          {/* Contact */}
          <section aria-labelledby="disclosure-contact">
            <h2 id="disclosure-contact" className="text-xl font-semibold text-foreground mb-4">Questions About This Disclosure</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-foreground">
                If you have questions about our advertising relationships or this disclosure, please contact us at{" "}
                <a href="mailto:advertising@unitedrehabs.org" className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">
                  advertising@unitedrehabs.org
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
