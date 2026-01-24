/**
 * Country Configuration for International Pages - 195 Countries
 * Maps country codes to URL-friendly slugs
 */

export interface CountryBasicConfig {
  code: string;        // ISO 3166-1 alpha-3 (USA, GBR, DEU)
  name: string;
  slug: string;        // URL slug (united-kingdom, germany)
  region: string;
  subRegion?: string;
  flag: string;        // Emoji flag
  population?: number;
}

// Helper to generate slug from country name
const toSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// All 195 UN-recognized countries
export const ALL_COUNTRIES: CountryBasicConfig[] = [
  // ==================== EUROPE (44 countries) ====================
  { code: "ALB", name: "Albania", slug: "albania", region: "Europe", subRegion: "Southern Europe", flag: "🇦🇱", population: 2870000 },
  { code: "AND", name: "Andorra", slug: "andorra", region: "Europe", subRegion: "Southern Europe", flag: "🇦🇩", population: 77000 },
  { code: "AUT", name: "Austria", slug: "austria", region: "Europe", subRegion: "Western Europe", flag: "🇦🇹", population: 9040000 },
  { code: "BLR", name: "Belarus", slug: "belarus", region: "Europe", subRegion: "Eastern Europe", flag: "🇧🇾", population: 9200000 },
  { code: "BEL", name: "Belgium", slug: "belgium", region: "Europe", subRegion: "Western Europe", flag: "🇧🇪", population: 11590000 },
  { code: "BIH", name: "Bosnia and Herzegovina", slug: "bosnia-and-herzegovina", region: "Europe", subRegion: "Southern Europe", flag: "🇧🇦", population: 3270000 },
  { code: "BGR", name: "Bulgaria", slug: "bulgaria", region: "Europe", subRegion: "Eastern Europe", flag: "🇧🇬", population: 6880000 },
  { code: "HRV", name: "Croatia", slug: "croatia", region: "Europe", subRegion: "Southern Europe", flag: "🇭🇷", population: 3860000 },
  { code: "CYP", name: "Cyprus", slug: "cyprus", region: "Europe", subRegion: "Southern Europe", flag: "🇨🇾", population: 1210000 },
  { code: "CZE", name: "Czech Republic", slug: "czech-republic", region: "Europe", subRegion: "Eastern Europe", flag: "🇨🇿", population: 10700000 },
  { code: "DNK", name: "Denmark", slug: "denmark", region: "Europe", subRegion: "Northern Europe", flag: "🇩🇰", population: 5860000 },
  { code: "EST", name: "Estonia", slug: "estonia", region: "Europe", subRegion: "Northern Europe", flag: "🇪🇪", population: 1330000 },
  { code: "FIN", name: "Finland", slug: "finland", region: "Europe", subRegion: "Northern Europe", flag: "🇫🇮", population: 5540000 },
  { code: "FRA", name: "France", slug: "france", region: "Europe", subRegion: "Western Europe", flag: "🇫🇷", population: 67750000 },
  { code: "DEU", name: "Germany", slug: "germany", region: "Europe", subRegion: "Western Europe", flag: "🇩🇪", population: 83200000 },
  { code: "GRC", name: "Greece", slug: "greece", region: "Europe", subRegion: "Southern Europe", flag: "🇬🇷", population: 10640000 },
  { code: "HUN", name: "Hungary", slug: "hungary", region: "Europe", subRegion: "Eastern Europe", flag: "🇭🇺", population: 9600000 },
  { code: "ISL", name: "Iceland", slug: "iceland", region: "Europe", subRegion: "Northern Europe", flag: "🇮🇸", population: 376000 },
  { code: "IRL", name: "Ireland", slug: "ireland", region: "Europe", subRegion: "Northern Europe", flag: "🇮🇪", population: 5030000 },
  { code: "ITA", name: "Italy", slug: "italy", region: "Europe", subRegion: "Southern Europe", flag: "🇮🇹", population: 59110000 },
  { code: "LVA", name: "Latvia", slug: "latvia", region: "Europe", subRegion: "Northern Europe", flag: "🇱🇻", population: 1880000 },
  { code: "LIE", name: "Liechtenstein", slug: "liechtenstein", region: "Europe", subRegion: "Western Europe", flag: "🇱🇮", population: 39000 },
  { code: "LTU", name: "Lithuania", slug: "lithuania", region: "Europe", subRegion: "Northern Europe", flag: "🇱🇹", population: 2790000 },
  { code: "LUX", name: "Luxembourg", slug: "luxembourg", region: "Europe", subRegion: "Western Europe", flag: "🇱🇺", population: 645000 },
  { code: "MLT", name: "Malta", slug: "malta", region: "Europe", subRegion: "Southern Europe", flag: "🇲🇹", population: 520000 },
  { code: "MDA", name: "Moldova", slug: "moldova", region: "Europe", subRegion: "Eastern Europe", flag: "🇲🇩", population: 2600000 },
  { code: "MCO", name: "Monaco", slug: "monaco", region: "Europe", subRegion: "Western Europe", flag: "🇲🇨", population: 39000 },
  { code: "MNE", name: "Montenegro", slug: "montenegro", region: "Europe", subRegion: "Southern Europe", flag: "🇲🇪", population: 620000 },
  { code: "NLD", name: "Netherlands", slug: "netherlands", region: "Europe", subRegion: "Western Europe", flag: "🇳🇱", population: 17530000 },
  { code: "MKD", name: "North Macedonia", slug: "north-macedonia", region: "Europe", subRegion: "Southern Europe", flag: "🇲🇰", population: 2080000 },
  { code: "NOR", name: "Norway", slug: "norway", region: "Europe", subRegion: "Northern Europe", flag: "🇳🇴", population: 5430000 },
  { code: "POL", name: "Poland", slug: "poland", region: "Europe", subRegion: "Eastern Europe", flag: "🇵🇱", population: 37750000 },
  { code: "PRT", name: "Portugal", slug: "portugal", region: "Europe", subRegion: "Southern Europe", flag: "🇵🇹", population: 10330000 },
  { code: "ROU", name: "Romania", slug: "romania", region: "Europe", subRegion: "Eastern Europe", flag: "🇷🇴", population: 19120000 },
  { code: "RUS", name: "Russia", slug: "russia", region: "Europe", subRegion: "Eastern Europe", flag: "🇷🇺", population: 144100000 },
  { code: "SMR", name: "San Marino", slug: "san-marino", region: "Europe", subRegion: "Southern Europe", flag: "🇸🇲", population: 34000 },
  { code: "SRB", name: "Serbia", slug: "serbia", region: "Europe", subRegion: "Southern Europe", flag: "🇷🇸", population: 6800000 },
  { code: "SVK", name: "Slovakia", slug: "slovakia", region: "Europe", subRegion: "Eastern Europe", flag: "🇸🇰", population: 5450000 },
  { code: "SVN", name: "Slovenia", slug: "slovenia", region: "Europe", subRegion: "Southern Europe", flag: "🇸🇮", population: 2100000 },
  { code: "ESP", name: "Spain", slug: "spain", region: "Europe", subRegion: "Southern Europe", flag: "🇪🇸", population: 47420000 },
  { code: "SWE", name: "Sweden", slug: "sweden", region: "Europe", subRegion: "Northern Europe", flag: "🇸🇪", population: 10420000 },
  { code: "CHE", name: "Switzerland", slug: "switzerland", region: "Europe", subRegion: "Western Europe", flag: "🇨🇭", population: 8700000 },
  { code: "UKR", name: "Ukraine", slug: "ukraine", region: "Europe", subRegion: "Eastern Europe", flag: "🇺🇦", population: 41170000 },
  { code: "GBR", name: "United Kingdom", slug: "united-kingdom", region: "Europe", subRegion: "Northern Europe", flag: "🇬🇧", population: 67330000 },

  // ==================== ASIA (48 countries) ====================
  { code: "AFG", name: "Afghanistan", slug: "afghanistan", region: "Asia", subRegion: "Southern Asia", flag: "🇦🇫", population: 41130000 },
  { code: "ARM", name: "Armenia", slug: "armenia", region: "Asia", subRegion: "Western Asia", flag: "🇦🇲", population: 2780000 },
  { code: "AZE", name: "Azerbaijan", slug: "azerbaijan", region: "Asia", subRegion: "Western Asia", flag: "🇦🇿", population: 10140000 },
  { code: "BHR", name: "Bahrain", slug: "bahrain", region: "Asia", subRegion: "Western Asia", flag: "🇧🇭", population: 1470000 },
  { code: "BGD", name: "Bangladesh", slug: "bangladesh", region: "Asia", subRegion: "Southern Asia", flag: "🇧🇩", population: 169400000 },
  { code: "BTN", name: "Bhutan", slug: "bhutan", region: "Asia", subRegion: "Southern Asia", flag: "🇧🇹", population: 780000 },
  { code: "BRN", name: "Brunei", slug: "brunei", region: "Asia", subRegion: "South-Eastern Asia", flag: "🇧🇳", population: 445000 },
  { code: "KHM", name: "Cambodia", slug: "cambodia", region: "Asia", subRegion: "South-Eastern Asia", flag: "🇰🇭", population: 16720000 },
  { code: "CHN", name: "China", slug: "china", region: "Asia", subRegion: "Eastern Asia", flag: "🇨🇳", population: 1412000000 },
  { code: "GEO", name: "Georgia", slug: "georgia", region: "Asia", subRegion: "Western Asia", flag: "🇬🇪", population: 3710000 },
  { code: "IND", name: "India", slug: "india", region: "Asia", subRegion: "Southern Asia", flag: "🇮🇳", population: 1417200000 },
  { code: "IDN", name: "Indonesia", slug: "indonesia", region: "Asia", subRegion: "South-Eastern Asia", flag: "🇮🇩", population: 275500000 },
  { code: "IRN", name: "Iran", slug: "iran", region: "Asia", subRegion: "Southern Asia", flag: "🇮🇷", population: 87920000 },
  { code: "IRQ", name: "Iraq", slug: "iraq", region: "Asia", subRegion: "Western Asia", flag: "🇮🇶", population: 43530000 },
  { code: "ISR", name: "Israel", slug: "israel", region: "Asia", subRegion: "Western Asia", flag: "🇮🇱", population: 9370000 },
  { code: "JPN", name: "Japan", slug: "japan", region: "Asia", subRegion: "Eastern Asia", flag: "🇯🇵", population: 125700000 },
  { code: "JOR", name: "Jordan", slug: "jordan", region: "Asia", subRegion: "Western Asia", flag: "🇯🇴", population: 11150000 },
  { code: "KAZ", name: "Kazakhstan", slug: "kazakhstan", region: "Asia", subRegion: "Central Asia", flag: "🇰🇿", population: 19400000 },
  { code: "KWT", name: "Kuwait", slug: "kuwait", region: "Asia", subRegion: "Western Asia", flag: "🇰🇼", population: 4310000 },
  { code: "KGZ", name: "Kyrgyzstan", slug: "kyrgyzstan", region: "Asia", subRegion: "Central Asia", flag: "🇰🇬", population: 6690000 },
  { code: "LAO", name: "Laos", slug: "laos", region: "Asia", subRegion: "South-Eastern Asia", flag: "🇱🇦", population: 7430000 },
  { code: "LBN", name: "Lebanon", slug: "lebanon", region: "Asia", subRegion: "Western Asia", flag: "🇱🇧", population: 5490000 },
  { code: "MYS", name: "Malaysia", slug: "malaysia", region: "Asia", subRegion: "South-Eastern Asia", flag: "🇲🇾", population: 33940000 },
  { code: "MDV", name: "Maldives", slug: "maldives", region: "Asia", subRegion: "Southern Asia", flag: "🇲🇻", population: 521000 },
  { code: "MNG", name: "Mongolia", slug: "mongolia", region: "Asia", subRegion: "Eastern Asia", flag: "🇲🇳", population: 3350000 },
  { code: "MMR", name: "Myanmar", slug: "myanmar", region: "Asia", subRegion: "South-Eastern Asia", flag: "🇲🇲", population: 54180000 },
  { code: "NPL", name: "Nepal", slug: "nepal", region: "Asia", subRegion: "Southern Asia", flag: "🇳🇵", population: 30550000 },
  { code: "PRK", name: "North Korea", slug: "north-korea", region: "Asia", subRegion: "Eastern Asia", flag: "🇰🇵", population: 26070000 },
  { code: "OMN", name: "Oman", slug: "oman", region: "Asia", subRegion: "Western Asia", flag: "🇴🇲", population: 4520000 },
  { code: "PAK", name: "Pakistan", slug: "pakistan", region: "Asia", subRegion: "Southern Asia", flag: "🇵🇰", population: 231400000 },
  { code: "PSE", name: "Palestine", slug: "palestine", region: "Asia", subRegion: "Western Asia", flag: "🇵🇸", population: 5250000 },
  { code: "PHL", name: "Philippines", slug: "philippines", region: "Asia", subRegion: "South-Eastern Asia", flag: "🇵🇭", population: 115560000 },
  { code: "QAT", name: "Qatar", slug: "qatar", region: "Asia", subRegion: "Western Asia", flag: "🇶🇦", population: 2690000 },
  { code: "SAU", name: "Saudi Arabia", slug: "saudi-arabia", region: "Asia", subRegion: "Western Asia", flag: "🇸🇦", population: 35950000 },
  { code: "SGP", name: "Singapore", slug: "singapore", region: "Asia", subRegion: "South-Eastern Asia", flag: "🇸🇬", population: 5450000 },
  { code: "KOR", name: "South Korea", slug: "south-korea", region: "Asia", subRegion: "Eastern Asia", flag: "🇰🇷", population: 51780000 },
  { code: "LKA", name: "Sri Lanka", slug: "sri-lanka", region: "Asia", subRegion: "Southern Asia", flag: "🇱🇰", population: 21920000 },
  { code: "SYR", name: "Syria", slug: "syria", region: "Asia", subRegion: "Western Asia", flag: "🇸🇾", population: 22130000 },
  { code: "TWN", name: "Taiwan", slug: "taiwan", region: "Asia", subRegion: "Eastern Asia", flag: "🇹🇼", population: 23570000 },
  { code: "TJK", name: "Tajikistan", slug: "tajikistan", region: "Asia", subRegion: "Central Asia", flag: "🇹🇯", population: 9750000 },
  { code: "THA", name: "Thailand", slug: "thailand", region: "Asia", subRegion: "South-Eastern Asia", flag: "🇹🇭", population: 71600000 },
  { code: "TLS", name: "Timor-Leste", slug: "timor-leste", region: "Asia", subRegion: "South-Eastern Asia", flag: "🇹🇱", population: 1340000 },
  { code: "TUR", name: "Turkey", slug: "turkey", region: "Asia", subRegion: "Western Asia", flag: "🇹🇷", population: 85340000 },
  { code: "TKM", name: "Turkmenistan", slug: "turkmenistan", region: "Asia", subRegion: "Central Asia", flag: "🇹🇲", population: 6430000 },
  { code: "ARE", name: "United Arab Emirates", slug: "united-arab-emirates", region: "Asia", subRegion: "Western Asia", flag: "🇦🇪", population: 9440000 },
  { code: "UZB", name: "Uzbekistan", slug: "uzbekistan", region: "Asia", subRegion: "Central Asia", flag: "🇺🇿", population: 34920000 },
  { code: "VNM", name: "Vietnam", slug: "vietnam", region: "Asia", subRegion: "South-Eastern Asia", flag: "🇻🇳", population: 98170000 },
  { code: "YEM", name: "Yemen", slug: "yemen", region: "Asia", subRegion: "Western Asia", flag: "🇾🇪", population: 33700000 },

  // ==================== AFRICA (54 countries) ====================
  { code: "DZA", name: "Algeria", slug: "algeria", region: "Africa", subRegion: "Northern Africa", flag: "🇩🇿", population: 45610000 },
  { code: "AGO", name: "Angola", slug: "angola", region: "Africa", subRegion: "Middle Africa", flag: "🇦🇴", population: 35590000 },
  { code: "BEN", name: "Benin", slug: "benin", region: "Africa", subRegion: "Western Africa", flag: "🇧🇯", population: 13350000 },
  { code: "BWA", name: "Botswana", slug: "botswana", region: "Africa", subRegion: "Southern Africa", flag: "🇧🇼", population: 2590000 },
  { code: "BFA", name: "Burkina Faso", slug: "burkina-faso", region: "Africa", subRegion: "Western Africa", flag: "🇧🇫", population: 22670000 },
  { code: "BDI", name: "Burundi", slug: "burundi", region: "Africa", subRegion: "Eastern Africa", flag: "🇧🇮", population: 12890000 },
  { code: "CPV", name: "Cabo Verde", slug: "cabo-verde", region: "Africa", subRegion: "Western Africa", flag: "🇨🇻", population: 593000 },
  { code: "CMR", name: "Cameroon", slug: "cameroon", region: "Africa", subRegion: "Middle Africa", flag: "🇨🇲", population: 27910000 },
  { code: "CAF", name: "Central African Republic", slug: "central-african-republic", region: "Africa", subRegion: "Middle Africa", flag: "🇨🇫", population: 5580000 },
  { code: "TCD", name: "Chad", slug: "chad", region: "Africa", subRegion: "Middle Africa", flag: "🇹🇩", population: 17720000 },
  { code: "COM", name: "Comoros", slug: "comoros", region: "Africa", subRegion: "Eastern Africa", flag: "🇰🇲", population: 888000 },
  { code: "COG", name: "Congo", slug: "congo", region: "Africa", subRegion: "Middle Africa", flag: "🇨🇬", population: 5970000 },
  { code: "COD", name: "DR Congo", slug: "dr-congo", region: "Africa", subRegion: "Middle Africa", flag: "🇨🇩", population: 99010000 },
  { code: "CIV", name: "Ivory Coast", slug: "ivory-coast", region: "Africa", subRegion: "Western Africa", flag: "🇨🇮", population: 28160000 },
  { code: "DJI", name: "Djibouti", slug: "djibouti", region: "Africa", subRegion: "Eastern Africa", flag: "🇩🇯", population: 1120000 },
  { code: "EGY", name: "Egypt", slug: "egypt", region: "Africa", subRegion: "Northern Africa", flag: "🇪🇬", population: 109300000 },
  { code: "GNQ", name: "Equatorial Guinea", slug: "equatorial-guinea", region: "Africa", subRegion: "Middle Africa", flag: "🇬🇶", population: 1670000 },
  { code: "ERI", name: "Eritrea", slug: "eritrea", region: "Africa", subRegion: "Eastern Africa", flag: "🇪🇷", population: 3680000 },
  { code: "SWZ", name: "Eswatini", slug: "eswatini", region: "Africa", subRegion: "Southern Africa", flag: "🇸🇿", population: 1200000 },
  { code: "ETH", name: "Ethiopia", slug: "ethiopia", region: "Africa", subRegion: "Eastern Africa", flag: "🇪🇹", population: 123380000 },
  { code: "GAB", name: "Gabon", slug: "gabon", region: "Africa", subRegion: "Middle Africa", flag: "🇬🇦", population: 2390000 },
  { code: "GMB", name: "Gambia", slug: "gambia", region: "Africa", subRegion: "Western Africa", flag: "🇬🇲", population: 2640000 },
  { code: "GHA", name: "Ghana", slug: "ghana", region: "Africa", subRegion: "Western Africa", flag: "🇬🇭", population: 33480000 },
  { code: "GIN", name: "Guinea", slug: "guinea", region: "Africa", subRegion: "Western Africa", flag: "🇬🇳", population: 13860000 },
  { code: "GNB", name: "Guinea-Bissau", slug: "guinea-bissau", region: "Africa", subRegion: "Western Africa", flag: "🇬🇼", population: 2060000 },
  { code: "KEN", name: "Kenya", slug: "kenya", region: "Africa", subRegion: "Eastern Africa", flag: "🇰🇪", population: 54030000 },
  { code: "LSO", name: "Lesotho", slug: "lesotho", region: "Africa", subRegion: "Southern Africa", flag: "🇱🇸", population: 2180000 },
  { code: "LBR", name: "Liberia", slug: "liberia", region: "Africa", subRegion: "Western Africa", flag: "🇱🇷", population: 5300000 },
  { code: "LBY", name: "Libya", slug: "libya", region: "Africa", subRegion: "Northern Africa", flag: "🇱🇾", population: 6810000 },
  { code: "MDG", name: "Madagascar", slug: "madagascar", region: "Africa", subRegion: "Eastern Africa", flag: "🇲🇬", population: 29610000 },
  { code: "MWI", name: "Malawi", slug: "malawi", region: "Africa", subRegion: "Eastern Africa", flag: "🇲🇼", population: 20410000 },
  { code: "MLI", name: "Mali", slug: "mali", region: "Africa", subRegion: "Western Africa", flag: "🇲🇱", population: 22590000 },
  { code: "MRT", name: "Mauritania", slug: "mauritania", region: "Africa", subRegion: "Western Africa", flag: "🇲🇷", population: 4770000 },
  { code: "MUS", name: "Mauritius", slug: "mauritius", region: "Africa", subRegion: "Eastern Africa", flag: "🇲🇺", population: 1270000 },
  { code: "MAR", name: "Morocco", slug: "morocco", region: "Africa", subRegion: "Northern Africa", flag: "🇲🇦", population: 37460000 },
  { code: "MOZ", name: "Mozambique", slug: "mozambique", region: "Africa", subRegion: "Eastern Africa", flag: "🇲🇿", population: 32970000 },
  { code: "NAM", name: "Namibia", slug: "namibia", region: "Africa", subRegion: "Southern Africa", flag: "🇳🇦", population: 2570000 },
  { code: "NER", name: "Niger", slug: "niger", region: "Africa", subRegion: "Western Africa", flag: "🇳🇪", population: 26210000 },
  { code: "NGA", name: "Nigeria", slug: "nigeria", region: "Africa", subRegion: "Western Africa", flag: "🇳🇬", population: 218500000 },
  { code: "RWA", name: "Rwanda", slug: "rwanda", region: "Africa", subRegion: "Eastern Africa", flag: "🇷🇼", population: 13780000 },
  { code: "STP", name: "Sao Tome and Principe", slug: "sao-tome-and-principe", region: "Africa", subRegion: "Middle Africa", flag: "🇸🇹", population: 223000 },
  { code: "SEN", name: "Senegal", slug: "senegal", region: "Africa", subRegion: "Western Africa", flag: "🇸🇳", population: 17320000 },
  { code: "SYC", name: "Seychelles", slug: "seychelles", region: "Africa", subRegion: "Eastern Africa", flag: "🇸🇨", population: 100000 },
  { code: "SLE", name: "Sierra Leone", slug: "sierra-leone", region: "Africa", subRegion: "Western Africa", flag: "🇸🇱", population: 8610000 },
  { code: "SOM", name: "Somalia", slug: "somalia", region: "Africa", subRegion: "Eastern Africa", flag: "🇸🇴", population: 17600000 },
  { code: "ZAF", name: "South Africa", slug: "south-africa", region: "Africa", subRegion: "Southern Africa", flag: "🇿🇦", population: 59390000 },
  { code: "SSD", name: "South Sudan", slug: "south-sudan", region: "Africa", subRegion: "Eastern Africa", flag: "🇸🇸", population: 11380000 },
  { code: "SDN", name: "Sudan", slug: "sudan", region: "Africa", subRegion: "Northern Africa", flag: "🇸🇩", population: 46750000 },
  { code: "TZA", name: "Tanzania", slug: "tanzania", region: "Africa", subRegion: "Eastern Africa", flag: "🇹🇿", population: 63590000 },
  { code: "TGO", name: "Togo", slug: "togo", region: "Africa", subRegion: "Western Africa", flag: "🇹🇬", population: 8850000 },
  { code: "TUN", name: "Tunisia", slug: "tunisia", region: "Africa", subRegion: "Northern Africa", flag: "🇹🇳", population: 12360000 },
  { code: "UGA", name: "Uganda", slug: "uganda", region: "Africa", subRegion: "Eastern Africa", flag: "🇺🇬", population: 47250000 },
  { code: "ZMB", name: "Zambia", slug: "zambia", region: "Africa", subRegion: "Eastern Africa", flag: "🇿🇲", population: 19470000 },
  { code: "ZWE", name: "Zimbabwe", slug: "zimbabwe", region: "Africa", subRegion: "Eastern Africa", flag: "🇿🇼", population: 15990000 },

  // ==================== NORTH AMERICA (23 countries) ====================
  { code: "ATG", name: "Antigua and Barbuda", slug: "antigua-and-barbuda", region: "North America", subRegion: "Caribbean", flag: "🇦🇬", population: 100000 },
  { code: "BHS", name: "Bahamas", slug: "bahamas", region: "North America", subRegion: "Caribbean", flag: "🇧🇸", population: 410000 },
  { code: "BRB", name: "Barbados", slug: "barbados", region: "North America", subRegion: "Caribbean", flag: "🇧🇧", population: 288000 },
  { code: "BLZ", name: "Belize", slug: "belize", region: "North America", subRegion: "Central America", flag: "🇧🇿", population: 410000 },
  { code: "CAN", name: "Canada", slug: "canada", region: "North America", subRegion: "Northern America", flag: "🇨🇦", population: 38250000 },
  { code: "CRI", name: "Costa Rica", slug: "costa-rica", region: "North America", subRegion: "Central America", flag: "🇨🇷", population: 5180000 },
  { code: "CUB", name: "Cuba", slug: "cuba", region: "North America", subRegion: "Caribbean", flag: "🇨🇺", population: 11260000 },
  { code: "DMA", name: "Dominica", slug: "dominica", region: "North America", subRegion: "Caribbean", flag: "🇩🇲", population: 72000 },
  { code: "DOM", name: "Dominican Republic", slug: "dominican-republic", region: "North America", subRegion: "Caribbean", flag: "🇩🇴", population: 11120000 },
  { code: "SLV", name: "El Salvador", slug: "el-salvador", region: "North America", subRegion: "Central America", flag: "🇸🇻", population: 6310000 },
  { code: "GRD", name: "Grenada", slug: "grenada", region: "North America", subRegion: "Caribbean", flag: "🇬🇩", population: 125000 },
  { code: "GTM", name: "Guatemala", slug: "guatemala", region: "North America", subRegion: "Central America", flag: "🇬🇹", population: 17610000 },
  { code: "HTI", name: "Haiti", slug: "haiti", region: "North America", subRegion: "Caribbean", flag: "🇭🇹", population: 11580000 },
  { code: "HND", name: "Honduras", slug: "honduras", region: "North America", subRegion: "Central America", flag: "🇭🇳", population: 10430000 },
  { code: "JAM", name: "Jamaica", slug: "jamaica", region: "North America", subRegion: "Caribbean", flag: "🇯🇲", population: 2830000 },
  { code: "MEX", name: "Mexico", slug: "mexico", region: "North America", subRegion: "Central America", flag: "🇲🇽", population: 128900000 },
  { code: "NIC", name: "Nicaragua", slug: "nicaragua", region: "North America", subRegion: "Central America", flag: "🇳🇮", population: 6950000 },
  { code: "PAN", name: "Panama", slug: "panama", region: "North America", subRegion: "Central America", flag: "🇵🇦", population: 4380000 },
  { code: "KNA", name: "Saint Kitts and Nevis", slug: "saint-kitts-and-nevis", region: "North America", subRegion: "Caribbean", flag: "🇰🇳", population: 54000 },
  { code: "LCA", name: "Saint Lucia", slug: "saint-lucia", region: "North America", subRegion: "Caribbean", flag: "🇱🇨", population: 180000 },
  { code: "VCT", name: "Saint Vincent and the Grenadines", slug: "saint-vincent-and-the-grenadines", region: "North America", subRegion: "Caribbean", flag: "🇻🇨", population: 111000 },
  { code: "TTO", name: "Trinidad and Tobago", slug: "trinidad-and-tobago", region: "North America", subRegion: "Caribbean", flag: "🇹🇹", population: 1530000 },
  { code: "USA", name: "United States", slug: "united-states", region: "North America", subRegion: "Northern America", flag: "🇺🇸", population: 331900000 },

  // ==================== SOUTH AMERICA (12 countries) ====================
  { code: "ARG", name: "Argentina", slug: "argentina", region: "South America", subRegion: "South America", flag: "🇦🇷", population: 45810000 },
  { code: "BOL", name: "Bolivia", slug: "bolivia", region: "South America", subRegion: "South America", flag: "🇧🇴", population: 12080000 },
  { code: "BRA", name: "Brazil", slug: "brazil", region: "South America", subRegion: "South America", flag: "🇧🇷", population: 214300000 },
  { code: "CHL", name: "Chile", slug: "chile", region: "South America", subRegion: "South America", flag: "🇨🇱", population: 19490000 },
  { code: "COL", name: "Colombia", slug: "colombia", region: "South America", subRegion: "South America", flag: "🇨🇴", population: 51870000 },
  { code: "ECU", name: "Ecuador", slug: "ecuador", region: "South America", subRegion: "South America", flag: "🇪🇨", population: 18000000 },
  { code: "GUY", name: "Guyana", slug: "guyana", region: "South America", subRegion: "South America", flag: "🇬🇾", population: 808000 },
  { code: "PRY", name: "Paraguay", slug: "paraguay", region: "South America", subRegion: "South America", flag: "🇵🇾", population: 6780000 },
  { code: "PER", name: "Peru", slug: "peru", region: "South America", subRegion: "South America", flag: "🇵🇪", population: 34050000 },
  { code: "SUR", name: "Suriname", slug: "suriname", region: "South America", subRegion: "South America", flag: "🇸🇷", population: 612000 },
  { code: "URY", name: "Uruguay", slug: "uruguay", region: "South America", subRegion: "South America", flag: "🇺🇾", population: 3420000 },
  { code: "VEN", name: "Venezuela", slug: "venezuela", region: "South America", subRegion: "South America", flag: "🇻🇪", population: 28440000 },

  // ==================== OCEANIA (14 countries) ====================
  { code: "AUS", name: "Australia", slug: "australia", region: "Oceania", subRegion: "Australia and New Zealand", flag: "🇦🇺", population: 25690000 },
  { code: "FJI", name: "Fiji", slug: "fiji", region: "Oceania", subRegion: "Melanesia", flag: "🇫🇯", population: 930000 },
  { code: "KIR", name: "Kiribati", slug: "kiribati", region: "Oceania", subRegion: "Micronesia", flag: "🇰🇮", population: 128000 },
  { code: "MHL", name: "Marshall Islands", slug: "marshall-islands", region: "Oceania", subRegion: "Micronesia", flag: "🇲🇭", population: 42000 },
  { code: "FSM", name: "Micronesia", slug: "micronesia", region: "Oceania", subRegion: "Micronesia", flag: "🇫🇲", population: 115000 },
  { code: "NRU", name: "Nauru", slug: "nauru", region: "Oceania", subRegion: "Micronesia", flag: "🇳🇷", population: 11000 },
  { code: "NZL", name: "New Zealand", slug: "new-zealand", region: "Oceania", subRegion: "Australia and New Zealand", flag: "🇳🇿", population: 5120000 },
  { code: "PLW", name: "Palau", slug: "palau", region: "Oceania", subRegion: "Micronesia", flag: "🇵🇼", population: 18000 },
  { code: "PNG", name: "Papua New Guinea", slug: "papua-new-guinea", region: "Oceania", subRegion: "Melanesia", flag: "🇵🇬", population: 10140000 },
  { code: "WSM", name: "Samoa", slug: "samoa", region: "Oceania", subRegion: "Polynesia", flag: "🇼🇸", population: 222000 },
  { code: "SLB", name: "Solomon Islands", slug: "solomon-islands", region: "Oceania", subRegion: "Melanesia", flag: "🇸🇧", population: 724000 },
  { code: "TON", name: "Tonga", slug: "tonga", region: "Oceania", subRegion: "Polynesia", flag: "🇹🇴", population: 107000 },
  { code: "TUV", name: "Tuvalu", slug: "tuvalu", region: "Oceania", subRegion: "Polynesia", flag: "🇹🇻", population: 11000 },
  { code: "VUT", name: "Vanuatu", slug: "vanuatu", region: "Oceania", subRegion: "Melanesia", flag: "🇻🇺", population: 320000 },
];

