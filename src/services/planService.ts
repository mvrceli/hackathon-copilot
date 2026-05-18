import { geminiModel } from "@/lib/gemini";
import { GeminiResponseSchema, type PlanRequest } from "@/lib/schema";
import { buildUserPrompt } from "@/lib/prompt";
import type { ExecutionPlan } from "@/types";

const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function cleanJson(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim()
    // Remove trailing commas before ] or }
    .replace(/,(\s*[}\]])/g, "$1");
}

function parseAndValidate(raw: string): ExecutionPlan {
  const cleaned = cleanJson(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("[planService] JSON parse failed. First 500 chars:", cleaned.slice(0, 500));
    throw e;
  }
  const geminiData = GeminiResponseSchema.parse(parsed);
  const tasks = geminiData.phases.flatMap((phase) => phase.tasks);
  return { ...geminiData, tasks } as ExecutionPlan;
}

export async function generatePlan(request: PlanRequest): Promise<ExecutionPlan> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not configured on the server");
  }

  const userPrompt = buildUserPrompt(request);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await geminiModel.generateContent(userPrompt);
      const raw = result.response.text();
      return parseAndValidate(raw);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[planService] Attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message);
      if (attempt < MAX_RETRIES) {
        await sleep(600 * attempt);
      }
    }
  }

  throw new Error(
    `Failed to generate plan after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`
  );
}
