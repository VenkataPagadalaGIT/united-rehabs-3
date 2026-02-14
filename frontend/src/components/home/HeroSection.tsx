import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ALL_COUNTRIES } from "@/data/countryConfig";
import { ALL_STATES } from "@/data/allStates";

// Combined location data for search
interface LocationItem {
  name: string;
  slug: string;
  type: "state" | "country";
  flag?: string;
}

const allLocations: LocationItem[] = [
  // US States
  ...ALL_STATES.map(state => ({
    name: state.name,
    slug: state.slug,
    type: "state" as const,
    flag: "🇺🇸"
  })),
  // Countries
  ...ALL_COUNTRIES.map(country => ({
    name: country.name,
    slug: country.slug,
    type: "country" as const,
    flag: country.flag
  }))
];

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      const matching = allLocations
        .filter((loc) => loc.name.toLowerCase().includes(query))
        .slice(0, 6);
      setSuggestions(matching);
      setShowSuggestions(matching.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return;
    
    const match = allLocations.find(loc => 
      loc.name.toLowerCase() === query || 
      loc.name.toLowerCase().includes(query)
    );
    
    if (match) {
      navigate(`/${match.slug}-addiction-stats`);
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (location: LocationItem) => {
    setSearchQuery(location.name);
    setShowSuggestions(false);
    navigate(`/${location.slug}-addiction-stats`);
  };

  return (
    <section className="relative bg-gradient-to-b from-card to-background overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-card/80 via-card/60 to-background" />
      
      <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Mission Words - Premium Label Style */}
          <div className="flex justify-center items-center gap-4 md:gap-8 mb-8 flex-wrap">
            <span className="text-primary font-semibold text-xs md:text-sm tracking-[0.15em] uppercase">Data</span>
            <span className="w-1 h-1 rounded-full bg-primary/40" />
            <span className="text-primary font-semibold text-xs md:text-sm tracking-[0.15em] uppercase">Research</span>
            <span className="w-1 h-1 rounded-full bg-primary/40" />
            <span className="text-primary font-semibold text-xs md:text-sm tracking-[0.15em] uppercase">Inform</span>
            <span className="w-1 h-1 rounded-full bg-primary/40" />
            <span className="text-primary font-semibold text-xs md:text-sm tracking-[0.15em] uppercase">Support</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-[-0.03em] leading-[1.1]">
            Global Addiction
            <br />
            <span className="text-primary">Statistics & Data</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
            Research-backed addiction statistics and data for 195 countries and all US states
          </p>

          {/* Search Bar with Autocomplete */}
          <div ref={wrapperRef} className="relative max-w-xl mx-auto mb-6">
            <form onSubmit={handleSearch} className="flex items-center bg-background rounded-xl border shadow-premium-lg hover:shadow-xl transition-shadow">
              <div className="flex-1 flex items-center px-4">
                <Search className="h-5 w-5 text-muted-foreground mr-3" />
                <Input 
                  type="text"
                  placeholder="Search locations, e.g. 'California' or 'Germany'..."
                  className="border-0 shadow-none focus-visible:ring-0 text-base py-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                />
              </div>
              <Button type="submit" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground mr-2">
                <Search className="h-5 w-5" />
              </Button>
            </form>

            {/* Autocomplete Suggestions */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-premium-lg z-20 overflow-hidden">
                {suggestions.map((location) => (
                  <button
                    key={`${location.type}-${location.slug}`}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                    onClick={() => handleSuggestionClick(location)}
                  >
                    <span className="text-lg">{location.flag}</span>
                    <span className="font-medium">{location.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md font-medium">
                      {location.type === "state" ? "US State" : "Country"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
