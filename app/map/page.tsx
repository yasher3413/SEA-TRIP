"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CITY_COORDS } from "@/lib/cities";
import { ITINERARY, getCityForDate } from "@/lib/trip";
import { formatDate } from "@/lib/utils";
import type { CityCoord } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Leaflet requires browser APIs — load client-side only
const JourneyMap = dynamic(() => import("@/components/map/JourneyMap"), { ssr: false });

export default function MapPage() {
  const [selected, setSelected] = useState<CityCoord | null>(null);

  const relatedDays = selected
    ? ITINERARY.filter(
        (d) =>
          d.leg.toLowerCase().includes(selected.name.toLowerCase()) ||
          (d.accommodation ?? "").toLowerCase().includes(selected.name.toLowerCase())
      )
    : [];

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

        {/* Map wrapper — fixed height, panel floats over it so map never resizes */}
        <div
          className="relative rounded-2xl overflow-hidden border shadow-sm"
          style={{ borderColor: "var(--border)", height: 520 }}
        >
          <JourneyMap
            onSelectCity={setSelected}
            todayCity={getCityForDate(new Date().toISOString().split("T")[0])}
          />

          {/* Floating side panel — overlays the map, scrolls independently */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key="panel"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2 }}
                className="absolute top-3 right-3 w-64 sm:w-72 rounded-2xl border shadow-xl overflow-y-auto"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  maxHeight: "calc(100% - 24px)",
                  zIndex: 1000,
                }}
              >
                {/* Sticky header */}
                <div
                  className="sticky top-0 flex items-start justify-between p-4 pb-3 border-b"
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
                    className="p-1 rounded-lg hover:bg-black/5 shrink-0 mt-0.5"
                    aria-label="Close panel"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Scrollable itinerary list */}
                <div className="p-4 pt-3 space-y-2.5">
                  {relatedDays.length > 0 ? (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                        Itinerary
                      </p>
                      {relatedDays.map((d) => (
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
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      No itinerary entries linked to this city.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint tooltip — only shown when nothing selected */}
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
