import type { Trip } from "../types";

interface WeatherSnapshot {
  destinationLabel: string;
  temperature: number;
  windspeed: number;
  weatherCode: number;
}

const weatherCodeMap: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Snow",
  80: "Rain showers",
  95: "Thunderstorm",
};

export function describeWeatherCode(code?: number) {
  if (code === undefined) return "Weather unavailable";
  return weatherCodeMap[code] || "Mixed conditions";
}

export async function fetchDestinationWeather(destination: string): Promise<WeatherSnapshot | null> {
  if (!destination.trim()) return null;

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`,
    );
    const geoData = (await geoResponse.json()) as {
      results?: Array<{ latitude: number; longitude: number; name: string; country?: string }>;
    };
    const match = geoData.results?.[0];
    if (!match) return null;

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${match.latitude}&longitude=${match.longitude}&current=temperature_2m,weather_code,wind_speed_10m`,
    );
    const weatherData = (await weatherResponse.json()) as {
      current?: {
        temperature_2m: number;
        weather_code: number;
        wind_speed_10m: number;
      };
    };
    const current = weatherData.current;
    if (!current) return null;

    return {
      destinationLabel: `${match.name}${match.country ? `, ${match.country}` : ""}`,
      temperature: current.temperature_2m,
      windspeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
    };
  } catch (error) {
    console.warn("Unable to fetch weather:", error);
    return null;
  }
}

export function generatePackingList(trip: Trip, weatherLabel?: string) {
  const base = ["Passport or ID", "Phone charger", "Payment cards", "Travel confirmations", "Medication"];
  const category = (trip.category || "").toLowerCase();
  const vibe = (trip.vibe || "").toLowerCase();
  const destination = trip.destination.toLowerCase();
  const result = new Set(base);

  if (weatherLabel?.toLowerCase().includes("rain")) {
    result.add("Compact umbrella");
    result.add("Quick-dry clothes");
  }

  if (weatherLabel?.toLowerCase().includes("clear") || destination.includes("bali") || destination.includes("goa")) {
    result.add("Sunscreen");
    result.add("Sunglasses");
    result.add("Light cotton outfits");
  }

  if (destination.includes("swiss") || destination.includes("alps") || weatherLabel?.toLowerCase().includes("snow")) {
    result.add("Warm jacket");
    result.add("Thermal layers");
    result.add("Waterproof shoes");
  }

  if (category.includes("food")) {
    result.add("Comfortable walking shoes");
    result.add("Offline map downloads");
  }

  if (category.includes("culture") || vibe.includes("city")) {
    result.add("Day bag");
    result.add("Portable power bank");
  }

  if (vibe.includes("adventure")) {
    result.add("Reusable water bottle");
    result.add("Sportswear");
  }

  return Array.from(result);
}

export function generateTripSuggestions(destination: string, preferences?: string[]) {
  const tags = preferences?.filter(Boolean).map((item) => item.toLowerCase()) || [];
  const ideas = [
    {
      title: `3-day ${destination} starter plan`,
      detail: "Day 1 arrival and local neighborhood walk, Day 2 anchor experience, Day 3 flexible food and shopping block.",
    },
    {
      title: `Best time split for ${destination}`,
      detail: "Keep mornings for fixed bookings, afternoons for exploration, and leave one open evening for group decisions.",
    },
    {
      title: `Budget-safe group flow`,
      detail: "Book stay and airport transfer first, then lock one signature activity before adding optional items.",
    },
  ];

  if (tags.some((item) => item.includes("food"))) {
    ideas.push({
      title: "Food-first itinerary idea",
      detail: "Anchor the trip around one market breakfast, one chef-led dinner, and one neighborhood tasting walk.",
    });
  }

  if (tags.some((item) => item.includes("adventure"))) {
    ideas.push({
      title: "Adventure pacing suggestion",
      detail: "Alternate active and recovery days so the group does not burn out halfway through the trip.",
    });
  }

  return ideas.slice(0, 4);
}

export function buildGmailTripPlanLink(trip: Trip) {
  const recipients = trip.members
    .filter((member) => member.role !== "pending" && member.email)
    .map((member) => member.email)
    .join(",");

  const itineraryLines = (trip.itinerary || []).flatMap((day, index) => {
    const header = `Day ${index + 1}: ${day.label}`;
    const activityLines = day.activities.map(
      (activity) => `- ${activity.time || "TBD"} ${activity.name}${activity.location ? ` @ ${activity.location}` : ""}`,
    );
    return [header, ...activityLines];
  });

  const body = [
    `Hi team,`,
    ``,
    `The trip plan for ${trip.name} is ready.`,
    `Destination: ${trip.destination}`,
    `Dates: ${trip.startDate || "TBD"} to ${trip.endDate || "TBD"}`,
    `Status: ${trip.status || "planning"}`,
    ``,
    `Itinerary`,
    ...(itineraryLines.length ? itineraryLines : ["- Final itinerary is still being updated."]),
    ``,
    `Notes`,
    trip.notes || "No extra notes yet.",
  ].join("\n");

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipients)}&su=${encodeURIComponent(
    `${trip.name} trip plan`,
  )}&body=${encodeURIComponent(body)}`;
}
