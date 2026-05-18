import { z } from "zod";

// ── Input (frontend → API route) ──────────────────────────────────────────────

const TeamMemberRawSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  skillsRaw: z.string(),
  preferredWork: z.string(),
}).transform((m) => ({
  name: m.name.trim(),
  skills: m.skillsRaw.split(",").map((s) => s.trim()).filter(Boolean),
  preferredWork: m.preferredWork.trim(),
}));

export const PlanRequestSchema = z.object({
  projectIdea: z.string().min(1, "Project idea is required"),
  timeframeHours: z.coerce.number().int().min(1).max(168),
  team: z.array(TeamMemberRawSchema).min(1, "At least one team member is required"),
});

export type PlanRequest = z.infer<typeof PlanRequestSchema>;
export type TeamMemberInput = PlanRequest["team"][number];

// ── Output (Gemini → service → API route) ────────────────────────────────────

const TaskOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  owner: z.string(),
  dependencies: z.array(z.string()).default([]),
  estimatedTime: z.string(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["pending", "in-progress", "done", "blocked"]).optional(),
});

const PhaseOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.string(),
  assignees: z.array(z.string()),
  tasks: z.array(TaskOutputSchema),
  startHour: z.number().optional(),
  endHour: z.number().optional(),
});

const BottleneckOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  affectedTasks: z.array(z.string()).optional(),
});

const SuggestionOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  category: z.enum(["workflow", "team", "technical", "scope"]),
});

const CriticalPathItemOutputSchema = z.object({
  taskId: z.string(),
  taskTitle: z.string(),
  phase: z.string(),
  reason: z.string(),
});

const OverloadWarningOutputSchema = z.object({
  person: z.string(),
  allocatedHours: z.number(),
  maxHours: z.number(),
  message: z.string(),
});

// Schema for what Gemini returns (no root-level tasks — derived by service layer)
export const GeminiResponseSchema = z.object({
  summary: z.string(),
  phases: z.array(PhaseOutputSchema),
  bottlenecks: z.array(BottleneckOutputSchema),
  suggestions: z.array(SuggestionOutputSchema),
  criticalPath: z.array(CriticalPathItemOutputSchema),
  overloadWarnings: z.array(OverloadWarningOutputSchema).optional(),
});

export type GeminiResponse = z.infer<typeof GeminiResponseSchema>;
