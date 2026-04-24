import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPlaidClient } from "@/lib/plaid";

export async function POST(req: NextRequest) {
  const jar = await cookies();
  if (!jar.get("admin_auth")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { publicToken } = await req.json();
  if (!publicToken) {
    return NextResponse.json({ error: "Missing publicToken" }, { status: 400 });
  }

  try {
    const plaid = getPlaidClient();
    const res = await plaid.itemPublicTokenExchange({ public_token: publicToken });
    const accessToken = res.data.access_token;

    // Return the access token so the user can store it as PLAID_ACCESS_TOKEN
    // in their Vercel environment variables. We never persist it to git.
    return NextResponse.json({ accessToken });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
