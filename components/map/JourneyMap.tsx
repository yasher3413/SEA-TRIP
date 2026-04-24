"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_COORDS } from "@/lib/cities";
import { getCountryColor } from "@/lib/trip";
import type { CityCoord } from "@/lib/types";

// Fit map to all route coords on first render
function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (!fitted.current && coords.length > 1) {
      map.fitBounds(coords, { padding: [40, 40] });
      fitted.current = true;
    }
  }, [map, coords]);
  return null;
}

function makeIcon(flag: string, color: string, pulse = false) {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:34px;height:34px">
        ${pulse ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.25;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>` : ""}
        <div style="position:absolute;inset:3px;background:${color};border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.22);display:flex;align-items:center;justify-content:center;font-size:14px">${flag}</div>
      </div>
      <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
}

interface Props {
  onSelectCity?: (city: CityCoord | null) => void;
  todayCity?: string;
}

const ALL_COORDS: [number, number][] = CITY_COORDS.map((c) => [c.lat, c.lng]);
// How many ms between each new segment appearing
const DRAW_INTERVAL_MS = 120;

export default function JourneyMap({ onSelectCity, todayCity }: Props) {
  const [mounted, setMounted] = useState(false);
  // Start at 2 so the first segment (Toronto→Taipei) is visible immediately
  const [visibleCount, setVisibleCount] = useState(2);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate the route line by incrementally revealing coordinates
  useEffect(() => {
    if (!mounted) return;
    if (visibleCount >= ALL_COORDS.length) return;

    const timer = setInterval(() => {
      setVisibleCount((n) => {
        if (n >= ALL_COORDS.length) {
          clearInterval(timer);
          return n;
        }
        return n + 1;
      });
    }, DRAW_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [mounted, visibleCount]);

  if (!mounted) {
    return (
      <div
        className="w-full h-full rounded-2xl flex items-center justify-center"
        style={{ background: "var(--cream-dark)", minHeight: 400 }}
      >
        <p style={{ color: "var(--muted)" }}>Loading map…</p>
      </div>
    );
  }

  const visibleCoords = ALL_COORDS.slice(0, visibleCount);

  return (
    <MapContainer
      center={[15, 108]}
      zoom={4}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds coords={ALL_COORDS} />

      {/* Animated route — dashed teal line that draws in segment by segment */}
      {visibleCoords.length > 1 && (
        <Polyline
          positions={visibleCoords}
          pathOptions={{
            color: "#0F766E",
            weight: 2.5,
            opacity: 0.75,
            dashArray: "7 4",
          }}
        />
      )}

      {/* City pins — only show cities whose coords are already revealed */}
      {CITY_COORDS.map((city, idx) => {
        if (idx >= visibleCount) return null;
        const color = getCountryColor(city.country);
        const isToday = todayCity
          ? city.name.toLowerCase() === todayCity.toLowerCase() ||
            todayCity.toLowerCase().includes(city.name.toLowerCase())
          : false;
        const icon = makeIcon(city.flag, color, isToday);

        return (
          <Marker
            key={`${city.name}-${city.day}`}
            position={[city.lat, city.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelectCity?.(city) }}
          >
            <Popup>
              <div className="text-sm font-medium">{city.flag} {city.name}</div>
              <div className="text-xs" style={{ color: "#666" }}>
                Day {city.day} · {city.country}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
