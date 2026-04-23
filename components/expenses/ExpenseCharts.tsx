"use client";

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import type { ExpensesData, ExpenseCategory } from "@/lib/types";
import { formatCAD } from "@/lib/utils";

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Flight: "#0F766E",
  Accommodation: "#F97316",
  Food: "#10B981",
  Transport: "#6366F1",
  Activity: "#F59E0B",
  Other: "#6B7280",
};

interface Props {
  data: ExpensesData;
}

function allExpenses(data: ExpensesData) {
  return [...data.preBookedFlights, ...data.log];
}

export default function ExpenseCharts({ data }: Props) {
  const all = allExpenses(data);

  // Category breakdown
  const byCategory = Object.entries(
    all.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amountCAD;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));

  // Country breakdown (inferred from description keywords)
  const countryKeywords: Record<string, string[]> = {
    Taiwan: ["TPE", "Taipei", "Kaohsiung", "MEANDER", "D'well", "TWD", "HSR"],
    Vietnam: ["HAN", "DAD", "SGN", "Hanoi", "Hoi An", "Da Nang", "HCMC", "Saigon", "VND", "VJ503", "VJ943", "QH151"],
    Malaysia: ["KUL", "KL", "Sunshine", "MYR", "VJ811"],
    Singapore: ["SIN", "SGD", "Bohemian"],
    "Pre-departure": ["YYZ", "SFO", "UA28", "UA436", "AIIS7C", "Aeroplan"],
  };

  const byCountry = Object.entries(
    all.reduce<Record<string, number>>((acc, e) => {
      const desc = e.description + " " + e.currency + " " + e.category;
      let country = "Other";
      for (const [c, keywords] of Object.entries(countryKeywords)) {
        if (keywords.some((k) => desc.includes(k))) { country = c; break; }
      }
      acc[country] = (acc[country] ?? 0) + e.amountCAD;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));

  // Daily spend line
  const dailyMap = all.reduce<Record<string, number>>((acc, e) => {
    acc[e.date] = (acc[e.date] ?? 0) + e.amountCAD;
    return acc;
  }, {});
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date: date.slice(5), amount: Math.round(amount * 100) / 100 }));

  return (
    <div className="space-y-8">
      {/* Row 1: Donut + Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category donut */}
        <div className="rounded-2xl p-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="font-semibold text-sm mb-4" style={{ color: "var(--muted)" }}>
            By Category
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={byCategory}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {byCategory.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={CATEGORY_COLORS[entry.name as ExpenseCategory] ?? "#ccc"}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCAD(Number(v ?? 0))} />
              <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Country bar */}
        <div className="rounded-2xl p-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="font-semibold text-sm mb-4" style={{ color: "var(--muted)" }}>
            By Country (estimated)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCountry} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5DDD4" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => formatCAD(Number(v ?? 0))} />
              <Bar dataKey="value" fill="#0F766E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Daily spend line chart */}
      <div className="rounded-2xl p-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <p className="font-semibold text-sm mb-4" style={{ color: "var(--muted)" }}>
          Daily Spend (CAD)
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dailyData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5DDD4" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(v) => formatCAD(Number(v ?? 0))} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#F97316"
              strokeWidth={2}
              dot={{ r: 3, fill: "#F97316" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
