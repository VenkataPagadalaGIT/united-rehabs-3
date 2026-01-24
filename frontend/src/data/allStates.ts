/**
 * Complete list of all 50 US States with basic configuration
 * This is used by the content generator and can be extended to full stateConfig
 */

export interface StateBasicConfig {
  id: string;           // 2-letter lowercase abbreviation (e.g., "ca")
  name: string;         // Full state name
  abbreviation: string; // 2-letter uppercase (e.g., "CA")
  slug: string;         // URL slug (e.g., "california")
  latitude: number;
  longitude: number;
  population?: number;
  region: "northeast" | "southeast" | "midwest" | "southwest" | "west";
}

export const ALL_STATES: StateBasicConfig[] = [
  { id: "al", name: "Alabama", abbreviation: "AL", slug: "alabama", latitude: 32.3182, longitude: -86.9023, region: "southeast", population: 5024279 },
  { id: "ak", name: "Alaska", abbreviation: "AK", slug: "alaska", latitude: 64.2008, longitude: -152.4937, region: "west", population: 733391 },
  { id: "az", name: "Arizona", abbreviation: "AZ", slug: "arizona", latitude: 34.0489, longitude: -111.0937, region: "southwest", population: 7151502 },
  { id: "ar", name: "Arkansas", abbreviation: "AR", slug: "arkansas", latitude: 35.2010, longitude: -91.8318, region: "southeast", population: 3011524 },
  { id: "ca", name: "California", abbreviation: "CA", slug: "california", latitude: 36.7783, longitude: -119.4179, region: "west", population: 39538223 },
  { id: "co", name: "Colorado", abbreviation: "CO", slug: "colorado", latitude: 39.5501, longitude: -105.7821, region: "west", population: 5773714 },
  { id: "ct", name: "Connecticut", abbreviation: "CT", slug: "connecticut", latitude: 41.6032, longitude: -73.0877, region: "northeast", population: 3605944 },
  { id: "de", name: "Delaware", abbreviation: "DE", slug: "delaware", latitude: 38.9108, longitude: -75.5277, region: "northeast", population: 989948 },
  { id: "fl", name: "Florida", abbreviation: "FL", slug: "florida", latitude: 27.6648, longitude: -81.5158, region: "southeast", population: 21538187 },
  { id: "ga", name: "Georgia", abbreviation: "GA", slug: "georgia", latitude: 32.1656, longitude: -82.9001, region: "southeast", population: 10711908 },
  { id: "hi", name: "Hawaii", abbreviation: "HI", slug: "hawaii", latitude: 19.8968, longitude: -155.5828, region: "west", population: 1455271 },
  { id: "id", name: "Idaho", abbreviation: "ID", slug: "idaho", latitude: 44.0682, longitude: -114.7420, region: "west", population: 1839106 },
  { id: "il", name: "Illinois", abbreviation: "IL", slug: "illinois", latitude: 40.6331, longitude: -89.3985, region: "midwest", population: 12812508 },
  { id: "in", name: "Indiana", abbreviation: "IN", slug: "indiana", latitude: 40.2672, longitude: -86.1349, region: "midwest", population: 6785528 },
  { id: "ia", name: "Iowa", abbreviation: "IA", slug: "iowa", latitude: 41.8780, longitude: -93.0977, region: "midwest", population: 3190369 },
  { id: "ks", name: "Kansas", abbreviation: "KS", slug: "kansas", latitude: 39.0119, longitude: -98.4842, region: "midwest", population: 2937880 },
  { id: "ky", name: "Kentucky", abbreviation: "KY", slug: "kentucky", latitude: 37.8393, longitude: -84.2700, region: "southeast", population: 4505836 },
  { id: "la", name: "Louisiana", abbreviation: "LA", slug: "louisiana", latitude: 30.9843, longitude: -91.9623, region: "southeast", population: 4657757 },
  { id: "me", name: "Maine", abbreviation: "ME", slug: "maine", latitude: 45.2538, longitude: -69.4455, region: "northeast", population: 1362359 },
  { id: "md", name: "Maryland", abbreviation: "MD", slug: "maryland", latitude: 39.0458, longitude: -76.6413, region: "northeast", population: 6177224 },
  { id: "ma", name: "Massachusetts", abbreviation: "MA", slug: "massachusetts", latitude: 42.4072, longitude: -71.3824, region: "northeast", population: 7029917 },
  { id: "mi", name: "Michigan", abbreviation: "MI", slug: "michigan", latitude: 44.3148, longitude: -85.6024, region: "midwest", population: 10077331 },
  { id: "mn", name: "Minnesota", abbreviation: "MN", slug: "minnesota", latitude: 46.7296, longitude: -94.6859, region: "midwest", population: 5706494 },
  { id: "ms", name: "Mississippi", abbreviation: "MS", slug: "mississippi", latitude: 32.3547, longitude: -89.3985, region: "southeast", population: 2961279 },
  { id: "mo", name: "Missouri", abbreviation: "MO", slug: "missouri", latitude: 37.9643, longitude: -91.8318, region: "midwest", population: 6154913 },
  { id: "mt", name: "Montana", abbreviation: "MT", slug: "montana", latitude: 46.8797, longitude: -110.3626, region: "west", population: 1084225 },
  { id: "ne", name: "Nebraska", abbreviation: "NE", slug: "nebraska", latitude: 41.4925, longitude: -99.9018, region: "midwest", population: 1961504 },
  { id: "nv", name: "Nevada", abbreviation: "NV", slug: "nevada", latitude: 38.8026, longitude: -116.4194, region: "west", population: 3104614 },
  { id: "nh", name: "New Hampshire", abbreviation: "NH", slug: "new-hampshire", latitude: 43.1939, longitude: -71.5724, region: "northeast", population: 1377529 },
  { id: "nj", name: "New Jersey", abbreviation: "NJ", slug: "new-jersey", latitude: 40.0583, longitude: -74.4057, region: "northeast", population: 9288994 },
  { id: "nm", name: "New Mexico", abbreviation: "NM", slug: "new-mexico", latitude: 34.5199, longitude: -105.8701, region: "southwest", population: 2117522 },
  { id: "ny", name: "New York", abbreviation: "NY", slug: "new-york", latitude: 43.2994, longitude: -74.2179, region: "northeast", population: 20201249 },
  { id: "nc", name: "North Carolina", abbreviation: "NC", slug: "north-carolina", latitude: 35.7596, longitude: -79.0193, region: "southeast", population: 10439388 },
  { id: "nd", name: "North Dakota", abbreviation: "ND", slug: "north-dakota", latitude: 47.5515, longitude: -101.0020, region: "midwest", population: 779094 },
  { id: "oh", name: "Ohio", abbreviation: "OH", slug: "ohio", latitude: 40.4173, longitude: -82.9071, region: "midwest", population: 11799448 },
  { id: "ok", name: "Oklahoma", abbreviation: "OK", slug: "oklahoma", latitude: 35.4676, longitude: -97.5164, region: "southwest", population: 3959353 },
  { id: "or", name: "Oregon", abbreviation: "OR", slug: "oregon", latitude: 43.8041, longitude: -120.5542, region: "west", population: 4237256 },
  { id: "pa", name: "Pennsylvania", abbreviation: "PA", slug: "pennsylvania", latitude: 41.2033, longitude: -77.1945, region: "northeast", population: 13002700 },
  { id: "ri", name: "Rhode Island", abbreviation: "RI", slug: "rhode-island", latitude: 41.5801, longitude: -71.4774, region: "northeast", population: 1097379 },
  { id: "sc", name: "South Carolina", abbreviation: "SC", slug: "south-carolina", latitude: 33.8361, longitude: -81.1637, region: "southeast", population: 5118425 },
  { id: "sd", name: "South Dakota", abbreviation: "SD", slug: "south-dakota", latitude: 43.9695, longitude: -99.9018, region: "midwest", population: 886667 },
  { id: "tn", name: "Tennessee", abbreviation: "TN", slug: "tennessee", latitude: 35.5175, longitude: -86.5804, region: "southeast", population: 6910840 },
  { id: "tx", name: "Texas", abbreviation: "TX", slug: "texas", latitude: 31.9686, longitude: -99.9018, region: "southwest", population: 29145505 },
  { id: "ut", name: "Utah", abbreviation: "UT", slug: "utah", latitude: 39.3210, longitude: -111.0937, region: "west", population: 3271616 },
  { id: "vt", name: "Vermont", abbreviation: "VT", slug: "vermont", latitude: 44.5588, longitude: -72.5778, region: "northeast", population: 643077 },
  { id: "va", name: "Virginia", abbreviation: "VA", slug: "virginia", latitude: 37.4316, longitude: -78.6569, region: "southeast", population: 8631393 },
  { id: "wa", name: "Washington", abbreviation: "WA", slug: "washington", latitude: 47.7511, longitude: -120.7401, region: "west", population: 7614893 },
  { id: "wv", name: "West Virginia", abbreviation: "WV", slug: "west-virginia", latitude: 38.5976, longitude: -80.4549, region: "southeast", population: 1793716 },
  { id: "wi", name: "Wisconsin", abbreviation: "WI", slug: "wisconsin", latitude: 43.7844, longitude: -88.7879, region: "midwest", population: 5893718 },
  { id: "wy", name: "Wyoming", abbreviation: "WY", slug: "wyoming", latitude: 43.0760, longitude: -107.2903, region: "west", population: 576851 },
];

/**
 * Get state by abbreviation
 */
export function getStateByAbbreviation(abbreviation: string): StateBasicConfig | undefined {
  return ALL_STATES.find(s => s.abbreviation.toLowerCase() === abbreviation.toLowerCase());
}

/**
 * Get state by slug
 */
export function getStateBySlugFromAll(slug: string): StateBasicConfig | undefined {
  return ALL_STATES.find(s => s.slug === slug);
}

/**
 * Get state by ID
 */
export function getStateById(id: string): StateBasicConfig | undefined {
  return ALL_STATES.find(s => s.id === id);
}

/**
 * Get all state slugs
 */
export function getAllStateSlugsComplete(): string[] {
  return ALL_STATES.map(s => s.slug);
}

/**
 * Check if a slug is valid
 */
export function isValidStateSlugComplete(slug: string): boolean {
  return ALL_STATES.some(s => s.slug === slug);
}
