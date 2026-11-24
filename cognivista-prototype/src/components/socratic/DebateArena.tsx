"use client";

import React, { useState } from "react";
import { ShieldCheck, Flame, FileText, ArrowUpRight, Loader2, ArrowRight } from "lucide-react";
import type { KnowledgeCitation, SocraticResponse } from "@/lib/types";
import { useCognitive } from "@/components/providers/CognitiveProvider";

interface DebateArenaProps {
  data: SocraticResponse;
  answers: Record<number, string>;
  onAnswerChange: (level: number, val: string) => void;
  onSubmitSecondRound: () => void;
  loading: boolean;
}

export function DebateArena({
  data,
  answers,
  onAnswerChange,
  onSubmitSecondRound,
  loading,
}: DebateArenaProps) {
  const { openCitationDrawer } = useCognitive();
  const [stage, setStage] = useState<"debate" | "questions">("debate");
  const hasAnyReply = Object.values(answers).some((v) => v.trim().length > 0);

  return (
    <div className="space-y-8">
      {/* Segmented Switch：红蓝正反交锋 vs 苏格拉底三阶追问（彻底去拥挤） */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-tight">
            {stage === "debate" ? "红蓝正反对抗交锋" : "苏格拉底三阶追问与二轮修正"}
          </h2>
          <p className="text-[15px] text-[var(--text-secondary)] mt-1">
            {stage === "debate"
              ? "先通过仁慈原则强化你的合理内核，再直面最强反方魔鬼代言人质询"
              : "逐阶回应启发式追问并限定前提边界，提交复评检验逻辑严密性跃升"}
          </p>
        </div>

        <div className="inline-flex p-1.5 rounded-full apple-inset">
          <button
            type="button"
            onClick={() => setStage("debate")}
            className={`px-5 py-2.5 rounded-full text-[14px] font-medium transition apple-focus ${
              stage === "debate"
                ? "bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            红蓝正反交锋
          </button>
          <button
            type="button"
            onClick={() => setStage("questions")}
            className={`px-5 py-2.5 rounded-full text-[14px] font-medium transition apple-focus ${
              stage === "questions"
                ? "bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            三阶追问与重构 ({data.socraticQuestions.length})
          </button>
        </div>
      </div>

      {stage === "debate" ? (
        <div className="space-y-7">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
            {/* 左栏：正方强化 */}
            <div className="apple-card rounded-2xl p-7 sm:p-9 space-y-6">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--apple-blue) 12%, transparent)",
                    color: "var(--apple-blue)",
                  }}
                >
                  <ShieldCheck className="w-5 h-5" strokeWidth={1.9} />
                </div>
                <div>
                  <h3 className="text-[20px] font-semibold" style={{ color: "var(--apple-blue)" }}>
                    正方强化 · 合理内核
                  </h3>
                  <p className="text-[13.5px] text-[var(--text-secondary)]">
                    提炼你的核心洞见并补强高维学术支撑
                  </p>
                </div>
              </div>

              <div
                className="rounded-2xl p-5 border space-y-1.5"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--apple-blue) 6%, transparent)",
                  borderColor: "color-mix(in srgb, var(--apple-blue) 20%, transparent)",
                }}
              >
                <p className="text-[15.5px] leading-[1.8] text-[var(--text-primary)]">
                  {data.proSideReinforcement.coreKernel}
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                  学术级支撑论据
                </div>
                {data.proSideReinforcement.academicArguments.map((arg, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl apple-inset text-[15px] leading-[1.75] text-[var(--text-primary)]"
                  >
                    {arg}
                  </div>
                ))}
              </div>
            </div>

            {/* 右栏：反方质询 */}
            <div className="apple-card rounded-2xl p-7 sm:p-9 space-y-6">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--apple-red-vivid) 12%, transparent)",
                    color: "var(--apple-red)",
                  }}
                >
                  <Flame className="w-5 h-5" strokeWidth={1.9} />
                </div>
                <div>
                  <h3 className="text-[20px] font-semibold text-[var(--apple-red)]">
                    反方质询 · 魔鬼代言人
                  </h3>
                  <p className="text-[13.5px] text-[var(--text-secondary)]">
                    站在最强对立面进行反例与边界压力测试
                  </p>
                </div>
              </div>

              <div
                className="rounded-2xl p-5 border space-y-1.5"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--apple-red-vivid) 6%, transparent)",
                  borderColor: "color-mix(in srgb, var(--apple-red-vivid) 20%, transparent)",
                }}
              >
                <p className="text-[15.5px] leading-[1.8] text-[var(--text-primary)]">
                  {data.conSideChallenge.devilsAdvocateThesis}
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                  反例与反事实冲击
                </div>
                {data.conSideChallenge.counterExamples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl apple-inset text-[15px] leading-[1.75] text-[var(--text-primary)]"
                  >
                    {ex}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 底部引导条 + 引用切片 */}
          <div className="apple-card rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13.5px] text-[var(--text-secondary)] mr-1">
                理论溯源：
              </span>
              {data.citations.map((cit: KnowledgeCitation) => (
                <button
                  key={cit.chunkId}
                  type="button"
                  onClick={() => openCitationDrawer(cit, data.citations)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium bg-[#34C759]/10 hover:bg-[#34C759]/18 text-[var(--apple-green)] transition apple-focus"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{cit.discipline}</span>
                  <span className="font-mono font-semibold">[{cit.chunkId}]</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStage("questions")}
              style={{ backgroundColor: "var(--apple-blue)" }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14.5px] font-medium text-white shadow-sm hover:brightness-110 transition apple-focus active:scale-[0.98]"
            >
              <span>进入三阶追问与二轮重构</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* 三阶苏格拉底追问宽敞卡片区 */
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {data.socraticQuestions.map((q) => {
              const levelLabel =
                q.level === 1
                  ? "第 1 阶 · 概念澄清"
                  : q.level === 2
                  ? "第 2 阶 · 隐含前提挑战"
                  : "第 3 阶 · 极端边界与后果推演";
              return (
                <div
                  key={q.level}
                  className="apple-card rounded-2xl p-7 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                >
                  <div className="lg:col-span-6 space-y-3">
                    <span
                      className="inline-block text-[13px] font-mono font-semibold px-3.5 py-1 rounded-full"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--apple-indigo) 12%, transparent)",
                        color: "var(--apple-indigo)",
                      }}
                    >
                      {levelLabel}
                    </span>
                    <p className="text-[18px] sm:text-[19px] font-serif leading-[1.7] text-[var(--text-primary)]">
                      “{q.question}”
                    </p>
                    <p className="text-[14px] text-[var(--text-secondary)]">
                      切入提示：{q.intentHint}
                    </p>
                  </div>

                  <div className="lg:col-span-6">
                    <textarea
                      rows={4}
                      value={answers[q.level] || ""}
                      onChange={(e) => onAnswerChange(q.level, e.target.value)}
                      placeholder="在此回应并修正你的观点边界（例如限定适用前提或补充反例条件）..."
                      className="w-full rounded-2xl apple-input p-4 text-[15px] leading-relaxed resize-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="apple-card rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
            <span className="text-[14.5px] text-[var(--text-secondary)]">
              至少回应以上任意 1 个追问，即可发起二轮逻辑严密性对比复评。
            </span>
            <button
              type="button"
              onClick={onSubmitSecondRound}
              disabled={loading || !hasAnyReply}
              style={{ backgroundColor: "var(--apple-blue)" }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-medium text-white shadow-sm hover:brightness-110 disabled:opacity-45 transition apple-focus active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>二轮逻辑重估中...</span>
                </>
              ) : (
                <>
                  <span>提交修正后观点（二轮思辨）</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
