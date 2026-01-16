import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { Shield, CheckCircle } from "lucide-react";

export default function DoNotSell() {
  return (
    <div className="min-h-screen bg-background">
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Do Not Sell or Share My Personal Information</h1>
          <p className="text-muted-foreground mb-8">California Consumer Privacy Act (CCPA) Disclosure</p>
          
          <div className="prose prose-slate max-w-none space-y-8">
            {/* Good News Banner */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 flex items-start gap-4">
              <CheckCircle className="h-8 w-8 text-green-600 shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2 mt-0">We Do Not Sell Your Personal Information</h2>
                <p className="text-muted-foreground mb-0">
                  United Rehabs does not sell, rent, or share your personal information with third parties for 
                  their direct marketing purposes. We have never sold user data and have no plans to do so.
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights Under CCPA</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The California Consumer Privacy Act (CCPA) gives California residents specific rights regarding their personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Right to Know:</strong> You can request what personal information we collect, use, disclose, and sell</li>
                <li><strong>Right to Delete:</strong> You can request deletion of your personal information</li>
                <li><strong>Right to Opt-Out:</strong> You can opt-out of the sale of your personal information</li>
                <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">What Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may collect the following categories of personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Identifiers:</strong> Name, email address (only if you contact us)</li>
                <li><strong>Internet Activity:</strong> Browsing history, search queries, interaction with our website</li>
                <li><strong>Geolocation:</strong> Approximate location based on IP address</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect for the following business purposes only:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>To provide and maintain our website and services</li>
                <li>To respond to your inquiries and communications</li>
                <li>To analyze and improve our website performance</li>
                <li>To detect and prevent security threats</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Sharing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may share your information with the following categories of service providers for business purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Analytics Providers:</strong> To help us understand website usage</li>
                <li><strong>Hosting Providers:</strong> To store and serve our website</li>
                <li><strong>Security Services:</strong> To protect against fraud and abuse</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                These service providers are contractually obligated to use your information only for the purposes we specify 
                and are prohibited from selling your personal information.
              </p>
            </section>

            <section>
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4 mt-0">Exercising Your Rights</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    To exercise any of your CCPA rights, you may:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Submit a request through our <a href="/contact" className="text-primary hover:underline">Contact page</a></li>
                    <li>Include "CCPA Request" in your subject line</li>
                    <li>Specify which right(s) you wish to exercise</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    We will respond to verifiable consumer requests within 45 days. If we need more time (up to 90 days total), 
                    we will inform you of the reason and extension period in writing.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Verification Process</h2>
              <p className="text-muted-foreground leading-relaxed">
                To protect your privacy, we must verify your identity before fulfilling your request. We may ask you to 
                provide information that matches what we have on file. If we cannot verify your identity, we may deny your request.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Authorized Agents</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may designate an authorized agent to make a request on your behalf. Authorized agents must submit 
                proof of authorization (such as a power of attorney or signed permission) along with the request.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Updates to This Notice</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this notice from time to time. The most current version will always be available on this page. 
                We encourage you to review this notice periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this notice or your CCPA rights, please contact us through our{" "}
                <a href="/contact" className="text-primary hover:underline">Contact page</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
