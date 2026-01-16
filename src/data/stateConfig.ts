import type { State, City, TreatmentCenter } from "@/types";
import { ALL_STATES, type StateBasicConfig } from "@/data/allStates";
/**
 * State Configuration
 * 
 * This file contains configuration for all supported states.
 * When adding a new state:
 * 1. Add the state to STATES object with its configuration
 * 2. Add database records (statistics, FAQs, resources, SEO) via admin panel
 * 
 * @see DOCUMENTATION.md for full scaling guide
 */

interface StateConfig {
  id: string;
  name: string;
  abbreviation: string;
  slug: string;
  description: string;
  latitude: number;
  longitude: number;
  heroImages: {
    id: string;
    url: string;
    alt: string;
    type: "photo" | "map";
    order: number;
  }[];
  cities: {
    id: string;
    name: string;
    slug: string;
    featured: boolean;
    order: number;
  }[];
  // Optional demographic data
  population?: number;
  medianAge?: number;
  medianIncome?: number;
  unemploymentRate?: number;
  lifeExpectancy?: number;
  obesityRate?: number;
  bingeDrinkingRate?: number;
  smokingRate?: number;
}

export const STATES: Record<string, StateConfig> = {
  california: {
    id: "ca",
    name: "California",
    abbreviation: "CA",
    slug: "california",
    description:
      "California, a state on the U.S. west coast, had a population of 39,029,342 in 2022. The median age in 2021 was 37 years, with a median income of $36,281 that year. In 2023, California's unemployment rate stood at 4.9%. Life expectancy in 2020 was 79 years. Additionally, in 2021, 28.76% of the population was classified as obese, 15.7% reported binge drinking, and 11.47% were smokers.",
    latitude: 36.7783,
    longitude: -119.4179,
    population: 39029342,
    medianAge: 37,
    medianIncome: 36281,
    unemploymentRate: 4.9,
    lifeExpectancy: 79,
    obesityRate: 28.76,
    bingeDrinkingRate: 15.7,
    smokingRate: 11.47,
    heroImages: [
      {
        id: "ca-1",
        url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop",
        alt: "Golden Gate Bridge",
        type: "photo",
        order: 1,
      },
      {
        id: "ca-2",
        url: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&h=600&fit=crop",
        alt: "Los Angeles Skyline",
        type: "photo",
        order: 2,
      },
      {
        id: "ca-3",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        alt: "California Mountains",
        type: "photo",
        order: 3,
      },
      {
        id: "ca-4",
        url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=600&fit=crop",
        alt: "California Palm Trees",
        type: "photo",
        order: 4,
      },
    ],
    cities: [
      { id: "oc", name: "Orange County", slug: "orange-county", featured: true, order: 1 },
      { id: "sd", name: "San Diego", slug: "san-diego", featured: true, order: 2 },
      { id: "ps", name: "Palm Springs", slug: "palm-springs", featured: true, order: 3 },
      { id: "la", name: "Los Angeles", slug: "los-angeles", featured: true, order: 4 },
      { id: "ba", name: "Bay Area", slug: "bay-area", featured: true, order: 5 },
      { id: "bh", name: "Beverly Hills", slug: "beverly-hills", featured: true, order: 6 },
    ],
  },
  florida: {
    id: "fl",
    name: "Florida",
    abbreviation: "FL",
    slug: "florida",
    description:
      "Florida, the Sunshine State, has a population of over 22 million people as of 2023. With a median age of 42.4 years, it's one of the fastest-growing states in the nation. Florida's diverse population faces unique challenges with substance abuse, particularly opioid addiction and alcohol abuse, but also offers extensive treatment resources across the state.",
    latitude: 27.6648,
    longitude: -81.5158,
    population: 22610726,
    medianAge: 42.4,
    medianIncome: 35216,
    unemploymentRate: 2.8,
    lifeExpectancy: 79.1,
    obesityRate: 27.4,
    bingeDrinkingRate: 16.8,
    smokingRate: 14.3,
    heroImages: [
      {
        id: "fl-1",
        url: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800&h=600&fit=crop",
        alt: "Miami Beach Skyline",
        type: "photo",
        order: 1,
      },
      {
        id: "fl-2",
        url: "https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=800&h=600&fit=crop",
        alt: "Florida Keys",
        type: "photo",
        order: 2,
      },
      {
        id: "fl-3",
        url: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&h=600&fit=crop",
        alt: "Orlando Theme Parks",
        type: "photo",
        order: 3,
      },
      {
        id: "fl-4",
        url: "https://images.unsplash.com/photo-1589083130544-0d6a2926e519?w=800&h=600&fit=crop",
        alt: "Florida Everglades",
        type: "photo",
        order: 4,
      },
    ],
    cities: [
      { id: "mia", name: "Miami", slug: "miami", featured: true, order: 1 },
      { id: "orl", name: "Orlando", slug: "orlando", featured: true, order: 2 },
      { id: "tpa", name: "Tampa", slug: "tampa", featured: true, order: 3 },
      { id: "jax", name: "Jacksonville", slug: "jacksonville", featured: true, order: 4 },
      { id: "ftl", name: "Fort Lauderdale", slug: "fort-lauderdale", featured: true, order: 5 },
      { id: "wpb", name: "West Palm Beach", slug: "west-palm-beach", featured: true, order: 6 },
    ],
  },
  texas: {
    id: "tx",
    name: "Texas",
    abbreviation: "TX",
    slug: "texas",
    description:
      "Texas, the Lone Star State, is the second-largest state with a population of over 30 million. With major metropolitan areas like Houston, Dallas, San Antonio, and Austin, Texas offers extensive addiction treatment resources. The state faces challenges with methamphetamine and opioid addiction, particularly along the border regions.",
    latitude: 31.9686,
    longitude: -99.9018,
    population: 30029572,
    medianAge: 35.5,
    medianIncome: 34255,
    unemploymentRate: 4.0,
    lifeExpectancy: 78.5,
    obesityRate: 34.8,
    bingeDrinkingRate: 17.2,
    smokingRate: 13.4,
    heroImages: [
      {
        id: "tx-1",
        url: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&h=600&fit=crop",
        alt: "Austin Texas Skyline",
        type: "photo",
        order: 1,
      },
      {
        id: "tx-2",
        url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop",
        alt: "Houston Downtown",
        type: "photo",
        order: 2,
      },
      {
        id: "tx-3",
        url: "https://images.unsplash.com/photo-1570745859748-3eb55e6d5dfd?w=800&h=600&fit=crop",
        alt: "San Antonio River Walk",
        type: "photo",
        order: 3,
      },
      {
        id: "tx-4",
        url: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=800&h=600&fit=crop",
        alt: "Texas Hill Country",
        type: "photo",
        order: 4,
      },
    ],
    cities: [
      { id: "hou", name: "Houston", slug: "houston", featured: true, order: 1 },
      { id: "dal", name: "Dallas", slug: "dallas", featured: true, order: 2 },
      { id: "aus", name: "Austin", slug: "austin", featured: true, order: 3 },
      { id: "sat", name: "San Antonio", slug: "san-antonio", featured: true, order: 4 },
      { id: "ftw", name: "Fort Worth", slug: "fort-worth", featured: true, order: 5 },
      { id: "elp", name: "El Paso", slug: "el-paso", featured: true, order: 6 },
    ],
  },
  "new-york": {
    id: "ny",
    name: "New York",
    abbreviation: "NY",
    slug: "new-york",
    description:
      "New York State is home to nearly 20 million residents and is a leader in addiction treatment innovation. From the metropolitan New York City area to upstate communities, the state offers diverse treatment options. New York faces significant challenges with opioid addiction, particularly fentanyl-related deaths, but has pioneered many harm reduction and treatment initiatives.",
    latitude: 43.2994,
    longitude: -74.2179,
    population: 19453561,
    medianAge: 39.4,
    medianIncome: 37691,
    unemploymentRate: 4.3,
    lifeExpectancy: 80.5,
    obesityRate: 27.6,
    bingeDrinkingRate: 18.1,
    smokingRate: 12.2,
    heroImages: [
      {
        id: "ny-1",
        url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
        alt: "New York City Skyline",
        type: "photo",
        order: 1,
      },
      {
        id: "ny-2",
        url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=600&fit=crop",
        alt: "Brooklyn Bridge",
        type: "photo",
        order: 2,
      },
      {
        id: "ny-3",
        url: "https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?w=800&h=600&fit=crop",
        alt: "Upstate New York Mountains",
        type: "photo",
        order: 3,
      },
      {
        id: "ny-4",
        url: "https://images.unsplash.com/photo-1555109307-f7d9da25c244?w=800&h=600&fit=crop",
        alt: "Central Park",
        type: "photo",
        order: 4,
      },
    ],
    cities: [
      { id: "nyc", name: "New York City", slug: "new-york-city", featured: true, order: 1 },
      { id: "buf", name: "Buffalo", slug: "buffalo", featured: true, order: 2 },
      { id: "alb", name: "Albany", slug: "albany", featured: true, order: 3 },
      { id: "roc", name: "Rochester", slug: "rochester", featured: true, order: 4 },
      { id: "syr", name: "Syracuse", slug: "syracuse", featured: true, order: 5 },
      { id: "wpl", name: "White Plains", slug: "white-plains", featured: true, order: 6 },
    ],
  },
};

