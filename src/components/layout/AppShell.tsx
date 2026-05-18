"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users } from "lucide-react";
import { LeftSidebar } from "./LeftSidebar";
import { ExecutionTimeline } from "@/components/timeline/ExecutionTimeline";
import { TimeAnalysisView } from "@/components/timeline/TimeAnalysisView";
import { InsightsPanel } from "@/components/insights/InsightsPanel";
import { buildFocusPlan, getAssigneesFromPlan } from "@/lib/focusFilter";
import { assigneeColor } from "@/lib/utils";
import type { ExecutionPlan, FormData } from "@/types";

type CenterTab = "timeline" | "analysis";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [centerTab, setCenterTab] = useState<CenterTab>("timeline");
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusPerson, setFocusPerson] = useState<string | null>(null);
  const [showFocusPicker, setShowFocusPicker] = useState(false);
  const lastFormData = useRef<FormData | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    if (!showFocusPicker) return;
    function onMouseDown(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowFocusPicker(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [showFocusPicker]);

  const allAssignees = useMemo(
    () => (plan ? getAssigneesFromPlan(plan) : []),
    [plan]
  );

  const focusedPlan = useMemo(
    () => (plan && focusPerson ? buildFocusPlan(plan, focusPerson) : null),
    [plan, focusPerson]
  );

  const activePlan = focusedPlan ?? plan;

  const focusColor = focusPerson ? assigneeColor(focusPerson) : null;

  const myTaskCount = focusedPlan && focusPerson
    ? focusedPlan.tasks.filter((t) => t.owner === focusPerson).length
    : 0;
  const depTaskCount = focusedPlan && focusPerson
    ? focusedPlan.tasks.filter((t) => t.owner !== focusPerson).length
    : 0;

  async function submit(data: FormData) {
    setIsLoading(true);
    setError(null);
    setPlan(null);
    setFocusPerson(null);
    setShowFocusPicker(false);
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

      {/* CENTER */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden border-x border-white/[0.06] dot-grid">

        {/* Header row */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] shrink-0">
          {/* Tab switcher */}
          <div className="flex items-center gap-0.5 rounded bg-white/[0.03] border border-white/[0.06] p-0.5">
            {(["timeline", "analysis"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCenterTab(tab)}
                className={`px-2.5 py-1 rounded font-code text-[10px] transition-colors ${
                  centerTab === tab
                    ? "bg-white/[0.08] text-zinc-200"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {tab === "timeline" ? "Timeline" : "Analysis"}
              </button>
            ))}
          </div>

          {/* Focus Mode control */}
          {plan && !isLoading && (
            <div className="relative" ref={pickerRef}>
              {focusPerson ? (
                /* Active pill — shows selected person */
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border font-code text-[10px]"
                  style={{ background: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.28)" }}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 ${focusColor?.bg} ${focusColor?.text}`}
                  >
                    {focusPerson[0]}
                  </div>
                  <span className="text-indigo-300">{focusPerson.split(" ")[0]}</span>
                  <button
                    onClick={() => setFocusPerson(null)}
                    aria-label="Exit focus mode"
                    className="text-indigo-400/50 hover:text-indigo-300 transition-colors ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : (
                /* Idle button */
                <button
                  onClick={() => setShowFocusPicker((v) => !v)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded font-code text-[10px] text-zinc-600 hover:text-zinc-400 border border-transparent hover:border-white/[0.07] transition-colors"
                >
                  <Users className="w-3 h-3" />
                  Focus
                </button>
              )}

              {/* Person picker dropdown */}
              <AnimatePresence>
                {showFocusPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.13 }}
                    className="absolute top-full left-0 mt-1.5 z-50 min-w-[180px] rounded-lg border border-white/[0.1] bg-zinc-950/95 backdrop-blur-sm shadow-2xl overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-white/[0.06]">
                      <span className="font-code text-[9px] uppercase tracking-wider text-zinc-600">
                        Focus on teammate
                      </span>
                    </div>
                    {allAssignees.map((name) => {
                      const c = assigneeColor(name);
                      return (
                        <button
                          key={name}
                          onClick={() => {
                            setFocusPerson(name);
                            setShowFocusPicker(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/[0.04] transition-colors group"
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${c.bg} ${c.text}`}
                          >
                            {name[0]}
                          </div>
                          <span className="font-code text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors">
                            {name}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Right-side status */}
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
                {focusPerson
                  ? `${myTaskCount} tasks · ${depTaskCount} deps`
                  : `${plan.phases.length} phases · ${plan.tasks.length} tasks`}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Focus mode banner */}
        <AnimatePresence>
          {focusPerson && plan && !isLoading && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden shrink-0"
            >
              <div
                className="flex items-center gap-3 px-5 py-2.5 border-b"
                style={{
                  background: "rgba(99,102,241,0.05)",
                  borderColor: "rgba(99,102,241,0.14)",
                }}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border ${focusColor?.bg} ${focusColor?.text} ${focusColor?.border}`}
                >
                  {focusPerson[0]}
                </div>

                {/* Name + label */}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-zinc-200">{focusPerson}</span>
                  <span className="ml-2 font-code text-[9px] text-indigo-400/60">
                    focus mode active
                  </span>
                </div>

                {/* Task counts */}
                <span className="font-code text-[10px] text-zinc-600 shrink-0">
                  {myTaskCount} task{myTaskCount !== 1 ? "s" : ""}
                  {depTaskCount > 0 && ` · ${depTaskCount} dep${depTaskCount !== 1 ? "s" : ""}`}
                </span>

                {/* Exit button */}
                <button
                  onClick={() => setFocusPerson(null)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded font-code text-[10px] text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-colors shrink-0"
                >
                  <X className="w-3 h-3" />
                  Exit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto">
          {centerTab === "timeline" || !activePlan ? (
            <ExecutionTimeline
              plan={activePlan}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
            />
          ) : (
            <TimeAnalysisView plan={activePlan} />
          )}
        </div>
      </main>

      {/* RIGHT — insights */}
      <aside className="w-[300px] shrink-0 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] shrink-0">
          <span className="font-code text-[10px] uppercase tracking-widest text-zinc-500">
            Insights
          </span>

          {/* Badge: focus indicator OR gemini source badge */}
          <div className="ml-auto">
            <AnimatePresence mode="wait">
              {focusPerson && plan && !isLoading ? (
                <motion.div
                  key="focus-badge"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full border"
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    borderColor: "rgba(99,102,241,0.25)",
                  }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${focusColor?.dot}`} />
                  <span className="font-code text-[9px] text-indigo-300">
                    {focusPerson.split(" ")[0]}
                  </span>
                </motion.div>
              ) : plan && !isLoading ? (
                <motion.div
                  key="gemini-badge"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20"
                >
                  <div className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span className="font-code text-[9px] text-indigo-400">gemini</span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <InsightsPanel plan={activePlan} isLoading={isLoading} />
        </div>
      </aside>
    </div>
  );
}
