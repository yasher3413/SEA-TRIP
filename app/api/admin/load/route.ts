import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  // Check auth cookie
  const cookie = req.cookies.get("admin_session");
  if (cookie?.value !== process.env.ADMIN_PASSWORD) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const file = req.nextUrl.searchParams.get("file");
  if (!file) return new NextResponse("Missing file param", { status: 400 });

  // Only allow reading from data/
  const allowed = ["expenses.json","itinerary.json","flights.json","hostels.json","quickref.json","packing.json","trip-meta.json"];
  if (!allowed.includes(file)) return new NextResponse("Not allowed", { status: 400 });

  const filePath = path.join(process.cwd(), "data", file);
  const content = await readFile(filePath, "utf-8");
  return new NextResponse(content, {
    headers: { "Content-Type": "application/json" },
  });
}
