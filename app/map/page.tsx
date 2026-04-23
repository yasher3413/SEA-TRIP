"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CITY_COORDS } from "@/lib/cities";
import { ITINERARY } from "@/lib/trip";
import { formatDate } from "@/lib/utils";
import type { CityCoord } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Leaflet requires browser APIs — load client-side only
const JourneyMap = dynamic(() => import("@/components/map/JourneyMap"), { ssr: false });

export default function MapPage() {
  const [selected, setSelected] = useState<CityCoord | null>(null);

  // Get itinerary days near this city
  const relatedDays = selected
    ? ITINERARY.filter(
        (d) =>
          d.leg.toLowerCase().includes(selected.name.toLowerCase()) ||
          (d.accommodation ?? "").toLowerCase().includes(selected.name.toLowerCase())
      ).slice(0, 5)
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

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Map */}
          <div
            className="flex-1 rounded-2xl overflow-hidden border shadow-sm"
            style={{ borderColor: "var(--border)", minHeight: 480 }}
          >
            <JourneyMap onSelectCity={setSelected} selectedCity={selected} />
          </div>

          {/* Side panel */}
          <AnimatePresence>
            {selected ? (
              <motion.div
                key="panel"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2 }}
                className="lg:w-72 rounded-2xl p-5 border shadow-sm"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xl">{selected.flag}</p>
                    <h2 className="font-bold text-lg" style={{ color: "var(--teal)" }}>
                      {selected.name}
                    </h2>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Day {selected.day} · {selected.country}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1 rounded-lg hover:bg-black/5"
                    aria-label="Close panel"
                  >
                    <X size={16} />
                  </button>
                </div>

                {relatedDays.length > 0 ? (
                  <div className="space-y-3">
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
                            className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                            style={{ background: "var(--teal)" }}
                          >
                            Day {d.day}
                          </span>
                          <span className="text-xs" style={{ color: "var(--muted)" }}>
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
                ) : (
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    No itinerary entries linked to this city.
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hidden lg:flex lg:w-72 rounded-2xl border items-center justify-center"
                style={{ background: "var(--card)", borderColor: "var(--border)", minHeight: 200 }}
              >
                <p className="text-center text-sm px-6" style={{ color: "var(--muted)" }}>
                  👆 Click any city pin to see the itinerary for that stop
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* City legend */}
        <div className="mt-6 flex flex-wrap gap-2">
          {CITY_COORDS.map((c) => (
            <button
              key={`${c.name}-${c.day}`}
              onClick={() => setSelected(c)}
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
