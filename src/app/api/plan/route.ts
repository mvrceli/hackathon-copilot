import { NextResponse } from "next/server";
import { PlanRequestSchema } from "@/lib/schema";
import { generatePlan } from "@/services/planService";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PlanRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const plan = await generatePlan(parsed.data);
    return NextResponse.json(plan);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate plan";
    console.error("[POST /api/plan]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
