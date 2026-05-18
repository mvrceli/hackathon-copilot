"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, Zap } from "lucide-react";
import { PlanForm } from "@/components/form/PlanForm";
import type { FormData } from "@/types";

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export function LeftSidebar({ isOpen, onToggle, onSubmit, isLoading }: LeftSidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 300 : 52 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="relative shrink-0 flex flex-col overflow-hidden border-r border-white/[0.06] bg-white/[0.01]"
    >
      {/* Header bar */}
      <div className="flex items-center h-[41px] px-3 border-b border-white/[0.06] shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-3 h-3 text-indigo-400" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="font-code text-[11px] font-semibold text-zinc-200 tracking-wide whitespace-nowrap"
              >
                Hackathon Copilot
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onToggle}
          className="ml-auto shrink-0 w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen
            ? <PanelLeftClose className="w-3.5 h-3.5" />
            : <PanelLeftOpen className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* Form content — only visible when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, delay: 0.05 }}
            className="flex-1 overflow-y-auto min-w-[300px]"
          >
            <PlanForm onSubmit={onSubmit} isLoading={isLoading} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed icons */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="flex-1 flex flex-col items-center pt-4 gap-3"
          >
            <div className="w-1 h-8 rounded-full bg-white/[0.04]" />
            <div className="w-1 h-5 rounded-full bg-white/[0.04]" />
            <div className="w-1 h-10 rounded-full bg-white/[0.04]" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
