import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function Landing() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 pt-20 pb-16">
        <div className="flex items-center gap-2 text-sm font-medium text-brand-700">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-500" />
          Interview Simulator
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-slate-900">
          Practice interviews tailored to <span className="text-brand-700">food &amp; ag-tech</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
          Behavioral, case, and situational questions personalized to your background — MBA-level
          operator, 7+ years scaling physical food products, mission &amp; climate focused. Paste a
          job description to sharpen against a specific role.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/interview/setup">
            <Button>Start an interview →</Button>
          </Link>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          <FeatureCard
            title="Behavioral"
            body="STAR-framework prompts on leadership, influence, and ambiguity — graded on specifics, ownership, and quantified results."
          />
          <FeatureCard
            title="Case"
            body="Open-ended business cases on GTM, unit economics, supply chain, and CPG launch tradeoffs."
          />
          <FeatureCard
            title="Situational"
            body="Realistic operating dilemmas where you decide, justify, and navigate stakeholder friction."
          />
        </div>

        <div className="mt-16 text-sm text-slate-500">
          Powered by Claude. Your API key is read server-side from <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">ANTHROPIC_API_KEY</code>.
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <Card className="p-6">
      <div className="text-sm font-semibold uppercase tracking-wide text-brand-700">{title}</div>
      <p className="mt-3 text-slate-600 leading-relaxed">{body}</p>
    </Card>
  );
}
