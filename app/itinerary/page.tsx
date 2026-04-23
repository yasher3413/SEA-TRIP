"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ITINERARY, getCountryColor, getCountryFlag } from "@/lib/trip";
import { formatDate } from "@/lib/utils";
import { MapPin, Plane, Hotel, Link as LinkIcon, Check } from "lucide-react";

// DayPhoto tries to load /public/images/day-{n}.jpg — silently hides if missing
function DayPhoto({ day }: { day: number }) {
  const [exists, setExists] = useState(true);

  if (!exists) return null;

  return (
    <div className="mt-3 rounded-xl overflow-hidden">
      <Image
        src={`/images/day-${day}.jpg`}
        alt={`Day ${day} photo`}
        width={600}
        height={300}
        className="w-full object-cover max-h-48"
        onError={() => setExists(false)}
        priority={false}
      />
    </div>
  );
}

// Share button — copies deep-link URL to clipboard
function ShareButton({ day }: { day: number }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const url = `${window.location.origin}/itinerary?day=${day}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors"
      style={{
        borderColor: copied ? "var(--teal)" : "var(--border)",
        color: copied ? "var(--teal)" : "var(--muted)",
        background: "transparent",
      }}
      title="Copy link to this day"
    >
      {copied ? <Check size={11} /> : <LinkIcon size={11} />}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}

export default function ItineraryPage() {
  const today = new Date().toISOString().split("T")[0];

  // Scroll to highlighted day on load (supports ?day=N deep link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetDay = params.get("day");
    if (targetDay) {
      const el = document.getElementById(`day-${targetDay}`);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  }, []);

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-accent)", color: "var(--teal)" }}
          >
            📅 Full Itinerary
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            29 days · Apr 23 – May 21, 2026
          </p>
        </div>

        {/* Country legend */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["Taiwan", "Vietnam", "Malaysia", "Singapore", "Travel"] as const).map((c) => (
            <span
              key={c}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full text-white font-medium"
              style={{ background: getCountryColor(c) }}
            >
              {getCountryFlag(c)} {c}
            </span>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-5 top-0 bottom-0 w-0.5"
            style={{ background: "var(--border)" }}
          />

          <div className="space-y-3 pl-14">
            {ITINERARY.map((day, i) => {
              const isToday = day.date === today;
              const isPast = day.date < today;
              const color = getCountryColor(day.country);
              const flag = getCountryFlag(day.country);

              return (
                <motion.div
                  key={day.date}
                  id={`day-${day.day}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.015 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-9 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow"
                    style={{
                      background: isToday ? "var(--coral)" : isPast ? "#D1D5DB" : color,
                      color: "#fff",
                    }}
                  >
                    {isToday ? "📍" : flag}
                  </div>

                  {/* Card */}
                  <div
                    className="rounded-2xl p-4 border transition-shadow hover:shadow-md"
                    style={{
                      background: isToday ? "#FFF7ED" : "var(--card)",
                      borderColor: isToday ? "var(--coral)" : "var(--border)",
                      borderWidth: isToday ? 2 : 1,
                      opacity: isPast && !isToday ? 0.75 : 1,
                    }}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                          style={{ background: color }}
                        >
                          Day {day.day}
                        </span>
                        {isToday && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                            style={{ background: "var(--coral)" }}
                          >
                            TODAY
                          </span>
                        )}
                        <span
                          className="text-sm font-semibold truncate"
                          style={{ color: "var(--foreground)" }}
                        >
                          {day.leg}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          {formatDate(day.date)}
                        </span>
                        <ShareButton day={day.day} />
                      </div>
                    </div>

                    {/* Activity */}
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin size={13} className="mt-0.5 shrink-0" style={{ color: "var(--teal)" }} />
                      <span>{day.activity}</span>
                    </div>

                    {/* Accommodation */}
                    {day.accommodation && (
                      <div
                        className="flex items-center gap-2 text-sm mt-1.5"
                        style={{ color: "var(--muted)" }}
                      >
                        <Hotel size={13} className="shrink-0" style={{ color: "var(--coral)" }} />
                        <span>{day.accommodation}</span>
                      </div>
                    )}

                    {/* Transport */}
                    {day.transport && (
                      <div
                        className="flex items-center gap-2 text-sm mt-1.5"
                        style={{ color: "var(--muted)" }}
                      >
                        <Plane size={13} className="shrink-0" style={{ color: "var(--teal-light)" }} />
                        <span>{day.transport}</span>
                      </div>
                    )}

                    {/* Day photo — shows automatically if /public/images/day-{n}.jpg exists */}
                    <DayPhoto day={day.day} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
