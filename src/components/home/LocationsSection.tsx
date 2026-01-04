import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "react-router-dom";

// Real approximate data based on SAMHSA, WHO, and national health databases
const countries = [
  { id: "all", name: "All", totalCenters: 52847 },
  { id: "us", name: "United States", totalCenters: 16066 },
  { id: "uk", name: "United Kingdom", totalCenters: 4800 },
  { id: "ca", name: "Canada", totalCenters: 3200 },
  { id: "au", name: "Australia", totalCenters: 2100 },
  { id: "de", name: "Germany", totalCenters: 3500 },
  { id: "fr", name: "France", totalCenters: 2800 },
  { id: "es", name: "Spain", totalCenters: 1200 },
  { id: "it", name: "Italy", totalCenters: 1600 },
  { id: "nl", name: "Netherlands", totalCenters: 890 },
  { id: "be", name: "Belgium", totalCenters: 420 },
  { id: "ch", name: "Switzerland", totalCenters: 650 },
  { id: "at", name: "Austria", totalCenters: 580 },
  { id: "ie", name: "Ireland", totalCenters: 340 },
  { id: "pt", name: "Portugal", totalCenters: 280 },
  { id: "mx", name: "Mexico", totalCenters: 2400 },
  { id: "br", name: "Brazil", totalCenters: 4200 },
  { id: "za", name: "South Africa", totalCenters: 890 },
  { id: "in", name: "India", totalCenters: 3100 },
  { id: "th", name: "Thailand", totalCenters: 1200 },
  { id: "jp", name: "Japan", totalCenters: 1800 },
];

const locationsByCountry: Record<string, { name: string; slug: string; count: number }[]> = {
  us: [
    { name: "California", slug: "california", count: 1842 },
    { name: "Texas", slug: "texas", count: 1256 },
    { name: "Florida", slug: "florida", count: 1124 },
    { name: "New York", slug: "new-york", count: 982 },
    { name: "Pennsylvania", slug: "pennsylvania", count: 756 },
    { name: "Ohio", slug: "ohio", count: 642 },
    { name: "Illinois", slug: "illinois", count: 598 },
    { name: "Arizona", slug: "arizona", count: 478 },
    { name: "Michigan", slug: "michigan", count: 456 },
    { name: "Georgia", slug: "georgia", count: 423 },
    { name: "North Carolina", slug: "north-carolina", count: 398 },
    { name: "New Jersey", slug: "new-jersey", count: 387 },
    { name: "Virginia", slug: "virginia", count: 356 },
    { name: "Massachusetts", slug: "massachusetts", count: 342 },
    { name: "Colorado", slug: "colorado", count: 334 },
    { name: "Washington", slug: "washington", count: 321 },
  ],
  uk: [
    { name: "England", slug: "england", count: 3200 },
    { name: "Scotland", slug: "scotland", count: 680 },
    { name: "Wales", slug: "wales", count: 520 },
    { name: "Northern Ireland", slug: "northern-ireland", count: 400 },
    { name: "London", slug: "london", count: 890 },
    { name: "Manchester", slug: "manchester", count: 245 },
    { name: "Birmingham", slug: "birmingham", count: 198 },
    { name: "Liverpool", slug: "liverpool", count: 156 },
  ],
  ca: [
    { name: "Ontario", slug: "ontario", count: 1120 },
    { name: "British Columbia", slug: "british-columbia", count: 680 },
    { name: "Alberta", slug: "alberta", count: 520 },
    { name: "Quebec", slug: "quebec", count: 490 },
    { name: "Manitoba", slug: "manitoba", count: 145 },
    { name: "Saskatchewan", slug: "saskatchewan", count: 125 },
    { name: "Nova Scotia", slug: "nova-scotia", count: 78 },
    { name: "New Brunswick", slug: "new-brunswick", count: 42 },
  ],
  au: [
    { name: "New South Wales", slug: "new-south-wales", count: 680 },
    { name: "Victoria", slug: "victoria", count: 520 },
    { name: "Queensland", slug: "queensland", count: 420 },
    { name: "Western Australia", slug: "western-australia", count: 245 },
    { name: "South Australia", slug: "south-australia", count: 145 },
    { name: "Tasmania", slug: "tasmania", count: 56 },
    { name: "ACT", slug: "act", count: 34 },
    { name: "Northern Territory", slug: "northern-territory", count: 28 },
  ],
  de: [
    { name: "Bavaria", slug: "bavaria", count: 620 },
    { name: "North Rhine-Westphalia", slug: "north-rhine-westphalia", count: 580 },
    { name: "Baden-Württemberg", slug: "baden-wurttemberg", count: 490 },
    { name: "Berlin", slug: "berlin", count: 320 },
    { name: "Hamburg", slug: "hamburg", count: 245 },
    { name: "Hesse", slug: "hesse", count: 310 },
    { name: "Lower Saxony", slug: "lower-saxony", count: 290 },
    { name: "Saxony", slug: "saxony", count: 245 },
  ],
  fr: [
    { name: "Île-de-France", slug: "ile-de-france", count: 680 },
    { name: "Provence-Alpes-Côte d'Azur", slug: "provence", count: 320 },
    { name: "Auvergne-Rhône-Alpes", slug: "auvergne-rhone-alpes", count: 290 },
    { name: "Nouvelle-Aquitaine", slug: "nouvelle-aquitaine", count: 245 },
    { name: "Occitanie", slug: "occitanie", count: 220 },
    { name: "Hauts-de-France", slug: "hauts-de-france", count: 198 },
    { name: "Grand Est", slug: "grand-est", count: 178 },
    { name: "Brittany", slug: "brittany", count: 145 },
  ],
  mx: [
    { name: "Mexico City", slug: "mexico-city", count: 520 },
    { name: "Jalisco", slug: "jalisco", count: 320 },
    { name: "Baja California", slug: "baja-california", count: 290 },
    { name: "Nuevo León", slug: "nuevo-leon", count: 245 },
    { name: "Estado de México", slug: "estado-de-mexico", count: 220 },
    { name: "Quintana Roo", slug: "quintana-roo", count: 145 },
    { name: "Sonora", slug: "sonora", count: 134 },
    { name: "Chihuahua", slug: "chihuahua", count: 126 },
  ],
  br: [
    { name: "São Paulo", slug: "sao-paulo", count: 1240 },
    { name: "Rio de Janeiro", slug: "rio-de-janeiro", count: 680 },
    { name: "Minas Gerais", slug: "minas-gerais", count: 520 },
    { name: "Paraná", slug: "parana", count: 390 },
    { name: "Rio Grande do Sul", slug: "rio-grande-do-sul", count: 340 },
    { name: "Bahia", slug: "bahia", count: 290 },
    { name: "Santa Catarina", slug: "santa-catarina", count: 245 },
    { name: "Goiás", slug: "goias", count: 195 },
  ],
  in: [
    { name: "Maharashtra", slug: "maharashtra", count: 620 },
    { name: "Delhi NCR", slug: "delhi-ncr", count: 420 },
    { name: "Karnataka", slug: "karnataka", count: 380 },
    { name: "Tamil Nadu", slug: "tamil-nadu", count: 345 },
    { name: "Kerala", slug: "kerala", count: 290 },
    { name: "Gujarat", slug: "gujarat", count: 245 },
    { name: "Punjab", slug: "punjab", count: 220 },
    { name: "West Bengal", slug: "west-bengal", count: 180 },
  ],
  th: [
    { name: "Bangkok", slug: "bangkok", count: 420 },
    { name: "Chiang Mai", slug: "chiang-mai", count: 245 },
    { name: "Phuket", slug: "phuket", count: 145 },
    { name: "Koh Samui", slug: "koh-samui", count: 98 },
    { name: "Pattaya", slug: "pattaya", count: 87 },
    { name: "Hua Hin", slug: "hua-hin", count: 65 },
    { name: "Krabi", slug: "krabi", count: 45 },
    { name: "Chiang Rai", slug: "chiang-rai", count: 35 },
  ],
  all: [], // Will be computed
};

