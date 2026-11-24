"use client";

import React from "react";
import { SlidersHorizontal, Sparkles, Loader2 } from "lucide-react";
import type { DecisionWeights } from "@/lib/types";

interface WeightSlidersProps {
  weights: DecisionWeights;
  onWeightsChange: (w: DecisionWeights) => void;
  onRunSimulation: () => void;
  loading: boolean;
}

const SLIDER_META: Array<{
  key: keyof DecisionWeights;
  label: string;
  desc: string;
}> = [
  { key: "longTermCeiling", label: "长期发展上限", desc: "5~10 年视野下的成长空间与不可替代壁垒" },
  { key: "shortTermCertainty", label: "短期确定收益", desc: "1 年内可见的经济回报与路径确定性" },
  { key: "riskResilience", label: "抗风险韧性", desc: "极端环境波动下的容错与退路保障" },
  { key: "costEfficiency", label: "试错与性价比", desc: "时间机会成本与沉没成本可控程度" },
  { key: "passionAlignment", label: "内驱兴趣匹配", desc: "与个人天赋及长期价值观的自洽度" },
];

export function WeightSliders({
  weights,
  onWeightsChange,
  onRunSimulation,
  loading,
}: WeightSlidersProps) {
  const totalWeight =
    Object.values(weights).reduce((acc, val) => acc + val, 0) || 1;

  return (
    <div className="apple-card rounded-2xl p-7 sm:p-9 space-y-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: "color-mix(in srgb, var(--apple-orange-vivid) 14%, transparent)",
              color: "var(--apple-orange)",
            }}
          >
            <SlidersHorizontal className="w-5 h-5" strokeWidth={1.9} />
          </div>
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight">主观价值权重</h2>
            <p className="text-[13.5px] text-[var(--text-secondary)]">
              拖动滑块即时重算右侧排名与雷达态势
            </p>
          </div>
        </div>
      </div>

      {/* 5 维宽敞权重滑块 */}
      <div className="space-y-6">
        {SLIDER_META.map((item) => {
          const val = weights[item.key];
          const pct = ((val / totalWeight) * 100).toFixed(0);
          return (
            <div key={item.key} className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[16px] font-semibold">{item.label}</span>
                <span className="font-mono font-semibold text-[16px] tabular-nums" style={{ color: "var(--apple-blue)" }}>
                  {pct}%
                  <span className="text-[13px] font-normal text-[var(--text-tertiary)] ml-1.5">
                    ({val}/100)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={val}
                onChange={(e) =>
                  onWeightsChange({
                    ...weights,
                    [item.key]: Number(e.target.value),
                  })
                }
                aria-label={item.label}
                className="w-full apple-slider"
                style={{
                  background: `linear-gradient(to right, var(--apple-blue) 0%, var(--apple-blue) ${val}%, var(--bg-inset-hover) ${val}%, var(--bg-inset-hover) 100%)`,
                }}
              />
              <div className="text-[13px] text-[var(--text-secondary)]">{item.desc}</div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onRunSimulation}
        disabled={loading}
        style={{ backgroundColor: "var(--apple-blue)" }}
        className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full text-[15px] font-medium text-white shadow-sm hover:brightness-110 disabled:opacity-60 transition apple-focus active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>正在生成评估结果...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>重新计算评估结果</span>
          </>
        )}
      </button>
    </div>
  );
}
