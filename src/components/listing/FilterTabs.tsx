import { ChevronDown } from "lucide-react";
import { useState } from "react";

const filters = [
  { label: "California", active: true },
  { label: "Conditions", hasDropdown: true },
  { label: "Insurance", hasDropdown: true },
  { label: "Therapies", hasDropdown: true },
  { label: "Care", hasDropdown: true },
  { label: "Approaches", hasDropdown: true },
  { label: "Amenities", hasDropdown: true },
  { label: "Prices", hasDropdown: true },
];

export function FilterTabs() {
  const [activeFilter, setActiveFilter] = useState("California");

  return (
    <div className="flex flex-wrap gap-2 py-6">
      {filters.map((filter) => (
        <button
          key={filter.label}
          onClick={() => setActiveFilter(filter.label)}
          className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter.label === activeFilter
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          {filter.label}
          {filter.hasDropdown && <ChevronDown className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
}
