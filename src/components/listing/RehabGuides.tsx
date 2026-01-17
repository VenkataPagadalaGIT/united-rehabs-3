import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, CheckCircle, HelpCircle, Compass, Heart, Shield, Wine } from "lucide-react";
import { Link } from "react-router-dom";

const guides = [
  {
    id: 0,
    title: "Understanding Alcohol Addiction",
    description: "A comprehensive guide to alcohol use disorder, its effects on the brain, and the path to recovery.",
    icon: Wine,
    category: "Addiction Type",
    readTime: "12 min read",
    slug: "/guide/alcohol-addiction",
  },
  {
    id: 1,
    title: "Signs You May Need Rehab",
    description: "Learn to recognize the warning signs of addiction and when professional help is needed.",
    icon: HelpCircle,
    category: "Identification",
    readTime: "5 min read",
    slug: null,
  },
  {
    id: 2,
    title: "Types of Treatment Programs",
    description: "Understand the differences between inpatient, outpatient, and intensive outpatient programs.",
    icon: BookOpen,
    category: "Education",
    readTime: "8 min read",
    slug: null,
  },
  {
    id: 3,
    title: "How to Choose the Right Rehab",
    description: "A comprehensive guide to evaluating and selecting the best treatment center for your needs.",
    icon: Compass,
    category: "Guidance",
    readTime: "10 min read",
    slug: null,
  },
  {
    id: 4,
    title: "What to Expect in Treatment",
    description: "Prepare for your recovery journey with an overview of typical treatment phases and activities.",
    icon: CheckCircle,
    category: "Preparation",
    readTime: "7 min read",
    slug: null,
  },
  {
    id: 5,
    title: "Insurance & Payment Options",
    description: "Navigate the financial aspects of rehab including insurance coverage and payment plans.",
    icon: Shield,
    category: "Financial",
    readTime: "6 min read",
    slug: null,
  },
  {
    id: 6,
    title: "Supporting a Loved One",
    description: "How to help someone struggling with addiction while taking care of yourself.",
    icon: Heart,
    category: "Family Support",
    readTime: "8 min read",
    slug: null,
  },
];

export const RehabGuides = () => {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-primary font-medium text-sm uppercase tracking-wide">
          Recovery Resources
        </p>
        <h2 className="text-2xl font-bold text-foreground">
          Rehab Guides & Education
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Helpful resources to understand addiction, treatment options, and the path to recovery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((guide) => {
          const IconComponent = guide.icon;
          
          const cardContent = (
            <Card
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {guide.category}
                  </span>
                </div>
                
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {guide.title}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {guide.description}
                </p>
                
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {guide.readTime}
                  </span>
                  <span className="text-xs font-medium text-primary group-hover:underline">
                    Read Guide →
                  </span>
                </div>
              </CardContent>
            </Card>
          );

          if (guide.slug) {
            return (
              <Link key={guide.id} to={guide.slug} className="block">
                {cardContent}
              </Link>
            );
          }

          return <div key={guide.id} className="block">{cardContent}</div>;
        })}
      </div>
    </section>
  );
};
