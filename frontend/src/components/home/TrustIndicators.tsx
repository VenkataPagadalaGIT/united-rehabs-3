import { ShieldCheck, Users, MessageSquare } from "lucide-react";

const indicators = [
  {
    icon: ShieldCheck,
    title: "Only Verified Facilities",
    description: "Rehabs that meet the highest standards of care.",
  },
  {
    icon: Users,
    title: "Personalized Approach",
    description: "Tailored treatment options to suit your unique needs.",
  },
  {
    icon: MessageSquare,
    title: "Trusted Reviews",
    description: "Real feedback from those who've been there.",
  },
];

export function TrustIndicators() {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {indicators.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <item.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
