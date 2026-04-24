import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--background)" }}
    >
      <p className="text-6xl mb-4">🗺️</p>
      <h1
        className="text-4xl font-bold mb-2"
        style={{ fontFamily: "var(--font-accent)", color: "var(--teal)" }}
      >
        Lost on the trail
      </h1>
      <p className="text-base mb-8" style={{ color: "var(--muted)" }}>
        That page doesn&apos;t exist — maybe Yash hasn&apos;t been there yet.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
        style={{ background: "var(--teal)" }}
      >
        Back to home
      </Link>
    </div>
  );
}
