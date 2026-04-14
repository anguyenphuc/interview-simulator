import { NextRequest, NextResponse } from "next/server";
import { getClient, MODELS } from "@/lib/anthropic";
import {
  systemPromptForGeneration,
  QUESTION_TOOL,
} from "@/lib/prompts";
import type { Category, Difficulty, Question } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  category: Category;
  difficulty: Difficulty;
  jobDescription?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    if (!body?.category || !body?.difficulty) {
      return NextResponse.json({ error: "Missing category or difficulty" }, { status: 400 });
    }

    const client = getClient();
    const systemText = systemPromptForGeneration(body.category, body.difficulty);

    const userText =
      `Generate ONE ${body.difficulty} ${body.category} interview question for this candidate.` +
      (body.jobDescription
        ? `\n\nJob description (tailor the question toward this role):\n"""${body.jobDescription.slice(0, 6000)}"""`
        : "");

    const msg = await client.messages.create({
      model: MODELS.generate,
      max_tokens: 1200,
      system: systemText,
      tools: [QUESTION_TOOL],
      tool_choice: { type: "tool", name: QUESTION_TOOL.name },
      messages: [{ role: "user", content: userText }],
    });

    const toolUse = msg.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "Model did not return a question." }, { status: 502 });
    }
    const input = toolUse.input as {
      prompt: string;
      context?: string;
      choices: string[];
      bestChoiceIndex: number;
      rubric: string[];
    };

    const question: Question = {
      id: crypto.randomUUID(),
      category: body.category,
      difficulty: body.difficulty,
      prompt: input.prompt,
      context: input.context || undefined,
      choices: input.choices,
      bestChoiceIndex: input.bestChoiceIndex,
      rubric: input.rubric,
    };

    return NextResponse.json({ question });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
