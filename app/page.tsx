// Always server-render so WhereIsYashCard and WeatherWidget get today's real date
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import WhereIsYashCard from "@/components/hero/WhereIsYashCard";
import WeatherWidget from "@/components/hero/WeatherWidget";
import ChatWindow from "@/components/chat/ChatWindow";
import { totalSpentCAD } from "@/lib/trip";
import { formatCAD } from "@/lib/utils";

export default function HomePage() {
  const totalSpent = totalSpentCAD();

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page header */}
        <div className="text-center">
          <h1
            className="text-3xl md:text-4xl font-bold mb-1"
            style={{ fontFamily: "var(--font-accent)", color: "var(--teal)" }}
          >
            Yash&apos;s SEA Trip 🌏
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            29 days · Taiwan 🇹🇼 → Vietnam 🇻🇳 → Malaysia 🇲🇾 → Singapore 🇸🇬
          </p>
          {/* Live weather — non-blocking, only shown during the trip */}
          <div className="mt-2 flex justify-center">
            <Suspense fallback={null}>
              <WeatherWidget />
            </Suspense>
          </div>
        </div>

        {/* Live hero widget */}
        <WhereIsYashCard />

        {/* Quick stats strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Countries", value: "4 🌏" },
            { label: "Days", value: "29 ✈️" },
            { label: "Spent", value: formatCAD(totalSpent) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-3 text-center border"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <p className="text-base font-bold" style={{ color: "var(--teal)" }}>
                {stat.value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Chatbot section */}
        <div>
          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: "var(--muted)" }}
          >
            💬 Ask the Trip Assistant
          </h2>
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
