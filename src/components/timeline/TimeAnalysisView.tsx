"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, GitMerge, Layers } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { assigneeColor } from "@/lib/utils";
import type { ExecutionPlan, Task } from "@/types";

interface ScheduledTask {
  task: Task;
  startHour: number;
  endHour: number;
  duration: number;
  depth: number;
  isCritical: boolean;
}

function parseHours(s: string): number {
  const m = s.match(/^([\d.]+)/);
  return m ? parseFloat(m[1]) : 1;
}

function computeSchedule(tasks: Task[], criticalPathIds: Set<string>): ScheduledTask[] {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const endCache = new Map<string, number>();
  const depthCache = new Map<string, number>();

  function endTime(id: string): number {
    if (endCache.has(id)) return endCache.get(id)!;
    const task = taskMap.get(id);
    if (!task) return 0;
    const pred = task.dependencies.length
      ? Math.max(...task.dependencies.map(endTime))
      : 0;
    const e = pred + parseHours(task.estimatedTime);
    endCache.set(id, e);
    return e;
  }

  function depthOf(id: string): number {
    if (depthCache.has(id)) return depthCache.get(id)!;
    const task = taskMap.get(id);
    if (!task) return 0;
    const d = task.dependencies.length
      ? Math.max(...task.dependencies.map(depthOf)) + 1
      : 0;
    depthCache.set(id, d);
    return d;
  }

  return tasks
    .map((task) => {
      const end = endTime(task.id);
      const dur = parseHours(task.estimatedTime);
      return {
        task,
        startHour: end - dur,
        endHour: end,
        duration: dur,
        depth: depthOf(task.id),
        isCritical: criticalPathIds.has(task.id),
      };
    })
    .sort((a, b) => a.depth - b.depth || a.startHour - b.startHour);
}

function niceInterval(max: number): number {
  if (max <= 8) return 1;
  if (max <= 24) return 2;
  if (max <= 48) return 4;
  return 8;
}

