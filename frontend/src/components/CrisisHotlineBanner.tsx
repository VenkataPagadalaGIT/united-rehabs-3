import { Phone, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CrisisHotlineBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div 
      className="bg-destructive text-destructive-foreground"
      role="banner"
      aria-label="Crisis resources"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span className="font-semibold">Need Help Now?</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <a 
                href="tel:988" 
                className="underline underline-offset-2 hover:no-underline font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-destructive rounded"
                aria-label="Call 988 Suicide and Crisis Lifeline"
              >
                988 Suicide & Crisis Lifeline
              </a>
              <span className="hidden sm:inline text-destructive-foreground/70" aria-hidden="true">|</span>
              <a 
                href="tel:1-800-662-4357" 
                className="underline underline-offset-2 hover:no-underline font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-destructive rounded"
                aria-label="Call SAMHSA National Helpline at 1-800-662-4357"
              >
                SAMHSA: 1-800-662-4357
              </a>
              <span className="text-destructive-foreground/80 text-xs hidden md:inline">
                (24/7, Free, Confidential)
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-destructive-foreground/10 text-destructive-foreground shrink-0"
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss crisis hotline banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
