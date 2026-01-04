import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "react-router-dom";

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

const usStates = [
  { name: "California", slug: "california", count: 1842 },
  { name: "Texas", slug: "texas", count: 1256 },
  { name: "Florida", slug: "florida", count: 1124 },
  { name: "New York", slug: "new-york", count: 982 },
  { name: "Pennsylvania", slug: "pennsylvania", count: 756 },
  { name: "Ohio", slug: "ohio", count: 642 },
  { name: "Illinois", slug: "illinois", count: 598 },
  { name: "Arizona", slug: "arizona", count: 478 },
];

export function LocationsSection() {
  const [activeCountry, setActiveCountry] = useState("us");

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

        {/* State Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {usStates.map((state) => (
            <Link
              key={state.slug}
              to={`/${state.slug}-addiction-rehabs`}
              className="group p-4 rounded-xl border bg-card hover:shadow-lg hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {state.name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {state.count.toLocaleString()} centers
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            View All States
          </Button>
        </div>
      </div>
    </section>
  );
}
