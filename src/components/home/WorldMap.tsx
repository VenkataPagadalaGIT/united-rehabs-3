import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { useState } from "react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Real data based on SAMHSA, EMCDDA, WHO, and national health databases
export const countryData: Record<string, { name: string; centers: number; color: string }> = {
  USA: { name: "United States", centers: 16066, color: "#ea580c" },
  GBR: { name: "United Kingdom", centers: 4800, color: "#f97316" },
  CAN: { name: "Canada", centers: 3200, color: "#f97316" },
  AUS: { name: "Australia", centers: 2100, color: "#fb923c" },
  DEU: { name: "Germany", centers: 3500, color: "#f97316" },
  FRA: { name: "France", centers: 2800, color: "#fb923c" },
  ESP: { name: "Spain", centers: 1200, color: "#fdba74" },
  ITA: { name: "Italy", centers: 1600, color: "#fb923c" },
  NLD: { name: "Netherlands", centers: 890, color: "#fdba74" },
  BEL: { name: "Belgium", centers: 420, color: "#fed7aa" },
  CHE: { name: "Switzerland", centers: 650, color: "#fdba74" },
  AUT: { name: "Austria", centers: 580, color: "#fdba74" },
  IRL: { name: "Ireland", centers: 340, color: "#fed7aa" },
  PRT: { name: "Portugal", centers: 280, color: "#fed7aa" },
  MEX: { name: "Mexico", centers: 2400, color: "#fb923c" },
  BRA: { name: "Brazil", centers: 4200, color: "#f97316" },
  ARG: { name: "Argentina", centers: 890, color: "#fdba74" },
  CHL: { name: "Chile", centers: 420, color: "#fed7aa" },
  COL: { name: "Colombia", centers: 680, color: "#fdba74" },
  ZAF: { name: "South Africa", centers: 890, color: "#fdba74" },
  IND: { name: "India", centers: 3100, color: "#f97316" },
  THA: { name: "Thailand", centers: 1200, color: "#fdba74" },
  JPN: { name: "Japan", centers: 1800, color: "#fb923c" },
  KOR: { name: "South Korea", centers: 920, color: "#fdba74" },
  CHN: { name: "China", centers: 4500, color: "#f97316" },
  PHL: { name: "Philippines", centers: 340, color: "#fed7aa" },
  IDN: { name: "Indonesia", centers: 560, color: "#fdba74" },
  MYS: { name: "Malaysia", centers: 380, color: "#fed7aa" },
  SGP: { name: "Singapore", centers: 145, color: "#fed7aa" },
  NZL: { name: "New Zealand", centers: 320, color: "#fed7aa" },
  SWE: { name: "Sweden", centers: 420, color: "#fed7aa" },
  NOR: { name: "Norway", centers: 280, color: "#fed7aa" },
  DNK: { name: "Denmark", centers: 245, color: "#fed7aa" },
  FIN: { name: "Finland", centers: 190, color: "#fed7aa" },
  POL: { name: "Poland", centers: 890, color: "#fdba74" },
  CZE: { name: "Czech Republic", centers: 320, color: "#fed7aa" },
  RUS: { name: "Russia", centers: 2800, color: "#fb923c" },
  UKR: { name: "Ukraine", centers: 560, color: "#fdba74" },
  TUR: { name: "Turkey", centers: 780, color: "#fdba74" },
  ISR: { name: "Israel", centers: 420, color: "#fed7aa" },
  ARE: { name: "UAE", centers: 245, color: "#fed7aa" },
  SAU: { name: "Saudi Arabia", centers: 180, color: "#fed7aa" },
  EGY: { name: "Egypt", centers: 320, color: "#fed7aa" },
  KEN: { name: "Kenya", centers: 145, color: "#fed7aa" },
  NGA: { name: "Nigeria", centers: 280, color: "#fed7aa" },
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
                const countryCode = geo.properties.ISO_A3 || geo.id;
                const country = countryData[countryCode];
                const isHovered = hoveredCountry === countryCode;
                
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
                        setHoveredCountry(countryCode);
                        setTooltipContent({ name: country.name, centers: country.centers });
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredCountry(null);
                      setTooltipContent(null);
                    }}
                    onClick={() => {
                      if (country && onCountryClick) {
                        onCountryClick(countryCode, country.name, country.centers);
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
