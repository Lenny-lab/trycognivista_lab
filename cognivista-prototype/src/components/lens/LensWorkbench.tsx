"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Database, Loader2, Search } from "lucide-react";
import type { LensResponse } from "@/lib/types";
import { LENS_QUICK_TOPICS } from "@/data/preset-topics";
import { useCognitive } from "@/components/providers/CognitiveProvider";
import { GalaxyGraph } from "@/components/lens/GalaxyGraph";
import { DisciplineCard } from "@/components/lens/DisciplineCard";

export function LensWorkbench() {
  const { apiKey, recordExploredDisciplines } = useCognitive();
  const [topic, setTopic] = useState<string>(LENS_QUICK_TOPICS[0]);
  const [enableRag, setEnableRag] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<LensResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"galaxy" | "matrix">("galaxy");

  const runAnalysis = async (targetTopic: string, recordProgress = true, instantDemo = false) => {
    const trimmed = targetTopic.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cognitive/lens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-deepseek-key": apiKey } : {}),
        },
        body: JSON.stringify({ topic: trimmed, enableRag, instantDemo }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "推演请求失败");
        return;
      }
      const typed = json as LensResponse;
      setData(typed);
      setSelectedDiscipline(typed.perspectives[0]?.discipline ?? null);
      if (recordProgress && Array.isArray(typed.perspectives)) {
        recordExploredDisciplines(typed.perspectives.map((p) => p.discipline));
      }
    } catch {
      setError("网络请求异常，请检查服务运行状态。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis(LENS_QUICK_TOPICS[0], false, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activePerspectiveIndex = Math.max(
    0,
    data?.perspectives.findIndex((p) => p.discipline === selectedDiscipline) ?? 0
  );
  const activePerspective = data?.perspectives[activePerspectiveIndex] ?? null;

  return (
    <div className="bg-[var(--bg-canvas)]">
      <section className="lens-hero">
        <div className="hero-aurora" />
        <div className="hero-orbit" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-64px)] max-w-[1220px] flex-col items-center justify-between px-5 pt-10 pb-8 text-center sm:px-8 sm:pt-12 sm:pb-10">
          <div className="h-2 shrink-0" aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full flex-col items-center"
          >
            <div className="hero-kicker">跨学科认知透镜</div>

            <h1 className="hero-title mt-6 sm:mt-8">
              <span className="block">多学科视角，</span>
              <span className="hero-title-gradient mt-2 block pb-2 sm:mt-3">看清复杂议题。</span>
            </h1>

            <p className="mt-5 max-w-[650px] text-[16px] leading-[1.75] text-[var(--text-secondary)] sm:mt-6 sm:text-[18px] sm:leading-[1.65]">
              输入一个问题，从六个学科维度拆解核心假设、张力与盲区。
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                runAnalysis(topic, true);
              }}
              className="hero-search mt-10 w-full max-w-[780px] sm:mt-12"
            >
              <Search className="h-5 w-5 shrink-0 text-[var(--text-tertiary)]" strokeWidth={1.8} />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="输入你想探讨的议题，例如：生成式 AI 对大学教育的影响"
                aria-label="输入认知透镜分析议题"
              />
              <button type="submit" disabled={loading} className="hero-submit">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>解构中</span>
                  </>
                ) : (
                  <>
                    <span>开始探索</span>
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-x-1 gap-y-2">
              {LENS_QUICK_TOPICS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  data-active={topic === preset}
                  onClick={() => {
                    setTopic(preset);
                    runAnalysis(preset, true);
                  }}
                  className="hero-topic"
                >
                  {preset}
                </button>
              ))}

              <span className="mx-2 hidden h-3 w-px bg-[var(--border-strong)] sm:inline-block" />
              <label className="hero-rag cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableRag}
                  onChange={(e) => setEnableRag(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#0a84ff]"
                />
                <Database className="h-3.5 w-3.5 text-[var(--apple-blue)]" />
                <span>RAG 原文溯源</span>
              </label>
            </div>

            {error && (
              <div className="mt-5 max-w-2xl rounded-2xl border border-[#ff453a]/25 bg-[#ff453a]/10 px-5 py-3 text-[14px] text-[#ff6961]">
                {error}
              </div>
            )}
          </motion.div>

          <motion.button
            type="button"
            onClick={() =>
              document.getElementById("lens-results")?.scrollIntoView({ behavior: "smooth" })
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="hero-scroll mt-8 cursor-pointer transition-opacity hover:opacity-80"
          >
            <span>查看分析结果</span>
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" strokeWidth={1.5} />
          </motion.button>
        </div>
      </section>

      {data && (
        <div id="lens-results" className="mx-auto max-w-[1240px] space-y-12 px-5 py-12 sm:space-y-14 sm:px-8 sm:py-16 lg:px-10">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="synthesis-card p-7 sm:p-10 lg:p-11"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] font-semibold tracking-[0.08em] text-[var(--apple-blue)]">
                综合洞察
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
              <p className="text-[19px] font-medium leading-[1.75] tracking-[-0.015em] text-[var(--text-primary)] sm:text-[22px] lg:col-span-8 lg:text-[23px]">
                {data.coreSynthesis}
              </p>

              <div className="grid grid-cols-3 gap-3 lg:col-span-4 lg:grid-cols-1">
                <div className="apple-inset flex items-center justify-between rounded-xl px-4 py-3.5">
                  <div className="text-[14px] font-medium text-[var(--text-secondary)]">学科视角</div>
                  <div className="text-[24px] font-semibold tracking-tight text-[var(--text-primary)] tabular-nums sm:text-[26px]">
                    {String(data.perspectives.length).padStart(2, "0")}
                  </div>
                </div>
                <div className="apple-inset flex items-center justify-between rounded-xl px-4 py-3.5">
                  <div className="text-[14px] font-medium text-[var(--text-secondary)]">认知连接</div>
                  <div className="text-[24px] font-semibold tracking-tight text-[var(--text-primary)] tabular-nums sm:text-[26px]">
                    {String(data.relations.length).padStart(2, "0")}
                  </div>
                </div>
                <div className="apple-inset flex items-center justify-between rounded-xl px-4 py-3.5">
                  <div className="text-[14px] font-medium text-[var(--text-secondary)]">原文溯源</div>
                  <div className="text-[24px] font-semibold tracking-tight text-[var(--text-primary)] tabular-nums sm:text-[26px]">
                    {String(data.citations.length).padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <section className="space-y-8 sm:space-y-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="metric-label">视角工作台</div>
                <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] sm:text-[36px]">
                  多学科对比分析
                </h2>
                <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)] sm:text-[16px]">
                  在关系图谱中查看学科间的协同与张力，或切换为并列矩阵视图。
                </p>
              </div>

              <div className="apple-inset inline-flex rounded-full p-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode("galaxy")}
                  className={`rounded-full px-4 py-2.5 text-[13px] font-medium transition apple-focus sm:px-5 sm:text-[14px] ${
                    viewMode === "galaxy"
                      ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  星系探索
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("matrix")}
                  className={`rounded-full px-4 py-2.5 text-[13px] font-medium transition apple-focus sm:px-5 sm:text-[14px] ${
                    viewMode === "matrix"
                      ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  六维矩阵 · {data.perspectives.length}
                </button>
              </div>
            </div>

            {viewMode === "galaxy" ? (
              <div className="space-y-10">
                <GalaxyGraph
                  topic={data.topic}
                  perspectives={data.perspectives}
                  relations={data.relations}
                  selectedDiscipline={selectedDiscipline}
                  onSelectDiscipline={(disc) => setSelectedDiscipline(disc)}
                />

                {activePerspective && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="metric-label">学科深读</div>
                        <h3 className="mt-2 text-[22px] font-semibold tracking-tight">聚焦学科深读</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.perspectives.map((p) => {
                          const isCurrent = p.discipline === activePerspective.discipline;
                          return (
                            <button
                              key={p.discipline}
                              type="button"
                              onClick={() => setSelectedDiscipline(p.discipline)}
                              className={`rounded-full px-4 py-2 text-[13px] font-medium transition apple-focus ${
                                isCurrent
                                  ? "bg-[var(--apple-blue)] text-white shadow-sm"
                                  : "apple-inset text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                              }`}
                            >
                              {p.discipline}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <DisciplineCard
                      perspective={activePerspective}
                      index={activePerspectiveIndex}
                      highlighted={true}
                      allCitations={data.citations}
                      featured={true}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
                {data.perspectives.map((p, idx) => (
                  <DisciplineCard
                    key={`${p.discipline}-${idx}`}
                    perspective={p}
                    index={idx}
                    highlighted={selectedDiscipline === p.discipline}
                    allCitations={data.citations}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
