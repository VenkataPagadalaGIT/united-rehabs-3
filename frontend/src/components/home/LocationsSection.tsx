import { Search, SlidersHorizontal, MapPin, Globe, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { WorldMap } from "./WorldMap";

interface StateCount {
  state_id: string;
  state_name: string;
  total_treatment_centers: number;
}

interface LocationsSectionProps {
  stateCounts?: StateCount[];
  isLoading?: boolean;
}

// Helper to convert state name to slug
const toSlug = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-');
};

export function LocationsSection({ stateCounts, isLoading }: LocationsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMap, setShowMap] = useState(true);

  // Calculate total centers from backend data
  const totalCenters = useMemo(() => {
    if (!stateCounts || stateCounts.length === 0) return 14620; // Fallback
    return stateCounts.reduce((sum, state) => sum + (state.total_treatment_centers || 0), 0);
  }, [stateCounts]);

  // Transform backend data into locations format
  const locations = useMemo(() => {
    if (!stateCounts || stateCounts.length === 0) return [];
    return stateCounts
      .filter(state => state.state_name && state.total_treatment_centers > 0)
      .sort((a, b) => (b.total_treatment_centers || 0) - (a.total_treatment_centers || 0))
      .map(state => ({
        name: state.state_name,
        slug: toSlug(state.state_name),
        stateId: state.state_id,
        count: state.total_treatment_centers || 0,
      }));
  }, [stateCounts]);

  // Filter locations by search query
  const filteredLocations = useMemo(() => {
    if (!locations.length) return [];
    if (searchQuery) {
      return locations.filter(loc => 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return locations.slice(0, 16); // Show top 16 by default
  }, [locations, searchQuery]);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30" data-testid="locations-loading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Skeleton className="h-4 w-24 mx-auto mb-2" />
            <Skeleton className="h-10 w-80 mx-auto mb-4" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="p-4 rounded-xl border bg-card">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30" data-testid="locations-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-primary font-medium mb-2">Locations</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find A Best Centers Near You
          </h2>
          <p className="text-muted-foreground">
            Empowering Recovery with Accessible Resources • 
            <span className="font-semibold text-primary ml-1">
              {totalCenters.toLocaleString()}+
            </span> Centers Nationwide
          </p>
        </div>

        {/* World Map */}
        {showMap && (
          <div className="mb-8 bg-card rounded-xl border p-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">Treatment Center Locations</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowMap(false)}
                className="text-muted-foreground"
              >
                Hide Map
              </Button>
            </div>
            <WorldMap />
            <p className="text-xs text-center text-muted-foreground mt-2">
              Data from verified treatment facilities across all 50 states + DC
            </p>
          </div>
        )}

        {!showMap && (
          <div className="text-center mb-6">
            <Button variant="outline" size="sm" onClick={() => setShowMap(true)}>
              <Globe className="h-4 w-4 mr-2" />
              Show Map
            </Button>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center bg-background rounded-lg border shadow-sm max-w-xl mx-auto mb-10">
          <div className="flex-1 flex items-center px-4">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <Input 
              type="text"
              placeholder="Search state..."
              className="border-0 shadow-none focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="location-search-input"
            />
          </div>
          <Button className="m-1 bg-primary hover:bg-primary/90">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* Location Grid */}
        {filteredLocations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {filteredLocations.map((location, index) => (
              <Link
                key={`${location.stateId}-${index}`}
                to={`/${location.slug}-addiction-rehabs`}
                className="group p-4 rounded-xl border bg-card hover:shadow-lg hover:border-primary/50 transition-all"
                data-testid={`location-card-${location.stateId}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {location.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {location.count.toLocaleString()} centers
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground max-w-4xl mx-auto">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{searchQuery ? `No states found matching "${searchQuery}"` : "Loading locations..."}</p>
          </div>
        )}

        {locations.length > 16 && !searchQuery && (
          <div className="text-center mt-8">
            <Link 
              to="/states"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
              data-testid="view-all-states-btn"
            >
              View All {locations.length} States
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
