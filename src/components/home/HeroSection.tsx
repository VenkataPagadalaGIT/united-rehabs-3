import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            <span className="italic">Your Journey To Wellness</span>
            <br />
            <span>Begins Here</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Connecting you with top-rated rehabs for addiction, mental health, and more
          </p>

          {/* Search Bar with Autocomplete */}
          <div ref={wrapperRef} className="relative max-w-2xl mx-auto mb-6">
            <form onSubmit={handleSearch} className="flex items-center bg-background rounded-lg border shadow-lg">
              <div className="flex-1 flex items-center px-4">
                <Search className="h-5 w-5 text-muted-foreground mr-3" />
                <Input 
                  type="text"
                  placeholder="Search by state, e.g. 'California'..."
                  className="border-0 shadow-none focus-visible:ring-0 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                />
              </div>
              <Button type="submit" className="m-1 bg-primary hover:bg-primary/90">
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
                    <span className="ml-auto text-sm text-muted-foreground">View Rehabs</span>
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
