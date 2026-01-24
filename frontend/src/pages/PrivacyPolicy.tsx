import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { cmsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function PrivacyPolicy() {
  const { data: pageContent, isLoading } = useQuery({
    queryKey: ["cms-page", "privacy-policy"],
    queryFn: () => cmsApi.getPage("privacy-policy"),
    staleTime: 5 * 60 * 1000,
  });

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
                    United Rehabs respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We may collect information that you voluntarily provide, including contact information when you submit inquiries, search queries, and browsing preferences.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We may also automatically collect device information, IP address, pages visited, and navigation patterns.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use collected information to provide and improve our services, respond to inquiries, analyze usage patterns, and ensure website security.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies to remember preferences, understand navigation patterns, and improve functionality. You can control cookies through your browser settings.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Sharing</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We do not sell your personal information. We may share data with service providers, when required by law, or with your consent.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Depending on your location, you may have rights to access, correct, delete, or port your personal data. Contact us to exercise these rights.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">7. HIPAA Notice</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    United Rehabs is NOT a covered entity under HIPAA. We do not collect Protected Health Information. Please do not submit sensitive medical information through our website.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about this Privacy Policy, please contact us through our website.
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
