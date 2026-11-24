"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { CBS_ITEMS, S_CURVE_DATA } from "@/data/pmo-metrics";
import { useCognitive } from "@/components/providers/CognitiveProvider";

const APPLE_CBS_COLORS = ["#0071E3", "#008299", "#5856D6", "#34C759", "#AF52DE", "#FF9500"];

export function PmoCharts() {
  const { theme } = useCognitive();
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tooltipStyle = {
    backgroundColor: isDark ? "rgba(28, 28, 30, 0.96)" : "rgba(255, 255, 255, 0.98)",
    border: isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(0,0,0,0.1)",
    borderRadius: "16px",
    fontSize: "13px",
    color: isDark ? "#F5F5F7" : "#1D1D1F",
  };
  const axisColor = isDark ? "#A1A1A6" : "#515154";
  const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.09)";

  return (
    <div className="space-y-8">
      {/* 1亿元 CBS 预算分解大画幅视图 */}
      <div className="apple-card rounded-2xl p-7 sm:p-9 space-y-6">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">
            1 亿元成本分解结构（CBS）占比
          </h2>
          <p className="text-[14.5px] text-[var(--text-secondary)] mt-1">
            总投资 10,000.00 万元 = 成本基准 BAC 9,600 万元 + 管理储备 400 万元
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 h-[320px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CBS_ITEMS}
                    dataKey="budget"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={118}
                    paddingAngle={2.5}
                  >
                    {CBS_ITEMS.map((item, idx) => (
                      <Cell
                        key={item.code}
                        fill={APPLE_CBS_COLORS[idx % APPLE_CBS_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} 万元`, "预算"]}
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[14px] text-[var(--text-tertiary)]">
                加载 CBS 环形图...
              </div>
            )}
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CBS_ITEMS.map((item, idx) => {
              const color = APPLE_CBS_COLORS[idx % APPLE_CBS_COLORS.length];
              return (
                <div key={item.code} className="p-4 rounded-2xl apple-inset space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[14.5px] font-semibold truncate">{item.name}</span>
                    </div>
                  </div>
                  <div className="font-mono font-semibold text-[16px] tabular-nums" style={{ color }}>
                    {item.budget} 万元
                    <span className="text-[13px] font-normal text-[var(--text-secondary)] ml-1.5">
                      ({item.ratio}%)
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {item.details}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 36 个月时间-成本累计 S 曲线大画幅视图 */}
      <div className="apple-card rounded-2xl p-7 sm:p-9 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight">
              36 个月时间-成本累计 S 曲线（PV / EV / AC）
            </h2>
            <p className="text-[14.5px] text-[var(--text-secondary)] mt-1">
              M18（Q6）中期挣值监控节点：PV=6,900 · EV=6,500 · AC=6,800（万元）
            </p>
          </div>
          <span className="text-[13px] font-mono font-semibold px-3.5 py-1.5 rounded-full bg-[#FF9500]/12 text-[var(--apple-orange)]">
            M18 纠偏监控节点
          </span>
        </div>

        <div className="h-[400px] w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={S_CURVE_DATA} margin={{ top: 12, right: 20, left: 6, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="quarter" tick={{ fill: axisColor, fontSize: 13 }} />
                <YAxis domain={[0, 10000]} tick={{ fill: axisColor, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "13.5px", paddingTop: "10px" }} />
                <ReferenceLine
                  x="Q6"
                  stroke={isDark ? "#FF9F0A" : "#FF9500"}
                  strokeDasharray="5 5"
                  label={{
                    value: "M18 体检节点",
                    fill: isDark ? "#FF9F0A" : "#B85C00",
                    fontSize: 13,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pvCum"
                  name="计划价值 PV (累计万元)"
                  stroke={isDark ? "#0A84FF" : "#0071E3"}
                  strokeWidth={2.8}
                  dot={{ r: 3.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="evCum"
                  name="挣值 EV (累计万元)"
                  stroke={isDark ? "#30D158" : "#34C759"}
                  strokeWidth={2.8}
                  dot={{ r: 4.5 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="acCum"
                  name="实际成本 AC (累计万元)"
                  stroke={isDark ? "#FF453A" : "#FF3B30"}
                  strokeWidth={2.8}
                  dot={{ r: 4.5 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[14px] text-[var(--text-tertiary)]">
              加载 36 个月 S 曲线...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
