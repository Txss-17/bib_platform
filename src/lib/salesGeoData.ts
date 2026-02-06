// Geographic data structure for sales map

export interface SalesLocation {
  id: string;
  name: string;
  code: string;
  sales: number;
  revenue: number;
  orders: number;
  children?: SalesLocation[];
}

export interface Continent {
  id: string;
  name: string;
  code: string;
  countries: Country[];
}

export interface Country {
  id: string;
  name: string;
  code: string;
  cities: City[];
}

export interface City {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

// Continent definitions with sample country data
export const continents: Record<string, { name: string; emoji: string; countries: string[] }> = {
  EU: {
    name: "Europe",
    emoji: "🇪🇺",
    countries: ["FR", "DE", "ES", "IT", "BE", "NL", "PT", "CH", "AT", "PL"],
  },
  AF: {
    name: "Afrique",
    emoji: "🌍",
    countries: ["MA", "SN", "CI", "TN", "CM", "DZ", "EG", "NG", "ZA", "KE"],
  },
  NA: {
    name: "Amérique du Nord",
    emoji: "🌎",
    countries: ["US", "CA", "MX"],
  },
  SA: {
    name: "Amérique du Sud",
    emoji: "🌎",
    countries: ["BR", "AR", "CO", "CL", "PE"],
  },
  AS: {
    name: "Asie",
    emoji: "🌏",
    countries: ["CN", "JP", "KR", "IN", "SG", "TH", "VN", "ID"],
  },
  OC: {
    name: "Océanie",
    emoji: "🌏",
    countries: ["AU", "NZ"],
  },
};

export const countries: Record<string, { name: string; emoji: string; cities: string[] }> = {
  // Europe
  FR: { name: "France", emoji: "🇫🇷", cities: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Bordeaux"] },
  DE: { name: "Allemagne", emoji: "🇩🇪", cities: ["Berlin", "Munich", "Hambourg", "Francfort", "Cologne"] },
  ES: { name: "Espagne", emoji: "🇪🇸", cities: ["Madrid", "Barcelone", "Valence", "Séville", "Bilbao"] },
  IT: { name: "Italie", emoji: "🇮🇹", cities: ["Rome", "Milan", "Naples", "Turin", "Florence"] },
  BE: { name: "Belgique", emoji: "🇧🇪", cities: ["Bruxelles", "Anvers", "Gand", "Liège"] },
  NL: { name: "Pays-Bas", emoji: "🇳🇱", cities: ["Amsterdam", "Rotterdam", "La Haye", "Utrecht"] },
  PT: { name: "Portugal", emoji: "🇵🇹", cities: ["Lisbonne", "Porto", "Faro"] },
  CH: { name: "Suisse", emoji: "🇨🇭", cities: ["Zurich", "Genève", "Bâle", "Berne"] },
  AT: { name: "Autriche", emoji: "🇦🇹", cities: ["Vienne", "Salzbourg", "Graz"] },
  PL: { name: "Pologne", emoji: "🇵🇱", cities: ["Varsovie", "Cracovie", "Gdansk"] },
  
  // Afrique
  MA: { name: "Maroc", emoji: "🇲🇦", cities: ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger"] },
  SN: { name: "Sénégal", emoji: "🇸🇳", cities: ["Dakar", "Saint-Louis", "Thiès"] },
  CI: { name: "Côte d'Ivoire", emoji: "🇨🇮", cities: ["Abidjan", "Bouaké", "Yamoussoukro"] },
  TN: { name: "Tunisie", emoji: "🇹🇳", cities: ["Tunis", "Sfax", "Sousse"] },
  CM: { name: "Cameroun", emoji: "🇨🇲", cities: ["Douala", "Yaoundé", "Garoua"] },
  DZ: { name: "Algérie", emoji: "🇩🇿", cities: ["Alger", "Oran", "Constantine"] },
  EG: { name: "Égypte", emoji: "🇪🇬", cities: ["Le Caire", "Alexandrie", "Gizeh"] },
  NG: { name: "Nigeria", emoji: "🇳🇬", cities: ["Lagos", "Abuja", "Kano"] },
  ZA: { name: "Afrique du Sud", emoji: "🇿🇦", cities: ["Johannesburg", "Le Cap", "Durban"] },
  KE: { name: "Kenya", emoji: "🇰🇪", cities: ["Nairobi", "Mombasa"] },
  
  // Amérique du Nord
  US: { name: "États-Unis", emoji: "🇺🇸", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Miami"] },
  CA: { name: "Canada", emoji: "🇨🇦", cities: ["Toronto", "Montréal", "Vancouver", "Ottawa"] },
  MX: { name: "Mexique", emoji: "🇲🇽", cities: ["Mexico", "Guadalajara", "Monterrey"] },
  
  // Amérique du Sud
  BR: { name: "Brésil", emoji: "🇧🇷", cities: ["São Paulo", "Rio de Janeiro", "Brasília"] },
  AR: { name: "Argentine", emoji: "🇦🇷", cities: ["Buenos Aires", "Córdoba", "Rosario"] },
  CO: { name: "Colombie", emoji: "🇨🇴", cities: ["Bogotá", "Medellín", "Cali"] },
  CL: { name: "Chili", emoji: "🇨🇱", cities: ["Santiago", "Valparaíso"] },
  PE: { name: "Pérou", emoji: "🇵🇪", cities: ["Lima", "Arequipa", "Cusco"] },
  
  // Asie
  CN: { name: "Chine", emoji: "🇨🇳", cities: ["Shanghai", "Pékin", "Shenzhen", "Hong Kong"] },
  JP: { name: "Japon", emoji: "🇯🇵", cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama"] },
  KR: { name: "Corée du Sud", emoji: "🇰🇷", cities: ["Séoul", "Busan", "Incheon"] },
  IN: { name: "Inde", emoji: "🇮🇳", cities: ["Mumbai", "Delhi", "Bangalore", "Chennai"] },
  SG: { name: "Singapour", emoji: "🇸🇬", cities: ["Singapour"] },
  TH: { name: "Thaïlande", emoji: "🇹🇭", cities: ["Bangkok", "Chiang Mai", "Phuket"] },
  VN: { name: "Vietnam", emoji: "🇻🇳", cities: ["Hô Chi Minh-Ville", "Hanoï", "Da Nang"] },
  ID: { name: "Indonésie", emoji: "🇮🇩", cities: ["Jakarta", "Surabaya", "Bali"] },
  
  // Océanie
  AU: { name: "Australie", emoji: "🇦🇺", cities: ["Sydney", "Melbourne", "Brisbane", "Perth"] },
  NZ: { name: "Nouvelle-Zélande", emoji: "🇳🇿", cities: ["Auckland", "Wellington", "Christchurch"] },
};

export function getContinentForMarket(market: string): string {
  for (const [continentCode, continent] of Object.entries(continents)) {
    if (continent.countries.includes(market)) {
      return continentCode;
    }
  }
  return "EU"; // Default
}
