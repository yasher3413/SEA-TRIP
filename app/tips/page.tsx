import quickref from "@/data/quickref.json";
import { Train, DollarSign, Smartphone, FileText } from "lucide-react";

export default function TipsPage() {
  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-accent)", color: "var(--teal)" }}
          >
            📋 Tips & Logistics
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Quick reference for navigating the trip
          </p>
        </div>

        <div className="space-y-6">
          {/* Getting around */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Train size={18} style={{ color: "var(--teal)" }} />
              <h2 className="font-bold text-lg">Getting Around</h2>
            </div>
            <div className="space-y-2">
              {quickref.gettingAround.map((item) => (
                <div
                  key={item.where}
                  className="flex gap-3 p-3 rounded-xl border"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <span className="font-semibold text-sm shrink-0" style={{ color: "var(--teal)" }}>
                    {item.where}
                  </span>
                  <span className="text-sm" style={{ color: "var(--foreground)" }}>
                    {item.tip}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Money */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={18} style={{ color: "var(--coral)" }} />
              <h2 className="font-bold text-lg">Money & Budgeting</h2>
            </div>
            <div className="space-y-2">
              {quickref.money.map((item) => (
                <div
                  key={item.country}
                  className="flex gap-3 p-3 rounded-xl border"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <span className="font-semibold text-sm shrink-0" style={{ color: "var(--coral)" }}>
                    {item.country}
                  </span>
                  <span className="text-sm">{item.tip}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Apps */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone size={18} style={{ color: "var(--teal)" }} />
              <h2 className="font-bold text-lg">Essential Apps</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickref.apps.map((app) => (
                <div
                  key={app}
                  className="flex items-center gap-2 p-3 rounded-xl border"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <span className="text-sm font-medium">📱 {app}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Docs */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} style={{ color: "var(--coral)" }} />
              <h2 className="font-bold text-lg">Documents & Admin</h2>
            </div>
            <div className="space-y-2">
              {quickref.docs.map((doc) => (
                <div
                  key={doc}
                  className="flex items-start gap-2 p-3 rounded-xl border"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <span className="mt-0.5">✅</span>
                  <span className="text-sm">{doc}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
