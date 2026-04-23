import { NextRequest, NextResponse } from "next/server";
import { writeDataFile } from "@/lib/github";
import { cookies } from "next/headers";

export const runtime = "nodejs";

function isAuthed(req: NextRequest): boolean {
  // Check cookie set by admin login
  const cookie = req.cookies.get("admin_session");
  return cookie?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, content, message } = await req.json();

  if (!filename || !content) {
    return NextResponse.json({ error: "Missing filename or content" }, { status: 400 });
  }

  const allowedFiles = [
    "expenses.json",
    "itinerary.json",
    "flights.json",
    "hostels.json",
    "quickref.json",
    "packing.json",
    "trip-meta.json",
  ];

  if (!allowedFiles.includes(filename)) {
    return NextResponse.json({ error: "File not allowed" }, { status: 400 });
  }

  try {
    await writeDataFile(
      filename,
      JSON.stringify(content, null, 2),
      message ?? `chore: update ${filename} via admin`
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("GitHub write failed:", err);
    return NextResponse.json({ error: "GitHub write failed", detail: String(err) }, { status: 500 });
  }
}
