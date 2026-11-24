"use client";

import React, { useState } from "react";
import { BarChart3, AlertTriangle, CheckCircle2, ShieldAlert, TrendingDown } from "lucide-react";
import {
  M18_SUMMARY,
  M18_WBS_EVM,
  POST_EVALUATION_HIGHLIGHTS,
  RISK_REGISTER,
} from "@/data/pmo-metrics";
import { PmoCharts } from "@/components/pmo/PmoCharts";

export default function PmoPage() {
  const [activeTab, setActiveTab] = useState<"budget" | "evm" | "risk">("budget");

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Zone 1: Centered Executive Hero */}
      <section className="max-w-4xl mx-auto pt-4 sm:pt-6 text-center space-y-5">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold tracking-wide"
          style={{
            backgroundColor: "color-mix(in srgb, var(--apple-teal) 12%, transparent)",
            color: "var(--apple-teal)",
          }}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>36 个月 · 1 亿元全生命周期管理</span>
        </div>

        <h1 className="text-[36px] sm:text-[46px] lg:text-[52px] font-semibold tracking-[-0.03em] leading-[1.12]">
          1 亿元工程管理全生命周期看板
        </h1>

        <p className="text-[16px] sm:text-[18px] text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
          对齐项目基准数据：CBS 成本分解、36 个月 S 曲线、M18 挣值监控与 M36 后评价。
        </p>
      </section>

      {/* 顶层 4 大高管级 KPI 指标卡 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard
          label="项目总投资预算"
          value="10,000 万"
          sub="直接工程 9,000 万 + 储备金 1,000 万"
          color="var(--apple-blue)"
        />
        <KpiCard
          label="成本绩效基准 (BAC)"
          value="9,600 万"
          sub="含应急储备 600 万（管理储备 400 万外置）"
          color="var(--apple-teal)"
        />
        <KpiCard
          label="M18 成本绩效指数 (CPI)"
          value={M18_SUMMARY.cpi.toFixed(4)}
          sub={`CV = ${M18_SUMMARY.cv} 万元（±8% 可控区）`}
          color="var(--apple-orange)"
        />
        <KpiCard
          label="M18 进度绩效指数 (SPI)"
          value={M18_SUMMARY.spi.toFixed(4)}
          sub={`SV = ${M18_SUMMARY.sv} 万元（TCPI = ${M18_SUMMARY.tcpi}）`}
          color="var(--apple-red)"
        />
      </section>

      {/* Zone 2: Segmented Executive Views（分屏展示，确保每屏大气舒展） */}
      <section className="space-y-8">
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap justify-center p-1.5 rounded-full apple-inset gap-1">
            {[
              { id: "budget" as const, label: "CBS 预算与 S 曲线" },
              { id: "evm" as const, label: "M18 挣值监控与纠偏" },
              { id: "risk" as const, label: "风险矩阵与 M36 后评价" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-full text-[15px] font-medium transition apple-focus ${
                  activeTab === tab.id
                    ? "bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* View 1: CBS + S Curve */}
        {activeTab === "budget" && <PmoCharts />}

        {/* View 2: M18 EVM 台账 + 四大纠偏指令 */}
        {activeTab === "evm" && (
          <div className="space-y-8">
            <div className="apple-card rounded-2xl p-7 sm:p-9 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[22px] font-semibold tracking-tight">
                  M18 分模块挣值管理（EVM）监控台账
                </h2>
                <span className="text-[13.5px] font-mono text-[var(--text-secondary)]">
                  金额单位：万元人民币
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[15px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)]">
                      <th className="py-3.5 pr-4 font-semibold">WBS 模块</th>
                      <th className="py-3.5 px-3 text-right font-mono font-semibold">BAC</th>
                      <th className="py-3.5 px-3 text-right font-mono font-semibold">PV</th>
                      <th className="py-3.5 px-3 text-right font-mono font-semibold">EV</th>
                      <th className="py-3.5 px-3 text-right font-mono font-semibold">AC</th>
                      <th className="py-3.5 px-3 text-right font-mono font-semibold">CPI</th>
                      <th className="py-3.5 pl-3 text-right font-mono font-semibold">SPI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)] font-mono tabular-nums">
                    {M18_WBS_EVM.map((row) => (
                      <tr key={row.wbs} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
                        <td className="py-4 pr-4 font-sans font-medium">{row.wbs}</td>
                        <td className="py-4 px-3 text-right">{row.bac}</td>
                        <td className="py-4 px-3 text-right">{row.pv}</td>
                        <td className="py-4 px-3 text-right text-[var(--apple-green)]">{row.ev}</td>
                        <td className="py-4 px-3 text-right text-[var(--apple-red)]">{row.ac}</td>
                        <td
                          className="py-4 px-3 text-right font-semibold"
                          style={{
                            color: row.cpi < 0.95 ? "var(--apple-orange)" : "var(--apple-green)",
                          }}
                        >
                          {row.cpi.toFixed(4)}
                        </td>
                        <td
                          className="py-4 pl-3 text-right font-semibold"
                          style={{
                            color: row.spi < 0.95 ? "var(--apple-orange)" : "var(--apple-blue)",
                          }}
                        >
                          {row.spi.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="p-5 rounded-2xl apple-inset">
                  <div className="text-[13.5px] text-[var(--text-secondary)]">非典型预测 EAC</div>
                  <div
                    className="font-mono font-semibold text-[24px] mt-1 tabular-nums"
                    style={{ color: "var(--apple-blue)" }}
                  >
                    {M18_SUMMARY.eacAtypical.toLocaleString()} 万
                  </div>
                </div>
                <div className="p-5 rounded-2xl apple-inset">
                  <div className="text-[13.5px] text-[var(--text-secondary)]">典型预测 EAC</div>
                  <div
                    className="font-mono font-semibold text-[24px] mt-1 tabular-nums"
                    style={{ color: "var(--apple-orange)" }}
                  >
                    {M18_SUMMARY.eacTypical.toLocaleString()} 万
                  </div>
                </div>
                <div className="p-5 rounded-2xl apple-inset">
                  <div className="text-[13.5px] text-[var(--text-secondary)]">综合悲观预测 EAC</div>
                  <div
                    className="font-mono font-semibold text-[24px] mt-1 tabular-nums"
                    style={{ color: "var(--apple-red)" }}
                  >
                    {M18_SUMMARY.eacCombined.toLocaleString()} 万
                  </div>
                </div>
              </div>
            </div>

            <div className="apple-card rounded-2xl p-7 sm:p-9 space-y-5">
              <div className="flex items-center gap-2.5">
                <TrendingDown className="w-5 h-5 text-[var(--apple-green)]" />
                <h2 className="text-[22px] font-semibold tracking-tight">
                  PMO 四大刚性纠偏与成本对冲措施
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {M18_SUMMARY.correctiveActions.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#34C759]/8 border border-[#34C759]/22 space-y-2"
                  >
                    <div className="text-[16px] font-semibold text-[var(--apple-green)] flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>{act.title}</span>
                    </div>
                    <p className="text-[15px] text-[var(--text-primary)] leading-[1.75]">
                      {act.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View 3: 风险矩阵 + Top 5 登记册 + M36 后评价 */}
        {activeTab === "risk" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-5 apple-card rounded-2xl p-7 sm:p-8 space-y-5">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-[var(--apple-red)]" />
                  <h2 className="text-[20px] font-semibold">5×5 概率-影响风险矩阵</h2>
                </div>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((p) => (
                    <div key={p} className="grid grid-cols-6 gap-2 items-center text-[12.5px] font-mono">
                      <span className="text-[var(--text-secondary)] text-right pr-1 font-semibold">
                        P={p}
                      </span>
                      {[1, 2, 3, 4, 5].map((i) => {
                        const score = p * i;
                        const hits = RISK_REGISTER.filter((r) => r.p === p && r.i === i);
                        const styleClass =
                          score >= 12
                            ? "bg-[#FF3B30]/16 border-[#FF3B30]/35 text-[var(--apple-red)]"
                            : score >= 8
                            ? "bg-[#FF9500]/16 border-[#FF9500]/35 text-[var(--apple-orange)]"
                            : "bg-[#34C759]/12 border-[#34C759]/30 text-[var(--apple-green)]";
                        return (
                          <div
                            key={`${p}-${i}`}
                            className={`h-14 rounded-2xl border flex flex-col items-center justify-center ${styleClass}`}
                            title={`P=${p}, I=${i}, Score=${score}`}
                          >
                            <span className="opacity-75">{score}</span>
                            {hits.length > 0 && (
                              <span className="font-bold text-[10.5px] leading-none mt-1">
                                {hits.map((h) => h.id).join(",")}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div className="grid grid-cols-6 gap-2 text-center text-[12.5px] font-mono text-[var(--text-secondary)] pt-1 font-semibold">
                    <span />
                    <span>I=1</span>
                    <span>I=2</span>
                    <span>I=3</span>
                    <span>I=4</span>
                    <span>I=5</span>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-7 apple-card rounded-2xl p-7 sm:p-8 space-y-5">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-[var(--apple-orange)]" />
                  <h2 className="text-[20px] font-semibold">全生命周期核心风险登记册</h2>
                </div>
                <div className="space-y-4">
                  {RISK_REGISTER.map((r) => (
                    <div key={r.id} className="p-5 rounded-2xl apple-inset space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="font-mono text-[14px] font-semibold"
                            style={{ color: "var(--apple-blue)" }}
                          >
                            {r.id}
                          </span>
                          <span
                            className={`px-3 py-0.5 rounded-full text-[12px] font-semibold ${
                              r.level === "高危"
                                ? "bg-[#FF3B30]/12 text-[var(--apple-red)]"
                                : "bg-[#FF9500]/14 text-[var(--apple-orange)]"
                            }`}
                          >
                            {r.level} · P×I={r.score}
                          </span>
                          <span className="text-[15px] font-semibold">{r.category}</span>
                        </div>
                        <span className="text-[13px] text-[var(--text-secondary)]">
                          {r.strategy} · {r.owner}
                        </span>
                      </div>
                      <p className="text-[15px] text-[var(--text-primary)] leading-relaxed">
                        {r.description}
                      </p>
                      <div className="text-[13.5px] text-[var(--text-secondary)] grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 leading-relaxed">
                        <div>
                          <span className="font-semibold" style={{ color: "var(--apple-blue)" }}>
                            预防措施：
                          </span>
                          {r.mitigation}
                        </div>
                        <div>
                          <span className="font-semibold text-[var(--apple-orange)]">应急预案：</span>
                          {r.contingency}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* M36 竣工决算与后评价成果 */}
            <div className="apple-card rounded-2xl p-7 sm:p-9 space-y-5">
              <h2 className="text-[22px] font-semibold tracking-tight">
                M36 竣工决算与百校运营后评价核心成果
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {POST_EVALUATION_HIGHLIGHTS.map((item) => (
                  <div key={item.label} className="p-6 rounded-2xl apple-inset space-y-1.5">
                    <div className="text-[14px] text-[var(--text-secondary)]">{item.label}</div>
                    <div className="text-[26px] font-semibold font-mono text-[var(--apple-green)] tabular-nums">
                      {item.value}
                    </div>
                    <div className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
                      {item.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="apple-card rounded-2xl p-7 space-y-2">
      <div className="text-[14px] text-[var(--text-secondary)] font-medium">{label}</div>
      <div
        className="text-[34px] sm:text-[38px] font-semibold font-mono tabular-nums tracking-tight leading-none pt-1"
        style={{ color }}
      >
        {value}
      </div>
      <div className="text-[13.5px] text-[var(--text-secondary)] pt-1">{sub}</div>
    </div>
  );
}
