export type IndiaTravelProductKey =
  | "flights"
  | "hotels"
  | "homestays"
  | "holiday-packages"
  | "trains"
  | "buses"
  | "cabs";

interface SearchField {
  label: string;
  value: string;
}

interface OfferCard {
  title: string;
  subtitle: string;
  price: string;
}

interface DestinationCard {
  city: string;
  detail: string;
  badge: string;
}

export interface HolidayPackage {
  id: string;
  title: string;
  destination: string;
  state: string;
  city: string;
  category: "holiday" | "honeymoon" | "family" | "adventure" | "spiritual" | "luxury";
  budgetTier: "low" | "mid" | "high";
  hotelCategory: "3 Star" | "4 Star" | "5 Star" | "Boutique";
  nights: number;
  days: number;
  pricePerPerson: number;
  minGuests: number;
  withFlightPrice: number;
  withoutFlightPrice: number;
  transfer: string;
  meals: string;
  highlights: string[];
  image: string;
  imageSource: string;
  summary: string;
  itinerary: string[];
}

export interface IndiaTravelProduct {
  key: IndiaTravelProductKey;
  label: string;
  icon: string;
  themeClass: string;
  heroTitle: string;
  heroText: string;
  heroBadge: string;
  actionLabel: string;
  artTitle: string;
  artSubtitle: string;
  searchFields: SearchField[];
  highlights: string[];
  offers: OfferCard[];
  destinations: DestinationCard[];
}

