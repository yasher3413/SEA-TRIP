"use client";

import { motion } from "framer-motion";

interface Props {
  suggestions: string[];
  onSelect: (s: string) => void;
}

export default function SuggestedPrompts({ suggestions, onSelect }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col items-center gap-4 py-6"
    >
      <div className="text-center">
        <p className="text-2xl mb-1">🌏</p>
        <p className="font-semibold text-base" style={{ color: "var(--teal)" }}>
          Ask anything about Yash&apos;s trip
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Where he is, what he&apos;s doing, flights, expenses — all in one place.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className="text-sm px-3 py-1.5 rounded-full border font-medium transition-colors hover:text-white"
            style={{
              borderColor: "var(--teal)",
              color: "var(--teal)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--teal)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--teal)";
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
