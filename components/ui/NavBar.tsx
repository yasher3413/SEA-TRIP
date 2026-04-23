"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Chat", emoji: "💬" },
  { href: "/map", label: "Map", emoji: "🗺️" },
  { href: "/itinerary", label: "Itinerary", emoji: "📅" },
  { href: "/flights", label: "Flights", emoji: "✈️" },
  { href: "/hostels", label: "Hostels", emoji: "🏨" },
  { href: "/expenses", label: "Expenses", emoji: "💰" },
  { href: "/packing", label: "Packing", emoji: "🎒" },
  { href: "/tips", label: "Tips", emoji: "📋" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: "color-mix(in srgb, var(--background) 92%, transparent)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-base shrink-0"
          style={{ color: "var(--teal)" }}
        >
          <Globe size={20} />
          <span className="hidden sm:inline" style={{ fontFamily: "var(--font-accent)" }}>
            Yash&apos;s SEA Trip
          </span>
          <span className="sm:hidden" style={{ fontFamily: "var(--font-accent)" }}>SEA Trip</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-xl text-sm font-medium transition-colors",
                pathname === link.href ? "text-white" : "hover:bg-black/5"
              )}
              style={
                pathname === link.href
                  ? { background: "var(--teal)", color: "#fff" }
                  : { color: "var(--foreground)" }
              }
            >
              {link.emoji} {link.label}
            </Link>
          ))}
        </div>

        {/* Right side: theme toggle + mobile hamburger */}
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{ background: "var(--cream)", borderColor: "var(--border)" }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                pathname === link.href ? "text-white" : ""
              )}
              style={
                pathname === link.href
                  ? { background: "var(--teal)", color: "#fff" }
                  : { color: "var(--foreground)" }
              }
            >
              {link.emoji} {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
