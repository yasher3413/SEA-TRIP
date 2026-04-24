import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPlaidClient, mapPlaidCategory, TRIP_START } from "@/lib/plaid";
import { readDataFile, writeDataFile } from "@/lib/github";
import type { ExpensesData, Expense } from "@/lib/types";

interface PlaidState {
  cursor: string | null;
  lastSync: string | null;
  transactionIds: string[];
}

export async function POST() {
  const jar = await cookies();
  if (!jar.get("admin_auth")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = process.env.PLAID_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { error: "PLAID_ACCESS_TOKEN env var not set. Complete bank link first." },
      { status: 400 }
    );
  }

  try {
    const plaid = getPlaidClient();

    // Load persisted cursor + seen IDs
    let state: PlaidState = { cursor: null, lastSync: null, transactionIds: [] };
    try {
      state = JSON.parse(await readDataFile("plaid-state.json"));
    } catch {
      // First sync — start fresh
    }

    // Cursor-based sync — only fetches transactions added/modified since last call
    const added: Expense[] = [];
    let cursor = state.cursor ?? undefined;
    let hasMore = true;

    while (hasMore) {
      const res = await plaid.transactionsSync({
        access_token: accessToken,
        cursor,
        options: { include_personal_finance_category: true },
      });

      for (const tx of res.data.added) {
        // Skip: pending, before trip, credits (negative = money in), already seen
        if (tx.pending) continue;
        if (tx.date < TRIP_START) continue;
        if (tx.amount <= 0) continue;
        if (state.transactionIds.includes(tx.transaction_id)) continue;

        const category = mapPlaidCategory(
          tx.personal_finance_category?.primary ?? ""
        );

        added.push({
          date: tx.date,
          description: tx.merchant_name ?? tx.name,
          category,
          currency: tx.iso_currency_code ?? "CAD",
          amountLocal: tx.amount,
          amountCAD: tx.amount,
        });

        state.transactionIds.push(tx.transaction_id);
      }

      cursor = res.data.next_cursor;
      hasMore = res.data.has_more;
    }

    if (added.length === 0) {
      // Still update cursor + lastSync even when nothing new
      state.cursor = cursor ?? null;
      state.lastSync = new Date().toISOString();
      await writeDataFile(
        "plaid-state.json",
        JSON.stringify(state, null, 2),
        "chore: plaid sync (no new transactions)"
      );
      return NextResponse.json({ imported: 0, message: "No new transactions" });
    }

    // Append to expenses.json
    const expensesRaw = await readDataFile("expenses.json");
    const expenses: ExpensesData = JSON.parse(expensesRaw);
    expenses.log = [...expenses.log, ...added].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    state.cursor = cursor ?? null;
    state.lastSync = new Date().toISOString();

    // Commit both files in parallel
    await Promise.all([
      writeDataFile(
        "expenses.json",
        JSON.stringify(expenses, null, 2),
        `expense: import ${added.length} transaction(s) via Plaid`
      ),
      writeDataFile(
        "plaid-state.json",
        JSON.stringify(state, null, 2),
        "chore: update plaid sync cursor"
      ),
    ]);

    return NextResponse.json({ imported: added.length, transactions: added });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
