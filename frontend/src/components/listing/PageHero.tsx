import type { State } from "@/types";
import { useHeroContent } from "@/hooks/usePageContent";
import { usePageSEO } from "@/components/SEOHead";
import { useLocation } from "react-router-dom";

interface PageHeroProps {
  state: State;
  pageKey?: string;
}

export function PageHero({ state, pageKey }: PageHeroProps) {
  const location = useLocation();
  
  // Derive page key from URL if not provided
  const derivedPageKey = pageKey || location.pathname.slice(1) || "home";
  
  // First try page_seo for h1_title and intro_text
  const { data: seoContent } = usePageSEO(derivedPageKey);
  
  // Fall back to page_content if no SEO content
  const { title, subtitle, body, isLoading } = useHeroContent(derivedPageKey);
  
  // Priority: SEO h1_title > page_content title > default
  const displayTitle = seoContent?.h1_title || title || `Alcohol & Drug Addiction, Treatment And Rehabs In ${state.name}`;
  // Priority: SEO intro_text > page_content body > state description
  const displayBody = seoContent?.intro_text || body || state.description;

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 items-start py-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
          {displayTitle}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg text-primary font-medium mb-2">{subtitle}</p>
        )}
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {displayBody}{" "}
          <a href="#" className="text-primary hover:underline">
            Know more about {state.name}
          </a>
        </p>
      </div>
      
      {/* State Flag - Hidden on small mobile, visible on sm+ */}
      <div className="hidden sm:flex flex-shrink-0">
        <div className="w-24 sm:w-32 h-16 sm:h-20 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <div className="text-xl sm:text-2xl mb-1">⭐</div>
            <div className="text-[10px] sm:text-xs font-bold text-foreground">{state.name.toUpperCase()}</div>
            <div className="text-[7px] sm:text-[8px] text-muted-foreground">REPUBLIC</div>
          </div>
        </div>
      </div>
    </div>
  );
}
