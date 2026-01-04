import { Star, CheckCircle } from "lucide-react";

const relatedRehabs = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop",
    location: "Woodland Hills, California, USA",
    name: "Vanity Wellness Center",
    verified: true,
    rating: 5.0,
    reviews: 97,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop",
    location: "Woodland Hills, California, USA",
    name: "Vanity Wellness Center",
    verified: true,
    rating: 5.0,
    reviews: 97,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=250&fit=crop",
    location: "Woodland Hills, California, USA",
    name: "Vanity Wellness Center",
    verified: true,
    rating: 5.0,
    reviews: 97,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=250&fit=crop",
    location: "Woodland Hills, California, USA",
    name: "Vanity Wellness Center",
    verified: true,
    rating: 5.0,
    reviews: 97,
  },
];

export function RelatedRehabs() {
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
          {relatedRehabs.map((rehab) => (
            <div
              key={rehab.id}
              className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-40">
                <img
                  src={rehab.image}
                  alt={rehab.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  📍 {rehab.location}
                </p>
                <h3 className="font-semibold text-foreground flex items-center gap-1">
                  {rehab.name}
                  {rehab.verified && (
                    <CheckCircle className="h-4 w-4 text-accent fill-accent stroke-white" />
                  )}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded">
                    <Star className="h-3 w-3 text-accent fill-accent" />
                    <span className="text-sm font-medium text-accent">
                      {rehab.rating}
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
                    ({rehab.reviews})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
