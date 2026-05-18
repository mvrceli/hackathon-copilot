"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  title: string;
  body: string;
  badge?: string;
  badgeClassName?: string;
  dotClassName?: string;
  index?: number;
  children?: React.ReactNode;
}

export function InsightCard({
  title,
  body,
  badge,
  badgeClassName,
  dotClassName,
  index = 0,
  children,
}: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.06 }}
      className="glass rounded-lg p-3 space-y-2 hover:border-white/[0.12] transition-colors"
    >
      <div className="flex items-start gap-2">
        {dotClassName && (
          <div className={cn("w-1.5 h-1.5 rounded-full mt-1 shrink-0", dotClassName)} />
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-zinc-200 leading-none">{title}</span>
            {badge && (
              <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider border", badgeClassName)}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">{body}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}
