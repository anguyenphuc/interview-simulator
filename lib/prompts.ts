import { getProfile } from "./profile";
import type { Category, Difficulty } from "./types";

const RUBRICS: Record<Category, string> = {
  behavioral: `Behavioral interview question using STAR (Situation, Task, Action, Result). Should probe leadership, influence, dealing with ambiguity, conflict, or impact. Answer quality is judged on concrete specifics, ownership, quantified results, and reflection.`,
  case: `Open-ended business case question. Should force structured reasoning across market sizing, unit economics, GTM, or operational tradeoffs. Answer quality is judged on framework clarity, identifying the crux, surfacing assumptions, and arriving at a crisp recommendation.`,
  situational: `Situational judgment scenario. Candidate is placed in a realistic operating dilemma and must decide + justify. Answer quality is judged on stakeholder reasoning, prioritization, and tradeoff articulation.`,
};

const DIFFICULTY_NOTES: Record<Difficulty, string> = {
  easy: "Approachable scope, single decision or trade-off. ~1-minute answer.",
  medium: "Multi-stakeholder or multi-variable. Requires structure. ~2-3 minute answer.",
  hard: "Ambiguous, high-stakes, or senior-leader-level. Requires framework + judgment + quantification. ~3-5 minute answer.",
};

export function systemPromptForGeneration(
  category: Category,
  difficulty: Difficulty,
): string {
  return [
    "You are an expert interview coach generating interview practice questions.",
    "",
    "## Candidate profile",
    getProfile(),
    "",
    "## Question type",
    RUBRICS[category],
    "",
    "## Difficulty",
    DIFFICULTY_NOTES[difficulty],
    "",
    "## Instructions",
    "- Tailor the question to the candidate's industry (food & ag-tech, physical food products) and mission/climate orientation when it fits naturally — do not force it.",
    "- If a job description is provided, weight the question toward skills and responsibilities in that JD.",
    "- Always produce 4 multiple-choice options (choices) plus a rubric of 3-5 key points a strong free-form answer should cover. For behavioral questions, one choice should represent a clearly strong STAR-style response.",
    "- bestChoiceIndex is the index (0-3) of the strongest option.",
    "- Use the emit_question tool to return the result. Do not reply in plain text.",
  ].join("\n");
}

export function systemPromptForEvaluation(): string {
  return [
    "You are an expert interview coach giving structured feedback.",
    "",
    "## Candidate profile",
    getProfile(),
    "",
    "## Instructions",
    "- Evaluate the candidate's answer against the question's rubric.",
    "- Highlight 2-4 specific strengths and 2-4 specific gaps. Be concrete — cite what the candidate said or failed to say.",
    "- For behavioral questions, produce a STAR breakdown noting what was covered vs. missing in each bucket (use empty string if entirely missing).",
    "- For multiple-choice answers, explain why the selected option is strong/weak versus alternatives.",
    "- Provide a concise model answer (150-250 words) that demonstrates excellence for this candidate's level and industry.",
    "- Reward quantified impact, ownership, and climate/mission framing where relevant.",
    "- Score 1-10 where 7 = interview-ready, 9-10 = exceptional.",
    "- Use the emit_feedback tool to return the result. Do not reply in plain text.",
  ].join("\n");
}

export const QUESTION_TOOL = {
  name: "emit_question",
  description: "Emit a single interview question with MCQ choices and a rubric.",
  input_schema: {
    type: "object" as const,
    properties: {
      prompt: { type: "string", description: "The interview question shown to the candidate." },
      context: {
        type: "string",
        description: "Optional short scenario/setup (2-4 sentences) for case or situational questions. Empty string for simple behavioral.",
      },
      choices: {
        type: "array",
        items: { type: "string" },
        minItems: 4,
        maxItems: 4,
        description: "Four plausible multiple-choice responses.",
      },
      bestChoiceIndex: {
        type: "integer",
        minimum: 0,
        maximum: 3,
        description: "Index of the strongest MCQ option.",
      },
      rubric: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 5,
        description: "3-5 key points a strong free-form answer should cover.",
      },
    },
    required: ["prompt", "choices", "bestChoiceIndex", "rubric"],
  },
};

export const FEEDBACK_TOOL = {
  name: "emit_feedback",
  description: "Emit structured feedback on the candidate's answer.",
  input_schema: {
    type: "object" as const,
    properties: {
      overallScore: { type: "integer", minimum: 1, maximum: 10 },
      strengths: { type: "array", items: { type: "string" }, minItems: 1 },
      gaps: { type: "array", items: { type: "string" }, minItems: 1 },
      starBreakdown: {
        type: "object",
        description: "Required for behavioral questions. Use empty string for any STAR element that was not addressed.",
        properties: {
          situation: { type: "string" },
          task: { type: "string" },
          action: { type: "string" },
          result: { type: "string" },
        },
        required: ["situation", "task", "action", "result"],
      },
      modelAnswer: { type: "string", description: "A concise exemplar answer (150-250 words)." },
    },
    required: ["overallScore", "strengths", "gaps", "modelAnswer"],
  },
};
