import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ragEngine } from "@/lib/rag";
import { buildLensUserPrompt, LENS_SYSTEM_PROMPT } from "@/lib/prompts";
import { callDeepSeekChatJson, resolveDeepSeekKey } from "@/lib/deepseek";
import { getLensDemoFallback } from "@/data/demo-presets";
import type { LensResponse } from "@/lib/types";

// Serverless 函数最长执行时长（秒）：Vercel Hobby 档上限 60s，
// 默认值仅 10s 不足以覆盖 LLM 推理耗时，必须显式声明避免请求被平台截断
export const maxDuration = 60;

const RequestSchema = z.object({
  topic: z.string().min(2, "请输入至少 2 个字的议题").max(500),
  enableRag: z.boolean().optional().default(true),
  instantDemo: z.boolean().optional().default(false),
});

const LensModelOutputSchema = z.object({
  topic: z.string().optional(),
  coreSynthesis: z.string().min(10),
  perspectives: z
    .array(
      z.object({
        discipline: z.string(),
        colorToken: z.string().default("indigo"),
        coreAssumption: z.string(),
        analyticalFramework: z.string(),
        insightSummary: z.string(),
        blindSpotWarning: z.string(),
        citationIds: z.array(z.string()).default([]),
      })
    )
    .min(1)
    .max(8),
  relations: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        type: z.enum(["synergy", "tension"]),
        label: z.string(),
      })
    )
    .default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedReq = RequestSchema.safeParse(body);
    if (!parsedReq.success) {
      return NextResponse.json(
        { error: parsedReq.error.issues[0]?.message || "请求参数错误" },
        { status: 400 }
      );
    }

    const { topic, enableRag, instantDemo } = parsedReq.data;
    const apiKey = resolveDeepSeekKey(req.headers.get("x-deepseek-key"));
    const citations = enableRag ? ragEngine.retrieve(topic, 6) : [];

    if (!apiKey || instantDemo) {
      const demo = getLensDemoFallback(topic);
      return NextResponse.json(demo);
    }

    try {
      const result = await callDeepSeekChatJson<z.infer<typeof LensModelOutputSchema>>({
        apiKey,
        systemPrompt: LENS_SYSTEM_PROMPT,
        userPrompt: buildLensUserPrompt(topic, citations),
      });

      const validated = LensModelOutputSchema.parse(result.data);
      const validChunkIds = new Set(citations.map((c) => c.chunkId));
      const colorPalette = ["indigo", "cyan", "emerald", "amber", "rose", "violet"];

      const perspectives = validated.perspectives.slice(0, 6).map((p, idx) => ({
        ...p,
        colorToken: colorPalette.includes(p.colorToken)
          ? p.colorToken
          : colorPalette[idx % colorPalette.length],
        citationIds: p.citationIds.filter((id) => validChunkIds.has(id)),
      }));

      const response: LensResponse = {
        topic: validated.topic || topic,
        coreSynthesis: validated.coreSynthesis,
        perspectives,
        relations: validated.relations,
        citations,
        usedModel: result.usedModel,
        isDemoMode: false,
      };

      return NextResponse.json(response);
    } catch (apiErr) {
      console.warn("[Lens API] DeepSeek 调用异常，平滑回退 Demo 模式:", apiErr);
      const fallback = getLensDemoFallback(topic);
      return NextResponse.json({
        ...fallback,
        usedModel: "deepseek-chat",
      });
    }
  } catch {
    return NextResponse.json({ error: "服务器解析请求失败" }, { status: 500 });
  }
}
