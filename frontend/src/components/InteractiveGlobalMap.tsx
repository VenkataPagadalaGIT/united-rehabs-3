import { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { useTranslation } from "react-i18next";
import { ALL_COUNTRIES, getCountryByCode } from "@/data/countryConfig";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map ISO A3 codes from TopoJSON to our country codes
const countryCodeMap: Record<string, string> = {
  "USA": "USA", "GBR": "GBR", "DEU": "DEU", "FRA": "FRA", "ITA": "ITA",
  "ESP": "ESP", "CAN": "CAN", "AUS": "AUS", "BRA": "BRA", "MEX": "MEX",
  "JPN": "JPN", "CHN": "CHN", "IND": "IND", "RUS": "RUS", "ZAF": "ZAF",
  "NGA": "NGA", "EGY": "EGY", "KEN": "KEN", "THA": "THA", "VNM": "VNM",
  "IDN": "IDN", "PHL": "PHL", "PAK": "PAK", "BGD": "BGD", "TUR": "TUR",
  "IRN": "IRN", "SAU": "SAU", "ARE": "ARE", "POL": "POL", "UKR": "UKR",
  "NLD": "NLD", "BEL": "BEL", "SWE": "SWE", "NOR": "NOR", "DNK": "DNK",
  "FIN": "FIN", "CHE": "CHE", "AUT": "AUT", "PRT": "PRT", "GRC": "GRC",
  "CZE": "CZE", "HUN": "HUN", "ROU": "ROU", "BGR": "BGR", "SRB": "SRB",
  "HRV": "HRV", "ARG": "ARG", "CHL": "CHL", "COL": "COL", "PER": "PER",
  "VEN": "VEN", "ECU": "ECU", "NZL": "NZL", "MYS": "MYS", "SGP": "SGP",
  "KOR": "KOR", "TWN": "TWN", "HKG": "HKG", "ISR": "ISR", "JOR": "JOR",
  "LBN": "LBN", "IRQ": "IRQ", "AFG": "AFG", "MMR": "MMR", "KHM": "KHM",
  "LAO": "LAO", "NPL": "NPL", "LKA": "LKA", "ETH": "ETH", "TZA": "TZA",
  "UGA": "UGA", "GHA": "GHA", "CIV": "CIV", "SEN": "SEN", "CMR": "CMR",
  "COD": "COD", "AGO": "AGO", "MOZ": "MOZ", "ZMB": "ZMB", "ZWE": "ZWE",
  "BWA": "BWA", "NAM": "NAM", "MAR": "MAR", "DZA": "DZA", "TUN": "TUN",
  "LBY": "LBY", "SDN": "SDN", "KAZ": "KAZ", "UZB": "UZB", "TKM": "TKM",
  "KGZ": "KGZ", "TJK": "TJK", "MNG": "MNG", "PRK": "PRK",
};

// Region colors
const regionColors: Record<string, string> = {
  "Europe": "#60a5fa",
  "Asia": "#f472b6",
  "Africa": "#fbbf24",
  "North America": "#34d399",
  "South America": "#a78bfa",
  "Oceania": "#22d3d8",
};

interface InteractiveGlobalMapProps {
  height?: number;
  showLegend?: boolean;
  className?: string;
}

function InteractiveGlobalMapComponent({ 
  height = 400, 
  showLegend = true,
  className = "" 
}: InteractiveGlobalMapProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<{ name: string; flag: string; region: string } | null>(null);

  const handleCountryClick = (countryCode: string) => {
    console.log('Country clicked:', countryCode);
    const country = getCountryByCode(countryCode);
    console.log('Country found:', country);
    if (country) {
      console.log('Navigating to:', `/${country.slug}-addiction-rehabs`);
      navigate(`/${country.slug}-addiction-rehabs`);
    }
  };

  const getCountryColor = (geo: any) => {
    const isoA3 = geo.properties?.ISO_A3 || geo.id;
    const countryCode = countryCodeMap[isoA3] || isoA3;
    const country = ALL_COUNTRIES.find(c => c.code === countryCode);
    
    if (!country) return "#374151"; // Default gray for unmapped countries
    
    if (hoveredCountry === countryCode) {
      return "#f97316"; // Orange highlight on hover
    }
    
    return regionColors[country.region] || "#6b7280";
  };

  return (
    <div className={`relative ${className}`} data-testid="interactive-global-map">
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147,
        }}
        style={{ width: "100%", height }}
      >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isoA3 = geo.properties?.ISO_A3 || geo.id;
                const countryCode = countryCodeMap[isoA3] || isoA3;
                const country = ALL_COUNTRIES.find(c => c.code === countryCode);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(geo)}
                    stroke="#1f2937"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none", cursor: country ? "pointer" : "default" },
                      hover: { outline: "none", fill: country ? "#f97316" : "#4b5563" },
                      pressed: { outline: "none" },
                    }}
                    onClick={() => country && handleCountryClick(country.code)}
                    onMouseEnter={() => {
                      if (country) {
                        setHoveredCountry(country.code);
                        setTooltipContent({
                          name: country.name,
                          flag: country.flag,
                          region: country.region,
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredCountry(null);
                      setTooltipContent(null);
                    }}
                  />
                );
              })
            }
          </Geographies>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div 
          className="absolute top-4 left-4 bg-card border rounded-lg shadow-lg px-3 py-2 pointer-events-none z-10"
          data-testid="map-tooltip"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{tooltipContent.flag}</span>
            <div>
              <p className="font-semibold text-foreground">{tooltipContent.name}</p>
              <p className="text-xs text-muted-foreground">{tooltipContent.region}</p>
            </div>
          </div>
          <p className="text-xs text-primary mt-1">{t('common.viewAll')} →</p>
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur border rounded-lg px-3 py-2">
          <p className="text-xs font-medium text-foreground mb-2">{t('regions.europe')}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(regionColors).map(([region, color]) => (
              <div key={region} className="flex items-center gap-1.5">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-muted-foreground">{region}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const InteractiveGlobalMap = memo(InteractiveGlobalMapComponent);
