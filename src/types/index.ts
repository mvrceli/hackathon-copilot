export type Task = {
  id: string;
  title: string;
  owner: string;
  dependencies: string[];
  estimatedTime: string;
  tags?: string[];
  status?: "pending" | "in-progress" | "done" | "blocked";
};

export type Phase = {
  id: string;
  title: string;
  duration: string;
  assignees: string[];
  tasks: Task[];
  startHour?: number;
  endHour?: number;
};

export type Bottleneck = {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  affectedTasks?: string[];
};

export type OverloadWarning = {
  person: string;
  allocatedHours: number;
  maxHours: number;
  message: string;
};

export type Suggestion = {
  id: string;
  title: string;
  body: string;
  category: "workflow" | "team" | "technical" | "scope";
};

export type CriticalPathItem = {
  taskId: string;
  taskTitle: string;
  phase: string;
  reason: string;
};

export type ExecutionPlan = {
  summary: string;
  phases: Phase[];
  tasks: Task[];
  bottlenecks: Bottleneck[];
  suggestions: Suggestion[];
  criticalPath: CriticalPathItem[];
  overloadWarnings?: OverloadWarning[];
};

export type TeamMemberDraft = {
  id: string;
  name: string;
  skillsRaw: string;
  preferredWork: string;
};

export type FormData = {
  projectIdea: string;
  timeframeHours: string;
  team: TeamMemberDraft[];
};
