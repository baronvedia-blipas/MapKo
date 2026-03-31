/**
 * Maps Google Places types to user-friendly category names.
 */

const TYPE_TO_CATEGORY: Record<string, string> = {
  // ── High-value targets (prioritized over generic categories) ──
  hair_care: "Barberias",
  // Restaurants
  restaurant: "Restaurantes",
  cafe: "Restaurantes",
  bakery: "Restaurantes",
  bar: "Restaurantes",
  meal_delivery: "Restaurantes",
  meal_takeaway: "Restaurantes",
  food: "Restaurantes",
  // Clothing
  clothing_store: "Tiendas de Ropa",
  shoe_store: "Tiendas de Ropa",
  // Beauty / Perfumeria
  beauty_salon: "Perfumerias",
  spa: "Perfumerias",
  // ── Other categories ──
  gym: "Fitness",
  physiotherapist: "Health & Beauty",
  dentist: "Medical",
  doctor: "Medical",
  hospital: "Medical",
  pharmacy: "Medical",
  veterinary_care: "Medical",
  health: "Medical",
  store: "Retail",
  jewelry_store: "Retail",
  electronics_store: "Retail",
  furniture_store: "Retail",
  supermarket: "Retail",
  convenience_store: "Retail",
  hardware_store: "Retail",
  pet_store: "Retail",
  florist: "Retail",
  plumber: "Services",
  electrician: "Services",
  lawyer: "Services",
  accounting: "Services",
  insurance_agency: "Services",
  real_estate_agency: "Services",
  locksmith: "Services",
  painter: "Services",
  moving_company: "Services",
  travel_agency: "Services",
  car_repair: "Automotive",
  car_dealer: "Automotive",
  car_wash: "Automotive",
  gas_station: "Automotive",
  car_rental: "Automotive",
  parking: "Automotive",
  school: "Education",
  university: "Education",
  library: "Education",
  book_store: "Education",
  lodging: "Lodging",
  hotel: "Lodging",
  motel: "Lodging",
  campground: "Lodging",
  movie_theater: "Entertainment",
  night_club: "Entertainment",
  amusement_park: "Entertainment",
  bowling_alley: "Entertainment",
  casino: "Entertainment",
  museum: "Entertainment",
  art_gallery: "Entertainment",
  stadium: "Entertainment",
  bank: "Finance",
  atm: "Finance",
  finance: "Finance",
  general_contractor: "Construction",
  roofing_contractor: "Construction",
  home_goods_store: "Construction",
  liquor_store: "Food & Drinks",
  taxi_stand: "Transportation",
  bus_station: "Transportation",
  transit_station: "Transportation",
  airport: "Transportation",
  train_station: "Transportation",
  local_government_office: "Government",
  post_office: "Government",
  courthouse: "Government",
  fire_station: "Government",
  police: "Government",
  church: "Religion",
  mosque: "Religion",
  hindu_temple: "Religion",
  synagogue: "Religion",
};

export function mapGoogleTypeToCategory(types: string[]): string {
  for (const type of types) {
    if (TYPE_TO_CATEGORY[type]) {
      return TYPE_TO_CATEGORY[type];
    }
  }
  return "Other";
}

export function getGoogleTypesForCategory(category: string): string[] {
  return Object.entries(TYPE_TO_CATEGORY)
    .filter(([, cat]) => cat === category)
    .map(([type]) => type);
}
