import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PhoneCTA() {
  return (
    <Button
      size="lg"
      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
      asChild
    >
      <a href="tel:1-800-555-0199" className="flex items-center gap-3">
        <Phone className="h-5 w-5" />
        <span>1-800-555-0199</span>
      </a>
    </Button>
  );
}
