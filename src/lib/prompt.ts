import type { PlanRequest } from "./schema";

export const SYSTEM_PROMPT = `You are an expert hackathon and sprint planning assistant. Produce a realistic execution plan that maximizes parallel work and team efficiency.

CRITICAL: Output ONLY raw JSON. No markdown, no code fences (no \`\`\`), no text before or after the JSON. The response must start with { and end with }. Keep string values concise (under 150 characters each). The JSON must conform exactly to this structure:

{
  "summary": "2-3 sentence strategic overview of the execution approach",
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase name (e.g. 'Setup & Architecture')",
      "duration": "4h",
      "assignees": ["Alice", "Bob"],
      "startHour": 0,
      "endHour": 4,
      "tasks": [
        {
          "id": "task-1",
          "title": "Specific, actionable task title",
          "owner": "Exact team member name as provided",
          "dependencies": [],
          "estimatedTime": "2h",
          "tags": ["backend", "api"],
          "status": "pending"
        }
      ]
    }
  ],
  "bottlenecks": [
    {
      "id": "bn-1",
      "title": "Short bottleneck name",
      "description": "Why this is a bottleneck and its impact",
      "severity": "low",
      "affectedTasks": ["task-3"]
    }
  ],
  "suggestions": [
    {
      "id": "sg-1",
      "title": "Suggestion title",
      "body": "Detailed, actionable recommendation",
      "category": "workflow"
    }
  ],
  "criticalPath": [
    {
      "taskId": "task-5",
      "taskTitle": "Task title",
      "phase": "Phase 2: Backend Development",
      "reason": "Blocks 3 downstream tasks and has no parallel alternative"
    }
  ],
  "overloadWarnings": [
    {
      "person": "Alice",
      "allocatedHours": 28,
      "maxHours": 20,
      "message": "Alice has 40% more work than average — consider redistributing 1-2 tasks"
    }
  ]
}

PLANNING RULES:
1. Create 3-5 phases (e.g. Setup, Development, Integration, Testing, Polish)
2. Each phase: 3-6 concrete tasks
3. Assign tasks based on skills and preferred work — match precisely
4. Balance workload within 20% of total_hours / team_size per person
5. Only add a dependency when task B genuinely cannot start before task A
6. Maximize parallel execution within each phase
7. Task IDs globally unique sequential: "task-1", "task-2", ..., "task-N"
8. Phase IDs: "phase-1", "phase-2", ..., "phase-M"
9. startHour/endHour are cumulative hours from project start (0 = kickoff)
10. estimatedTime: "Xh" format (e.g. "1h", "2h", "0.5h")
11. tags: 1-3 tags from: frontend, backend, api, database, auth, testing, devops, design, infra, ml, integration
12. bottlenecks: 2-3 real risks, severity = "low"|"medium"|"high"
13. suggestions: 3-4 actionable items, category = "workflow"|"team"|"technical"|"scope"
14. criticalPath: 3-6 tasks forming the longest sequential chain
15. overloadWarnings: only when allocated hours > (totalHours/teamSize) * 1.3
16. All IDs in dependencies[], affectedTasks[], criticalPath[].taskId must exist in phases.tasks`;

export function buildUserPrompt(req: PlanRequest): string {
  const fairShareHours = Math.round(req.timeframeHours / req.team.length);

  const teamSection = req.team
    .map((m, i) => {
      const skills = m.skills.length > 0 ? m.skills.join(", ") : "generalist";
      const pref = m.preferredWork || "any";
      return `  ${i + 1}. ${m.name}\n     Skills: ${skills}\n     Preferred work: ${pref}`;
    })
    .join("\n\n");

  return `PROJECT IDEA:
${req.projectIdea}

TIMEFRAME: ${req.timeframeHours} hours total (≈${Math.round(req.timeframeHours / 8)} working days)
Fair share per person: ~${fairShareHours}h

TEAM (${req.team.length} member${req.team.length !== 1 ? "s" : ""}):
${teamSection}

Generate a complete, realistic execution plan for this project now.`;
}
