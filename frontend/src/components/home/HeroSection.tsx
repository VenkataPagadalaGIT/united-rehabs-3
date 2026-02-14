import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const filterOptions = {
  treatmentType: [
    { id: "inpatient", label: "Inpatient" },
    { id: "outpatient", label: "Outpatient" },
    { id: "detox", label: "Detox" },
    { id: "residential", label: "Residential" },
    { id: "php", label: "Partial Hospitalization (PHP)" },
    { id: "iop", label: "Intensive Outpatient (IOP)" },
  ],
  insurance: [
    { id: "medicaid", label: "Medicaid" },
    { id: "medicare", label: "Medicare" },
    { id: "private", label: "Private Insurance" },
    { id: "selfpay", label: "Self-Pay" },
    { id: "sliding", label: "Sliding Scale" },
  ],
  amenities: [
    { id: "pool", label: "Pool" },
    { id: "gym", label: "Gym/Fitness" },
    { id: "private", label: "Private Rooms" },
    { id: "holistic", label: "Holistic Therapy" },
    { id: "pet", label: "Pet-Friendly" },
  ],
};
const quickTags = [
  { label: "Alcohol Addiction", search: "alcohol" },
  { label: "Drug Addiction", search: "drug" },
  { label: "Depression", search: "depression" },
  { label: "Anxiety", search: "anxiety" },
  { label: "Eating Disorders", search: "eating disorders" },
  { label: "ADHD", search: "adhd" },
];

const stateKeywords: Record<string, string> = {
  california: "california",
  texas: "texas",
  florida: "florida",
  "new york": "new-york",
  newyork: "new-york",
  pennsylvania: "pennsylvania",
  ohio: "ohio",
  illinois: "illinois",
  arizona: "arizona",
  georgia: "georgia",
  "north carolina": "north-carolina",
  michigan: "michigan",
  "new jersey": "new-jersey",
  virginia: "virginia",
  washington: "washington",
  massachusetts: "massachusetts",
  colorado: "colorado",
  tennessee: "tennessee",
  indiana: "indiana",
  missouri: "missouri",
  maryland: "maryland",
  wisconsin: "wisconsin",
  minnesota: "minnesota",
  oregon: "oregon",
  alabama: "alabama",
  louisiana: "louisiana",
  kentucky: "kentucky",
  oklahoma: "oklahoma",
  connecticut: "connecticut",
  utah: "utah",
  iowa: "iowa",
  nevada: "nevada",
  arkansas: "arkansas",
  mississippi: "mississippi",
  kansas: "kansas",
  "new mexico": "new-mexico",
  nebraska: "nebraska",
  "west virginia": "west-virginia",
  idaho: "idaho",
  hawaii: "hawaii",
  "new hampshire": "new-hampshire",
  maine: "maine",
  montana: "montana",
  "rhode island": "rhode-island",
  delaware: "delaware",
  "south dakota": "south-dakota",
  "north dakota": "north-dakota",
  alaska: "alaska",
  vermont: "vermont",
  wyoming: "wyoming",
  "south carolina": "south-carolina",
};

