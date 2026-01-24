import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";

export default function AccessibilityStatement() {
  return (
    <div className="min-h-screen bg-background">
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Accessibility Statement</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 16, 2026</p>
          
          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Our Commitment</h2>
              <p className="text-muted-foreground leading-relaxed">
                United Rehabs is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to ensure we provide equal access to all users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Conformance Status</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The guidelines have three levels of accessibility (A, AA, and AAA). We have chosen Level AA as our target for the United Rehabs website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Accessibility Features</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our website includes the following accessibility features:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Semantic HTML structure for screen reader compatibility</li>
                <li>Keyboard navigation support throughout the site</li>
                <li>Alternative text for images and visual content</li>
                <li>Sufficient color contrast ratios for text readability</li>
                <li>Resizable text without loss of functionality</li>
                <li>Clear and consistent navigation</li>
                <li>Descriptive link text and button labels</li>
                <li>Form labels and error messages for input fields</li>
                <li>Skip navigation links for keyboard users</li>
                <li>Responsive design for various devices and screen sizes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Assistive Technologies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our website is designed to be compatible with the following assistive technologies:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Screen readers (JAWS, NVDA, VoiceOver, TalkBack)</li>
                <li>Screen magnification software</li>
                <li>Speech recognition software</li>
                <li>Keyboard-only navigation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Known Limitations</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                While we strive for comprehensive accessibility, some content may have limitations:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Some third-party content or embedded media may not be fully accessible</li>
                <li>Older PDF documents may not be fully compatible with screen readers</li>
                <li>Interactive maps may have limited accessibility for screen reader users</li>
                <li>Some data visualizations and charts may require additional description</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We are actively working to address these limitations and improve accessibility across all content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Feedback and Contact</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We welcome your feedback on the accessibility of the United Rehabs website. If you encounter accessibility barriers or have suggestions for improvement, please contact us:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Report accessibility issues through our website contact form</li>
                <li>Describe the specific accessibility problem you encountered</li>
                <li>Include the web page address (URL) where you experienced the issue</li>
                <li>Provide information about your assistive technology, if applicable</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We aim to respond to accessibility feedback within 5 business days and to resolve issues as quickly as possible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Enforcement and Legal</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This accessibility statement is in accordance with:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Americans with Disabilities Act (ADA)</strong> - Title III requirements for public accommodations</li>
                <li><strong>Section 508 of the Rehabilitation Act</strong> - Federal accessibility standards</li>
                <li><strong>WCAG 2.1</strong> - Web Content Accessibility Guidelines by W3C</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Continuous Improvement</h2>
              <p className="text-muted-foreground leading-relaxed">
                We are committed to ongoing accessibility improvements. We regularly review our website, train our team on accessibility best practices, and work with accessibility consultants to identify and address issues. This statement will be updated as we make improvements to our website's accessibility.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
