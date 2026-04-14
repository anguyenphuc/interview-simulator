"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card, Badge } from "@/components/ui";
import { session } from "@/lib/session";
import type { Feedback, Question } from "@/lib/types";

export default function FeedbackPage() {
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answer, setAnswer] = useState<ReturnType<typeof session.getAnswer>>(null);

  useEffect(() => {
    const q = session.getQuestion();
    const f = session.getFeedback();
    const a = session.getAnswer();
    if (!q || !f) {
      router.replace("/interview/setup");
      return;
    }
    setQuestion(q);
    setFeedback(f);
    setAnswer(a);
  }, [router]);

  if (!question || !feedback) return null;

  function nextQuestion() {
    session.clearQA();
    router.push("/interview/session");
  }

  const scoreTone: "brand" | "amber" | "rose" =
    feedback.overallScore >= 8 ? "brand" : feedback.overallScore >= 5 ? "amber" : "rose";

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/interview/setup" className="text-sm text-slate-500 hover:text-slate-900">
          ← New setup
        </Link>

        <div className="mt-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Feedback</h1>
          <div className="flex items-center gap-3">
            <Badge tone={scoreTone}>Score: {feedback.overallScore}/10</Badge>
          </div>
        </div>

        <Card className="mt-5 p-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Question</div>
          {question.context && (
            <div className="mt-2 text-sm text-slate-600">{question.context}</div>
          )}
          <div className="mt-2 text-slate-900 leading-relaxed">{question.prompt}</div>
        </Card>

        {answer && (
          <Card className="mt-4 p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your answer</div>
            {answer.kind === "free" ? (
              <p className="mt-2 whitespace-pre-wrap text-slate-700 leading-relaxed">{answer.text}</p>
            ) : (
              <div className="mt-2 text-slate-700">
                Selected: <span className="font-medium">{String.fromCharCode(65 + answer.choiceIndex)}.</span>{" "}
                {question.choices?.[answer.choiceIndex]}
                {question.bestChoiceIndex !== undefined && (
                  <div className="mt-2 text-sm text-slate-500">
                    Strongest option was{" "}
                    <span className="font-medium">
                      {String.fromCharCode(65 + question.bestChoiceIndex)}
                    </span>
                    .
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <div className="text-sm font-semibold text-brand-700">Strengths</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 leading-relaxed">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand-600">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-semibold text-amber-700">Areas to improve</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 leading-relaxed">
              {feedback.gaps.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-600">△</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {feedback.starBreakdown && (
          <Card className="mt-4 p-6">
            <div className="text-sm font-semibold text-slate-900">STAR breakdown</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(["situation", "task", "action", "result"] as const).map((k) => (
                <div key={k} className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {k}
                  </div>
                  <div className="mt-1 text-sm text-slate-700 leading-relaxed">
                    {feedback.starBreakdown?.[k] || (
                      <span className="text-slate-400 italic">not addressed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="mt-4 p-6">
          <div className="text-sm font-semibold text-slate-900">Model answer</div>
          <p className="mt-3 whitespace-pre-wrap text-slate-700 leading-relaxed">
            {feedback.modelAnswer}
          </p>
        </Card>

        <div className="mt-8 flex flex-wrap gap-3 justify-end">
          <Link href="/interview/setup">
            <Button variant="secondary">New setup</Button>
          </Link>
          <Button onClick={nextQuestion}>Next question →</Button>
        </div>
      </div>
    </main>
  );
}
