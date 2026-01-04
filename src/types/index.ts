// ============================================
// United Rehabs - Data Types
// These types are designed to map directly to backend database schemas
// ============================================

// ============================================
// LOCATION TYPES
// ============================================

export interface State {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  population: number;
  medianAge: number;
  medianIncome: number;
  unemploymentRate: number;
  lifeExpectancy: number;
  obesityRate: number;
  bingeDrinkingRate: number;
  smokingRate: number;
  // Geographic coordinates for map centering
  latitude: number;
  longitude: number;
  flagImageUrl?: string;
  heroImages: GalleryImage[];
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  stateId: string;
  name: string;
  slug: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  type: "photo" | "map" | "infographic";
  order: number;
}

// ============================================
// FILTER TYPES
// ============================================

export type FilterCategory =
  | "state"
  | "conditions"
  | "insurance"
  | "therapies"
  | "care"
  | "approaches"
  | "amenities"
  | "prices"
  | "activities"
  | "language"
  | "clientele"
  | "luxury"
  | "settings"
  | "special_considerations";

export interface FilterOption {
  id: string;
  category: FilterCategory;
  label: string;
  slug: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FilterGroup {
  category: FilterCategory;
  label: string;
  hasDropdown: boolean;
  options: FilterOption[];
}

// ============================================
// TREATMENT CENTER TYPES
// ============================================

export interface TreatmentCenter {
  id: string;
  name: string;
  slug: string;
  verified: boolean;
  featured: boolean;
  
  // Location
  cityId: string;
  stateId: string;
  address: string;
  latitude?: number;
  longitude?: number;
  
  // Contact
  phone: string;
  email?: string;
  website?: string;
  
  // Media
  images: TreatmentCenterImage[];
  
  // Rating
  rating: number;
  reviewCount: number;
  
  // Pricing
  priceLevel: PriceLevel;
  acceptsInsurance: boolean;
  
  // Description
  shortDescription: string;
  fullDescription?: string;
  
  // Relations (many-to-many via junction tables)
  conditionIds: string[];
  insuranceIds: string[];
  therapyIds: string[];
  careTypeIds: string[];
  approachIds: string[];
  amenityIds: string[];
  activityIds: string[];
  languageIds: string[];
  clienteleIds: string[];
  settingIds: string[];
  
  // Meta
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentCenterImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export type PriceLevel = "$" | "$$" | "$$$" | "$$$$";

// ============================================
// FAQ TYPES
// ============================================

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  stateId?: string;
  categoryId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// HEALTH RESOURCE TYPES
// ============================================

export interface HealthResource {
  id: string;
  title: string;
  url: string;
  stateId?: string;
  type: "health_outcome" | "health_behavior" | "faq" | "general";
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatisticsCard {
  id: string;
  stateId: string;
  title: string;
  value: string;
  unit?: string;
  description: string;
  chartData?: ChartDataPoint[];
  date: string;
  sourceUrl?: string;
  order: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// ============================================
// NAVIGATION TYPES
// ============================================

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  hasDropdown: boolean;
  children?: NavItem[];
  order: number;
}

export interface Breadcrumb {
  label: string;
  href: string;
}

// ============================================
// FOOTER TYPES
// ============================================

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface FooterLink {
  label: string;
  href: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListingPageData {
  state: State;
  cities: City[];
  filters: FilterGroup[];
  treatmentCenters: PaginatedResponse<TreatmentCenter>;
  faqs: FAQ[];
  healthResources: HealthResource[];
  statisticsCards: StatisticsCard[];
  relatedCenters: TreatmentCenter[];
}

// ============================================
// FILTER STATE TYPES
// ============================================

export interface ActiveFilters {
  stateId?: string;
  cityIds: string[];
  conditionIds: string[];
  insuranceIds: string[];
  therapyIds: string[];
  careTypeIds: string[];
  approachIds: string[];
  amenityIds: string[];
  priceLevel?: PriceLevel;
  searchQuery?: string;
  page: number;
  pageSize: number;
  sortBy: SortOption;
}

export type SortOption = 
  | "relevance"
  | "rating_desc"
  | "rating_asc"
  | "reviews_desc"
  | "name_asc"
  | "name_desc";
