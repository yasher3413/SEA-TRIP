export interface ItineraryDay {
  date: string;
  day: number;
  country: string;
  leg: string;
  activity: string;
  accommodation: string | null;
  transport: string | null;
  status: "booked" | "planned" | "via-driver";
}

export interface Flight {
  route: string;
  date: string;
  departure: string;
  arrival: string;
  airline: string;
  ref: string;
  status: string;
}

export interface Hostel {
  city: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  name: string;
  bookingLink: string | null;
  status: string;
}

export interface Expense {
  date: string;
  description: string;
  category: ExpenseCategory;
  currency: string;
  amountLocal: number | string;
  amountCAD: number;
}

export type ExpenseCategory =
  | "Flight"
  | "Accommodation"
  | "Food"
  | "Transport"
  | "Activity"
  | "Other";

export interface ExpensesData {
  budgetTargets: Record<ExpenseCategory, number | null>;
  preBookedFlights: Expense[];
  log: Expense[];
}

export interface TripMeta {
  traveler: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  countries: string[];
  summary: string;
}

export interface QuickRef {
  gettingAround: { where: string; tip: string }[];
  money: { country: string; tip: string }[];
  apps: string[];
  docs: string[];
}

export interface PackingData {
  clothing: string[];
  toiletries: string[];
  health: string[];
  tech: string[];
}

export interface CityCoord {
  name: string;
  lat: number;
  lng: number;
  country: string;
  flag: string;
  day: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  timestamp: Date;
}
