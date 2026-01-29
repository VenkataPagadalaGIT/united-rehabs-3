import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Globe, MapPin } from "lucide-react";
import { ALL_STATES, type StateBasicConfig } from "@/data/allStates";
import { COUNTRIES_BY_REGION, getTopCountriesByRegion } from "@/data/countryConfig";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Region = "northeast" | "southeast" | "midwest" | "southwest" | "west";

const REGIONS: { id: Region; name: string }[] = [
  { id: "northeast", name: "Northeast" },
  { id: "southeast", name: "Southeast" },
  { id: "midwest", name: "Midwest" },
  { id: "southwest", name: "Southwest" },
  { id: "west", name: "West" },
];

// Group states by region
function getStatesByRegion(): Record<Region, StateBasicConfig[]> {
  return ALL_STATES.reduce((acc, state) => {
    if (!acc[state.region]) acc[state.region] = [];
    acc[state.region].push(state);
    return acc;
  }, {} as Record<Region, StateBasicConfig[]>);
}

// International regions with actual country data
const INTERNATIONAL_REGIONS = [
  { id: "europe", name: "Europe", emoji: "🇪🇺" },
  { id: "asia", name: "Asia", emoji: "🌏" },
  { id: "northamerica", name: "North America", emoji: "🌎" },
  { id: "southamerica", name: "South America", emoji: "🌎" },
  { id: "oceania", name: "Oceania", emoji: "🌏" },
  { id: "africa", name: "Africa", emoji: "🌍" },
];

interface LocationsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export function LocationsMegaMenu({ isOpen, onClose, isMobile = false }: LocationsMegaMenuProps) {
  const [activeTab, setActiveTab] = useState<"us" | "international">("us");
  const [activeRegion, setActiveRegion] = useState<Region>("northeast");
  const [activeInternationalRegion, setActiveInternationalRegion] = useState<string>("Europe");
  const statesByRegion = getStatesByRegion();

  if (!isOpen) return null;

  // Mobile version with accordions
  if (isMobile) {
    return (
      <div className="bg-card border-t border-border">
        {/* Mobile Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("us")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === "us"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            <MapPin className="h-4 w-4" />
            United States
          </button>
          <button
            onClick={() => setActiveTab("international")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === "international"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            <Globe className="h-4 w-4" />
            International
          </button>
        </div>

        {activeTab === "us" ? (
          <Accordion type="single" collapsible className="w-full">
            {REGIONS.map((region) => (
              <AccordionItem key={region.id} value={region.id} className="border-b border-border">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{region.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({statesByRegion[region.id]?.length || 0} states)
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="grid grid-cols-2 gap-1 px-4 pb-4">
                    {statesByRegion[region.id]?.map((state) => (
                      <Link
                        key={state.id}
                        to={`/${state.slug}-addiction-rehabs`}
                        onClick={onClose}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                      >
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {state.name}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="p-4 space-y-3">
            {INTERNATIONAL_REGIONS.map((region) => {
              const regionCountries = COUNTRIES_BY_REGION[region.name] || [];
              const topCountries = getTopCountriesByRegion(region.name, 6);
              return (
                <Accordion type="single" collapsible key={region.id}>
                  <AccordionItem value={region.id} className="border-none">
                    <AccordionTrigger className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span>{region.emoji}</span>
                        <span className="font-medium">{region.name}</span>
                        <span className="text-xs text-muted-foreground">({regionCountries.length})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pl-4">
                      <div className="space-y-1">
                        {topCountries.map((country) => (
                          <Link
                            key={country.code}
                            to={`/${country.slug}-addiction-rehabs`}
                            onClick={onClose}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                          >
                            <span className="text-base">{country.flag}</span>
                            {country.name}
                          </Link>
                        ))}
                        {regionCountries.length > 6 && (
                          <p className="text-xs text-primary px-3 py-1">
                            +{regionCountries.length - 6} more countries
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Desktop version (original)
  return (
    <div 
      className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-xl z-50"
      onMouseLeave={onClose}
    >
      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-6 mb-6 border-b border-border pb-4">
          <button
            onClick={() => setActiveTab("us")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "us"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <MapPin className="h-4 w-4" />
            United States
          </button>
          <button
            onClick={() => setActiveTab("international")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "international"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Globe className="h-4 w-4" />
            International
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              195 Countries
            </span>
          </button>
        </div>

        {activeTab === "us" ? (
          <div className="flex gap-8">
            {/* Region Sidebar */}
            <div className="w-48 flex-shrink-0">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Regions
              </h3>
              <nav className="space-y-1">
                {REGIONS.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => setActiveRegion(region.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeRegion === region.id
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {region.name}
                    <ChevronRight className={`h-4 w-4 transition-transform ${
                      activeRegion === region.id ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </button>
                ))}
              </nav>
            </div>

            {/* States Grid */}
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {REGIONS.find(r => r.id === activeRegion)?.name} States
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {statesByRegion[activeRegion]?.map((state) => (
                  <Link
                    key={state.id}
                    to={`/${state.slug}-addiction-rehabs`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {state.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-8">
            {/* Region Sidebar */}
            <div className="w-48 flex-shrink-0">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Regions
              </h3>
              <nav className="space-y-1">
                {INTERNATIONAL_REGIONS.map((region) => {
                  const regionCountries = COUNTRIES_BY_REGION[region.name] || [];
                  return (
                    <button
                      key={region.id}
                      onClick={() => setActiveInternationalRegion(region.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeInternationalRegion === region.name
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{region.emoji}</span>
                        {region.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{regionCountries.length}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Countries Grid */}
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {activeInternationalRegion} Countries
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {(COUNTRIES_BY_REGION[activeInternationalRegion] || []).slice(0, 16).map((country) => (
                  <Link
                    key={country.code}
                    to={`/${country.slug}-addiction-rehabs`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <span className="text-base">{country.flag}</span>
                    {country.name}
                  </Link>
                ))}
              </div>
              {(COUNTRIES_BY_REGION[activeInternationalRegion] || []).length > 16 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  +{(COUNTRIES_BY_REGION[activeInternationalRegion] || []).length - 16} more countries available
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