export const indiaTravelProducts: IndiaTravelProduct[] = [
  {
    key: "flights",
    label: "Flights",
    icon: "✈️",
    themeClass: "flights",
    heroTitle: "Book domestic flights across India",
    heroText: "Search popular India routes, compare fares, and plan quick city hops from Delhi to Goa, Bengaluru, Mumbai, Jaipur, Srinagar, and more.",
    heroBadge: "India domestic only",
    actionLabel: "Search Flights",
    artTitle: "Cartoon sky route map",
    artSubtitle: "Airplane trails, bright clouds, and India city hops",
    searchFields: [
      { label: "From", value: "Delhi" },
      { label: "To", value: "Goa" },
      { label: "Departure", value: "22 Apr 2026" },
      { label: "Travellers", value: "2 Adults" },
    ],
    highlights: ["Free date change on select fares", "Student and family filters", "Morning, evening, and non-stop route shortcuts"],
    offers: [
      { title: "Delhi to Mumbai", subtitle: "Fastest business route", price: "From Rs 4,899" },
      { title: "Bengaluru to Goa", subtitle: "Weekend beach escape", price: "From Rs 3,799" },
      { title: "Kolkata to Bagdogra", subtitle: "Gateway to Darjeeling", price: "From Rs 4,250" },
    ],
    destinations: [
      { city: "Goa", detail: "Beaches, cafes, and long weekends", badge: "Popular in summer" },
      { city: "Jaipur", detail: "Palaces, food walks, and heritage stays", badge: "Culture pick" },
      { city: "Srinagar", detail: "Houseboats and mountain scenery", badge: "Scenic route" },
    ],
  },
  {
    key: "hotels",
    label: "Hotels",
    icon: "🏨",
    themeClass: "hotels",
    heroTitle: "Find hotels in Indian cities and hill stations",
    heroText: "Browse family hotels, city stays, and premium resorts for Indian destinations with quick filters for breakfast, ratings, and couple-friendly stays.",
    heroBadge: "Curated for Indian stays",
    actionLabel: "Find Hotels",
    artTitle: "Cartoon hotel boulevard",
    artSubtitle: "Bell desk, neon signs, and cozy travel doodles",
    searchFields: [
      { label: "City", value: "Udaipur" },
      { label: "Check-in", value: "24 Apr 2026" },
      { label: "Check-out", value: "27 Apr 2026" },
      { label: "Rooms", value: "1 Room, 2 Guests" },
    ],
    highlights: ["Breakfast included cards", "Near market and station filters", "Budget to luxury sorting"],
    offers: [
      { title: "Udaipur lake stays", subtitle: "Views and rooftop dining", price: "From Rs 3,299" },
      { title: "Shimla hotels", subtitle: "Mall Road and valley views", price: "From Rs 2,799" },
      { title: "Hyderabad city hotels", subtitle: "Airport and business zones", price: "From Rs 3,150" },
    ],
    destinations: [
      { city: "Manali", detail: "Snow trips and mountain balconies", badge: "Hill stay" },
      { city: "Kochi", detail: "Waterfront rooms and old town walks", badge: "Coastal stay" },
      { city: "Rishikesh", detail: "Yoga, cafes, and river access", badge: "Weekend favorite" },
    ],
  },
  {
    key: "homestays",
    label: "Homestays",
    icon: "🏡",
    themeClass: "homestays",
    heroTitle: "Book charming homestays around India",
    heroText: "Stay in cozy villas, mountain cabins, and family homes across Coorg, Kerala, Himachal, Goa, and the North East.",
    heroBadge: "Local stays and family trips",
    actionLabel: "Explore Homestays",
    artTitle: "Cartoon hillside homestay",
    artSubtitle: "Warm windows, leafy trees, and a cheerful road trip van",
    searchFields: [
      { label: "Area", value: "Coorg" },
      { label: "Check-in", value: "28 Apr 2026" },
      { label: "Check-out", value: "1 May 2026" },
      { label: "Guests", value: "4 Guests" },
    ],
    highlights: ["Pet-friendly picks", "Entire villa and cottage options", "Verified host and kitchen filters"],
    offers: [
      { title: "Coorg cottages", subtitle: "Coffee estate escapes", price: "From Rs 4,199" },
      { title: "Goa villas", subtitle: "Private pool weekends", price: "From Rs 6,900" },
      { title: "Kasol cabins", subtitle: "Mountain views and bonfire vibes", price: "From Rs 2,850" },
    ],
    destinations: [
      { city: "Munnar", detail: "Tea hills and misty mornings", badge: "Nature stay" },
      { city: "Shillong", detail: "Pine views and local culture", badge: "North East pick" },
      { city: "Alibaug", detail: "Beach houses near Mumbai", badge: "Quick getaway" },
    ],
  },
  {
    key: "holiday-packages",
    label: "Holiday Packages",
    icon: "🎒",
    themeClass: "packages",
    heroTitle: "Choose ready-made India holiday packages",
    heroText: "Bundle stays, sightseeing, airport transfers, and day plans for popular Indian vacations without planning every step manually.",
    heroBadge: "Indian tours and family holidays",
    actionLabel: "View Packages",
    artTitle: "Cartoon India postcard board",
    artSubtitle: "Palaces, beaches, mountains, and colorful luggage stickers",
    searchFields: [
      { label: "Destination", value: "Kerala" },
      { label: "Duration", value: "5 Nights / 6 Days" },
      { label: "Month", value: "May 2026" },
      { label: "Travelers", value: "Family of 4" },
    ],
    highlights: ["Honeymoon and family package tabs", "Cab, hotel, and sightseeing bundled", "Popular departures from metro cities"],
    offers: [
      { title: "Kerala backwaters", subtitle: "Houseboat and hill station combo", price: "From Rs 18,999" },
      { title: "Rajasthan trail", subtitle: "Jaipur, Jodhpur, Udaipur", price: "From Rs 22,499" },
      { title: "Andaman getaway", subtitle: "Island ferry and beach stays", price: "From Rs 29,900" },
    ],
    destinations: [
      { city: "Kashmir", detail: "Valley views and tulip gardens", badge: "Season special" },
      { city: "Sikkim", detail: "Gangtok, lakes, and mountain roads", badge: "Adventure pick" },
      { city: "Golden Triangle", detail: "Delhi, Agra, Jaipur circuit", badge: "Classic India" },
    ],
  },
  {
    key: "trains",
    label: "Trains",
    icon: "🚆",
    themeClass: "trains",
    heroTitle: "Search train routes within India",
    heroText: "Plan rail journeys for major Indian routes with sleeper, 3AC, and chair car style options for city-to-city travel.",
    heroBadge: "India rail journeys",
    actionLabel: "Check Trains",
    artTitle: "Cartoon rail platform",
    artSubtitle: "Friendly locomotive, chai stall, and route boards",
    searchFields: [
      { label: "From", value: "New Delhi" },
      { label: "To", value: "Varanasi" },
      { label: "Travel Date", value: "25 Apr 2026" },
      { label: "Coach", value: "3AC" },
    ],
    highlights: ["Fast route suggestions", "Festival travel reminders", "Popular overnight train picks"],
    offers: [
      { title: "Delhi to Lucknow", subtitle: "Business and family travel", price: "Chair car from Rs 1,045" },
      { title: "Mumbai to Ahmedabad", subtitle: "Quick western corridor", price: "3AC from Rs 1,280" },
      { title: "Chennai to Madurai", subtitle: "Temple route favorite", price: "Sleeper from Rs 490" },
    ],
    destinations: [
      { city: "Varanasi", detail: "Ghats, food, and spiritual circuits", badge: "Heritage route" },
      { city: "Mysuru", detail: "Royal palaces and weekend travel", badge: "South route" },
      { city: "Amritsar", detail: "Golden Temple and Punjabi food trails", badge: "Popular rail trip" },
    ],
  },
  {
    key: "buses",
    label: "Buses",
    icon: "🚌",
    themeClass: "buses",
    heroTitle: "Reserve interstate and city-to-city bus trips in India",
    heroText: "Book overnight and daytime buses for Indian routes with sleeper, seater, Volvo, and budget options.",
    heroBadge: "India road routes",
    actionLabel: "Find Buses",
    artTitle: "Cartoon highway bus ride",
    artSubtitle: "Sunny roads, roadside dhaba, and colorful luggage racks",
    searchFields: [
      { label: "From", value: "Bengaluru" },
      { label: "To", value: "Mysuru" },
      { label: "Date", value: "21 Apr 2026" },
      { label: "Seat type", value: "AC Seater" },
    ],
    highlights: ["Boarding point shortcuts", "Night sleeper options", "Weekend routes to hills and beaches"],
    offers: [
      { title: "Bengaluru to Coorg", subtitle: "Coffee hills weekend", price: "From Rs 899" },
      { title: "Delhi to Dehradun", subtitle: "Quick Uttarakhand run", price: "From Rs 760" },
      { title: "Pune to Goa", subtitle: "Overnight coastal bus", price: "From Rs 1,250" },
    ],
    destinations: [
      { city: "Hampi", detail: "Backpacker route and heritage ruins", badge: "Road trip favorite" },
      { city: "Ooty", detail: "Family hills and toy train combo", badge: "Cool weather" },
      { city: "Pondicherry", detail: "Beach promenade and cafes", badge: "Weekend vibe" },
    ],
  },
  {
    key: "cabs",
    label: "Cabs",
    icon: "🚕",
    themeClass: "cabs",
    heroTitle: "Book cabs for airport, outstation, and local rides in India",
    heroText: "Plan one-way, round-trip, and airport rides for Indian cities with practical pickup points and sightseeing-ready cab suggestions.",
    heroBadge: "Local and outstation rides",
    actionLabel: "Book Cabs",
    artTitle: "Cartoon taxi around India",
    artSubtitle: "Happy cab, city skyline, and landmark doodles",
    searchFields: [
      { label: "Pickup", value: "Mumbai Airport" },
      { label: "Drop", value: "Pune" },
      { label: "Date", value: "23 Apr 2026" },
      { label: "Ride type", value: "One Way" },
    ],
    highlights: ["Airport and station pickup cards", "Outstation round-trip fares", "Local sightseeing combo ideas"],
    offers: [
      { title: "Mumbai to Pune", subtitle: "Frequent airport connection", price: "From Rs 3,499" },
      { title: "Jaipur local cab", subtitle: "Amber Fort and old city loop", price: "8 hrs from Rs 2,199" },
      { title: "Chandigarh to Manali", subtitle: "Mountain cab transfer", price: "From Rs 5,999" },
    ],
    destinations: [
      { city: "Agra", detail: "Taj visit and same-day loops", badge: "Day trip" },
      { city: "Mahabaleshwar", detail: "Outstation strawberry drive", badge: "Road getaway" },
      { city: "Darjeeling", detail: "Hill transfer via Bagdogra", badge: "Mountain transfer" },
    ],
  },
];

