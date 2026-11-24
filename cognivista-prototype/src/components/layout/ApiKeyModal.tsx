"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, CheckCircle2, AlertTriangle, X, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { useCognitive } from "@/components/providers/CognitiveProvider";

export function ApiKeyModal() {
  const { apiKey, setApiKey, serverHasEnvKey, apiKeyModalOpen, setApiKeyModalOpen } = useCognitive();
  const [draft, setDraft] = useState(apiKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    setDraft(apiKey);
    setTestResult(null);
  }, [apiKey, apiKeyModalOpen]);

  const handleSaveAndTest = async () => {
    const trimmed = draft.trim();
    setApiKey(trimmed);
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(trimmed ? { "x-deepseek-key": trimmed } : {}),
        },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      const data = await res.json();
      setTestResult({
        ok: Boolean(data.ok),
        message: data.message || "检测完成",
      });
    } catch {
      setTestResult({ ok: false, message: "网络请求失败，请检查服务端运行状态。" });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    setDraft("");
    setApiKey("");
    setTestResult({
      ok: false,
      message: "已清除本地 Key，系统将使用内置演示推演模式。",
    });
  };

  return (
    <AnimatePresence>
      {apiKeyModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setApiKeyModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl apple-glass-sheet p-7 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="apikey-modal-title"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                  style={{
                    background:
                      "linear-gradient(145deg, var(--apple-blue), var(--apple-indigo))",
                  }}
                >
                  <KeyRound className="w-6 h-6" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 id="apikey-modal-title" className="text-[20px] font-semibold tracking-tight">
                    DeepSeek 推理引擎配置
                  </h3>
                  <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
                    自动调度 <code className="font-mono">deepseek-chat</code> 与{" "}
                    <code className="font-mono">deepseek-reasoner</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition apple-focus"
                aria-label="关闭窗口"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {serverHasEnvKey && !draft && (
              <div className="mb-5 rounded-2xl bg-[#34C759]/10 border border-[#34C759]/30 px-4 py-3 text-[14px] text-[var(--apple-green)] flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>服务端环境变量已配置 DEEPSEEK_API_KEY，当前已可直接在线推理。</span>
              </div>
            )}

            <div className="space-y-3">
              <label
                htmlFor="deepseek-key-input"
                className="block text-[14px] font-medium text-[var(--text-secondary)]"
              >
                DeepSeek API Key（可选，留空自动使用离线演示推演）
              </label>
              <input
                id="deepseek-key-input"
                type="password"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded-2xl apple-input px-4 py-3.5 text-[15px] font-mono"
              />
              <div className="flex items-start gap-2.5 text-[13px] text-[var(--text-secondary)] leading-relaxed pt-1">
                <ShieldCheck
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: "var(--apple-blue)" }}
                />
                <span>
                  密钥仅缓存在浏览器本地，经由 Next.js 服务端安全代理转发，不暴露浏览器跨域请求。
                </span>
              </div>
            </div>

            {testResult && (
              <div
                className={`mt-5 rounded-2xl px-4 py-3 text-[14px] flex items-start gap-2.5 border ${
                  testResult.ok
                    ? "bg-[#34C759]/10 border-[#34C759]/30 text-[var(--apple-green)]"
                    : "bg-[#FF9500]/10 border-[#FF9500]/30 text-[var(--apple-orange)]"
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleClear}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--apple-red)] hover:bg-[#FF3B30]/10 transition apple-focus"
              >
                <Trash2 className="w-4 h-4" />
                清除密钥
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setApiKeyModalOpen(false)}
                  type="button"
                  className="px-5 py-2.5 rounded-full text-[14px] font-medium apple-inset hover:bg-[var(--bg-inset-hover)] transition apple-focus"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveAndTest}
                  disabled={testing}
                  type="button"
                  style={{ backgroundColor: "var(--apple-blue)" }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-medium text-white shadow-sm hover:brightness-110 disabled:opacity-60 transition apple-focus active:scale-[0.98]"
                >
                  {testing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {draft.trim() ? "保存并测试连接" : "使用演示模式"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
