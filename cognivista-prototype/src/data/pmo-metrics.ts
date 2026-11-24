// 源自《CogniVista 观睿_工程管理期末大作业完整文稿.md》的 1 亿元全生命周期真实工程指标

export interface CbsItem {
  code: string;
  name: string;
  budget: number; // 万元
  ratio: number;  // 百分比
  color: string;
  details: string;
}

export const CBS_ITEMS: CbsItem[] = [
  {
    code: "CBS-01",
    name: "大模型算力与混合底座",
    budget: 2200,
    ratio: 22.0,
    color: "#6366F1",
    details: "DeepSeek API 3年期专属算力池 (1100万) + 本地向量/微调集群 (750万) + 语义缓存网关 (350万)",
  },
  {
    code: "CBS-02",
    name: "全域跨学科知识库工程",
    budget: 2600,
    ratio: 26.0,
    color: "#06B6D4",
    details: "12大学科500万文献版权采购 (1200万) + 多模态OCR切片清洗 (800万) + 专家CoT图谱标引 (600万)",
  },
  {
    code: "CBS-03",
    name: "高颜值UI与智能体全栈研发",
    budget: 2800,
    ratio: 28.0,
    color: "#8B5CF6",
    details: "UI/UX与可视化引擎 (1050万) + DeepSeek多智能体与RAG后端 (1140万) + 多端教务适配 (610万)",
  },
  {
    code: "CBS-04",
    name: "质量安全与防幻觉护栏",
    budget: 600,
    ratio: 6.0,
    color: "#10B981",
    details: "AI幻觉检测与防代写网关 (320万) + 等保三级测评与红蓝压测审计 (280万)",
  },
  {
    code: "CBS-05",
    name: "PMO管理与百校推广赋能",
    budget: 800,
    ratio: 8.0,
    color: "#38BDF8",
    details: "36个月PMO监理与财务审计 (300万) + 百所高校试点推广与“观睿杯”思辨大赛 (500万)",
  },
  {
    code: "CBS-06",
    name: "项目不可预见费储备金池",
    budget: 1000,
    ratio: 10.0,
    color: "#F59E0B",
    details: "应急储备 Contingency Reserve (600万，纳入BAC) + 管理储备 Management Reserve (400万)",
  },
];

export interface SCurvePoint {
  quarter: string;
  months: string;
  phase: string;
  pvPeriod: number;
  pvCum: number;
  evCum: number | null;
  acCum: number | null;
  note: string;
}

export const S_CURVE_DATA: SCurvePoint[] = [
  { quarter: "Q1", months: "M1-M3", phase: "启动阶段", pvPeriod: 300, pvCum: 300, evCum: 300, acCum: 295, note: "痛点调研、立项可研、架构设计" },
  { quarter: "Q2", months: "M4-M6", phase: "规划阶段", pvPeriod: 900, pvCum: 1200, evCum: 1180, acCum: 1190, note: "UI高保真规范、硬件与首批版权、API签约" },
  { quarter: "Q3", months: "M7-M9", phase: "执行高峰", pvPeriod: 1400, pvCum: 2600, evCum: 2520, acCum: 2590, note: "向量集群上架、6学科文献清洗、核心框架" },
  { quarter: "Q4", months: "M10-M12", phase: "执行高峰", pvPeriod: 1600, pvCum: 4200, evCum: 4050, acCum: 4210, note: "大规模向量化入库、DeepSeek路由、星系图开发" },
  { quarter: "Q5", months: "M13-M15", phase: "执行高峰", pvPeriod: 1500, pvCum: 5700, evCum: 5410, acCum: 5640, note: "后6学科版权尾款与CoT精标、思辨/沙盘前端" },
  { quarter: "Q6", months: "M16-M18", phase: "M18中期监控", pvPeriod: 1200, pvCum: 6900, evCum: 6500, acCum: 6800, note: "全模块深度联调、安全护栏、M18 EVM体检节点" },
  { quarter: "Q7", months: "M19-M21", phase: "执行收尾", pvPeriod: 900, pvCum: 7800, evCum: null, acCum: null, note: "多模态自动清洗纠偏、语义缓存上线与千万级压测" },
  { quarter: "Q8", months: "M22-M24", phase: "监控与试点", pvPeriod: 700, pvCum: 8500, evCum: null, acCum: null, note: "等保三级测评、首批10所高校5万名学生公测" },
  { quarter: "Q9", months: "M25-M27", phase: "收尾与推广", pvPeriod: 400, pvCum: 8900, evCum: null, acCum: null, note: "全国百校推广启动、第二年API算力结算" },
  { quarter: "Q10", months: "M28-M30", phase: "收尾与推广", pvPeriod: 300, pvCum: 9200, evCum: null, acCum: null, note: "“观睿杯”全国跨学科思辨大赛运营与增量更新" },
  { quarter: "Q11", months: "M31-M33", phase: "收尾与推广", pvPeriod: 250, pvCum: 9450, evCum: null, acCum: null, note: "第三年算力结算、高校应用成效数据采集" },
  { quarter: "Q12", months: "M34-M36", phase: "竣工决算", pvPeriod: 150, pvCum: 9600, evCum: null, acCum: null, note: "竣工决算审计、项目后评价报告归档" },
];

