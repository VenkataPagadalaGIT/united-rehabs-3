import type { GalleryImage } from "@/types";
import { useState } from "react";
import { CaliforniaMap } from "./CaliforniaMap";

interface ImageGalleryProps {
  images: GalleryImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const heroImages = [
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  ];

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[380px]">
        {/* Left - Large hero image with carousel */}
        <div className="md:col-span-5 relative rounded-xl overflow-hidden h-64 md:h-full">
          <img
            src={heroImages[activeIndex]}
            alt="California scenery"
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

        {/* Center - Interactive California map */}
        <div className="md:col-span-4 rounded-xl overflow-hidden border-4 border-blue-400 h-64 md:h-full">
          <CaliforniaMap className="w-full h-full" />
        </div>

        {/* Right column - USA map + photo */}
        <div className="md:col-span-3 grid grid-rows-2 gap-4 h-64 md:h-full">
          {/* USA Map showing California location */}
          <div className="rounded-xl overflow-hidden border border-border">
            <CaliforniaMap className="w-full h-full" showUSA />
          </div>
          {/* Palm trees photo */}
          <div className="rounded-xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&h=300&fit=crop"
              alt="California Palm Trees"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
