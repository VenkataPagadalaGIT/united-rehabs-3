import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import type { StatisticsCard } from "@/types";

interface SidebarProps {
  statisticsCards: StatisticsCard[];
  phoneNumber?: string;
  stateName?: string;
}

export function Sidebar({ statisticsCards, phoneNumber = "111-234-3333", stateName = "California" }: SidebarProps) {
  // Generate dynamic health resources based on state name
  const healthResources = useMemo(() => [
    { id: "hr1", title: `Health Outcomes in ${stateName}`, url: "#" },
    { id: "hr2", title: `Health Behaviors Near ${stateName}`, url: "#" },
    { id: "hr3", title: `Health Outcomes in ${stateName}`, url: "#" },
    { id: "hr4", title: `FAQ's about ${stateName} Rehabs`, url: "#" },
    { id: "hr5", title: `Health Outcomes in ${stateName}`, url: "#" },
  ], [stateName]);

  return (
    <div className="space-y-6">
      {/* Health Behaviors Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-primary text-sm font-medium mb-4">
          Health Behaviors in {stateName}
        </h3>
        <ul className="space-y-3">
          {healthResources.map((resource) => (
            <li key={resource.id}>
              <a
                href={resource.url}
                className="text-foreground hover:text-primary transition-colors text-sm"
              >
                {resource.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-foreground font-semibold mb-4">
          Health Outcomes in {stateName}
        </h3>
        <Button className="w-full bg-primary hover:bg-primary/90 gap-2 mb-3">
          <Phone className="h-4 w-4" />
          Get Help Now ({phoneNumber})
        </Button>
        <a
          href="#"
          className="block text-center text-primary hover:underline text-sm"
        >
          Insurance
        </a>
      </div>

      {/* Stats Cards */}
      {statisticsCards.map((card) => (
        <div key={card.id} className="bg-card rounded-xl border border-border p-6">
          {/* Chart placeholder */}
          <div className="h-32 bg-secondary/50 rounded-lg mb-4 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {card.value}{card.unit}
              </div>
              <div className="text-xs text-muted-foreground">{card.title}</div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {card.description}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span>📅 {card.date}</span>
          </div>
          
          <Button variant="outline" size="sm" className="w-full">
            Read More
          </Button>
        </div>
      ))}
    </div>
  );
}