export const M18_WBS_EVM = [
  { wbs: "1.0 项目管理与立项规划", bac: 600, pv: 360, ev: 360, ac: 350, cpi: 1.0286, spi: 1.0 },
  { wbs: "2.0 混合底座与 DeepSeek 网关", bac: 2200, pv: 1540, ev: 1584, ac: 1560, cpi: 1.0154, spi: 1.0286 },
  { wbs: "3.0 全域跨学科知识库工程", bac: 2600, pv: 2210, ev: 1950, ac: 2180, cpi: 0.8945, spi: 0.8824 },
  { wbs: "4.0 认知智能体与后端工程", bac: 1400, pv: 1120, ev: 1092, ac: 1130, cpi: 0.9664, spi: 0.975 },
  { wbs: "5.0 高颜值交互式 UI 前端", bac: 1400, pv: 1050, ev: 952, ac: 1040, cpi: 0.9154, spi: 0.9067 },
  { wbs: "6.0 质量安全测评与推广运营", bac: 800, pv: 320, ev: 304, ac: 300, cpi: 1.0133, spi: 0.95 },
  { wbs: "7.1 应急储备池（纳入BAC）", bac: 600, pv: 300, ev: 258, ac: 240, cpi: 1.075, spi: 0.86 },
];

export const M18_SUMMARY = {
  totalBudget: 10000,
  bac: 9600,
  managementReserve: 400,
  pv: 6900,
  ev: 6500,
  ac: 6800,
  cv: -300,
  sv: -400,
  cpi: 0.9559,
  spi: 0.942,
  tcpi: 1.1071,
  eacAtypical: 9900,
  eacTypical: 10042.89,
  eacCombined: 10242.66,
  correctiveActions: [
    {
      title: "多模态自动校对降本（知识库纠偏）",
      detail: "引入 MinerU + DeepSeek-VL 自动校对复杂数学/古籍公式 PDF，单页清洗成本压降 45%，Q7 追回 200 万元成本偏差。",
    },
    {
      title: "向量语义缓存层（算力池对冲）",
      detail: "在 DeepSeek API 网关前增设高频通识议题向量语义缓存，节省后续 25% Token 消耗（约 180 万元）。",
    },
    {
      title: "图形学专家支援星系图渲染",
      detail: "抽调 2 名图形学专家切换硬件加速架构，2 周内消除千节点掉帧并追回 0.5 个月工期。",
    },
    {
      title: "基准内成本全额对冲",
      detail: "以节约的 300 万元填平 M18 负偏差，使剩余周期 CPI ≥ 1.11，确保 9,600 万 BAC 内准时竣工。",
    },
  ],
};

