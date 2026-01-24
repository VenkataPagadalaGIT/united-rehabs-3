import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { SEOHead } from "@/components/SEOHead";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scale, AlertTriangle, Globe, Shield, FileText, Heart } from "lucide-react";

export default function LegalDisclaimer() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        pageSlug="legal-disclaimer"
        fallbackTitle="Legal Disclaimer & Data Accuracy Notice | United Rehabs"
        fallbackDescription="Important legal information about data accuracy, liability limitations, and terms of use for United Rehabs addiction statistics and treatment center directory."
      />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">Legal Disclaimer</h1>
              <p className="text-muted-foreground">Data Accuracy & Liability Notice</p>
            </div>
          </div>
          <p className="text-muted-foreground mb-8">Last updated: January 17, 2026</p>
          
          {/* Important Notice Banner */}
          <Alert className="border-destructive/50 bg-destructive/10 mb-8">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDescription className="text-destructive font-medium">
              PLEASE READ THIS ENTIRE DISCLAIMER CAREFULLY BEFORE USING THIS WEBSITE. BY ACCESSING OR USING THIS WEBSITE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE, PLEASE DISCONTINUE USE IMMEDIATELY.
            </AlertDescription>
          </Alert>
          
          <div className="prose prose-slate max-w-none space-y-8">
            
            {/* Section 1: Purpose */}
            <section className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground m-0">1. Purpose of This Website</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                United Rehabs ("Website," "we," "us," or "our") is an informational directory and resource platform providing data about addiction statistics, substance abuse trends, and treatment center listings. This Website is designed solely for <strong>general informational and educational purposes</strong>.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We are <strong>NOT</strong> a healthcare provider, medical facility, or licensed treatment center. We do not provide medical advice, diagnosis, treatment recommendations, or professional counseling services of any kind.
              </p>
            </section>

            {/* Section 2: No Medical Advice */}
            <section className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-red-500" />
                <h2 className="text-2xl font-semibold text-foreground m-0">2. No Medical or Professional Advice</h2>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="text-red-700 dark:text-red-400 font-medium text-sm m-0">
                  ⚠️ CRITICAL WARNING: The content on this Website is NOT intended to be a substitute for professional medical advice, diagnosis, or treatment. NEVER disregard professional medical advice or delay seeking treatment because of something you have read on this Website.
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you or someone you know is experiencing a medical emergency, substance overdose, or mental health crisis, <strong>call emergency services (911 in the US) immediately</strong> or contact the:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li><strong>SAMHSA National Helpline:</strong> 1-800-662-4357 (24/7, free, confidential)</li>
                <li><strong>National Suicide Prevention Lifeline:</strong> 988</li>
                <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Always seek the advice of a physician, psychiatrist, licensed addiction counselor, or other qualified healthcare provider with any questions regarding a medical condition, substance use disorder, or treatment options.
              </p>
            </section>

            {/* Section 3: Data Accuracy */}
            <section className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <h2 className="text-2xl font-semibold text-foreground m-0">3. Data Accuracy & Limitations</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The statistics, figures, and data presented on this Website are compiled from publicly available sources including, but not limited to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                <li>U.S. Centers for Disease Control and Prevention (CDC) and CDC WONDER database</li>
                <li>Substance Abuse and Mental Health Services Administration (SAMHSA)</li>
                <li>National Institute on Drug Abuse (NIDA)</li>
                <li>State health departments and vital statistics offices</li>
                <li>World Health Organization (WHO)</li>
                <li>United Nations Office on Drugs and Crime (UNODC)</li>
              </ul>
              
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">NO WARRANTY OF ACCURACY</h4>
                <p className="text-amber-700 dark:text-amber-400 text-sm m-0">
                  While we endeavor to provide accurate and up-to-date information, we make <strong>NO REPRESENTATIONS, WARRANTIES, OR GUARANTEES</strong> of any kind, express or implied, regarding the completeness, accuracy, reliability, suitability, timeliness, or availability of any data, statistics, or other information on this Website.
                </p>
              </div>
              
              <h3 className="text-lg font-medium text-foreground mb-3">Known Data Limitations:</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Provisional Data:</strong> Recent year statistics (especially 2024 and beyond) are often provisional and subject to significant revision once final reports are published.</li>
                <li><strong>Reporting Delays:</strong> Official statistics typically have 12-24 month reporting delays from source agencies.</li>
                <li><strong>Underreporting:</strong> Addiction and overdose statistics are inherently subject to underreporting due to stigma, misclassification, and incomplete toxicology testing.</li>
                <li><strong>Methodological Variations:</strong> Different sources may use different definitions, collection methods, and time periods, leading to apparent discrepancies.</li>
                <li><strong>Estimates & Projections:</strong> Some figures (such as "total affected" populations) are estimates based on survey data and statistical models, not direct counts.</li>
                <li><strong>Historical Revisions:</strong> Historical data may be revised by source agencies without notice.</li>
                <li><strong>AI-Assisted Compilation:</strong> Some data may be compiled or cross-referenced using AI-assisted tools, which may introduce errors.</li>
              </ul>
            </section>

            {/* Section 4: International Users */}
            <section className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-semibold text-foreground m-0">4. International Users & Jurisdictional Notice</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This Website is operated from and primarily intended for users in the United States of America. The statistics, treatment information, and resources presented primarily reflect conditions, laws, and healthcare systems within the United States.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">NOTICE TO INTERNATIONAL USERS</h4>
                <p className="text-blue-700 dark:text-blue-400 text-sm m-0">
                  If you access this Website from outside the United States, you do so at your own risk. Laws, regulations, treatment protocols, substance classifications, statistical methodologies, and healthcare systems vary <strong>significantly</strong> by country and jurisdiction. Data presented may not be applicable, comparable, or relevant to your location.
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                International users should consult local health authorities, government agencies, and qualified healthcare providers in their own jurisdictions for applicable information. We make no representation that information on this Website is appropriate, accurate, or legally compliant in any jurisdiction outside the United States.
              </p>
            </section>

            {/* Section 5: Treatment Center Listings */}
            <section className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Treatment Center Listings</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The treatment centers, rehabilitation facilities, programs, and services listed or referenced on this Website are provided for <strong>informational purposes only</strong>.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Listings do <strong>NOT</strong> constitute endorsement, recommendation, referral, or guarantee of any kind.</li>
                <li>We do <strong>NOT</strong> verify, audit, or guarantee the licensing, accreditation, quality, effectiveness, safety, or legitimacy of any listed facility.</li>
                <li>Treatment outcomes vary widely and depend on individual circumstances.</li>
                <li>Facility information (including contact details, services offered, and insurance accepted) may be outdated or inaccurate.</li>
                <li>Some listings may include paid advertisements or affiliate relationships.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Users are solely responsible</strong> for conducting their own independent research, verification, and due diligence before selecting or engaging with any treatment provider. We strongly recommend verifying licensing, accreditation, and reviews through independent sources.
              </p>
            </section>

            {/* Section 6: Limitation of Liability */}
            <section className="bg-card border border-destructive/30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-destructive" />
                <h2 className="text-2xl font-semibold text-foreground m-0">6. Limitation of Liability</h2>
              </div>
              <div className="bg-destructive/10 rounded-lg p-4 mb-4">
                <p className="text-destructive font-medium text-sm m-0 uppercase">
                  IMPORTANT: READ THIS SECTION CAREFULLY
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW IN ANY JURISDICTION WORLDWIDE:
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                United Rehabs, its owners, operators, affiliates, officers, directors, employees, agents, licensors, data providers, partners, and contributors (collectively, "Released Parties") shall <strong>NOT</strong> be liable for any:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Direct, indirect, incidental, special, consequential, exemplary, or punitive damages</li>
                <li>Loss of profits, revenue, data, goodwill, or other intangible losses</li>
                <li>Personal injury, wrongful death, or emotional distress</li>
                <li>Costs of substitute goods or services</li>
                <li>Any damages whatsoever</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-4">
                ARISING FROM OR RELATED TO:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Your access to, use of, or inability to use this Website</li>
                <li>Any information, data, statistics, or content obtained from this Website</li>
                <li>Any decisions made or actions taken based on information on this Website</li>
                <li>Any treatment, services, or care received (or not received) from any listed or referenced provider</li>
                <li>Errors, omissions, inaccuracies, or outdated information</li>
                <li>Unauthorized access to or alteration of your data</li>
                <li>Any third-party content, websites, or services</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This limitation applies <strong>regardless of the legal theory</strong> upon which damages are claimed, including but not limited to contract, tort (including negligence), strict liability, warranty, or any other theory, and <strong>whether or not</strong> the Released Parties have been advised of the possibility of such damages.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, our liability is limited to the maximum extent permitted by law. If any portion of this limitation is found to be invalid, the remaining portions shall remain in full force and effect.
              </p>
            </section>

            {/* Section 7: Indemnification */}
            <section className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to defend, indemnify, and hold harmless the Released Parties from and against any and all claims, damages, obligations, losses, liabilities, costs, debts, and expenses (including reasonable attorneys' fees) arising from or related to: (a) your use of this Website; (b) your violation of this Disclaimer, our Terms of Service, or any applicable law; (c) your violation of any third-party rights; or (d) any claim that your use of this Website caused damage to any party.
              </p>
            </section>

            {/* Section 8: Third-Party Content */}
            <section className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Third-Party Content & Links</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This Website may contain links to external websites, resources, or services operated by third parties. We do not control and are not responsible for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>The accuracy, reliability, or availability of third-party content</li>
                <li>The privacy practices or terms of third-party websites</li>
                <li>Any products, services, or information obtained from third parties</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Links to external sites do not constitute endorsement. You access third-party websites entirely at your own risk.
              </p>
            </section>

            {/* Section 9: HIPAA Notice */}
            <section className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. HIPAA & Health Information Notice</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                United Rehabs is <strong>NOT</strong> a "covered entity" under the U.S. Health Insurance Portability and Accountability Act (HIPAA). We do not provide healthcare services, process health insurance claims, or maintain medical records.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-700 dark:text-amber-400 text-sm m-0">
                  <strong>WARNING:</strong> Do NOT submit Protected Health Information (PHI), medical records, diagnoses, treatment history, or other sensitive health information through this Website. Any information you voluntarily provide is NOT protected by HIPAA and may not be secure.
                </p>
              </div>
            </section>

            {/* Section 10: Governing Law */}
            <section className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Governing Law & Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This Disclaimer and any disputes arising from your use of this Website shall be governed by and construed in accordance with the laws of the United States of America, without regard to conflict of law principles.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Any legal action or proceeding relating to this Website shall be instituted exclusively in the federal or state courts located in the United States. You consent to the jurisdiction of such courts and waive any objection to venue.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Notwithstanding the foregoing, this Disclaimer shall be interpreted in accordance with legal principles that favor the limitation of liability to the fullest extent permitted by law in any applicable jurisdiction worldwide.
              </p>
            </section>

            {/* Section 11: Severability */}
            <section className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Severability</h2>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of this Disclaimer is found to be unenforceable or invalid by a court of competent jurisdiction, that provision shall be modified to the minimum extent necessary to make it enforceable, or if modification is not possible, severed from this Disclaimer. All other provisions shall remain in full force and effect.
              </p>
            </section>

            {/* Section 12: Entire Agreement */}
            <section className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Entire Agreement & Modifications</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This Disclaimer, together with our Terms of Service and Privacy Policy, constitutes the entire agreement between you and United Rehabs regarding your use of this Website.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify this Disclaimer at any time without prior notice. Changes become effective immediately upon posting. Your continued use of this Website after any modifications constitutes acceptance of the updated Disclaimer.
              </p>
            </section>

            {/* Section 13: Acknowledgment */}
            <section className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Your Acknowledgment</h2>
              <p className="text-foreground leading-relaxed mb-4">
                BY ACCESSING, BROWSING, OR USING THIS WEBSITE, YOU ACKNOWLEDGE AND AGREE THAT:
              </p>
              <ul className="list-disc list-inside text-foreground space-y-2">
                <li>You have read and understood this entire Legal Disclaimer</li>
                <li>You accept and agree to be bound by all terms herein</li>
                <li>You assume all risks associated with using this Website</li>
                <li>You waive any claims against the Released Parties to the maximum extent permitted by law</li>
                <li>You are at least 18 years of age or accessing with parental/guardian consent</li>
              </ul>
            </section>

            {/* Contact Section */}
            <section className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Legal Disclaimer, please contact us through our website's contact page. For medical emergencies, please contact emergency services or the SAMHSA National Helpline at 1-800-662-4357.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
