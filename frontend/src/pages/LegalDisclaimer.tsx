import { SEOHead } from "@/components/SEOHead";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, FileWarning, Scale, Stethoscope, Building2, BarChart3 } from "lucide-react";

export default function LegalDisclaimer() {
  const lastUpdated = "January 26, 2026";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead pageSlug="legal-disclaimer" fallbackTitle="Legal Disclaimer" fallbackDescription="Legal disclaimer for United Rehabs. Important information about our data, medical disclaimers, and liability limitations." keywords="legal disclaimer, medical disclaimer, data disclaimer, united rehabs" />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Legal Disclaimer</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          {/* Critical Notice */}
          <Card className="mb-8 border-red-500/50 bg-red-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-foreground mb-2">Important: Please Read Carefully</h2>
                  <p className="text-sm text-muted-foreground">
                    The information provided on United Rehabs is for general informational purposes only. This website does not provide medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare professionals for any medical conditions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-primary" />
                Medical Disclaimer
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong>United Rehabs is NOT a healthcare provider, medical facility, or licensed treatment center.</strong>
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                The content on this website, including statistics, facility information, and educational materials, is provided for general informational purposes only. It is not intended to be and should not be construed as:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Medical advice or diagnosis</li>
                <li>Treatment recommendations</li>
                <li>A substitute for professional medical consultation</li>
                <li>Emergency medical guidance</li>
              </ul>
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg mt-4">
                <p className="text-foreground font-medium">🚨 Emergency Situations</p>
                <p className="text-muted-foreground text-sm mt-2">
                  If you or someone you know is experiencing a medical emergency, overdose, or mental health crisis, call emergency services immediately (911 in the US, 999 in the UK, 112 in the EU, or your local emergency number).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Facility Information Disclaimer
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Treatment facilities listed on this website are for informational purposes only. We do NOT:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Endorse or recommend</strong> any specific treatment facility</li>
                <li><strong>Verify or guarantee</strong> the quality of care provided</li>
                <li><strong>Guarantee the accuracy</strong> of facility information</li>
                <li><strong>Accept responsibility</strong> for treatment outcomes</li>
                <li><strong>Verify licensing status</strong> in real-time</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Users are solely responsible for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Verifying facility credentials, licenses, and accreditation</li>
                <li>Confirming insurance coverage and costs</li>
                <li>Conducting their own due diligence before selecting a facility</li>
                <li>Making informed decisions with professional guidance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Data & Statistics Disclaimer
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Statistics and data presented on this website are compiled from various official sources including government health agencies, international organizations (WHO, UNODC), and academic research. However:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Data may be provisional</strong> and subject to revision</li>
                <li><strong>Reporting methodologies vary</strong> between countries and time periods</li>
                <li><strong>Time lags exist</strong> between data collection and publication</li>
                <li><strong>Estimates may be used</strong> when official data is unavailable</li>
                <li><strong>Completeness varies</strong> by country and reporting system</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Data should be used for general understanding only and NOT as the basis for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Medical or treatment decisions</li>
                <li>Policy decisions without additional verification</li>
                <li>Academic research without citing original sources</li>
                <li>Legal proceedings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileWarning className="h-6 w-6 text-primary" />
                HIPAA Notice
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong>United Rehabs is NOT a covered entity under the Health Insurance Portability and Accountability Act (HIPAA).</strong>
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We do not collect, store, or process Protected Health Information (PHI). Information submitted through our website is NOT protected by HIPAA regulations.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg mt-4">
                <p className="text-foreground font-medium">⚠️ Do Not Submit Sensitive Information</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Please do not submit medical records, diagnosis information, treatment history, or other sensitive health information through our website forms or communications.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">External Links Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website contains links to external websites operated by third parties. These links are provided for convenience and informational purposes only.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>We do not control third-party websites or their content</li>
                <li>Links do not imply endorsement or affiliation</li>
                <li>We are not responsible for third-party privacy practices</li>
                <li>Users access external sites at their own risk</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">No Professional Relationship</h2>
              <p className="text-muted-foreground leading-relaxed">
                Use of this website does not create any professional relationship, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Doctor-patient relationship</li>
                <li>Therapist-client relationship</li>
                <li>Attorney-client relationship</li>
                <li>Fiduciary relationship</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Scale className="h-6 w-6 text-primary" />
                Limitation of Liability
              </h2>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-muted-foreground leading-relaxed uppercase text-sm">
                  TO THE FULLEST EXTENT PERMITTED BY LAW, UNITED REHABS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES ARISING FROM:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-4 text-sm uppercase">
                  <li>USE OF OR RELIANCE ON INFORMATION PROVIDED ON THIS WEBSITE</li>
                  <li>DECISIONS MADE BASED ON WEBSITE CONTENT</li>
                  <li>TREATMENT OUTCOMES AT ANY FACILITY</li>
                  <li>ERRORS OR OMISSIONS IN DATA OR CONTENT</li>
                  <li>SERVICE INTERRUPTIONS OR TECHNICAL ISSUES</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Jurisdictional Variations</h2>
              <p className="text-muted-foreground leading-relaxed">
                This disclaimer applies globally. However, certain provisions may not apply or may be limited in jurisdictions where they are prohibited by law. In such cases:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>The disclaimer shall be interpreted to provide maximum protection permitted</li>
                <li>Local consumer protection laws remain applicable</li>
                <li>Statutory rights cannot be waived</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify this disclaimer at any time. Changes will be posted on this page with an updated revision date. Continued use of the website after changes constitutes acceptance of the modified disclaimer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact</h2>
              <div className="bg-muted/30 p-6 rounded-lg">
                <p className="text-foreground font-medium mb-4">Questions about this disclaimer?</p>
                <p className="text-muted-foreground">Email: legal@unitedrehabs.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
