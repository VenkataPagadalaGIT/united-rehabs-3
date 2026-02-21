import { SEOHead } from "@/components/SEOHead";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accessibility, Eye, Ear, MousePointer, Keyboard, MessageSquare, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function AccessibilityStatement() {
  const lastUpdated = "January 26, 2026";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead pageSlug="accessibility" fallbackTitle="Accessibility Statement" fallbackDescription="United Rehabs accessibility commitment. WCAG 2.1 AA compliance, assistive technology support, and accessibility features." keywords="accessibility, WCAG, screen reader support, united rehabs accessibility" />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Accessibility Statement</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          {/* Commitment Card */}
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Accessibility className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-foreground mb-2">Our Commitment to Accessibility</h2>
                  <p className="text-sm text-muted-foreground">
                    United Rehabs is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Accessibility Standards</h2>
              <p className="text-muted-foreground leading-relaxed">
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines explain how to make web content more accessible for people with disabilities.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We also strive to comply with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Americans with Disabilities Act (ADA)</strong> - United States</li>
                <li><strong>Section 508</strong> of the Rehabilitation Act - United States</li>
                <li><strong>Equality Act 2010</strong> - United Kingdom</li>
                <li><strong>European Accessibility Act</strong> - European Union</li>
                <li><strong>Accessible Canada Act</strong> - Canada</li>
                <li><strong>Disability Discrimination Act</strong> - Australia</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Accessibility Features</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Visual</h3>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• High contrast color schemes</li>
                      <li>• Resizable text (up to 200%)</li>
                      <li>• Alt text for images</li>
                      <li>• Clear visual hierarchy</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Keyboard className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Keyboard Navigation</h3>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Full keyboard accessibility</li>
                      <li>• Visible focus indicators</li>
                      <li>• Skip navigation links</li>
                      <li>• Logical tab order</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Ear className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Screen Readers</h3>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• ARIA labels and landmarks</li>
                      <li>• Semantic HTML structure</li>
                      <li>• Descriptive link text</li>
                      <li>• Form labels and instructions</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MousePointer className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Motor/Mobility</h3>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Large clickable areas</li>
                      <li>• No time-based interactions</li>
                      <li>• Consistent navigation</li>
                      <li>• Error prevention and recovery</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Conformance Status</h2>
              <p className="text-muted-foreground leading-relaxed">
                We have assessed our website against WCAG 2.1 Level AA criteria. Our current conformance status:
              </p>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-muted-foreground">Perceivable: Text alternatives, time-based media, adaptable content</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-muted-foreground">Operable: Keyboard accessible, navigable, input modalities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-muted-foreground">Understandable: Readable, predictable, input assistance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-muted-foreground">Robust: Compatible with assistive technologies</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Browser & Assistive Technology Compatibility</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website is designed to be compatible with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Modern web browsers (Chrome, Firefox, Safari, Edge)</li>
                <li>Screen readers (JAWS, NVDA, VoiceOver, TalkBack)</li>
                <li>Voice recognition software</li>
                <li>Screen magnification software</li>
                <li>Mobile accessibility features (iOS, Android)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Known Limitations</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we strive for full accessibility, some limitations may exist:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Third-party content and embedded media may not be fully accessible</li>
                <li>Older PDF documents may lack accessibility features</li>
                <li>Some interactive charts may have limited screen reader support</li>
                <li>User-generated content may not meet accessibility standards</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We are actively working to address these limitations and improve accessibility across all content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Alternative Formats</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you need information in an alternative format, we can provide:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Large print versions</li>
                <li>Audio descriptions</li>
                <li>Plain text versions</li>
                <li>Other formats upon request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Feedback & Contact
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We welcome your feedback on the accessibility of United Rehabs. If you encounter any barriers or have suggestions for improvement:
              </p>
              
              <div className="bg-muted/30 p-6 rounded-lg mt-4">
                <p className="text-foreground font-medium mb-4">Report Accessibility Issues</p>
                <p className="text-muted-foreground mb-2">Email: accessibility@unitedrehabs.com</p>
                <p className="text-muted-foreground mb-4">Response time: We aim to respond within 5 business days</p>
                
                <p className="text-sm text-muted-foreground">
                  Please include:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-6 mt-2 space-y-1">
                  <li>Description of the accessibility issue</li>
                  <li>Page URL where you encountered the issue</li>
                  <li>Assistive technology used (if applicable)</li>
                  <li>Your preferred contact method</li>
                </ul>
              </div>

              <div className="mt-6">
                <Link to="/contact">
                  <Button>
                    Contact Us About Accessibility
                  </Button>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Enforcement & Complaints</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are not satisfied with our response to your accessibility concern, you may contact:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>US:</strong> Office for Civil Rights, Department of Justice</li>
                <li><strong>UK:</strong> Equality and Human Rights Commission</li>
                <li><strong>EU:</strong> Your national enforcement body</li>
                <li><strong>Canada:</strong> Canadian Human Rights Commission</li>
                <li><strong>Australia:</strong> Australian Human Rights Commission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Continuous Improvement</h2>
              <p className="text-muted-foreground leading-relaxed">
                We are committed to ongoing accessibility improvements:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Regular accessibility audits</li>
                <li>Staff training on accessibility best practices</li>
                <li>User testing with people with disabilities</li>
                <li>Integration of accessibility into our development process</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Additional Resources</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">W3C Web Accessibility Initiative (WAI)</a></li>
                <li><a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WCAG 2.1 Guidelines</a></li>
                <li><a href="https://www.ada.gov/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ADA.gov</a></li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
