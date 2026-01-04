import type { State } from "@/types";
import { useHeroContent } from "@/hooks/usePageContent";
import { useLocation } from "react-router-dom";

interface PageHeroProps {
  state: State;
  pageKey?: string;
}

export function PageHero({ state, pageKey }: PageHeroProps) {
  const location = useLocation();
  
  // Derive page key from URL if not provided
  const derivedPageKey = pageKey || location.pathname.slice(1) || "home";
  
  const { title, subtitle, body, isLoading } = useHeroContent(derivedPageKey);
  
  // Use CMS content if available, otherwise fall back to defaults
  const displayTitle = title || `Alcohol & Drug Addiction, Treatment And Rehabs In ${state.name}`;
  const displayBody = body || state.description;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {displayTitle}
        </h1>
        {subtitle && (
          <p className="text-lg text-primary font-medium mb-2">{subtitle}</p>
        )}
        <p className="text-muted-foreground leading-relaxed">
          {displayBody}{" "}
          <a href="#" className="text-primary hover:underline">
            Know more about {state.name}
          </a>
        </p>
      </div>
      
      {/* State Flag */}
      <div className="flex-shrink-0">
        <div className="w-32 h-20 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-xs font-bold text-foreground">{state.name.toUpperCase()}</div>
            <div className="text-[8px] text-muted-foreground">REPUBLIC</div>
          </div>
        </div>
      </div>
    </div>
  );
}
