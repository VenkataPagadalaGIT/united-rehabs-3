import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Flag } from "lucide-react";

// Global statistics from WHO, UNODC World Drug Report 2024
const globalStats = [
  { category: "Total Drug Users", stat: "292 million people used drugs worldwide", percentage: "5.8%", note: "of global population aged 15-64", source: "UNODC 2024" },
  { category: "Cannabis Users", stat: "228 million cannabis users", percentage: "4.3%", note: "most used drug globally", source: "UNODC 2024" },
  { category: "Opioid Users", stat: "60 million opioid users", percentage: "1.2%", note: "including prescription opioids", source: "UNODC 2024" },
  { category: "Amphetamine Users", stat: "30 million amphetamine users", percentage: "0.6%", note: "including methamphetamine", source: "UNODC 2024" },
  { category: "Cocaine Users", stat: "23 million cocaine users", percentage: "0.5%", note: "globally", source: "UNODC 2024" },
  { category: "Drug Use Disorders", stat: "64 million with drug use disorders", percentage: "22%", note: "of all drug users", source: "UNODC 2024" },
  { category: "Alcohol Use", stat: "2.3 billion people consume alcohol", percentage: "43%", note: "of global population 15+", source: "WHO 2024" },
  { category: "Alcohol Use Disorder", stat: "400 million with AUD", percentage: "7.5%", note: "of drinkers worldwide", source: "WHO 2024" },
  { category: "Drug-Related Deaths", stat: "600,000 drug-related deaths annually", percentage: "1.3%", note: "of all deaths globally", source: "UNODC 2024" },
  { category: "Opioid Overdose Deaths", stat: "128,000 opioid overdose deaths", percentage: "21%", note: "of drug-related deaths", source: "UNODC 2024" },
  { category: "Injection Drug Users", stat: "13.9 million inject drugs", percentage: "0.28%", note: "of global population", source: "UNODC 2024" },
  { category: "Treatment Gap", stat: "Only 1 in 11 receive treatment", percentage: "9%", note: "treatment access rate", source: "UNODC 2024" },
];

// US statistics from SAMHSA NSDUH 2024 (released July 2025) & CDC VSRR 2025
const usStats = [
  { category: "Alcohol Use", stat: "134.3 million people consumed alcohol", percentage: "47.1%", note: "(aged 12+, past month)", source: "SAMHSA 2024" },
  { category: "Binge Drinking", stat: "61.2 million engaged in binge drinking", percentage: "45.6%", note: "of drinkers", source: "SAMHSA 2024" },
  { category: "Substance Use Disorders", stat: "64 million had SUDs", percentage: "22.8%", note: "of population 12+", source: "SAMHSA 2024" },
  { category: "Marijuana Use", stat: "44.3 million used marijuana", percentage: "15.9%", note: "past month", source: "SAMHSA 2024" },
  { category: "Nicotine Vaping", stat: "27.7 million used nicotine vapes", percentage: "9.9%", note: "past month", source: "SAMHSA 2024" },
  { category: "Opioid Misuse", stat: "8.7 million misused opioids", percentage: "3.1%", note: "past year", source: "SAMHSA 2024" },
  { category: "Drug Use Disorders", stat: "27.8 million had drug use disorders", percentage: "9.9%", note: "of population", source: "SAMHSA 2024" },
  { category: "Overdose Deaths", stat: "76,516 drug overdose deaths", percentage: "24.5%", note: "decline from prior year", source: "CDC 2025" },
  { category: "Fentanyl Involvement", stat: "~75% of overdoses involve fentanyl", percentage: "75%", note: "synthetic opioids", source: "CDC 2025" },
  { category: "Treatment Gap", stat: "Only 1 in 11 receive treatment", percentage: "9%", note: "treatment access rate", source: "SAMHSA 2024" },
  { category: "Young Adults (18-25)", stat: "9.3 million had SUDs", percentage: "27.4%", note: "of age group", source: "SAMHSA 2024" },
  { category: "Recovery", stat: "22.3 million in recovery", percentage: "73.5%", note: "of those with past issues", source: "SAMHSA 2024" },
];

export function StatisticsSection() {
  const [activeTab, setActiveTab] = useState("global");

  const renderTable = (stats: typeof globalStats) => (
    <div className="border rounded-xl overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold text-primary">Category</TableHead>
            <TableHead className="font-semibold text-primary">Statistics</TableHead>
            <TableHead className="font-semibold text-primary">Percentage</TableHead>
            <TableHead className="font-semibold text-primary hidden md:table-cell">Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((row) => (
            <TableRow key={row.category}>
              <TableCell className="font-medium">{row.category}</TableCell>
              <TableCell className="text-muted-foreground">{row.stat}</TableCell>
              <TableCell>
                <span className="text-primary font-medium">{row.percentage}</span>
                {row.note && <span className="text-muted-foreground text-sm ml-1">{row.note}</span>}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm hidden md:table-cell">{row.source}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-primary font-medium mb-2">Statistics</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Global Addiction & Substance Use Statistics (2024-2025)
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Substance use disorders affect over 64 million Americans. Overdose deaths declined 24.5% in 2025, though treatment access remains a critical challenge with only 1 in 11 receiving help.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
              <TabsTrigger value="global" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Global Data
              </TabsTrigger>
              <TabsTrigger value="us" className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                United States
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="global">
              {renderTable(globalStats)}
              <p className="text-sm text-muted-foreground text-center mt-6">
                Data sources: UNODC World Drug Report 2024, WHO Global Status Report on Alcohol and Health 2024
              </p>
            </TabsContent>
            
            <TabsContent value="us">
              {renderTable(usStats)}
              <p className="text-sm text-muted-foreground text-center mt-6">
                Data sources: SAMHSA NSDUH 2024 (July 2025), CDC VSRR Provisional Data (Sept 2025)
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}