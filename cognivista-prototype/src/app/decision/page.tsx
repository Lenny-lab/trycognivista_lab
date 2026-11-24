"use client";

import React, { useEffect, useState } from "react";
import { Compass, PencilLine, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { DecisionResponse, DecisionWeights } from "@/lib/types";
import { DECISION_TEMPLATES } from "@/data/preset-topics";
import { useCognitive } from "@/components/providers/CognitiveProvider";
import { WeightSliders } from "@/components/decision/WeightSliders";
import { DecisionCharts } from "@/components/decision/DecisionCharts";

export default function DecisionPage() {
  const { apiKey, recordDecisionAttempt } = useCognitive();
  const initialTemplate = DECISION_TEMPLATES[0];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplate.id);
  const [dilemma, setDilemma] = useState<string>(initialTemplate.dilemma);
  const [options, setOptions] = useState<string[]>(initialTemplate.options);
  const [weights, setWeights] = useState<DecisionWeights>(initialTemplate.defaultWeights);
  const [customEditorOpen, setCustomEditorOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DecisionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async (
    targetDilemma: string,
    targetOptions: string[],
    targetWeights: DecisionWeights,
    recordProgress = true,
    instantDemo = false
  ) => {
    const cleanOpts = targetOptions.map((o) => o.trim()).filter(Boolean);
    if (cleanOpts.length < 2) {
      setError("请至少保留 2 个有效的备选方案。");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cognitive/decision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-deepseek-key": apiKey } : {}),
        },
        body: JSON.stringify({
          dilemma: targetDilemma,
          options: cleanOpts,
          weights: targetWeights,
          instantDemo,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "决策沙盘推演失败");
        return;
      }
      setData(json as DecisionResponse);
      if (recordProgress) {
        recordDecisionAttempt();
      }
    } catch {
      setError("网络请求异常，请检查服务运行状态。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation(
      initialTemplate.dilemma,
      initialTemplate.options,
      initialTemplate.defaultWeights,
      false,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectTemplate = (id: string) => {
    const tpl = DECISION_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    setSelectedTemplateId(tpl.id);
    setDilemma(tpl.dilemma);
    setOptions(tpl.options);
    setWeights(tpl.defaultWeights);
    runSimulation(tpl.dilemma, tpl.options, tpl.defaultWeights, true);
  };

  const updateOption = (idx: number, val: string) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Zone 1: Centered Editorial Hero + Clean Scenario Switcher */}
      <section className="max-w-4xl mx-auto pt-4 sm:pt-6 space-y-7">
        <div className="text-center space-y-4">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold tracking-wide"
            style={{
              backgroundColor: "color-mix(in srgb, var(--apple-orange-vivid) 12%, transparent)",
              color: "var(--apple-orange)",
            }}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>多维决策评估沙盘</span>
          </div>

          <h1 className="text-[36px] sm:text-[46px] lg:text-[52px] font-semibold tracking-[-0.03em] leading-[1.12]">
            多维权重对比与方案评估
          </h1>

          <p className="text-[16px] sm:text-[18px] text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
            调节五个维度的权重滑块，实时对比各备选方案的综合得分、SWOT 分析与风险预案。
          </p>
        </div>

        {/* 经典模板胶囊栏 + 折叠式自定义编辑器触发器 */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {DECISION_TEMPLATES.map((tpl) => {
            const active = selectedTemplateId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl.id)}
                className={`px-5 py-2.5 rounded-full text-[14px] font-medium transition apple-focus ${
                  active
                    ? "text-white shadow-sm"
                    : "apple-card hover:bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                style={active ? { backgroundColor: "var(--apple-blue)" } : undefined}
              >
                {tpl.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setCustomEditorOpen((o) => !o)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full apple-inset hover:bg-[var(--bg-inset-hover)] text-[14px] font-medium transition apple-focus"
          >
            <PencilLine className="w-4 h-4" />
            <span>自定义情境与方案</span>
            {customEditorOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* 可展开的自定义情境与方案面板（默认收起，保持主界面极致大气！） */}
        {customEditorOpen && (
          <div className="apple-card rounded-2xl p-7 sm:p-8 space-y-5">
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-[var(--text-secondary)]">
                决策情境背景描述
              </label>
              <textarea
                rows={3}
                value={dilemma}
                onChange={(e) => setDilemma(e.target.value)}
                className="w-full rounded-2xl apple-input p-4 text-[15px] leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-semibold text-[var(--text-secondary)]">
                  备选方案列表（{options.length}/4）
                </label>
                {options.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setOptions([...options, `备选方案 ${options.length + 1}`])}
                    className="inline-flex items-center gap-1 text-[14px] font-medium"
                    style={{ color: "var(--apple-blue)" }}
                  >
                    <Plus className="w-4 h-4" />
                    添加方案
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      className="flex-1 rounded-xl apple-input px-4 py-3 text-[15px]"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                        className="p-2.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--apple-red)] hover:bg-[#FF3B30]/10"
                        aria-label="删除方案"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/25 px-5 py-3 text-[14px] text-[var(--apple-red)]">
            {error}
          </div>
        )}
      </section>

      {/* Zone 2: Balanced 5:7 Executive Sandbox */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-[84px]">
          <WeightSliders
            weights={weights}
            onWeightsChange={setWeights}
            onRunSimulation={() => runSimulation(dilemma, options, weights, true)}
            loading={loading}
          />
        </div>

        <div className="lg:col-span-7">
          {data ? (
            <DecisionCharts data={data} weights={weights} />
          ) : (
            <div className="apple-card rounded-2xl p-10 min-h-[420px] flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-[var(--apple-blue)] border-t-transparent animate-spin" />
              <div className="text-[16px] font-medium text-[var(--text-primary)]">
                {loading ? "正在生成多维雷达态势与 SWOT 推演..." : "点击左侧「重新运行 DeepSeek 沙盘推演」生成分析"}
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] max-w-md">
                系统将根据五维主观价值权重实时计算加权得分排名、五维雷达图与最坏情境止损策略。
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
