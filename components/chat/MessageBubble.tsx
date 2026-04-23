"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

      <div className={cn("max-w-[82%] space-y-1.5", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
            isUser ? "rounded-br-sm" : "rounded-bl-sm"
          )}
          style={
            isUser
              ? { background: "var(--teal)", color: "#fff" }
              : { background: "var(--cream-dark)", color: "var(--foreground)" }
          }
        >
          {message.content ? (
            <div className={cn("prose-sm max-w-none", isUser ? "prose-invert" : "")}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Tables — full-width, clean borders
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2 rounded-lg border" style={{ borderColor: isUser ? "rgba(255,255,255,0.2)" : "var(--border)" }}>
                      <table className="w-full text-xs border-collapse">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead style={{ background: isUser ? "rgba(255,255,255,0.15)" : "var(--cream)" }}>
                      {children}
                    </thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-3 py-1.5 text-left font-semibold border-b" style={{ borderColor: isUser ? "rgba(255,255,255,0.2)" : "var(--border)" }}>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-1.5 border-b last:border-b-0" style={{ borderColor: isUser ? "rgba(255,255,255,0.1)" : "var(--border)" }}>
                      {children}
                    </td>
                  ),
                  tr: ({ children }) => (
                    <tr className="even:bg-black/5">{children}</tr>
                  ),
                  // Bold
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  // Inline code
                  code: ({ children }) => (
                    <code
                      className="px-1 py-0.5 rounded text-xs font-mono"
                      style={{ background: isUser ? "rgba(255,255,255,0.2)" : "var(--border)" }}
                    >
                      {children}
                    </code>
                  ),
                  // Paragraphs — no extra margin on first/last
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                  // Lists
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm">{children}</li>
                  ),
                  // Horizontal rule — render as a thin divider, not "---"
                  hr: () => (
                    <hr className="my-2 border-t opacity-20" />
                  ),
                  // Headings
                  h1: ({ children }) => <p className="font-bold text-base mb-1">{children}</p>,
                  h2: ({ children }) => <p className="font-bold mb-1">{children}</p>,
                  h3: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <span style={{ opacity: 0.4 }}>…</span>
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
