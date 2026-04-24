"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { CITY_COORDS } from "@/lib/cities";
import { ITINERARY, getCityForDate } from "@/lib/trip";
import { formatDate } from "@/lib/utils";
import type { CityCoord } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const JourneyMap = dynamic(() => import("@/components/map/JourneyMap"), { ssr: false });

function ItineraryCards({ city }: { city: CityCoord }) {
  const days = ITINERARY.filter(
    (d) =>
      d.leg.toLowerCase().includes(city.name.toLowerCase()) ||
      (d.accommodation ?? "").toLowerCase().includes(city.name.toLowerCase())
  );

  if (days.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        No itinerary entries linked to this city.
      </p>
    );
  }

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: "var(--muted)" }}>
        Itinerary
      </p>
      <div className="space-y-2.5">
        {days.map((d) => (
          <div
            key={d.date}
            className="rounded-xl p-3 border"
            style={{ background: "var(--cream)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full text-white shrink-0"
                style={{ background: "var(--teal)" }}
              >
                Day {d.day}
              </span>
              <span className="text-xs truncate" style={{ color: "var(--muted)" }}>
                {formatDate(d.date)}
              </span>
            </div>
            <p className="text-sm">{d.activity}</p>
            {d.accommodation && (
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                🏨 {d.accommodation}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default function MapPage() {
  const [selected, setSelected] = useState<CityCoord | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-accent)", color: "var(--teal)" }}
          >
            🗺️ Journey Map
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {CITY_COORDS.length} stops across 4 countries · Click a pin for details
          </p>
        </div>

        {/* Outer wrapper: relative but NOT overflow-hidden so panels can escape map clip */}
        <div className="relative" style={{ height: 520 }}>
          {/* Map — clipped to its own rounded corners */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border shadow-sm"
            style={{ borderColor: "var(--border)" }}
          >
            <JourneyMap
              onSelectCity={setSelected}
              todayCity={getCityForDate(new Date().toISOString().split("T")[0])}
            />
          </div>

          {/* Hint pill — shown when nothing is selected */}
          <AnimatePresence>
            {!selected && (
              <motion.div
                key="hint"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{ zIndex: 999 }}
              >
                <div
                  className="text-xs px-3 py-1.5 rounded-full border shadow-sm whitespace-nowrap"
                  style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted)" }}
                >
                  👆 Click any city pin for details
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop: floating card on the right */}
          <AnimatePresence>
            {selected && !isMobile && (
              <motion.div
                key="desktop-panel"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2 }}
                className="absolute top-3 right-3 w-72 rounded-2xl border shadow-xl flex flex-col"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  maxHeight: "calc(100% - 24px)",
                  zIndex: 1000,
                }}
              >
                {/* Sticky header */}
                <div
                  className="sticky top-0 flex items-start justify-between p-4 pb-3 border-b shrink-0 rounded-t-2xl"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <div>
                    <p className="text-xl leading-none mb-1">{selected.flag}</p>
                    <h2 className="font-bold text-lg leading-tight" style={{ color: "var(--teal)" }}>
                      {selected.name}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      Day {selected.day} · {selected.country}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1 rounded-lg hover:bg-black/5 shrink-0"
                    aria-label="Close panel"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto p-4">
                  <ItineraryCards city={selected} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile: bottom sheet sliding up from the bottom of the map */}
          <AnimatePresence>
            {selected && isMobile && (
              <motion.div
                key="mobile-sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="absolute bottom-0 left-0 right-0 flex flex-col rounded-b-2xl border-t border-x shadow-2xl"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  maxHeight: "58%",
                  zIndex: 1000,
                }}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-2.5 pb-1 shrink-0">
                  <div className="w-9 h-1 rounded-full" style={{ background: "var(--border)" }} />
                </div>

                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{selected.flag}</span>
                    <div>
                      <h2 className="font-bold text-base leading-tight" style={{ color: "var(--teal)" }}>
                        {selected.name}
                      </h2>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        Day {selected.day} · {selected.country}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1 rounded-lg hover:bg-black/5 shrink-0"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Scrollable itinerary */}
                <div className="overflow-y-auto p-4">
                  <ItineraryCards city={selected} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* City legend */}
        <div className="mt-5 flex flex-wrap gap-2">
          {CITY_COORDS.map((c) => (
            <button
              key={`${c.name}-${c.day}`}
              onClick={() => setSelected(selected?.name === c.name ? null : c)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors"
              style={{
                background: selected?.name === c.name ? "var(--teal)" : "var(--card)",
                color: selected?.name === c.name ? "#fff" : "var(--foreground)",
                borderColor: "var(--border)",
              }}
            >
              {c.flag} {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
