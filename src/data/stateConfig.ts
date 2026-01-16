import type { State } from "@/types";

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
  },
};

/**
 * Get state configuration by slug
 * @param slug - The URL slug (e.g., "california", "new-york")
 * @returns StateConfig or undefined if not found
 */
export function getStateBySlug(slug: string): StateConfig | undefined {
  return STATES[slug];
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
 * Get all supported state slugs
 */
export function getAllStateSlugs(): string[] {
  return Object.keys(STATES);
}

/**
 * Check if a slug is a valid state
 */
export function isValidStateSlug(slug: string): boolean {
  return slug in STATES;
}
