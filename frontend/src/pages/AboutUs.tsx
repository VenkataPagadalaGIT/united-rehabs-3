import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { cmsApi } from "@/lib/api";
import { Shield, Users, Target, BarChart3, Globe, Database, FileText, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { sanitizeHtml } from "@/lib/sanitize";

export default function AboutUs() {
  const { data: pageContent, isLoading } = useQuery({
    queryKey: ["cms-page", "about-us"],
    queryFn: () => cmsApi.getPage("about-us"),
    staleTime: 5 * 60 * 1000,
  });

  const hasCMSContent = pageContent?.content && pageContent.content.length > 500;

  return (
    <div className="min-h-screen bg-background" data-testid="about-page">
      <SEOHead
        pageSlug="about"
        fallbackTitle="About United Rehabs - Global Addiction Data Resource"
        fallbackDescription="United Rehabs provides comprehensive addiction statistics for 195 countries. Data from WHO, CDC, SAMHSA, UNODC. Our mission, data sources, and standards."
        keywords="about united rehabs, addiction data resource, global drug statistics, WHO data, CDC SAMHSA data, addiction research"
      />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-full max-w-lg" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : hasCMSContent ? (
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {pageContent?.title || "About United Rehabs"}
              </h1>
              <div 
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(pageContent?.content || "") }}
              />
            </div>
          ) : (
            <>
              {/* Page Header */}
              <h1 className="text-4xl font-bold text-foreground mb-3" data-testid="about-heading">
                About United Rehabs
              </h1>
              <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
                The most comprehensive open resource for global addiction statistics, 
                covering 195 countries and all 51 US states with data from the world's 
                leading health organizations.
              </p>
              
              <div className="space-y-14">
                {/* Mission */}
                <section className="bg-primary/5 rounded-xl p-8 border border-primary/10" data-testid="about-mission">
                  <div className="flex items-start gap-4">
                    <Target className="h-7 w-7 text-primary shrink-0 mt-1" />
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-3">Our Mission</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Substance use disorders affect over 292 million people worldwide, yet reliable data 
                        remains scattered across hundreds of reports and databases. United Rehabs exists to 
                        change that. We aggregate, verify, and present addiction statistics from authoritative 
                        global sources in one accessible platform — empowering researchers, policymakers, 
                        journalists, educators, and families with the information they need.
                      </p>
                    </div>
                  </div>
                </section>

                {/* What We Provide */}
                <section data-testid="about-services">
                  <h2 className="text-2xl font-semibold text-foreground mb-6">What We Provide</h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow">
                      <BarChart3 className="h-6 w-6 text-primary mb-3" />
                      <h3 className="text-base font-semibold text-foreground mb-2">Addiction Statistics</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Detailed substance use data including prevalence rates, overdose deaths, 
                        treatment admissions, and recovery rates — broken down by country and US state.
                      </p>
                    </div>
                    <div className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow">
                      <Globe className="h-6 w-6 text-primary mb-3" />
                      <h3 className="text-base font-semibold text-foreground mb-2">Global Coverage</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Statistics for 195 countries across every continent, with interactive maps 
                        and a comparison tool to analyze trends across regions.
                      </p>
                    </div>
                    <div className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow">
                      <TrendingUp className="h-6 w-6 text-primary mb-3" />
                      <h3 className="text-base font-semibold text-foreground mb-2">Trend Analysis</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Year-over-year data visualization showing how substance use disorders, 
                        overdose deaths, and treatment access are changing over time.
                      </p>
                    </div>
                    <div className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow">
                      <Database className="h-6 w-6 text-primary mb-3" />
                      <h3 className="text-base font-semibold text-foreground mb-2">US State Data</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        In-depth statistics for all 51 US states and territories, sourced from 
                        SAMHSA NSDUH surveys, CDC WONDER, and state health departments.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Data Sources */}
                <section data-testid="about-data-sources">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Our Data Sources</h2>
                  <p className="text-muted-foreground leading-relaxed mb-5">
                    Every statistic on United Rehabs is traceable to an official source. We compile data from 
                    the world's most authoritative health organizations:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { org: "WHO", full: "World Health Organization — Global Health Observatory" },
                      { org: "UNODC", full: "United Nations Office on Drugs and Crime — World Drug Report" },
                      { org: "SAMHSA", full: "Substance Abuse and Mental Health Services Administration (US)" },
                      { org: "CDC", full: "Centers for Disease Control and Prevention — WONDER Database" },
                      { org: "NIDA", full: "National Institute on Drug Abuse (US)" },
                      { org: "EMCDDA", full: "European Monitoring Centre for Drugs and Drug Addiction" },
                    ].map((source) => (
                      <div key={source.org} className="flex items-start gap-3 py-2">
                        <span className="text-primary font-bold text-sm mt-0.5 min-w-[60px]">{source.org}</span>
                        <span className="text-muted-foreground text-sm">{source.full}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Official data may carry a 1–2 year reporting lag. Where country-specific data is unavailable, 
                    we note estimates derived from regional averages. See our{" "}
                    <Link to="/data-methodology" className="text-primary hover:underline">Data Methodology</Link> for 
                    full details on collection and verification.
                  </p>
                </section>

                {/* Our Standards */}
                <section data-testid="about-standards">
                  <div className="flex items-start gap-4">
                    <Shield className="h-7 w-7 text-primary shrink-0 mt-1" />
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-3">Our Standards</h2>
                      <div className="space-y-3 text-muted-foreground leading-relaxed">
                        <p>
                          <strong className="text-foreground">Accuracy First:</strong> Every data point is 
                          cross-referenced against official publications. We clearly label estimates and 
                          distinguish them from confirmed figures.
                        </p>
                        <p>
                          <strong className="text-foreground">Transparency:</strong> All statistics include 
                          source attribution, year of publication, and methodology notes. We don't round 
                          numbers to appear more impressive — we show exact figures.
                        </p>
                        <p>
                          <strong className="text-foreground">Regular Updates:</strong> Our data team monitors 
                          new releases from WHO, SAMHSA, CDC, and other agencies to keep statistics current.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Who Uses Our Data */}
                <section data-testid="about-audience">
                  <div className="flex items-start gap-4">
                    <Users className="h-7 w-7 text-primary shrink-0 mt-1" />
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-3">Who Uses Our Data</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        United Rehabs serves a diverse audience of professionals and individuals seeking 
                        reliable addiction data:
                      </p>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1.5 text-xs">&#9679;</span>
                          <span><strong className="text-foreground">Researchers & Academics</strong> — citing statistics in studies and publications</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1.5 text-xs">&#9679;</span>
                          <span><strong className="text-foreground">Policymakers</strong> — using data to inform public health decisions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1.5 text-xs">&#9679;</span>
                          <span><strong className="text-foreground">Journalists</strong> — referencing verified statistics in reporting</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1.5 text-xs">&#9679;</span>
                          <span><strong className="text-foreground">Educators</strong> — teaching about the global impact of substance use</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1.5 text-xs">&#9679;</span>
                          <span><strong className="text-foreground">Families & Individuals</strong> — understanding the scope of addiction in their region</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Important Disclaimers */}
                <section className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-8" data-testid="about-disclaimer">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">Important Information</h2>
                  <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                    <p>
                      <strong className="text-foreground">Not a Healthcare Provider:</strong> United Rehabs is a 
                      data and information resource. We do not provide medical advice, diagnosis, or treatment. 
                      Always consult a qualified healthcare professional for medical decisions.
                    </p>
                    <p>
                      <strong className="text-foreground">No Endorsements:</strong> References to treatment 
                      facilities or programs are informational only. We do not endorse, recommend, or guarantee 
                      any specific provider.
                    </p>
                    <p>
                      <strong className="text-foreground">Privacy:</strong> We are not a HIPAA-covered entity. 
                      We do not collect or store Protected Health Information. 
                      See our <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> for details.
                    </p>
                  </div>
                </section>

                {/* Contact CTA */}
                <section className="text-center py-4" data-testid="about-contact-cta">
                  <h2 className="text-2xl font-semibold text-foreground mb-3">Get in Touch</h2>
                  <p className="text-muted-foreground mb-5">
                    Found an error in our data? Have a question or partnership inquiry? We'd like to hear from you.
                  </p>
                  <Link 
                    to="/contact" 
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                    data-testid="about-contact-button"
                  >
                    <FileText className="h-4 w-4" />
                    Contact Us
                  </Link>
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
