"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5"
          style={{ background: "var(--teal)", color: "#fff" }}
        >
          🌏
        </div>
      )}

      <div className={cn("max-w-[80%] space-y-1.5", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "rounded-br-sm"
              : "rounded-bl-sm"
          )}
          style={
            isUser
              ? { background: "var(--teal)", color: "#fff" }
              : { background: "var(--cream-dark)", color: "var(--foreground)" }
          }
        >
          {message.content || (
            <span style={{ opacity: 0.5 }}>...</span>
          )}
        </div>

        {/* Citation chips */}
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {message.citations.map((c) => (
              <span
                key={c}
                className="text-xs px-2 py-0.5 rounded-full border font-medium"
                style={{
                  background: "var(--cream)",
                  borderColor: "var(--teal-light)",
                  color: "var(--teal-dark)",
                }}
              >
                📄 From {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 font-semibold"
          style={{ background: "var(--coral)", color: "#fff" }}
        >
          👤
        </div>
      )}
    </motion.div>
  );
}
