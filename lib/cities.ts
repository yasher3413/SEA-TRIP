import type { CityCoord } from "./types";

// City lat/lng for map pins — one entry per main stop in trip order
export const CITY_COORDS: CityCoord[] = [
  { name: "Toronto", lat: 43.6532, lng: -79.3832, country: "Travel", flag: "🇨🇦", day: 1 },
  { name: "Taipei", lat: 25.0330, lng: 121.5654, country: "Taiwan", flag: "🇹🇼", day: 2 },
  { name: "Jiufen", lat: 25.1087, lng: 121.8442, country: "Taiwan", flag: "🇹🇼", day: 4 },
  { name: "Kaohsiung", lat: 22.6273, lng: 120.3014, country: "Taiwan", flag: "🇹🇼", day: 5 },
  { name: "Hanoi", lat: 21.0285, lng: 105.8542, country: "Vietnam", flag: "🇻🇳", day: 10 },
  { name: "Ha Giang", lat: 22.8225, lng: 104.9840, country: "Vietnam", flag: "🇻🇳", day: 12 },
  { name: "Hoi An", lat: 15.8800, lng: 108.3380, country: "Vietnam", flag: "🇻🇳", day: 17 },
  { name: "Da Nang", lat: 16.0544, lng: 108.2022, country: "Vietnam", flag: "🇻🇳", day: 19 },
  { name: "Ho Chi Minh City", lat: 10.8231, lng: 106.6297, country: "Vietnam", flag: "🇻🇳", day: 21 },
  { name: "Kuala Lumpur", lat: 3.1390, lng: 101.6869, country: "Malaysia", flag: "🇲🇾", day: 23 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, country: "Singapore", flag: "🇸🇬", day: 26 },
];
