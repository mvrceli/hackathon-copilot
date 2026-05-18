import { geminiModel } from "@/lib/gemini";
import { GeminiResponseSchema, type PlanRequest } from "@/lib/schema";
import { buildUserPrompt } from "@/lib/prompt";
import { MOCK_GEMINI_RESPONSE } from "@/lib/mockPlan";
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
  return buildFromGeminiData(GeminiResponseSchema.parse(parsed));
}

function buildFromGeminiData(geminiData: ReturnType<typeof GeminiResponseSchema.parse>): ExecutionPlan {
  const tasks = geminiData.phases.flatMap((phase) => phase.tasks);
  return { ...geminiData, tasks } as ExecutionPlan;
}

function isMockFallback(): ExecutionPlan {
  console.log("[planService] Returning demo mock plan");
  return buildFromGeminiData(GeminiResponseSchema.parse(MOCK_GEMINI_RESPONSE));
}

function isInvalidKeyError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("API_KEY_INVALID") || msg.includes("API key not valid");
}

export async function generatePlan(request: PlanRequest): Promise<ExecutionPlan> {
  if (!process.env.GOOGLE_API_KEY) {
    console.log("[planService] No GOOGLE_API_KEY set — using mock plan");
    return isMockFallback();
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

      if (isInvalidKeyError(err)) {
        console.log("[planService] Invalid API key detected — using mock plan");
        return isMockFallback();
      }

      if (attempt < MAX_RETRIES) {
        await sleep(600 * attempt);
      }
    }
  }

  throw new Error(
    `Failed to generate plan after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`
  );
}
