import type { GalleryImage } from "@/types";
import { useState } from "react";

interface ImageGalleryProps {
  images: GalleryImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const displayImages = images.slice(0, 4);

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Main large image - left side */}
        <div className="md:col-span-5 relative rounded-xl overflow-hidden h-64 md:h-[420px]">
          <img
            src={displayImages[0]?.url}
            alt={displayImages[0]?.alt}
            className="w-full h-full object-cover"
          />
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

        {/* Right side grid */}
        <div className="md:col-span-7 grid grid-cols-2 grid-rows-2 gap-4 h-64 md:h-[420px]">
          <div className="rounded-xl overflow-hidden">
            {displayImages[1] && (
              <img src={displayImages[1].url} alt={displayImages[1].alt} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="rounded-xl overflow-hidden">
            {displayImages[2] && (
              <img src={displayImages[2].url} alt={displayImages[2].alt} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="col-span-2 rounded-xl overflow-hidden">
            {displayImages[3] && (
              <img src={displayImages[3].url} alt={displayImages[3].alt} className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