/**
 * Get state configuration by slug
 * First checks detailed STATES config, then falls back to ALL_STATES
 * @param slug - The URL slug (e.g., "california", "new-york")
 * @returns StateConfig or undefined if not found
 */
export function getStateBySlug(slug: string): StateConfig | undefined {
  // First check detailed config
  if (STATES[slug]) {
    return STATES[slug];
  }
  
  // Fallback to ALL_STATES and generate a basic config
  const basicState = ALL_STATES.find(s => s.slug === slug);
  if (basicState) {
    return generateBasicStateConfig(basicState);
  }
  
  return undefined;
}

/**
 * Generate a basic StateConfig from StateBasicConfig
 */
function generateBasicStateConfig(basic: StateBasicConfig): StateConfig {
  return {
    id: basic.id,
    name: basic.name,
    abbreviation: basic.abbreviation,
    slug: basic.slug,
    description: `${basic.name} offers comprehensive addiction treatment resources and recovery support services. Find rehab centers, statistics, and free resources for substance abuse recovery in ${basic.name}.`,
    latitude: basic.latitude,
    longitude: basic.longitude,
    population: basic.population,
    heroImages: [
      {
        id: `${basic.id}-1`,
        url: `https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop`,
        alt: `${basic.name} landscape`,
        type: "photo",
        order: 1,
      },
    ],
    cities: [],
  };
}

