import type { SessionConfig, Question, Feedback } from "./types";

const CONFIG_KEY = "is.config";
const QUESTION_KEY = "is.question";
const FEEDBACK_KEY = "is.feedback";
const ANSWER_KEY = "is.answer";

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(value));
}

export const session = {
  getConfig: () => read<SessionConfig>(CONFIG_KEY),
  setConfig: (c: SessionConfig) => write(CONFIG_KEY, c),
  getQuestion: () => read<Question>(QUESTION_KEY),
  setQuestion: (q: Question) => write(QUESTION_KEY, q),
  getFeedback: () => read<Feedback>(FEEDBACK_KEY),
  setFeedback: (f: Feedback) => write(FEEDBACK_KEY, f),
  getAnswer: () =>
    read<{ kind: "free"; text: string } | { kind: "mcq"; choiceIndex: number }>(ANSWER_KEY),
  setAnswer: (a: { kind: "free"; text: string } | { kind: "mcq"; choiceIndex: number }) =>
    write(ANSWER_KEY, a),
  clearQA: () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(QUESTION_KEY);
    sessionStorage.removeItem(FEEDBACK_KEY);
    sessionStorage.removeItem(ANSWER_KEY);
  },
};
