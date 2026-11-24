"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Library,
  UploadCloud,
  Search,
  FileText,
  Sparkles,
  CheckCircle2,
  Compass,
  Loader2,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { KnowledgeCitation, KnowledgeDocumentSummary } from "@/lib/types";
import { useCognitive } from "@/components/providers/CognitiveProvider";

const ALL_DISCIPLINES = [
  "哲学",
  "经济学",
  "法学",
  "计算机科学",
  "社会学",
  "心理学",
  "管理学",
  "系统科学",
  "文学",
  "历史学",
  "教育学",
  "医学",
];

interface KnowledgeApiData {
  totalDocuments: number;
  totalChunks: number;
  disciplines: string[];
  documents: KnowledgeDocumentSummary[];
  chunks: KnowledgeCitation[];
}

export default function KnowledgePage() {
  const { profile, openCitationDrawer, theme } = useCognitive();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<"browse" | "upload" | "profile">("browse");
  const [data, setData] = useState<KnowledgeApiData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDiscipline, setActiveDiscipline] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDiscipline, setUploadDiscipline] = useState("计算机科学");
  const [uploadContent, setUploadContent] = useState("");
  const [uploadFileName, setUploadFileName] = useState("custom-resource.md");
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchKnowledge = useCallback(async (q: string, disc: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (disc) params.set("discipline", disc);
      params.set("topK", "8");
      const res = await fetch(`/api/knowledge?${params.toString()}`);
      const json = await res.json();
      setData(json as KnowledgeApiData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKnowledge("", "");
  }, [fetchKnowledge]);

  const handleFileLoad = async (file: File) => {
    const text = await file.text();
    let parsedContent = text;
    if (file.name.endsWith(".json")) {
      try {
        const obj = JSON.parse(text);
        parsedContent =
          typeof obj.content === "string"
            ? obj.content
            : JSON.stringify(obj, null, 2);
        if (obj.title && !uploadTitle) setUploadTitle(obj.title);
        if (obj.discipline) setUploadDiscipline(obj.discipline);
      } catch {
        // fallback raw text
      }
    }
    setUploadFileName(file.name);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.(md|txt|json)$/i, ""));
    }
    setUploadContent(parsedContent);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || uploadContent.trim().length < 20) {
      setUploadNotice("请填写标题，并确保正文内容不少于 20 个字符。");
      return;
    }
    setUploading(true);
    setUploadNotice(null);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadFileName,
          title: uploadTitle.trim(),
          discipline: uploadDiscipline,
          content: uploadContent.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setUploadNotice(json.error || "入库失败");
      } else {
        setUploadNotice(json.message || "已成功切片入库！");
        setUploadTitle("");
        setUploadContent("");
        fetchKnowledge(searchQuery, activeDiscipline);
      }
    } catch {
      setUploadNotice("上传入库请求失败");
    } finally {
      setUploading(false);
    }
  };

  const radarData = useMemo(() => {
    return ALL_DISCIPLINES.map((disc) => ({
      discipline: disc,
      探索深度: Math.min(100, (profile.exploredDisciplines[disc] || 0) * 20),
    }));
  }, [profile.exploredDisciplines]);

  const blindSpotDisciplines = useMemo(() => {
    return ALL_DISCIPLINES.filter((d) => !(profile.exploredDisciplines[d] > 0));
  }, [profile.exploredDisciplines]);

  const axisTickColor = isDark ? "#A1A1A6" : "#515154";
  const gridStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.09)";
  const tooltipStyle = {
    backgroundColor: isDark ? "rgba(28, 28, 30, 0.96)" : "rgba(255, 255, 255, 0.98)",
    border: isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(0,0,0,0.1)",
    borderRadius: "16px",
    fontSize: "13px",
    color: isDark ? "#F5F5F7" : "#1D1D1F",
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Zone 1: Centered Hero + Grand Stat Strip */}
      <section className="max-w-4xl mx-auto pt-4 sm:pt-6 text-center space-y-5">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold tracking-wide"
          style={{
            backgroundColor: "color-mix(in srgb, var(--apple-green-vivid) 12%, transparent)",
            color: "var(--apple-green)",
          }}
        >
          <Library className="w-3.5 h-3.5" />
          <span>12 学科知识库</span>
        </div>

        <h1 className="text-[36px] sm:text-[46px] lg:text-[52px] font-semibold tracking-[-0.03em] leading-[1.12]">
          跨学科文献库与个人探索记录
        </h1>

        <p className="text-[16px] sm:text-[18px] text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
          支持检索本地文献切片、上传新文档入库，并查看各学科的探索覆盖情况。
        </p>
      </section>

      {/* 3 大气指标卡 */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="apple-card rounded-2xl p-7 flex items-center justify-between">
          <div>
            <div className="text-[14px] text-[var(--text-secondary)]">已挂载权威文献</div>
            <div className="text-[40px] font-semibold font-mono tabular-nums mt-1 tracking-tight leading-none">
              {data?.totalDocuments ?? 12}
              <span className="text-[15px] font-sans font-normal text-[var(--text-secondary)] ml-2">
                份
              </span>
            </div>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: "color-mix(in srgb, var(--apple-green) 12%, transparent)",
              color: "var(--apple-green)",
            }}
          >
            <Library className="w-6 h-6" strokeWidth={1.8} />
          </div>
        </div>

        <div className="apple-card rounded-2xl p-7 flex items-center justify-between">
          <div>
            <div className="text-[14px] text-[var(--text-secondary)]">语义检索切片总数</div>
            <div
              className="text-[40px] font-semibold font-mono tabular-nums mt-1 tracking-tight leading-none"
              style={{ color: "var(--apple-blue)" }}
            >
              {data?.totalChunks ?? 32}
              <span className="text-[15px] font-sans font-normal text-[var(--text-secondary)] ml-2">
                Chunks
              </span>
            </div>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: "color-mix(in srgb, var(--apple-blue) 12%, transparent)",
              color: "var(--apple-blue)",
            }}
          >
            <Sparkles className="w-6 h-6" strokeWidth={1.8} />
          </div>
        </div>

        <div className="apple-card rounded-2xl p-7 flex items-center justify-between">
          <div>
            <div className="text-[14px] text-[var(--text-secondary)]">覆盖学科门类</div>
            <div
              className="text-[40px] font-semibold font-mono tabular-nums mt-1 tracking-tight leading-none"
              style={{ color: "var(--apple-indigo)" }}
            >
              12 / 12
              <span className="text-[15px] font-sans font-normal text-[var(--text-secondary)] ml-2">
                全覆盖
              </span>
            </div>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: "color-mix(in srgb, var(--apple-indigo) 12%, transparent)",
              color: "var(--apple-indigo)",
            }}
          >
            <Compass className="w-6 h-6" strokeWidth={1.8} />
          </div>
        </div>
      </section>

      {/* Zone 2: Segmented Functional Stage (三区独立切换，告别页面堆叠) */}
      <section className="space-y-8">
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap justify-center p-1.5 rounded-full apple-inset gap-1">
            {[
              { id: "browse" as const, label: "检索与文献库" },
              { id: "upload" as const, label: "上传切片入库" },
              { id: "profile" as const, label: "个人 12 学科认知画像" },
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

        {/* Tab 1: 混合检索与文献库 */}
        {activeTab === "browse" && (
          <div className="space-y-8">
            <div className="apple-card rounded-2xl p-7 sm:p-9 space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-[var(--text-tertiary)] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") fetchKnowledge(searchQuery, activeDiscipline);
                    }}
                    placeholder="输入关键词测试混合检索（如：外部性、虚假两难、布鲁姆、碳达峰）..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl apple-input text-[15.5px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fetchKnowledge(searchQuery, activeDiscipline)}
                  style={{ backgroundColor: "var(--apple-blue)" }}
                  className="px-7 py-3.5 rounded-2xl text-[15px] font-medium text-white hover:brightness-110 transition apple-focus shrink-0"
                >
                  {loading ? "检索中..." : "BM25 检索"}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDiscipline("");
                    fetchKnowledge(searchQuery, "");
                  }}
                  className={`px-4 py-2 rounded-full text-[13.5px] font-medium transition apple-focus ${
                    activeDiscipline === ""
                      ? "text-white shadow-sm"
                      : "apple-inset text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                  style={activeDiscipline === "" ? { backgroundColor: "var(--apple-blue)" } : undefined}
                >
                  全部学科
                </button>
                {ALL_DISCIPLINES.map((d) => {
                  const active = activeDiscipline === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setActiveDiscipline(d);
                        fetchKnowledge(searchQuery, d);
                      }}
                      className={`px-4 py-2 rounded-full text-[13.5px] font-medium transition apple-focus ${
                        active
                          ? "text-white shadow-sm"
                          : "apple-inset text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                      style={active ? { backgroundColor: "var(--apple-blue)" } : undefined}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 命中切片 2 列大卡片 */}
            <div className="space-y-4">
              <h2 className="text-[22px] font-semibold tracking-tight px-1">
                检索命中语义切片（点击查看原文溯源）
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data?.chunks.map((chunk) => (
                  <button
                    key={chunk.chunkId}
                    type="button"
                    onClick={() => openCitationDrawer(chunk, data.chunks)}
                    className="text-left p-6 rounded-2xl apple-card apple-card-interactive space-y-3 apple-focus"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[13.5px] font-semibold text-[var(--apple-green)]">
                          [{chunk.chunkId}]
                        </span>
                        <span
                          className="px-3 py-0.5 rounded-full text-[12.5px] font-medium"
                          style={{
                            backgroundColor: "color-mix(in srgb, var(--apple-blue) 12%, transparent)",
                            color: "var(--apple-blue)",
                          }}
                        >
                          {chunk.discipline}
                        </span>
                      </div>
                      <span
                        className="font-mono font-semibold text-[14px] tabular-nums"
                        style={{ color: "var(--apple-blue)" }}
                      >
                        匹配度 {(chunk.relevanceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-[17px] font-semibold leading-snug">
                      {chunk.docTitle}
                    </div>
                    <p className="text-[14.5px] text-[var(--text-secondary)] line-clamp-3 leading-[1.75]">
                      {chunk.excerpt.replace(/\*\*/g, "")}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 文献目录清单 */}
            <div className="apple-card rounded-2xl p-7 sm:p-9 space-y-5">
              <h2 className="text-[20px] font-semibold">
                已挂载知识库目录 ({data?.documents.length ?? 0} 份)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data?.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl apple-inset flex items-start gap-3"
                  >
                    <FileText
                      className="w-5 h-5 shrink-0 mt-0.5"
                      style={{ color: "var(--apple-blue)" }}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-[14.5px] font-semibold truncate">{doc.title}</div>
                      <div className="text-[12.5px] text-[var(--text-secondary)] flex items-center gap-2.5">
                        <span className="font-mono text-[var(--apple-green)] font-semibold">
                          {doc.id}
                        </span>
                        <span>{doc.discipline}</span>
                        <span>{doc.chunkCount} 切片</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 宽敞的上传切片入库工作台 */}
        {activeTab === "upload" && (
          <form
            onSubmit={handleUploadSubmit}
            className="max-w-3xl mx-auto apple-card rounded-2xl p-8 sm:p-10 space-y-6"
          >
            <div>
              <h2 className="text-[22px] font-semibold tracking-tight">
                上传本地学术资源并实时切片入库
              </h2>
              <p className="text-[14.5px] text-[var(--text-secondary)] mt-1">
                支持 .md / .txt / .json 文件，入库后立即生效于认知透镜与思辨场的 RAG 溯源
              </p>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFileLoad(f);
              }}
              className={`rounded-3xl border-2 border-dashed p-10 text-center transition ${
                dragActive
                  ? "border-[var(--apple-blue)] bg-[#0071E3]/8"
                  : "border-[var(--border-strong)] hover:border-[var(--apple-blue)]/60"
              }`}
            >
              <input
                type="file"
                id="kb-file-input"
                accept=".md,.txt,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileLoad(f);
                }}
              />
              <label htmlFor="kb-file-input" className="cursor-pointer block space-y-2">
                <UploadCloud
                  className="w-10 h-10 mx-auto mb-2"
                  style={{ color: "var(--apple-blue)" }}
                  strokeWidth={1.6}
                />
                <div className="text-[16px] font-medium">
                  拖拽文件到此处，或{" "}
                  <span className="underline" style={{ color: "var(--apple-blue)" }}>
                    点击浏览本地文件
                  </span>
                </div>
                <div className="text-[13.5px] text-[var(--text-secondary)]">
                  自动按 ## 章节标题与 340 字滑窗进行语义分块
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13.5px] font-medium text-[var(--text-secondary)]">
                  资源标题
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="例如：《量子计算与密码安全导论》"
                  className="w-full rounded-2xl apple-input px-4 py-3 text-[15px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13.5px] font-medium text-[var(--text-secondary)]">
                  所属学科门类
                </label>
                <select
                  value={uploadDiscipline}
                  onChange={(e) => setUploadDiscipline(e.target.value)}
                  className="w-full rounded-2xl apple-input px-4 py-3 text-[15px]"
                >
                  {ALL_DISCIPLINES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13.5px] font-medium text-[var(--text-secondary)]">
                资源正文内容
              </label>
              <textarea
                rows={5}
                value={uploadContent}
                onChange={(e) => setUploadContent(e.target.value)}
                placeholder="粘贴或导入文本内容（至少 20 字）..."
                className="w-full rounded-2xl apple-input p-4 text-[15px] leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              {uploadNotice ? (
                <div className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--apple-green)]">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{uploadNotice}</span>
                </div>
              ) : (
                <span className="text-[13.5px] text-[var(--text-tertiary)]">
                  文档将实时写入本地混合检索引擎
                </span>
              )}
              <button
                type="submit"
                disabled={uploading}
                style={{ backgroundColor: "var(--apple-blue)" }}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-[15px] font-medium text-white shadow-sm hover:brightness-110 disabled:opacity-50 transition apple-focus active:scale-[0.98]"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>执行切片并入库</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: 个人 12 学科认知边界画像 */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 apple-card rounded-2xl p-7 sm:p-9 space-y-4">
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">
                  个人 12 学科认知边界雷达
                </h2>
                <p className="text-[14.5px] text-[var(--text-secondary)] mt-1">
                  自动汇总你在认知透镜、思辨场与决策沙盘中的跨学科探索足迹
                </p>
              </div>
              <div className="h-[420px] w-full">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="74%">
                      <PolarGrid stroke={gridStroke} />
                      <PolarAngleAxis
                        dataKey="discipline"
                        tick={{ fill: axisTickColor, fontSize: 13 }}
                      />
                      <PolarRadiusAxis
                        domain={[0, 100]}
                        tick={{ fill: axisTickColor, fontSize: 11 }}
                      />
                      <Radar
                        name="探索深度"
                        dataKey="探索深度"
                        stroke={isDark ? "#0A84FF" : "#0071E3"}
                        fill={isDark ? "#0A84FF" : "#0071E3"}
                        fillOpacity={0.22}
                        strokeWidth={2.4}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[14px] text-[var(--text-tertiary)]">
                    加载雷达图...
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="apple-card rounded-2xl p-7 space-y-4">
                <h3 className="text-[18px] font-semibold text-[var(--apple-orange)]">
                  待拓展认知盲区建议 ({blindSpotDisciplines.length})
                </h3>
                {blindSpotDisciplines.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {blindSpotDisciplines.map((d) => (
                      <span
                        key={d}
                        className="px-4 py-2 rounded-full text-[14px] font-medium bg-[#FF9500]/10 text-[var(--apple-orange)] border border-[#FF9500]/25"
                      >
                        + {d}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[15px] text-[var(--apple-green)]">
                    恭喜！您已点亮全部 12 大学科门类视角。
                  </div>
                )}
              </div>

              <div className="apple-card rounded-2xl p-7 space-y-4">
                <h3 className="text-[18px] font-semibold">最近思辨严密性趋势</h3>
                <div className="space-y-3">
                  {profile.rigorHistory
                    .slice(-5)
                    .reverse()
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl apple-inset"
                      >
                        <div className="min-w-0">
                          <div className="text-[14.5px] font-medium truncate">{item.topic}</div>
                          <div className="text-[12.5px] text-[var(--text-tertiary)]">
                            {item.timestamp}
                          </div>
                        </div>
                        <span
                          className="font-mono font-semibold text-[18px] tabular-nums shrink-0"
                          style={{ color: "var(--apple-blue)" }}
                        >
                          {item.score} 分
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
