import type { GalleryImage } from "@/types";
import { useState } from "react";

interface ImageGalleryProps {
  images: GalleryImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Ensure we have at least 4 images for the grid
  const displayImages = images.slice(0, 4);

  return (
    <div className="py-4">
      <div className="grid grid-cols-12 gap-4 h-[400px]">
        {/* Main large image - left side */}
        <div className="col-span-12 md:col-span-5 relative rounded-xl overflow-hidden">
          <img
            src={displayImages[0]?.url}
            alt={displayImages[0]?.alt}
            className="w-full h-full object-cover"
          />
          {/* Dots navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {displayImages.map((_, index) => (
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

        {/* Right side - 2x2 grid */}
        <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-4">
          {/* Top left - Map */}
          <div className="rounded-xl overflow-hidden bg-secondary">
            {displayImages[1] && (
              <img
                src={displayImages[1].url}
                alt={displayImages[1].alt}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Top right - US Map with state highlight */}
          <div className="rounded-xl overflow-hidden border-2 border-primary/20 bg-secondary">
            {displayImages[2] && (
              <img
                src={displayImages[2].url}
                alt={displayImages[2].alt}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Bottom - spans both columns */}
          <div className="col-span-2 rounded-xl overflow-hidden">
            {displayImages[3] && (
              <img
                src={displayImages[3].url}
                alt={displayImages[3].alt}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
