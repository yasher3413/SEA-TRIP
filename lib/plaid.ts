import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

let client: PlaidApi | null = null;

export function getPlaidClient(): PlaidApi {
  if (client) return client;
  const env = (process.env.PLAID_ENV ?? "sandbox") as keyof typeof PlaidEnvironments;
  const config = new Configuration({
    basePath: PlaidEnvironments[env],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
        "PLAID-SECRET": process.env.PLAID_SECRET!,
      },
    },
  });
  client = new PlaidApi(config);
  return client;
}

import type { ExpenseCategory } from "./types";

// Plaid personal_finance_category.primary → our categories
export function mapPlaidCategory(primary: string): ExpenseCategory {
  switch (primary) {
    case "FOOD_AND_DRINK":
      return "Food";
    case "TRANSPORTATION":
    case "TRAVEL":
      return "Transport";
    case "ENTERTAINMENT":
    case "RECREATION_AND_FITNESS":
      return "Activity";
    case "LODGING":
      return "Accommodation";
    default:
      return "Other";
  }
}

export const TRIP_START = "2026-04-23";
