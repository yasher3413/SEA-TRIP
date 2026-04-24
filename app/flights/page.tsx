// Revalidate hourly so "flown" vs "upcoming" status stays current
export const revalidate = 3600;

import { FLIGHTS } from "@/lib/trip";
import { formatDate } from "@/lib/utils";
import { Plane } from "lucide-react";

export default function FlightsPage() {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-accent)", color: "var(--teal)" }}
          >
            ✈️ Flights
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {FLIGHTS.length} flights · All bookings confirmed
          </p>
        </div>

        <div className="space-y-4">
          {FLIGHTS.map((flight, i) => {
            const isPast = flight.date < today;
            const isToday = flight.date === today;

            return (
              <div
                key={i}
                className="rounded-2xl p-5 border shadow-sm transition-shadow hover:shadow-md"
                style={{
                  background: isToday ? "var(--today-bg)" : "var(--card)",
                  borderColor: isToday ? "var(--coral)" : "var(--border)",
                  borderWidth: isToday ? 2 : 1,
                  opacity: isPast && !isToday ? 0.7 : 1,
                }}
              >
                {/* Route header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: isToday ? "var(--coral)" : "var(--teal)", color: "#fff" }}
                  >
                    <Plane size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base truncate">{flight.route}</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {flight.airline}
                    </p>
                  </div>
                  {isToday && (
                    <span
                      className="shrink-0 text-xs font-bold px-2 py-1 rounded-full text-white"
                      style={{ background: "var(--coral)" }}
                    >
                      TODAY
                    </span>
                  )}
                  {isPast && !isToday && (
                    <span className="shrink-0 text-xs px-2 py-1 rounded-full" style={{ background: "#F3F4F6", color: "#6B7280" }}>
                      Flown ✓
                    </span>
                  )}
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: "var(--muted)" }}>Date</p>
                    <p className="font-semibold">{formatDate(flight.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: "var(--muted)" }}>Departs</p>
                    <p className="font-semibold">{flight.departure}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: "var(--muted)" }}>Arrives</p>
                    <p className="font-semibold">{flight.arrival}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: "var(--muted)" }}>Booking Ref</p>
                    <p className="font-mono font-bold text-sm" style={{ color: "var(--teal)" }}>{flight.ref}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
