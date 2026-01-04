import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const quickTags = [
  "Alcohol Addiction",
  "Drug Addiction", 
  "Depression",
  "Anxiety",
  "Eating Disorders",
  "ADHD",
];

export function HeroSection() {
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
          <div className="flex items-center bg-background rounded-lg border shadow-lg max-w-2xl mx-auto mb-6">
            <div className="flex-1 flex items-center px-4">
              <Search className="h-5 w-5 text-muted-foreground mr-3" />
              <Input 
                type="text"
                placeholder="Search rehab, disorder, location..."
                className="border-0 shadow-none focus-visible:ring-0 text-base"
              />
            </div>
            <Button className="m-1 bg-primary hover:bg-primary/90">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap justify-center gap-2">
            {quickTags.map((tag) => (
              <Badge 
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors px-3 py-1"
              >
                {tag}
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
