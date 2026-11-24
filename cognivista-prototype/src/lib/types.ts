// src/lib/types.ts

export interface KnowledgeCitation {
  chunkId: string;        // 例如 "KB-02-C03"
  docTitle: string;       // 例如 "《制度经济学与外部性导论》"
  discipline: string;     // 例如 "经济学"
  relevanceScore: number; // 0~1
  excerpt: string;        // 原文切片内容
}

export interface KnowledgeDocumentSummary {
  id: string;             // 例如 "KB-01"
  fileName: string;
  title: string;
  discipline: string;
  author: string;
  keywords: string[];
  chunkCount: number;
  charCount: number;
  isUploaded?: boolean;
  createdAt?: string;
}

// 1. 全域跨学科认知透镜
export interface LensRequest {
  topic: string;
  enableRag?: boolean;
}

export type DisciplineColorToken =
  | "indigo"
  | "cyan"
  | "emerald"
  | "amber"
  | "rose"
  | "violet";

export interface DisciplinePerspective {
  discipline: string;         // 学科名称
  colorToken: DisciplineColorToken | string; // indigo | cyan | emerald | amber | rose | violet
  coreAssumption: string;     // 该学科底层核心假设
  analyticalFramework: string;// 关键分析模型/工具
  insightSummary: string;     // 针对当前议题的深度剖析 (100-150字)
  blindSpotWarning: string;   // 该单一视角的认知盲区警示
  citationIds: string[];      // 引用的知识库切片 ID 列表
}

export interface LensRelation {
  from: string;
  to: string;
  type: "synergy" | "tension";
  label: string;
}

export interface LensResponse {
  topic: string;
  coreSynthesis: string;      // 跨学科综合元洞察
  perspectives: DisciplinePerspective[]; // 固定 6 个学科视角
  relations: LensRelation[];
  citations: KnowledgeCitation[];
  usedModel: string;
  isDemoMode: boolean;
}

// 2. 苏格拉底理性思辨场
export interface SocraticRequest {
  thesis: string;             // 用户输入的观点与论证
  previousRoundContext?: string; // 二轮修正时的历史上下文
}

export interface LogicalFallacyItem {
  name: string;               // 谬误名称，如 "虚假两难"
  severity: "high" | "medium" | "low";
  quoteFromUser: string;      // 触发该谬误的用户原句或隐含前提
  explanation: string;        // 诊断解释
}

export interface SocraticResponse {
  rigorScore: number;         // 0-100 逻辑严密性总分
  subScores: {
    evidenceStrength: number; // 论据充分性 (0-100)
    logicalConsistency: number;// 推理一致性 (0-100)
    premiseTransparency: number;// 隐含前提透明度 (0-100)
  };
  fallacies: LogicalFallacyItem[];
  proSideReinforcement: {
    coreKernel: string;       // 提炼用户观点中的合理内核
    academicArguments: string[]; // 3条更高维度的支撑论据
  };
  conSideChallenge: {
    devilsAdvocateThesis: string; // 反方核心反驳立论
    counterExamples: string[];    // 3条反例或反事实冲击
  };
  socraticQuestions: Array<{
    level: number;            // 1: 概念澄清 | 2: 前提追问 | 3: 边界与后果推演
    question: string;
    intentHint: string;
  }>;
  reasoningProcess?: string;  // 提取自 deepseek-reasoner 的 reasoning_content
  citations: KnowledgeCitation[];
  usedModel: string;
  isDemoMode: boolean;
}

// 3. 多维权衡判断决策沙盘
export interface DecisionWeights {
  longTermCeiling: number;    // 0-100
  shortTermCertainty: number;
  riskResilience: number;
  costEfficiency: number;
  passionAlignment: number;
}

export interface DecisionRequest {
  dilemma: string;            // 决策情境描述
  options: string[];          // 2-4 个备选方案
  weights: DecisionWeights;
}

export interface DecisionOptionEvaluation {
  optionName: string;
  scores: {
    longTermCeiling: number;  // 0-100 (原始客观分，前端结合滑块实时计算加权总分)
    shortTermCertainty: number;
    riskResilience: number;
    costEfficiency: number;
    passionAlignment: number;
  };
  shortTermYield: number;     // 1年内预期收益指数 0-100
  longTermYield: number;      // 5年内预期收益指数 0-100
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  worstCaseScenario: string;  // 最坏情境压力测试描述
  mitigationPlan: string;     // 止损与退路方案
}

export interface DecisionResponse {
  dilemma: string;
  overallGuidance: string;    // 非武断的权衡指导综述
  evaluations: DecisionOptionEvaluation[];
  citations: KnowledgeCitation[];
  usedModel: string;
  isDemoMode: boolean;
}

// 4. 个人认知成长画像 (localStorage)
export interface CognitiveProfileState {
  exploredDisciplines: Record<string, number>; // 12学科 -> 探索次数
  lensCount: number;
  socraticCount: number;
  decisionCount: number;
  rigorHistory: Array<{
    timestamp: string;
    score: number;
    topic: string;
  }>;
}
