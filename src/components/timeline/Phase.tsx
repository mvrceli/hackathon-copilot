"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Clock, Users } from "lucide-react";
import { TaskRow } from "./TaskRow";
import { assigneeColor } from "@/lib/utils";
import type { Phase as PhaseType, Task } from "@/types";

interface PhaseProps {
  phase: PhaseType;
  allTasks: Task[];
  index: number;
  accentColor: string;
}

export function Phase({ phase, allTasks, index, accentColor }: PhaseProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const toggleTask = useCallback((taskId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const completedCount = completedIds.size;
  const totalCount = phase.tasks.length;
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.08 }}
      className="w-full"
      style={{ borderLeft: `2px solid ${accentColor}` }}
    >
      {/* Phase header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors text-left group"
      >
        {/* Phase number */}
        <div
          className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold shrink-0 font-code"
          style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}30` }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Phase name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={`text-xs font-semibold truncate transition-colors duration-300 ${allDone ? "text-zinc-500" : "text-zinc-200"}`}>
              {phase.title}
            </span>
            <AnimatePresence mode="wait">
              {allDone ? (
                <motion.span
                  key="done"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-0.5 font-code text-[9px] text-emerald-500 shrink-0"
                >
                  <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                  done
                </motion.span>
              ) : (
                <motion.span
                  key="count"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-code text-[9px] shrink-0"
                  style={{ color: `${accentColor}99` }}
                >
                  {completedCount > 0 ? `${completedCount}/${totalCount}` : `${totalCount} tasks`}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1 shrink-0 text-zinc-500">
          <Clock className="w-3 h-3" />
          <span className="font-code text-[10px]">{phase.duration}</span>
        </div>

        {/* Assignees */}
        {phase.assignees.length > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            <Users className="w-3 h-3 text-zinc-700" />
            <div className="flex -space-x-1">
              {phase.assignees.slice(0, 4).map((name) => {
                const c = assigneeColor(name);
                return (
                  <div
                    key={name}
                    title={name}
                    className={`w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center border border-background ${c.bg} ${c.text}`}
                    style={{ border: `1px solid ${accentColor}30` }}
                  >
                    {name[0]?.toUpperCase()}
                  </div>
                );
              })}
              {phase.assignees.length > 4 && (
                <div className="w-4 h-4 rounded-full bg-white/[0.05] text-[8px] text-zinc-500 flex items-center justify-center border border-white/[0.1]">
                  +{phase.assignees.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collapse chevron */}
        <motion.div
          animate={{ rotate: collapsed ? -90 : 0 }}
          transition={{ duration: 0.15 }}
          className="shrink-0"
        >
          <ChevronDown className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </motion.div>
      </button>

      {/* Task rows */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Column headers */}
            <div className="flex items-center w-full bg-white/[0.015] border-b border-white/[0.04]">
              <div className="w-8 shrink-0" />
              <div className="flex-1 py-1 pr-3 font-code text-[9px] uppercase tracking-wider text-zinc-600">
                Task
              </div>
              <div className="px-3 font-code text-[9px] uppercase tracking-wider text-zinc-600 border-l border-white/[0.04] w-[120px] shrink-0">
                Owner
              </div>
              <div className="px-3 font-code text-[9px] uppercase tracking-wider text-zinc-600 border-l border-white/[0.04]">
                Deps
              </div>
              <div className="px-3 font-code text-[9px] uppercase tracking-wider text-zinc-600 border-l border-white/[0.04] w-[80px] shrink-0">
                Time
              </div>
            </div>

            {phase.tasks.map((task, tIdx) => (
              <TaskRow
                key={task.id}
                task={task}
                allTasks={allTasks}
                index={tIdx}
                isCompleted={completedIds.has(task.id)}
                onToggle={() => toggleTask(task.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
