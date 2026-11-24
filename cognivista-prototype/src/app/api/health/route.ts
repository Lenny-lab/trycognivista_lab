import { NextRequest, NextResponse } from "next/server";
import { resolveDeepSeekKey, testDeepSeekConnection } from "@/lib/deepseek";

export async function GET() {
  const hasServerEnvKey = Boolean(
    process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.trim().length > 8
  );
  return NextResponse.json({
    hasServerEnvKey,
  });
}

export async function POST(req: NextRequest) {
  const headerKey = req.headers.get("x-deepseek-key");
  let bodyKey: string | undefined;
  try {
    const body = await req.json();
    bodyKey = typeof body?.apiKey === "string" ? body.apiKey : undefined;
  } catch {
    // ignore empty body
  }
  const key = resolveDeepSeekKey(bodyKey || headerKey);
  if (!key) {
    return NextResponse.json(
      { ok: false, message: "未检测到有效 DeepSeek API Key，当前将使用内置学术 Demo 推演引擎。" },
      { status: 200 }
    );
  }
  const result = await testDeepSeekConnection(key);
  return NextResponse.json(result);
}
