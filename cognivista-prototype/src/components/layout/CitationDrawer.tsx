"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, X, CheckCircle2, Layers } from "lucide-react";
import { useCognitive } from "@/components/providers/CognitiveProvider";

export function CitationDrawer() {
  const {
    drawerOpen,
    activeCitation,
    sessionCitations,
    openCitationDrawer,
    closeCitationDrawer,
  } = useCognitive();

  return (
    <AnimatePresence>
      {drawerOpen && activeCitation && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCitationDrawer}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 35 }}
            className="fixed right-4 top-4 bottom-4 z-50 w-[calc(100%-32px)] max-w-lg rounded-2xl apple-glass-sheet flex flex-col overflow-hidden"
            aria-label="知识库原文溯源检查器"
          >
            <div className="px-6 py-5 border-b border-[var(--border-hairline)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#34C759]/12 border border-[#34C759]/30 flex items-center justify-center text-[var(--apple-green)]">
                  <BookOpen className="w-5 h-5" strokeWidth={1.85} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold tracking-tight">知识库原文溯源</h3>
                  <p className="text-[13px] text-[var(--text-secondary)]">Hybrid RAG 强溯源切片验证</p>
                </div>
              </div>
              <button
                onClick={closeCitationDrawer}
                className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition apple-focus"
                aria-label="关闭检查器"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 当前聚焦切片 */}
              <div className="apple-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-mono font-semibold bg-[#34C759]/12 text-[var(--apple-green)]">
                    <CheckCircle2 className="w-4 h-4" />
                    {activeCitation.chunkId}
                  </span>
                  <span
                    className="text-[14px] font-mono font-semibold tabular-nums"
                    style={{ color: "var(--apple-blue)" }}
                  >
                    相关度 {(activeCitation.relevanceScore * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[13px] text-[var(--text-secondary)]">
                    学科门类：<span className="font-medium text-[var(--text-primary)]">{activeCitation.discipline}</span>
                  </div>
                  <div className="text-[17px] font-semibold leading-snug">
                    {activeCitation.docTitle}
                  </div>
                </div>

                <div className="p-4 rounded-2xl apple-inset text-[15px] leading-[1.8] font-serif text-[var(--text-primary)]">
                  {activeCitation.excerpt}
                </div>
              </div>

              {/* 关联切片切换 */}
              {sessionCitations.length > 1 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
                    <Layers className="w-4 h-4" style={{ color: "var(--apple-blue)" }} />
                    <span>本次推演命中的其他切片 ({sessionCitations.length})</span>
                  </div>
                  <div className="space-y-2.5">
                    {sessionCitations.map((item) => {
                      const isActive = item.chunkId === activeCitation.chunkId;
                      return (
                        <button
                          key={item.chunkId}
                          type="button"
                          onClick={() => openCitationDrawer(item, sessionCitations)}
                          className={`w-full text-left p-4 rounded-2xl transition apple-focus ${
                            isActive
                              ? "apple-card ring-2 ring-[var(--apple-blue)]/50"
                              : "apple-card apple-card-interactive"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[13px] mb-1">
                            <span className="font-mono font-semibold text-[var(--apple-green)]">
                              {item.chunkId} · {item.discipline}
                            </span>
                            <span className="font-mono text-[var(--text-secondary)] tabular-nums">
                              {(item.relevanceScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="text-[14.5px] font-medium truncate">{item.docTitle}</div>
                          <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 mt-1 leading-relaxed">
                            {item.excerpt}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
