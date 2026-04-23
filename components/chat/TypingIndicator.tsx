"use client";

import { motion } from "framer-motion";

interface Props {
  isSearching?: boolean;
}

export default function TypingIndicator({ isSearching }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 items-start"
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{ background: "var(--teal)", color: "#fff" }}
      >
        🌏
      </div>

      <div
        className="px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm"
        style={{ background: "var(--cream-dark)" }}
      >
        {isSearching ? (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            🔍 Searching the web…
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span
              className="typing-dot inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--teal)" }}
            />
            <span
              className="typing-dot inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--teal)" }}
            />
            <span
              className="typing-dot inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--teal)" }}
            />
          </span>
        )}
      </div>
    </motion.div>
  );
}
