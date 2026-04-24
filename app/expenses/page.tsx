import expensesData from "@/data/expenses.json";
import type { ExpensesData, Expense, ExpenseCategory } from "@/lib/types";
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

function BudgetVsActual({ data }: { data: ExpensesData }) {
  const all = [...data.preBookedFlights, ...data.log];

  // Sum actuals per category (exclude Flights from budget comparison if no target set)
  const actuals = all.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amountCAD;
    return acc;
  }, {});

  const rows = (Object.entries(data.budgetTargets) as [ExpenseCategory, number | null][]).filter(
    ([, target]) => target !== null
  );

  if (rows.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-5 border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <p className="font-semibold text-sm mb-4" style={{ color: "var(--muted)" }}>
        Budget vs Actual
      </p>
      <div className="space-y-4">
        {rows.map(([category, budget]) => {
          const actual = actuals[category] ?? 0;
          const pct = budget ? Math.min((actual / budget) * 100, 100) : 0;
          const over = budget ? actual > budget : false;
          const color = CATEGORY_COLORS[category] ?? "#ccc";

          return (
            <div key={category}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                  <span className="font-medium">{category}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span style={{ color: over ? "#EF4444" : "var(--muted)" }}>
                    {formatCAD(actual)}
                  </span>
                  <span style={{ color: "var(--muted)" }}>/ {formatCAD(budget!)}</span>
                  {over && (
                    <span className="px-1.5 py-0.5 rounded-full text-white text-xs font-bold bg-red-500">
                      over
                    </span>
                  )}
                </div>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "var(--cream-dark)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: over ? "#EF4444" : color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

        {/* Budget vs Actual */}
        <div className="mt-6">
          <BudgetVsActual data={data} />
        </div>

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
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: CATEGORY_COLORS[expense.category] ?? "#ccc" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{expense.description}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {formatDate(expense.date)} · {expense.category}
                    {expense.currency !== "CAD" && ` · ${expense.currency}`}
                  </p>
                </div>
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
