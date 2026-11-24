import OpenAI from "openai";

// LLM 接入配置（默认沿用 DeepSeek，可通过环境变量切换为阿里云百炼 / DashScope 兼容接口）
const LLM_BASE_URL = process.env.LLM_BASE_URL?.trim() || "https://api.deepseek.com";
const LLM_CHAT_MODEL = process.env.LLM_CHAT_MODEL?.trim() || "deepseek-chat";
const LLM_REASONER_MODEL =
  process.env.LLM_REASONER_MODEL?.trim() ||
  process.env.LLM_CHAT_MODEL?.trim() ||
  "deepseek-reasoner";

// 思考模式开关：qwen3.x-flash 等思考模型默认开启思维链，在重提示下实测耗时 141s（推理 token 8700+），
// 会击穿客户端超时；置 LLM_ENABLE_THINKING=false 后同一请求实测 21s。未设置则不下发该参数（保持 DeepSeek 行为不变）。
const LLM_ENABLE_THINKING = (() => {
  const raw = process.env.LLM_ENABLE_THINKING?.trim().toLowerCase();
  if (raw === "true") return true;
  if (raw === "false") return false;
  return undefined;
})();

type ThinkingAwareBody = OpenAI.ChatCompletionCreateParamsNonStreaming & {
  enable_thinking?: boolean;
};

function applyThinking(body: ThinkingAwareBody): ThinkingAwareBody {
  if (LLM_ENABLE_THINKING !== undefined) {
    body.enable_thinking = LLM_ENABLE_THINKING;
  }
  return body;
}

export interface DeepSeekCallResult<T> {
  data: T;
  usedModel: string;
  reasoningProcess?: string;
}

export function resolveDeepSeekKey(headerKey?: string | null): string | null {
  const fromHeader = headerKey?.trim();
  if (fromHeader && fromHeader.length > 8) return fromHeader;
  const fromEnv = process.env.DEEPSEEK_API_KEY?.trim();
  if (fromEnv && fromEnv.length > 8) return fromEnv;
  return null;
}

export function extractJsonFromMarkdown(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    return fenced[1].trim();
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

export async function callDeepSeekChatJson<T>(options: {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}): Promise<DeepSeekCallResult<T>> {
  const client = new OpenAI({
    apiKey: options.apiKey,
    baseURL: LLM_BASE_URL,
    timeout: 90000,
    maxRetries: 0,
  });

  const completion = await client.chat.completions.create(
    applyThinking({
      model: LLM_CHAT_MODEL,
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
      temperature: options.temperature ?? 0.4,
      response_format: { type: "json_object" },
    })
  );

  const content = completion.choices[0]?.message?.content || "";
  const cleaned = extractJsonFromMarkdown(content);
  const parsed = JSON.parse(cleaned) as T;

  return {
    data: parsed,
    usedModel: completion.model || LLM_CHAT_MODEL,
  };
}

export async function callDeepSeekReasonerJson<T>(options: {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<DeepSeekCallResult<T>> {
  const client = new OpenAI({
    apiKey: options.apiKey,
    baseURL: LLM_BASE_URL,
    timeout: 90000,
    maxRetries: 0,
  });

  // 注意：deepseek-reasoner (R1) 不传 temperature 与 response_format，避免部分版本接口拒收
  const completion = await client.chat.completions.create(
    applyThinking({
      model: LLM_REASONER_MODEL,
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
    })
  );

  const msg = completion.choices[0]?.message as unknown as {
    content?: string | null;
    reasoning_content?: string | null;
  };

  const content = msg?.content || "";
  const reasoningProcess = msg?.reasoning_content || undefined;

  try {
    const cleaned = extractJsonFromMarkdown(content);
    const parsed = JSON.parse(cleaned) as T;
    return {
      data: parsed,
      usedModel: completion.model || LLM_REASONER_MODEL,
      reasoningProcess,
    };
  } catch {
    // 若 R1 偶发输出非严格 JSON，自动降级调用一次 deepseek-chat 做结构化提取
    const repair = await callDeepSeekChatJson<T>({
      apiKey: options.apiKey,
      systemPrompt:
        "你是严格的 JSON 结构化抽取器。请把下面文本中的分析结果无损提取并整理为合法 JSON 对象，只输出 JSON。",
      userPrompt: `目标格式说明：\n${options.systemPrompt}\n\n待抽取内容：\n${content}`,
      temperature: 0.1,
    });
    return {
      data: repair.data,
      usedModel: `${LLM_REASONER_MODEL} + ${LLM_CHAT_MODEL} (JSON修复)`,
      reasoningProcess,
    };
  }
}

export async function testDeepSeekConnection(apiKey: string): Promise<{
  ok: boolean;
  model?: string;
  message: string;
}> {
  try {
    const client = new OpenAI({
      apiKey,
      baseURL: LLM_BASE_URL,
      timeout: 15000,
    });
    const res = await client.chat.completions.create({
      model: LLM_CHAT_MODEL,
      messages: [{ role: "user", content: "Reply with OK only." }],
      max_tokens: 8,
    });
    return {
      ok: true,
      model: res.model || LLM_CHAT_MODEL,
      message: "大模型 API 连通性校验成功，已启用实时推理引擎。",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "连接 DeepSeek API 失败";
    return {
      ok: false,
      message: msg,
    };
  }
}
