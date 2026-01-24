import { Star, CheckCircle } from "lucide-react";
import type { TreatmentCenter } from "@/types";

interface RelatedRehabsProps {
  centers: TreatmentCenter[];
}

export function RelatedRehabs({ centers }: RelatedRehabsProps) {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-primary text-sm font-medium">
            Explore Top Treatment Destinations
          </span>
          <h2 className="text-2xl font-bold text-foreground mt-2">
            Related Rehabs
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {centers.slice(0, 4).map((center) => {
            const primaryImage = center.images.find((img) => img.isPrimary) || center.images[0];
            
            return (
              <div
                key={center.id}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-40">
                  <img
                    src={primaryImage?.url}
                    alt={primaryImage?.alt || center.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    📍 {center.address}
                  </p>
                  <h3 className="font-semibold text-foreground flex items-center gap-1">
                    {center.name}
                    {center.verified && (
                      <CheckCircle className="h-4 w-4 text-accent fill-accent stroke-white" />
                    )}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded">
                      <Star className="h-3 w-3 text-accent fill-accent" />
                      <span className="text-sm font-medium text-accent">
                        {center.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 text-primary fill-primary"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({center.reviewCount})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
