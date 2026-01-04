import { Star, CheckCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TreatmentCardProps {
  image: string;
  location: string;
  name: string;
  verified: boolean;
  rating: number;
  reviews: number;
  tags: string[];
  description: string;
  price: string;
  hasInsurance: boolean;
  phone: string;
}

export function TreatmentCard({
  image,
  location,
  name,
  verified,
  rating,
  reviews,
  tags,
  description,
  price,
  hasInsurance,
  phone,
}: TreatmentCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3">
          <Badge className="bg-foreground/80 text-white text-xs">
            📍 {location}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name & Verified */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground flex items-center gap-1">
            {name}
            {verified && (
              <CheckCircle className="h-4 w-4 text-accent fill-accent stroke-white" />
            )}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded">
            <Star className="h-3 w-3 text-accent fill-accent" />
            <span className="text-sm font-medium text-accent">{rating}</span>
          </div>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(rating)
                    ? "text-primary fill-primary"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({reviews})</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs font-normal"
            >
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-foreground">{price}</span>
            {hasInsurance && (
              <span className="text-accent flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Insurance
              </span>
            )}
          </div>
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-3 w-3" />
            {phone}
          </a>
        </div>
      </div>
    </div>
  );
}
