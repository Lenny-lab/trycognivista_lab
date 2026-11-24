import fs from "fs";
import path from "path";
import type { KnowledgeCitation, KnowledgeDocumentSummary } from "./types";

export interface KBChunk {
  chunkId: string;
  docId: string;
  docTitle: string;
  discipline: string;
  author: string;
  keywords: string[];
  sectionHeading: string;
  content: string;
  tokens: string[];
  tf: Map<string, number>;
}

interface StoredUploadedDoc {
  id: string;
  fileName: string;
  title: string;
  discipline: string;
  author: string;
  keywords: string[];
  rawContent: string;
  createdAt: string;
}

const KB_DIR = path.join(process.cwd(), "src", "data", "knowledge-base");
const UPLOADS_FILE = path.join(process.cwd(), "src", "data", "kb-uploads.json");

export const TWELVE_DISCIPLINES = [
  "哲学",
  "经济学",
  "法学",
  "计算机科学",
  "社会学",
  "心理学",
  "管理学",
  "系统科学",
  "文学",
  "历史学",
  "教育学",
  "医学",
] as const;

/**
 * 中英文混合分词：提取英文单词、数字及中文 2-gram / 3-gram 词组，兼顾单字兜底
 */
export function tokenizeText(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/[`*_#>\[\]()（）《》“”"'：:，,。.！？!?、；;]/g, " ");

  const tokens: string[] = [];

  // 英文词与数字
  const asciiMatches = normalized.match(/[a-z0-9]{2,}/g);
  if (asciiMatches) {
    tokens.push(...asciiMatches);
  }

  // 中文连续片段提取 2-gram 与 3-gram
  const cjkRuns = normalized.match(/[\u4e00-\u9fa5]+/g);
  if (cjkRuns) {
    for (const run of cjkRuns) {
      if (run.length === 1) {
        tokens.push(run);
        continue;
      }
      for (let i = 0; i <= run.length - 2; i++) {
        tokens.push(run.slice(i, i + 2));
      }
      for (let i = 0; i <= run.length - 3; i++) {
        tokens.push(run.slice(i, i + 3));
      }
    }
  }

  return tokens;
}

function parseFrontmatter(raw: string): {
  meta: { title: string; discipline: string; author: string; keywords: string[] };
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return {
      meta: {
        title: "未命名跨学科资源",
        discipline: "跨学科",
        author: "用户上传",
        keywords: [],
      },
      body: raw,
    };
  }

  const headerLines = match[1].split(/\r?\n/);
  const record: Record<string, string> = {};
  for (const line of headerLines) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx + 1).trim();
      record[k] = v;
    }
  }

  return {
    meta: {
      title: record.title || "未命名文档",
      discipline: record.discipline || "跨学科",
      author: record.author || "CogniVista 教研组",
      keywords: (record.keywords || "")
        .split(/[,，、]/)
        .map((s) => s.trim())
        .filter(Boolean),
    },
    body: match[2],
  };
}

function chunkMarkdownBody(
  docId: string,
  meta: { title: string; discipline: string; author: string; keywords: string[] },
  body: string
): KBChunk[] {
  const sections = body.split(/(?=^##\s+)/m).map((s) => s.trim()).filter(Boolean);
  const chunks: KBChunk[] = [];
  let chunkCounter = 1;

  const pushChunk = (sectionHeading: string, content: string) => {
    const cleanContent = content.trim();
    if (!cleanContent) return;
    const chunkId = `${docId}-C${String(chunkCounter).padStart(2, "0")}`;
    chunkCounter += 1;
    const combinedForIndex = `${meta.title} ${meta.discipline} ${meta.keywords.join(" ")} ${sectionHeading} ${cleanContent}`;
    const tokens = tokenizeText(combinedForIndex);
    const tf = new Map<string, number>();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) || 0) + 1);
    }
    chunks.push({
      chunkId,
      docId,
      docTitle: meta.title,
      discipline: meta.discipline,
      author: meta.author,
      keywords: meta.keywords,
      sectionHeading,
      content: cleanContent,
      tokens,
      tf,
    });
  };

  for (const sec of sections) {
    const lines = sec.split(/\r?\n/);
    let heading = "核心摘要";
    let textBody = sec;
    if (lines[0]?.startsWith("##")) {
      heading = lines[0].replace(/^##\s*/, "").trim();
      textBody = lines.slice(1).join("\n").trim();
    }

    if (textBody.length <= 420) {
      pushChunk(heading, textBody);
      continue;
    }

    // 长度超过 420 字符按段落/滑窗切分，保留约 50 字符重叠
    let start = 0;
    const targetSize = 340;
    const overlap = 50;
    while (start < textBody.length) {
      let end = Math.min(start + targetSize, textBody.length);
      if (end < textBody.length) {
        const nextPeriod = textBody.indexOf("。", end - 40);
        if (nextPeriod !== -1 && nextPeriod < end + 60) {
          end = nextPeriod + 1;
        }
      }
      pushChunk(heading, textBody.slice(start, end));
      if (end >= textBody.length) break;
      start = Math.max(end - overlap, start + 120);
    }
  }

  return chunks;
}

class LocalHybridRagEngine {
  private docs: KnowledgeDocumentSummary[] = [];
  private chunks: KBChunk[] = [];
  private df = new Map<string, number>();
  private avgDocLen = 100;
  private initialized = false;

  private loadAll() {
    this.docs = [];
    this.chunks = [];
    this.df.clear();

    // 1. 加载内置 Markdown 知识库
    if (fs.existsSync(KB_DIR)) {
      const files = fs
        .readdirSync(KB_DIR)
        .filter((f) => f.endsWith(".md"))
        .sort();

      files.forEach((fileName, index) => {
        const raw = fs.readFileSync(path.join(KB_DIR, fileName), "utf-8");
        const docIdMatch = fileName.match(/^(\d+)/);
        const docId = docIdMatch
          ? `KB-${docIdMatch[1].padStart(2, "0")}`
          : `KB-${String(index + 1).padStart(2, "0")}`;
        this.indexDocument(docId, fileName, raw, false);
      });
    }

    // 2. 加载用户动态上传文档
    if (fs.existsSync(UPLOADS_FILE)) {
      try {
        const uploadedRaw = fs.readFileSync(UPLOADS_FILE, "utf-8");
        const uploaded: StoredUploadedDoc[] = JSON.parse(uploadedRaw);
        for (const item of uploaded) {
          this.indexDocument(
            item.id,
            item.fileName,
            item.rawContent,
            true,
            {
              title: item.title,
              discipline: item.discipline,
              author: item.author,
              keywords: item.keywords,
            },
            item.createdAt
          );
        }
      } catch {
        // 忽略损坏缓存文件
      }
    }

    this.rebuildStats();
    this.initialized = true;
  }

  private indexDocument(
    docId: string,
    fileName: string,
    raw: string,
    isUploaded: boolean,
    overrideMeta?: {
      title: string;
      discipline: string;
      author: string;
      keywords: string[];
    },
    createdAt?: string
  ) {
    const parsed = parseFrontmatter(raw);
    const meta = overrideMeta || parsed.meta;
    const docChunks = chunkMarkdownBody(docId, meta, parsed.body);
    this.chunks.push(...docChunks);
    this.docs.push({
      id: docId,
      fileName,
      title: meta.title,
      discipline: meta.discipline,
      author: meta.author,
      keywords: meta.keywords,
      chunkCount: docChunks.length,
      charCount: parsed.body.length,
      isUploaded,
      createdAt,
    });
  }

  private rebuildStats() {
    this.df.clear();
    let totalLen = 0;
    for (const chunk of this.chunks) {
      totalLen += chunk.tokens.length;
      const seen = new Set(chunk.tokens);
      for (const term of seen) {
        this.df.set(term, (this.df.get(term) || 0) + 1);
      }
    }
    this.avgDocLen =
      this.chunks.length > 0 ? totalLen / this.chunks.length : 100;
  }

  private ensureInit() {
    if (!this.initialized) {
      this.loadAll();
    }
  }

  public listDocuments(): KnowledgeDocumentSummary[] {
    this.ensureInit();
    return [...this.docs];
  }

  public getChunkById(chunkId: string): KnowledgeCitation | null {
    this.ensureInit();
    const found = this.chunks.find((c) => c.chunkId === chunkId);
    if (!found) return null;
    return {
      chunkId: found.chunkId,
      docTitle: found.docTitle,
      discipline: found.discipline,
      relevanceScore: 0.95,
      excerpt: `【${found.sectionHeading}】${found.content}`,
    };
  }

  public getCitationsByIds(ids: string[]): KnowledgeCitation[] {
    this.ensureInit();
    const res: KnowledgeCitation[] = [];
    for (const id of ids) {
      const item = this.getChunkById(id);
      if (item) res.push(item);
    }
    return res;
  }

  public retrieve(
    query: string,
    topK = 6,
    disciplineFilter?: string
  ): KnowledgeCitation[] {
    this.ensureInit();
    const qTokens = tokenizeText(query);
    const pool = disciplineFilter
      ? this.chunks.filter((c) => c.discipline === disciplineFilter)
      : this.chunks;

    if (pool.length === 0) return [];

    // 若 Query 为空，返回各学科代表性首切片
    if (qTokens.length === 0) {
      return pool.slice(0, topK).map((c) => ({
        chunkId: c.chunkId,
        docTitle: c.docTitle,
        discipline: c.discipline,
        relevanceScore: 0.75,
        excerpt: `【${c.sectionHeading}】${c.content}`,
      }));
    }

    const N = Math.max(this.chunks.length, 1);
    const k1 = 1.5;
    const b = 0.75;
    const queryLower = query.toLowerCase();

    const scored = pool.map((chunk) => {
      let bm25 = 0;
      const docLen = Math.max(chunk.tokens.length, 1);

      for (const term of qTokens) {
        const freq = chunk.tf.get(term) || 0;
        if (freq === 0) continue;
        const docFreq = this.df.get(term) || 1;
        const idf = Math.log(1 + (N - docFreq + 0.5) / (docFreq + 0.5));
        const numerator = freq * (k1 + 1);
        const denominator = freq + k1 * (1 - b + b * (docLen / this.avgDocLen));
        bm25 += idf * (numerator / denominator);
      }

      // 学科关键词与标题加权加成
      let boost = 0;
      for (const kw of chunk.keywords) {
        if (queryLower.includes(kw.toLowerCase())) {
          boost += 3.5;
        }
      }
      if (queryLower.includes(chunk.discipline.toLowerCase())) {
        boost += 2.5;
      }
      if (
        chunk.sectionHeading
          .toLowerCase()
          .split(/[\s、（）()]+/)
          .some((part) => part.length >= 2 && queryLower.includes(part))
      ) {
        boost += 2.0;
      }

      return { chunk, rawScore: bm25 + boost };
    });

    scored.sort((a, bItem) => bItem.rawScore - a.rawScore);

    // 尽量保障跨学科多样性（在相关性接近时优先覆盖不同学科）
    const maxScore = Math.max(scored[0]?.rawScore || 1, 1);
    const selected: Array<{ chunk: KBChunk; score: number }> = [];
    const disciplineSeen = new Map<string, number>();

    for (const item of scored) {
      if (selected.length >= topK) break;
      const countForDisc = disciplineSeen.get(item.chunk.discipline) || 0;
      if (countForDisc >= 2 && scored.length > topK * 2) continue;
      disciplineSeen.set(item.chunk.discipline, countForDisc + 1);
      const normalized =
        item.rawScore > 0
          ? Math.min(0.99, Math.max(0.42, 0.45 + 0.54 * (item.rawScore / maxScore)))
          : 0.35;
      selected.push({ chunk: item.chunk, score: Number(normalized.toFixed(2)) });
    }

    return selected.map(({ chunk, score }) => ({
      chunkId: chunk.chunkId,
      docTitle: chunk.docTitle,
      discipline: chunk.discipline,
      relevanceScore: score,
      excerpt: `【${chunk.sectionHeading}】${chunk.content}`,
    }));
  }

  public ingestUploadedDocument(input: {
    fileName: string;
    title: string;
    discipline: string;
    author?: string;
    keywords?: string[];
    content: string;
  }): KnowledgeDocumentSummary {
    this.ensureInit();
    const existingUploads = this.docs.filter((d) => d.isUploaded).length;
    const docId = `KB-U${String(existingUploads + 1).padStart(2, "0")}`;
    const createdAt = new Date().toISOString();
    const keywords =
      input.keywords && input.keywords.length > 0
        ? input.keywords
        : [input.discipline, input.title.slice(0, 6)];

    const newRecord: StoredUploadedDoc = {
      id: docId,
      fileName: input.fileName,
      title: input.title,
      discipline: input.discipline,
      author: input.author || "师生共建上传",
      keywords,
      rawContent: input.content,
      createdAt,
    };

    this.indexDocument(
      docId,
      input.fileName,
      input.content,
      true,
      {
        title: newRecord.title,
        discipline: newRecord.discipline,
        author: newRecord.author,
        keywords: newRecord.keywords,
      },
      createdAt
    );
    this.rebuildStats();

    try {
      let existing: StoredUploadedDoc[] = [];
      if (fs.existsSync(UPLOADS_FILE)) {
        existing = JSON.parse(fs.readFileSync(UPLOADS_FILE, "utf-8"));
      }
      existing.push(newRecord);
      fs.writeFileSync(UPLOADS_FILE, JSON.stringify(existing, null, 2), "utf-8");
    } catch {
      // 只读文件系统环境下保持内存索引生效
    }

    return this.docs.find((d) => d.id === docId)!;
  }

  public getTotalChunkCount(): number {
    this.ensureInit();
    return this.chunks.length;
  }
}

export const ragEngine = new LocalHybridRagEngine();
