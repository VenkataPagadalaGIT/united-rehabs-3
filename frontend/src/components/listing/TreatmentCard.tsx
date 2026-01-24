import { Star, CheckCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TreatmentCenter, FilterOption } from "@/types";

interface TreatmentCardProps {
  center: TreatmentCenter;
  conditions: FilterOption[];
  isSponsored?: boolean;
}

export function TreatmentCard({ center, conditions, isSponsored = false }: TreatmentCardProps) {
  const primaryImage = center.images.find((img) => img.isPrimary) || center.images[0];
  
  // Get condition labels from IDs
  const centerConditions = conditions.filter((c) =>
    center.conditionIds.includes(c.id)
  );

  return (
    <article 
      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      aria-label={`${center.name} treatment center`}
    >
      {/* Image */}
      <div className="relative h-48">
        <img
          src={primaryImage?.url}
          alt={`Facility photo of ${center.name}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-foreground/80 text-white text-xs">
            <span aria-hidden="true">📍</span> <span className="sr-only">Location: </span>{center.address}
          </Badge>
        </div>
        {isSponsored && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-xs font-medium">
              Ad
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name & Verified */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground flex items-center gap-1">
            {center.name}
            {center.verified && (
              <CheckCircle className="h-4 w-4 text-accent fill-accent stroke-white" />
            )}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded">
            <Star className="h-3 w-3 text-accent fill-accent" />
            <span className="text-sm font-medium text-accent">{center.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(center.rating)
                    ? "text-primary fill-primary"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({center.reviewCount})</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {centerConditions.slice(0, 3).map((condition) => (
            <Badge
              key={condition.id}
              variant="secondary"
              className="text-xs font-normal"
            >
              {condition.label}
            </Badge>
          ))}
          {centerConditions.length > 3 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{centerConditions.length - 3}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {center.shortDescription}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-foreground">{center.priceLevel}</span>
            {center.acceptsInsurance && (
              <span className="text-accent flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Insurance
              </span>
            )}
          </div>
          <a
            href={`tel:${center.phone}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            aria-label={`Call ${center.name} at ${center.phone}`}
          >
            <Phone className="h-3 w-3" aria-hidden="true" />
            {center.phone}
          </a>
        </div>
      </div>
    </article>
  );
}
