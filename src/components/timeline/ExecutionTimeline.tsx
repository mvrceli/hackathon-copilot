"use client";

import { motion } from "framer-motion";
import { GitFork, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Phase } from "./Phase";
import { phaseColor } from "@/lib/utils";
import type { ExecutionPlan } from "@/types";

interface ExecutionTimelineProps {
  plan: ExecutionPlan | null;
  isLoading: boolean;
}

function LoadingSkeleton() {
  return (
    <div className="p-5 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-9 w-full bg-white/[0.04]" />
          <Skeleton className="h-8 w-full bg-white/[0.03]" />
          <Skeleton className="h-8 w-full bg-white/[0.03]" />
          <Skeleton className="h-8 w-[85%] bg-white/[0.025]" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 px-8 text-center select-none">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
          <GitFork className="w-7 h-7 text-zinc-600" />
        </div>
        <div
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}
        >
          <span className="text-[10px] text-indigo-400">?</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-zinc-400">No plan generated yet</p>
        <p className="text-xs text-zinc-600 max-w-[220px] leading-relaxed">
          Fill in your project details and team in the left panel, then hit Generate Plan.
        </p>
      </div>
      <div className="flex flex-col gap-1.5 mt-2">
        {["Project idea", "Timeframe", "Team members"].map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 0.4, x: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="flex items-center gap-2 text-[10px] text-zinc-600"
          >
            <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
            {item}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ExecutionTimeline({ plan, isLoading }: ExecutionTimelineProps) {
  if (isLoading) return <LoadingSkeleton />;
  if (!plan) return <EmptyState />;

  return (
    <div className="flex flex-col w-full">
      {/* Summary bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.01]"
      >
        <p className="text-xs text-zinc-400 leading-relaxed">{plan.summary}</p>
      </motion.div>

      {/* Phases */}
      <div className="divide-y divide-white/[0.04]">
        {plan.phases.map((phase, idx) => (
          <Phase
            key={phase.id}
            phase={phase}
            allTasks={plan.tasks}
            index={idx}
            accentColor={phaseColor(idx)}
          />
        ))}
      </div>
    </div>
  );
}
