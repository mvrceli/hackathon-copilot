"use client";

import { useState } from "react";
import { LeftSidebar } from "./LeftSidebar";
import { ExecutionTimeline } from "@/components/timeline/ExecutionTimeline";
import { InsightsPanel } from "@/components/insights/InsightsPanel";
import type { ExecutionPlan, FormData } from "@/types";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(data: FormData) {
    setIsLoading(true);
    console.log("Form data:", data);
    // Backend not yet connected — plan remains null
    setTimeout(() => setIsLoading(false), 800);
  }

  return (
    <div className="flex h-full w-full overflow-hidden relative noise">
      {/* Ambient glow top-left */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full opacity-[0.08]"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
      />
      {/* Ambient glow top-right */}
      <div
        className="pointer-events-none absolute -top-48 right-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
      />

      {/* LEFT — collapsible sidebar */}
      <LeftSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {/* CENTER — execution timeline */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden border-x border-white/[0.06] dot-grid">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] shrink-0">
          <span className="font-code text-[10px] uppercase tracking-widest text-zinc-500">
            Execution Timeline
          </span>
          {plan && (
            <span className="ml-auto font-code text-[10px] text-zinc-600">
              {plan.phases.length} phases · {plan.tasks.length} tasks
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <ExecutionTimeline plan={plan} isLoading={isLoading} />
        </div>
      </main>

      {/* RIGHT — insights */}
      <aside className="w-[300px] shrink-0 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] shrink-0">
          <span className="font-code text-[10px] uppercase tracking-widest text-zinc-500">
            Insights
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <InsightsPanel plan={plan} isLoading={isLoading} />
        </div>
      </aside>
    </div>
  );
}
