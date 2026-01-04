import { useState } from "react";

const images = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=400&fit=crop",
    alt: "Golden Gate Bridge",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=600&h=400&fit=crop",
    alt: "California Landscape",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=300&h=200&fit=crop",
    alt: "Beach View",
  },
];

export function ImageGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
      {/* Main Image */}
      <div className="md:col-span-2 relative rounded-xl overflow-hidden h-64 md:h-80">
        <img
          src={images[0].src}
          alt={images[0].alt}
          className="w-full h-full object-cover"
        />
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2, 3, 4].map((dot) => (
            <button
              key={dot}
              onClick={() => setActiveIndex(dot)}
              className={`w-2 h-2 rounded-full transition-all ${
                dot === activeIndex ? "bg-primary w-4" : "bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Side Images */}
      <div className="flex md:flex-col gap-4">
        <div className="flex-1 rounded-xl overflow-hidden h-32 md:h-[calc(50%-0.5rem)]">
          <img
            src={images[1].src}
            alt={images[1].alt}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 rounded-xl overflow-hidden h-32 md:h-[calc(50%-0.5rem)] relative">
          <img
            src={images[2].src}
            alt={images[2].alt}
            className="w-full h-full object-cover"
          />
          {/* Map overlay indicator */}
          <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
            <div className="bg-card px-3 py-1 rounded-full text-sm font-medium">
              View Map
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
