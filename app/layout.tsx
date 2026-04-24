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

// Runs synchronously before React hydrates — sets data-theme from localStorage
// (or system preference) so there's no flash of the wrong theme on load.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light')}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen" style={{ background: "var(--background)" }}>
        <NavBar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
