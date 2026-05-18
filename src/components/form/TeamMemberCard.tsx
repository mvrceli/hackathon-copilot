"use client";

import { X, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { assigneeColor } from "@/lib/utils";
import type { TeamMemberDraft } from "@/types";

interface TeamMemberCardProps {
  member: TeamMemberDraft;
  index: number;
  onChange: (id: string, field: keyof TeamMemberDraft, value: string) => void;
  onRemove: (id: string) => void;
}

export function TeamMemberCard({ member, index, onChange, onRemove }: TeamMemberCardProps) {
  const color = member.name ? assigneeColor(member.name) : null;

  return (
    <div className="glass rounded-lg p-3 space-y-2.5 group">
      <div className="flex items-center gap-2">
        <GripVertical className="w-3 h-3 text-zinc-700 shrink-0" />

        {/* Avatar dot */}
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors ${
            color
              ? `${color.bg} ${color.text} border ${color.border}`
              : "bg-zinc-800 text-zinc-600 border border-zinc-700"
          }`}
        >
          {member.name ? member.name[0]?.toUpperCase() : (index + 1)}
        </div>

        <Input
          placeholder={`Person ${index + 1}`}
          value={member.name}
          onChange={(e) => onChange(member.id, "name", e.target.value)}
          className="h-6 text-xs bg-transparent border-transparent hover:border-white/[0.1] focus:border-indigo-500 px-1.5 font-medium flex-1"
        />

        <button
          onClick={() => onRemove(member.id)}
          className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-zinc-700 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-1.5 pl-5">
        <div>
          <label className="block text-[9px] uppercase tracking-wider text-zinc-600 mb-1 font-medium">
            Skills
          </label>
          <Input
            placeholder="React, Node.js, Python…"
            value={member.skillsRaw}
            onChange={(e) => onChange(member.id, "skillsRaw", e.target.value)}
            className="h-6 text-xs bg-transparent border-white/[0.06] hover:border-white/[0.1] focus:border-indigo-500 px-2 font-code"
          />
        </div>
        <div>
          <label className="block text-[9px] uppercase tracking-wider text-zinc-600 mb-1 font-medium">
            Preferred Work
          </label>
          <Input
            placeholder="Frontend, architecture, docs…"
            value={member.preferredWork}
            onChange={(e) => onChange(member.id, "preferredWork", e.target.value)}
            className="h-6 text-xs bg-transparent border-white/[0.06] hover:border-white/[0.1] focus:border-indigo-500 px-2"
          />
        </div>
      </div>
    </div>
  );
}
