"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import SuggestedPrompts from "./SuggestedPrompts";

const INITIAL_SUGGESTIONS = [
  "Where is Yash today?",
  "How much has he spent so far?",
  "What's the next flight?",
  "Is Ha Giang safe to visit?",
];

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isToolCalling, setIsToolCalling] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Accumulate streamed text between rAF flushes to avoid per-chunk re-renders
  const pendingTextRef = useRef("");
  const rafRef = useRef<number | null>(null);
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Flush pending text to state at display framerate
  const scheduleFlush = useCallback((msgId: string) => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const text = pendingTextRef.current;
      if (!text) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, content: m.content + text } : m
        )
      );
      pendingTextRef.current = "";
    });
  }, []);

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    activeIdRef.current = assistantMsg.id;
    pendingTextRef.current = "";
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, assistantMsg]);
    setInput("");
    setIsStreaming(true);
    setIsToolCalling(false);

    const apiHistory = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Track total accumulated text for citation parsing at done
    let totalAccumulated = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiHistory }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "tool_call") {
              // Flush any pending text before showing the tool-call indicator
              if (pendingTextRef.current) {
                const flushed = pendingTextRef.current;
                pendingTextRef.current = "";
                totalAccumulated += flushed;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id ? { ...m, content: totalAccumulated } : m
                  )
                );
              }
              setIsToolCalling(true);
            } else if (event.type === "text") {
              setIsToolCalling(false);
              pendingTextRef.current += event.text;
              totalAccumulated += event.text;
              scheduleFlush(assistantMsg.id);
            } else if (event.type === "done") {
              // Cancel any pending rAF and do a final synchronous flush
              if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
              }
              pendingTextRef.current = "";

              // Strip citation tags and attach them as chips
              const citationRegex = /\[src:\s*([^\]]+)\]/gi;
              const citations: string[] = [];
              let match;
              while ((match = citationRegex.exec(totalAccumulated)) !== null) {
                citations.push(match[1].trim());
              }
              const cleanContent = totalAccumulated.replace(citationRegex, "").trim();

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? { ...m, content: cleanContent, citations: [...new Set(citations)] }
                    : m
                )
              );
            } else if (event.type === "error") {
              if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
              }
              pendingTextRef.current = "";
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id ? { ...m, content: event.message } : m
                )
              );
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch (err) {
      console.error(err);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pendingTextRef.current = "";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: "Sorry, something went wrong. Please try again." }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      setIsToolCalling(false);
      activeIdRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // Show typing indicator only while waiting for the first token (content still empty)
  const lastMsg = messages[messages.length - 1];
  const showTyping = isStreaming && lastMsg?.content === "";

  return (
    <div
      className="flex flex-col h-[600px] md:h-[660px] rounded-3xl overflow-hidden shadow-lg border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <SuggestedPrompts
            suggestions={INITIAL_SUGGESTIONS}
            onSelect={(s) => sendMessage(s)}
          />
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {showTyping && <TypingIndicator isSearching={isToolCalling} />}

        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <div
          className="flex items-end gap-2 rounded-2xl px-3 py-2 border"
          style={{ background: "var(--cream)", borderColor: "var(--border)" }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about Yash's trip…"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-gray-400 max-h-32"
            style={{ color: "var(--foreground)" }}
            disabled={isStreaming}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40"
            style={{ background: "var(--teal)", color: "#fff" }}
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-xs mt-1.5 text-center" style={{ color: "var(--muted)" }}>
          Powered by Claude · Trip data updated live
        </p>
      </div>
    </div>
  );
}
