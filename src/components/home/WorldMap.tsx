import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { useState } from "react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Country name to data mapping (matching the TopoJSON country names)
export const countryData: Record<string, { name: string; centers: number; color: string }> = {
  // North America
  "United States of America": { name: "United States", centers: 16066, color: "#ea580c" },
  "Canada": { name: "Canada", centers: 3200, color: "#f97316" },
  "Mexico": { name: "Mexico", centers: 2400, color: "#fb923c" },
  
  // South America
  "Brazil": { name: "Brazil", centers: 4200, color: "#f97316" },
  "Argentina": { name: "Argentina", centers: 890, color: "#fdba74" },
  "Chile": { name: "Chile", centers: 420, color: "#fed7aa" },
  "Colombia": { name: "Colombia", centers: 680, color: "#fdba74" },
  "Peru": { name: "Peru", centers: 340, color: "#fed7aa" },
  
  // Europe
  "United Kingdom": { name: "United Kingdom", centers: 4800, color: "#f97316" },
  "Germany": { name: "Germany", centers: 3500, color: "#f97316" },
  "France": { name: "France", centers: 2800, color: "#fb923c" },
  "Spain": { name: "Spain", centers: 1200, color: "#fdba74" },
  "Italy": { name: "Italy", centers: 1600, color: "#fb923c" },
  "Netherlands": { name: "Netherlands", centers: 890, color: "#fdba74" },
  "Belgium": { name: "Belgium", centers: 420, color: "#fed7aa" },
  "Switzerland": { name: "Switzerland", centers: 650, color: "#fdba74" },
  "Austria": { name: "Austria", centers: 580, color: "#fdba74" },
  "Ireland": { name: "Ireland", centers: 340, color: "#fed7aa" },
  "Portugal": { name: "Portugal", centers: 280, color: "#fed7aa" },
  "Sweden": { name: "Sweden", centers: 420, color: "#fed7aa" },
  "Norway": { name: "Norway", centers: 280, color: "#fed7aa" },
  "Denmark": { name: "Denmark", centers: 245, color: "#fed7aa" },
  "Finland": { name: "Finland", centers: 190, color: "#fed7aa" },
  "Poland": { name: "Poland", centers: 890, color: "#fdba74" },
  "Czech Republic": { name: "Czech Republic", centers: 320, color: "#fed7aa" },
  "Czechia": { name: "Czech Republic", centers: 320, color: "#fed7aa" },
  "Greece": { name: "Greece", centers: 280, color: "#fed7aa" },
  "Romania": { name: "Romania", centers: 245, color: "#fed7aa" },
  "Hungary": { name: "Hungary", centers: 198, color: "#fed7aa" },
  
  // Eastern Europe & Russia
  "Russia": { name: "Russia", centers: 2800, color: "#fb923c" },
  "Ukraine": { name: "Ukraine", centers: 560, color: "#fdba74" },
  "Turkey": { name: "Turkey", centers: 780, color: "#fdba74" },
  
  // Asia
  "China": { name: "China", centers: 4500, color: "#f97316" },
  "Japan": { name: "Japan", centers: 1800, color: "#fb923c" },
  "India": { name: "India", centers: 3100, color: "#f97316" },
  "South Korea": { name: "South Korea", centers: 920, color: "#fdba74" },
  "Thailand": { name: "Thailand", centers: 1200, color: "#fdba74" },
  "Philippines": { name: "Philippines", centers: 340, color: "#fed7aa" },
  "Indonesia": { name: "Indonesia", centers: 560, color: "#fdba74" },
  "Malaysia": { name: "Malaysia", centers: 380, color: "#fed7aa" },
  "Vietnam": { name: "Vietnam", centers: 290, color: "#fed7aa" },
  "Pakistan": { name: "Pakistan", centers: 420, color: "#fed7aa" },
  
  // Middle East
  "Israel": { name: "Israel", centers: 420, color: "#fed7aa" },
  "United Arab Emirates": { name: "UAE", centers: 245, color: "#fed7aa" },
  "Saudi Arabia": { name: "Saudi Arabia", centers: 180, color: "#fed7aa" },
  
  // Oceania
  "Australia": { name: "Australia", centers: 2100, color: "#fb923c" },
  "New Zealand": { name: "New Zealand", centers: 320, color: "#fed7aa" },
  
  // Africa
  "South Africa": { name: "South Africa", centers: 890, color: "#fdba74" },
  "Egypt": { name: "Egypt", centers: 320, color: "#fed7aa" },
  "Kenya": { name: "Kenya", centers: 145, color: "#fed7aa" },
  "Nigeria": { name: "Nigeria", centers: 280, color: "#fed7aa" },
  "Morocco": { name: "Morocco", centers: 198, color: "#fed7aa" },
};

interface WorldMapProps {
  onCountryClick?: (countryCode: string, countryName: string, centers: number) => void;
}

export function WorldMap({ onCountryClick }: WorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<{ name: string; centers: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="relative w-full" onMouseMove={handleMouseMove}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [0, 30],
        }}
        className="w-full h-[300px] md:h-[400px]"
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const country = countryData[countryName];
                const isHovered = hoveredCountry === countryName;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={country ? (isHovered ? "#ea580c" : country.color) : "#e5e7eb"}
                    stroke="#fff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", cursor: country ? "pointer" : "default" },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={() => {
                      if (country) {
                        setHoveredCountry(countryName);
                        setTooltipContent({ name: country.name, centers: country.centers });
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredCountry(null);
                      setTooltipContent(null);
                    }}
                    onClick={() => {
                      if (country && onCountryClick) {
                        onCountryClick(countryName, country.name, country.centers);
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div
          className="fixed z-50 bg-foreground text-background px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 40,
          }}
        >
          <p className="font-semibold">{tooltipContent.name}</p>
          <p className="text-xs opacity-80">{tooltipContent.centers.toLocaleString()} treatment centers</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#ea580c]"></div>
          <span>3,000+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#fb923c]"></div>
          <span>1,000-3,000</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#fdba74]"></div>
          <span>500-1,000</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#fed7aa]"></div>
          <span>&lt;500</span>
        </div>
      </div>
    </div>
  );
}
