import { SEOHead } from "@/components/SEOHead";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Scale, AlertTriangle, Globe } from "lucide-react";

export default function TermsOfService() {
  const lastUpdated = "January 26, 2026";
  const effectiveDate = "January 26, 2026";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead pageSlug="terms-of-service" fallbackTitle="Terms of Service" fallbackDescription="Terms of Service for United Rehabs. Rules governing use of our addiction statistics and data platform." keywords="terms of service, united rehabs terms, website terms" />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated} | Effective: {effectiveDate}</p>
          </div>

          {/* Important Notice */}
          <Card className="mb-8 border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-foreground mb-2">Important Notice</h2>
                  <p className="text-sm text-muted-foreground">
                    By using United Rehabs, you agree to these Terms of Service. If you do not agree, please do not use our Website. These terms constitute a legally binding agreement between you and United Rehabs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service ("Terms") govern your access to and use of unitedrehabs.com (the "Website") operated by United Rehabs ("we," "us," or "our"). By accessing or using the Website, you agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                These Terms apply to all users worldwide. Additional terms may apply based on your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                United Rehabs is an informational directory providing:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Addiction and substance abuse statistics by country and region</li>
                <li>Information about treatment facilities and rehabilitation centers</li>
                <li>Educational resources about addiction and recovery</li>
                <li>Tools to compare data across regions</li>
              </ul>
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg mt-4">
                <p className="text-foreground font-medium mb-2">⚠️ Medical Disclaimer</p>
                <p className="text-muted-foreground text-sm">
                  We are NOT a healthcare provider. Our Website provides general information only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Eligibility</h2>
              <p className="text-muted-foreground leading-relaxed">
                You must be at least 18 years old (or the age of majority in your jurisdiction) to use this Website. By using our Website, you represent and warrant that you meet this requirement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You agree NOT to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Use the Website for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any systems or networks</li>
                <li>Interfere with or disrupt the Website or servers</li>
                <li>Scrape, harvest, or collect data without permission</li>
                <li>Transmit malware, viruses, or harmful code</li>
                <li>Impersonate any person or entity</li>
                <li>Use automated systems (bots, crawlers) without written consent</li>
                <li>Violate any applicable local, national, or international law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on the Website, including text, graphics, logos, images, data compilations, and software, is the property of United Rehabs or its licensors and is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You may view and download content for personal, non-commercial use only. You may not reproduce, distribute, modify, create derivative works, publicly display, or exploit any content without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Accuracy & Sources</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to provide accurate data from official government sources (CDC, WHO, UNODC, national health ministries). However:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Data may have reporting delays or revisions</li>
                <li>Statistics are subject to methodological limitations</li>
                <li>We do not guarantee completeness or accuracy</li>
                <li>Data should not be used as the sole basis for medical or policy decisions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Third-Party Links & Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Website may contain links to third-party websites, including treatment facilities. These links are provided for convenience only. We do not:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Endorse or recommend any specific facility</li>
                <li>Control third-party content or practices</li>
                <li>Guarantee the quality of services provided by listed facilities</li>
                <li>Accept responsibility for third-party websites</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You access third-party sites at your own risk and should review their terms and privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Disclaimers</h2>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-muted-foreground leading-relaxed uppercase text-sm">
                  THE WEBSITE AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4 uppercase text-sm">
                  WE DO NOT WARRANT THAT THE WEBSITE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Limitation of Liability</h2>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-muted-foreground leading-relaxed uppercase text-sm">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, UNITED REHABS AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING FROM YOUR USE OF THE WEBSITE.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4 uppercase text-sm">
                  IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED $100 USD OR THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS, WHICHEVER IS GREATER.
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Some jurisdictions do not allow limitations on implied warranties or liability, so the above limitations may not apply to you. In such cases, our liability shall be limited to the fullest extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless United Rehabs and its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorneys' fees) arising from:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Your use of the Website</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Any content you submit to the Website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Governing Law & Jurisdiction</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>For users in the European Union:</strong> You may also bring proceedings in your country of residence. Nothing in these Terms affects your rights as a consumer under mandatory local laws.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>For users in other jurisdictions:</strong> Local consumer protection laws may apply and cannot be waived by these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these Terms or your use of the Website shall first be attempted to be resolved through good-faith negotiation. If negotiation fails:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>For US users:</strong> Disputes shall be resolved through binding arbitration in Delaware under AAA rules</li>
                <li><strong>For EU/UK users:</strong> You may pursue claims in your local courts or use EU Online Dispute Resolution platform</li>
                <li><strong>For other jurisdictions:</strong> Local dispute resolution procedures may apply</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Modifications to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms and changing the "Last updated" date. Your continued use after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your access to the Website immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Website ceases immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">15. Severability</h2>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">16. Entire Agreement</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms, together with our Privacy Policy and any other legal notices published on the Website, constitute the entire agreement between you and United Rehabs regarding your use of the Website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">17. Contact Us</h2>
              <div className="bg-muted/30 p-6 rounded-lg">
                <p className="text-foreground font-medium mb-4">For questions about these Terms:</p>
                <p className="text-muted-foreground">Email: legal@unitedrehabs.com</p>
                <p className="text-muted-foreground">Website: unitedrehabs.com/contact</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
