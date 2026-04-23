import Anthropic from "@anthropic-ai/sdk";

// Singleton — re-used across requests in the same Lambda warm start
let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}
