import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stats = [
  { category: "Alcohol Use", stat: "134.7 million people consumed alcohol", percentage: "47.5%", note: "(aged 12+)" },
  { category: "Binge Drinking", stat: "61.4 million engaged in binge drinking", percentage: "45.6%", note: "" },
  { category: "Alcohol Use Disorder", stat: "28.9 million had AUD", percentage: "10.2%", note: "" },
  { category: "Marijuana Use", stat: "61.8 million used marijuana", percentage: "21.8%", note: "" },
  { category: "Opioid Misuse", stat: "8.9 million misused opioids", percentage: "3.1%", note: "" },
  { category: "Drug Use Disorders", stat: "27.2 million had drug use disorders", percentage: "9.7%", note: "" },
  { category: "Substance Use Disorders", stat: "48.5 million experienced SUDs", percentage: "16.7%", note: "" },
  { category: "Young Adults (18-25)", stat: "9.2 million had SUDs", percentage: "27.1%", note: "" },
  { category: "Adolescents (12-17)", stat: "2.2 million had SUDs", percentage: "8.5%", note: "" },
  { category: "Overdose Deaths", stat: "107,500 drug overdose deaths", percentage: "3%", note: "decrease from 2022" },
  { category: "Treatment Access", stat: "12.8 million received treatment", percentage: "23.6%", note: "of those in need" },
  { category: "Recovery", stat: "22.2 million in recovery", percentage: "73.1%", note: "of those with past issues" },
];

export function StatisticsSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-primary font-medium mb-2">Statistics</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Addiction And Substance Use Statistics (2023)
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Substance use and addiction remain critical issues in the U.S. Alcohol, marijuana, and opioids are the most widely used substances, with overdose deaths and access to treatment posing significant challenges. Young adults and adolescents are particularly affected, highlighting the need for targeted prevention and recovery efforts.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="border rounded-xl overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-primary">Category</TableHead>
                  <TableHead className="font-semibold text-primary">Statistics</TableHead>
                  <TableHead className="font-semibold text-primary">Percentage</TableHead>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <p className="text-sm text-muted-foreground text-center mt-6">
            This is summarizes the critical statistics for alcohol and drug use, overdose deaths, and treatment in 2023.
          </p>
        </div>
      </div>
    </section>
  );
}
