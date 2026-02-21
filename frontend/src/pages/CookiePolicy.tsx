import { SEOHead } from "@/components/SEOHead";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cookie, Settings, Shield, BarChart3, Globe } from "lucide-react";

export default function CookiePolicy() {
  const lastUpdated = "January 26, 2026";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead pageSlug="cookie-policy" fallbackTitle="Cookie Policy" fallbackDescription="United Rehabs Cookie Policy. Learn about the cookies we use and how to manage your preferences." keywords="cookie policy, cookies, tracking, united rehabs cookies" />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          {/* Cookie Management */}
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-foreground mb-2">Manage Your Cookie Preferences</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    You can control which cookies we use. Essential cookies are required for the website to function and cannot be disabled.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => {
                    // Trigger cookie consent dialog
                    const event = new CustomEvent('openCookieSettings');
                    window.dispatchEvent(event);
                  }}>
                    <Settings className="h-4 w-4 mr-2" />
                    Cookie Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Similar technologies include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Local Storage:</strong> Stores data in your browser without expiration</li>
                <li><strong>Session Storage:</strong> Stores data for one session only</li>
                <li><strong>Pixels/Web Beacons:</strong> Small images that track page views</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Types of Cookies We Use
              </h2>
              
              <div className="space-y-4 mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground mb-2">Essential Cookies (Required)</h3>
                        <p className="text-sm text-muted-foreground">
                          These cookies are necessary for the website to function and cannot be disabled. They enable core functionality such as security, network management, and accessibility.
                        </p>
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">Always Active</span>
                    </div>
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-4">Cookie</th>
                            <th className="text-left py-2 pr-4">Purpose</th>
                            <th className="text-left py-2">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">session_id</td>
                            <td className="py-2 pr-4">Maintains user session</td>
                            <td className="py-2">Session</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">csrf_token</td>
                            <td className="py-2 pr-4">Security protection</td>
                            <td className="py-2">Session</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">cookie_consent</td>
                            <td className="py-2 pr-4">Stores your cookie preferences</td>
                            <td className="py-2">1 year</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Analytics Cookies (Optional)
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                        </p>
                      </div>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Optional</span>
                    </div>
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-4">Cookie</th>
                            <th className="text-left py-2 pr-4">Purpose</th>
                            <th className="text-left py-2">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">_ga</td>
                            <td className="py-2 pr-4">Google Analytics - distinguishes users</td>
                            <td className="py-2">2 years</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">_gid</td>
                            <td className="py-2 pr-4">Google Analytics - distinguishes users</td>
                            <td className="py-2">24 hours</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">_gat</td>
                            <td className="py-2 pr-4">Google Analytics - throttle request rate</td>
                            <td className="py-2">1 minute</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground mb-2">Preference Cookies (Optional)</h3>
                        <p className="text-sm text-muted-foreground">
                          These cookies remember your preferences and choices (such as language, region, or display settings) to provide a more personalized experience.
                        </p>
                      </div>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Optional</span>
                    </div>
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-4">Cookie</th>
                            <th className="text-left py-2 pr-4">Purpose</th>
                            <th className="text-left py-2">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">language</td>
                            <td className="py-2 pr-4">Stores language preference</td>
                            <td className="py-2">1 year</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">region</td>
                            <td className="py-2 pr-4">Stores region preference</td>
                            <td className="py-2">1 year</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4 font-mono text-xs">theme</td>
                            <td className="py-2 pr-4">Dark/light mode preference</td>
                            <td className="py-2">1 year</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                Legal Basis (GDPR)
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                For users in the EEA/UK, we process cookie data based on:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Consent:</strong> For analytics and preference cookies - you choose whether to accept these</li>
                <li><strong>Legitimate Interest:</strong> For essential cookies required for website functionality and security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">How to Control Cookies</h2>
              
              <h3 className="text-lg font-medium text-foreground mb-3">1. Our Cookie Banner</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you first visit our website, you'll see a cookie banner that allows you to accept or customize your cookie preferences.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-3 mt-6">2. Browser Settings</h3>
              <p className="text-muted-foreground leading-relaxed">
                You can control cookies through your browser settings:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Edge</a></li>
              </ul>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg mt-4">
                <p className="text-muted-foreground text-sm">
                  <strong>Note:</strong> Blocking all cookies may affect website functionality. Some features may not work properly without essential cookies.
                </p>
              </div>

              <h3 className="text-lg font-medium text-foreground mb-3 mt-6">3. Global Privacy Control (GPC)</h3>
              <p className="text-muted-foreground leading-relaxed">
                We honor Global Privacy Control signals. If your browser sends a GPC signal, we will treat this as a request to opt out of non-essential cookies.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-3 mt-6">4. Do Not Track (DNT)</h3>
              <p className="text-muted-foreground leading-relaxed">
                We respect Do Not Track browser settings and limit data collection accordingly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some cookies are placed by third parties on our behalf. These include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Google Analytics:</strong> Website usage analysis - <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a></li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We do not control third-party cookies. Please refer to their privacy policies for more information about their data practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">International Compliance</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our cookie practices comply with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>EU ePrivacy Directive</strong> (Cookie Law)</li>
                <li><strong>GDPR</strong> - General Data Protection Regulation</li>
                <li><strong>UK PECR</strong> - Privacy and Electronic Communications Regulations</li>
                <li><strong>CCPA</strong> - California Consumer Privacy Act</li>
                <li><strong>LGPD</strong> - Brazil's General Data Protection Law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Updates to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time. We will notify you of significant changes through our website or by other means. The "Last updated" date at the top of this page indicates when it was last revised.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <div className="bg-muted/30 p-6 rounded-lg">
                <p className="text-foreground font-medium mb-4">Questions about cookies?</p>
                <p className="text-muted-foreground">Email: privacy@unitedrehabs.com</p>
                <p className="text-muted-foreground">Subject: Cookie Policy Inquiry</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
