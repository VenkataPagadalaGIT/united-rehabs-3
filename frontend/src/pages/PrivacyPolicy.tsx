import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { cmsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function PrivacyPolicy() {
  // Fetch content from CMS
  const { data: pageContent, isLoading } = useQuery({
    queryKey: ["cms-page", "privacy-policy"],
    queryFn: () => cmsApi.getPage("privacy-policy"),
    staleTime: 5 * 60 * 1000,
  });

  // Check if we have CMS content
  const hasCMSContent = pageContent?.content && pageContent.content.length > 100;

  return (
    <div className="min-h-screen bg-background">
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-96 w-full" />
            </div>
          ) : hasCMSContent ? (
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {pageContent?.title || "Privacy Policy"}
              </h1>
              <p className="text-muted-foreground mb-8">Last updated: January 24, 2026</p>
              <div 
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: pageContent?.content || "" }}
              />
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
              <p className="text-muted-foreground mb-8">Last updated: January 24, 2026</p>
          
          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                United Rehabs ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the Website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">2.1 Information You Provide</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may collect information that you voluntarily provide when using our Website, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Contact information (name, email address, phone number) when you submit inquiries</li>
                <li>Search queries and filter preferences when browsing treatment centers</li>
                <li>Any other information you choose to provide through forms or communications</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">2.2 Automatically Collected Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you visit our Website, we may automatically collect certain information, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Device information (browser type, operating system, device type)</li>
                <li>IP address and approximate geographic location</li>
                <li>Pages visited, time spent on pages, and navigation patterns</li>
                <li>Referring website or source</li>
                <li>Date and time of your visit</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>To provide, maintain, and improve our Website and services</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To analyze usage patterns and optimize user experience</li>
                <li>To detect, prevent, and address technical issues or security threats</li>
                <li>To comply with legal obligations and enforce our terms</li>
                <li>To send periodic communications (with your consent where required)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar tracking technologies to collect and store information about your interactions with our Website. These technologies help us:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Remember your preferences and settings</li>
                <li>Understand how you navigate our Website</li>
                <li>Analyze traffic and usage patterns</li>
                <li>Deliver relevant content and improve functionality</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our Website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Service Providers:</strong> With trusted third-party vendors who assist us in operating our Website and providing services</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority</li>
                <li><strong>Protection of Rights:</strong> To protect our rights, privacy, safety, or property, or that of others</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, comply with our legal obligations, resolve disputes, and enforce our agreements. When data is no longer needed, we will securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Your Rights and Choices</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Opt-Out:</strong> Opt out of receiving marketing communications</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Website is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we discover that we have collected personal information from a child, we will take steps to delete that information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Website may contain links to third-party websites and services. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. California Privacy Rights (CCPA)</h2>
              <p className="text-muted-foreground leading-relaxed">
                California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, request deletion, and opt out of the sale of personal information. We do not sell personal information. To exercise your rights, please contact us using the information below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. European Union Privacy Rights (GDPR)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have certain rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li><strong>Right to Access:</strong> Request a copy of your personal data we hold</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate personal data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Right to Restrict Processing:</strong> Request limitation on how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Legal Basis for Processing:</strong> We process personal data on the following legal bases:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li><strong>Consent:</strong> Where you have given explicit consent for specific purposes</li>
                <li><strong>Legitimate Interests:</strong> For website analytics, security, and service improvement</li>
                <li><strong>Legal Obligation:</strong> When required to comply with applicable laws</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                <strong>International Data Transfers:</strong> Your data may be transferred to and processed in the United States. We ensure appropriate safeguards are in place for such transfers. To exercise your GDPR rights, please contact us. You also have the right to lodge a complaint with your local data protection authority.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. HIPAA Notice</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Important:</strong> United Rehabs is NOT a "covered entity" under the Health Insurance Portability and Accountability Act (HIPAA). We are an informational directory website and do not provide healthcare services, process health insurance claims, or maintain medical records.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not collect, store, or transmit Protected Health Information (PHI) as defined by HIPAA. Any information you voluntarily provide through our website (such as contact inquiries) is not subject to HIPAA protections.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Warning:</strong> Please do not submit sensitive medical information, diagnoses, treatment history, or other health-related personal details through our website forms. If you need to share such information, please do so directly with a licensed healthcare provider or treatment facility.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes are effective immediately upon posting.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">15. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us through our website.
              </p>
            </section>
          </div>
        </>
          )}
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
