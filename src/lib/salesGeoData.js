const continents = {
  EU: {
    name: "Europe",
    emoji: "\u{1F1EA}\u{1F1FA}",
    countries: ["FR", "DE", "ES", "IT", "BE", "NL", "PT", "CH", "AT", "PL"]
  },
  AF: {
    name: "Afrique",
    emoji: "\u{1F30D}",
    countries: ["MA", "SN", "CI", "TN", "CM", "DZ", "EG", "NG", "ZA", "KE"]
  },
  NA: {
    name: "Am\xE9rique du Nord",
    emoji: "\u{1F30E}",
    countries: ["US", "CA", "MX"]
  },
  SA: {
    name: "Am\xE9rique du Sud",
    emoji: "\u{1F30E}",
    countries: ["BR", "AR", "CO", "CL", "PE"]
  },
  AS: {
    name: "Asie",
    emoji: "\u{1F30F}",
    countries: ["CN", "JP", "KR", "IN", "SG", "TH", "VN", "ID"]
  },
  OC: {
    name: "Oc\xE9anie",
    emoji: "\u{1F30F}",
    countries: ["AU", "NZ"]
  }
};
const countries = {
  // Europe
  FR: { name: "France", emoji: "\u{1F1EB}\u{1F1F7}", cities: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Bordeaux"] },
  DE: { name: "Allemagne", emoji: "\u{1F1E9}\u{1F1EA}", cities: ["Berlin", "Munich", "Hambourg", "Francfort", "Cologne"] },
  ES: { name: "Espagne", emoji: "\u{1F1EA}\u{1F1F8}", cities: ["Madrid", "Barcelone", "Valence", "S\xE9ville", "Bilbao"] },
  IT: { name: "Italie", emoji: "\u{1F1EE}\u{1F1F9}", cities: ["Rome", "Milan", "Naples", "Turin", "Florence"] },
  BE: { name: "Belgique", emoji: "\u{1F1E7}\u{1F1EA}", cities: ["Bruxelles", "Anvers", "Gand", "Li\xE8ge"] },
  NL: { name: "Pays-Bas", emoji: "\u{1F1F3}\u{1F1F1}", cities: ["Amsterdam", "Rotterdam", "La Haye", "Utrecht"] },
  PT: { name: "Portugal", emoji: "\u{1F1F5}\u{1F1F9}", cities: ["Lisbonne", "Porto", "Faro"] },
  CH: { name: "Suisse", emoji: "\u{1F1E8}\u{1F1ED}", cities: ["Zurich", "Gen\xE8ve", "B\xE2le", "Berne"] },
  AT: { name: "Autriche", emoji: "\u{1F1E6}\u{1F1F9}", cities: ["Vienne", "Salzbourg", "Graz"] },
  PL: { name: "Pologne", emoji: "\u{1F1F5}\u{1F1F1}", cities: ["Varsovie", "Cracovie", "Gdansk"] },
  // Afrique
  MA: { name: "Maroc", emoji: "\u{1F1F2}\u{1F1E6}", cities: ["Casablanca", "Rabat", "Marrakech", "F\xE8s", "Tanger"] },
  SN: { name: "S\xE9n\xE9gal", emoji: "\u{1F1F8}\u{1F1F3}", cities: ["Dakar", "Saint-Louis", "Thi\xE8s"] },
  CI: { name: "C\xF4te d'Ivoire", emoji: "\u{1F1E8}\u{1F1EE}", cities: ["Abidjan", "Bouak\xE9", "Yamoussoukro"] },
  TN: { name: "Tunisie", emoji: "\u{1F1F9}\u{1F1F3}", cities: ["Tunis", "Sfax", "Sousse"] },
  CM: { name: "Cameroun", emoji: "\u{1F1E8}\u{1F1F2}", cities: ["Douala", "Yaound\xE9", "Garoua"] },
  DZ: { name: "Alg\xE9rie", emoji: "\u{1F1E9}\u{1F1FF}", cities: ["Alger", "Oran", "Constantine"] },
  EG: { name: "\xC9gypte", emoji: "\u{1F1EA}\u{1F1EC}", cities: ["Le Caire", "Alexandrie", "Gizeh"] },
  NG: { name: "Nigeria", emoji: "\u{1F1F3}\u{1F1EC}", cities: ["Lagos", "Abuja", "Kano"] },
  ZA: { name: "Afrique du Sud", emoji: "\u{1F1FF}\u{1F1E6}", cities: ["Johannesburg", "Le Cap", "Durban"] },
  KE: { name: "Kenya", emoji: "\u{1F1F0}\u{1F1EA}", cities: ["Nairobi", "Mombasa"] },
  // Amérique du Nord
  US: { name: "\xC9tats-Unis", emoji: "\u{1F1FA}\u{1F1F8}", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Miami"] },
  CA: { name: "Canada", emoji: "\u{1F1E8}\u{1F1E6}", cities: ["Toronto", "Montr\xE9al", "Vancouver", "Ottawa"] },
  MX: { name: "Mexique", emoji: "\u{1F1F2}\u{1F1FD}", cities: ["Mexico", "Guadalajara", "Monterrey"] },
  // Amérique du Sud
  BR: { name: "Br\xE9sil", emoji: "\u{1F1E7}\u{1F1F7}", cities: ["S\xE3o Paulo", "Rio de Janeiro", "Bras\xEDlia"] },
  AR: { name: "Argentine", emoji: "\u{1F1E6}\u{1F1F7}", cities: ["Buenos Aires", "C\xF3rdoba", "Rosario"] },
  CO: { name: "Colombie", emoji: "\u{1F1E8}\u{1F1F4}", cities: ["Bogot\xE1", "Medell\xEDn", "Cali"] },
  CL: { name: "Chili", emoji: "\u{1F1E8}\u{1F1F1}", cities: ["Santiago", "Valpara\xEDso"] },
  PE: { name: "P\xE9rou", emoji: "\u{1F1F5}\u{1F1EA}", cities: ["Lima", "Arequipa", "Cusco"] },
  // Asie
  CN: { name: "Chine", emoji: "\u{1F1E8}\u{1F1F3}", cities: ["Shanghai", "P\xE9kin", "Shenzhen", "Hong Kong"] },
  JP: { name: "Japon", emoji: "\u{1F1EF}\u{1F1F5}", cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama"] },
  KR: { name: "Cor\xE9e du Sud", emoji: "\u{1F1F0}\u{1F1F7}", cities: ["S\xE9oul", "Busan", "Incheon"] },
  IN: { name: "Inde", emoji: "\u{1F1EE}\u{1F1F3}", cities: ["Mumbai", "Delhi", "Bangalore", "Chennai"] },
  SG: { name: "Singapour", emoji: "\u{1F1F8}\u{1F1EC}", cities: ["Singapour"] },
  TH: { name: "Tha\xEFlande", emoji: "\u{1F1F9}\u{1F1ED}", cities: ["Bangkok", "Chiang Mai", "Phuket"] },
  VN: { name: "Vietnam", emoji: "\u{1F1FB}\u{1F1F3}", cities: ["H\xF4 Chi Minh-Ville", "Hano\xEF", "Da Nang"] },
  ID: { name: "Indon\xE9sie", emoji: "\u{1F1EE}\u{1F1E9}", cities: ["Jakarta", "Surabaya", "Bali"] },
  // Océanie
  AU: { name: "Australie", emoji: "\u{1F1E6}\u{1F1FA}", cities: ["Sydney", "Melbourne", "Brisbane", "Perth"] },
  NZ: { name: "Nouvelle-Z\xE9lande", emoji: "\u{1F1F3}\u{1F1FF}", cities: ["Auckland", "Wellington", "Christchurch"] }
};
function getContinentForMarket(market) {
  for (const [continentCode, continent] of Object.entries(continents)) {
    if (continent.countries.includes(market)) {
      return continentCode;
    }
  }
  return "EU";
}
export {
  continents,
  countries,
  getContinentForMarket
};
