import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/ui/NavBar";

export const metadata: Metadata = {
  title: "Yash's SEA Trip 🌏",
  description: "Follow Yash on his 29-day Southeast Asia backpacking adventure",
  openGraph: {
    title: "Yash's SEA Trip",
    description: "29 days across Taiwan, Vietnam, Malaysia & Singapore",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: "var(--background)" }}>
        <NavBar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
