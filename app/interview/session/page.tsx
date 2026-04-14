"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card, Badge, Spinner } from "@/components/ui";
import { session } from "@/lib/session";
import type { Question, SessionConfig } from "@/lib/types";

export default function Session() {
  const router = useRouter();
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [mode, setMode] = useState<"free" | "mcq">("free");
  const [text, setText] = useState("");
  const [choiceIndex, setChoiceIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const c = session.getConfig();
    if (!c) {
      router.replace("/interview/setup");
      return;
    }
    setConfig(c);

    const existing = session.getQuestion();
    if (existing) {
      setQuestion(existing);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/generate-question", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(c),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to generate question");
        setQuestion(data.question);
        session.setQuestion(data.question);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to generate question");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function submit() {
    if (!question) return;
    setSubmitting(true);
    setError(null);
    const answer =
      mode === "free"
        ? { kind: "free" as const, text: text.trim() }
        : { kind: "mcq" as const, choiceIndex: choiceIndex ?? 0 };
    session.setAnswer(answer);
    try {
      const res = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate");
      session.setFeedback(data.feedback);
      router.push("/interview/feedback");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to evaluate");
      setSubmitting(false);
    }
  }

  const canSubmit =
    mode === "free" ? text.trim().length >= 20 : choiceIndex !== null;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/interview/setup" className="text-sm text-slate-500 hover:text-slate-900">
          ← New setup
        </Link>

        {loading && (
          <Card className="mt-6 p-10 text-center">
            <Spinner />
            <div className="mt-3 text-slate-600">Generating a tailored question…</div>
          </Card>
        )}

        {error && !loading && (
          <Card className="mt-6 p-6 border-rose-200 bg-rose-50">
            <div className="text-rose-800">{error}</div>
          </Card>
        )}

        {!loading && question && config && (
          <>
            <div className="mt-4 flex items-center gap-2">
              <Badge tone="brand">{config.category}</Badge>
              <Badge tone="slate">{config.difficulty}</Badge>
              {config.jobDescription && <Badge tone="amber">Role-tailored</Badge>}
            </div>

            <Card className="mt-5 p-7">
              {question.context && (
                <div className="mb-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed">
                  {question.context}
                </div>
              )}
              <div className="text-xl font-medium leading-relaxed text-slate-900">
                {question.prompt}
              </div>
            </Card>

            <div className="mt-6 flex gap-2 border-b border-slate-200">
              {(["free", "mcq"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition ${
                    mode === m
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {m === "free" ? "Write answer" : "Multiple choice"}
                </button>
              ))}
            </div>

            {mode === "free" && (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Take your time. For behavioral answers, walk through Situation → Task → Action → Result."
                rows={12}
                className="mt-5 w-full rounded-lg border border-slate-200 p-4 text-sm leading-relaxed focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            )}

            {mode === "mcq" && (
              <div className="mt-5 space-y-3">
                {(question.choices ?? []).map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setChoiceIndex(i)}
                    className={`block w-full text-left rounded-xl border p-4 transition ${
                      choiceIndex === i
                        ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          choiceIndex === i ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div className="text-sm leading-relaxed text-slate-800">{c}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button onClick={submit} disabled={!canSubmit || submitting}>
                {submitting ? <><Spinner /> Evaluating…</> : "Submit for feedback →"}
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