export const indiaTravelProductMap = Object.fromEntries(
  indiaTravelProducts.map((product) => [product.key, product]),
) as Record<IndiaTravelProductKey, IndiaTravelProduct>;

export const holidayPackages: HolidayPackage[] = [
  {
    id: "pkg-kashmir-shikara",
    title: "Kashmir Shikara Retreat",
    destination: "Kashmir",
    state: "Jammu and Kashmir",
    city: "Srinagar",
    category: "honeymoon",
    budgetTier: "high",
    hotelCategory: "4 Star",
    nights: 5,
    days: 6,
    pricePerPerson: 28999,
    minGuests: 2,
    withFlightPrice: 34999,
    withoutFlightPrice: 28999,
    transfer: "Airport pickup, Shikara ride, Gulmarg cab",
    meals: "Breakfast and dinner",
    highlights: ["Dal Lake stay", "Gulmarg gondola", "Mughal gardens"],
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Dal_Lake-Srinagar.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:Dal_Lake-Srinagar.jpg",
    summary: "A romantic Kashmir escape with Dal Lake views, houseboat style moments, and mountain day trips.",
    itinerary: [
      "Day 1: Arrival in Srinagar, check-in, evening Shikara ride on Dal Lake.",
      "Day 2: Mughal Gardens, Pari Mahal, and local market shopping.",
      "Day 3: Full-day Gulmarg excursion with gondola and snow activities.",
      "Day 4: Sonamarg valley drive with riverside stops and photography.",
      "Day 5: Old Srinagar walk, kahwa tasting, and leisure time.",
      "Day 6: Breakfast and airport transfer.",
    ],
  },
  {
    id: "pkg-delhi-heritage",
    title: "Delhi Heritage Highlights",
    destination: "Delhi",
    state: "Delhi",
    city: "New Delhi",
    category: "holiday",
    budgetTier: "mid",
    hotelCategory: "3 Star",
    nights: 3,
    days: 4,
    pricePerPerson: 10111,
    minGuests: 4,
    withFlightPrice: 14999,
    withoutFlightPrice: 10111,
    transfer: "Airport pickup and city sightseeing cab",
    meals: "Breakfast only",
    highlights: ["India Gate", "Qutub Minar", "Old Delhi street food"],
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/India_Gate_on_the_evening_of_77th_Independence_day.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:India_Gate_on_the_evening_of_77th_Independence_day.jpg",
    summary: "A quick Delhi city break covering monuments, markets, and classic food trails.",
    itinerary: [
      "Day 1: Arrival, hotel check-in, India Gate and Connaught Place evening.",
      "Day 2: Qutub Minar, Lotus Temple, and Humayun's Tomb circuit.",
      "Day 3: Red Fort photo stop, Chandni Chowk rickshaw ride, and food walk.",
      "Day 4: Akshardham visit or shopping, then departure transfer.",
    ],
  },
  {
    id: "pkg-mumbai-city",
    title: "Mumbai Sea Link Escape",
    destination: "Mumbai",
    state: "Maharashtra",
    city: "Mumbai",
    category: "holiday",
    budgetTier: "mid",
    hotelCategory: "4 Star",
    nights: 4,
    days: 5,
    pricePerPerson: 18550,
    minGuests: 2,
    withFlightPrice: 24999,
    withoutFlightPrice: 18550,
    transfer: "Airport transfer and private city cab",
    meals: "Breakfast and one dinner",
    highlights: ["Gateway of India", "Marine Drive", "Elephanta Caves"],
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Gateway_of_India%2Cmumbai%2CTN553.JPG",
    imageSource: "https://commons.wikimedia.org/wiki/File:Gateway_of_India,mumbai,TN553.JPG",
    summary: "A vibrant Mumbai package with heritage icons, waterfront evenings, and local flavor.",
    itinerary: [
      "Day 1: Arrival, hotel check-in, Gateway of India and Colaba stroll.",
      "Day 2: Elephanta Caves boat ride and Kala Ghoda cafe break.",
      "Day 3: Siddhivinayak, Bandra Sea Link drive, and Juhu sunset.",
      "Day 4: Film City exterior tour or shopping at Linking Road and Phoenix Mall.",
      "Day 5: Breakfast and departure transfer.",
    ],
  },
  {
    id: "pkg-manali-snow",
    title: "Manali Snow And Solang Tour",
    destination: "Manali",
    state: "Himachal Pradesh",
    city: "Manali",
    category: "adventure",
    budgetTier: "mid",
    hotelCategory: "3 Star",
    nights: 4,
    days: 5,
    pricePerPerson: 16999,
    minGuests: 2,
    withFlightPrice: 23999,
    withoutFlightPrice: 16999,
    transfer: "Volvo transfer from Delhi and local sightseeing cab",
    meals: "Breakfast and dinner",
    highlights: ["Solang Valley", "Atal Tunnel", "Hadimba Temple"],
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Manali_Winter.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:Manali_Winter.jpg",
    summary: "A mountain break made for snow play, scenic drives, and cozy Himachal stays.",
    itinerary: [
      "Day 1: Overnight arrival or check-in, Mall Road leisure evening.",
      "Day 2: Hadimba Temple, Vashisht, and Tibetan Monastery tour.",
      "Day 3: Solang Valley with adventure rides and snow point visit.",
      "Day 4: Atal Tunnel and Sissu excursion with mountain cafes.",
      "Day 5: Breakfast and return transfer.",
    ],
  },
  {
    id: "pkg-jaipur-royal",
    title: "Jaipur Royal Holiday",
    destination: "Jaipur",
    state: "Rajasthan",
    city: "Jaipur",
    category: "family",
    budgetTier: "mid",
    hotelCategory: "4 Star",
    nights: 3,
    days: 4,
    pricePerPerson: 12999,
    minGuests: 2,
    withFlightPrice: 17999,
    withoutFlightPrice: 12999,
    transfer: "Airport pickup and full-day sightseeing cab",
    meals: "Breakfast and dinner",
    highlights: ["Amber Fort", "Hawa Mahal", "City Palace"],
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hawa_Mahal_-_Jaipur.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:Hawa_Mahal_-_Jaipur.jpg",
    summary: "A colorful Rajasthan city package with forts, palaces, and handcrafted shopping streets.",
    itinerary: [
      "Day 1: Arrival, Birla Temple, and local bazaar visit.",
      "Day 2: Amber Fort, Jal Mahal photo stop, and City Palace.",
      "Day 3: Hawa Mahal, Albert Hall, and Chokhi Dhani evening.",
      "Day 4: Breakfast and airport or station drop.",
    ],
  },
  {
    id: "pkg-kerala-backwater",
    title: "Kerala Backwater Bliss",
    destination: "Kerala",
    state: "Kerala",
    city: "Alleppey",
    category: "honeymoon",
    budgetTier: "high",
    hotelCategory: "Boutique",
    nights: 5,
    days: 6,
    pricePerPerson: 25999,
    minGuests: 2,
    withFlightPrice: 31999,
    withoutFlightPrice: 25999,
    transfer: "Cochin pickup, private cab, houseboat transfer",
    meals: "Breakfast, dinner, and one houseboat lunch",
    highlights: ["Houseboat stay", "Munnar tea gardens", "Alleppey backwaters"],
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/India_-_Kerala_-_005_-_the_busy_backwaters_of_Alleppey_%282068832658%29.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:India_-_Kerala_-_005_-_the_busy_backwaters_of_Alleppey_(2068832658).jpg",
    summary: "A dreamy Kerala route blending green hills, calm backwaters, and private romantic stays.",
    itinerary: [
      "Day 1: Arrival in Kochi and transfer to Munnar.",
      "Day 2: Tea museum, Mattupetty Dam, and eco point sightseeing.",
      "Day 3: Drive to Alleppey and board a private houseboat.",
      "Day 4: Leisure cruise, village canal views, and sunset dinner.",
      "Day 5: Kochi heritage walk and waterfront shopping.",
      "Day 6: Airport transfer after breakfast.",
    ],
  },
  {
    id: "pkg-goa-beach",
    title: "Goa Beach And Cafe Week",
    destination: "Goa",
    state: "Goa",
    city: "North Goa",
    category: "holiday",
    budgetTier: "low",
    hotelCategory: "3 Star",
    nights: 4,
    days: 5,
    pricePerPerson: 13999,
    minGuests: 2,
    withFlightPrice: 19999,
    withoutFlightPrice: 13999,
    transfer: "Airport pickup and shared sightseeing coach",
    meals: "Breakfast only",
    highlights: ["Baga Beach", "Fort Aguada", "Sunset cruise"],
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/BeachFun.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:BeachFun.jpg",
    summary: "A relaxed Goa package for beach hopping, nightlife, and easy coastal sightseeing.",
    itinerary: [
      "Day 1: Arrival and beachside leisure evening.",
      "Day 2: North Goa sightseeing with Aguada and Candolim.",
      "Day 3: Optional water sports and cafe-hopping in Anjuna.",
      "Day 4: South Goa churches, Miramar, and sunset river cruise.",
      "Day 5: Breakfast and departure transfer.",
    ],
  },
  {
    id: "pkg-sikkim-mountains",
    title: "Gangtok And Sikkim Peaks",
    destination: "Sikkim",
    state: "Sikkim",
    city: "Gangtok",
    category: "adventure",
    budgetTier: "high",
    hotelCategory: "4 Star",
    nights: 5,
    days: 6,
    pricePerPerson: 30999,
    minGuests: 2,
    withFlightPrice: 36999,
    withoutFlightPrice: 30999,
    transfer: "Bagdogra pickup and mountain road transfer",
    meals: "Breakfast and dinner",
    highlights: ["Tsomgo Lake", "MG Marg", "Mountain viewpoints"],
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Tsomgo_Lake%2C_East_Sikkim.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:Tsomgo_Lake,_East_Sikkim.jpg",
    summary: "A premium North-East journey with lakes, mountain roads, and clean hill-town stays.",
    itinerary: [
      "Day 1: Arrival and scenic transfer to Gangtok.",
      "Day 2: Local Gangtok sightseeing and MG Marg evening.",
      "Day 3: Tsomgo Lake and Baba Mandir full-day trip.",
      "Day 4: Rumtek Monastery and local culture stops.",
      "Day 5: Leisure day for cafes, shopping, or optional excursions.",
      "Day 6: Return to Bagdogra after breakfast.",
    ],
  },
  {
    id: "pkg-varanasi-spiritual",
    title: "Varanasi Spiritual Circuit",
    destination: "Varanasi",
    state: "Uttar Pradesh",
    city: "Varanasi",
    category: "spiritual",
    budgetTier: "low",
    hotelCategory: "3 Star",
    nights: 2,
    days: 3,
    pricePerPerson: 8999,
    minGuests: 2,
    withFlightPrice: 13999,
    withoutFlightPrice: 8999,
    transfer: "Airport pickup and local heritage cab",
    meals: "Breakfast only",
    highlights: ["Ganga Aarti", "Sunrise boat ride", "Sarnath"],
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Evening_Aarti_at_Dasaswamedh_Ghat%2C_Varanasi.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:Evening_Aarti_at_Dasaswamedh_Ghat,_Varanasi.jpg",
    summary: "A short sacred journey focused on ghats, temples, and quiet sunrise rituals.",
    itinerary: [
      "Day 1: Arrival, Kashi Vishwanath corridor, and evening Ganga Aarti.",
      "Day 2: Sunrise boat ride, Banaras lanes food walk, and Sarnath excursion.",
      "Day 3: Breakfast and departure transfer.",
    ],
  },
  {
    id: "pkg-andaman-luxury",
    title: "Andaman Island Luxury Week",
    destination: "Andaman",
    state: "Andaman and Nicobar Islands",
    city: "Port Blair",
    category: "luxury",
    budgetTier: "high",
    hotelCategory: "5 Star",
    nights: 5,
    days: 6,
    pricePerPerson: 37999,
    minGuests: 2,
    withFlightPrice: 45999,
    withoutFlightPrice: 37999,
    transfer: "Airport transfer, ferry, and island cabs",
    meals: "Breakfast and two dinners",
    highlights: ["Havelock beaches", "Cellular Jail", "Island ferry"],
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Radhanagar_beach%2C_Havelock_Island%2C_Andaman_India.jpg",
    imageSource: "https://commons.wikimedia.org/wiki/File:Radhanagar_beach,_Havelock_Island,_Andaman_India.jpg",
    summary: "A premium island break with beach resorts, ferry rides, and clear-water leisure time.",
    itinerary: [
      "Day 1: Arrival in Port Blair and Cellular Jail light-and-sound show.",
      "Day 2: Ferry to Havelock and resort check-in.",
      "Day 3: Radhanagar Beach and optional water activities.",
      "Day 4: Elephant Beach excursion and leisure afternoon.",
      "Day 5: Return to Port Blair and local shopping.",
      "Day 6: Breakfast and airport transfer.",
    ],
  },
];
