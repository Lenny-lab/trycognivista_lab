"use client";

import React, { useState } from "react";
import { AlertOctagon, TrendingUp, CheckCircle2, Quote } from "lucide-react";
import type { LogicalFallacyItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RigorGaugeProps {
  rigorScore: number;
  previousScore: number | null;
  subScores: {
    evidenceStrength: number;
    logicalConsistency: number;
    premiseTransparency: number;
  };
  fallacies: LogicalFallacyItem[];
}

export function RigorGauge({
  rigorScore,
  previousScore,
  subScores,
  fallacies,
}: RigorGaugeProps) {
  const [activeFallacyIdx, setActiveFallacyIdx] = useState<number>(0);

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (rigorScore / 100) * circumference;

  const scoreColor =
    rigorScore >= 80
      ? "var(--apple-green-vivid)"
      : rigorScore >= 60
      ? "var(--apple-blue)"
      : "var(--apple-orange-vivid)";

  const delta = previousScore !== null ? rigorScore - previousScore : null;
  const selectedFallacy = fallacies[activeFallacyIdx] || fallacies[0] || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
      {/* 左侧：大气的逻辑严密性圆环与三项指标 */}
      <div className="lg:col-span-5 apple-card rounded-2xl p-7 sm:p-8 flex flex-col sm:flex-row items-center gap-7">
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg className="w-44 h-44 -rotate-90" viewBox="0 0 156 156">
            <circle
              cx={78}
              cy={78}
              r={radius}
              stroke="var(--bg-inset-hover)"
              strokeWidth={12}
              fill="none"
            />
            <circle
              cx={78}
              cy={78}
              r={radius}
              stroke={scoreColor}
              strokeWidth={12}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[12.5px] font-medium text-[var(--text-secondary)]">
              逻辑严密性
            </span>
            <span
              className="text-[44px] font-semibold font-mono tabular-nums tracking-tight leading-none mt-1"
              style={{ color: scoreColor }}
            >
              {rigorScore}
            </span>
            {delta !== null && delta !== 0 && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[12.5px] font-mono font-semibold px-2.5 py-0.5 rounded-full mt-1.5",
                  delta > 0
                    ? "bg-[#34C759]/12 text-[var(--apple-green)]"
                    : "bg-[#FF3B30]/12 text-[var(--apple-red)]"
                )}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {delta > 0 ? `+${delta}` : delta}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 w-full space-y-4">
          <SubScoreBar
            label="论据充分性"
            value={subScores.evidenceStrength}
            color="var(--apple-blue)"
          />
          <SubScoreBar
            label="推理一致性"
            value={subScores.logicalConsistency}
            color="var(--apple-indigo)"
          />
          <SubScoreBar
            label="前提透明度"
            value={subScores.premiseTransparency}
            color="var(--apple-green-vivid)"
          />
        </div>
      </div>

      {/* 右侧：认知偏差与谬误诊断 */}
      <div className="lg:col-span-7 apple-card rounded-2xl p-7 sm:p-8 flex flex-col justify-between gap-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertOctagon className="w-5 h-5 text-[var(--apple-red)]" strokeWidth={1.9} />
              <h3 className="text-[19px] font-semibold tracking-tight">
                认知偏差与逻辑谬误诊断
              </h3>
            </div>
            <span className="text-[13px] text-[var(--text-tertiary)]">
              点选标签查看原句定位
            </span>
          </div>

          {fallacies.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {fallacies.map((f, idx) => {
                const isSelected = idx === activeFallacyIdx;
                const toneStyle =
                  f.severity === "high"
                    ? "bg-[#FF3B30]/10 border-[#FF3B30]/30 text-[var(--apple-red)]"
                    : f.severity === "medium"
                    ? "bg-[#FF9500]/12 border-[#FF9500]/30 text-[var(--apple-orange)]"
                    : "bg-[#0071E3]/10 border-[#0071E3]/25 text-[var(--apple-blue)]";
                return (
                  <button
                    key={`${f.name}-${idx}`}
                    type="button"
                    onClick={() => setActiveFallacyIdx(idx)}
                    className={cn(
                      "px-4 py-2 rounded-full text-[13.5px] font-medium border transition apple-focus",
                      toneStyle,
                      isSelected ? "ring-2 ring-[var(--apple-blue)]/45 font-semibold" : "opacity-85 hover:opacity-100"
                    )}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-[14.5px] text-[var(--apple-green)] bg-[#34C759]/10 px-4 py-2.5 rounded-2xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>未检测到显著形式谬误，论证边界清晰稳健。</span>
            </div>
          )}
        </div>

        {selectedFallacy && (
          <div className="rounded-2xl p-5 apple-inset space-y-2.5">
            <div className="flex items-start gap-2.5 text-[15px] text-[var(--apple-red)]">
              <Quote className="w-4 h-4 shrink-0 mt-1 opacity-80" />
              <span className="font-serif italic leading-relaxed">
                “{selectedFallacy.quoteFromUser}”
              </span>
            </div>
            <p className="text-[14.5px] leading-[1.75] text-[var(--text-secondary)]">
              {selectedFallacy.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SubScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[14.5px]">
        <span className="text-[var(--text-secondary)] font-medium">{label}</span>
        <span className="font-mono font-semibold tabular-nums">{value}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.1] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
