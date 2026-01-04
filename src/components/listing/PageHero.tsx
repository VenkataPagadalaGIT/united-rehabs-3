import type { State } from "@/types";

interface PageHeroProps {
  state: State;
}

export function PageHero({ state }: PageHeroProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Alcohol & Drug Addiction, Treatment And Rehabs In {state.name}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {state.description}{" "}
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
