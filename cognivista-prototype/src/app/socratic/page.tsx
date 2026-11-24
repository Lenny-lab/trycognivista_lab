"use client";

import React, { useEffect, useState } from "react";
import { ArrowDown, Scale, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import type { SocraticResponse } from "@/lib/types";
import { SOCRATIC_PRESET_THESES } from "@/data/preset-topics";
import { useCognitive } from "@/components/providers/CognitiveProvider";
import { RigorGauge } from "@/components/socratic/RigorGauge";
import { ReasoningDrawer } from "@/components/socratic/ReasoningDrawer";
import { DebateArena } from "@/components/socratic/DebateArena";

export default function SocraticPage() {
  const { apiKey, recordSocraticAttempt } = useCognitive();
  const [thesis, setThesis] = useState<string>(SOCRATIC_PRESET_THESES[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<SocraticResponse | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const runDebate = async (
    targetThesis: string,
    prevContext?: string,
    keepPrevScore = false
  ) => {
    const trimmed = targetThesis.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    if (!keepPrevScore) {
      setPreviousScore(null);
    } else if (data) {
      setPreviousScore(data.rigorScore);
    }

    try {
      const res = await fetch("/api/cognitive/socratic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-deepseek-key": apiKey } : {}),
        },
        body: JSON.stringify({
          thesis: trimmed,
          previousRoundContext: prevContext,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "思辨引擎响应失败");
        return;
      }
      const typed = json as SocraticResponse;
      setData(typed);
      setAnswers({});
      recordSocraticAttempt(typed.rigorScore, trimmed);
    } catch {
      setError("网络请求失败，请检查服务运行状态。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/cognitive/socratic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thesis: SOCRATIC_PRESET_THESES[0], instantDemo: true }),
    })
      .then((r) => r.json())
      .then((json) => setData(json as SocraticResponse))
      .catch(() => {});
  }, []);

  const handleSubmitSecondRound = () => {
    const repliesText = Object.entries(answers)
      .filter(([, v]) => v.trim().length > 0)
      .map(([level, v]) => `回应第${level}问: ${v.trim()}`)
      .join("\n");
    if (!repliesText) return;
    const revisedThesis = `${thesis}\n\n【补充修正与边界限定】\n${repliesText}`;
    setThesis(revisedThesis);
    runDebate(
      revisedThesis,
      `首轮逻辑严密性评分：${data?.rigorScore ?? 0} 分。学生已针对苏格拉底追问进行了修正回应。`,
      true
    );
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Zone 1: Centered Hero + Calm Thesis Composer */}
      <section className="max-w-4xl mx-auto min-h-[calc(100svh-120px)] flex flex-col justify-between pb-2">
        <div className="h-2 shrink-0" aria-hidden="true" />
        <div className="space-y-7">
          <div className="text-center space-y-4">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold tracking-wide"
              style={{
                backgroundColor: "color-mix(in srgb, var(--apple-indigo) 10%, transparent)",
                color: "var(--apple-indigo)",
              }}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>苏格拉底理性思辨场</span>
            </div>

            <h1 className="text-[36px] sm:text-[46px] lg:text-[52px] font-semibold tracking-[-0.03em] leading-[1.12]">
              用反驳与追问，
              <br className="hidden sm:inline" />
              检验你的论证逻辑。
            </h1>

            <p className="text-[16px] sm:text-[18px] text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
              输入你的核心观点，系统会拆解隐含前提、指出逻辑漏洞，并给出反方质疑与追问。
            </p>
          </div>

        <div className="apple-card rounded-2xl p-6 sm:p-8 space-y-5">
          <textarea
            rows={4}
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            placeholder="请输入你的核心观点与论证依据..."
            className="w-full rounded-2xl apple-input p-5 text-[16px] leading-[1.75]"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {SOCRATIC_PRESET_THESES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setThesis(preset);
                    runDebate(preset);
                  }}
                  className="text-[13px] font-medium px-3.5 py-2 rounded-xl apple-inset hover:bg-[var(--bg-inset-hover)] transition max-w-[200px] truncate apple-focus"
                  title={preset}
                >
                  预设 {idx + 1}：{preset.slice(0, 10)}…
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5 shrink-0 ml-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium bg-[#34C759]/10 text-[var(--apple-green)]">
                <ShieldCheck className="w-4 h-4" />
                <span>防代写护栏</span>
              </span>
              <button
                type="button"
                onClick={() => runDebate(thesis)}
                disabled={loading}
                style={{ backgroundColor: "var(--apple-indigo)" }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14.5px] font-medium text-white shadow-sm hover:brightness-110 disabled:opacity-60 transition apple-focus active:scale-[0.98]"
              >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>正在分析逻辑...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>开始逻辑分析</span>
                </>
              )}
            </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/25 px-5 py-3 text-[14px] text-[var(--apple-red)]">
              {error}
            </div>
          )}
        </div>
        </div>

        <button
          type="button"
          onClick={() =>
            document.getElementById("socratic-results")?.scrollIntoView({ behavior: "smooth" })
          }
          className="hero-scroll mx-auto mt-6 cursor-pointer transition-opacity hover:opacity-80"
        >
          <span>查看逻辑诊断结果</span>
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" strokeWidth={1.5} />
        </button>
      </section>

      {data && (
        <div id="socratic-results" className="space-y-10 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-tight">
              论证逻辑诊断
            </h2>
            <span className="text-[13.5px] font-mono px-3.5 py-1.5 rounded-full apple-inset text-[var(--text-secondary)]">
              {data.usedModel}
            </span>
          </div>

          <RigorGauge
            rigorScore={data.rigorScore}
            previousScore={previousScore}
            subScores={data.subScores}
            fallacies={data.fallacies}
          />

          <ReasoningDrawer reasoningProcess={data.reasoningProcess} />

          <DebateArena
            data={data}
            answers={answers}
            onAnswerChange={(level, val) =>
              setAnswers((prev) => ({ ...prev, [level]: val }))
            }
            onSubmitSecondRound={handleSubmitSecondRound}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