/**
 * Convert StateConfig to the State type expected by components
 * @param config - The StateConfig object
 * @returns State object compatible with existing components
 */
export function toState(config: StateConfig): State {
  return {
    id: config.id,
    name: config.name,
    abbreviation: config.abbreviation,
    description: config.description,
    latitude: config.latitude,
    longitude: config.longitude,
    population: config.population || 0,
    medianAge: config.medianAge || 0,
    medianIncome: config.medianIncome || 0,
    unemploymentRate: config.unemploymentRate || 0,
    lifeExpectancy: config.lifeExpectancy || 0,
    obesityRate: config.obesityRate || 0,
    bingeDrinkingRate: config.bingeDrinkingRate || 0,
    smokingRate: config.smokingRate || 0,
    heroImages: config.heroImages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get all supported state slugs (all 50 states)
 */
export function getAllStateSlugs(): string[] {
  return ALL_STATES.map(s => s.slug);
}

/**
 * Check if a slug is a valid state
 */
export function isValidStateSlug(slug: string): boolean {
  return ALL_STATES.some(s => s.slug === slug);
}

/**
 * Get cities for a state with full City type
 * @param stateId - The state ID (e.g., "ca", "fl")
 * @param stateSlug - The state slug for lookup
 * @returns Array of City objects
 */
export function getStateCities(stateSlug: string): City[] {
  const config = STATES[stateSlug];
  if (!config) return [];
  
  return config.cities.map(city => ({
    id: city.id,
    stateId: config.id,
    name: city.name,
    slug: city.slug,
    featured: city.featured,
    order: city.order,
    createdAt: "",
    updatedAt: "",
  }));
}

/**
 * State-specific treatment centers
 * In production, this would come from the database
 */
const STATE_TREATMENT_CENTERS: Record<string, TreatmentCenter[]> = {
  ca: [
    {
      id: "tc-ca-1",
      name: "Vanity Wellness Center",
      slug: "vanity-wellness-center",
      verified: true,
      featured: true,
      cityId: "la",
      stateId: "ca",
      address: "Woodland Hills, California, USA",
      phone: "(732) 366-4286",
      images: [{ id: "img1", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop", alt: "Vanity Wellness Center", isPrimary: true, order: 1 }],
      rating: 5.0,
      reviewCount: 97,
      priceLevel: "$$",
      acceptsInsurance: true,
      shortDescription: "A luxury center treating addiction and co-occurring mental health with evidence-based therapies, a continuum of care in bespoke facilities, and private bedrooms.",
      conditionIds: ["c1", "c2", "c3", "c4", "c5"],
      insuranceIds: ["i1", "i2"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-ca-2",
      name: "Serenity Recovery Center",
      slug: "serenity-recovery-center",
      verified: true,
      featured: true,
      cityId: "sd",
      stateId: "ca",
      address: "San Diego, California, USA",
      phone: "(858) 555-0123",
      images: [{ id: "img2", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", alt: "Serenity Recovery Center", isPrimary: true, order: 1 }],
      rating: 4.8,
      reviewCount: 124,
      priceLevel: "$$$",
      acceptsInsurance: true,
      shortDescription: "A luxury center treating addiction and co-occurring mental health with evidence-based therapies, a continuum of care in bespoke facilities, and private bedrooms.",
      conditionIds: ["c1", "c2", "c3"],
      insuranceIds: ["i1", "i3"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-ca-3",
      name: "Harmony Treatment Center",
      slug: "harmony-treatment-center",
      verified: true,
      featured: false,
      cityId: "oc",
      stateId: "ca",
      address: "Orange County, California, USA",
      phone: "(949) 555-0456",
      images: [{ id: "img3", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop", alt: "Harmony Treatment Center", isPrimary: true, order: 1 }],
      rating: 4.9,
      reviewCount: 89,
      priceLevel: "$$",
      acceptsInsurance: true,
      shortDescription: "A luxury center treating addiction and co-occurring mental health with evidence-based therapies.",
      conditionIds: ["c2", "c4", "c5"],
      insuranceIds: ["i2"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-ca-4",
      name: "Pacific Coast Recovery",
      slug: "pacific-coast-recovery",
      verified: true,
      featured: true,
      cityId: "ba",
      stateId: "ca",
      address: "Bay Area, California, USA",
      phone: "(415) 555-0789",
      images: [{ id: "img4", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop", alt: "Pacific Coast Recovery", isPrimary: true, order: 1 }],
      rating: 5.0,
      reviewCount: 156,
      priceLevel: "$$$$",
      acceptsInsurance: false,
      shortDescription: "A luxury center treating addiction and co-occurring mental health with evidence-based therapies.",
      conditionIds: ["c1", "c3"],
      insuranceIds: [],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
  ],
  fl: [
    {
      id: "tc-fl-1",
      name: "Sunshine Recovery Center",
      slug: "sunshine-recovery-center",
      verified: true,
      featured: true,
      cityId: "mia",
      stateId: "fl",
      address: "Miami, Florida, USA",
      phone: "(305) 555-1234",
      images: [{ id: "fl-img1", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", alt: "Sunshine Recovery Center", isPrimary: true, order: 1 }],
      rating: 4.9,
      reviewCount: 142,
      priceLevel: "$$$",
      acceptsInsurance: true,
      shortDescription: "Premier Miami addiction treatment center offering comprehensive care for substance abuse and mental health disorders.",
      conditionIds: ["c1", "c2", "c3"],
      insuranceIds: ["i1", "i2"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-fl-2",
      name: "Orlando Recovery Institute",
      slug: "orlando-recovery-institute",
      verified: true,
      featured: true,
      cityId: "orl",
      stateId: "fl",
      address: "Orlando, Florida, USA",
      phone: "(407) 555-5678",
      images: [{ id: "fl-img2", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop", alt: "Orlando Recovery Institute", isPrimary: true, order: 1 }],
      rating: 5.0,
      reviewCount: 98,
      priceLevel: "$$",
      acceptsInsurance: true,
      shortDescription: "Central Florida's leading addiction treatment facility with personalized recovery programs and family support services.",
      conditionIds: ["c1", "c2", "c4", "c5"],
      insuranceIds: ["i1", "i3"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-fl-3",
      name: "Tampa Bay Wellness",
      slug: "tampa-bay-wellness",
      verified: true,
      featured: true,
      cityId: "tpa",
      stateId: "fl",
      address: "Tampa, Florida, USA",
      phone: "(813) 555-9012",
      images: [{ id: "fl-img3", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop", alt: "Tampa Bay Wellness", isPrimary: true, order: 1 }],
      rating: 4.7,
      reviewCount: 76,
      priceLevel: "$$",
      acceptsInsurance: true,
      shortDescription: "Compassionate addiction treatment in Tampa Bay offering detox, inpatient, and outpatient programs.",
      conditionIds: ["c2", "c3", "c4"],
      insuranceIds: ["i2"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-fl-4",
      name: "Palm Beach Recovery Center",
      slug: "palm-beach-recovery-center",
      verified: true,
      featured: true,
      cityId: "wpb",
      stateId: "fl",
      address: "West Palm Beach, Florida, USA",
      phone: "(561) 555-3456",
      images: [{ id: "fl-img4", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop", alt: "Palm Beach Recovery Center", isPrimary: true, order: 1 }],
      rating: 4.8,
      reviewCount: 189,
      priceLevel: "$$$$",
      acceptsInsurance: true,
      shortDescription: "Luxury addiction treatment center in Palm Beach offering exclusive amenities and evidence-based therapies.",
      conditionIds: ["c1", "c2", "c3", "c4", "c5"],
      insuranceIds: ["i1", "i2", "i3"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-fl-5",
      name: "Fort Lauderdale Healing Center",
      slug: "fort-lauderdale-healing-center",
      verified: true,
      featured: false,
      cityId: "ftl",
      stateId: "fl",
      address: "Fort Lauderdale, Florida, USA",
      phone: "(954) 555-7890",
      images: [{ id: "fl-img5", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop", alt: "Fort Lauderdale Healing Center", isPrimary: true, order: 1 }],
      rating: 4.6,
      reviewCount: 54,
      priceLevel: "$$",
      acceptsInsurance: true,
      shortDescription: "Holistic addiction treatment in Fort Lauderdale combining traditional and alternative therapies.",
      conditionIds: ["c1", "c4"],
      insuranceIds: ["i1"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-fl-6",
      name: "Jacksonville Recovery Network",
      slug: "jacksonville-recovery-network",
      verified: true,
      featured: false,
      cityId: "jax",
      stateId: "fl",
      address: "Jacksonville, Florida, USA",
      phone: "(904) 555-2345",
      images: [{ id: "fl-img6", url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop", alt: "Jacksonville Recovery Network", isPrimary: true, order: 1 }],
      rating: 4.5,
      reviewCount: 67,
      priceLevel: "$",
      acceptsInsurance: true,
      shortDescription: "Community-focused addiction treatment center serving North Florida with affordable recovery options.",
      conditionIds: ["c1", "c2"],
      insuranceIds: ["i1", "i2", "i3"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
  ],
  tx: [
    {
      id: "tc-tx-1",
      name: "Houston Recovery Center",
      slug: "houston-recovery-center",
      verified: true,
      featured: true,
      cityId: "hou",
      stateId: "tx",
      address: "Houston, Texas, USA",
      phone: "(713) 555-1234",
      images: [{ id: "tx-img1", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", alt: "Houston Recovery Center", isPrimary: true, order: 1 }],
      rating: 4.8,
      reviewCount: 156,
      priceLevel: "$$",
      acceptsInsurance: true,
      shortDescription: "Comprehensive addiction treatment in Houston with specialized programs for opioid and alcohol dependency.",
      conditionIds: ["c1", "c2", "c3"],
      insuranceIds: ["i1", "i2"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-tx-2",
      name: "Dallas Treatment Institute",
      slug: "dallas-treatment-institute",
      verified: true,
      featured: true,
      cityId: "dal",
      stateId: "tx",
      address: "Dallas, Texas, USA",
      phone: "(214) 555-5678",
      images: [{ id: "tx-img2", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop", alt: "Dallas Treatment Institute", isPrimary: true, order: 1 }],
      rating: 4.9,
      reviewCount: 134,
      priceLevel: "$$$",
      acceptsInsurance: true,
      shortDescription: "Premier Dallas addiction treatment center offering dual diagnosis and executive recovery programs.",
      conditionIds: ["c1", "c2", "c4", "c5"],
      insuranceIds: ["i1", "i3"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-tx-3",
      name: "Austin Wellness Center",
      slug: "austin-wellness-center",
      verified: true,
      featured: true,
      cityId: "aus",
      stateId: "tx",
      address: "Austin, Texas, USA",
      phone: "(512) 555-9012",
      images: [{ id: "tx-img3", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop", alt: "Austin Wellness Center", isPrimary: true, order: 1 }],
      rating: 5.0,
      reviewCount: 89,
      priceLevel: "$$",
      acceptsInsurance: true,
      shortDescription: "Holistic addiction treatment in Austin combining evidence-based therapies with wellness practices.",
      conditionIds: ["c2", "c3", "c4"],
      insuranceIds: ["i2"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-tx-4",
      name: "San Antonio Recovery",
      slug: "san-antonio-recovery",
      verified: true,
      featured: true,
      cityId: "sat",
      stateId: "tx",
      address: "San Antonio, Texas, USA",
      phone: "(210) 555-3456",
      images: [{ id: "tx-img4", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop", alt: "San Antonio Recovery", isPrimary: true, order: 1 }],
      rating: 4.7,
      reviewCount: 72,
      priceLevel: "$$",
      acceptsInsurance: true,
      shortDescription: "Bilingual addiction treatment services in San Antonio serving the South Texas community.",
      conditionIds: ["c1", "c2", "c3", "c4"],
      insuranceIds: ["i1", "i2", "i3"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
  ],
  ny: [
    {
      id: "tc-ny-1",
      name: "Manhattan Recovery Center",
      slug: "manhattan-recovery-center",
      verified: true,
      featured: true,
      cityId: "nyc",
      stateId: "ny",
      address: "New York City, New York, USA",
      phone: "(212) 555-1234",
      images: [{ id: "ny-img1", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", alt: "Manhattan Recovery Center", isPrimary: true, order: 1 }],
      rating: 4.9,
      reviewCount: 234,
      priceLevel: "$$$$",
      acceptsInsurance: true,
      shortDescription: "Premier addiction treatment in Manhattan with exclusive executive and professional programs.",
      conditionIds: ["c1", "c2", "c3", "c4", "c5"],
      insuranceIds: ["i1", "i2", "i3"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-ny-2",
      name: "Brooklyn Wellness Institute",
      slug: "brooklyn-wellness-institute",
      verified: true,
      featured: true,
      cityId: "nyc",
      stateId: "ny",
      address: "Brooklyn, New York, USA",
      phone: "(718) 555-5678",
      images: [{ id: "ny-img2", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop", alt: "Brooklyn Wellness Institute", isPrimary: true, order: 1 }],
      rating: 4.8,
      reviewCount: 156,
      priceLevel: "$$$",
      acceptsInsurance: true,
      shortDescription: "Community-centered addiction treatment in Brooklyn with culturally sensitive programs.",
      conditionIds: ["c1", "c2", "c4"],
      insuranceIds: ["i1", "i3"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-ny-3",
      name: "Buffalo Recovery Network",
      slug: "buffalo-recovery-network",
      verified: true,
      featured: true,
      cityId: "buf",
      stateId: "ny",
      address: "Buffalo, New York, USA",
      phone: "(716) 555-9012",
      images: [{ id: "ny-img3", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop", alt: "Buffalo Recovery Network", isPrimary: true, order: 1 }],
      rating: 4.6,
      reviewCount: 87,
      priceLevel: "$$",
      acceptsInsurance: true,
      shortDescription: "Affordable addiction treatment in Western New York with comprehensive recovery support.",
      conditionIds: ["c1", "c2", "c3"],
      insuranceIds: ["i1", "i2"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tc-ny-4",
      name: "Albany Treatment Center",
      slug: "albany-treatment-center",
      verified: true,
      featured: true,
      cityId: "alb",
      stateId: "ny",
      address: "Albany, New York, USA",
      phone: "(518) 555-3456",
      images: [{ id: "ny-img4", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop", alt: "Albany Treatment Center", isPrimary: true, order: 1 }],
      rating: 4.7,
      reviewCount: 65,
      priceLevel: "$$",
      acceptsInsurance: true,
      shortDescription: "Capital Region addiction treatment with specialized state employee and professional programs.",
      conditionIds: ["c2", "c3", "c4"],
      insuranceIds: ["i2", "i3"],
      therapyIds: [], careTypeIds: [], approachIds: [], amenityIds: [], activityIds: [], languageIds: [], clienteleIds: [], settingIds: [],
      createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z",
    },
  ],
};

/**
 * Get treatment centers for a state
 * @param stateId - The state ID (e.g., "ca", "fl", "tx", "ny")
 * @returns Array of TreatmentCenter objects
 */
export function getStateTreatmentCenters(stateId: string): TreatmentCenter[] {
  return STATE_TREATMENT_CENTERS[stateId] || [];
}