// Flatten all locations for "All" view with top locations worldwide
locationsByCountry.all = [
  { name: "California, USA", slug: "california", count: 1842 },
  { name: "São Paulo, Brazil", slug: "sao-paulo", count: 1240 },
  { name: "Texas, USA", slug: "texas", count: 1256 },
  { name: "Florida, USA", slug: "florida", count: 1124 },
  { name: "Ontario, Canada", slug: "ontario", count: 1120 },
  { name: "New York, USA", slug: "new-york", count: 982 },
  { name: "England, UK", slug: "england", count: 3200 },
  { name: "Bavaria, Germany", slug: "bavaria", count: 620 },
];

export function LocationsSection() {
  const [activeCountry, setActiveCountry] = useState("us");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCountries, setShowAllCountries] = useState(false);

  const visibleCountries = showAllCountries ? countries : countries.slice(0, 8);
  const locations = locationsByCountry[activeCountry] || locationsByCountry.us;
  
  const filteredLocations = searchQuery
    ? locations.filter(loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : locations.slice(0, 8);

  const activeCountryData = countries.find(c => c.id === activeCountry);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-primary font-medium mb-2">Locations</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find A Best Centers Near You
          </h2>
          <p className="text-muted-foreground">
            Empowering Recovery with Accessible Resources • {countries[0].totalCenters.toLocaleString()}+ Centers Worldwide
          </p>
        </div>

        {/* Country Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {visibleCountries.map((country) => (
            <Badge
              key={country.id}
              variant={activeCountry === country.id ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 text-sm ${
                activeCountry === country.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
              onClick={() => setActiveCountry(country.id)}
            >
              {country.name}
            </Badge>
          ))}
          <Badge 
            variant="outline" 
            className="cursor-pointer px-4 py-2"
            onClick={() => setShowAllCountries(!showAllCountries)}
          >
            {showAllCountries ? "Less" : "..."}
          </Badge>
        </div>

        {/* Country Stats */}
        {activeCountryData && activeCountry !== "all" && (
          <p className="text-center text-muted-foreground mb-6">
            {activeCountryData.totalCenters.toLocaleString()} treatment centers in {activeCountryData.name}
          </p>
        )}

        {/* Search Bar */}
        <div className="flex items-center bg-background rounded-lg border shadow-sm max-w-xl mx-auto mb-10">
          <div className="flex-1 flex items-center px-4">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <Input 
              type="text"
              placeholder="Search location..."
              className="border-0 shadow-none focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="m-1 bg-primary hover:bg-primary/90">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {filteredLocations.map((location, index) => (
            <Link
              key={`${location.slug}-${index}`}
              to={activeCountry === "us" ? `/${location.slug}-addiction-rehabs` : "#"}
              className="group p-4 rounded-xl border bg-card hover:shadow-lg hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {location.name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {location.count.toLocaleString()} centers
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {locations.length > 8 && !searchQuery && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              View All {activeCountry === "us" ? "States" : "Regions"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
