import { NextRequest } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";
import { exaSearch } from "@/lib/exa";
import { getCurrentDayInfo, getCityForDate, getNextFlight, totalSpentCAD, META } from "@/lib/trip";
import type Anthropic from "@anthropic-ai/sdk";

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
    ? `Next upcoming flight: ${nextFlight.flight.route} on ${nextFlight.flight.date} (${
        nextFlight.daysAway === 0 ? "TODAY" : `in ${nextFlight.daysAway} day(s)`
      }).`
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
4. Keep responses concise and scannable. Use bullet points for lists. Use markdown tables when showing tabular data (like expenses by category).
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

const EXA_TOOL: Anthropic.Tool = {
  name: "exa_search",
  description:
    "Search the web for live information — weather, safety advisories, current events, restaurant recs, or anything not in the trip data.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Specific search query, e.g. 'current weather Hanoi Vietnam May 2026'.",
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
      const send = (obj: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        let currentMessages: Anthropic.MessageParam[] = messages;

        // Agentic streaming loop.
        // We stream from the very first call so text tokens reach the client immediately.
        // If the model calls a tool we pause, resolve it, and continue streaming.
        while (true) {
          // Buffers to reconstruct the assistant turn for the message history
          let assistantText = "";
          const toolUseBlocks: Array<{ id: string; name: string; inputJson: string }> = [];
          let activeToolUse: { id: string; name: string; inputJson: string } | null = null;
          let stopReason = "end_turn";

          const response = await client.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2048,
            system: systemPrompt,
            tools: [EXA_TOOL],
            messages: currentMessages,
            stream: true,
          });

          for await (const event of response) {
            switch (event.type) {
              case "content_block_start":
                if (event.content_block.type === "tool_use") {
                  send({ type: "tool_call", tool: event.content_block.name });
                  activeToolUse = {
                    id: event.content_block.id,
                    name: event.content_block.name,
                    inputJson: "",
                  };
                }
                break;

              case "content_block_delta":
                if (event.delta.type === "text_delta") {
                  send({ type: "text", text: event.delta.text });
                  assistantText += event.delta.text;
                } else if (
                  event.delta.type === "input_json_delta" &&
                  activeToolUse
                ) {
                  activeToolUse.inputJson += event.delta.partial_json;
                }
                break;

              case "content_block_stop":
                if (activeToolUse) {
                  toolUseBlocks.push(activeToolUse);
                  activeToolUse = null;
                }
                break;

              case "message_delta":
                stopReason = event.delta.stop_reason ?? "end_turn";
                break;
            }
          }

          // No tool use — final answer is already streamed
          if (stopReason !== "tool_use") {
            send({ type: "done" });
            break;
          }

          // Resolve tool calls
          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          for (const toolUse of toolUseBlocks) {
            let resultText = "";
            if (toolUse.name === "exa_search") {
              const input = JSON.parse(toolUse.inputJson || "{}") as { query: string };
              const results = await exaSearch(input.query, 5);
              resultText =
                results.length === 0
                  ? "No results found. Answer from trip data only and note that live search returned nothing."
                  : results
                      .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.text}`)
                      .join("\n\n---\n\n");
            }
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: resultText,
            });
          }

          // Reconstruct assistant content block for history
          const assistantContent: Anthropic.ContentBlockParam[] = [
            ...(assistantText ? [{ type: "text" as const, text: assistantText }] : []),
            ...toolUseBlocks.map((t) => ({
              type: "tool_use" as const,
              id: t.id,
              name: t.name,
              input: JSON.parse(t.inputJson || "{}") as Record<string, unknown>,
            })),
          ];

          currentMessages = [
            ...currentMessages,
            { role: "assistant", content: assistantContent },
            { role: "user", content: toolResults },
          ];
          // Loop continues — next iteration streams the final answer
        }
      } catch (err) {
        console.error("Chat API error:", err);
        send({
          type: "error",
          message: "Something went wrong. Please try again in a moment.",
        });
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
