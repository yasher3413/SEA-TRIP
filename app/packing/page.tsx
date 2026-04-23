"use client";

import packingData from "@/data/packing.json";
import { useState, useEffect } from "react";
import type { PackingData } from "@/lib/types";
import { Shirt, Droplets, Heart, Cpu } from "lucide-react";

const data = packingData as PackingData;

const SECTIONS: { key: keyof PackingData; label: string; emoji: string; icon: React.ReactNode }[] = [
  { key: "clothing", label: "Clothing", emoji: "👕", icon: <Shirt size={16} /> },
  { key: "toiletries", label: "Toiletries", emoji: "🧴", icon: <Droplets size={16} /> },
  { key: "health", label: "Health & Docs", emoji: "💊", icon: <Heart size={16} /> },
  { key: "tech", label: "Tech & Gear", emoji: "🔌", icon: <Cpu size={16} /> },
];

export default function PackingPage() {
  // Checked state persisted to localStorage
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem("packing-checked");
      if (stored) setChecked(JSON.parse(stored));
    } catch {}
  }, []);

  function toggle(item: string) {
    const updated = { ...checked, [item]: !checked[item] };
    setChecked(updated);
    try { localStorage.setItem("packing-checked", JSON.stringify(updated)); } catch {}
  }

  const allItems = Object.values(data).flat();
  const checkedCount = allItems.filter((i) => checked[i]).length;

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-accent)", color: "var(--teal)" }}
            >
              🎒 Packing List
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Your progress is saved in your browser
            </p>
          </div>
          {/* Progress */}
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold" style={{ color: "var(--teal)" }}>
              {checkedCount}/{allItems.length}
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>packed</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full mb-6 overflow-hidden" style={{ background: "var(--cream-dark)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${(checkedCount / allItems.length) * 100}%`,
              background: "var(--teal)",
            }}
          />
        </div>

        <div className="space-y-6">
          {SECTIONS.map((section) => {
            const items = data[section.key];
            const sectionChecked = items.filter((i) => checked[i]).length;

            return (
              <div key={section.key}>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ color: "var(--teal)" }}>{section.icon}</span>
                  <h2 className="font-bold text-lg">{section.emoji} {section.label}</h2>
                  <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>
                    {sectionChecked}/{items.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {items.map((item) => (
                    <button
                      key={item}
                      onClick={() => toggle(item)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                      style={{
                        background: checked[item] ? "var(--cream-dark)" : "var(--card)",
                        borderColor: checked[item] ? "var(--teal-light)" : "var(--border)",
                      }}
                    >
                      <span
                        className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 text-xs transition-colors"
                        style={{
                          borderColor: checked[item] ? "var(--teal)" : "var(--border)",
                          background: checked[item] ? "var(--teal)" : "transparent",
                          color: "#fff",
                        }}
                      >
                        {checked[item] ? "✓" : ""}
                      </span>
                      <span
                        className="text-sm"
                        style={{
                          textDecoration: checked[item] ? "line-through" : "none",
                          color: checked[item] ? "var(--muted)" : "var(--foreground)",
                        }}
                      >
                        {item}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setChecked({});
            try { localStorage.removeItem("packing-checked"); } catch {}
          }}
          className="mt-8 text-xs underline"
          style={{ color: "var(--muted)" }}
        >
          Reset all checkboxes
        </button>
      </div>
    </div>
  );
}
