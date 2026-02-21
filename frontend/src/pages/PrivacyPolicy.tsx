import { SEOHead } from "@/components/SEOHead";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Globe, Lock, Eye, Trash2, Download, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "January 26, 2026";
  const effectiveDate = "January 26, 2026";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead pageSlug="privacy-policy" fallbackTitle="Privacy Policy - GDPR, CCPA & Global Compliance" fallbackDescription="United Rehabs Privacy Policy. How we collect, use, and protect your data. GDPR, CCPA, LGPD compliant." keywords="privacy policy, GDPR, CCPA, data protection, united rehabs privacy" />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated} | Effective: {effectiveDate}</p>
          </div>

          {/* Quick Navigation */}
          <Card className="mb-8 bg-muted/30">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Your Privacy Rights at a Glance
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span>Access your data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-primary" />
                  <span>Delete your data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  <span>Export your data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span>Opt-out of sale</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                United Rehabs ("we," "us," or "our") operates unitedrehabs.com (the "Website"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Website, regardless of where you are located.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We are committed to complying with applicable data protection laws worldwide, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>GDPR</strong> (General Data Protection Regulation) - European Union</li>
                <li><strong>UK GDPR</strong> - United Kingdom</li>
                <li><strong>CCPA/CPRA</strong> (California Consumer Privacy Act) - California, USA</li>
                <li><strong>LGPD</strong> (Lei Geral de Proteção de Dados) - Brazil</li>
                <li><strong>PIPEDA</strong> (Personal Information Protection and Electronic Documents Act) - Canada</li>
                <li><strong>Privacy Act 1988</strong> - Australia</li>
                <li><strong>POPIA</strong> (Protection of Personal Information Act) - South Africa</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Data Controller</h2>
              <p className="text-muted-foreground leading-relaxed">
                United Rehabs is the data controller responsible for your personal data. For data protection inquiries:
              </p>
              <div className="bg-muted/30 p-4 rounded-lg mt-4">
                <p className="text-foreground font-medium">Data Protection Contact</p>
                <p className="text-muted-foreground">Email: privacy@unitedrehabs.com</p>
                <p className="text-muted-foreground">Address: United Rehabs, Data Protection Office</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">3.1 Information You Provide</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Contact Information:</strong> Name, email address, phone number when submitting inquiries</li>
                <li><strong>Search Queries:</strong> Treatment types, locations, and preferences you search for</li>
                <li><strong>Communications:</strong> Messages you send through our contact forms</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">3.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, navigation patterns</li>
                <li><strong>Location Data:</strong> Country/region based on IP address (not precise location)</li>
                <li><strong>Cookies & Tracking:</strong> See Section 7 for details</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">3.3 Special Categories of Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                <strong>We do NOT intentionally collect:</strong> Health information, medical records, treatment history, or any Protected Health Information (PHI). Please do not submit sensitive health information through our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Legal Basis for Processing (GDPR)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For users in the EEA, UK, and similar jurisdictions, we process your data based on:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Consent:</strong> For marketing communications and non-essential cookies</li>
                <li><strong>Legitimate Interests:</strong> To operate our website, prevent fraud, and improve services</li>
                <li><strong>Contractual Necessity:</strong> To respond to your inquiries</li>
                <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Connect you with treatment facilities (only with your consent)</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
                <li>Send service-related communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Sharing & Disclosure</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">6.1 We Do NOT Sell Your Personal Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                United Rehabs does not sell, rent, or trade your personal information to third parties for monetary consideration.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">6.2 Service Providers</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may share data with trusted service providers who assist in operating our website, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Hosting providers</li>
                <li>Analytics services (with anonymization where possible)</li>
                <li>Customer support tools</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">6.3 Legal Requirements</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may disclose information if required by law, court order, or governmental regulation, or to protect our rights and safety.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies & Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar technologies. You can manage preferences through our cookie banner or browser settings.
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-border rounded-lg">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Purpose</th>
                      <th className="px-4 py-2 text-left text-sm font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground text-sm">
                    <tr className="border-t border-border">
                      <td className="px-4 py-2">Essential</td>
                      <td className="px-4 py-2">Site functionality, security</td>
                      <td className="px-4 py-2">Session</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-2">Analytics</td>
                      <td className="px-4 py-2">Usage statistics (anonymized)</td>
                      <td className="px-4 py-2">Up to 2 years</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-2">Preferences</td>
                      <td className="px-4 py-2">Remember your settings</td>
                      <td className="px-4 py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">🇪🇺 GDPR Rights (EEA/UK)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Right to access</li>
                    <li>• Right to rectification</li>
                    <li>• Right to erasure ("right to be forgotten")</li>
                    <li>• Right to restrict processing</li>
                    <li>• Right to data portability</li>
                    <li>• Right to object</li>
                    <li>• Right to withdraw consent</li>
                    <li>• Right to lodge complaint with supervisory authority</li>
                  </ul>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">🇺🇸 CCPA/CPRA Rights (California)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Right to know what data is collected</li>
                    <li>• Right to delete personal information</li>
                    <li>• Right to opt-out of sale/sharing</li>
                    <li>• Right to non-discrimination</li>
                    <li>• Right to correct inaccurate information</li>
                    <li>• Right to limit use of sensitive data</li>
                  </ul>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">🇧🇷 LGPD Rights (Brazil)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Right to confirmation and access</li>
                    <li>• Right to correction</li>
                    <li>• Right to anonymization or deletion</li>
                    <li>• Right to data portability</li>
                    <li>• Right to information about sharing</li>
                    <li>• Right to revoke consent</li>
                  </ul>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">🌍 Other Jurisdictions</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Canada (PIPEDA): Access, correction</li>
                    <li>• Australia: Access, correction</li>
                    <li>• South Africa (POPIA): Access, correction, deletion</li>
                    <li>• Contact us for jurisdiction-specific rights</li>
                  </ul>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise any of these rights, contact us at <strong>privacy@unitedrehabs.com</strong>. We will respond within the timeframe required by applicable law (typically 30 days for GDPR, 45 days for CCPA).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your data may be transferred to and processed in countries outside your jurisdiction. We ensure appropriate safeguards are in place, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Adequacy decisions where applicable</li>
                <li>Binding Corporate Rules where relevant</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain personal data only as long as necessary for the purposes outlined in this policy, or as required by law. Typically:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Contact inquiries: 2 years after last contact</li>
                <li>Analytics data: 26 months (anonymized)</li>
                <li>Legal compliance records: As required by applicable law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your data, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>SSL/TLS encryption for data in transit</li>
                <li>Access controls and authentication</li>
                <li>Regular security assessments</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Website is not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected data from a minor, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. HIPAA Notice</h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong>United Rehabs is NOT a covered entity under HIPAA.</strong> We are an informational directory and do not provide medical services. We do not collect, store, or process Protected Health Information (PHI). Please do not submit sensitive medical information through our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Do Not Track</h2>
              <p className="text-muted-foreground leading-relaxed">
                We honor Do Not Track (DNT) signals. When DNT is enabled, we limit data collection to essential functions only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">15. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date. For significant changes, we may provide additional notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">16. Contact Us</h2>
              <div className="bg-muted/30 p-6 rounded-lg">
                <p className="text-foreground font-medium mb-4">For privacy-related inquiries:</p>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Mail className="h-4 w-4" />
                  <span>privacy@unitedrehabs.com</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>unitedrehabs.com/contact</span>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  For EU residents: You have the right to lodge a complaint with your local Data Protection Authority.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
