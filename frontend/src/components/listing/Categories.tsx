const categories = [
  "Conditions",
  "Speciality",
  "Insurance",
  "Therapies",
  "Care",
  "Approaches",
  "Amenities",
  "Prices",
  "Activities",
  "Language",
  "Clientele",
  "Luxury",
  "Settings",
  "Special Considerations",
];

export function Categories() {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-foreground mb-8">
          Categories
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-full border border-border bg-card text-foreground text-sm font-medium hover:border-primary hover:text-primary transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
