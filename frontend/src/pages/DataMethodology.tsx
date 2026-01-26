import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Database, 
  CheckCircle, 
  RefreshCw, 
  Shield, 
  Globe, 
  FileText, 
  AlertTriangle,
  Calendar,
  Search,
  Users
} from "lucide-react";

export default function DataMethodology() {
  const lastUpdated = "January 26, 2026";

  return (
    <div className="min-h-screen bg-background">
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Data Methodology</h1>
            <p className="text-muted-foreground">How we collect, verify, and maintain addiction statistics</p>
            <p className="text-sm text-muted-foreground mt-2">Last updated: {lastUpdated}</p>
          </div>

          {/* Trust Statement */}
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-foreground mb-2">Our Commitment to Accuracy</h2>
                  <p className="text-sm text-muted-foreground">
                    United Rehabs is committed to providing the most accurate, up-to-date addiction statistics available. Every number on our platform is sourced from official government agencies and verified through rigorous quality assurance processes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="prose prose-slate max-w-none space-y-8">
            
            {/* Data Sources Section */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                Primary Data Sources
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We source data exclusively from official government agencies and recognized international organizations:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2">🇺🇸 United States</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• CDC National Center for Health Statistics (NCHS)</li>
                      <li>• SAMHSA National Survey on Drug Use</li>
                      <li>• DEA Diversion Control Division</li>
                      <li>• State Health Departments (all 51)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2">🌍 International</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• World Health Organization (WHO)</li>
                      <li>• United Nations Office on Drugs and Crime (UNODC)</li>
                      <li>• European Monitoring Centre for Drugs (EMCDDA)</li>
                      <li>• National Health Ministries (195 countries)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2">🇬🇧 United Kingdom</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Office for National Statistics (ONS)</li>
                      <li>• Public Health England</li>
                      <li>• NHS Digital</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2">🇨🇦 🇦🇺 Other Countries</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Statistics Canada</li>
                      <li>• Australian Institute of Health and Welfare</li>
                      <li>• National statistical agencies worldwide</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Verification Process */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                Verification Process
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Every data point undergoes a multi-step verification process:
              </p>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Source Identification</h4>
                    <p className="text-sm text-muted-foreground">
                      Data is collected only from official government publications, peer-reviewed reports, and recognized international organizations. We never use secondary sources or news reports as primary data.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Cross-Reference Validation</h4>
                    <p className="text-sm text-muted-foreground">
                      Each statistic is cross-referenced against multiple sources where available. Discrepancies are flagged for manual review.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Manual Review</h4>
                    <p className="text-sm text-muted-foreground">
                      High-traffic countries (USA, UK, Canada, Australia, Germany) receive additional manual verification against original source documents.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">SERP Validation</h4>
                    <p className="text-sm text-muted-foreground">
                      We periodically validate our data against Google Search results to ensure our figures match publicly available official statistics.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">5</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Source Link Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      Every data point includes a working link to the original source document. Broken links are automatically detected and updated.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Update Frequency */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <RefreshCw className="h-6 w-6 text-primary" />
                Update Frequency
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-border rounded-lg">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Data Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Update Frequency</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Source Release</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground text-sm">
                    <tr className="border-t border-border">
                      <td className="px-4 py-3">US Overdose Deaths</td>
                      <td className="px-4 py-3">Monthly (provisional), Annually (final)</td>
                      <td className="px-4 py-3">CDC NCHS releases ~6 months after period</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-3">US State Data</td>
                      <td className="px-4 py-3">Quarterly review</td>
                      <td className="px-4 py-3">State agencies vary (3-12 month lag)</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-3">International Data</td>
                      <td className="px-4 py-3">Annually</td>
                      <td className="px-4 py-3">WHO/UNODC release annually</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-3">Treatment Facilities</td>
                      <td className="px-4 py-3">Continuous</td>
                      <td className="px-4 py-3">Verified on submission + quarterly audit</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg mt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note on Data Lag:</strong> Official statistics typically have a 6-18 month reporting delay. For example, final 2024 data may not be available until mid-2025. We always display the most recent verified data and clearly indicate the reporting period.
                </p>
              </div>
            </section>

            {/* Data Quality Indicators */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Search className="h-6 w-6 text-primary" />
                Data Quality Indicators
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use quality indicators to help users understand the reliability of each data point:
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <span className="font-medium text-foreground">Verified</span>
                    <span className="text-sm text-muted-foreground ml-2">- Confirmed against official source document with working link</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div>
                    <span className="font-medium text-foreground">Official Source</span>
                    <span className="text-sm text-muted-foreground ml-2">- From government agency or international organization</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <span className="font-medium text-foreground">Estimated</span>
                    <span className="text-sm text-muted-foreground ml-2">- Calculated from regional averages when country-specific data unavailable</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted border border-border rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <span className="font-medium text-foreground">Provisional</span>
                    <span className="text-sm text-muted-foreground ml-2">- Preliminary data subject to revision</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Limitations */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-primary" />
                Known Limitations
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We believe in transparency about the limitations of addiction statistics:
              </p>

              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Underreporting:</strong> Drug-related deaths may be underreported due to stigma, misclassification, or incomplete toxicology testing.
                </li>
                <li>
                  <strong>Methodology Differences:</strong> Countries use different definitions and reporting standards, making direct comparisons challenging.
                </li>
                <li>
                  <strong>Time Lag:</strong> Official data can be 6-18 months behind current reality due to verification processes.
                </li>
                <li>
                  <strong>Provisional vs. Final:</strong> Provisional data may be revised significantly when final figures are released.
                </li>
                <li>
                  <strong>Coverage Gaps:</strong> Some countries have limited or no official reporting systems for drug-related statistics.
                </li>
              </ul>
            </section>

            {/* How to Cite */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                How to Cite Our Data
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When referencing data from United Rehabs, please cite the original source. Our data pages include direct links to source documents.
              </p>

              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Example Citation:</p>
                <p className="text-sm text-muted-foreground italic">
                  "According to CDC National Center for Health Statistics (2024), the United States recorded 107,941 drug overdose deaths in 2022. Retrieved via United Rehabs (unitedrehabs.com) on [date]."
                </p>
              </div>

              <p className="text-muted-foreground leading-relaxed mt-4">
                For academic or policy research, we recommend citing the original government source directly. Our platform aggregates and presents this data but does not generate primary research.
              </p>
            </section>

            {/* Report Errors */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Report Data Errors
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We take data accuracy seriously. If you find an error or discrepancy:
              </p>

              <div className="bg-muted/30 p-6 rounded-lg mt-4">
                <p className="text-foreground font-medium mb-4">Report a Data Issue</p>
                <p className="text-muted-foreground mb-2">Email: data@unitedrehabs.com</p>
                <p className="text-sm text-muted-foreground">
                  Please include:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-6 mt-2 space-y-1">
                  <li>The specific data point in question</li>
                  <li>The page URL where you found it</li>
                  <li>The correct figure with source citation</li>
                  <li>Link to the official source document</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  We review all submissions within 48 hours and update verified corrections immediately.
                </p>
              </div>
            </section>

            {/* Verification Badge */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Our Verification Standards</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-primary mb-2">195</div>
                    <p className="text-sm text-muted-foreground">Countries Covered</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-primary mb-2">51</div>
                    <p className="text-sm text-muted-foreground">US States + DC</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-primary mb-2">100%</div>
                    <p className="text-sm text-muted-foreground">Official Sources</p>
                  </CardContent>
                </Card>
              </div>
            </section>

          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
