import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("receipt") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  // Determine media type
  type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  const mimeMap: Record<string, ImageMediaType> = {
    "image/jpeg": "image/jpeg",
    "image/jpg": "image/jpeg",
    "image/png": "image/png",
    "image/webp": "image/webp",
    "image/heic": "image/jpeg", // Claude can handle HEIC as JPEG
  };
  const mediaType: ImageMediaType = mimeMap[file.type] ?? "image/jpeg";

  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: `Extract the following fields from this receipt image and return ONLY valid JSON with no extra text:
{
  "date": "YYYY-MM-DD",
  "description": "merchant name and brief description",
  "amount": number (in the currency shown),
  "currency": "3-letter ISO code (e.g. CAD, USD, TWD, VND, MYR, SGD)",
  "category": one of ["Food","Transport","Accommodation","Activity","Other"]
}
If you cannot read a field clearly, use null. Date must be YYYY-MM-DD format.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    // Extract JSON from response (might be wrapped in backticks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ extracted: parsed });
  } catch {
    return NextResponse.json({ error: "Could not parse receipt", raw: text }, { status: 422 });
  }
}
