import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { Shield, Users, Heart, Target, Award, BookOpen } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">About United Rehabs</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Connecting individuals and families with trusted addiction treatment resources across the United States.
          </p>
          
          <div className="prose prose-slate max-w-none space-y-12">
            {/* Mission Section */}
            <section className="bg-primary/5 rounded-xl p-8 border border-primary/20">
              <div className="flex items-start gap-4">
                <Target className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4 mt-0">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed mb-0">
                    Our mission is to provide accessible, accurate, and comprehensive information about addiction treatment options 
                    to help individuals and their loved ones make informed decisions on the path to recovery. We believe that 
                    everyone deserves access to quality resources when seeking help for substance use disorders.
                  </p>
                </div>
              </div>
            </section>

            {/* What We Do */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6">What We Do</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg p-6 border">
                  <BookOpen className="h-6 w-6 text-primary mb-3" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Treatment Directory</h3>
                  <p className="text-muted-foreground text-sm">
                    We maintain a comprehensive directory of addiction treatment centers, rehabilitation facilities, 
                    and recovery programs across the United States.
                  </p>
                </div>
                <div className="bg-card rounded-lg p-6 border">
                  <Award className="h-6 w-6 text-primary mb-3" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Educational Resources</h3>
                  <p className="text-muted-foreground text-sm">
                    We provide educational content about addiction, treatment options, recovery processes, 
                    and related topics to help individuals understand their options.
                  </p>
                </div>
                <div className="bg-card rounded-lg p-6 border">
                  <Shield className="h-6 w-6 text-primary mb-3" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Data & Statistics</h3>
                  <p className="text-muted-foreground text-sm">
                    We compile and present addiction statistics from authoritative government sources 
                    like SAMHSA, CDC, and state health departments.
                  </p>
                </div>
                <div className="bg-card rounded-lg p-6 border">
                  <Heart className="h-6 w-6 text-primary mb-3" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Free Resources</h3>
                  <p className="text-muted-foreground text-sm">
                    We connect visitors with free and low-cost treatment options, crisis hotlines, 
                    and community support programs.
                  </p>
                </div>
              </div>
            </section>

            {/* Important Disclaimers */}
            <section className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Important Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">We Are Not Healthcare Providers:</strong> United Rehabs is an informational 
                  directory website. We do not provide medical advice, diagnosis, or treatment. We are not a healthcare facility, 
                  and our team does not include licensed medical professionals providing clinical services through this website.
                </p>
                <p>
                  <strong className="text-foreground">No Endorsements:</strong> The treatment centers listed on our website are 
                  provided for informational purposes only. We do not endorse, recommend, or guarantee any specific treatment 
                  center, program, or service. We encourage all users to conduct their own research and verification.
                </p>
                <p>
                  <strong className="text-foreground">HIPAA Notice:</strong> We are not a "covered entity" under HIPAA. 
                  We do not collect, store, or transmit Protected Health Information (PHI). Please do not submit sensitive 
                  medical information through our website.
                </p>
              </div>
            </section>

            {/* Our Team */}
            <section>
              <div className="flex items-start gap-4">
                <Users className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4 mt-0">Our Commitment</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We are committed to maintaining an accurate, up-to-date, and user-friendly resource for those seeking 
                    addiction treatment information. Our content team regularly reviews and updates facility information, 
                    statistics, and educational materials.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We believe in transparency, accuracy, and compassion. If you find any information on our website that 
                    appears to be inaccurate or outdated, please contact us so we can investigate and make corrections.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Sources */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Our Data Sources</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The statistics and data presented on our website are compiled from authoritative government sources, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Substance Abuse and Mental Health Services Administration (SAMHSA)</li>
                <li>Centers for Disease Control and Prevention (CDC)</li>
                <li>National Institute on Drug Abuse (NIDA)</li>
                <li>State health departments and vital statistics offices</li>
                <li>National Survey on Drug Use and Health (NSDUH)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Data may have a 1-2 year lag due to official reporting timelines. For the most current data, 
                we encourage visitors to consult the source agencies directly.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                Have questions, feedback, or concerns? We'd love to hear from you. Please visit our{" "}
                <a href="/contact" className="text-primary hover:underline">Contact page</a> to get in touch with our team.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
