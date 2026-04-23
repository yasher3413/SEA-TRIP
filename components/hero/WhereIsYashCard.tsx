import { getCurrentDayInfo, getCityForDate, getNextFlight, getTodayHostel, getCountryFlag, META } from "@/lib/trip";
import { formatDate } from "@/lib/utils";
import { MapPin, Plane, Hotel, Clock } from "lucide-react";

export default function WhereIsYashCard() {
  const todayISO = new Date().toISOString().split("T")[0];
  const dayInfo = getCurrentDayInfo();
  const nextFlight = getNextFlight();
  const hostel = getTodayHostel(todayISO);

  // ── Trip hasn't started ──
  if (dayInfo.status === "before") {
    return (
      <div
        className="rounded-3xl p-5 border text-center"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <p className="text-3xl mb-2">🎒</p>
        <p className="font-semibold text-lg" style={{ color: "var(--teal)" }}>
          Trip starts in {dayInfo.daysUntil} day{dayInfo.daysUntil !== 1 ? "s" : ""}
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Departure: {formatDate(META.startDate)} from Toronto
        </p>
      </div>
    );
  }

  // ── Trip is over ──
  if (dayInfo.status === "after") {
    return (
      <div
        className="rounded-3xl p-5 border text-center"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <p className="text-3xl mb-2">✅</p>
        <p className="font-semibold text-lg" style={{ color: "var(--teal)" }}>
          Yash is home!
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          The 29-day trip wrapped up on {formatDate(META.endDate)}
        </p>
      </div>
    );
  }

  // ── During trip ──
  const { dayEntry, dayNum } = dayInfo;
  const city = getCityForDate(todayISO);
  const flag = dayEntry ? getCountryFlag(dayEntry.country) : "🌏";

  return (
    <div
      className="rounded-3xl p-5 border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "var(--muted)" }}>
            Live Status · Day {dayNum} of {META.totalDays}
          </p>
          <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
            Yash is in {city} {flag}
          </p>
        </div>
        <div
          className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: "var(--teal)", color: "#fff" }}
        >
          {formatDate(todayISO)}
        </div>
      </div>

      {/* Detail rows */}
      <div className="space-y-2.5">
        {dayEntry?.activity && (
          <div className="flex items-start gap-2.5 text-sm">
            <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: "var(--teal)" }} />
            <span style={{ color: "var(--foreground)" }}>{dayEntry.activity}</span>
          </div>
        )}

        {hostel && (
          <div className="flex items-center gap-2.5 text-sm">
            <Hotel size={15} className="shrink-0" style={{ color: "var(--coral)" }} />
            <span style={{ color: "var(--foreground)" }}>
              Tonight: <span className="font-medium">{hostel.name}</span>
            </span>
          </div>
        )}

        {nextFlight && (
          <div className="flex items-center gap-2.5 text-sm">
            <Plane size={15} className="shrink-0" style={{ color: "var(--teal-light)" }} />
            <span style={{ color: "var(--foreground)" }}>
              Next flight:{" "}
              <span className="font-medium">{nextFlight.flight.route}</span>{" "}
              {nextFlight.daysAway === 0 ? (
                <span className="font-semibold" style={{ color: "var(--coral)" }}>TODAY</span>
              ) : (
                <span style={{ color: "var(--muted)" }}>in {nextFlight.daysAway} day{nextFlight.daysAway !== 1 ? "s" : ""}</span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1" style={{ color: "var(--muted)" }}>
          <span>Trip progress</span>
          <span>{Math.round(((dayNum ?? 1) / META.totalDays) * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--cream-dark)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.round(((dayNum ?? 1) / META.totalDays) * 100)}%`,
              background: "var(--teal)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
