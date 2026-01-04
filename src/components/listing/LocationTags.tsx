import type { City } from "@/types";

interface LocationTagsProps {
  cities: City[];
  activeCityId?: string;
  onCityClick: (cityId: string) => void;
}

const cityColors: Record<number, string> = {
  0: "bg-gray-800 hover:bg-gray-700",
  1: "bg-gray-700 hover:bg-gray-600",
  2: "bg-gray-600 hover:bg-gray-500",
  3: "bg-gray-500 hover:bg-gray-400",
  4: "bg-primary hover:bg-primary/90",
  5: "bg-accent hover:bg-accent/90",
};

export function LocationTags({ cities, activeCityId, onCityClick }: LocationTagsProps) {
  return (
    <div className="py-6">
      <h3 className="text-primary text-sm font-medium mb-4">Top Treatment Locations</h3>
      <div className="flex flex-wrap gap-3">
        {cities.map((city, index) => (
          <button
            key={city.id}
            onClick={() => onCityClick(city.id)}
            className={`${
              activeCityId === city.id
                ? "ring-2 ring-primary ring-offset-2"
                : ""
            } ${cityColors[index] || "bg-gray-600 hover:bg-gray-500"} text-white px-4 py-2 rounded-full text-sm font-medium transition-all`}
          >
            {city.name}
          </button>
        ))}
      </div>
    </div>
  );
}
