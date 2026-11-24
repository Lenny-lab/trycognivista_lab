import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ragEngine, TWELVE_DISCIPLINES } from "@/lib/rag";

const UploadSchema = z.object({
  fileName: z.string().min(1),
  title: z.string().min(1, "请填写文档标题").max(120),
  discipline: z.string().min(1, "请选择所属学科"),
  author: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  content: z.string().min(20, "文档内容至少需要 20 个字符").max(200000),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const discipline = searchParams.get("discipline") || undefined;
  const topK = Math.min(20, Math.max(1, Number(searchParams.get("topK") || 8)));

  const documents = ragEngine.listDocuments();
  const filteredDocs = discipline
    ? documents.filter((d) => d.discipline === discipline)
    : documents;
  const chunks = ragEngine.retrieve(query, topK, discipline);

  return NextResponse.json({
    totalDocuments: documents.length,
    totalChunks: ragEngine.getTotalChunkCount(),
    disciplines: TWELVE_DISCIPLINES,
    documents: filteredDocs,
    chunks,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UploadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "上传文档格式不符合要求" },
        { status: 400 }
      );
    }

    const doc = ragEngine.ingestUploadedDocument(parsed.data);
    return NextResponse.json({
      message: `已成功切片入库（新增 ${doc.chunkCount} 个语义切片）`,
      document: doc,
      totalDocuments: ragEngine.listDocuments().length,
      totalChunks: ragEngine.getTotalChunkCount(),
    });
  } catch {
    return NextResponse.json({ error: "知识库入库解析失败" }, { status: 500 });
  }
}
