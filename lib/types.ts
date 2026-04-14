export type Category = "behavioral" | "case" | "situational";
export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  prompt: string;
  context?: string;
  choices?: string[];
  bestChoiceIndex?: number;
  rubric: string[];
}

export interface StarBreakdown {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface Feedback {
  overallScore: number;
  strengths: string[];
  gaps: string[];
  starBreakdown?: StarBreakdown;
  modelAnswer: string;
}

export interface SessionConfig {
  category: Category;
  difficulty: Difficulty;
  jobDescription?: string;
}
