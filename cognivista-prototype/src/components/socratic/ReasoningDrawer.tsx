"use client";

import React, { useState } from "react";
import { BrainCircuit, ChevronDown, ChevronUp } from "lucide-react";

export function ReasoningDrawer({ reasoningProcess }: { reasoningProcess?: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!reasoningProcess) return null;

  return (
    <div className="apple-card rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-7 py-5 flex items-center justify-between gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition text-left apple-focus"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: "color-mix(in srgb, var(--apple-indigo) 12%, transparent)",
              color: "var(--apple-indigo)",
            }}
          >
            <BrainCircuit className="w-5 h-5" strokeWidth={1.85} />
          </div>
          <div>
            <div className="text-[16px] font-semibold flex items-center gap-2.5 flex-wrap">
              <span>DeepSeek-R1 深度审视思维链</span>
              <span className="text-[12px] font-mono px-2.5 py-0.5 rounded-full apple-inset text-[var(--text-secondary)]">
                reasoning_content
              </span>
            </div>
            <div className="text-[14px] text-[var(--text-secondary)] mt-0.5">
              点击展开模型拆解隐含前提与谬误诊断的透明推理过程
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-[var(--text-tertiary)] shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)] shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-7 pb-6 pt-2 border-t border-[var(--border-hairline)]">
          <pre className="whitespace-pre-wrap font-mono text-[13.5px] leading-[1.8] text-[var(--text-primary)] apple-inset p-5 rounded-2xl max-h-80 overflow-y-auto mt-3">
            {reasoningProcess}
          </pre>
        </div>
      )}
    </div>
  );
}
