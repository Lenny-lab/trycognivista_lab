"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, FileText, Layers } from "lucide-react";
import type { DisciplinePerspective, KnowledgeCitation } from "@/lib/types";
import { useCognitive } from "@/components/providers/CognitiveProvider";
import { cn } from "@/lib/utils";

const DISCIPLINE_DOT_COLORS: Record<string, string> = {
  indigo: "var(--apple-indigo)",
  cyan: "var(--apple-teal)",
  emerald: "var(--apple-green-vivid)",
  amber: "var(--apple-orange-vivid)",
  rose: "var(--apple-red-vivid)",
  violet: "var(--apple-purple)",
};

interface DisciplineCardProps {
  perspective: DisciplinePerspective;
  index: number;
  highlighted: boolean;
  allCitations: KnowledgeCitation[];
  featured?: boolean;
}

export function DisciplineCard({
  perspective,
  index,
  highlighted,
  allCitations,
  featured = false,
}: DisciplineCardProps) {
  const { openCitationDrawer } = useCognitive();
  const dotColor = DISCIPLINE_DOT_COLORS[perspective.colorToken] || "var(--apple-blue)";

  const matchedCitations = perspective.citationIds
    .map((id) => allCitations.find((c) => c.chunkId === id))
    .filter((c): c is KnowledgeCitation => Boolean(c));

  const displayCitations =
    matchedCitations.length > 0
      ? matchedCitations
      : allCitations.filter((c) => c.discipline === perspective.discipline).slice(0, 1);

  return (
    <motion.article
      id={`discipline-card-${perspective.discipline}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 32, delay: featured ? 0 : index * 0.04 }}
      className={cn(
        "apple-card apple-card-interactive rounded-2xl p-7 sm:p-8 flex flex-col gap-5",
        highlighted && !featured && "ring-2 ring-[var(--apple-blue)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
          />
          <h3 className="text-[20px] sm:text-[22px] font-semibold tracking-tight">
            {perspective.discipline}
          </h3>
        </div>
        <span className="text-[13px] font-mono text-[var(--text-tertiary)] tabular-nums">
          PERSPECTIVE 0{index + 1}
        </span>
      </div>

      {/* 深度剖析正文（大字号、舒适行距作为视觉主角） */}
      <p className="text-[15.5px] sm:text-[16px] leading-[1.8] text-[var(--text-primary)]">
        {perspective.insightSummary}
      </p>

      {/* 核心假设 & 分析框架（简洁双栏，不再层层叠盒） */}
      <div
        className={cn(
          "grid gap-4 pt-2 border-t border-[var(--border-hairline)]",
          featured ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
        )}
      >
        <div className="space-y-1">
          <div className="text-[13px] font-semibold text-[var(--text-tertiary)]">
            底层核心假设
          </div>
          <p className="text-[14.5px] leading-relaxed text-[var(--text-secondary)]">
            {perspective.coreAssumption}
          </p>
        </div>

        <div className="space-y-1">
          <div className="text-[13px] font-semibold text-[var(--text-tertiary)] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" style={{ color: "var(--apple-blue)" }} />
            <span>关键分析框架</span>
          </div>
          <p className="text-[14.5px] font-medium leading-relaxed text-[var(--text-primary)]">
            {perspective.analyticalFramework}
          </p>
        </div>
      </div>

      {/* 视角盲区警示 */}
      <div className="rounded-2xl p-4 bg-[#FF9500]/10 border border-[#FF9500]/22 flex items-start gap-3">
        <AlertTriangle
          className="w-5 h-5 shrink-0 mt-0.5"
          style={{ color: "var(--apple-orange)" }}
          strokeWidth={1.85}
        />
        <div className="text-[14px] leading-relaxed text-[var(--text-primary)]">
          <span className="font-semibold" style={{ color: "var(--apple-orange)" }}>
            单一视角盲区警示：
          </span>
          {perspective.blindSpotWarning}
        </div>
      </div>

      {/* 知识库原文溯源徽章 */}
      <div className="pt-2 flex flex-wrap items-center gap-2">
        {displayCitations.length > 0 ? (
          displayCitations.map((cit) => (
            <button
              key={cit.chunkId}
              type="button"
              onClick={() => openCitationDrawer(cit, allCitations)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-medium bg-[#34C759]/10 hover:bg-[#34C759]/18 text-[var(--apple-green)] transition cursor-pointer apple-focus active:scale-[0.98]"
              title="点击打开知识库原文溯源"
            >
              <FileText className="w-3.5 h-3.5" strokeWidth={1.9} />
              <span className="truncate max-w-[210px]">{cit.docTitle}</span>
              <span className="font-mono font-semibold">[{cit.chunkId}]</span>
            </button>
          ))
        ) : (
          <span className="text-[13px] text-[var(--text-tertiary)]">
            基于跨学科通用理论框架推导
          </span>
        )}
      </div>
    </motion.article>
  );
}
