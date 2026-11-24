import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ragEngine } from "@/lib/rag";
import { buildSocraticUserPrompt, SOCRATIC_SYSTEM_PROMPT } from "@/lib/prompts";
import { callDeepSeekReasonerJson, resolveDeepSeekKey } from "@/lib/deepseek";
import { getSocraticDemoFallback } from "@/data/demo-presets";
import type { SocraticResponse } from "@/lib/types";

// Serverless 函数最长执行时长（秒）：Vercel Hobby 档上限 60s，
// 默认值仅 10s 不足以覆盖 LLM 推理耗时，必须显式声明避免请求被平台截断
export const maxDuration = 60;

const RequestSchema = z.object({
  thesis: z.string().min(4, "请输入至少 4 个字的核心观点或论证").max(2000),
  previousRoundContext: z.string().max(2000).optional(),
  instantDemo: z.boolean().optional().default(false),
});

const SocraticModelOutputSchema = z.object({
  rigorScore: z.number().min(0).max(100),
  subScores: z.object({
    evidenceStrength: z.number().min(0).max(100),
    logicalConsistency: z.number().min(0).max(100),
    premiseTransparency: z.number().min(0).max(100),
  }),
  fallacies: z
    .array(
      z.object({
        name: z.string(),
        severity: z.enum(["high", "medium", "low"]).default("medium"),
        quoteFromUser: z.string(),
        explanation: z.string(),
      })
    )
    .default([]),
  proSideReinforcement: z.object({
    coreKernel: z.string(),
    academicArguments: z.array(z.string()).min(1),
  }),
  conSideChallenge: z.object({
    devilsAdvocateThesis: z.string(),
    counterExamples: z.array(z.string()).min(1),
  }),
  socraticQuestions: z
    .array(
      z.object({
        level: z.number(),
        question: z.string(),
        intentHint: z.string(),
      })
    )
    .min(1),
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

    const { thesis, previousRoundContext, instantDemo } = parsedReq.data;
    const apiKey = resolveDeepSeekKey(req.headers.get("x-deepseek-key"));
    const citations = ragEngine.retrieve(`${thesis} 逻辑谬误 批判性思维`, 5);

    if (!apiKey || instantDemo) {
      return NextResponse.json(getSocraticDemoFallback(thesis, previousRoundContext));
    }

    try {
      const result = await callDeepSeekReasonerJson<
        z.infer<typeof SocraticModelOutputSchema>
      >({
        apiKey,
        systemPrompt: SOCRATIC_SYSTEM_PROMPT,
        userPrompt: buildSocraticUserPrompt(thesis, citations, previousRoundContext),
      });

      const validated = SocraticModelOutputSchema.parse(result.data);
      const response: SocraticResponse = {
        ...validated,
        reasoningProcess: result.reasoningProcess,
        citations,
        usedModel: result.usedModel,
        isDemoMode: false,
      };

      return NextResponse.json(response);
    } catch (apiErr) {
      console.warn("[Socratic API] DeepSeek-R1 调用异常，平滑回退 Demo 模式:", apiErr);
      const fallback = getSocraticDemoFallback(thesis, previousRoundContext);
      return NextResponse.json({
        ...fallback,
        usedModel: "deepseek-reasoner",
      });
    }
  } catch {
    return NextResponse.json({ error: "服务器解析请求失败" }, { status: 500 });
  }
}
