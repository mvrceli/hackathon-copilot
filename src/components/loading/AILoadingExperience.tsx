"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, GitBranch, Layers, Zap, Network,
  AlertTriangle, Lightbulb, Sparkles, Check,
} from "lucide-react";

const STAGES = [
  { message: "Analyzing team strengths",   icon: Users,         color: "#6366f1" },
  { message: "Mapping skill coverage",     icon: GitBranch,     color: "#06b6d4" },
  { message: "Building execution phases",  icon: Layers,        color: "#10b981" },
  { message: "Assigning tasks optimally",  icon: Zap,           color: "#8b5cf6" },
  { message: "Optimizing dependencies",    icon: Network,       color: "#f59e0b" },
  { message: "Detecting bottlenecks",      icon: AlertTriangle, color: "#ef4444" },
  { message: "Generating insights",        icon: Lightbulb,     color: "#06b6d4" },
  { message: "Finalizing your plan",       icon: Sparkles,      color: "#6366f1" },
] as const;

const STAGE_DURATION_MS = 2200;

export function AILoadingExperience() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStageIndex((i) => (i < STAGES.length - 1 ? i + 1 : i));
    }, STAGE_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  const stage = STAGES[stageIndex];
  const StageIcon = stage.icon;
  const progress = Math.round(((stageIndex + 1) / STAGES.length) * 100);

  return (
    <div className="flex h-full min-h-[70vh] items-center justify-center px-8 select-none">
      <div className="flex flex-col items-center gap-7 w-full max-w-[320px]">

        {/* Animated icon */}
        <div className="relative">
          <motion.div
            className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
            animate={{
              backgroundColor: `${stage.color}10`,
              borderColor: `${stage.color}28`,
              boxShadow: `0 0 52px ${stage.color}18`,
            }}
            transition={{ duration: 0.6 }}
            style={{ border: "1px solid" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={stage.message}
                initial={{ opacity: 0, scale: 0.55, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.55, rotate: 20 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <StageIcon className="w-7 h-7" style={{ color: stage.color }} />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Pulsing outer ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ border: `1px solid ${stage.color}` }}
            animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.22, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Stage message + dots */}
        <div className="flex flex-col items-center gap-3 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={stage.message}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -7 }}
              transition={{ duration: 0.22 }}
              className="text-sm font-semibold text-zinc-200 tracking-tight"
            >
              {stage.message}
            </motion.p>
          </AnimatePresence>

          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-[5px] h-[5px] rounded-full"
                style={{ background: stage.color }}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-1.5">
          <div className="w-full h-0.5 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${progress}%`, backgroundColor: stage.color }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-code text-[9px] text-zinc-700">Gemini 2.5 Flash</span>
            <span className="font-code text-[9px]" style={{ color: `${stage.color}99` }}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Stage checklist */}
        <div className="w-full space-y-1">
          {STAGES.map((s, i) => {
            const done = i < stageIndex;
            const current = i === stageIndex;
            const SIcon = s.icon;

            return (
              <motion.div
                key={s.message}
                className="flex items-center gap-2"
                animate={{ opacity: done ? 0.45 : current ? 1 : 0.15 }}
                transition={{ duration: 0.35 }}
              >
                <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                  {done ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    >
                      <Check className="w-3 h-3" style={{ color: s.color }} />
                    </motion.div>
                  ) : current ? (
                    <motion.div
                      className="w-[5px] h-[5px] rounded-full"
                      style={{ background: s.color }}
                      animate={{ opacity: [1, 0.25, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                    />
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-zinc-800" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  {current && <SIcon className="w-2.5 h-2.5 shrink-0" style={{ color: s.color }} />}
                  <span
                    className="font-code text-[10px] truncate"
                    style={{ color: current ? s.color : done ? "#3f3f46" : "#27272a" }}
                  >
                    {s.message}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
