"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, ChevronDown, Lightbulb, GitCommit,
  Activity, Sparkles, BarChart2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { InsightCard } from "./InsightCard";
import { SEVERITY_STYLES, CATEGORY_STYLES, assigneeColor } from "@/lib/utils";
import type { ExecutionPlan } from "@/types";

interface InsightsPanelProps {
  plan: ExecutionPlan | null;
  isLoading: boolean;
}

function Section({
  icon: Icon,
  title,
  count,
  accentColor,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  accentColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/[0.05] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
      >
        <Icon className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 flex-1 text-left">
          {title}
        </span>
        <span
          className="font-code text-[9px] px-1.5 py-0.5 rounded-full"
          style={{ background: `${accentColor}15`, color: accentColor }}
        >
          {count}
        </span>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="w-3 h-3 text-zinc-600" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Thinking indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.04]"
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
        <span className="font-code text-[10px] text-indigo-400/70">Generating insights…</span>
      </motion.div>

      <div className="p-3 space-y-3">
        {[
          { w: "w-28", items: [20, 16] },
          { w: "w-24", items: [20, 20, 14] },
          { w: "w-20", items: [16, 20] },
        ].map((group, gi) => (
          <div key={gi} className="space-y-1.5">
            <Skeleton className={`h-4 ${group.w} bg-white/[0.04]`} />
            {group.items.map((h, ii) => (
              <motion.div
                key={ii}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: gi * 0.12 + ii * 0.07 }}
              >
                <Skeleton className={`h-${h} w-full bg-white/[0.025]`} />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 px-6 text-center select-none">
      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
        <BarChart2 className="w-5 h-5 text-zinc-700" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-zinc-500">Insights will appear here</p>
        <p className="text-[10px] text-zinc-700 max-w-[160px] leading-relaxed">
          Bottlenecks, risks, and suggestions after plan generation.
        </p>
      </div>
    </div>
  );
}

export function InsightsPanel({ plan, isLoading }: InsightsPanelProps) {
  if (isLoading) return <LoadingSkeleton />;
  if (!plan) return <EmptyState />;

  return (
    <div className="flex flex-col">
      {/* Bottlenecks */}
      <Section
        icon={AlertTriangle}
        title="Bottlenecks"
        count={plan.bottlenecks.length}
        accentColor="#ef4444"
      >
        {plan.bottlenecks.map((b, i) => {
          const s = SEVERITY_STYLES[b.severity];
          return (
            <InsightCard
              key={b.id}
              title={b.title}
              body={b.description}
              badge={b.severity}
              badgeClassName={`${s.bg} ${s.text} ${s.border}`}
              dotClassName={s.dot}
              index={i}
            >
              {b.affectedTasks && b.affectedTasks.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {b.affectedTasks.map((tid) => (
                    <span
                      key={tid}
                      className="font-code text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-600 border border-white/[0.06]"
                    >
                      {tid}
                    </span>
                  ))}
                </div>
              )}
            </InsightCard>
          );
        })}
      </Section>

      {/* Overload warnings */}
      {plan.overloadWarnings && plan.overloadWarnings.length > 0 && (
        <Section
          icon={Activity}
          title="Overload Warnings"
          count={plan.overloadWarnings.length}
          accentColor="#f59e0b"
        >
          {plan.overloadWarnings.map((w, i) => {
            const c = assigneeColor(w.person);
            return (
              <InsightCard
                key={w.person}
                title={w.person}
                body={w.message}
                index={i}
              >
                <div className="flex items-center gap-2 pt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  <div className="flex-1 h-1 rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-amber-500/60"
                      style={{ width: `${Math.min((w.allocatedHours / w.maxHours) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="font-code text-[9px] text-amber-400">
                    {w.allocatedHours}h / {w.maxHours}h
                  </span>
                </div>
              </InsightCard>
            );
          })}
        </Section>
      )}

      {/* Suggestions */}
      <Section
        icon={Lightbulb}
        title="Suggestions"
        count={plan.suggestions.length}
        accentColor="#6366f1"
      >
        {plan.suggestions.map((s, i) => {
          const cat = CATEGORY_STYLES[s.category] ?? { label: s.category, bg: "bg-zinc-800", text: "text-zinc-400" };
          return (
            <InsightCard
              key={s.id}
              title={s.title}
              body={s.body}
              badge={cat.label}
              badgeClassName={`${cat.bg} ${cat.text} border-transparent`}
              index={i}
            />
          );
        })}
      </Section>

      {/* Critical path */}
      <Section
        icon={GitCommit}
        title="Critical Path"
        count={plan.criticalPath.length}
        accentColor="#06b6d4"
        defaultOpen={false}
      >
        <div className="space-y-0 rounded-lg overflow-hidden border border-white/[0.06]">
          {plan.criticalPath.map((item, i) => (
            <motion.div
              key={item.taskId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 px-3 py-2.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex flex-col items-center shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {i < plan.criticalPath.length - 1 && (
                  <div className="w-px flex-1 bg-cyan-500/20 min-h-[16px] mt-0.5" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="font-code text-[10px] text-zinc-300 truncate">{item.taskTitle}</div>
                <div className="text-[10px] text-zinc-600 leading-relaxed">{item.reason}</div>
                <div className="font-code text-[9px] text-cyan-600">{item.phase}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Sparkles footer */}
      <div className="px-4 py-3 flex items-center gap-2 border-t border-white/[0.04]">
        <Sparkles className="w-3 h-3 text-zinc-700" />
        <span className="text-[10px] text-zinc-700">Generated by Gemini</span>
      </div>
    </div>
  );
}
