import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CountryCode, Products } from "plaid";
import { getPlaidClient } from "@/lib/plaid";

export async function POST() {
  const jar = await cookies();
  if (!jar.get("admin_auth")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const plaid = getPlaidClient();
    const res = await plaid.linkTokenCreate({
      user: { client_user_id: "yash-sea-trip" },
      client_name: "SEA Trip Tracker",
      products: [Products.Transactions],
      country_codes: [CountryCode.Ca, CountryCode.Us],
      language: "en",
    });
    return NextResponse.json({ linkToken: res.data.link_token });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
