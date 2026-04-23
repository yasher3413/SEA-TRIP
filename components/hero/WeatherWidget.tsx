import { CITY_COORDS } from "@/lib/cities";
import { getCurrentDayInfo, getCityForDate } from "@/lib/trip";
import { Cloud } from "lucide-react";

// Map Open-Meteo WMO weather codes to emoji + label
function decodeWeather(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: "☀️", label: "Clear" };
  if (code <= 2) return { emoji: "🌤️", label: "Partly cloudy" };
  if (code === 3) return { emoji: "☁️", label: "Overcast" };
  if (code <= 48) return { emoji: "🌫️", label: "Foggy" };
  if (code <= 55) return { emoji: "🌦️", label: "Drizzle" };
  if (code <= 65) return { emoji: "🌧️", label: "Rain" };
  if (code <= 77) return { emoji: "❄️", label: "Snow" };
  if (code <= 82) return { emoji: "🌧️", label: "Showers" };
  if (code <= 99) return { emoji: "⛈️", label: "Thunderstorm" };
  return { emoji: "🌡️", label: "Unknown" };
}

interface WeatherData {
  temp: number;
  emoji: string;
  label: string;
  city: string;
}

async function fetchWeather(cityName: string): Promise<WeatherData | null> {
  const coords = CITY_COORDS.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase() ||
           cityName.toLowerCase().includes(c.name.toLowerCase())
  );
  if (!coords) return null;

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${coords.lat}&longitude=${coords.lng}` +
      `&current=temperature_2m,weather_code` +
      `&timezone=auto`;

    const res = await fetch(url, { next: { revalidate: 1800 } }); // 30-min cache
    if (!res.ok) return null;

    const json = await res.json();
    const temp = Math.round(json.current?.temperature_2m ?? 0);
    const code = json.current?.weather_code ?? 0;
    const { emoji, label } = decodeWeather(code);
    return { temp, emoji, label, city: coords.name };
  } catch {
    return null;
  }
}

export default async function WeatherWidget() {
  const dayInfo = getCurrentDayInfo();
  if (dayInfo.status !== "during") return null;

  const todayISO = new Date().toISOString().split("T")[0];
  const city = getCityForDate(todayISO);
  const weather = await fetchWeather(city);

  if (!weather) return null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border w-fit"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <span className="text-base">{weather.emoji}</span>
      <span className="font-medium">{weather.temp}°C</span>
      <span style={{ color: "var(--muted)" }}>{weather.label} in {weather.city}</span>
    </div>
  );
}
