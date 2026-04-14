import fs from "node:fs";
import path from "node:path";

let cached: string | null = null;

export function getProfile(): string {
  if (cached) return cached;
  try {
    const p = path.join(process.cwd(), "CLAUDE.md");
    cached = fs.readFileSync(p, "utf8");
  } catch {
    cached =
      "MBA-level, 7+ years experience. Industry: food & agriculture tech, physical food products. Mission-driven and climate-focused.";
  }
  return cached;
}
