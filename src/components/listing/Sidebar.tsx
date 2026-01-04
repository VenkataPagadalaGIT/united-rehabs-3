import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

const healthLinks = [
  "Health Outcomes in California",
  "Health Behaviors Near California",
  "Health Outcomes in California",
  "FAQ's about California Rehabs",
  "Health Outcomes in California",
];

const stats = [
  { label: "Population", value: "39,029,342" },
  { label: "Median Age", value: "37 years" },
  { label: "Median Income", value: "$36,281" },
];

export function Sidebar() {
  return (
    <div className="space-y-6">
      {/* Health Behaviors Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-primary text-sm font-medium mb-4">
          Health Behaviors in California
        </h3>
        <ul className="space-y-3">
          {healthLinks.map((link, index) => (
            <li key={index}>
              <a
                href="#"
                className="text-foreground hover:text-primary transition-colors text-sm"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-foreground font-semibold mb-4">
          Health Outcomes in California
        </h3>
        <Button className="w-full bg-primary hover:bg-primary/90 gap-2 mb-3">
          <Phone className="h-4 w-4" />
          Get Help Now (111-234-3333)
        </Button>
        <a
          href="#"
          className="block text-center text-primary hover:underline text-sm"
        >
          Insurance
        </a>
      </div>

      {/* Stats Cards */}
      {[1, 2, 3].map((_, index) => (
        <div key={index} className="bg-card rounded-xl border border-border p-6">
          {/* Chart placeholder */}
          <div className="h-32 bg-secondary/50 rounded-lg mb-4 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">45%</div>
              <div className="text-xs text-muted-foreground">Statistics</div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            California, a state on the U.S. west coast, had a population of 
            39,029,342 in 2022. The median age in 2021 was 37 years, with a 
            median income...
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span>📅 03 Jun 2022</span>
          </div>
          
          <Button variant="outline" size="sm" className="w-full">
            Read More
          </Button>
        </div>
      ))}
    </div>
  );
}