export function TimeAnalysisView({ plan }: { plan: ExecutionPlan }) {
  const criticalPathIds = useMemo(
    () => new Set((plan.criticalPath ?? []).map((c) => c.taskId)),
    [plan.criticalPath]
  );

  const scheduled = useMemo(
    () => computeSchedule(plan.tasks, criticalPathIds),
    [plan.tasks, criticalPathIds]
  );

  const maxHour = useMemo(
    () => Math.max(...scheduled.map((s) => s.endHour), 1),
    [scheduled]
  );

  const interval = niceInterval(maxHour);
  const ticks = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(maxHour / interval) + 1 },
        (_, i) => i * interval
      ).filter((t) => t <= maxHour + interval * 0.01),
    [maxHour, interval]
  );

  const maxDepth = Math.max(...scheduled.map((s) => s.depth), 0);
  const layers = useMemo(
    () =>
      Array.from({ length: maxDepth + 1 }, (_, d) =>
        scheduled.filter((s) => s.depth === d)
      ),
    [scheduled, maxDepth]
  );

  const pct = (h: number) => `${((h / maxHour) * 100).toFixed(3)}%`;

  return (
    <div className="flex flex-col w-full select-none">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.01]"
      >
        <p className="text-xs text-zinc-400 leading-relaxed">{plan.summary}</p>
      </motion.div>

      {/* Legend */}
      <div className="flex items-center gap-5 px-5 py-2 border-b border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-center gap-1.5 font-code text-[10px] text-zinc-500">
          <div className="w-3.5 h-2.5 rounded-sm border border-amber-500/60 bg-amber-500/15 flex items-center justify-center">
            <Zap className="w-2 h-2 text-amber-400" fill="currentColor" />
          </div>
          Critical path
        </div>
        <div className="flex items-center gap-1.5 font-code text-[10px] text-zinc-500">
          <GitMerge className="w-3 h-3 text-zinc-600" />
          Parallel layer
        </div>
        <div className="flex items-center gap-1.5 font-code text-[10px] text-zinc-500">
          <Layers className="w-3 h-3 text-zinc-600" />
          Sequential chain
        </div>
        <div className="ml-auto font-code text-[10px] text-zinc-600">
          {maxHour.toFixed(1)}h span · {scheduled.length} tasks · {layers.length} layers
        </div>
      </div>

      {/* Timeline body */}
      <div className="px-5 pt-5 pb-8">
        {/* Ruler */}
        <div className="relative mb-3 pb-2 border-b border-white/[0.06]">
          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute bottom-0 flex flex-col items-center"
              style={{
                left: pct(Math.min(tick, maxHour)),
                transform: "translateX(-50%)",
              }}
            >
              <span className="font-code text-[8px] text-zinc-600 mb-1 leading-none whitespace-nowrap">
                {tick}h
              </span>
              <div
                className="w-px h-1.5"
                style={{
                  background:
                    tick === 0
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.06)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Layer groups */}
        <div className="relative">
          {/* Vertical grid lines */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {ticks.map((tick) => (
              <div
                key={tick}
                className="absolute top-0 bottom-0 w-px"
                style={{
                  left: pct(Math.min(tick, maxHour)),
                  background:
                    tick === 0
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(255,255,255,0.025)",
                }}
              />
            ))}
          </div>

          <div className="space-y-6">
            {layers.map((layerTasks, depth) => (
              <motion.div
                key={depth}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: depth * 0.06, duration: 0.2 }}
              >
                {/* Layer header */}
                <div className="flex items-center gap-2 mb-2">
                  {depth === 0 ? (
                    <Zap className="w-2.5 h-2.5 text-indigo-400 shrink-0" fill="currentColor" />
                  ) : (
                    <Layers className="w-2.5 h-2.5 text-zinc-600 shrink-0" />
                  )}
                  <span className="font-code text-[9px] uppercase tracking-wider text-zinc-500">
                    {depth === 0 ? "Layer 0 — No dependencies" : `Layer ${depth} — Awaiting layer ${depth - 1}`}
                  </span>
                  <span className="font-code text-[9px] text-zinc-700">
                    ·{" "}
                    {layerTasks.length > 1
                      ? `${layerTasks.length} parallel tasks`
                      : "1 task"}
                  </span>
                  <div className="flex-1 h-px bg-white/[0.03]" />
                </div>

                {/* Task bars */}
                <div className="space-y-1">
                  {layerTasks.map((st, idx) => {
                    const oc = assigneeColor(st.task.owner);
                    const leftPct = (st.startHour / maxHour) * 100;
                    const widthPct = (st.duration / maxHour) * 100;

                    return (
                      <Tooltip key={st.task.id}>
                        <motion.div
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: depth * 0.06 + idx * 0.025,
                            duration: 0.15,
                          }}
                          className="relative h-7"
                        >
                          {/* Track */}
                          <div className="absolute inset-y-1 inset-x-0 rounded bg-white/[0.015]" />

                          {/* Bar */}
                          <TooltipTrigger
                            className={`absolute top-0.5 bottom-0.5 rounded flex items-center px-2 gap-1.5 overflow-hidden cursor-default group transition-colors ${
                              st.isCritical
                                ? "border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/18"
                                : "border border-white/[0.07] bg-white/[0.04] hover:bg-white/[0.08]"
                            }`}
                            style={{
                              left: `${leftPct.toFixed(3)}%`,
                              width: `${Math.max(widthPct, 0.5).toFixed(3)}%`,
                              minWidth: "4px",
                            }}
                          >
                            <div className={`w-1 h-1 rounded-full shrink-0 ${oc.dot}`} />
                            <span className="font-code text-[9px] truncate leading-none text-zinc-300 group-hover:text-zinc-100 transition-colors">
                              {st.task.title}
                            </span>
                            {st.isCritical && (
                              <Zap
                                className="w-2.5 h-2.5 text-amber-400 shrink-0 ml-auto"
                                fill="currentColor"
                              />
                            )}
                          </TooltipTrigger>
                        </motion.div>
                        <TooltipContent side="top" className="max-w-[260px]">
                          <div className="space-y-1.5">
                            <div className="text-xs font-medium text-zinc-200">
                              {st.task.title}
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-code text-[10px] text-zinc-500">
                              <span className={oc.text}>{st.task.owner}</span>
                              <span>{st.duration}h</span>
                              <span>
                                {st.startHour.toFixed(1)}h → {st.endHour.toFixed(1)}h
                              </span>
                            </div>
                            {st.task.dependencies.length > 0 && (
                              <div className="font-code text-[10px] text-zinc-600">
                                Deps: {st.task.dependencies.join(", ")}
                              </div>
                            )}
                            {st.isCritical && (
                              <div className="flex items-center gap-1 font-code text-[10px] text-amber-400">
                                <Zap className="w-2.5 h-2.5" fill="currentColor" />
                                Critical path
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
