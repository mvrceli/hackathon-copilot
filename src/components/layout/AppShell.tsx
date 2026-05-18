"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LeftSidebar } from "./LeftSidebar";
import { ExecutionTimeline } from "@/components/timeline/ExecutionTimeline";
import { InsightsPanel } from "@/components/insights/InsightsPanel";
import type { ExecutionPlan, FormData } from "@/types";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFormData = useRef<FormData | null>(null);

  async function submit(data: FormData) {
    setIsLoading(true);
    setError(null);
    setPlan(null);
    lastFormData.current = data;
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Server error ${res.status}`);
      setPlan(json as ExecutionPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  function handleRetry() {
    if (lastFormData.current) submit(lastFormData.current);
  }

  return (
    <div className="flex h-full w-full overflow-hidden relative noise">
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full opacity-[0.08]"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -top-48 right-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
      />

      {/* LEFT — collapsible sidebar */}
      <LeftSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onSubmit={submit}
        isLoading={isLoading}
      />

      {/* CENTER — execution timeline */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden border-x border-white/[0.06] dot-grid">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] shrink-0">
          <span className="font-code text-[10px] uppercase tracking-widest text-zinc-500">
            Execution Timeline
          </span>

          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading-badge"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                className="flex items-center gap-1.5"
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="font-code text-[10px] text-indigo-400/70">Generating…</span>
              </motion.div>
            )}
            {plan && !isLoading && (
              <motion.span
                key="plan-stats"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="ml-auto font-code text-[10px] text-zinc-600"
              >
                {plan.phases.length} phases · {plan.tasks.length} tasks
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ExecutionTimeline
            plan={plan}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
          />
        </div>
      </main>

      {/* RIGHT — insights */}
      <aside className="w-[300px] shrink-0 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] shrink-0">
          <span className="font-code text-[10px] uppercase tracking-widest text-zinc-500">
            Insights
          </span>
          <AnimatePresence>
            {plan && !isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20"
              >
                <div className="w-1 h-1 rounded-full bg-indigo-400" />
                <span className="font-code text-[9px] text-indigo-400">gemini</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex-1 overflow-y-auto">
          <InsightsPanel plan={plan} isLoading={isLoading} />
        </div>
      </aside>
    </div>
  );
}