// Group countries by region
export const COUNTRIES_BY_REGION: Record<string, CountryBasicConfig[]> = {
  "Europe": ALL_COUNTRIES.filter(c => c.region === "Europe"),
  "Asia": ALL_COUNTRIES.filter(c => c.region === "Asia"),
  "Africa": ALL_COUNTRIES.filter(c => c.region === "Africa"),
  "North America": ALL_COUNTRIES.filter(c => c.region === "North America"),
  "South America": ALL_COUNTRIES.filter(c => c.region === "South America"),
  "Oceania": ALL_COUNTRIES.filter(c => c.region === "Oceania"),
};

// Group countries by sub-region for detailed navigation
export const COUNTRIES_BY_SUB_REGION: Record<string, CountryBasicConfig[]> = {};
ALL_COUNTRIES.forEach(country => {
  const subRegion = country.subRegion || country.region;
  if (!COUNTRIES_BY_SUB_REGION[subRegion]) {
    COUNTRIES_BY_SUB_REGION[subRegion] = [];
  }
  COUNTRIES_BY_SUB_REGION[subRegion].push(country);
});

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

/**
 * Get top countries by population within a region
 */
export function getTopCountriesByRegion(region: string, limit: number = 10): CountryBasicConfig[] {
  return COUNTRIES_BY_REGION[region]
    ?.sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, limit) || [];
}

/**
 * Get region statistics
 */
export function getRegionStats(): { region: string; count: number }[] {
  return Object.entries(COUNTRIES_BY_REGION).map(([region, countries]) => ({
    region,
    count: countries.length
  }));
}
