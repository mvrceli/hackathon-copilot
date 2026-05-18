import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ASSIGNEE_COLORS = [
  { bg: "bg-violet-500/15", text: "text-violet-300", border: "border-violet-500/30", dot: "bg-violet-400" },
  { bg: "bg-cyan-500/15",   text: "text-cyan-300",   border: "border-cyan-500/30",   dot: "bg-cyan-400" },
  { bg: "bg-emerald-500/15",text: "text-emerald-300",border: "border-emerald-500/30",dot: "bg-emerald-400" },
  { bg: "bg-amber-500/15",  text: "text-amber-300",  border: "border-amber-500/30",  dot: "bg-amber-400" },
  { bg: "bg-rose-500/15",   text: "text-rose-300",   border: "border-rose-500/30",   dot: "bg-rose-400" },
  { bg: "bg-sky-500/15",    text: "text-sky-300",    border: "border-sky-500/30",    dot: "bg-sky-400" },
  { bg: "bg-pink-500/15",   text: "text-pink-300",   border: "border-pink-500/30",   dot: "bg-pink-400" },
  { bg: "bg-orange-500/15", text: "text-orange-300", border: "border-orange-500/30", dot: "bg-orange-400" },
];

const nameColorCache = new Map<string, typeof ASSIGNEE_COLORS[0]>();

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function assigneeColor(name: string) {
  if (nameColorCache.has(name)) return nameColorCache.get(name)!;
  const color = ASSIGNEE_COLORS[hashName(name) % ASSIGNEE_COLORS.length];
  nameColorCache.set(name, color);
  return color;
}

export const PHASE_ACCENT_COLORS = [
  "#6366f1", // indigo
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
];

export function phaseColor(index: number): string {
  return PHASE_ACCENT_COLORS[index % PHASE_ACCENT_COLORS.length];
}

export const SEVERITY_STYLES = {
  low:    { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  medium: { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   dot: "bg-amber-400" },
  high:   { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/20",    dot: "bg-rose-400" },
};

export const CATEGORY_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  workflow:  { label: "Workflow",  bg: "bg-indigo-500/10",  text: "text-indigo-400" },
  team:      { label: "Team",      bg: "bg-cyan-500/10",    text: "text-cyan-400" },
  technical: { label: "Technical", bg: "bg-violet-500/10",  text: "text-violet-400" },
  scope:     { label: "Scope",     bg: "bg-orange-500/10",  text: "text-orange-400" },
};
