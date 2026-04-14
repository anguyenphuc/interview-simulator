import { NextRequest, NextResponse } from "next/server";
import { getClient, MODELS } from "@/lib/anthropic";
import { systemPromptForEvaluation, FEEDBACK_TOOL } from "@/lib/prompts";
import type { Feedback, Question } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  question: Question;
  answer: { kind: "free"; text: string } | { kind: "mcq"; choiceIndex: number };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    if (!body?.question || !body?.answer) {
      return NextResponse.json({ error: "Missing question or answer" }, { status: 400 });
    }

    const client = getClient();

    const answerDescription =
      body.answer.kind === "free"
        ? `The candidate gave a free-form answer:\n"""${body.answer.text.slice(0, 8000)}"""`
        : `The candidate selected multiple-choice option ${body.answer.choiceIndex} of 4:\n"${body.question.choices?.[body.answer.choiceIndex] ?? ""}"\n\nAll options were:\n${(body.question.choices ?? [])
            .map((c, i) => `${i}. ${c}`)
            .join("\n")}\n\nThe rubric-best option was index ${body.question.bestChoiceIndex}.`;

    const userText = [
      `Question category: ${body.question.category} (${body.question.difficulty})`,
      body.question.context ? `Scenario: ${body.question.context}` : "",
      `Question: ${body.question.prompt}`,
      "",
      "Rubric the question should cover:",
      body.question.rubric.map((r, i) => `${i + 1}. ${r}`).join("\n"),
      "",
      answerDescription,
      "",
      body.question.category === "behavioral"
        ? "This is a behavioral question — include the starBreakdown field."
        : "Omit starBreakdown (this is not a behavioral question).",
    ]
      .filter(Boolean)
      .join("\n");

    const msg = await client.messages.create({
      model: MODELS.evaluate,
      max_tokens: 1600,
      system: [
        { type: "text", text: systemPromptForEvaluation(), cache_control: { type: "ephemeral" } },
      ],
      tools: [FEEDBACK_TOOL],
      tool_choice: { type: "tool", name: FEEDBACK_TOOL.name },
      messages: [{ role: "user", content: userText }],
    });

    const toolUse = msg.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "Model did not return feedback." }, { status: 502 });
    }

    const feedback = toolUse.input as Feedback;
    return NextResponse.json({ feedback });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
