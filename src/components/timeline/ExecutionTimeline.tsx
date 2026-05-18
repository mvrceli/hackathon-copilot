"use client";

import { motion } from "framer-motion";
import { GitFork, AlertOctagon, RotateCcw } from "lucide-react";
import { AILoadingExperience } from "@/components/loading/AILoadingExperience";
import { Phase } from "./Phase";
import { phaseColor } from "@/lib/utils";
import type { ExecutionPlan } from "@/types";

interface ExecutionTimelineProps {
  plan: ExecutionPlan | null;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
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

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 px-8 text-center select-none"
    >
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <AlertOctagon className="w-7 h-7 text-rose-400" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-zinc-300">Generation failed</p>
        <p className="font-code text-[11px] text-rose-400/80 max-w-[280px] leading-relaxed break-words">
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-400 hover:text-zinc-200 hover:border-white/[0.14] transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Try again
        </button>
      )}
    </motion.div>
  );
}

export function ExecutionTimeline({ plan, isLoading, error, onRetry }: ExecutionTimelineProps) {
  if (isLoading) return <AILoadingExperience />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
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