export interface RiskItem {
  id: string;
  category: string;
  description: string;
  p: number; // 1-5
  i: number; // 1-5
  score: number;
  level: "高危" | "中危" | "低危";
  strategy: string;
  mitigation: string;
  contingency: string;
  owner: string;
}

export const RISK_REGISTER: RiskItem[] = [
  {
    id: "RSK-01",
    category: "技术与外部依赖",
    description: "DeepSeek 官方 API 在期末/选课高峰期出现公网拥塞、限流或短暂中断",
    p: 3,
    i: 5,
    score: 15,
    level: "高危",
    strategy: "减轻 + 转移",
    mitigation: "签署企业级高并发 SLA 协议；部署本地语义缓存层拦截 35% 重复请求；封装标准化多活网关。",
    contingency: "延迟 > 5s 或错误率 > 2% 时，500ms 内无感故障转移至备用托管集群或 Demo 兜底通道。",
    owner: "AI 首席架构师",
  },
  {
    id: "RSK-02",
    category: "质量与伦理",
    description: "跨学科复杂议题下大模型产生“学术幻觉”或隐性偏见误导本科生",
    p: 4,
    i: 4,
    score: 16,
    level: "高危",
    strategy: "减轻 + 规避",
    mitigation: "强制开启 RAG 强溯源引用；思辨场红蓝双边平衡呈现；部署本地安全护栏与防代写引擎。",
    contingency: "周度幻觉率 > 1.5% 时一键下线问题 Prompt 模板，24 小时内增补权威切片并激活纠错弹窗。",
    owner: "知识工程与 QA 总监",
  },
  {
    id: "RSK-03",
    category: "知识产权合规",
    description: "海量跨学科知识库资源文件引发第三方出版社或数据库版权纠纷",
    p: 2,
    i: 5,
    score: 10,
    level: "中危",
    strategy: "规避 + 转移",
    mitigation: "1,200 万元正规采购校园镜像授权；合同约定版权瑕疵赔付责任；前端仅展示必要切片摘要。",
    contingency: "收到异议函后知识库后台秒级按文档 ID 下架并软删除对应切片。",
    owner: "知识工程总监",
  },
  {
    id: "RSK-04",
    category: "前端性能体验",
    description: "高颜值跨学科知识星系图在低配学生设备上出现严重掉帧或内存溢出",
    p: 3,
    i: 3,
    score: 9,
    level: "中危",
    strategy: "减轻",
    mitigation: "采用轻量矢量渲染与 LOD 按需加载；实时监控客户端 FPS 帧率。",
    contingency: "FPS 连续 3 秒低于 24 帧时自动优雅降级为轻量级毛玻璃卡片矩阵视图。",
    owner: "前端架构师",
  },
  {
    id: "RSK-05",
    category: "业务推广与粘性",
    description: "部分学生倾向于“直接要现成答案”，觉得苏格拉底追问“太费脑”而流失",
    p: 3,
    i: 4,
    score: 12,
    level: "高危",
    strategy: "减轻",
    mitigation: "引入“学科边界点亮进度”游戏化激励；联合高校嵌入通识核心研讨课平时考核。",
    contingency: "月活留存 < 45% 时优化交互节奏，提供“先给三维认知框架卡片，再做轻量阶梯追问”模式。",
    owner: "项目经理 (PM)",
  },
];

export const POST_EVALUATION_HIGHLIGHTS = [
  { label: "实际总工期", value: "35.5 个月", sub: "较 36 个月基准提前 0.5 个月" },
  { label: "实际决算支出", value: "9,540.00 万", sub: "较 BAC 结余 60 万，未动用管理储备" },
  { label: "实测幻觉率", value: "1.12%", sub: "优于 ≤1.5% SLA 控制红线" },
  { label: "百校赋能规模", value: "118 校 / 135 万人", sub: "生均年成本 23.56 元" },
];