const stateDisplayNames: Record<string, string> = {
  california: "California",
  texas: "Texas",
  florida: "Florida",
  "new york": "New York",
  pennsylvania: "Pennsylvania",
  ohio: "Ohio",
  illinois: "Illinois",
  arizona: "Arizona",
  georgia: "Georgia",
  "north carolina": "North Carolina",
  michigan: "Michigan",
  "new jersey": "New Jersey",
  virginia: "Virginia",
  washington: "Washington",
  massachusetts: "Massachusetts",
  colorado: "Colorado",
  tennessee: "Tennessee",
  indiana: "Indiana",
  missouri: "Missouri",
  maryland: "Maryland",
  wisconsin: "Wisconsin",
  minnesota: "Minnesota",
  oregon: "Oregon",
  alabama: "Alabama",
  louisiana: "Louisiana",
  kentucky: "Kentucky",
  oklahoma: "Oklahoma",
  connecticut: "Connecticut",
  utah: "Utah",
  iowa: "Iowa",
  nevada: "Nevada",
  arkansas: "Arkansas",
  mississippi: "Mississippi",
  kansas: "Kansas",
  "new mexico": "New Mexico",
  nebraska: "Nebraska",
  "west virginia": "West Virginia",
  idaho: "Idaho",
  hawaii: "Hawaii",
  "new hampshire": "New Hampshire",
  maine: "Maine",
  montana: "Montana",
  "rhode island": "Rhode Island",
  delaware: "Delaware",
  "south dakota": "South Dakota",
  "north dakota": "North Dakota",
  alaska: "Alaska",
  vermont: "Vermont",
  wyoming: "Wyoming",
  "south carolina": "South Carolina",
};

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    treatmentType: [],
    insurance: [],
    amenities: [],
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleFilter = (category: string, id: string) => {
    setSelectedFilters((prev) => {
      const current = prev[category] || [];
      if (current.includes(id)) {
        return { ...prev, [category]: current.filter((item) => item !== id) };
      }
      return { ...prev, [category]: [...current, id] };
    });
  };

  const clearFilters = () => {
    setSelectedFilters({ treatmentType: [], insurance: [], amenities: [] });
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length;

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
      const matchingStates = Object.keys(stateDisplayNames)
        .filter((key) => key.includes(query) || stateDisplayNames[key].toLowerCase().includes(query))
        .slice(0, 5);
      setSuggestions(matchingStates);
      setShowSuggestions(matchingStates.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToState(searchQuery);
  };

  const navigateToState = (query: string) => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return;

    for (const [keyword, slug] of Object.entries(stateKeywords)) {
      if (normalized.includes(keyword)) {
        if (normalized.includes("stat") || normalized.includes("data")) {
          navigate(`/${slug}-addiction-statistics`);
        } else if (normalized.includes("resource") || normalized.includes("free") || normalized.includes("help")) {
          navigate(`/${slug}-free-resources`);
        } else {
          navigate(`/${slug}-addiction-rehabs`);
        }
        setShowSuggestions(false);
        return;
      }
    }
    navigate("/");
  };

  const handleSuggestionClick = (stateKey: string) => {
    setSearchQuery(stateDisplayNames[stateKey]);
    setShowSuggestions(false);
    navigate(`/${stateKeywords[stateKey]}-addiction-rehabs`);
  };

  const handleTagClick = (search: string) => {
    setSearchQuery(search);
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
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Mission Words */}
          <div className="flex justify-center items-center gap-3 md:gap-6 mb-6 flex-wrap">
            <span className="text-primary font-bold text-lg md:text-xl tracking-wide uppercase">Aware</span>
            <span className="text-primary/40">•</span>
            <span className="text-primary font-bold text-lg md:text-xl tracking-wide uppercase">Educate</span>
            <span className="text-primary/40">•</span>
            <span className="text-primary font-bold text-lg md:text-xl tracking-wide uppercase">Support</span>
            <span className="text-primary/40">•</span>
            <span className="text-primary font-bold text-lg md:text-xl tracking-wide uppercase">Recover</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
            <span className="font-display">Find Your Path to</span>
            <br />
            <span className="text-primary">Recovery</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Comprehensive addiction statistics and recovery resources across 195 countries
          </p>

          {/* Search Bar with Autocomplete */}
          <div ref={wrapperRef} className="relative max-w-2xl mx-auto mb-6">
            <form onSubmit={handleSearch} className="flex items-center bg-background rounded-lg border shadow-lg">
              <div className="flex-1 flex items-center px-4">
                <Search className="h-5 w-5 text-muted-foreground mr-3" />
                <Input 
                  type="text"
                  placeholder="Search locations, e.g. 'California' or 'Germany'..."
                  className="border-0 shadow-none focus-visible:ring-0 text-base"
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
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-20 overflow-hidden">
                {suggestions.map((stateKey) => (
                  <button
                    key={stateKey}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                    onClick={() => handleSuggestionClick(stateKey)}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span>{stateDisplayNames[stateKey]}</span>
                    <span className="ml-auto text-sm text-muted-foreground">View Statistics</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap justify-center gap-2">
            {quickTags.map((tag) => (
              <Badge 
                key={tag.label}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors px-3 py-1"
                onClick={() => handleTagClick(tag.search)}
              >
                {tag.label}
              </Badge>
            ))}
            <Badge variant="outline" className="cursor-pointer px-3 py-1">
              ...
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
