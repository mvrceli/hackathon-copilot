"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, User, GitBranch, Tag } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { assigneeColor } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskRowProps {
  task: Task;
  allTasks: Task[];
  index: number;
  isCompleted: boolean;
  onToggle: () => void;
}

export function TaskRow({ task, allTasks, index, isCompleted, onToggle }: TaskRowProps) {
  const ownerColor = assigneeColor(task.owner);

  const depTasks = task.dependencies
    .map((depId) => allTasks.find((t) => t.id === depId))
    .filter(Boolean) as Task[];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <div
        className={`group flex items-stretch w-full min-h-[36px] border-b border-white/[0.04] transition-all duration-300 ${
          isCompleted ? "opacity-40" : "hover:bg-white/[0.025]"
        }`}
      >
        {/* Checkbox */}
        <button
          onClick={onToggle}
          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
          className="flex items-center px-3 shrink-0 cursor-pointer"
        >
          <motion.div
            animate={isCompleted
              ? { backgroundColor: "rgba(52,211,153,0.85)", borderColor: "rgba(52,211,153,0.85)" }
              : { backgroundColor: "rgba(255,255,255,0)", borderColor: "rgba(255,255,255,0.15)" }
            }
            whileHover={!isCompleted ? { borderColor: "rgba(255,255,255,0.35)" } : {}}
            transition={{ duration: 0.15 }}
            className="w-3.5 h-3.5 rounded-sm border flex items-center justify-center"
          >
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                >
                  <Check className="w-2.5 h-2.5 text-zinc-950" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </button>

        {/* Task title */}
        <div className="flex items-center flex-1 min-w-0 py-2 pr-3">
          <span
            className={`font-code text-xs truncate leading-none transition-colors duration-300 ${
              isCompleted ? "line-through text-zinc-600" : "text-zinc-200"
            }`}
          >
            {task.title}
          </span>
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1 ml-2 shrink-0">
              {task.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-white/[0.05] text-zinc-500 font-medium"
                >
                  <Tag className="w-2 h-2" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Owner */}
        <div className="flex items-center px-3 shrink-0 border-l border-white/[0.04]">
          <Tooltip>
            <TooltipTrigger
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border cursor-default ${ownerColor.bg} ${ownerColor.text} ${ownerColor.border}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${ownerColor.dot} shrink-0`} />
              <span className="max-w-[80px] truncate">{task.owner}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3" />
                {task.owner}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Dependencies */}
        {depTasks.length > 0 && (
          <div className="flex items-center px-3 shrink-0 gap-1.5 border-l border-white/[0.04]">
            <GitBranch className="w-3 h-3 text-zinc-600 shrink-0" />
            <div className="flex gap-1">
              {depTasks.slice(0, 2).map((dep) => (
                <Tooltip key={dep.id}>
                  <TooltipTrigger className="font-code text-[9px] text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] cursor-default hover:border-white/[0.12] transition-colors max-w-[80px] truncate">
                    {dep.id}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {dep.title}
                  </TooltipContent>
                </Tooltip>
              ))}
              {depTasks.length > 2 && (
                <span className="font-code text-[9px] text-zinc-600">
                  +{depTasks.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Estimated time */}
        <div className="flex items-center px-3 shrink-0 border-l border-white/[0.04]">
          <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-code">
            <Clock className="w-3 h-3 text-zinc-600" />
            {task.estimatedTime}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
