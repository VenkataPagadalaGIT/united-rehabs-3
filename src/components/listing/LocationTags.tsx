const locations = [
  { name: "Orange County", color: "bg-gray-800" },
  { name: "San Diego", color: "bg-gray-700" },
  { name: "Palm Springs", color: "bg-gray-600" },
  { name: "Los Angeles", color: "bg-gray-500" },
  { name: "Bay Area", color: "bg-primary" },
  { name: "Beverly Hills", color: "bg-accent" },
];

export function LocationTags() {
  return (
    <div className="py-6">
      <h3 className="text-primary text-sm font-medium mb-4">Top Treatment Locations</h3>
      <div className="flex flex-wrap gap-3">
        {locations.map((location) => (
          <button
            key={location.name}
            className={`${location.color} text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity`}
          >
            {location.name}
          </button>
        ))}
      </div>
    </div>
  );
}
