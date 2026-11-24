import type { DecisionRequest } from "@/lib/types";

export const LENS_QUICK_TOPICS = [
  "生成式 AI 是否会重塑大学教育与版权秩序",
  "算法推荐如何制造信息茧房",
  "碳达峰约束下的产业转型权衡",
  "基因编辑技术的伦理边界",
];

export const SOCRATIC_PRESET_THESES = [
  "我认为大学生应当把所有课余时间都用来刷实习，学通识课没有实用价值，因为企业校招只看实习经历和简历项目，通识课对找工作毫无帮助。",
  "既然生成式 AI 写论文又快又好，大学应该全面允许学生用 AI 直接生成课程论文，禁止使用 AI 只是在抗拒历史潮流。",
  "大学期间谈恋爱或参加社团活动纯粹是浪费时间，不如把全部精力用来刷高 GPA 和考取各类职业证书。",
];

export interface DecisionTemplate {
  id: string;
  label: string;
  dilemma: string;
  options: string[];
  defaultWeights: DecisionRequest["weights"];
}

export const DECISION_TEMPLATES: DecisionTemplate[] = [
  {
    id: "career",
    label: "毕业去向：保研读博 vs 大厂就业 vs 跨界创业",
    dilemma:
      "计算机/经管交叉背景大三本科生面临毕业发展路径抉择：希望在 5 年尺度下兼顾成长上限与抗风险能力。",
    options: [
      "本校/顶尖高校保研读博",
      "头部科技大厂核心研发岗就业",
      "结合AI方向组建轻量级跨界创业团队",
    ],
    defaultWeights: {
      longTermCeiling: 85,
      shortTermCertainty: 60,
      riskResilience: 75,
      costEfficiency: 65,
      passionAlignment: 80,
    },
  },
  {
    id: "research",
    label: "科研选题：热门大模型应用 vs 冷门基础理论",
    dilemma:
      "大创/本科毕业论文及后续科研方向选择：在有限 18 个月周期内如何平衡论文产出确定性与学术壁垒。",
    options: [
      "热门生成式 AI 垂直应用工程",
      "长周期冷门跨学科基础理论探索",
      "AI + 传统学科方法论交叉融合",
    ],
    defaultWeights: {
      longTermCeiling: 80,
      shortTermCertainty: 70,
      riskResilience: 65,
      costEfficiency: 75,
      passionAlignment: 85,
    },
  },
  {
    id: "city",
    label: "城市选址：超一线高薪高压 vs 新一线均衡发展",
    dilemma:
      "本科毕业首站工作城市选择：权衡一线产业资源密度、生活居住成本与身心健康可持续性。",
    options: [
      "北京/上海超一线城市拼搏",
      "杭州/成都/苏州新一线都市圈",
      "高校/科研院所所在二线宜居城市",
    ],
    defaultWeights: {
      longTermCeiling: 75,
      shortTermCertainty: 70,
      riskResilience: 80,
      costEfficiency: 85,
      passionAlignment: 70,
    },
  },
];
