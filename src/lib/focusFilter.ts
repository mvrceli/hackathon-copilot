import type { ExecutionPlan } from "@/types";

export function getAssigneesFromPlan(plan: ExecutionPlan): string[] {
  return [...new Set(plan.tasks.map((t) => t.owner))].sort();
}

export function buildFocusPlan(plan: ExecutionPlan, person: string): ExecutionPlan {
  const myTaskIds = new Set(
    plan.tasks.filter((t) => t.owner === person).map((t) => t.id)
  );

  // Tasks this person is blocked on (direct deps they don't own)
  const depIds = new Set(
    plan.tasks
      .filter((t) => myTaskIds.has(t.id))
      .flatMap((t) => t.dependencies)
      .filter((id) => !myTaskIds.has(id))
  );

  const relevantIds = new Set([...myTaskIds, ...depIds]);

  // Phases only render the focused person's own task rows.
  // Dep tasks are excluded from phase rendering but kept in plan.tasks
  // so that dep chip tooltips (via allTasks) can still resolve their titles.
  const filteredPhases = plan.phases
    .map((phase) => ({
      ...phase,
      tasks: phase.tasks.filter((t) => myTaskIds.has(t.id)),
    }))
    .filter((phase) => phase.tasks.length > 0);

  return {
    ...plan,
    phases: filteredPhases,
    tasks: plan.tasks.filter((t) => relevantIds.has(t.id)),
    bottlenecks: plan.bottlenecks.filter((b) =>
      b.affectedTasks?.some((tid) => myTaskIds.has(tid))
    ),
    criticalPath: plan.criticalPath.filter((c) => myTaskIds.has(c.taskId)),
    overloadWarnings: plan.overloadWarnings?.filter((w) => w.person === person),
  };
}
