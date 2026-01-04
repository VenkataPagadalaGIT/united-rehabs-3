import type { GalleryImage } from "@/types";
import { useState } from "react";

interface ImageGalleryProps {
  images: GalleryImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[380px]">
        {/* Left - Large hero image */}
        <div className="md:col-span-5 relative rounded-xl overflow-hidden h-64 md:h-full">
          <img
            src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop"
            alt="Golden Gate Bridge"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex ? "bg-primary" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Center - California county map */}
        <div className="md:col-span-4 rounded-xl overflow-hidden border-4 border-blue-400 h-64 md:h-full bg-white">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/California_population_map.png/400px-California_population_map.png"
            alt="California Population Map"
            className="w-full h-full object-contain p-2"
          />
        </div>

        {/* Right column - 2 stacked images */}
        <div className="md:col-span-3 grid grid-rows-2 gap-4 h-64 md:h-full">
          {/* US Map with California highlighted */}
          <div className="rounded-xl overflow-hidden bg-white border border-border">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/USA_California.svg/400px-USA_California.svg.png"
              alt="USA Map with California"
              className="w-full h-full object-contain p-2"
            />
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
