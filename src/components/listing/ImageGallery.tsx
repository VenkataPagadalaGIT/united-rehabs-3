import type { State } from "@/types";
import { useState } from "react";
import { StateMap } from "./CaliforniaMap";

interface ImageGalleryProps {
  state: State;
}

export function ImageGallery({ state }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Use state hero images, with fallbacks
  const heroImages = state.heroImages.length > 0 
    ? state.heroImages.map(img => img.url)
    : [
        "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=600&fit=crop",
      ];

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[380px]">
        {/* Left - Large hero image with carousel */}
        <div className="md:col-span-5 relative rounded-xl overflow-hidden h-64 md:h-full">
          <img
            src={heroImages[activeIndex]}
            alt={state.heroImages[activeIndex]?.alt || `${state.name} scenery`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex ? "bg-primary w-4" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Center - Interactive state map */}
        <div className="md:col-span-4 rounded-xl overflow-hidden border-4 border-blue-400 h-64 md:h-full">
          <StateMap 
            className="w-full h-full" 
            latitude={state.latitude}
            longitude={state.longitude}
            stateName={state.name}
          />
        </div>

        {/* Right column - USA map + photo */}
        <div className="md:col-span-3 grid grid-rows-2 gap-4 h-64 md:h-full">
          {/* USA Map showing state location */}
          <div className="rounded-xl overflow-hidden border border-border">
            <StateMap 
              className="w-full h-full" 
              showUSA 
              latitude={state.latitude}
              longitude={state.longitude}
              stateName={state.name}
              stateAbbreviation={state.abbreviation}
            />
          </div>
          {/* Secondary photo from state images */}
          <div className="rounded-xl overflow-hidden">
            <img
              src={heroImages[heroImages.length - 1] || heroImages[0]}
              alt={`${state.name} scenery`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
