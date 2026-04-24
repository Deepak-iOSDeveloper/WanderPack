import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAppData } from "../contexts/AppDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  holidayPackages,
  indiaTravelProductMap,
  type HolidayPackage,
  type IndiaTravelProductKey,
} from "../lib/indiaTravelData";
import { normalizeImageUrl } from "../lib/utils";

const couponDiscounts: Record<string, number> = {
  INDIA500: 500,
  HONEYMOON1500: 1500,
  FAMILY2000: 2000,
};

const destinationOptions = ["All", "Mumbai", "Delhi", "Manali", "Kashmir", "Jaipur", "Kerala", "Goa", "Sikkim", "Varanasi", "Andaman"];
const categoryOptions = ["All", "holiday", "honeymoon", "family", "adventure", "spiritual", "luxury"];
const budgetOptions = ["All", "low", "mid", "high"];
const hotelOptions = ["All", "3 Star", "4 Star", "5 Star", "Boutique"];
const emptyTraveler = { name: "", age: "", gender: "male" as const };
const hotelCityOptions = ["Udaipur", "Shimla", "Hyderabad", "Kochi", "Manali", "Rishikesh"];
const hotelRoomOptions = ["1 Room", "2 Rooms", "3 Rooms"];
const hotelGuestOptions = ["1 Guest", "2 Guests", "3 Guests", "4 Guests", "5 Guests", "6 Guests"];
const hotelStayTypes = ["Any stay", "Lake view", "Luxury", "Boutique", "Family", "Business"];
const hotelAmenityOptions = ["Breakfast included", "Free cancellation", "Pool", "Spa", "Near city center", "Couple friendly"];
const hotelSortOptions = ["Trending", "Luxury first", "Budget first", "Top rated", "Family friendly"];

interface HotelPhoto {
  src: string;
  source: string;
  alt: string;
}

interface HotelCityGuide {
  city: string;
  state: string;
  intro: string;
  nearby: string[];
  tags: string[];
  photos: HotelPhoto[];
}

interface TravelCityGuide {
  city: string;
  state: string;
  intro: string;
  nearby: string[];
  tags: string[];
  photos: HotelPhoto[];
}

const hotelCityGuides: Record<string, HotelCityGuide> = {
  Udaipur: {
    city: "Udaipur",
    state: "Rajasthan",
    intro: "Lakefront heritage stays, rooftop dining, and palace-style hotels around Lake Pichola.",
    nearby: ["Kumbhalgarh", "Mount Abu"],
    tags: ["Lake view", "Heritage", "Rooftop dining"],
    photos: [
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Udaipur%2C%20Lake%20Palace%20Hotel%20%286269601174%29.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Udaipur,_Lake_Palace_Hotel_(6269601174).jpg",
        alt: "Lake Palace Hotel in Udaipur",
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Oberoi%20Udaipur.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Oberoi_Udaipur.jpg",
        alt: "Oberoi Udaipur hotel exterior",
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Udaipur%20ni20-42.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Udaipur_ni20-42.jpg",
        alt: "Lake Palace hotel view in Udaipur",
      },
    ],
  },
  Shimla: {
    city: "Shimla",
    state: "Himachal Pradesh",
    intro: "Hill-station stays with pine views, ridge walks, and cozy mountain-facing rooms.",
    nearby: ["Naldehra", "Kufri"],
    tags: ["Hill stay", "Mall Road", "Valley views"],
    photos: [
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/The%20Ridge%2C%20Shimla.jpg",
        source: "https://commons.wikimedia.org/wiki/File:The_Ridge,_Shimla.jpg",
        alt: "The Ridge in Shimla",
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Shimla%20Ridge.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Shimla_Ridge.jpg",
        alt: "Shimla Ridge at night",
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ridge%20shimla.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Ridge_shimla.jpg",
        alt: "Shimla ridge square",
      },
    ],
  },
  Hyderabad: {
    city: "Hyderabad",
    state: "Telangana",
    intro: "Business hotels, airport corridors, and upscale city stays with modern skyline access.",
    nearby: ["HITEC City", "Gachibowli"],
    tags: ["Business", "Airport access", "City skyline"],
    photos: [
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Skyline%20of%20Hyderabad.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Skyline_of_Hyderabad.jpg",
        alt: "Skyline of Hyderabad",
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Skyline%20of%20Hyderabad%2012.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Skyline_of_Hyderabad_12.jpg",
        alt: "Hyderabad skyline panorama",
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Skyline%20of%20Hyderabad%204.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Skyline_of_Hyderabad_4.jpg",
        alt: "Modern Hyderabad skyline view",
      },
    ],
  },
  Kochi: {
    city: "Kochi",
    state: "Kerala",
    intro: "Waterfront city hotels, Fort Kochi courtyards, and marine-drive night views.",
    nearby: ["Fort Kochi", "Marine Drive"],
    tags: ["Waterfront", "Colonial charm", "Night skyline"],
    photos: [
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Kochi%20Skyline.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Kochi_Skyline.jpg",
        alt: "Kochi skyline at night",
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/The%20old%20courtyard%20hotel%20-%20princess%20street%20fort%20cochin.jpg",
        source: "https://commons.wikimedia.org/wiki/File:The_old_courtyard_hotel_-_princess_street_fort_cochin.jpg",
        alt: "Old courtyard hotel in Fort Kochi",
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Fort%20Kochi.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Fort_Kochi.jpg",
        alt: "Fort Kochi street view",
      },
    ],
  },
  Manali: {
    city: "Manali",
    state: "Himachal Pradesh",
    intro: "Snow-season stays, valley balconies, and mountain resort views for couples and families.",
    nearby: ["Solang", "Old Manali"],
    tags: ["Snow view", "Mountain resort", "Adventure base"],
    photos: [
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Manali%2C%20India.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Manali,_India.jpg",
        alt: "Manali mountain view",
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Manali%20India.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Manali_India.jpg",
        alt: "Snowy Manali view",
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Manali%20Winter.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Manali_Winter.jpg",
        alt: "Manali in winter",
      },
    ],
  },
  Rishikesh: {
    city: "Rishikesh",
    state: "Uttarakhand",
    intro: "River-facing retreats, yoga-friendly stays, and peaceful guesthouses near the Ganga.",
    nearby: ["Tapovan", "Lakshman Jhula"],
    tags: ["Riverside", "Yoga stay", "Wellness"],
    photos: [
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rishikesh%20Resorts.jpg",
        source: "https://commons.wikimedia.org/wiki/File:Rishikesh_Resorts.jpg",
        alt: "Resort view in Rishikesh",
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/India%20-%20Rishikesh%20-%20002%20-%20The%20dramatic%20view%20from%20my%20guesthouse%20%282091383746%29.jpg",
        source: "https://commons.wikimedia.org/wiki/File:India_-_Rishikesh_-_002_-_The_dramatic_view_from_my_guesthouse_(2091383746).jpg",
        alt: "Guesthouse view in Rishikesh",
      },
      {
        src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rishikesh%20India%20%28183706723%29.jpeg",
        source: "https://commons.wikimedia.org/wiki/File:Rishikesh_India_(183706723).jpeg",
        alt: "Rishikesh riverside stay area",
      },
    ],
  },
};

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getHotelStars(hotelCategory: string) {
  if (hotelCategory === "Boutique") return "Boutique stay";
  const stars = Number(hotelCategory[0] || 0);
  return `${"*".repeat(stars)}${".".repeat(Math.max(0, 5 - stars))}`;
}

