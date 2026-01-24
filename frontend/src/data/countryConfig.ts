/**
 * Country Configuration for International Pages
 * Maps country codes to URL-friendly slugs
 */

export interface CountryBasicConfig {
  code: string;        // ISO 3166-1 alpha-3 (USA, GBR, DEU)
  name: string;
  slug: string;        // URL slug (united-kingdom, germany)
  region: string;
  flag: string;        // Emoji flag
  population?: number;
}

// All 20 countries with their URL slugs (same pattern as US states)
export const ALL_COUNTRIES: CountryBasicConfig[] = [
  { code: "USA", name: "United States", slug: "united-states", region: "North America", flag: "🇺🇸", population: 331900000 },
  { code: "GBR", name: "United Kingdom", slug: "united-kingdom", region: "Europe", flag: "🇬🇧", population: 67330000 },
  { code: "CAN", name: "Canada", slug: "canada", region: "North America", flag: "🇨🇦", population: 38250000 },
  { code: "AUS", name: "Australia", slug: "australia", region: "Oceania", flag: "🇦🇺", population: 25690000 },
  { code: "DEU", name: "Germany", slug: "germany", region: "Europe", flag: "🇩🇪", population: 83200000 },
  { code: "FRA", name: "France", slug: "france", region: "Europe", flag: "🇫🇷", population: 67750000 },
  { code: "BRA", name: "Brazil", slug: "brazil", region: "South America", flag: "🇧🇷", population: 214300000 },
  { code: "MEX", name: "Mexico", slug: "mexico", region: "North America", flag: "🇲🇽", population: 128900000 },
  { code: "IND", name: "India", slug: "india", region: "Asia", flag: "🇮🇳", population: 1417200000 },
  { code: "JPN", name: "Japan", slug: "japan", region: "Asia", flag: "🇯🇵", population: 125700000 },
  { code: "ESP", name: "Spain", slug: "spain", region: "Europe", flag: "🇪🇸", population: 47420000 },
  { code: "ITA", name: "Italy", slug: "italy", region: "Europe", flag: "🇮🇹", population: 59110000 },
  { code: "NLD", name: "Netherlands", slug: "netherlands", region: "Europe", flag: "🇳🇱", population: 17530000 },
  { code: "ZAF", name: "South Africa", slug: "south-africa", region: "Africa", flag: "🇿🇦", population: 59390000 },
  { code: "THA", name: "Thailand", slug: "thailand", region: "Asia", flag: "🇹🇭", population: 71600000 },
  { code: "POL", name: "Poland", slug: "poland", region: "Europe", flag: "🇵🇱", population: 37750000 },
  { code: "ARG", name: "Argentina", slug: "argentina", region: "South America", flag: "🇦🇷", population: 45810000 },
  { code: "KOR", name: "South Korea", slug: "south-korea", region: "Asia", flag: "🇰🇷", population: 51780000 },
  { code: "RUS", name: "Russia", slug: "russia", region: "Europe", flag: "🇷🇺", population: 144100000 },
  { code: "CHN", name: "China", slug: "china", region: "Asia", flag: "🇨🇳", population: 1412000000 },
];

// Group countries by region for navigation
export const COUNTRIES_BY_REGION: Record<string, CountryBasicConfig[]> = {
  "North America": ALL_COUNTRIES.filter(c => c.region === "North America"),
  "Europe": ALL_COUNTRIES.filter(c => c.region === "Europe"),
  "Asia": ALL_COUNTRIES.filter(c => c.region === "Asia"),
  "South America": ALL_COUNTRIES.filter(c => c.region === "South America"),
  "Oceania": ALL_COUNTRIES.filter(c => c.region === "Oceania"),
  "Africa": ALL_COUNTRIES.filter(c => c.region === "Africa"),
};

/**
 * Get country by URL slug
 */
export function getCountryBySlug(slug: string): CountryBasicConfig | undefined {
  return ALL_COUNTRIES.find(c => c.slug === slug);
}

/**
 * Get country by ISO code
 */
export function getCountryByCode(code: string): CountryBasicConfig | undefined {
  return ALL_COUNTRIES.find(c => c.code === code.toUpperCase());
}

/**
 * Check if a slug is a valid country
 */
export function isValidCountrySlug(slug: string): boolean {
  return ALL_COUNTRIES.some(c => c.slug === slug);
}

/**
 * Get all country slugs
 */
export function getAllCountrySlugs(): string[] {
  return ALL_COUNTRIES.map(c => c.slug);
}
