"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button, Card, Spinner } from "@/components/ui";
import { session } from "@/lib/session";
import type { Category, Difficulty } from "@/lib/types";

const CATEGORIES: { value: Category; label: string; desc: string }[] = [
  { value: "behavioral", label: "Behavioral", desc: "STAR — leadership, conflict, impact" },
  { value: "case", label: "Case", desc: "Open-ended business reasoning" },
  { value: "situational", label: "Situational", desc: "Judgment calls under constraints" },
];

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export default function Setup() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("behavioral");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [jdMode, setJdMode] = useState<"none" | "text" | "url">("none");
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setError(null);
    let jobDescription: string | undefined;

    if (jdMode === "text" && jdText.trim()) {
      jobDescription = jdText.trim();
    } else if (jdMode === "url" && jdUrl.trim()) {
      setFetching(true);
      try {
        const res = await fetch("/api/fetch-jd", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: jdUrl.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch URL");
        jobDescription = data.text as string;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch URL");
        setFetching(false);
        return;
      } finally {
        setFetching(false);
      }
    }

    session.setConfig({ category, difficulty, jobDescription });
    session.clearQA();
    router.push("/interview/session");
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Back
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Set up your interview</h1>

        <Card className="mt-8 p-6">
          <Label>Question type</Label>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`text-left rounded-xl border p-4 transition ${
                  category === c.value
                    ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="font-medium text-slate-900">{c.label}</div>
                <div className="mt-1 text-sm text-slate-600">{c.desc}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="mt-5 p-6">
          <Label>Difficulty</Label>
          <div className="mt-3 flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`capitalize rounded-lg px-4 py-2 text-sm font-medium transition ${
                  difficulty === d
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </Card>

        <Card className="mt-5 p-6">
          <Label>Job description (optional)</Label>
          <p className="mt-1 text-sm text-slate-500">Tailor questions to a specific role.</p>
          <div className="mt-4 flex gap-2 border-b border-slate-200">
            {(["none", "text", "url"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setJdMode(m)}
                className={`px-3 py-2 text-sm font-medium -mb-px border-b-2 transition ${
                  jdMode === m
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {m === "none" ? "None" : m === "text" ? "Paste text" : "Paste URL"}
              </button>
            ))}
          </div>
          {jdMode === "text" && (
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the job description text here…"
              rows={8}
              className="mt-4 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          )}
          {jdMode === "url" && (
            <input
              type="url"
              value={jdUrl}
              onChange={(e) => setJdUrl(e.target.value)}
              placeholder="https://example.com/careers/director-of-operations"
              className="mt-4 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          )}
        </Card>

        {error && (
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Button onClick={start} disabled={fetching}>
            {fetching ? <><Spinner /> Fetching JD…</> : "Start interview →"}
          </Button>
        </div>
      </div>
    </main>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold text-slate-900">{children}</div>;
}