function buildBookingSearchUrl(city: string, checkIn: string, checkOut: string, adults: number, rooms: number) {
  const params = new URLSearchParams({
    ss: city,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: String(adults),
    no_rooms: String(rooms),
    group_children: "0",
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

function buildGoogleHotelSearchUrl(city: string, checkIn: string, checkOut: string, guests: number, rooms: number, stayType: string) {
  const query = `${city} hotels ${checkIn} to ${checkOut} ${guests} guests ${rooms} room ${stayType}`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function buildSearchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

const homestayCityOptions = ["Goa", "Manali", "Kochi", "Rishikesh", "Udaipur", "Shimla"];
const homestayGuestOptions = ["2 Guests", "4 Guests", "6 Guests", "8 Guests"];
const homestayStyles = ["Entire villa", "Cottage", "Mountain cabin", "Beach house", "Family home", "Pet friendly"];
const homestayAmenities = ["Kitchen", "Pet friendly", "Private pool", "Breakfast", "Bonfire", "Workation wifi"];
const homestaySortOptions = ["Trending", "Best reviews", "Family stays", "Remote work", "Weekend picks"];

const cabPickupOptions = ["Mumbai Airport", "Jaipur Airport", "Chandigarh", "Delhi Airport", "Hyderabad Airport", "Kochi Airport"];
const cabDropOptions = ["Pune", "Manali", "Amber Fort", "Agra", "Gachibowli", "Fort Kochi"];
const cabRideTypes = ["One Way", "Round Trip", "Airport Transfer", "Local 8 Hr", "Outstation"];
const cabVehicleOptions = ["Sedan", "SUV", "Premium", "Tempo Traveller"];
const cabSortOptions = ["Trending", "Budget first", "Premium rides", "Family rides", "Fast pickup"];
const flightFromOptions = ["Delhi", "Mumbai", "Bengaluru", "Kolkata", "Chennai", "Hyderabad"];
const flightToOptions = ["Goa", "Mumbai", "Jaipur", "Srinagar", "Bagdogra", "Kochi"];
const flightTravelerOptions = ["1 Traveler", "2 Travelers", "3 Travelers", "4 Travelers", "5 Travelers"];
const flightCabinOptions = ["Economy", "Premium Economy", "Business"];
const flightSortOptions = ["Trending", "Cheapest", "Fastest", "Morning flights", "Non-stop"];
const trainFromOptions = ["New Delhi", "Mumbai", "Chennai", "Bengaluru", "Kolkata", "Jaipur"];
const trainToOptions = ["Varanasi", "Lucknow", "Ahmedabad", "Mysuru", "Amritsar", "Dehradun"];
const trainCoachOptions = ["Sleeper", "3AC", "2AC", "Chair Car", "1AC"];
const trainTravelerOptions = ["1 Traveler", "2 Travelers", "3 Travelers", "4 Travelers"];
const trainSortOptions = ["Trending", "Fastest", "Cheapest", "Morning departures", "Overnight"];
const busFromOptions = ["Bengaluru", "Delhi", "Pune", "Chennai", "Mumbai", "Jaipur"];
const busToOptions = ["Mysuru", "Dehradun", "Goa", "Coorg", "Ooty", "Pondicherry"];
const busSeatOptions = ["AC Seater", "AC Sleeper", "Non-AC Sleeper", "Volvo", "Semi Sleeper"];
const busTravelerOptions = ["1 Traveler", "2 Travelers", "3 Travelers", "4 Travelers", "5 Travelers"];
const busSortOptions = ["Trending", "Cheapest", "Best rated", "Night buses", "Weekend routes"];

const homestayCityGuides: Record<string, TravelCityGuide> = {
  Goa: {
    city: "Goa",
    state: "Goa",
    intro: "Beachside villas, pool homes, and slow mornings near cafes and sunset shacks.",
    nearby: ["Candolim", "Anjuna"],
    tags: ["Beach house", "Private pool", "Weekend pick"],
    photos: [
      { src: "https://upload.wikimedia.org/wikipedia/commons/c/c3/BeachFun.jpg", source: "https://commons.wikimedia.org/wiki/File:BeachFun.jpg", alt: "Goa beach near villa stays" },
      { src: "https://upload.wikimedia.org/wikipedia/commons/c/c3/BeachFun.jpg", source: "https://commons.wikimedia.org/wiki/File:BeachFun.jpg", alt: "Goa coastal stay" },
      { src: "https://upload.wikimedia.org/wikipedia/commons/c/c3/BeachFun.jpg", source: "https://commons.wikimedia.org/wiki/File:BeachFun.jpg", alt: "Goa beach getaway" },
    ],
  },
  Manali: {
    city: "Manali",
    state: "Himachal Pradesh",
    intro: "Mountain cabins, valley balconies, and quiet wooden stays around snow and pine views.",
    nearby: ["Solang", "Old Manali"],
    tags: ["Cabin", "Mountain view", "Bonfire"],
    photos: hotelCityGuides.Manali.photos,
  },
  Kochi: {
    city: "Kochi",
    state: "Kerala",
    intro: "Courtyard homes, heritage stays, and waterfront guesthouses around old-town lanes.",
    nearby: ["Fort Kochi", "Mattancherry"],
    tags: ["Heritage home", "Waterfront", "Culture"],
    photos: hotelCityGuides.Kochi.photos,
  },
  Rishikesh: {
    city: "Rishikesh",
    state: "Uttarakhand",
    intro: "Riverside retreats and yoga-friendly guesthouses for calm stays near the Ganga.",
    nearby: ["Tapovan", "Lakshman Jhula"],
    tags: ["Riverside", "Yoga", "Wellness"],
    photos: hotelCityGuides.Rishikesh.photos,
  },
  Udaipur: {
    city: "Udaipur",
    state: "Rajasthan",
    intro: "Heritage havelis and lake-view homes that feel more personal than standard hotels.",
    nearby: ["Lake Pichola", "Old City"],
    tags: ["Heritage", "Lake view", "Boutique"],
    photos: hotelCityGuides.Udaipur.photos,
  },
  Shimla: {
    city: "Shimla",
    state: "Himachal Pradesh",
    intro: "Pine-framed cottages and warm family homes close to the ridge and hill roads.",
    nearby: ["Kufri", "Naldehra"],
    tags: ["Cottage", "Hill stay", "Family home"],
    photos: hotelCityGuides.Shimla.photos,
  },
};

const cabCityGuides: Record<string, TravelCityGuide> = {
  "Mumbai Airport": {
    city: "Mumbai Airport",
    state: "Maharashtra",
    intro: "Airport pickups, city transfers, and premium cabs for Mumbai-to-Pune and local rides.",
    nearby: ["Pune", "Colaba"],
    tags: ["Airport transfer", "Business", "Premium cab"],
    photos: [
      { src: "https://upload.wikimedia.org/wikipedia/commons/2/21/Gateway_of_India%2Cmumbai%2CTN553.JPG", source: "https://commons.wikimedia.org/wiki/File:Gateway_of_India,mumbai,TN553.JPG", alt: "Mumbai city landmark" },
      { src: "https://upload.wikimedia.org/wikipedia/commons/2/21/Gateway_of_India%2Cmumbai%2CTN553.JPG", source: "https://commons.wikimedia.org/wiki/File:Gateway_of_India,mumbai,TN553.JPG", alt: "Mumbai transfer route" },
      { src: "https://upload.wikimedia.org/wikipedia/commons/2/21/Gateway_of_India%2Cmumbai%2CTN553.JPG", source: "https://commons.wikimedia.org/wiki/File:Gateway_of_India,mumbai,TN553.JPG", alt: "Mumbai airport trip" },
    ],
  },
  "Jaipur Airport": {
    city: "Jaipur Airport",
    state: "Rajasthan",
    intro: "Sightseeing cabs, fort routes, and old-city loops for Jaipur travelers.",
    nearby: ["Amber Fort", "Hawa Mahal"],
    tags: ["Sightseeing", "Fort route", "Family cab"],
    photos: [
      { src: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Hawa_Mahal_-_Jaipur.jpg", source: "https://commons.wikimedia.org/wiki/File:Hawa_Mahal_-_Jaipur.jpg", alt: "Jaipur landmark" },
      { src: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Hawa_Mahal_-_Jaipur.jpg", source: "https://commons.wikimedia.org/wiki/File:Hawa_Mahal_-_Jaipur.jpg", alt: "Jaipur city ride" },
      { src: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Hawa_Mahal_-_Jaipur.jpg", source: "https://commons.wikimedia.org/wiki/File:Hawa_Mahal_-_Jaipur.jpg", alt: "Jaipur transfer route" },
    ],
  },
  Chandigarh: {
    city: "Chandigarh",
    state: "Chandigarh",
    intro: "Clean-city departures for mountain transfers and comfortable family road trips.",
    nearby: ["Manali", "Shimla"],
    tags: ["Outstation", "SUV", "Mountain transfer"],
    photos: hotelCityGuides.Manali.photos,
  },
  "Delhi Airport": {
    city: "Delhi Airport",
    state: "Delhi",
    intro: "Airport transfers, Golden Triangle cabs, and day-trip rides to Agra and Jaipur.",
    nearby: ["Agra", "Jaipur"],
    tags: ["Airport transfer", "Day trip", "Outstation"],
    photos: [
      { src: "https://upload.wikimedia.org/wikipedia/commons/9/99/India_Gate_on_the_evening_of_77th_Independence_day.jpg", source: "https://commons.wikimedia.org/wiki/File:India_Gate_on_the_evening_of_77th_Independence_day.jpg", alt: "Delhi landmark" },
      { src: "https://upload.wikimedia.org/wikipedia/commons/9/99/India_Gate_on_the_evening_of_77th_Independence_day.jpg", source: "https://commons.wikimedia.org/wiki/File:India_Gate_on_the_evening_of_77th_Independence_day.jpg", alt: "Delhi airport city transfer" },
      { src: "https://upload.wikimedia.org/wikipedia/commons/9/99/India_Gate_on_the_evening_of_77th_Independence_day.jpg", source: "https://commons.wikimedia.org/wiki/File:India_Gate_on_the_evening_of_77th_Independence_day.jpg", alt: "Delhi road trip" },
    ],
  },
  "Hyderabad Airport": {
    city: "Hyderabad Airport",
    state: "Telangana",
    intro: "City business transfers, airport pickups, and quick rides into HITEC and Gachibowli.",
    nearby: ["Gachibowli", "HITEC City"],
    tags: ["Business", "Airport", "Fast pickup"],
    photos: hotelCityGuides.Hyderabad.photos,
  },
  "Kochi Airport": {
    city: "Kochi Airport",
    state: "Kerala",
    intro: "Cab transfers to waterfront stays, Fort Kochi, and family holiday routes.",
    nearby: ["Fort Kochi", "Marine Drive"],
    tags: ["Airport", "Waterfront", "Holiday cab"],
    photos: hotelCityGuides.Kochi.photos,
  },
};

function PackageImage({ src, alt, label, className }: { src: string; alt: string; label: string; className: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`${className} image-fallback`} aria-label={alt} role="img">
        <strong>{label}</strong>
        <span>Image unavailable</span>
      </div>
    );
  }

  return <img alt={alt} className={className} onError={() => setFailed(true)} src={normalizeImageUrl(src)} />;
}

export function IndiaProductPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { createBooking } = useAppData();
  const { showToast } = useToast();
  const { product } = useParams();
  const page = indiaTravelProductMap[product as IndiaTravelProductKey];
  const [search, setSearch] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [budgetFilter, setBudgetFilter] = useState("All");
  const [hotelFilter, setHotelFilter] = useState("All");
  const [withFlightFilter, setWithFlightFilter] = useState("all");
  const [selectedPackageId, setSelectedPackageId] = useState(holidayPackages[0]?.id || "");
  const [travelDate, setTravelDate] = useState("2026-05-20");
  const [travelers, setTravelers] = useState("2");
  const [travelerNames, setTravelerNames] = useState("Aarav Sharma, Meera Sharma");
  const [contactPhone, setContactPhone] = useState("9876543210");
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cash">("upi");
  const [includeFlight, setIncludeFlight] = useState(true);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [travelerDetails, setTravelerDetails] = useState([
    { ...emptyTraveler, name: "Aarav Sharma", age: "31" },
    { ...emptyTraveler, name: "Meera Sharma", age: "29", gender: "female" as const },
  ]);
  const [hotelSearch, setHotelSearch] = useState({
    city: "Udaipur",
    checkIn: "2026-04-24",
    checkOut: "2026-04-27",
    rooms: "1 Room",
    guests: "2 Guests",
    starRating: "4 Star",
    stayType: "Lake view",
    amenity: "Breakfast included",
    sortBy: "Trending",
  });
  const [homestaySearch, setHomestaySearch] = useState({
    city: "Goa",
    checkIn: "2026-05-02",
    checkOut: "2026-05-05",
    guests: "4 Guests",
    style: "Beach house",
    amenity: "Kitchen",
    sortBy: "Trending",
  });
  const [cabSearch, setCabSearch] = useState({
    pickup: "Mumbai Airport",
    drop: "Pune",
    date: "2026-05-03",
    rideType: "One Way",
    vehicle: "Sedan",
    sortBy: "Trending",
  });
  const [flightSearch, setFlightSearch] = useState({
    from: "Delhi",
    to: "Goa",
    date: "2026-05-08",
    travelers: "2 Travelers",
    cabin: "Economy",
    sortBy: "Trending",
  });
  const [trainSearch, setTrainSearch] = useState({
    from: "New Delhi",
    to: "Varanasi",
    date: "2026-05-10",
    coach: "3AC",
    travelers: "2 Travelers",
    sortBy: "Trending",
  });
  const [busSearch, setBusSearch] = useState({
    from: "Bengaluru",
    to: "Mysuru",
    date: "2026-05-12",
    seatType: "AC Seater",
    travelers: "2 Travelers",
    sortBy: "Trending",
  });

  const selectedPackage = holidayPackages.find((entry) => entry.id === selectedPackageId) || holidayPackages[0];
  const basePackagePrice = includeFlight ? selectedPackage.withFlightPrice : selectedPackage.withoutFlightPrice;
  const appliedCoupon = couponCode.trim().toUpperCase();
  const discountAmount = couponDiscounts[appliedCoupon] || 0;
  const travelerCount = Math.max(1, Number(travelers) || 1);
  const totalPackageAmount = Math.max(0, basePackagePrice * travelerCount - discountAmount);

  const filteredPackages = useMemo(
    () =>
      holidayPackages.filter((entry) => {
        const query = search.trim().toLowerCase();
        const matchesQuery =
          !query ||
          entry.destination.toLowerCase().includes(query) ||
          entry.city.toLowerCase().includes(query) ||
          entry.state.toLowerCase().includes(query) ||
          entry.title.toLowerCase().includes(query);
        const matchesDestination = destinationFilter === "All" || entry.destination === destinationFilter;
        const matchesCategory = categoryFilter === "All" || entry.category === categoryFilter;
        const matchesBudget = budgetFilter === "All" || entry.budgetTier === budgetFilter;
        const matchesHotel = hotelFilter === "All" || entry.hotelCategory === hotelFilter;
        const matchesFlight =
          withFlightFilter === "all" ||
          (withFlightFilter === "with" && entry.withFlightPrice > 0) ||
          (withFlightFilter === "without" && entry.withoutFlightPrice > 0);
        return matchesQuery && matchesDestination && matchesCategory && matchesBudget && matchesHotel && matchesFlight;
      }),
    [budgetFilter, categoryFilter, destinationFilter, hotelFilter, search, withFlightFilter],
  );

  const comparedPackages = holidayPackages.filter((entry) => compareIds.includes(entry.id)).slice(0, 3);
  const selectedHotelGuide = hotelCityGuides[hotelSearch.city] || hotelCityGuides.Udaipur;
  const hotelAdultCount = Number(hotelSearch.guests.match(/\d+/)?.[0] || 2);
  const hotelRoomCount = Number(hotelSearch.rooms.match(/\d+/)?.[0] || 1);
  const hotelPhotoIndex =
    (hotelStayTypes.indexOf(hotelSearch.stayType) + hotelOptions.indexOf(hotelSearch.starRating) + hotelSortOptions.indexOf(hotelSearch.sortBy)) %
    selectedHotelGuide.photos.length;
  const selectedHotelPhoto = selectedHotelGuide.photos[(hotelPhotoIndex + selectedHotelGuide.photos.length) % selectedHotelGuide.photos.length];
  const hotelDealCards = useMemo(() => {
    const cities = [selectedHotelGuide.city, ...selectedHotelGuide.nearby].slice(0, 3);
    return cities.map((cityName, index) => {
      const guide = hotelCityGuides[cityName] || selectedHotelGuide;
      const photo = guide.photos[index % guide.photos.length];
      const adults = hotelAdultCount + (index === 0 ? 0 : 1);
      return {
        id: `${cityName}-${index}`,
        city: cityName,
        title:
          index === 0
            ? `${cityName} ${hotelSearch.stayType.toLowerCase()} stays`
            : `${cityName} hotel deals`,
        subtitle:
          index === 0
            ? `${guide.intro} ${hotelSearch.amenity.toLowerCase()} and ${hotelSearch.starRating.toLowerCase()} filters applied.`
            : `Live online rates for ${guide.tags.slice(0, 2).join(" and ").toLowerCase()} stays nearby.`,
        image: photo.src,
        imageSource: photo.source,
        imageAlt: photo.alt,
        tags: [
          hotelSearch.starRating,
          hotelSearch.amenity,
          index === 0 ? hotelSearch.sortBy : guide.tags[0],
        ],
        bookingUrl: buildBookingSearchUrl(cityName, hotelSearch.checkIn, hotelSearch.checkOut, adults, hotelRoomCount),
        googleUrl: buildGoogleHotelSearchUrl(cityName, hotelSearch.checkIn, hotelSearch.checkOut, adults, hotelRoomCount, hotelSearch.stayType),
      };
    });
  }, [hotelAdultCount, hotelRoomCount, hotelSearch.amenity, hotelSearch.checkIn, hotelSearch.checkOut, hotelSearch.sortBy, hotelSearch.starRating, hotelSearch.stayType, selectedHotelGuide]);
  const selectedHomestayGuide = homestayCityGuides[homestaySearch.city] || homestayCityGuides.Goa;
  const homestayGuestCount = Number(homestaySearch.guests.match(/\d+/)?.[0] || 4);
  const selectedHomestayPhoto =
    selectedHomestayGuide.photos[
      (homestayStyles.indexOf(homestaySearch.style) + homestayAmenities.indexOf(homestaySearch.amenity) + homestaySortOptions.indexOf(homestaySearch.sortBy)) %
        selectedHomestayGuide.photos.length
    ];
  const homestayDealCards = useMemo(() => {
    const cities = [selectedHomestayGuide.city, ...selectedHomestayGuide.nearby].slice(0, 3);
    return cities.map((cityName, index) => {
      const guide = homestayCityGuides[cityName] || selectedHomestayGuide;
      const photo = guide.photos[index % guide.photos.length];
      const query = `${cityName} homestays ${homestaySearch.checkIn} to ${homestaySearch.checkOut} ${homestaySearch.guests} ${homestaySearch.style} ${homestaySearch.amenity}`;
      return {
        id: `${cityName}-homestay-${index}`,
        city: cityName,
        title: index === 0 ? `${cityName} ${homestaySearch.style.toLowerCase()} picks` : `${cityName} homestay deals`,
        subtitle:
          index === 0
            ? `${guide.intro} ${homestaySearch.amenity.toLowerCase()} and ${homestaySearch.sortBy.toLowerCase()} stays.`
            : `Open fresh homestay results for ${guide.tags.slice(0, 2).join(" and ").toLowerCase()}.`,
        image: photo.src,
        imageSource: photo.source,
        imageAlt: photo.alt,
        tags: [homestaySearch.style, homestaySearch.amenity, index === 0 ? homestaySearch.sortBy : guide.tags[0]],
        googleUrl: buildSearchUrl(query),
        bookingUrl: buildSearchUrl(`${query} booking`),
      };
    });
  }, [homestaySearch.amenity, homestaySearch.checkIn, homestaySearch.checkOut, homestaySearch.guests, homestaySearch.sortBy, homestaySearch.style, selectedHomestayGuide]);
  const selectedCabGuide = cabCityGuides[cabSearch.pickup] || cabCityGuides["Mumbai Airport"];
  const selectedCabPhoto =
    selectedCabGuide.photos[
      (cabRideTypes.indexOf(cabSearch.rideType) + cabVehicleOptions.indexOf(cabSearch.vehicle) + cabSortOptions.indexOf(cabSearch.sortBy)) %
        selectedCabGuide.photos.length
    ];
  const cabDealCards = useMemo(() => {
    const drops = [cabSearch.drop, ...selectedCabGuide.nearby].slice(0, 3);
    return drops.map((cityName, index) => {
      const photo = selectedCabGuide.photos[index % selectedCabGuide.photos.length];
      const query = `${cabSearch.pickup} to ${cityName} ${cabSearch.rideType} cab fare ${cabSearch.date} ${cabSearch.vehicle}`;
      return {
        id: `${cityName}-cab-${index}`,
        city: cityName,
        title: index === 0 ? `${cabSearch.pickup} to ${cityName}` : `${cityName} cab options`,
        subtitle:
          index === 0
            ? `${cabSearch.vehicle} ${cabSearch.rideType.toLowerCase()} rides with ${cabSearch.sortBy.toLowerCase()} sorting.`
            : `Live cab searches for ${cityName.toLowerCase()} transfers and local routes.`,
        image: photo.src,
        imageSource: photo.source,
        imageAlt: photo.alt,
        tags: [cabSearch.vehicle, cabSearch.rideType, index === 0 ? cabSearch.sortBy : selectedCabGuide.tags[0]],
        googleUrl: buildSearchUrl(query),
        mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${cabSearch.pickup} to ${cityName}`)}`,
      };
    });
  }, [cabSearch.date, cabSearch.drop, cabSearch.pickup, cabSearch.rideType, cabSearch.sortBy, cabSearch.vehicle, selectedCabGuide]);
  const flightTravelerCount = Number(flightSearch.travelers.match(/\d+/)?.[0] || 2);
  const flightGuide =
    hotelCityGuides[flightSearch.to] ||
    hotelCityGuides[flightSearch.from] ||
    hotelCityGuides.Kochi;
  const selectedFlightPhoto =
    flightGuide.photos[
      (flightFromOptions.indexOf(flightSearch.from) + flightToOptions.indexOf(flightSearch.to) + flightSortOptions.indexOf(flightSearch.sortBy)) %
        flightGuide.photos.length
    ];
  const flightDealCards = useMemo(() => {
    const destinations = [flightSearch.to, ...flightGuide.nearby].slice(0, 3);
    return destinations.map((cityName, index) => ({
      id: `${cityName}-flight-${index}`,
      city: cityName,
      title: index === 0 ? `${flightSearch.from} to ${cityName}` : `${cityName} flight options`,
      subtitle:
        index === 0
          ? `${flightSearch.cabin} fares for ${flightSearch.travelers.toLowerCase()} with ${flightSearch.sortBy.toLowerCase()} results.`
          : `Live flight searches for routes around ${cityName.toLowerCase()}.`,
      image: flightGuide.photos[index % flightGuide.photos.length].src,
      imageAlt: flightGuide.photos[index % flightGuide.photos.length].alt,
      imageSource: flightGuide.photos[index % flightGuide.photos.length].source,
      tags: [flightSearch.cabin, flightSearch.sortBy, index === 0 ? "Direct search" : flightGuide.tags[0]],
      googleUrl: buildSearchUrl(`${flightSearch.from} to ${cityName} flights ${flightSearch.date} ${flightSearch.travelers} ${flightSearch.cabin}`),
    }));
  }, [flightGuide, flightSearch.cabin, flightSearch.date, flightSearch.from, flightSearch.sortBy, flightSearch.to, flightSearch.travelers]);
  const trainTravelerCount = Number(trainSearch.travelers.match(/\d+/)?.[0] || 2);
  const trainGuide =
    hotelCityGuides[trainSearch.to] ||
    hotelCityGuides[trainSearch.from] ||
    hotelCityGuides.Rishikesh;
  const selectedTrainPhoto =
    trainGuide.photos[
      (trainFromOptions.indexOf(trainSearch.from) + trainToOptions.indexOf(trainSearch.to) + trainSortOptions.indexOf(trainSearch.sortBy)) %
        trainGuide.photos.length
    ];
  const trainDealCards = useMemo(() => {
    const stops = [trainSearch.to, ...trainGuide.nearby].slice(0, 3);
    return stops.map((cityName, index) => ({
      id: `${cityName}-train-${index}`,
      city: cityName,
      title: index === 0 ? `${trainSearch.from} to ${cityName}` : `${cityName} rail options`,
      subtitle:
        index === 0
          ? `${trainSearch.coach} seats for ${trainSearch.travelers.toLowerCase()} with ${trainSearch.sortBy.toLowerCase()} sorting.`
          : `Live train searches for ${cityName.toLowerCase()} routes and nearby rail trips.`,
      image: trainGuide.photos[index % trainGuide.photos.length].src,
      imageAlt: trainGuide.photos[index % trainGuide.photos.length].alt,
      imageSource: trainGuide.photos[index % trainGuide.photos.length].source,
      tags: [trainSearch.coach, trainSearch.sortBy, index === 0 ? "Rail search" : trainGuide.tags[0]],
      googleUrl: buildSearchUrl(`${trainSearch.from} to ${cityName} train ${trainSearch.date} ${trainSearch.coach} ${trainSearch.travelers}`),
    }));
  }, [trainGuide, trainSearch.coach, trainSearch.date, trainSearch.from, trainSearch.sortBy, trainSearch.to, trainSearch.travelers]);
  const busTravelerCount = Number(busSearch.travelers.match(/\d+/)?.[0] || 2);
  const busGuide =
    hotelCityGuides[busSearch.to] ||
    hotelCityGuides[busSearch.from] ||
    hotelCityGuides.Kochi;
  const selectedBusPhoto =
    busGuide.photos[
      (busFromOptions.indexOf(busSearch.from) + busToOptions.indexOf(busSearch.to) + busSortOptions.indexOf(busSearch.sortBy)) %
        busGuide.photos.length
    ];
  const busDealCards = useMemo(() => {
    const routes = [busSearch.to, ...busGuide.nearby].slice(0, 3);
    return routes.map((cityName, index) => ({
      id: `${cityName}-bus-${index}`,
      city: cityName,
      title: index === 0 ? `${busSearch.from} to ${cityName}` : `${cityName} bus options`,
      subtitle:
        index === 0
          ? `${busSearch.seatType} rides for ${busSearch.travelers.toLowerCase()} with ${busSearch.sortBy.toLowerCase()} results.`
          : `Live bus searches for ${cityName.toLowerCase()} and nearby weekend routes.`,
      image: busGuide.photos[index % busGuide.photos.length].src,
      imageAlt: busGuide.photos[index % busGuide.photos.length].alt,
      imageSource: busGuide.photos[index % busGuide.photos.length].source,
      tags: [busSearch.seatType, busSearch.sortBy, index === 0 ? "Bus search" : busGuide.tags[0]],
      googleUrl: buildSearchUrl(`${busSearch.from} to ${cityName} bus ${busSearch.date} ${busSearch.seatType} ${busSearch.travelers}`),
    }));
  }, [busGuide, busSearch.date, busSearch.from, busSearch.seatType, busSearch.sortBy, busSearch.to, busSearch.travelers]);
  const packageLiveSearchUrl = buildSearchUrl(`${selectedPackage.destination} holiday package ${travelDate} ${travelerCount} travelers ${includeFlight ? "with flights" : "without flights"} ${selectedPackage.hotelCategory}`);
  const packageGallery = [
    { src: selectedPackage.image, source: selectedPackage.imageSource, alt: selectedPackage.title },
    ...filteredPackages
      .filter((entry) => entry.destination === selectedPackage.destination && entry.id !== selectedPackage.id)
      .slice(0, 2)
      .map((entry) => ({ src: entry.image, source: entry.imageSource, alt: entry.title })),
  ].slice(0, 3);

  useEffect(() => {
    setTravelerDetails((current) => {
      const next = current.slice(0, travelerCount);
      while (next.length < travelerCount) {
        next.push({ ...emptyTraveler });
      }
      return next;
    });
  }, [travelerCount]);

  if (!page) {
    return <Navigate to="/dashboard" replace />;
  }

  if (page.key === "hotels") {
    return (
      <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
        <section className="workspace-hero hotel-hero">
          <div>
            <span className="eyebrow-pill">{page.heroBadge}</span>
            <h1>{page.heroTitle}</h1>
            <p className="text-muted">{selectedHotelGuide.intro}</p>
            <div className="tag-row">
              {selectedHotelGuide.tags.map((item) => (
                <span className="tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="hotel-hero-media panel-card">
            <PackageImage
              alt={selectedHotelPhoto.alt}
              className="hotel-hero-image"
              label={selectedHotelGuide.city}
              src={selectedHotelPhoto.src}
            />
            <div className="hotel-hero-copy">
              <span>{selectedHotelGuide.city}, {selectedHotelGuide.state}</span>
              <strong>{hotelSearch.stayType} stays with {hotelSearch.starRating.toLowerCase()} filters</strong>
              <p>{hotelSearch.amenity} and {hotelSearch.sortBy.toLowerCase()} results ready to open online.</p>
              <a className="chip" href={selectedHotelPhoto.source} rel="noreferrer" target="_blank">
                Photo source
              </a>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel-card">
            <div className="panel-row">
              <h2 className="section-title">Hotels Search</h2>
              <div className="tag-row">
                <a
                  className="btn btn-primary btn-sm"
                  href={buildBookingSearchUrl(hotelSearch.city, hotelSearch.checkIn, hotelSearch.checkOut, hotelAdultCount, hotelRoomCount)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Find Hotels
                </a>
                <a
                  className="btn btn-outline btn-sm"
                  href={buildGoogleHotelSearchUrl(hotelSearch.city, hotelSearch.checkIn, hotelSearch.checkOut, hotelAdultCount, hotelRoomCount, hotelSearch.stayType)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Live Deals
                </a>
                <button className="btn btn-sky btn-sm" onClick={() => void handleHotelDemoBooking()} type="button">
                  Save In App
                </button>
              </div>
            </div>

            <div className="trip-form-grid">
              <div className="form-group">
                <label>City</label>
                <select className="form-control" value={hotelSearch.city} onChange={(event) => setHotelSearch((current) => ({ ...current, city: event.target.value }))}>
                  {hotelCityOptions.map((entry) => (
                    <option key={entry} value={entry}>{entry}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Check-in</label>
                <input className="form-control" type="date" value={hotelSearch.checkIn} onChange={(event) => setHotelSearch((current) => ({ ...current, checkIn: event.target.value }))} />
              </div>
              <div className="form-group">
                <label>Check-out</label>
                <input className="form-control" type="date" value={hotelSearch.checkOut} onChange={(event) => setHotelSearch((current) => ({ ...current, checkOut: event.target.value }))} />
              </div>
              <div className="form-group">
                <label>Rooms</label>
                <select className="form-control" value={hotelSearch.rooms} onChange={(event) => setHotelSearch((current) => ({ ...current, rooms: event.target.value }))}>
                  {hotelRoomOptions.map((entry) => (
                    <option key={entry} value={entry}>{entry}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Guests</label>
                <select className="form-control" value={hotelSearch.guests} onChange={(event) => setHotelSearch((current) => ({ ...current, guests: event.target.value }))}>
                  {hotelGuestOptions.map((entry) => (
                    <option key={entry} value={entry}>{entry}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Star Rating</label>
                <select className="form-control" value={hotelSearch.starRating} onChange={(event) => setHotelSearch((current) => ({ ...current, starRating: event.target.value }))}>
                  {hotelOptions.slice(1).map((entry) => (
                    <option key={entry} value={entry}>{entry}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Stay Type</label>
                <select className="form-control" value={hotelSearch.stayType} onChange={(event) => setHotelSearch((current) => ({ ...current, stayType: event.target.value }))}>
                  {hotelStayTypes.map((entry) => (
                    <option key={entry} value={entry}>{entry}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Amenity</label>
                <select className="form-control" value={hotelSearch.amenity} onChange={(event) => setHotelSearch((current) => ({ ...current, amenity: event.target.value }))}>
                  {hotelAmenityOptions.map((entry) => (
                    <option key={entry} value={entry}>{entry}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Sort By</label>
                <select className="form-control" value={hotelSearch.sortBy} onChange={(event) => setHotelSearch((current) => ({ ...current, sortBy: event.target.value }))}>
                  {hotelSortOptions.map((entry) => (
                    <option key={entry} value={entry}>{entry}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="panel-subsection">
              <div className="panel-row">
                <h3 className="section-title">Top Deals In India</h3>
                <span className="tag">Live when opened</span>
              </div>
              <div className="trip-grid">
                {hotelDealCards.map((deal) => (
                  <article className="trip-card india-offer-card hotel-deal-card" key={deal.id}>
                    <PackageImage alt={deal.imageAlt} className="hotel-deal-image" label={deal.city} src={deal.image} />
                    <div className="trip-card-header india-card-header india-card-header-hotels">
                      <span>{deal.city}</span>
                      <em>Live rates online</em>
                    </div>
                    <div className="trip-card-body">
                      <h3>{deal.title}</h3>
                      <p>{deal.subtitle}</p>
                      <div className="tag-row">
                        {deal.tags.map((item) => (
                          <span className="tag" key={`${deal.id}-${item}`}>{item}</span>
                        ))}
                      </div>
                      <div className="panel-row">
                        <a className="btn btn-outline btn-sm" href={deal.bookingUrl} rel="noreferrer" target="_blank">
                          Booking.com
                        </a>
                        <button className="btn btn-sky btn-sm" onClick={() => void handleHotelDemoBooking()} type="button">
                          Save In App
                        </button>
                        <a className="btn btn-primary btn-sm" href={deal.googleUrl} rel="noreferrer" target="_blank">
                          View deal
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="stack">
            <section className="panel-card">
              <h2 className="section-title">Photo Picks</h2>
              <div className="hotel-photo-grid">
                {selectedHotelGuide.photos.map((photo) => (
                  <a className="hotel-photo-thumb" href={photo.source} key={photo.source} rel="noreferrer" target="_blank">
                    <img alt={photo.alt} src={normalizeImageUrl(photo.src)} />
                  </a>
                ))}
              </div>
            </section>

            <section className="panel-card">
              <h2 className="section-title">Popular India Picks</h2>
              <div className="subtle-list">
                {selectedHotelGuide.nearby.map((item) => (
                  <div className="subtle-item india-destination-card" key={item}>
                    <strong>{item}</strong>
                    <p className="text-muted">Good add-on area for {hotelSearch.stayType.toLowerCase()} and {hotelSearch.amenity.toLowerCase()} stays.</p>
                    <span className="tag">{hotelSearch.sortBy}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel-card hotel-live-note">
              <span>Live hotel mode</span>
              <strong>Prices are opened fresh online for {hotelSearch.city}.</strong>
              <p>
                This keeps rates current for {hotelSearch.checkIn} to {hotelSearch.checkOut}, {hotelSearch.rooms.toLowerCase()}, and {hotelSearch.guests.toLowerCase()}.
              </p>
            </section>
          </aside>
        </section>
      </AppShell>
    );
  }

  if (page.key === "homestays") {
    return (
      <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
        <section className="workspace-hero hotel-hero">
          <div>
            <span className="eyebrow-pill">{page.heroBadge}</span>
            <h1>{page.heroTitle}</h1>
            <p className="text-muted">{selectedHomestayGuide.intro}</p>
            <div className="tag-row">
              {selectedHomestayGuide.tags.map((item) => (
                <span className="tag" key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div className="hotel-hero-media panel-card">
            <PackageImage alt={selectedHomestayPhoto.alt} className="hotel-hero-image" label={selectedHomestayGuide.city} src={selectedHomestayPhoto.src} />
            <div className="hotel-hero-copy">
              <span>{selectedHomestayGuide.city}, {selectedHomestayGuide.state}</span>
              <strong>{homestaySearch.style} stays for {homestaySearch.guests.toLowerCase()}</strong>
              <p>{homestaySearch.amenity} homes with {homestaySearch.sortBy.toLowerCase()} browsing.</p>
              <a className="chip" href={selectedHomestayPhoto.source} rel="noreferrer" target="_blank">Photo source</a>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel-card">
            <div className="panel-row">
              <h2 className="section-title">Homestays Search</h2>
              <div className="tag-row">
                <a className="btn btn-primary btn-sm" href={buildSearchUrl(`${homestaySearch.city} homestays ${homestaySearch.checkIn} ${homestaySearch.checkOut} ${homestaySearch.guests} ${homestaySearch.style}`)} rel="noreferrer" target="_blank">Find Homestays</a>
                <a className="btn btn-outline btn-sm" href={buildSearchUrl(`${homestaySearch.city} homestay deals ${homestaySearch.amenity} ${homestaySearch.guests}`)} rel="noreferrer" target="_blank">Live Deals</a>
                <button className="btn btn-sky btn-sm" onClick={() => void handleHomestayDemoBooking()} type="button">
                  Save In App
                </button>
              </div>
            </div>

            <div className="trip-form-grid">
              <div className="form-group">
                <label>Area</label>
                <select className="form-control" value={homestaySearch.city} onChange={(event) => setHomestaySearch((current) => ({ ...current, city: event.target.value }))}>
                  {homestayCityOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Check-in</label>
                <input className="form-control" type="date" value={homestaySearch.checkIn} onChange={(event) => setHomestaySearch((current) => ({ ...current, checkIn: event.target.value }))} />
              </div>
              <div className="form-group">
                <label>Check-out</label>
                <input className="form-control" type="date" value={homestaySearch.checkOut} onChange={(event) => setHomestaySearch((current) => ({ ...current, checkOut: event.target.value }))} />
              </div>
              <div className="form-group">
                <label>Guests</label>
                <select className="form-control" value={homestaySearch.guests} onChange={(event) => setHomestaySearch((current) => ({ ...current, guests: event.target.value }))}>
                  {homestayGuestOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Stay Style</label>
                <select className="form-control" value={homestaySearch.style} onChange={(event) => setHomestaySearch((current) => ({ ...current, style: event.target.value }))}>
                  {homestayStyles.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Amenity</label>
                <select className="form-control" value={homestaySearch.amenity} onChange={(event) => setHomestaySearch((current) => ({ ...current, amenity: event.target.value }))}>
                  {homestayAmenities.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Sort By</label>
                <select className="form-control" value={homestaySearch.sortBy} onChange={(event) => setHomestaySearch((current) => ({ ...current, sortBy: event.target.value }))}>
                  {homestaySortOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
            </div>

            <div className="panel-subsection">
              <div className="panel-row">
                <h3 className="section-title">Top Homestay Deals</h3>
                <span className="tag">Live when opened</span>
              </div>
              <div className="trip-grid">
                {homestayDealCards.map((deal) => (
                  <article className="trip-card india-offer-card hotel-deal-card" key={deal.id}>
                    <PackageImage alt={deal.imageAlt} className="hotel-deal-image" label={deal.city} src={deal.image} />
                    <div className="trip-card-header india-card-header india-card-header-homestays">
                      <span>{deal.city}</span>
                      <em>Fresh search links</em>
                    </div>
                    <div className="trip-card-body">
                      <h3>{deal.title}</h3>
                      <p>{deal.subtitle}</p>
                      <div className="tag-row">
                        {deal.tags.map((item) => <span className="tag" key={`${deal.id}-${item}`}>{item}</span>)}
                      </div>
                      <div className="panel-row">
                        <a className="btn btn-outline btn-sm" href={deal.bookingUrl} rel="noreferrer" target="_blank">Search stays</a>
                        <button className="btn btn-sky btn-sm" onClick={() => void handleHomestayDemoBooking()} type="button">
                          Save In App
                        </button>
                        <a className="btn btn-primary btn-sm" href={deal.googleUrl} rel="noreferrer" target="_blank">View deal</a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="stack">
            <section className="panel-card">
              <h2 className="section-title">Photo Picks</h2>
              <div className="hotel-photo-grid">
                {selectedHomestayGuide.photos.map((photo) => (
                  <a className="hotel-photo-thumb" href={photo.source} key={photo.source} rel="noreferrer" target="_blank">
                    <img alt={photo.alt} src={normalizeImageUrl(photo.src)} />
                  </a>
                ))}
              </div>
            </section>
            <section className="panel-card">
              <h2 className="section-title">Popular Nearby Picks</h2>
              <div className="subtle-list">
                {selectedHomestayGuide.nearby.map((item) => (
                  <div className="subtle-item india-destination-card" key={item}>
                    <strong>{item}</strong>
                    <p className="text-muted">Great for {homestaySearch.style.toLowerCase()} stays with {homestaySearch.amenity.toLowerCase()}.</p>
                    <span className="tag">{homestaySearch.sortBy}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="panel-card hotel-live-note">
              <span>Live homestay mode</span>
              <strong>Fresh search links for {selectedHomestayGuide.city}.</strong>
              <p>This keeps results aligned to {homestaySearch.checkIn} to {homestaySearch.checkOut} for {homestayGuestCount} guests.</p>
            </section>
          </aside>
        </section>
      </AppShell>
    );
  }

  if (page.key === "cabs") {
    return (
      <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
        <section className="workspace-hero hotel-hero">
          <div>
            <span className="eyebrow-pill">{page.heroBadge}</span>
            <h1>{page.heroTitle}</h1>
            <p className="text-muted">{selectedCabGuide.intro}</p>
            <div className="tag-row">
              {selectedCabGuide.tags.map((item) => (
                <span className="tag" key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div className="hotel-hero-media panel-card">
            <PackageImage alt={selectedCabPhoto.alt} className="hotel-hero-image" label={selectedCabGuide.city} src={selectedCabPhoto.src} />
            <div className="hotel-hero-copy">
              <span>{selectedCabGuide.city}, {selectedCabGuide.state}</span>
              <strong>{cabSearch.vehicle} {cabSearch.rideType.toLowerCase()} rides</strong>
              <p>{cabSearch.sortBy} cab options from {cabSearch.pickup} to {cabSearch.drop}.</p>
              <a className="chip" href={selectedCabPhoto.source} rel="noreferrer" target="_blank">Photo source</a>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel-card">
            <div className="panel-row">
              <h2 className="section-title">Cab Search</h2>
              <div className="tag-row">
                <a className="btn btn-primary btn-sm" href={buildSearchUrl(`${cabSearch.pickup} to ${cabSearch.drop} ${cabSearch.rideType} cab ${cabSearch.date} ${cabSearch.vehicle}`)} rel="noreferrer" target="_blank">Find Cabs</a>
                <a className="btn btn-outline btn-sm" href={`https://www.google.com/maps/search/${encodeURIComponent(`${cabSearch.pickup} to ${cabSearch.drop}`)}`} rel="noreferrer" target="_blank">Route Search</a>
                <button className="btn btn-sky btn-sm" onClick={() => void handleCabDemoBooking()} type="button">
                  Save In App
                </button>
              </div>
            </div>

            <div className="trip-form-grid">
              <div className="form-group">
                <label>Pickup</label>
                <select className="form-control" value={cabSearch.pickup} onChange={(event) => setCabSearch((current) => ({ ...current, pickup: event.target.value }))}>
                  {cabPickupOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Drop</label>
                <select className="form-control" value={cabSearch.drop} onChange={(event) => setCabSearch((current) => ({ ...current, drop: event.target.value }))}>
                  {cabDropOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input className="form-control" type="date" value={cabSearch.date} onChange={(event) => setCabSearch((current) => ({ ...current, date: event.target.value }))} />
              </div>
              <div className="form-group">
                <label>Ride Type</label>
                <select className="form-control" value={cabSearch.rideType} onChange={(event) => setCabSearch((current) => ({ ...current, rideType: event.target.value }))}>
                  {cabRideTypes.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Vehicle</label>
                <select className="form-control" value={cabSearch.vehicle} onChange={(event) => setCabSearch((current) => ({ ...current, vehicle: event.target.value }))}>
                  {cabVehicleOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Sort By</label>
                <select className="form-control" value={cabSearch.sortBy} onChange={(event) => setCabSearch((current) => ({ ...current, sortBy: event.target.value }))}>
                  {cabSortOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
            </div>

            <div className="panel-subsection">
              <div className="panel-row">
                <h3 className="section-title">Top Cab Deals</h3>
                <span className="tag">Live when opened</span>
              </div>
              <div className="trip-grid">
                {cabDealCards.map((deal) => (
                  <article className="trip-card india-offer-card hotel-deal-card" key={deal.id}>
                    <PackageImage alt={deal.imageAlt} className="hotel-deal-image" label={deal.city} src={deal.image} />
                    <div className="trip-card-header india-card-header india-card-header-cabs">
                      <span>{deal.city}</span>
                      <em>Fresh route search</em>
                    </div>
                    <div className="trip-card-body">
                      <h3>{deal.title}</h3>
                      <p>{deal.subtitle}</p>
                      <div className="tag-row">
                        {deal.tags.map((item) => <span className="tag" key={`${deal.id}-${item}`}>{item}</span>)}
                      </div>
                      <div className="panel-row">
                        <a className="btn btn-outline btn-sm" href={deal.mapsUrl} rel="noreferrer" target="_blank">Open route</a>
                        <button className="btn btn-sky btn-sm" onClick={() => void handleCabDemoBooking()} type="button">
                          Save In App
                        </button>
                        <a className="btn btn-primary btn-sm" href={deal.googleUrl} rel="noreferrer" target="_blank">View deal</a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="stack">
            <section className="panel-card">
              <h2 className="section-title">Photo Picks</h2>
              <div className="hotel-photo-grid">
                {selectedCabGuide.photos.map((photo) => (
                  <a className="hotel-photo-thumb" href={photo.source} key={photo.source} rel="noreferrer" target="_blank">
                    <img alt={photo.alt} src={normalizeImageUrl(photo.src)} />
                  </a>
                ))}
              </div>
            </section>
            <section className="panel-card">
              <h2 className="section-title">Popular Nearby Picks</h2>
              <div className="subtle-list">
                {selectedCabGuide.nearby.map((item) => (
                  <div className="subtle-item india-destination-card" key={item}>
                    <strong>{item}</strong>
                    <p className="text-muted">Useful for {cabSearch.rideType.toLowerCase()} rides and {cabSearch.vehicle.toLowerCase()} bookings.</p>
                    <span className="tag">{cabSearch.sortBy}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="panel-card hotel-live-note">
              <span>Live cab mode</span>
              <strong>Route searches stay current from {cabSearch.pickup}.</strong>
              <p>This keeps cab discovery tied to {cabSearch.drop}, {cabSearch.date}, and {cabSearch.vehicle.toLowerCase()} rides.</p>
            </section>
          </aside>
        </section>
      </AppShell>
    );
  }

  if (page.key === "flights") {
    return (
      <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
        <section className="workspace-hero hotel-hero">
          <div>
            <span className="eyebrow-pill">{page.heroBadge}</span>
            <h1>{page.heroTitle}</h1>
            <p className="text-muted">Live flight-style search links and in-app booking save flow for domestic India routes.</p>
            <div className="tag-row">
              {flightGuide.tags.map((item) => <span className="tag" key={item}>{item}</span>)}
            </div>
          </div>
          <div className="hotel-hero-media panel-card">
            <PackageImage alt={selectedFlightPhoto.alt} className="hotel-hero-image" label={flightSearch.to} src={selectedFlightPhoto.src} />
            <div className="hotel-hero-copy">
              <span>{flightSearch.from} to {flightSearch.to}</span>
              <strong>{flightSearch.cabin} seats for {flightSearch.travelers.toLowerCase()}</strong>
              <p>{flightSearch.sortBy} route discovery for {flightSearch.date}.</p>
              <a className="chip" href={selectedFlightPhoto.source} rel="noreferrer" target="_blank">Photo source</a>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel-card">
            <div className="panel-row">
              <h2 className="section-title">Flights Search</h2>
              <div className="tag-row">
                <a className="btn btn-primary btn-sm" href={buildSearchUrl(`${flightSearch.from} to ${flightSearch.to} flights ${flightSearch.date} ${flightSearch.travelers} ${flightSearch.cabin}`)} rel="noreferrer" target="_blank">Find Flights</a>
                <a className="btn btn-outline btn-sm" href={buildSearchUrl(`${flightSearch.from} ${flightSearch.to} airfare deals ${flightSearch.date}`)} rel="noreferrer" target="_blank">Live Deals</a>
                <button className="btn btn-sky btn-sm" onClick={() => void handleFlightDemoBooking()} type="button">Save In App</button>
              </div>
            </div>
            <div className="trip-form-grid">
              <div className="form-group"><label>From</label><select className="form-control" value={flightSearch.from} onChange={(event) => setFlightSearch((current) => ({ ...current, from: event.target.value }))}>{flightFromOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
              <div className="form-group"><label>To</label><select className="form-control" value={flightSearch.to} onChange={(event) => setFlightSearch((current) => ({ ...current, to: event.target.value }))}>{flightToOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
              <div className="form-group"><label>Date</label><input className="form-control" type="date" value={flightSearch.date} onChange={(event) => setFlightSearch((current) => ({ ...current, date: event.target.value }))} /></div>
              <div className="form-group"><label>Travelers</label><select className="form-control" value={flightSearch.travelers} onChange={(event) => setFlightSearch((current) => ({ ...current, travelers: event.target.value }))}>{flightTravelerOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
              <div className="form-group"><label>Cabin</label><select className="form-control" value={flightSearch.cabin} onChange={(event) => setFlightSearch((current) => ({ ...current, cabin: event.target.value }))}>{flightCabinOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
              <div className="form-group"><label>Sort By</label><select className="form-control" value={flightSearch.sortBy} onChange={(event) => setFlightSearch((current) => ({ ...current, sortBy: event.target.value }))}>{flightSortOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
            </div>
            <div className="panel-subsection">
              <div className="panel-row"><h3 className="section-title">Top Flight Deals</h3><span className="tag">Live when opened</span></div>
              <div className="trip-grid">
                {flightDealCards.map((deal) => (
                  <article className="trip-card india-offer-card hotel-deal-card" key={deal.id}>
                    <PackageImage alt={deal.imageAlt} className="hotel-deal-image" label={deal.city} src={deal.image} />
                    <div className="trip-card-header india-card-header india-card-header-flights"><span>{deal.city}</span><em>Fresh air search</em></div>
                    <div className="trip-card-body">
                      <h3>{deal.title}</h3>
                      <p>{deal.subtitle}</p>
                      <div className="tag-row">{deal.tags.map((item) => <span className="tag" key={`${deal.id}-${item}`}>{item}</span>)}</div>
                      <div className="panel-row">
                        <button className="btn btn-sky btn-sm" onClick={() => void handleFlightDemoBooking()} type="button">Save In App</button>
                        <a className="btn btn-primary btn-sm" href={deal.googleUrl} rel="noreferrer" target="_blank">View deal</a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <aside className="stack">
            <section className="panel-card"><h2 className="section-title">Photo Picks</h2><div className="hotel-photo-grid">{flightGuide.photos.map((photo) => <a className="hotel-photo-thumb" href={photo.source} key={photo.source} rel="noreferrer" target="_blank"><img alt={photo.alt} src={normalizeImageUrl(photo.src)} /></a>)}</div></section>
            <section className="panel-card hotel-live-note"><span>Live flight mode</span><strong>Searches stay current for {flightSearch.from} to {flightSearch.to}.</strong><p>This keeps flight discovery tied to {flightSearch.date}, {flightSearch.travelers.toLowerCase()}, and {flightSearch.cabin.toLowerCase()}.</p></section>
          </aside>
        </section>
      </AppShell>
    );
  }

  if (page.key === "trains") {
    return (
      <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
        <section className="workspace-hero hotel-hero">
          <div>
            <span className="eyebrow-pill">{page.heroBadge}</span>
            <h1>{page.heroTitle}</h1>
            <p className="text-muted">Live train-style route search with in-app booking save for your selected rail setup.</p>
            <div className="tag-row">{trainGuide.tags.map((item) => <span className="tag" key={item}>{item}</span>)}</div>
          </div>
          <div className="hotel-hero-media panel-card">
            <PackageImage alt={selectedTrainPhoto.alt} className="hotel-hero-image" label={trainSearch.to} src={selectedTrainPhoto.src} />
            <div className="hotel-hero-copy">
              <span>{trainSearch.from} to {trainSearch.to}</span>
              <strong>{trainSearch.coach} seats for {trainSearch.travelers.toLowerCase()}</strong>
              <p>{trainSearch.sortBy} route discovery for {trainSearch.date}.</p>
              <a className="chip" href={selectedTrainPhoto.source} rel="noreferrer" target="_blank">Photo source</a>
            </div>
          </div>
        </section>
        <section className="content-grid">
          <div className="panel-card">
            <div className="panel-row">
              <h2 className="section-title">Trains Search</h2>
              <div className="tag-row">
                <a className="btn btn-primary btn-sm" href={buildSearchUrl(`${trainSearch.from} to ${trainSearch.to} train ${trainSearch.date} ${trainSearch.coach}`)} rel="noreferrer" target="_blank">Find Trains</a>
                <a className="btn btn-outline btn-sm" href={buildSearchUrl(`${trainSearch.from} ${trainSearch.to} train fare ${trainSearch.date}`)} rel="noreferrer" target="_blank">Live Deals</a>
                <button className="btn btn-sky btn-sm" onClick={() => void handleTrainDemoBooking()} type="button">Save In App</button>
              </div>
            </div>
            <div className="trip-form-grid">
              <div className="form-group"><label>From</label><select className="form-control" value={trainSearch.from} onChange={(event) => setTrainSearch((current) => ({ ...current, from: event.target.value }))}>{trainFromOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
              <div className="form-group"><label>To</label><select className="form-control" value={trainSearch.to} onChange={(event) => setTrainSearch((current) => ({ ...current, to: event.target.value }))}>{trainToOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
              <div className="form-group"><label>Date</label><input className="form-control" type="date" value={trainSearch.date} onChange={(event) => setTrainSearch((current) => ({ ...current, date: event.target.value }))} /></div>
              <div className="form-group"><label>Coach</label><select className="form-control" value={trainSearch.coach} onChange={(event) => setTrainSearch((current) => ({ ...current, coach: event.target.value }))}>{trainCoachOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
              <div className="form-group"><label>Travelers</label><select className="form-control" value={trainSearch.travelers} onChange={(event) => setTrainSearch((current) => ({ ...current, travelers: event.target.value }))}>{trainTravelerOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
              <div className="form-group"><label>Sort By</label><select className="form-control" value={trainSearch.sortBy} onChange={(event) => setTrainSearch((current) => ({ ...current, sortBy: event.target.value }))}>{trainSortOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
            </div>
            <div className="panel-subsection">
              <div className="panel-row"><h3 className="section-title">Top Train Deals</h3><span className="tag">Live when opened</span></div>
              <div className="trip-grid">
                {trainDealCards.map((deal) => (
                  <article className="trip-card india-offer-card hotel-deal-card" key={deal.id}>
                    <PackageImage alt={deal.imageAlt} className="hotel-deal-image" label={deal.city} src={deal.image} />
                    <div className="trip-card-header india-card-header india-card-header-trains"><span>{deal.city}</span><em>Fresh rail search</em></div>
                    <div className="trip-card-body">
                      <h3>{deal.title}</h3>
                      <p>{deal.subtitle}</p>
                      <div className="tag-row">{deal.tags.map((item) => <span className="tag" key={`${deal.id}-${item}`}>{item}</span>)}</div>
                      <div className="panel-row">
                        <button className="btn btn-sky btn-sm" onClick={() => void handleTrainDemoBooking()} type="button">Save In App</button>
                        <a className="btn btn-primary btn-sm" href={deal.googleUrl} rel="noreferrer" target="_blank">View deal</a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <aside className="stack">
            <section className="panel-card"><h2 className="section-title">Photo Picks</h2><div className="hotel-photo-grid">{trainGuide.photos.map((photo) => <a className="hotel-photo-thumb" href={photo.source} key={photo.source} rel="noreferrer" target="_blank"><img alt={photo.alt} src={normalizeImageUrl(photo.src)} /></a>)}</div></section>
            <section className="panel-card hotel-live-note"><span>Live train mode</span><strong>Searches stay current for {trainSearch.from} to {trainSearch.to}.</strong><p>This keeps train discovery tied to {trainSearch.date}, {trainSearch.coach.toLowerCase()}, and {trainSearch.travelers.toLowerCase()}.</p></section>
          </aside>
        </section>
      </AppShell>
    );
  }

  if (page.key === "buses") {
    return (
      <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
        <section className="workspace-hero hotel-hero">
          <div>
            <span className="eyebrow-pill">{page.heroBadge}</span>
            <h1>{page.heroTitle}</h1>
            <p className="text-muted">Live bus-style route search with in-app booking save for road trips and intercity rides.</p>
            <div className="tag-row">{busGuide.tags.map((item) => <span className="tag" key={item}>{item}</span>)}</div>
          </div>
          <div className="hotel-hero-media panel-card">
            <PackageImage alt={selectedBusPhoto.alt} className="hotel-hero-image" label={busSearch.to} src={selectedBusPhoto.src} />
            <div className="hotel-hero-copy">
              <span>{busSearch.from} to {busSearch.to}</span>
              <strong>{busSearch.seatType} rides for {busSearch.travelers.toLowerCase()}</strong>
              <p>{busSearch.sortBy} route discovery for {busSearch.date}.</p>
              <a className="chip" href={selectedBusPhoto.source} rel="noreferrer" target="_blank">Photo source</a>
            </div>
          </div>
        </section>
        <section className="content-grid">
          <div className="panel-card">
            <div className="panel-row">
              <h2 className="section-title">Buses Search</h2>
              <div className="tag-row">
                <a className="btn btn-primary btn-sm" href={buildSearchUrl(`${busSearch.from} to ${busSearch.to} bus ${busSearch.date} ${busSearch.seatType}`)} rel="noreferrer" target="_blank">Find Buses</a>
                <a className="btn btn-outline btn-sm" href={buildSearchUrl(`${busSearch.from} ${busSearch.to} bus fare ${busSearch.date}`)} rel="noreferrer" target="_blank">Live Deals</a>
                <button className="btn btn-sky btn-sm" onClick={() => void handleBusDemoBooking()} type="button">Save In App</button>
              </div>
            </div>
            <div className="trip-form-grid">
              <div className="form-group"><label>From</label><select className="form-control" value={busSearch.from} onChange={(event) => setBusSearch((current) => ({ ...current, from: event.target.value }))}>{busFromOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
              <div className="form-group"><label>To</label><select className="form-control" value={busSearch.to} onChange={(event) => setBusSearch((current) => ({ ...current, to: event.target.value }))}>{busToOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
              <div className="form-group"><label>Date</label><input className="form-control" type="date" value={busSearch.date} onChange={(event) => setBusSearch((current) => ({ ...current, date: event.target.value }))} /></div>
              <div className="form-group"><label>Seat Type</label><select className="form-control" value={busSearch.seatType} onChange={(event) => setBusSearch((current) => ({ ...current, seatType: event.target.value }))}>{busSeatOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
              <div className="form-group"><label>Travelers</label><select className="form-control" value={busSearch.travelers} onChange={(event) => setBusSearch((current) => ({ ...current, travelers: event.target.value }))}>{busTravelerOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
              <div className="form-group"><label>Sort By</label><select className="form-control" value={busSearch.sortBy} onChange={(event) => setBusSearch((current) => ({ ...current, sortBy: event.target.value }))}>{busSortOptions.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>
            </div>
            <div className="panel-subsection">
              <div className="panel-row"><h3 className="section-title">Top Bus Deals</h3><span className="tag">Live when opened</span></div>
              <div className="trip-grid">
                {busDealCards.map((deal) => (
                  <article className="trip-card india-offer-card hotel-deal-card" key={deal.id}>
                    <PackageImage alt={deal.imageAlt} className="hotel-deal-image" label={deal.city} src={deal.image} />
                    <div className="trip-card-header india-card-header india-card-header-buses"><span>{deal.city}</span><em>Fresh road search</em></div>
                    <div className="trip-card-body">
                      <h3>{deal.title}</h3>
                      <p>{deal.subtitle}</p>
                      <div className="tag-row">{deal.tags.map((item) => <span className="tag" key={`${deal.id}-${item}`}>{item}</span>)}</div>
                      <div className="panel-row">
                        <button className="btn btn-sky btn-sm" onClick={() => void handleBusDemoBooking()} type="button">Save In App</button>
                        <a className="btn btn-primary btn-sm" href={deal.googleUrl} rel="noreferrer" target="_blank">View deal</a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <aside className="stack">
            <section className="panel-card"><h2 className="section-title">Photo Picks</h2><div className="hotel-photo-grid">{busGuide.photos.map((photo) => <a className="hotel-photo-thumb" href={photo.source} key={photo.source} rel="noreferrer" target="_blank"><img alt={photo.alt} src={normalizeImageUrl(photo.src)} /></a>)}</div></section>
            <section className="panel-card hotel-live-note"><span>Live bus mode</span><strong>Searches stay current for {busSearch.from} to {busSearch.to}.</strong><p>This keeps bus discovery tied to {busSearch.date}, {busSearch.seatType.toLowerCase()}, and {busSearch.travelers.toLowerCase()}.</p></section>
          </aside>
        </section>
      </AppShell>
    );
  }

  function toggleCompare(packageId: string) {
    setCompareIds((current) => {
      if (current.includes(packageId)) {
        return current.filter((entry) => entry !== packageId);
      }
      if (current.length >= 3) {
        showToast("You can compare up to 3 packages at a time.");
        return current;
      }
      return [...current, packageId];
    });
  }

  function updateTravelerDetail(index: number, field: "name" | "age" | "gender", value: string) {
    setTravelerDetails((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    );
  }

  async function handleGenericBooking() {
    await createBooking({
      product: page.key,
      title: `${page.label} booking for ${page.searchFields[0]?.value || "India trip"}`,
      from: page.searchFields.find((field) => field.label.toLowerCase() === "from")?.value,
      to: page.searchFields.find((field) => field.label.toLowerCase() === "to")?.value,
      city: page.searchFields.find((field) =>
        field.label.toLowerCase() === "city" ||
        field.label.toLowerCase() === "area" ||
        field.label.toLowerCase() === "destination",
      )?.value,
      travelDate: page.searchFields.find((field) =>
        field.label.toLowerCase().includes("date") ||
        field.label.toLowerCase().includes("departure") ||
        field.label.toLowerCase().includes("check-in"),
      )?.value,
      travelers: Number(
        page.searchFields
          .find((field) => field.label.toLowerCase().includes("traveller") || field.label.toLowerCase().includes("guest"))
          ?.value?.match(/\d+/)?.[0] || 1,
      ),
      amount: Number(page.offers[0]?.price.replace(/[^\d]/g, "") || 0),
      currency: "INR",
      details: page.heroText,
      paymentMethod: "upi",
      paymentStatus: "paid",
      paymentReference: `WP-${Date.now().toString().slice(-8)}`,
    });
    showToast(`${page.label} booking added to My Bookings.`);
  }

  async function handlePackageBooking(travelPackage: HolidayPackage) {
    const normalizedTravelerCount = Math.max(1, Number(travelers) || travelPackage.minGuests);
    const amount = includeFlight ? travelPackage.withFlightPrice : travelPackage.withoutFlightPrice;
    const normalizedCoupon = couponCode.trim().toUpperCase();
    const normalizedDiscount = couponDiscounts[normalizedCoupon] || 0;
    const travelerList = travelerNames
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    const validTravelerDetails = travelerDetails
      .map((entry) => ({
        name: entry.name.trim(),
        age: entry.age.trim(),
        gender: entry.gender,
      }))
      .filter((entry) => entry.name);

    await createBooking({
      product: "holiday-packages",
      title: travelPackage.title,
      city: travelPackage.city,
      destination: travelPackage.destination,
      state: travelPackage.state,
      travelDate,
      travelers: normalizedTravelerCount,
      amount: Math.max(0, amount * normalizedTravelerCount - normalizedDiscount),
      currency: "INR",
      details: travelPackage.summary,
      nights: travelPackage.nights,
      days: travelPackage.days,
      packageCategory: travelPackage.category,
      budgetTier: travelPackage.budgetTier,
      hotelCategory: travelPackage.hotelCategory,
      withFlight: includeFlight,
      paymentMethod,
      paymentStatus: "paid",
      paymentReference: `WP-${Date.now().toString().slice(-8)}`,
      couponCode: normalizedCoupon || undefined,
      discountAmount: normalizedDiscount || undefined,
      travelerNames: travelerList,
      travelerDetails: validTravelerDetails,
      contactPhone,
      image: travelPackage.image,
      itinerary: travelPackage.itinerary,
    });

    showToast("Package booked with dummy payment and saved to Booking Vault.");
    navigate("/booking-vault");
  }

  async function handleHotelDemoBooking() {
    await createBooking({
      product: "hotels",
      title: `${hotelSearch.city} ${hotelSearch.stayType} hotel stay`,
      city: hotelSearch.city,
      destination: hotelSearch.city,
      travelDate: hotelSearch.checkIn,
      travelers: hotelAdultCount,
      amount: 3299 + hotelAdultCount * 450 + hotelRoomCount * 700,
      currency: "INR",
      hotelCategory: hotelSearch.starRating as "3 Star" | "4 Star" | "5 Star" | "Boutique",
      paymentMethod: "upi",
      paymentStatus: "paid",
      paymentReference: `WP-${Date.now().toString().slice(-8)}`,
      details: `${hotelSearch.amenity} | ${hotelSearch.sortBy} | ${hotelSearch.rooms}, ${hotelSearch.guests}`,
      image: selectedHotelPhoto.src,
      itinerary: [
        `Check-in on ${hotelSearch.checkIn}`,
        `${hotelSearch.stayType} stay in ${hotelSearch.city}`,
        `Check-out on ${hotelSearch.checkOut}`,
      ],
    });
    showToast("Hotel booking saved inside WanderPack.");
    navigate("/booking-vault");
  }

  async function handleHomestayDemoBooking() {
    await createBooking({
      product: "homestays",
      title: `${homestaySearch.city} ${homestaySearch.style} homestay`,
      city: homestaySearch.city,
      destination: homestaySearch.city,
      travelDate: homestaySearch.checkIn,
      travelers: homestayGuestCount,
      amount: 4199 + homestayGuestCount * 350,
      currency: "INR",
      paymentMethod: "upi",
      paymentStatus: "paid",
      paymentReference: `WP-${Date.now().toString().slice(-8)}`,
      details: `${homestaySearch.amenity} | ${homestaySearch.sortBy} | ${homestaySearch.style}`,
      image: selectedHomestayPhoto.src,
      itinerary: [
        `Check-in on ${homestaySearch.checkIn}`,
        `${homestaySearch.style} stay in ${homestaySearch.city}`,
        `Check-out on ${homestaySearch.checkOut}`,
      ],
    });
    showToast("Homestay booking saved inside WanderPack.");
    navigate("/booking-vault");
  }

  async function handleCabDemoBooking() {
    await createBooking({
      product: "cabs",
      title: `${cabSearch.pickup} to ${cabSearch.drop} ${cabSearch.rideType} cab`,
      from: cabSearch.pickup,
      to: cabSearch.drop,
      city: cabSearch.drop,
      destination: cabSearch.drop,
      travelDate: cabSearch.date,
      travelers: cabSearch.vehicle === "Tempo Traveller" ? 8 : cabSearch.vehicle === "SUV" ? 5 : 3,
      amount: cabSearch.vehicle === "Premium" ? 5999 : cabSearch.vehicle === "SUV" ? 3499 : 2199,
      currency: "INR",
      paymentMethod: "upi",
      paymentStatus: "paid",
      paymentReference: `WP-${Date.now().toString().slice(-8)}`,
      details: `${cabSearch.vehicle} | ${cabSearch.rideType} | ${cabSearch.sortBy}`,
      image: selectedCabPhoto.src,
      itinerary: [
        `Pickup: ${cabSearch.pickup}`,
        `Drop: ${cabSearch.drop}`,
        `Ride date: ${cabSearch.date}`,
      ],
    });
    showToast("Cab booking saved inside WanderPack.");
    navigate("/booking-vault");
  }

  async function handleFlightDemoBooking() {
    await createBooking({
      product: "flights",
      title: `${flightSearch.from} to ${flightSearch.to} flight`,
      from: flightSearch.from,
      to: flightSearch.to,
      city: flightSearch.to,
      destination: flightSearch.to,
      travelDate: flightSearch.date,
      travelers: flightTravelerCount,
      amount: flightSearch.cabin === "Business" ? 12499 : flightSearch.cabin === "Premium Economy" ? 7899 : 4899,
      currency: "INR",
      paymentMethod: "upi",
      paymentStatus: "paid",
      paymentReference: `WP-${Date.now().toString().slice(-8)}`,
      details: `${flightSearch.cabin} | ${flightSearch.sortBy} | ${flightSearch.travelers}`,
      image: selectedFlightPhoto.src,
      itinerary: [
        `From: ${flightSearch.from}`,
        `To: ${flightSearch.to}`,
        `Departure date: ${flightSearch.date}`,
      ],
    });
    showToast("Flight booking saved inside WanderPack.");
    navigate("/booking-vault");
  }

  async function handleTrainDemoBooking() {
    await createBooking({
      product: "trains",
      title: `${trainSearch.from} to ${trainSearch.to} train`,
      from: trainSearch.from,
      to: trainSearch.to,
      city: trainSearch.to,
      destination: trainSearch.to,
      travelDate: trainSearch.date,
      travelers: trainTravelerCount,
      amount: trainSearch.coach === "1AC" ? 3899 : trainSearch.coach === "2AC" ? 2399 : trainSearch.coach === "3AC" ? 1499 : 899,
      currency: "INR",
      paymentMethod: "upi",
      paymentStatus: "paid",
      paymentReference: `WP-${Date.now().toString().slice(-8)}`,
      details: `${trainSearch.coach} | ${trainSearch.sortBy} | ${trainSearch.travelers}`,
      image: selectedTrainPhoto.src,
      itinerary: [
        `From: ${trainSearch.from}`,
        `To: ${trainSearch.to}`,
        `Travel date: ${trainSearch.date}`,
      ],
    });
    showToast("Train booking saved inside WanderPack.");
    navigate("/booking-vault");
  }

  async function handleBusDemoBooking() {
    await createBooking({
      product: "buses",
      title: `${busSearch.from} to ${busSearch.to} bus`,
      from: busSearch.from,
      to: busSearch.to,
      city: busSearch.to,
      destination: busSearch.to,
      travelDate: busSearch.date,
      travelers: busTravelerCount,
      amount: busSearch.seatType.includes("Sleeper") ? 1250 : busSearch.seatType.includes("Volvo") ? 1499 : 899,
      currency: "INR",
      paymentMethod: "upi",
      paymentStatus: "paid",
      paymentReference: `WP-${Date.now().toString().slice(-8)}`,
      details: `${busSearch.seatType} | ${busSearch.sortBy} | ${busSearch.travelers}`,
      image: selectedBusPhoto.src,
      itinerary: [
        `From: ${busSearch.from}`,
        `To: ${busSearch.to}`,
        `Travel date: ${busSearch.date}`,
      ],
    });
    showToast("Bus booking saved inside WanderPack.");
    navigate("/booking-vault");
  }

  if (page.key === "holiday-packages" && selectedPackage) {
    return (
      <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
        <section className="workspace-hero">
          <div>
            <span className="eyebrow-pill">{page.heroBadge}</span>
            <h1>{page.heroTitle}</h1>
            <p className="text-muted">{page.heroText}</p>
            <div className="tag-row">
              {page.highlights.map((item) => (
                <span className="tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <div className="tag-row">
              <a className="btn btn-primary btn-sm" href={packageLiveSearchUrl} rel="noreferrer" target="_blank">
                Live Package Search
              </a>
              <a className="btn btn-outline btn-sm" href={buildSearchUrl(`${selectedPackage.city} ${selectedPackage.destination} hotels ${travelDate}`)} rel="noreferrer" target="_blank">
                Destination Hotels
              </a>
            </div>
          </div>

          <div className="india-package-hero-card">
            <PackageImage alt={selectedPackage.title} className="india-package-hero-image" label={selectedPackage.destination} src={selectedPackage.image} />
            <div className="india-package-hero-copy">
              <span>{selectedPackage.state}</span>
              <strong>{selectedPackage.title}</strong>
              <p>{selectedPackage.summary}</p>
            </div>
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-row">
            <h2 className="section-title">Search And Filter India Packages</h2>
            <span className="tag">{filteredPackages.length} packages available</span>
          </div>
          <div className="trip-form-grid">
            <input className="form-control" placeholder="Search destination or city" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="form-control" value={destinationFilter} onChange={(event) => setDestinationFilter(event.target.value)}>
              {destinationOptions.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
            <select className="form-control" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {categoryOptions.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
            <select className="form-control" value={budgetFilter} onChange={(event) => setBudgetFilter(event.target.value)}>
              {budgetOptions.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
            <select className="form-control" value={hotelFilter} onChange={(event) => setHotelFilter(event.target.value)}>
              {hotelOptions.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
            <select className="form-control" value={withFlightFilter} onChange={(event) => setWithFlightFilter(event.target.value)}>
              <option value="all">Flight: All</option>
              <option value="with">With flight</option>
              <option value="without">Without flight</option>
            </select>
          </div>
        </section>

        <section className="india-package-layout">
          <div className="stack">
            <div className="package-grid">
              {filteredPackages.map((entry) => {
                const totalPrice = includeFlight ? entry.withFlightPrice : entry.withoutFlightPrice;
                const active = entry.id === selectedPackage.id;
                const compared = compareIds.includes(entry.id);

                return (
                  <article className={`package-card panel-card ${active ? "package-card-active" : ""}`} key={entry.id}>
                    <PackageImage alt={entry.title} className="package-card-image" label={entry.destination} src={entry.image} />
                    <div className="package-card-body">
                      <div className="panel-row">
                        <div>
                          <strong>{entry.title}</strong>
                          <p className="text-muted">{entry.city}, {entry.state}</p>
                        </div>
                        <span className="tag">{entry.category}</span>
                      </div>
                      <p>{entry.summary}</p>
                      <div className="tag-row">
                        <span className="tag">{entry.budgetTier} budget</span>
                        <span className="tag">{entry.hotelCategory}</span>
                        <span className="tag">{getHotelStars(entry.hotelCategory)}</span>
                        <span className="tag">{entry.days}D/{entry.nights}N</span>
                      </div>
                      <div className="package-price-row">
                        <strong>{formatInr(totalPrice)}</strong>
                        <span>per person | min {entry.minGuests} pax</span>
                      </div>
                      <div className="panel-row package-card-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => setSelectedPackageId(entry.id)} type="button">
                          View Details
                        </button>
                        <a className="chip" href={buildSearchUrl(`${entry.destination} package deal ${travelDate} ${travelerCount} travelers ${includeFlight ? "with flights" : "without flights"}`)} rel="noreferrer" target="_blank">
                          Live deal
                        </a>
                        <button className={`chip ${compared ? "active" : ""}`} onClick={() => toggleCompare(entry.id)} type="button">
                          {compared ? "Compared" : "Compare"}
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSelectedPackageId(entry.id);
                            void handlePackageBooking(entry);
                          }}
                          type="button"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {!filteredPackages.length ? (
              <div className="empty-card">No package matched your search. Try Mumbai, Delhi, Manali, Kashmir, or Kerala.</div>
            ) : null}
            {comparedPackages.length >= 2 ? (
              <section className="panel-card">
                <div className="panel-row">
                  <h2 className="section-title">Compare Packages</h2>
                  <span className="tag">{comparedPackages.length} selected</span>
                </div>
                <div className="compare-grid">
                  {comparedPackages.map((entry) => (
                    <article className="compare-card" key={entry.id}>
                      <strong>{entry.title}</strong>
                      <p className="text-muted">{entry.city}, {entry.state}</p>
                      <div className="tag-row">
                        <span className="tag">{entry.category}</span>
                        <span className="tag">{entry.hotelCategory}</span>
                      </div>
                      <p>{entry.summary}</p>
                      <div className="subtle-list">
                        <div className="subtle-item">
                          <strong>Price</strong>
                          <span>{formatInr(includeFlight ? entry.withFlightPrice : entry.withoutFlightPrice)} per person</span>
                        </div>
                        <div className="subtle-item">
                          <strong>Duration</strong>
                          <span>{entry.days} days / {entry.nights} nights</span>
                        </div>
                        <div className="subtle-item">
                          <strong>Highlights</strong>
                          <span>{entry.highlights.slice(0, 2).join(", ")}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="stack">
            <section className="panel-card">
              <h2 className="section-title">Selected Package Details</h2>
              <div className="subtle-list">
                <div className="subtle-item">
                  <strong>{selectedPackage.title}</strong>
                  <span>{selectedPackage.destination}, {selectedPackage.state}</span>
                </div>
                <div className="subtle-item">
                  <strong>Included</strong>
                  <span>{selectedPackage.transfer} | {selectedPackage.meals}</span>
                </div>
                <div className="subtle-item">
                  <strong>Top Highlights</strong>
                  <span>{selectedPackage.highlights.join(", ")}</span>
                </div>
                <div className="subtle-item">
                  <strong>Hotel Category</strong>
                  <span>{selectedPackage.hotelCategory} | {getHotelStars(selectedPackage.hotelCategory)}</span>
                </div>
                <div className="subtle-item">
                  <strong>Image Source</strong>
                  <a className="chip" href={selectedPackage.imageSource} rel="noreferrer" target="_blank">
                    Open source
                  </a>
                </div>
                <div className="subtle-item">
                  <strong>Live Search</strong>
                  <a className="chip" href={packageLiveSearchUrl} rel="noreferrer" target="_blank">
                    Open online
                  </a>
                </div>
              </div>
            </section>

            <section className="panel-card">
              <h2 className="section-title">Destination Gallery</h2>
              <div className="hotel-photo-grid">
                {packageGallery.map((photo) => (
                  <a className="hotel-photo-thumb" href={photo.source} key={photo.source} rel="noreferrer" target="_blank">
                    <img alt={photo.alt} src={normalizeImageUrl(photo.src)} />
                  </a>
                ))}
              </div>
            </section>

            <section className="panel-card">
              <div className="panel-row">
                <h2 className="section-title">Dummy Payment</h2>
                <span className="tag">Demo only</span>
              </div>
              <div className="trip-form-grid">
                <input className="form-control" type="date" value={travelDate} onChange={(event) => setTravelDate(event.target.value)} />
                <input className="form-control" value={travelers} onChange={(event) => setTravelers(event.target.value)} placeholder="Travelers" />
                <input className="form-control" value={travelerNames} onChange={(event) => setTravelerNames(event.target.value)} placeholder="Traveler names separated by commas" />
                <input className="form-control" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="Contact phone" />
                <input className="form-control" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Coupon code" />
                <select className="form-control" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "upi" | "card" | "netbanking" | "cash")}>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="cash">Cash</option>
                </select>
                <select className="form-control" value={includeFlight ? "with" : "without"} onChange={(event) => setIncludeFlight(event.target.value === "with")}>
                  <option value="with">With Flight</option>
                  <option value="without">Without Flight</option>
                </select>
              </div>
              <div className="panel-subsection">
                <h3 className="section-title">Passenger Details</h3>
                <div className="subtle-list">
                  {travelerDetails.map((entry, index) => (
                    <div className="passenger-grid" key={`traveler-${index}`}>
                      <input className="form-control" value={entry.name} onChange={(event) => updateTravelerDetail(index, "name", event.target.value)} placeholder={`Traveler ${index + 1} name`} />
                      <input className="form-control" value={entry.age} onChange={(event) => updateTravelerDetail(index, "age", event.target.value)} placeholder="Age" />
                      <select className="form-control" value={entry.gender} onChange={(event) => updateTravelerDetail(index, "gender", event.target.value)}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div className="package-payment-box">
                <strong>{formatInr(totalPackageAmount)}</strong>
                <span>{includeFlight ? "Flight included" : "Flight excluded"} | {paymentMethod} dummy payment</span>
                <small>
                  Base fare {formatInr(basePackagePrice * travelerCount)}
                  {discountAmount ? ` | Coupon ${appliedCoupon} saved ${formatInr(discountAmount)}` : " | Try INDIA500, HONEYMOON1500, or FAMILY2000"}
                </small>
              </div>
              <button className="btn btn-primary" onClick={() => void handlePackageBooking(selectedPackage)} type="button">
                Pay And Save Booking
              </button>
            </section>

            <section className="panel-card">
              <h2 className="section-title">Day Wise Itinerary</h2>
              <div className="subtle-list">
                {selectedPackage.itinerary.map((entry) => (
                  <div className="subtle-item" key={entry}>
                    <span>{entry}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell showAdminLink={profile?.role === "admin" || profile?.role === "superadmin"}>
      <section className="workspace-hero">
        <div>
          <span className="eyebrow-pill">{page.heroBadge}</span>
          <h1>{page.heroTitle}</h1>
          <p className="text-muted">{page.heroText}</p>
          <div className="tag-row">
            {page.highlights.map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className={`india-art-card india-art-${page.themeClass}`}>
          <div className="india-art-badge">{page.label}</div>
          <div className="india-art-icon">{page.icon}</div>
          <strong>{page.artTitle}</strong>
          <span>{page.artSubtitle}</span>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel-card">
          <div className="panel-row">
            <h2 className="section-title">{page.label} Search</h2>
            <button className="btn btn-primary btn-sm" onClick={() => void handleGenericBooking()} type="button">
              {page.actionLabel}
            </button>
          </div>
          <div className="trip-form-grid">
            {page.searchFields.map((field) => (
              <div className="form-group" key={field.label}>
                <label>{field.label}</label>
                <input className="form-control" defaultValue={field.value} />
              </div>
            ))}
          </div>
          <div className="panel-subsection">
            <h3 className="section-title">Top Deals In India</h3>
            <div className="trip-grid">
              {page.offers.map((offer) => (
                <article className="trip-card india-offer-card" key={offer.title}>
                  <div className={`trip-card-header india-card-header india-card-header-${page.themeClass}`}>
                    <span>{page.label}</span>
                    <em>{offer.price}</em>
                  </div>
                  <div className="trip-card-body">
                    <h3>{offer.title}</h3>
                    <p>{offer.subtitle}</p>
                    <button className="btn btn-outline btn-sm" type="button">
                      View deal
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="stack">
          <section className="panel-card">
            <h2 className="section-title">Popular India Picks</h2>
            <div className="subtle-list">
              {page.destinations.map((item) => (
                <div className="subtle-item india-destination-card" key={item.city}>
                  <strong>{item.city}</strong>
                  <p className="text-muted">{item.detail}</p>
                  <span className="tag">{item.badge}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={`panel-card india-mini-poster india-mini-poster-${page.themeClass}`}>
            <span>India only</span>
            <strong>{page.label} made brighter, friendlier, and easier to browse.</strong>
            <p>
              This page is tailored for Indian travel flows with playful travel-cartoon visuals and practical route ideas.
            </p>
          </section>
        </aside>
      </section>
    </AppShell>
  );
}
