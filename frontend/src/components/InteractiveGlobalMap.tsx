import { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { useTranslation } from "react-i18next";
import { ALL_COUNTRIES, getCountryByCode } from "@/data/countryConfig";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map ISO numeric codes (from TopoJSON) to ISO 3166-1 alpha-3 codes
const isoNumericToAlpha3: Record<string, string> = {
  "840": "USA", "826": "GBR", "276": "DEU", "250": "FRA", "380": "ITA",
  "724": "ESP", "124": "CAN", "036": "AUS", "076": "BRA", "484": "MEX",
  "392": "JPN", "156": "CHN", "356": "IND", "643": "RUS", "710": "ZAF",
  "566": "NGA", "818": "EGY", "404": "KEN", "764": "THA", "704": "VNM",
  "360": "IDN", "608": "PHL", "586": "PAK", "050": "BGD", "792": "TUR",
  "364": "IRN", "682": "SAU", "784": "ARE", "616": "POL", "804": "UKR",
  "528": "NLD", "056": "BEL", "752": "SWE", "578": "NOR", "208": "DNK",
  "246": "FIN", "756": "CHE", "040": "AUT", "620": "PRT", "300": "GRC",
  "203": "CZE", "348": "HUN", "642": "ROU", "100": "BGR", "688": "SRB",
  "191": "HRV", "032": "ARG", "152": "CHL", "170": "COL", "604": "PER",
  "862": "VEN", "218": "ECU", "554": "NZL", "458": "MYS", "702": "SGP",
  "410": "KOR", "158": "TWN", "344": "HKG", "376": "ISR", "400": "JOR",
  "422": "LBN", "368": "IRQ", "004": "AFG", "104": "MMR", "116": "KHM",
  "418": "LAO", "524": "NPL", "144": "LKA", "231": "ETH", "834": "TZA",
  "800": "UGA", "288": "GHA", "384": "CIV", "686": "SEN", "120": "CMR",
  "180": "COD", "024": "AGO", "508": "MOZ", "894": "ZMB", "716": "ZWE",
  "072": "BWA", "516": "NAM", "504": "MAR", "012": "DZA", "788": "TUN",
  "434": "LBY", "736": "SDN", "398": "KAZ", "860": "UZB", "795": "TKM",
  "417": "KGZ", "762": "TJK", "496": "MNG", "408": "PRK", "008": "ALB",
  "020": "AND", "051": "ARM", "031": "AZE", "112": "BLR", "070": "BIH",
  "196": "CYP", "233": "EST", "268": "GEO", "352": "ISL", "428": "LVA",
  "438": "LIE", "440": "LTU", "442": "LUX", "807": "MKD", "470": "MLT",
  "498": "MDA", "492": "MCO", "499": "MNE", "674": "SMR", "703": "SVK",
  "705": "SVN", "372": "IRL", "242": "FJI", "598": "PNG", "858": "URY",
  "600": "PRY", "068": "BOL", "328": "GUY", "740": "SUR", "332": "HTI",
  "214": "DOM", "192": "CUB", "388": "JAM", "780": "TTO", "044": "BHS",
  "052": "BRB", "084": "BLZ", "188": "CRI", "222": "SLV", "320": "GTM",
  "340": "HND", "558": "NIC", "591": "PAN", "140": "CAF", "148": "TCD",
  "178": "COG", "226": "GNQ", "266": "GAB", "174": "COM", "262": "DJI",
  "232": "ERI", "426": "LSO", "454": "MWI", "450": "MDG", "480": "MUS",
  "508": "MOZ", "638": "REU", "646": "RWA", "748": "SWZ", "768": "TGO",
  "028": "ATG", "060": "BMU", "092": "VGB", "136": "CYM", "212": "DMA",
  "308": "GRD", "312": "GLP", "474": "MTQ", "500": "MSR", "530": "ANT",
  "630": "PRI", "659": "KNA", "662": "LCA", "666": "SPM", "670": "VCT",
  "780": "TTO", "796": "TCA", "850": "VIR", "554": "NZL", "016": "ASM",
  "184": "COK", "242": "FJI", "296": "KIR", "584": "MHL", "583": "FSM",
  "520": "NRU", "540": "NCL", "570": "NIU", "574": "NFK", "580": "MNP",
  "585": "PLW", "258": "PYF", "882": "WSM", "090": "SLB", "776": "TON",
  "798": "TUV", "548": "VUT", "876": "WLF"
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
    const geoId = geo.id || geo.properties?.id;
    const countryCode = isoNumericToAlpha3[geoId] || null;
    const country = countryCode ? ALL_COUNTRIES.find(c => c.code === countryCode) : null;
    
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
                // TopoJSON uses numeric ISO codes as the ID
                const geoId = geo.id || geo.properties?.id;
                const countryCode = isoNumericToAlpha3[geoId] || null;
                const country = countryCode ? ALL_COUNTRIES.find(c => c.code === countryCode) : null;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(geo)}
                    stroke="#1f2937"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none", cursor: country ? "pointer" : "default", pointerEvents: "auto" },
                      hover: { outline: "none", fill: country ? "#f97316" : "#4b5563" },
                      pressed: { outline: "none" },
                    }}
                    onClick={() => {
                      console.log('Geography onClick fired for:', isoA3, countryCode);
                      if (country) {
                        handleCountryClick(country.code);
                      }
                    }}
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
