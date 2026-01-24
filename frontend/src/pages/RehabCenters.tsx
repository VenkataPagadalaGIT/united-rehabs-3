import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { treatmentCentersApi, TreatmentCenter, TreatmentCenterFilters } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Phone, 
  Star, 
  Globe, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Building2,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";

const ITEMS_PER_PAGE = 12;

// Country codes to names mapping
const COUNTRY_NAMES: Record<string, string> = {
  USA: "United States",
  GBR: "United Kingdom",
  CAN: "Canada",
  AUS: "Australia",
  DEU: "Germany",
  FRA: "France",
  BRA: "Brazil",
  MEX: "Mexico",
  THA: "Thailand",
  ESP: "Spain",
  NLD: "Netherlands",
  ZAF: "South Africa",
};

const RehabCenters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Build filters
  const filters: TreatmentCenterFilters = {
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    limit: ITEMS_PER_PAGE,
  };
  
  if (searchQuery) filters.q = searchQuery;
  if (selectedCountry && selectedCountry !== "all") filters.country_code = selectedCountry;
  if (selectedType && selectedType !== "all") filters.treatment_type = selectedType;

  // Fetch treatment centers
  const { data, isLoading, error } = useQuery({
    queryKey: ["treatment-centers", filters],
    queryFn: () => treatmentCentersApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });

  const centers = data?.centers || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const availableCountries = data?.filters?.countries || [];
  const availableTypes = data?.filters?.treatment_types || [];

  // Default images for centers without photos
  const defaultImages = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=250&fit=crop",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const renderCenterCard = (center: TreatmentCenter, index: number) => (
    <div
      key={center.id}
      className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all group"
      data-testid={`center-card-${index}`}
    >
      {/* Image */}
      <div className="relative h-48">
        <img
          src={center.image_url || defaultImages[index % defaultImages.length]}
          alt={center.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {center.is_featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
        <div className="absolute top-3 right-3 bg-background/90 rounded-full px-2 py-1 flex items-center gap-1 text-sm">
          <Globe className="h-3 w-3" />
          {center.country_code}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="h-3 w-3" />
          {center.city}, {center.state_name || center.country_name}
        </div>

        {/* Name & Verified */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {center.name}
          </h3>
          {center.is_verified && (
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm mb-3">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{center.rating?.toFixed(1) || "N/A"}</span>
          <span className="text-muted-foreground">({center.reviews_count || 0} reviews)</span>
        </div>

        {/* Treatment Types */}
        <div className="flex flex-wrap gap-1 mb-4">
          {center.treatment_types?.slice(0, 3).map((type) => (
            <Badge key={type} variant="outline" className="text-xs">
              {type}
            </Badge>
          ))}
          {(center.treatment_types?.length || 0) > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{(center.treatment_types?.length || 0) - 3}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          {center.phone && (
            <a 
              href={`tel:${center.phone}`} 
              className="flex items-center gap-1 hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="h-3 w-3" />
              {center.phone}
            </a>
          )}
          <Link
            to={`/rehab-centers/${center.id}`}
            className="text-primary font-medium hover:underline"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background" data-testid="rehab-centers-page">
      <Header navItems={mockNavItems} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find Treatment Centers Worldwide
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse verified addiction treatment facilities across {availableCountries.length || 20}+ countries. 
              Filter by location, treatment type, and more to find the right care for you.
            </p>
          </div>

          {/* Search & Filters */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by center name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                  data-testid="search-input"
                />
              </div>

              {/* Country Filter */}
              <Select value={selectedCountry} onValueChange={(v) => { setSelectedCountry(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-full md:w-48 h-12" data-testid="country-filter">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {availableCountries.map((code) => (
                    <SelectItem key={code} value={code}>
                      {COUNTRY_NAMES[code] || code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Treatment Type Filter */}
              <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-full md:w-48 h-12" data-testid="type-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Treatment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {availableTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit" className="h-12 px-8">
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-5 w-40" />
              ) : (
                <>
                  Showing <span className="font-semibold text-foreground">{centers.length}</span> of{" "}
                  <span className="font-semibold text-foreground">{total}</span> treatment centers
                </>
              )}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl border overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load treatment centers. Please try again.</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && centers.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No centers found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search filters to find more results.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCountry("all");
                  setSelectedType("all");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Results Grid */}
          {!isLoading && !error && centers.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {centers.map((center, index) => renderCenterCard(center, index))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    data-testid="prev-page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          data-testid={`page-${pageNum}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    data-testid="next-page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
};

export default RehabCenters;
