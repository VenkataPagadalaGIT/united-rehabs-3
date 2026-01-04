import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const countries = [
  { id: "all", name: "All" },
  { id: "us", name: "United States" },
  { id: "uk", name: "United Kingdom" },
  { id: "be", name: "Belgium" },
  { id: "fr", name: "France" },
  { id: "de", name: "Germany" },
  { id: "it", name: "Italy" },
  { id: "lu", name: "Luxembourg" },
];

export function LocationsSection() {
  const [activeCountry, setActiveCountry] = useState("all");

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-primary font-medium mb-2">Locations</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find A Best Centers Near You
          </h2>
          <p className="text-muted-foreground">
            Empowering Recovery with Accessible Resources
          </p>
        </div>

        {/* Country Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {countries.map((country) => (
            <Badge
              key={country.id}
              variant={activeCountry === country.id ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 ${
                activeCountry === country.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
              onClick={() => setActiveCountry(country.id)}
            >
              {country.name}
            </Badge>
          ))}
          <Badge variant="outline" className="cursor-pointer px-4 py-2">
            ...
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-background rounded-lg border shadow-sm max-w-xl mx-auto mb-10">
          <div className="flex-1 flex items-center px-4">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <Input 
              type="text"
              placeholder="Search location..."
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <Button className="m-1 bg-primary hover:bg-primary/90">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* World Map Placeholder */}
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-[2/1] bg-muted/50 rounded-xl overflow-hidden">
            {/* Dotted world map pattern */}
            <div className="absolute inset-0 opacity-50" style={{
              backgroundImage: `radial-gradient(circle, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
            }} />
            
            {/* Location markers */}
            <div className="absolute top-[30%] left-[20%] w-3 h-3 bg-primary rounded-full animate-pulse" />
            <div className="absolute top-[25%] left-[45%] w-4 h-4 bg-primary rounded-full animate-pulse" />
            <div className="absolute top-[28%] left-[48%] w-3 h-3 bg-primary rounded-full animate-pulse" />
            <div className="absolute top-[35%] left-[52%] w-3 h-3 bg-primary rounded-full animate-pulse" />
            <div className="absolute top-[40%] left-[55%] w-2 h-2 bg-primary rounded-full animate-pulse" />
            <div className="absolute top-[60%] left-[75%] w-3 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
