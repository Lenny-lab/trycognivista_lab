"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  KeyRound,
  Menu,
  X,
} from "lucide-react";
import { useCognitive } from "@/components/providers/CognitiveProvider";
import { ApiKeyModal } from "@/components/layout/ApiKeyModal";
import { CitationDrawer } from "@/components/layout/CitationDrawer";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/lens", matchPaths: ["/", "/lens"], label: "认知透镜" },
  { href: "/socratic", matchPaths: ["/socratic"], label: "苏格拉底思辨" },
  { href: "/decision", matchPaths: ["/decision"], label: "决策沙盘" },
  { href: "/knowledge", matchPaths: ["/knowledge"], label: "知识中心" },
  { href: "/pmo", matchPaths: ["/pmo"], label: "PMO 驾驶舱" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLiveReady, theme, toggleTheme, setApiKeyModalOpen, profile } = useCognitive();

  const litCount = Math.min(12, Object.keys(profile.exploredDisciplines).length);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* 全宽悬浮式 Apple Liquid Glass 顶部导航栏（无拥挤左侧边栏，释放最大空间感） */}
      <header className="sticky top-0 z-30 h-[64px] apple-glass-chrome border-b">
        <div className="max-w-[1440px] h-full mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <Link
            href="/lens"
            className="flex items-center gap-3 shrink-0 apple-focus rounded-xl py-1"
          >
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="3.2" fill="currentColor" />
                <ellipse cx="18" cy="18" rx="15" ry="6.8" stroke="currentColor" strokeWidth="1.4" transform="rotate(-32 18 18)" />
                <ellipse cx="18" cy="18" rx="15" ry="6.8" stroke="currentColor" strokeWidth="1.4" transform="rotate(32 18 18)" opacity=".55" />
                <circle cx="30.2" cy="10.1" r="2" fill="currentColor" />
              </svg>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-[18px] font-semibold tracking-tight">CogniVista</span>
              <span className="text-[14px] font-medium text-[var(--text-secondary)] hidden sm:inline">
                观睿
              </span>
            </div>
          </Link>

          {/* Center Floating Pill Navigation */}
          <nav
            aria-label="主功能导航"
            className="hidden lg:flex items-center gap-1 p-1.5 rounded-full apple-inset"
          >
            {NAV_ITEMS.map((item) => {
              const active = item.matchPaths.includes(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-5 py-2 rounded-full text-[14.5px] font-medium transition-colors apple-focus",
                    active
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="top-nav-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-full bg-[var(--bg-card)] shadow-sm border border-[var(--border-hairline)]"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* 学科探索进度徽章 */}
            <Link
              href="/knowledge"
              className="hidden xl:inline-flex items-center gap-2 px-3.5 py-2 rounded-full apple-inset hover:bg-[var(--bg-inset-hover)] text-[13px] font-medium transition apple-focus"
              title="查看个人 12 学科认知画像"
            >
              <span className="text-[var(--text-secondary)]">已点亮</span>
              <span
                className="font-mono font-semibold tabular-nums"
                style={{ color: "var(--apple-blue)" }}
              >
                {litCount}/12 学科
              </span>
            </Link>

            {/* DeepSeek 引擎状态胶囊 */}
            <button
              onClick={() => setApiKeyModalOpen(true)}
              type="button"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 min-h-[38px] rounded-full text-[13px] font-medium border transition cursor-pointer apple-focus active:scale-[0.98]",
                isLiveReady
                  ? "bg-[#34C759]/10 border-[#34C759]/30 text-[var(--apple-green)] hover:bg-[#34C759]/15"
                  : "bg-[#FF9500]/10 border-[#FF9500]/30 text-[var(--apple-orange)] hover:bg-[#FF9500]/15"
              )}
              title="配置 DeepSeek API Key"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: isLiveReady
                    ? "var(--apple-green-vivid)"
                    : "var(--apple-orange-vivid)",
                }}
              />
              <span className="hidden sm:inline">
                {isLiveReady ? "DeepSeek R1/V3" : "演示模式"}
              </span>
              <KeyRound className="w-3.5 h-3.5 opacity-80" strokeWidth={1.9} />
            </button>

            {/* Light/Dark Segmented Toggle */}
            <button
              onClick={toggleTheme}
              type="button"
              className="inline-flex items-center gap-1 p-1 rounded-full apple-inset apple-focus transition active:scale-[0.98]"
              title={theme === "dark" ? "切换至浅色外观" : "切换至深色外观"}
              aria-label="切换浅色或深色外观"
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition",
                  theme === "light"
                    ? "bg-[var(--bg-card)] shadow-sm text-[var(--apple-orange)]"
                    : "text-[var(--text-tertiary)]"
                )}
              >
                <Sun className="w-4 h-4" strokeWidth={2} />
              </span>
              <span
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition",
                  theme === "dark"
                    ? "bg-[var(--bg-card)] shadow-sm text-[var(--apple-blue)]"
                    : "text-[var(--text-tertiary)]"
                )}
              >
                <Moon className="w-4 h-4" strokeWidth={2} />
              </span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-full apple-inset hover:bg-[var(--bg-inset-hover)] transition"
              aria-label="打开导航菜单"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/35 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full apple-glass-sheet p-6 flex flex-col">
            <div className="flex items-center justify-between pb-5 border-b border-[var(--border-hairline)]">
              <span className="text-[18px] font-semibold">CogniVista 观睿</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
                aria-label="关闭菜单"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-6 space-y-2">
              {NAV_ITEMS.map((item) => {
                const active = item.matchPaths.includes(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block px-4 py-3.5 rounded-2xl text-[16px] font-medium transition",
                      active
                        ? "bg-[var(--apple-blue)] text-white shadow-sm"
                        : "hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Spacious Centered Main Canvas */}
      <main
        className={cn(
          "flex-1 w-full",
          !NAV_ITEMS[0].matchPaths.includes(pathname) &&
            "max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14"
        )}
      >
        {children}
      </main>

      {/* Minimal Editorial Footer */}
      <footer className="border-t border-[var(--border-hairline)] py-8 mt-0">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[var(--text-tertiary)]">
          <span>CogniVista 观睿 · 大学本科生全域认知智能赋能平台</span>
          <span>拓展认知边界 · 辅助理性思辨 · 支撑权衡判断</span>
        </div>
      </footer>

      <ApiKeyModal />
      <CitationDrawer />
    </div>
  );
}
