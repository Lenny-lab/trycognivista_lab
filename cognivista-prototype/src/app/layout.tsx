import type { Metadata } from "next";
import "./globals.css";
import { CognitiveProvider } from "@/components/providers/CognitiveProvider";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "CogniVista 观睿 — 大学本科生全域认知智能赋能平台",
  description:
    "拓展认知边界 · 辅助理性思辨 · 支撑权衡判断 | 基于 DeepSeek R1/V3 与 12 学科 Hybrid RAG 的认知工作台",
  icons: {
    icon: [{ url: "/brand/cognivista-mark.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased min-h-screen font-sans">
        <CognitiveProvider>
          <AppShell>{children}</AppShell>
        </CognitiveProvider>
      </body>
    </html>
  );
}
