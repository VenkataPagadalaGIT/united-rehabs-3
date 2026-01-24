import { MapPin, Star, Phone, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const featuredCenters = [
  {
    id: 1,
    name: "Vanity Wellness Center",
    location: "Woodland Hills, California, USA",
    rating: 5.0,
    reviews: 97,
    verified: true,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop",
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    price: "$$",
    insurance: true,
    phone: "(732) 365-4316",
  },
  {
    id: 2,
    name: "California Behavioral Health",
    location: "Woodland Hills, California, USA",
    rating: 5.0,
    reviews: 97,
    verified: true,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop",
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    price: "$$",
    insurance: true,
    phone: "(732) 365-4316",
  },
  {
    id: 3,
    name: "Tarzana Recovery Center",
    location: "Woodland Hills, California, USA",
    rating: 5.0,
    reviews: 97,
    verified: true,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop",
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    price: "$$",
    insurance: true,
    phone: "(732) 365-4316",
  },
  {
    id: 4,
    name: "Bliss Recovery",
    location: "Woodland Hills, California, USA",
    rating: 5.0,
    reviews: 97,
    verified: true,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=250&fit=crop",
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    price: "$$",
    insurance: true,
    phone: "(732) 365-4316",
  },
];

export function FeaturedCenters() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-primary font-medium mb-2">Featured Centers</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Start With The Top Centers
          </h2>
          <p className="text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCenters.map((center) => (
            <div
              key={center.id}
              className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-40">
                <img
                  src={center.image}
                  alt={center.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Location */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  {center.location}
                </div>

                {/* Name & Verified */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground truncate">{center.name}</h3>
                  {center.verified && (
                    <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 text-sm mb-3">
                  <span className="text-green-600 font-medium">G</span>
                  <span className="font-medium">{center.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-muted-foreground">({center.reviews})</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {center.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {center.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      +{center.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span className="font-medium text-foreground">{center.price}</span>
                    <span className="text-muted-foreground/50">$$</span>
                  </div>
                  <span>Insurance</span>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {center.phone}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
