import { Brain, Heart, Pill, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  "Conditions",
  "Speciality",
  "Insurance",
  "Therapies",
  "Care",
  "Approaches",
  "Amenities",
  "Prices",
  "Activities",
];

const conditionCards = [
  {
    icon: Brain,
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-100",
    title: "Substance Use Disorders",
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    moreCount: 8,
  },
  {
    icon: Users,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-100",
    title: "Mental Health Disorders",
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    moreCount: 8,
  },
  {
    icon: Heart,
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-100",
    title: "Behavioral Addictions",
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    moreCount: 8,
  },
  {
    icon: Pill,
    iconColor: "text-red-500",
    iconBg: "bg-red-100",
    title: "Personality Disorders",
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    moreCount: 8,
  },
];

export function ConditionsSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-primary font-medium mb-2">Find Rehab</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Start With Finding Your Perfect Place
          </h2>
          <p className="text-muted-foreground">
            Browse 3,500+ Treatment Providers
          </p>
        </div>

        <Tabs defaultValue="Conditions" className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent mb-8">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="Conditions" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {conditionCards.map((card) => (
                <div
                  key={card.title}
                  className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-lg ${card.iconBg} flex items-center justify-center mb-4`}>
                    <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-4">{card.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {card.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    <Badge variant="secondary" className="text-xs">
                      +{card.moreCount}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Add placeholder content for other tabs */}
          {categories.slice(1).map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-0">
              <div className="text-center py-12 text-muted-foreground">
                Browse {cat.toLowerCase()} options coming soon...
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-10">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Get Help Now
          </Button>
        </div>
      </div>
    </section>
  );
}
