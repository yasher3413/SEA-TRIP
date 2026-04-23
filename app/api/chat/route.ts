import { NextRequest } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";
import { exaSearch } from "@/lib/exa";
import { getCurrentDayInfo, getCityForDate, getNextFlight, totalSpentCAD, META } from "@/lib/trip";

import itinerary from "@/data/itinerary.json";
import flights from "@/data/flights.json";
import hostels from "@/data/hostels.json";
import expenses from "@/data/expenses.json";
import quickref from "@/data/quickref.json";

export const runtime = "nodejs";
export const maxDuration = 60;

function buildSystemPrompt(): string {
  const todayISO = new Date().toISOString().split("T")[0];
  const dayInfo = getCurrentDayInfo();
  const nextFlight = getNextFlight();
  const totalSpent = totalSpentCAD();

  let statusLine = "";
  if (dayInfo.status === "before") {
    statusLine = `The trip has NOT started yet. It begins in ${dayInfo.daysUntil} days on ${META.startDate}.`;
  } else if (dayInfo.status === "after") {
    statusLine = `The trip is OVER. Yash is back home in Toronto.`;
  } else {
    const city = getCityForDate(todayISO);
    statusLine = `TODAY is Day ${dayInfo.dayNum} of the trip. Yash is currently in/around: ${city}.`;
  }

  const nextFlightLine = nextFlight
    ? `Next upcoming flight: ${nextFlight.flight.route} on ${nextFlight.flight.date} (${nextFlight.daysAway === 0 ? "TODAY" : `in ${nextFlight.daysAway} day(s)`}).`
    : "No more flights remaining.";

  return `You are Yash's friendly travel assistant. His parents (and anyone who visits this site) use you to ask about his 29-day Southeast Asia backpacking trip.

Be warm, clear, and a little playful. Never robotic. Address the person naturally.

Today's date: ${todayISO}
${statusLine}
${nextFlightLine}
Total spent so far: CAD $${totalSpent.toFixed(2)}

IMPORTANT RULES:
1. Always prefer the trip data below over any assumptions.
2. If you use info from the trip data, end that sentence or paragraph with a citation tag like [src: itinerary] or [src: flights] etc.
3. If the question can't be answered from trip data (weather, safety, news, restaurant recs), call the exa_search tool — never refuse or say "I don't know" before searching.
4. Keep responses concise and scannable. Use bullet points for lists.
5. If asked about safety, health, or emergencies, be helpful and factual.

=== TRIP DATA ===

ITINERARY (day by day):
${JSON.stringify(itinerary, null, 2)}

FLIGHTS:
${JSON.stringify(flights, null, 2)}

HOSTELS:
${JSON.stringify(hostels, null, 2)}

EXPENSES (pre-booked flights + logged spend):
${JSON.stringify(expenses, null, 2)}

QUICK REFERENCE (apps, money, transport tips):
${JSON.stringify(quickref, null, 2)}

TRIP META:
${JSON.stringify(META, null, 2)}
`;
}

const EXA_TOOL = {
  name: "exa_search",
  description:
    "Search the web for live information — use for weather, safety advisories, current events, restaurant recommendations, or anything not covered by the trip data.",
  input_schema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description: "The search query. Be specific (e.g. 'current weather Hanoi Vietnam May 2026').",
      },
    },
    required: ["query"],
  },
};

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const client = getAnthropicClient();
  const systemPrompt = buildSystemPrompt();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Agentic loop: keep going while model wants to use tools
        let currentMessages = messages;
        let continueLoop = true;

        while (continueLoop) {
          continueLoop = false;

          const response = await client.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            system: systemPrompt,
            tools: [EXA_TOOL],
            messages: currentMessages,
            stream: false, // We stream manually below after tool resolution
          });

          // Check if we need to handle tool use
          if (response.stop_reason === "tool_use") {
            const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
            const toolResults = [];

            for (const block of toolUseBlocks) {
              if (block.type !== "tool_use") continue;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "tool_call", tool: block.name })}\n\n`));

              let resultText = "";
              if (block.name === "exa_search") {
                const input = block.input as { query: string };
                const results = await exaSearch(input.query, 5);
                if (results.length === 0) {
                  resultText = "No results found. Please answer from trip data only and mention that live search returned no results.";
                } else {
                  resultText = results
                    .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.text}`)
                    .join("\n\n---\n\n");
                }
              }

              toolResults.push({
                type: "tool_result" as const,
                tool_use_id: block.id,
                content: resultText,
              });
            }

            // Append assistant turn + tool results and loop
            currentMessages = [
              ...currentMessages,
              { role: "assistant", content: response.content },
              { role: "user", content: toolResults },
            ];
            continueLoop = true;
          } else {
            // Final response — stream it character by character
            const textBlocks = response.content.filter((b) => b.type === "text");
            for (const block of textBlocks) {
              if (block.type !== "text") continue;
              // Stream in small chunks for typing effect
              const text = block.text;
              const chunkSize = 4;
              for (let i = 0; i < text.length; i += chunkSize) {
                const chunk = text.slice(i, i + chunkSize);
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "text", text: chunk })}\n\n`)
                );
              }
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          }
        }
      } catch (err) {
        console.error("Chat API error:", err);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "Something went wrong. Please try again in a moment." })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
