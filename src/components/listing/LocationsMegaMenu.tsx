import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Globe, MapPin } from "lucide-react";
import { ALL_STATES, type StateBasicConfig } from "@/data/allStates";

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

// Future international regions placeholder
const INTERNATIONAL_REGIONS = [
  { id: "europe", name: "Europe", count: 24, comingSoon: true },
  { id: "asia", name: "Asia Pacific", count: 18, comingSoon: true },
  { id: "latam", name: "Latin America", count: 12, comingSoon: true },
  { id: "canada", name: "Canada", count: 13, comingSoon: true },
  { id: "middleeast", name: "Middle East", count: 8, comingSoon: true },
];

interface LocationsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocationsMegaMenu({ isOpen, onClose }: LocationsMegaMenuProps) {
  const [activeTab, setActiveTab] = useState<"us" | "international">("us");
  const [activeRegion, setActiveRegion] = useState<Region>("northeast");
  const statesByRegion = getStatesByRegion();

  if (!isOpen) return null;

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
            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
              Coming Soon
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
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {statesByRegion[activeRegion]?.sort((a, b) => a.name.localeCompare(b.name)).map((state) => (
                  <Link
                    key={state.id}
                    to={`/${state.slug}-addiction-rehabs`}
                    onClick={onClose}
                    className="group flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <span className="font-medium text-xs text-muted-foreground group-hover:text-primary w-6">
                      {state.abbreviation}
                    </span>
                    <span className="truncate">{state.name}</span>
                  </Link>
                ))}
              </div>
              
              {/* Quick Stats */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-8 text-sm text-muted-foreground">
                  <span><strong className="text-foreground">50</strong> States</span>
                  <span><strong className="text-foreground">15,000+</strong> Treatment Centers</span>
                  <Link 
                    to="/locations" 
                    onClick={onClose}
                    className="text-primary hover:underline ml-auto"
                  >
                    View All Locations →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* International View */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {INTERNATIONAL_REGIONS.map((region) => (
              <div
                key={region.id}
                className="relative p-4 rounded-xl border border-border bg-muted/30 opacity-70"
              >
                <div className="flex items-center justify-between mb-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    Soon
                  </span>
                </div>
                <h4 className="font-semibold text-foreground">{region.name}</h4>
                <p className="text-sm text-muted-foreground">{region.count} Countries</p>
              </div>
            ))}
            
            {/* Notify CTA */}
            <div className="col-span-full mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                We're expanding to <strong className="text-foreground">100+ countries</strong> worldwide
              </p>
              <button className="text-sm font-medium text-primary hover:underline">
                Get notified when we launch in your region →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
