import Exa from "exa-js";

let exaClient: Exa | null = null;

export function getExaClient(): Exa {
  if (!exaClient) {
    exaClient = new Exa(process.env.EXA_API_KEY ?? "");
  }
  return exaClient;
}

export interface ExaResult {
  title: string;
  url: string;
  text: string;
  score: number;
}

export async function exaSearch(query: string, numResults = 5): Promise<ExaResult[]> {
  const exa = getExaClient();
  try {
    const res = await exa.searchAndContents(query, {
      numResults,
      type: "neural",
      useAutoprompt: true,
      text: { maxCharacters: 800 },
    });
    return (res.results ?? []).map((r) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      text: r.text ?? "",
      score: (r as { score?: number }).score ?? 0,
    }));
  } catch (err) {
    console.error("Exa search failed:", err);
    return [];
  }
}
