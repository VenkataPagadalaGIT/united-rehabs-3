import { Shield, CheckCircle, Award } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "HIPAA",
    subtitle: "Compliant",
  },
  {
    icon: CheckCircle,
    title: "LegitScript",
    subtitle: "Certified",
  },
  {
    icon: Award,
    title: "Verified",
    subtitle: "Facility",
  },
];

export function TrustBadges() {
  return (
    <div className="flex items-center gap-6 flex-wrap">
      {badges.map((badge) => (
        <div
          key={badge.title}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <badge.icon className="h-5 w-5 text-primary" />
          <div className="text-sm">
            <span className="font-semibold text-foreground">{badge.title}</span>
            <span className="ml-1 text-muted-foreground">{badge.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
