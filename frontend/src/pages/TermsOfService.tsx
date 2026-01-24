import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 4, 2026</p>
          
          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using United Rehabs ("the Website"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Website. We reserve the right to modify these terms at any time, and your continued use of the Website constitutes acceptance of any modifications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                United Rehabs provides informational resources about addiction treatment centers, rehabilitation facilities, and related services. Our Website serves as a directory and informational platform only. We do not provide medical advice, diagnosis, or treatment. We are not a healthcare provider, and our services should not be considered a substitute for professional medical advice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. No Medical Advice</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The information provided on this Website is for general informational and educational purposes only. It is not intended to be, and should not be construed as, medical advice, professional diagnosis, opinion, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition, mental health concern, or substance use disorder. Never disregard professional medical advice or delay in seeking it because of something you have read on this Website.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>HIPAA Notice:</strong> United Rehabs is NOT a "covered entity" under the Health Insurance Portability and Accountability Act (HIPAA). We do not provide healthcare services, process health insurance, or maintain medical records. We are an informational directory only. Please do not submit Protected Health Information (PHI) or sensitive medical details through our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Treatment Center Listings</h2>
              <p className="text-muted-foreground leading-relaxed">
                The treatment centers, programs, and services listed on our Website are provided for informational purposes only. United Rehabs does not endorse, recommend, or guarantee any specific treatment center, program, or service. We make no representations or warranties regarding the quality, effectiveness, licensing, accreditation, or suitability of any listed facility. Users are solely responsible for conducting their own due diligence and verification before selecting any treatment provider.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Accuracy of Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information contained on this Website. Statistics and data are sourced from publicly available government databases (including SAMHSA, CDC, and state health departments) and may be subject to reporting delays, revisions, or errors. Any reliance you place on such information is strictly at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by applicable law, United Rehabs, its owners, operators, affiliates, employees, and agents shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from: (a) your access to or use of, or inability to access or use, the Website; (b) any conduct or content of any third party on the Website; (c) any content obtained from the Website; (d) unauthorized access, use, or alteration of your transmissions or content; or (e) any decisions made or actions taken based on the information provided on this Website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to defend, indemnify, and hold harmless United Rehabs, its owners, operators, affiliates, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses arising from: (a) your use of and access to the Website; (b) your violation of any term of these Terms of Service; (c) your violation of any third-party right, including any intellectual property or privacy right; or (d) any claim that your use of the Website caused damage to a third party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Website may contain links to third-party websites or services that are not owned or controlled by United Rehabs. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Website and its original content, features, and functionality are and will remain the exclusive property of United Rehabs. The Website is protected by copyright, trademark, and other laws. Our trademarks may not be used in connection with any product or service without the prior written consent of United Rehabs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Website after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through our website.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
