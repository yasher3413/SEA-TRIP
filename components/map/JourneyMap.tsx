"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_COORDS } from "@/lib/cities";
import { getCountryColor } from "@/lib/trip";
import type { CityCoord } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

// Animate the map fitting bounds on load
function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 1) {
      map.fitBounds(coords, { padding: [40, 40] });
    }
  }, [map, coords]);
  return null;
}

function makeIcon(flag: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:15px">${flag}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

interface Props {
  onSelectCity?: (city: CityCoord | null) => void;
  selectedCity?: CityCoord | null;
}

export default function JourneyMap({ onSelectCity, selectedCity }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const coords: [number, number][] = CITY_COORDS.map((c) => [c.lat, c.lng]);

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

      <FitBounds coords={coords} />

      {/* Route polyline */}
      <Polyline
        positions={coords}
        pathOptions={{
          color: "#0F766E",
          weight: 2.5,
          opacity: 0.7,
          dashArray: "6 4",
        }}
      />

      {/* City markers */}
      {CITY_COORDS.map((city) => {
        const color = getCountryColor(city.country);
        const icon = makeIcon(city.flag, color);
        return (
          <Marker
            key={`${city.name}-${city.day}`}
            position={[city.lat, city.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onSelectCity?.(city),
            }}
          >
            <Popup>
              <div className="text-sm font-medium">{city.flag} {city.name}</div>
              <div className="text-xs" style={{ color: "#666" }}>Day {city.day} · {city.country}</div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
