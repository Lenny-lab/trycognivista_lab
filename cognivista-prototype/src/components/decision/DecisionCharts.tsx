"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AlertTriangle, Shield, Award, FileText } from "lucide-react";
import type { DecisionResponse, DecisionWeights } from "@/lib/types";
import { useCognitive } from "@/components/providers/CognitiveProvider";

const APPLE_SERIES_LIGHT = ["#0071E3", "#34C759", "#FF9500", "#AF52DE"];
const APPLE_SERIES_DARK = ["#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2"];

interface DecisionChartsProps {
  data: DecisionResponse;
  weights: DecisionWeights;
}

export function DecisionCharts({ data, weights }: DecisionChartsProps) {
  const { openCitationDrawer, theme } = useCognitive();
  const isDark = theme === "dark";
  const seriesColors = isDark ? APPLE_SERIES_DARK : APPLE_SERIES_LIGHT;

  const [mounted, setMounted] = useState(false);
  const [chartTab, setChartTab] = useState<"radar" | "yield">("radar");
  const [activeOptionIdx, setActiveOptionIdx] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActiveOptionIdx(0);
  }, [data]);

  const rankedEvaluations = useMemo(() => {
    const sumW =
      weights.longTermCeiling +
        weights.shortTermCertainty +
        weights.riskResilience +
        weights.costEfficiency +
        weights.passionAlignment || 1;

    return data.evaluations
      .map((ev, origIdx) => {
        const weightedScore =
          (ev.scores.longTermCeiling * weights.longTermCeiling +
            ev.scores.shortTermCertainty * weights.shortTermCertainty +
            ev.scores.riskResilience * weights.riskResilience +
            ev.scores.costEfficiency * weights.costEfficiency +
            ev.scores.passionAlignment * weights.passionAlignment) /
          sumW;

        return {
          ...ev,
          origIdx,
          weightedScore: Number(weightedScore.toFixed(1)),
          color: seriesColors[origIdx % seriesColors.length],
        };
      })
      .sort((a, b) => b.weightedScore - a.weightedScore);
  }, [data.evaluations, weights, seriesColors]);

  const radarData = useMemo(() => {
    const dims: Array<{ key: keyof DecisionWeights; label: string }> = [
      { key: "longTermCeiling", label: "长期上限" },
      { key: "shortTermCertainty", label: "短期确定" },
      { key: "riskResilience", label: "抗风险韧性" },
      { key: "costEfficiency", label: "性价比" },
      { key: "passionAlignment", label: "兴趣自洽" },
    ];
    return dims.map((d) => {
      const row: Record<string, string | number> = { dimension: d.label };
      data.evaluations.forEach((ev) => {
        row[ev.optionName] = ev.scores[d.key];
      });
      return row;
    });
  }, [data.evaluations]);

  const yieldBarData = useMemo(
    () =>
      data.evaluations.map((ev) => ({
        name: ev.optionName.length > 10 ? `${ev.optionName.slice(0, 10)}…` : ev.optionName,
        短期1年收益: ev.shortTermYield,
        长期5年天花板: ev.longTermYield,
      })),
    [data.evaluations]
  );

  const selectedEval = data.evaluations[activeOptionIdx] || data.evaluations[0];

  const tooltipStyle = {
    backgroundColor: isDark ? "rgba(28, 28, 30, 0.96)" : "rgba(255, 255, 255, 0.98)",
    border: isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(0,0,0,0.1)",
    borderRadius: "16px",
    fontSize: "13px",
    color: isDark ? "#F5F5F7" : "#1D1D1F",
    boxShadow: "0 12px 30px rgba(0,0,0,0.14)",
  };

  const axisTickColor = isDark ? "#A1A1A6" : "#515154";
  const gridStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.09)";

  return (
    <div className="space-y-8">
      {/* 右侧核心综合面板：实时排序 + 大尺寸单图切换 */}
      <div className="apple-card rounded-2xl p-7 sm:p-9 space-y-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5" style={{ color: "var(--apple-orange)" }} />
            <h2 className="text-[20px] font-semibold tracking-tight">实时加权综合推荐度</h2>
          </div>
          <span className="text-[13px] font-mono px-3 py-1 rounded-full apple-inset text-[var(--text-secondary)]">
            {data.usedModel}
          </span>
        </div>

        {/* 宽敞的加权排名进度条 */}
        <div className="space-y-4">
          {rankedEvaluations.map((ev, rankIdx) => (
            <div key={ev.optionName} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-mono font-semibold text-white shrink-0"
                    style={{ backgroundColor: ev.color }}
                  >
                    {rankIdx + 1}
                  </span>
                  <span className="text-[16px] font-semibold truncate">{ev.optionName}</span>
                  {rankIdx === 0 && (
                    <span className="text-[12px] font-medium px-3 py-0.5 rounded-full bg-[#34C759]/12 text-[var(--apple-green)] shrink-0">
                      当前权重最优
                    </span>
                  )}
                </div>
                <span
                  className="font-mono font-semibold text-[22px] tabular-nums shrink-0"
                  style={{ color: ev.color }}
                >
                  {ev.weightedScore}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-black/[0.06] dark:bg-white/[0.1] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${ev.weightedScore}%`, backgroundColor: ev.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 切换雷达图 / 收益柱状图（大画幅，不挤压） */}
        <div className="pt-5 border-t border-[var(--border-hairline)] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[17px] font-semibold">多维量化态势图</h3>
            <div className="inline-flex p-1 rounded-full apple-inset">
              <button
                type="button"
                onClick={() => setChartTab("radar")}
                className={`px-4 py-1.5 rounded-full text-[13.5px] font-medium transition apple-focus ${
                  chartTab === "radar"
                    ? "bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                五维能力雷达
              </button>
              <button
                type="button"
                onClick={() => setChartTab("yield")}
                className={`px-4 py-1.5 rounded-full text-[13.5px] font-medium transition apple-focus ${
                  chartTab === "yield"
                    ? "bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                短长周期收益
              </button>
            </div>
          </div>

          <div className="h-[340px] w-full">
            {mounted ? (
              chartTab === "radar" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="66%">
                    <PolarGrid stroke={gridStroke} />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fill: axisTickColor, fontSize: 13 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    {data.evaluations.map((ev, idx) => (
                      <Radar
                        key={ev.optionName}
                        name={ev.optionName}
                        dataKey={ev.optionName}
                        stroke={seriesColors[idx % seriesColors.length]}
                        fill={seriesColors[idx % seriesColors.length]}
                        fillOpacity={0.16}
                        strokeWidth={2.2}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: "13px", paddingTop: "10px" }} />
                    <Tooltip contentStyle={tooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldBarData} margin={{ top: 12, right: 16, left: -10, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fill: axisTickColor, fontSize: 13 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: axisTickColor, fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }} />
                    <Bar
                      dataKey="短期1年收益"
                      fill={isDark ? "#0A84FF" : "#0071E3"}
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="长期5年天花板"
                      fill={isDark ? "#7C7AFF" : "#5856D6"}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-[14px] text-[var(--text-tertiary)]">
                加载量化图表...
              </div>
            )}
          </div>
        </div>

        {/* 理性权衡综述 */}
        <div className="rounded-2xl p-5 apple-inset text-[15px] leading-[1.8] text-[var(--text-primary)]">
          <span className="font-semibold" style={{ color: "var(--apple-blue)" }}>
            权衡前提提醒：
          </span>
          {data.overallGuidance}
        </div>
      </div>

      {/* 下部全宽深读卡：SWOT 动态矩阵 + 压力测试 */}
      {selectedEval && (
        <div className="apple-card rounded-2xl p-7 sm:p-9 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-[22px] font-semibold tracking-tight">
                分方案 SWOT 态势与压力测试
              </h3>
              <p className="text-[14px] text-[var(--text-secondary)] mt-1">
                逐项审视备选路径的结构性优劣势，以及最坏情况下的退路底线
              </p>
            </div>
            <div className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-full apple-inset">
              {data.evaluations.map((ev, idx) => (
                <button
                  key={ev.optionName}
                  type="button"
                  onClick={() => setActiveOptionIdx(idx)}
                  className={`px-4 py-2 rounded-full text-[13.5px] font-medium transition apple-focus ${
                    activeOptionIdx === idx
                      ? "bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {ev.optionName}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SwotCell title="优势 Strengths" items={selectedEval.swot.strengths} tone="green" />
            <SwotCell title="劣势 Weaknesses" items={selectedEval.swot.weaknesses} tone="orange" />
            <SwotCell title="机会 Opportunities" items={selectedEval.swot.opportunities} tone="blue" />
            <SwotCell title="威胁 Threats" items={selectedEval.swot.threats} tone="red" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="rounded-2xl p-6 bg-[#FF9500]/10 border border-[#FF9500]/25 space-y-2">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--apple-orange)]">
                <AlertTriangle className="w-5 h-5" />
                <span>最坏情境压力测试</span>
              </div>
              <p className="text-[15px] leading-[1.75] text-[var(--text-primary)]">
                {selectedEval.worstCaseScenario}
              </p>
            </div>

            <div className="rounded-2xl p-6 bg-[#34C759]/10 border border-[#34C759]/25 space-y-2">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--apple-green)]">
                <Shield className="w-5 h-5" />
                <span>止损与退路方案</span>
              </div>
              <p className="text-[15px] leading-[1.75] text-[var(--text-primary)]">
                {selectedEval.mitigationPlan}
              </p>
            </div>
          </div>

          {data.citations.length > 0 && (
            <div className="pt-4 border-t border-[var(--border-hairline)] flex flex-wrap items-center gap-2.5">
              <span className="text-[13.5px] text-[var(--text-secondary)]">决策科学依据：</span>
              {data.citations.map((cit) => (
                <button
                  key={cit.chunkId}
                  type="button"
                  onClick={() => openCitationDrawer(cit, data.citations)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium bg-[#34C759]/10 hover:bg-[#34C759]/18 text-[var(--apple-green)] transition apple-focus"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{cit.docTitle}</span>
                  <span className="font-mono font-semibold">[{cit.chunkId}]</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SwotCell({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "green" | "orange" | "blue" | "red";
}) {
  const titleColor = {
    green: "var(--apple-green)",
    orange: "var(--apple-orange)",
    blue: "var(--apple-blue)",
    red: "var(--apple-red)",
  }[tone];

  return (
    <div className="rounded-2xl p-6 apple-inset space-y-2.5">
      <div className="text-[15px] font-semibold" style={{ color: titleColor }}>
        {title}
      </div>
      <ul className="space-y-2 text-[15px] text-[var(--text-primary)] list-disc pl-5">
        {items.map((item, i) => (
          <li key={i} className="leading-[1.7]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
