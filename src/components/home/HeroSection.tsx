import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
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

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) return;

    // Check if query contains a state name
    for (const [keyword, slug] of Object.entries(stateKeywords)) {
      if (query.includes(keyword)) {
        // Determine which page to navigate to based on keywords
        if (query.includes("stat") || query.includes("data")) {
          navigate(`/${slug}-addiction-statistics`);
        } else if (query.includes("resource") || query.includes("free") || query.includes("help")) {
          navigate(`/${slug}-free-resources`);
        } else {
          navigate(`/${slug}-addiction-rehabs`);
        }
        return;
      }
    }

    // Default: navigate to first state that might match or show browse page
    navigate("/");
  };

  const handleTagClick = (search: string) => {
    setSearchQuery(search);
  };

  return (
    <section className="relative bg-gradient-to-b from-card to-background overflow-hidden">
      {/* Background Image Overlay */}
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

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center bg-background rounded-lg border shadow-lg max-w-2xl mx-auto mb-6">
            <div className="flex-1 flex items-center px-4">
              <Search className="h-5 w-5 text-muted-foreground mr-3" />
              <Input 
                type="text"
                placeholder="Search state, e.g. 'California drug stats'..."
                className="border-0 shadow-none focus-visible:ring-0 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="m-1 bg-primary hover:bg-primary/90">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </form>

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
