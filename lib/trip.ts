import itinerary from "@/data/itinerary.json";
import flights from "@/data/flights.json";
import hostels from "@/data/hostels.json";
import expenses from "@/data/expenses.json";
import tripMeta from "@/data/trip-meta.json";
import type { ItineraryDay, Flight, Hostel, ExpensesData, TripMeta } from "./types";

const ITINERARY = itinerary as ItineraryDay[];
const FLIGHTS = flights as Flight[];
const HOSTELS = hostels as Hostel[];
const EXPENSES = expenses as ExpensesData;
const META = tripMeta as TripMeta;

export function getCurrentDayInfo(dateStr?: string) {
  const today = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(META.startDate);
  const end = new Date(META.endDate);

  if (today < start) {
    const diffMs = start.getTime() - today.getTime();
    const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { status: "before" as const, daysUntil };
  }

  if (today > end) {
    return { status: "after" as const };
  }

  const isoDate = today.toISOString().split("T")[0];
  const dayEntry = ITINERARY.find((d) => d.date === isoDate) ?? null;
  const dayNum = dayEntry?.day ?? null;

  return { status: "during" as const, isoDate, dayEntry, dayNum };
}

export function getCityForDate(dateStr: string): string {
  const entry = ITINERARY.find((d) => d.date === dateStr);
  if (!entry) return "Unknown";
  // Extract city from leg (first part before →)
  return entry.leg.split("→").pop()?.trim() ?? entry.leg;
}

export function getNextFlight(fromDate?: string): { flight: Flight; daysAway: number } | null {
  const today = fromDate ? new Date(fromDate) : new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = FLIGHTS
    .map((f) => ({ flight: f, d: new Date(f.date) }))
    .filter(({ d }) => d >= today)
    .sort((a, b) => a.d.getTime() - b.d.getTime());

  if (!upcoming.length) return null;

  const { flight, d } = upcoming[0];
  const daysAway = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { flight, daysAway };
}

export function totalSpentCAD(): number {
  const flights = EXPENSES.preBookedFlights.reduce((s, e) => s + e.amountCAD, 0);
  const log = EXPENSES.log.reduce((s, e) => s + e.amountCAD, 0);
  return Math.round((flights + log) * 100) / 100;
}

export function getTodayHostel(dateStr?: string): Hostel | null {
  const isoDate = dateStr ?? new Date().toISOString().split("T")[0];
  return (
    HOSTELS.find((h) => h.checkIn <= isoDate && h.checkOut > isoDate) ?? null
  );
}

export function getCountryFlag(country: string): string {
  const map: Record<string, string> = {
    Taiwan: "🇹🇼",
    Vietnam: "🇻🇳",
    Malaysia: "🇲🇾",
    Singapore: "🇸🇬",
    Travel: "✈️",
  };
  return map[country] ?? "🌏";
}

export function getCountryColor(country: string): string {
  const map: Record<string, string> = {
    Taiwan: "#E63946",
    Vietnam: "#D62828",
    Malaysia: "#0077B6",
    Singapore: "#C9184A",
    Travel: "#6B7280",
  };
  return map[country] ?? "#6B7280";
}

export { ITINERARY, FLIGHTS, HOSTELS, EXPENSES, META };
