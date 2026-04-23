"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2, Save } from "lucide-react";
import expensesData from "@/data/expenses.json";
import type { ExpensesData, Expense, ExpenseCategory } from "@/lib/types";

const CATEGORIES: ExpenseCategory[] = ["Flight", "Accommodation", "Food", "Transport", "Activity", "Other"];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      setLoginError("Wrong password");
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
        <div
          className="w-full max-w-sm rounded-3xl p-8 border shadow-lg"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <p className="text-2xl text-center mb-1" style={{ fontFamily: "var(--font-accent)", color: "var(--teal)" }}>
            🔐 Admin
          </p>
          <p className="text-sm text-center mb-6" style={{ color: "var(--muted)" }}>
            Trip data editor
          </p>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ background: "var(--cream)", borderColor: "var(--border)" }}
              autoFocus
            />
            {loginError && <p className="text-xs text-red-500">{loginError}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--teal)" }}
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-accent)", color: "var(--teal)" }}
          >
            🔐 Admin Panel
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Upload receipts or edit trip data. Changes commit to GitHub → Vercel redeploys (~60s).
          </p>
        </div>

        <ReceiptUploader />
        <DataEditor />
      </div>
    </div>
  );
}

// ── Receipt Uploader ─────────────────────────────────────────────────────────

function ReceiptUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<Partial<Expense> | null>(null);
  const [form, setForm] = useState<Partial<Expense> & { amountLocal?: number }>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setError("");
    setSaved(false);
    setExtracted(null);

    // Preview
    const url = URL.createObjectURL(f);
    setPreview(url);

    // OCR
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append("receipt", f);
      const res = await fetch("/api/receipt", { method: "POST", body: fd });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      const e = json.extracted;
      const initial: Partial<Expense> & { amountLocal?: number } = {
        date: e.date ?? new Date().toISOString().split("T")[0],
        description: e.description ?? "",
        category: e.category ?? "Other",
        currency: e.currency ?? "CAD",
        amountLocal: e.amount ?? 0,
        amountCAD: e.currency === "CAD" ? e.amount : 0,
      };
      setExtracted(initial);
      setForm(initial);
    } catch (err) {
      setError(String(err));
    } finally {
      setExtracting(false);
    }
  }, []);

  async function saveExpense() {
    if (!form.description || !form.date) return;
    setSaving(true);
    setError("");

    try {
      // Load current expenses, append new entry
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: "expenses.json",
          content: {
            ...expensesData,
            log: [
              ...expensesData.log,
              {
                date: form.date,
                description: form.description,
                category: form.category ?? "Other",
                currency: form.currency ?? "CAD",
                amountLocal: form.amountLocal ?? 0,
                amountCAD: form.amountCAD ?? 0,
              },
            ],
          },
          message: `expense: add "${form.description}" on ${form.date}`,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      setSaved(true);
      setFile(null);
      setPreview(null);
      setExtracted(null);
      setForm({});
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="rounded-2xl p-5 border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <h2 className="font-bold text-lg mb-4">📸 Upload Receipt</h2>

      {/* Drop zone */}
      <div
        ref={dropRef}
        className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors hover:border-teal-500"
        style={{ borderColor: "var(--border)" }}
        onClick={() => document.getElementById("receipt-input")?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        <Upload size={24} className="mx-auto mb-2" style={{ color: "var(--muted)" }} />
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Drag & drop or click to upload receipt
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          JPG, PNG, HEIC, WebP
        </p>
      </div>
      <input
        id="receipt-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {extracting && (
        <div className="flex items-center gap-2 mt-4 text-sm" style={{ color: "var(--teal)" }}>
          <Loader2 size={16} className="animate-spin" /> Extracting receipt details…
        </div>
      )}

      {/* Preview + form */}
      {extracted && (
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Receipt preview" className="w-full sm:w-40 rounded-xl object-cover" style={{ maxHeight: 200 }} />
          )}
          <div className="flex-1 space-y-3">
            {[
              { label: "Date", key: "date", type: "date" },
              { label: "Description", key: "description", type: "text" },
              { label: "Amount (local)", key: "amountLocal", type: "number" },
              { label: "Currency", key: "currency", type: "text" },
              { label: "Amount (CAD)", key: "amountCAD", type: "number" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>{label}</label>
                <input
                  type={type}
                  value={(form as Record<string, unknown>)[key] as string ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [key]: type === "number" ? parseFloat(e.target.value) : e.target.value,
                    }))
                  }
                  className="w-full mt-0.5 px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ background: "var(--cream)", borderColor: "var(--border)" }}
                />
              </div>
            ))}

            {/* Category select */}
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Category</label>
              <select
                value={form.category ?? "Other"}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
                className="w-full mt-0.5 px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ background: "var(--cream)", borderColor: "var(--border)" }}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <button
              onClick={saveExpense}
              disabled={saving}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--teal)" }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "Saving…" : "Save & Commit to GitHub"}
            </button>
          </div>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
          <CheckCircle size={16} /> Saved! Vercel will redeploy in ~60 seconds.
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 mt-3 text-sm text-red-500">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}
    </section>
  );
}

// ── Data Editor ──────────────────────────────────────────────────────────────

const EDITABLE_FILES = [
  "itinerary.json",
  "flights.json",
  "hostels.json",
  "expenses.json",
  "quickref.json",
  "packing.json",
  "trip-meta.json",
] as const;

type EditableFile = typeof EDITABLE_FILES[number];

function DataEditor() {
  const [selectedFile, setSelectedFile] = useState<EditableFile>("expenses.json");
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [parseError, setParseError] = useState("");

  async function loadFile(filename: EditableFile) {
    setSelectedFile(filename);
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/load?file=${filename}`);
      const text = await res.text();
      setJsonText(text);
    } catch (err) {
      setError("Could not load file: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleTextChange(val: string) {
    setJsonText(val);
    try {
      JSON.parse(val);
      setParseError("");
    } catch (e) {
      setParseError(String(e));
    }
  }

  async function saveFile() {
    if (parseError) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile,
          content: JSON.parse(jsonText),
          message: `chore: manual edit ${selectedFile} via admin`,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaved(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="rounded-2xl p-5 border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <h2 className="font-bold text-lg mb-4">✏️ Edit Trip Data</h2>

      {/* File selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {EDITABLE_FILES.map((f) => (
          <button
            key={f}
            onClick={() => loadFile(f)}
            className="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors"
            style={{
              background: selectedFile === f ? "var(--teal)" : "var(--cream)",
              color: selectedFile === f ? "#fff" : "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      )}

      {jsonText && !loading && (
        <>
          <textarea
            value={jsonText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={16}
            className="w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none resize-y"
            style={{
              background: "var(--cream)",
              borderColor: parseError ? "#EF4444" : "var(--border)",
            }}
            spellCheck={false}
          />
          {parseError && (
            <p className="text-xs text-red-500 mt-1">{parseError}</p>
          )}

          <button
            onClick={saveFile}
            disabled={saving || !!parseError}
            className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--teal)" }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Committing…" : "Commit to GitHub"}
          </button>
        </>
      )}

      {saved && (
        <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
          <CheckCircle size={16} /> Committed! Vercel redeploy in ~60s.
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 mt-3 text-sm text-red-500">
          <AlertCircle size={16} className="mt-0.5" /> {error}
        </div>
      )}
    </section>
  );
}
