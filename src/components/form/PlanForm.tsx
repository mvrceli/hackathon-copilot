"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { Plus, Sparkles, Clock, Users, Lightbulb, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TeamMemberCard } from "./TeamMemberCard";
import type { FormData, TeamMemberDraft } from "@/types";

interface PlanFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-3 h-3 text-zinc-500" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

export function PlanForm({ onSubmit, isLoading }: PlanFormProps) {
  const [projectIdea, setProjectIdea] = useState("");
  const [timeframeHours, setTimeframeHours] = useState("");
  const [team, setTeam] = useState<TeamMemberDraft[]>([
    { id: nanoid(8), name: "", skillsRaw: "", preferredWork: "" },
  ]);

  function handleMemberChange(id: string, field: keyof TeamMemberDraft, value: string) {
    setTeam((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  }

  function handleAddMember() {
    if (team.length >= 10) return;
    setTeam((prev) => [
      ...prev,
      { id: nanoid(8), name: "", skillsRaw: "", preferredWork: "" },
    ]);
  }

  function handleRemoveMember(id: string) {
    setTeam((prev) => prev.filter((m) => m.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ projectIdea, timeframeHours, team });
  }

  const canSubmit = projectIdea.trim().length > 0 && timeframeHours.trim().length > 0 && !isLoading;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

        {/* Project Idea */}
        <div>
          <SectionLabel icon={Lightbulb} label="Project Idea" />
          <Textarea
            placeholder="Describe what you're building…"
            value={projectIdea}
            onChange={(e) => setProjectIdea(e.target.value)}
            className="resize-none text-xs bg-white/[0.03] border-white/[0.08] hover:border-white/[0.12] focus:border-indigo-500 min-h-[88px] leading-relaxed placeholder:text-zinc-700"
          />
          {projectIdea.length > 0 && (
            <div className="mt-1 text-right font-code text-[9px] text-zinc-700">
              {projectIdea.length} chars
            </div>
          )}
        </div>

        {/* Timeframe */}
        <div>
          <SectionLabel icon={Clock} label="Timeframe" />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="0"
              min={1}
              max={168}
              value={timeframeHours}
              onChange={(e) => setTimeframeHours(e.target.value)}
              className="h-8 text-sm bg-white/[0.03] border-white/[0.08] hover:border-white/[0.12] focus:border-indigo-500 font-code w-24 text-center"
            />
            <span className="text-xs text-zinc-500">hours</span>
            {timeframeHours && Number(timeframeHours) > 0 && (
              <span className="font-code text-[10px] text-zinc-600 ml-auto">
                ≈ {Math.round(Number(timeframeHours) / 8)}d
              </span>
            )}
          </div>
        </div>

        {/* Team */}
        <div>
          <SectionLabel icon={Users} label={`Team · ${team.length}`} />
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {team.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <TeamMemberCard
                    member={member}
                    index={index}
                    onChange={handleMemberChange}
                    onRemove={handleRemoveMember}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {team.length < 10 && (
              <button
                type="button"
                onClick={handleAddMember}
                className="w-full flex items-center justify-center gap-1.5 h-8 rounded-md border border-dashed border-white/[0.1] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.2] text-xs transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add person
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="px-4 py-3 border-t border-white/[0.06] shrink-0">
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full h-9 rounded-md flex items-center justify-center gap-2 text-xs font-semibold transition-all duration-200 ${
            canSubmit
              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
              : "bg-white/[0.04] text-zinc-600 cursor-not-allowed border border-white/[0.06]"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Generate Plan
            </>
          )}
        </button>
      </div>
    </form>
  );
}
