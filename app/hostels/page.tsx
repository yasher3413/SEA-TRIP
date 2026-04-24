// Revalidate hourly so "active stay" status stays current
export const revalidate = 3600;

import { HOSTELS } from "@/lib/trip";
import { formatDate } from "@/lib/utils";
import { Hotel, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

const CITY_FLAGS: Record<string, string> = {
  Taipei: "🇹🇼",
  Kaohsiung: "🇹🇼",
  Hanoi: "🇻🇳",
  "Ha Giang": "🇻🇳",
  "Hoi An": "🇻🇳",
  "Da Nang": "🇻🇳",
  HCMC: "🇻🇳",
  "Kuala Lumpur": "🇲🇾",
  Singapore: "🇸🇬",
};

export default function HostelsPage() {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-accent)", color: "var(--teal)" }}
          >
            🏨 Hostels
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {HOSTELS.length} stays · {HOSTELS.reduce((s, h) => s + h.nights, 0)} total nights
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HOSTELS.map((hostel, i) => {
            const isActive = hostel.checkIn <= today && hostel.checkOut > today;
            const isPast = hostel.checkOut <= today;
            const flag = CITY_FLAGS[hostel.city] ?? "🌏";

            return (
              <div
                key={i}
                className="rounded-2xl p-5 border shadow-sm transition-shadow hover:shadow-md"
                style={{
                  background: isActive ? "var(--active-bg)" : "var(--card)",
                  borderColor: isActive ? "#16A34A" : "var(--border)",
                  borderWidth: isActive ? 2 : 1,
                  opacity: isPast ? 0.72 : 1,
                }}
              >
                {/* City + status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{flag}</span>
                    <span className="font-bold text-base" style={{ color: "var(--teal)" }}>
                      {hostel.city}
                    </span>
                  </div>
                  <span
                    className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={
                      isActive
                        ? { background: "#DCFCE7", color: "#16A34A" }
                        : isPast
                        ? { background: "#F3F4F6", color: "#6B7280" }
                        : { background: "var(--cream-dark)", color: "var(--muted)" }
                    }
                  >
                    {isActive ? "Staying here ✓" : isPast ? "Done" : hostel.status}
                  </span>
                </div>

                {/* Hostel name */}
                <div className="flex items-start gap-2 mb-3">
                  <Hotel size={15} className="mt-0.5 shrink-0" style={{ color: "var(--coral)" }} />
                  <p className="font-semibold text-sm leading-snug">{hostel.name}</p>
                </div>

                {/* Dates + nights */}
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
                  <Calendar size={13} className="shrink-0" />
                  <span>
                    {formatDate(hostel.checkIn)} → {formatDate(hostel.checkOut)}
                    {" "}· <strong style={{ color: "var(--foreground)" }}>{hostel.nights} night{hostel.nights !== 1 ? "s" : ""}</strong>
                  </span>
                </div>

                {/* Booking link */}
                {hostel.bookingLink && (
                  <div className="mt-3">
                    <Link
                      href={hostel.bookingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium"
                      style={{ color: "var(--teal)" }}
                    >
                      View booking <ExternalLink size={11} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
