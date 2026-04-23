import expensesData from "@/data/expenses.json";
import type { ExpensesData, Expense } from "@/lib/types";
import { formatCAD, formatDate } from "@/lib/utils";
import ExpenseCharts from "@/components/expenses/ExpenseCharts";

const data = expensesData as ExpensesData;

const CATEGORY_COLORS: Record<string, string> = {
  Flight: "#0F766E",
  Accommodation: "#F97316",
  Food: "#10B981",
  Transport: "#6366F1",
  Activity: "#F59E0B",
  Other: "#6B7280",
};

export default function ExpensesPage() {
  const all: Expense[] = [...data.preBookedFlights, ...data.log].sort(
    (a, b) => b.date.localeCompare(a.date)
  );
  const total = all.reduce((s, e) => s + e.amountCAD, 0);

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-accent)", color: "var(--teal)" }}
          >
            💰 Expenses
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Pre-booked flights + logged spend
          </p>
        </div>

        {/* Big total */}
        <div
          className="rounded-3xl p-6 mb-8 text-center border"
          style={{ background: "var(--teal)", borderColor: "transparent" }}
        >
          <p className="text-white/70 text-sm font-medium uppercase tracking-wide mb-1">
            Total Spent
          </p>
          <p className="text-4xl font-bold text-white">{formatCAD(total)}</p>
          <p className="text-white/60 text-xs mt-1">{all.length} transactions</p>
        </div>

        {/* Charts */}
        <ExpenseCharts data={data} />

        {/* Transaction list */}
        <div className="mt-8">
          <h2 className="font-bold text-lg mb-4">All Transactions</h2>
          <div className="space-y-2">
            {all.map((expense, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                {/* Category dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: CATEGORY_COLORS[expense.category] ?? "#ccc" }}
                />

                {/* Description */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{expense.description}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {formatDate(expense.date)} · {expense.category}
                    {expense.currency !== "CAD" && ` · ${expense.currency}`}
                  </p>
                </div>

                {/* Amount */}
                <span className="font-semibold text-sm shrink-0">
                  {formatCAD(expense.amountCAD)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
