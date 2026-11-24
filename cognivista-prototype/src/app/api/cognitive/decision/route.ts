import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ragEngine } from "@/lib/rag";
import { buildDecisionUserPrompt, DECISION_SYSTEM_PROMPT } from "@/lib/prompts";
import { callDeepSeekChatJson, resolveDeepSeekKey } from "@/lib/deepseek";
import { getDecisionDemoFallback } from "@/data/demo-presets";
import type { DecisionResponse } from "@/lib/types";

// Serverless 函数最长执行时长（秒）：Vercel Hobby 档上限 60s，
// 默认值仅 10s 不足以覆盖 LLM 推理耗时，必须显式声明避免请求被平台截断
export const maxDuration = 60;

const RequestSchema = z.object({
  dilemma: z.string().min(4, "请简要描述你的决策情境").max(1000),
  options: z
    .array(z.string().min(1))
    .min(2, "请至少输入 2 个备选方案")
    .max(4, "最多支持 4 个方案并行推演"),
  weights: z.object({
    longTermCeiling: z.number().min(0).max(100),
    shortTermCertainty: z.number().min(0).max(100),
    riskResilience: z.number().min(0).max(100),
    costEfficiency: z.number().min(0).max(100),
    passionAlignment: z.number().min(0).max(100),
  }),
  instantDemo: z.boolean().optional().default(false),
});

const DecisionModelOutputSchema = z.object({
  dilemma: z.string().optional(),
  overallGuidance: z.string(),
  evaluations: z
    .array(
      z.object({
        optionName: z.string(),
        scores: z.object({
          longTermCeiling: z.number().min(0).max(100),
          shortTermCertainty: z.number().min(0).max(100),
          riskResilience: z.number().min(0).max(100),
          costEfficiency: z.number().min(0).max(100),
          passionAlignment: z.number().min(0).max(100),
        }),
        shortTermYield: z.number().min(0).max(100),
        longTermYield: z.number().min(0).max(100),
        swot: z.object({
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string()),
          opportunities: z.array(z.string()),
          threats: z.array(z.string()),
        }),
        worstCaseScenario: z.string(),
        mitigationPlan: z.string(),
      })
    )
    .min(2),
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

    const reqData = parsedReq.data;
    const apiKey = resolveDeepSeekKey(req.headers.get("x-deepseek-key"));
    const citations = ragEngine.retrieve(`${reqData.dilemma} 多准则决策 SWOT 机会成本`, 4);

    if (!apiKey || reqData.instantDemo) {
      return NextResponse.json(getDecisionDemoFallback(reqData));
    }

    try {
      const result = await callDeepSeekChatJson<
        z.infer<typeof DecisionModelOutputSchema>
      >({
        apiKey,
        systemPrompt: DECISION_SYSTEM_PROMPT,
        userPrompt: buildDecisionUserPrompt(
          reqData.dilemma,
          reqData.options,
          reqData.weights,
          citations
        ),
      });

      const validated = DecisionModelOutputSchema.parse(result.data);
      const response: DecisionResponse = {
        dilemma: validated.dilemma || reqData.dilemma,
        overallGuidance: validated.overallGuidance,
        evaluations: validated.evaluations,
        citations,
        usedModel: result.usedModel,
        isDemoMode: false,
      };

      return NextResponse.json(response);
    } catch (apiErr) {
      console.warn("[Decision API] DeepSeek 调用异常，平滑回退 Demo 模式:", apiErr);
      const fallback = getDecisionDemoFallback(reqData);
      return NextResponse.json({
        ...fallback,
        usedModel: "deepseek-chat",
      });
    }
  } catch {
    return NextResponse.json({ error: "服务器解析请求失败" }, { status: 500 });
  }
}
