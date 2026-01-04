import { ChevronDown } from "lucide-react";
import type { FilterGroup, FilterCategory } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterTabsProps {
  filters: FilterGroup[];
  activeFilters: Record<FilterCategory, string[]>;
  onFilterChange: (category: FilterCategory, optionId: string) => void;
}

export function FilterTabs({ filters, activeFilters, onFilterChange }: FilterTabsProps) {
  const isActive = (category: FilterCategory) => {
    return activeFilters[category]?.length > 0;
  };

  return (
    <div className="flex flex-wrap gap-2 py-6">
      {filters.map((filter) => (
        <DropdownMenu key={filter.category}>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                isActive(filter.category)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary"
              }`}
            >
              {filter.label}
              {filter.hasDropdown && <ChevronDown className="h-4 w-4" />}
            </button>
          </DropdownMenuTrigger>
          {filter.hasDropdown && filter.options.length > 0 && (
            <DropdownMenuContent align="start" className="min-w-[200px]">
              {filter.options.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => onFilterChange(filter.category, option.id)}
                  className={`cursor-pointer ${
                    activeFilters[filter.category]?.includes(option.id)
                      ? "bg-primary/10 text-primary"
                      : ""
                  }`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      ))}
    </div>
  );
}
