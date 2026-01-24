import { MapPin, Star, Phone, DollarSign, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface TreatmentCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  state_name?: string;
  state_id: string;
  zip_code: string;
  phone: string;
  website?: string;
  rating: number;
  reviews_count: number;
  is_verified: boolean;
  is_featured: boolean;
  treatment_types: string[];
  services: string[];
  insurance_accepted: string[];
  image_url?: string;
}

interface DynamicFeaturedCentersProps {
  centers: TreatmentCenter[];
  isLoading: boolean;
}

export function DynamicFeaturedCenters({ centers, isLoading }: DynamicFeaturedCentersProps) {
  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30" data-testid="featured-centers-loading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Skeleton className="h-4 w-32 mx-auto mb-2" />
            <Skeleton className="h-10 w-80 mx-auto mb-4" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl border overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!centers || centers.length === 0) {
    return (
      <section className="py-16 bg-muted/30" data-testid="featured-centers-empty">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-primary font-medium mb-2">Featured Centers</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Start With The Top Centers
            </h2>
            <p className="text-muted-foreground">
              Quality verified treatment facilities across the nation.
            </p>
          </div>
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Featured centers coming soon</p>
          </div>
        </div>
      </section>
    );
  }

  // Default image for centers without images
  const defaultImages = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=250&fit=crop",
  ];

  return (
    <section className="py-16 bg-muted/30" data-testid="featured-centers-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-primary font-medium mb-2">Featured Centers</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Start With The Top Centers
          </h2>
          <p className="text-muted-foreground">
            Quality verified treatment facilities across the nation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {centers.slice(0, 8).map((center, index) => (
            <Link
              key={center.id}
              to={`/rehab-centers/${center.id}`}
              className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              data-testid={`featured-center-${index}`}
            >
              {/* Image */}
              <div className="relative h-40">
                <img
                  src={center.image_url || defaultImages[index % defaultImages.length]}
                  alt={center.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {center.is_featured && (
                  <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Location */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  {center.city}, {center.state}
                </div>

                {/* Name & Verified */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {center.name}
                  </h3>
                  {center.is_verified && (
                    <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 text-sm mb-3">
                  <span className="text-green-600 font-medium">G</span>
                  <span className="font-medium">{center.rating?.toFixed(1) || "N/A"}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < Math.floor(center.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">({center.reviews_count || 0})</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {center.treatment_types?.slice(0, 3).map((type) => (
                    <Badge key={type} variant="outline" className="text-xs px-2 py-0">
                      {type}
                    </Badge>
                  ))}
                  {center.treatment_types?.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      +{center.treatment_types.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                  <span className={center.insurance_accepted?.length > 0 ? "text-green-600" : ""}>
                    {center.insurance_accepted?.length > 0 ? "Insurance Accepted" : "Call for pricing"}
                  </span>
                  {center.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span className="truncate max-w-[100px]">{center.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link
            to="/rehab-centers"
            className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
            data-testid="view-all-centers-btn"
          >
            View All Treatment Centers
          </Link>
        </div>
      </div>
    </section>
  );
}
