# 《CogniVista 观睿——大学本科生全域认知智能赋能平台》原型系统详尽技术开发文档（Agent-Ready Specification）

> **文档用途说明**：本文档为可直接交付给 AI Coding Agent（或全栈研发工程师）使用的**原型系统完整技术规范与开发蓝图**。文档严格对齐《工程管理》大作业总体设计，明确界定原型阶段的技术边界：**无需搭建重型本地 GPU 大模型服务，核心推理纯接入 DeepSeek 官方 API；同时在系统内部构建真实可用的轻量级跨学科知识库（Hybrid RAG）与极致高颜值现代前端 UI。**

---

## 1. 系统定位、核心原则与开发边界

### 1.1 原型定位
构建 **CogniVista 观睿** 的高保真可交互 Web 原型系统，服务于跨专业本科生的三大核心认知诉求：
1. **拓展认知边界**：输入任意议题，自动联动跨学科知识库生成多学科透视图谱与解构卡片。
2. **辅助理性思辨**：基于苏格拉底启发式对话，进行红蓝正反交锋、逻辑谬误诊断与思维链追问。
3. **支撑权衡判断**：针对复杂学业、科研与工程选择，提供动态权重滑块、雷达图与损益矩阵推演。

### 1.2 给开发 Agent 的关键约束（Architecture Guardrails）
1. **纯接入 DeepSeek 官方 API（零本地大模型部署）**：
   - 使用 OpenAI 兼容协议接入 `https://api.deepseek.com`（通过 `openai` 官方 Node SDK 或原生 `fetch`）。
   - 智能调度双模型：
     - **`deepseek-chat`（V3）**：负责快速生成结构化 JSON（跨学科透镜卡片、决策矩阵维度、知识库检索 query 改写）。
     - **`deepseek-reasoner`（R1）**：负责苏格拉底理性思辨场中的深度逻辑拆解、认知偏差诊断与正反方交锋（需提取并展示其 `reasoning_content` 思维链）。
   - **API Key 安全与无缝体验**：支持 `.env.local` 中的 `DEEPSEEK_API_KEY` 服务端环境变量，同时必须在前端右上角提供**「API 密钥配置弹窗」**（用户可在界面填入自己的 Key，通过请求头 `x-deepseek-key` 透传给 Next.js 服务端 Route Handler 代理转发，绝不从浏览器直连暴露跨域问题）。
   - **开箱即用 Demo 兜底机制（Mock Fallback）**：当用户未配置 API Key 或触发限流时，系统自动切换为内置的**高保真学术预设推演数据（Demo Mode）**并在顶部状态栏提示，确保界面所有交互、动画与图表 100% 可演示。
2. **轻量级真本地 RAG 跨学科知识库（零外部数据库依赖）**：
   - 不要强依赖 Docker/Milvus/Neo4j，以免增加原型运行门槛。
   - 在项目 `src/data/knowledge-base/` 内预置 **12 大学科门类的精选 Markdown/JSON 权威资源文档**，并在 Node.js 服务端实现**自动切片（Chunking）+ BM25/TF-IDF 与关键词加权混合检索**，同时支持用户在前端上传 `.txt` / `.md` / `.json` 文件实时扩充知识库。
   - 每次调用 DeepSeek API 前先执行本地检索，将命中的 Top-K 切片注入 Prompt，并在 UI 中渲染可点击溯源的 **`[KB-ID]` 引用高亮标签**。
3. **拒绝平庸聊天框：全可视化认知工作台**：
   - 严禁把系统做成“左历史记录 + 右聊天框”的套壳 ChatGPT 界面。每一个功能模块都必须具备**专属的图形化交互控件**（星系知识图谱、红蓝对抗分栏、动态权重滑块、五维雷达图、玻璃拟态卡片）。

---

## 2. 技术栈选型与标准工程结构

### 2.1 推荐技术栈
| 技术层级 | 选型方案 | 选型理由 |
| :--- | :--- | :--- |
| **全栈框架** | **Next.js 15+ (App Router) + TypeScript** | 前后端一体化，内置 API Route 代理 DeepSeek 请求，类型安全，部署极简 |
| **样式系统** | **Tailwind CSS v3/v4 + `clsx` + `tailwind-merge`** | 快速实现深空玻璃拟态（Glassmorphism）、微光边框与响应式布局 |
| **动效与图标** | **Framer Motion + Lucide React** | 卡片进场交错动画、布局平滑过渡、高质量线性矢量图标 |
| **数据可视化** | **Recharts + 自定义交互式 SVG/HTML5 力导向星系图** | Recharts 渲染雷达图/柱状图/S曲线稳定无 SSR 报错；自定义 SVG 物理星系图避免 WebGL 兼容问题且支持极致玻璃拟态定制 |
| **大模型 SDK** | **`openai` (Node.js SDK) 或原生 `fetch` SSE** | 原生兼容 DeepSeek API（`baseURL: "https://api.deepseek.com"`） |
| **文档与校验** | **`zod`** | 严格校验服务端 API 入参及 DeepSeek 返回的 JSON 结构，防止解析崩溃 |

### 2.2 标准项目目录结构
```text
cognivista-prototype/
├── .env.local.example                 # 环境变量示例 (DEEPSEEK_API_KEY=)
├── package.json
├── tailwind.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # 全局字体、深空主题容器、Toast/Modal Provider
│   │   ├── page.tsx                   # 首页（默认进入「全域跨学科认知透镜」或概览入口）
│   │   ├── lens/page.tsx              # 视图一：全域跨学科认知透镜
│   │   ├── socratic/page.tsx          # 视图二：苏格拉底理性思辨场
│   │   ├── decision/page.tsx          # 视图三：多维权衡判断决策沙盘
│   │   ├── knowledge/page.tsx         # 视图四：跨学科知识库中心与个人认知画像
│   │   ├── pmo/page.tsx               # 视图五（工程管理联动）：1亿元 PMO 项目驾驶舱
│   │   └── api/
│   │       ├── cognitive/
│   │       │   ├── lens/route.ts      # POST: 跨学科解构与图谱生成
│   │       │   ├── socratic/route.ts  # POST: 苏格拉底思辨、谬误诊断与 R1 推理
│   │       │   └── decision/route.ts  # POST: 多维决策量化评估推演
│   │       └── knowledge/
│   │           └── route.ts           # GET/POST: 知识库检索、列表读取与新文件切片入库
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx           # 左侧可折叠琉璃导航栏 + 顶部状态控制栏
│   │   │   ├── ApiKeyModal.tsx        # DeepSeek API Key 配置与连接测试弹窗
│   │   │   └── CitationDrawer.tsx     # 右侧滑出式「知识库原文溯源高亮抽屉」
│   │   ├── lens/
│   │   │   ├── GalaxyGraph.tsx        # 交互式跨学科星系关系图谱 (SVG + 拖拽/缩放/悬停高亮)
│   │   │   └── DisciplineCard.tsx     # 6维学科解构琉璃卡片
│   │   ├── socratic/
│   │   │   ├── RigorGauge.tsx         # 逻辑严密性环形仪表盘 + 谬误诊断标签
│   │   │   ├── ReasoningDrawer.tsx    # DeepSeek-R1 思维链 (CoT) 可折叠展示面板
│   │   │   └── DebateArena.tsx        # 红蓝双栏正反交锋区 + 三连问追问互动卡
│   │   ├── decision/
│   │   │   ├── WeightSliders.tsx      # 左侧交互式决策权重调节滑块面板
│   │   │   └── DecisionCharts.tsx     # 五维雷达图 + 损益柱状图 + SWOT 2x2 矩阵 + 压力测试卡
│   │   └── pmo/
│   │       └── PmoCharts.tsx          # 1亿元 CBS 预算饼图 + 36个月 S 曲线 (PV/EV/AC)
│   ├── lib/
│   │   ├── deepseek.ts                # DeepSeek API 客户端封装、JSON 容错解析、Demo Fallback 路由
│   │   ├── rag.ts                     # 轻量级本地 RAG 引擎（文本切片、BM25/TF-IDF 混合打分、溯源生成）
│   │   ├── prompts.ts                 # 四大核心智能体 System Prompt 工程模板库
│   │   └── types.ts                   # 全局 TypeScript 数据契约定义
│   └── data/
│       ├── demo-presets.ts            # 未填 Key 时的全套高保真 Demo 推演数据集
│       ├── pmo-metrics.ts             # 1亿元工程管理 CBS、S曲线与 M18 EVM 真实数据
│       └── knowledge-base/            # 预置 12 大学科精选资源文件 (.md)
│           ├── 01-philosophy-logic-fallacies.md
│           ├── 02-economics-game-theory-externality.md
│           ├── 03-law-ai-ethics-copyright.md
│           ├── 04-cs-algorithms-information-cocoon.md
│           ├── 05-sociology-public-sphere.md
│           ├── 06-psychology-dual-process-bias.md
│           ├── 07-management-mcda-decision.md
│           └── 08-science-paradigm-systems.md
```

---

## 3. 高颜值 UI/UX 视觉设计规范（Academic Dark & Glassmorphism）

编码 Agent 在编写样式时必须严格遵循以下设计系统，确保界面呈现出**“顶尖 AI 科研工作台”**的质感，杜绝粗糙的默认 Tailwind 白底表单样式：

### 3.1 色彩体系（Design Tokens）
- **背景画布（Background）**：
  - 主背景：`#060913`（深空黑曜石），叠加极微弱的径向环境光斑（左上角 `#4F46E5` 8% 透明度，右下角 `#06B6D4` 6% 透明度）与细微点阵网格（`radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`）。
  - 琉璃卡片表面（Surface）：`rgba(15, 23, 42, 0.65)` 配合 `backdrop-blur-xl` 与 `border: 1px solid rgba(255, 255, 255, 0.08)`，悬停时边框渐亮至 `rgba(99, 102, 241, 0.4)`。
  - **可选浅色主题（Scholarly Ivory）**：支持顶部一键切换，浅色背景 `#F8FAFC`，卡片 `#FFFFFF/85`，文字 `#0F172A`。
- **语义与学科标识色**：
  - **主认知辉光（Primary Indigo）**：`#6366F1` → `#8B5CF6` 渐变（主按钮、激活态光晕）。
  - **跨学科脉络（Cyan）**：`#06B6D4`（知识图谱连线、检索命中标签）。
  - **正方/支持（Blue）**：`#38BDF8`（思辨场左侧护盾卡片）。
  - **反方/质询（Rose）**：`#F43F5E`（思辨场右侧魔鬼代言人、逻辑谬误预警标签）。
  - **溯源验证/严密性高（Emerald）**：`#10B981`（知识库引用徽章 `[KB-01]`、API 在线绿点）。
  - **风险预警/权衡提醒（Amber）**：`#F59E0B`（盲区提示、压力测试警告）。

### 3.2 排版与空间规范
- **字体栈**：标题与正文使用 `Inter` + `Noto Sans SC`；核心引文与苏格拉底追问可使用 `Noto Serif SC` 营造学术仪式感；数值指标（如逻辑评分 `86/100`、权重 `0.35`、引用编号 `KB-02`）强制使用 `JetBrains Mono` 等宽字体并开启 `tabular-nums`。
- **全局导航壳（AppShell）**：
  - 左侧固定/可折叠侧边栏（宽 `240px`），顶部显示 **CogniVista 观睿** Logo（带微光脉冲图标），中部 5 个模块导航，底部显示**「当前认知探索进度条（已点亮 X/12 学科）」**。
  - 顶部栏（高 `64px`）：显示当前模块面包屑、**模型引擎状态胶囊**（点击可打开 API Key 设置弹窗，显示 `🟢 DeepSeek API 已连接 (R1/V3)` 或 `🟡 演示模式 (未配置 Key)`）、以及主题切换按钮。

---

## 4. 核心模块功能详尽设计（UI 布局 + 交互流 + 数据结构）

### 4.1 模块一：全域跨学科认知透镜（`/lens`）
- **核心目标**：打破单一专业视角，拓展本科生跨学科认知边界。
- **页面布局**：
  1. **顶部议题输入与灵感区**：居中大尺寸流光搜索框，内置 4 个一键体验议题标签（如：`生成式 AI 是否会重塑大学教育与版权秩序`、`算法推荐如何制造信息茧房`、`碳达峰约束下的产业转型权衡`、`基因编辑技术的伦理边界`）。可勾选“深度跨学科模式（默认开启 RAG 溯源）”。
  2. **上部核心区——交互式跨学科星系图（`GalaxyGraph.tsx`）**：
     - 中心节点为当前议题，周围环绕 6 个不同学科节点（例如：计算机科学、制度经济学、法学、社会学、科技哲学、认知心理学）。
     - 连线标注学科间的**“张力（Tension）”**或**“协同（Synergy）”**关系（如“计算机效率追求 vs 法学权益保护”）。
     - **交互**：点击任意学科节点，下方对应卡片自动滚动高亮；悬停连线显示交叉冲突摘要。
  3. **下部核心区——6 维跨学科解构琉璃卡片矩阵（3列×2行 Grid）**：
     - 每张卡片包含：① 学科徽章与专属色条；② **核心认知假设**（该学科如何看待此问题）；③ **关键分析框架/模型**；④ **该视角的认知盲区预警**（Amber 标签）；⑤ **底层引用溯源徽章**（如 `📄 《制度经济学导论》· 外部性 [KB-02]`，点击弹出右侧 `CitationDrawer` 查看知识库原文）。

### 4.2 模块二：苏格拉底理性思辨场（`/socratic`）
- **核心目标**：拒绝直接给答案，通过红蓝对抗与逻辑诊脉培养本科生批判性思维。
- **页面布局**：
  1. **顶部论点输入栏**：学生输入自己的核心观点与论证依据（提供 3 个典型本科生预设论点，如：“我认为大学生应当把所有课余时间都用来刷实习，学通识课没有实用价值”），点击“开启思辨交锋”。
  2. **中上部——逻辑严密性诊断仪表盘（`RigorGauge.tsx` + `ReasoningDrawer.tsx`）**：
     - 左侧：圆形动态 SVG 评分环（0–100 分）+ 三项子维度条（论据充分性、推理一致性、前提隐含风险）。
     - 中间：**认知偏差与逻辑谬误诊断标签云**（点击每个标签展示通俗解释与学生原句定位，如：`⚠️ 功利主义窄化`、`⚠️ 虚假两难（False Dilemma）`、`⚠️ 幸存者偏差`）。
     - 右侧：**可折叠 DeepSeek-R1 思维链推演抽屉**（展示模型如何一步步拆解学生论点漏洞，极具学术透明感）。
  3. **中部——红蓝双栏对抗交锋区（`DebateArena.tsx`）**：
     - **左栏（蓝色护盾：正方强化与边界拓展）**：帮助学生提炼其观点中最有价值的合理内核，并补充更高维度的学术支撑论据与知识库引用。
     - **右栏（玫瑰红盾：反方魔鬼代言人质询）**：站在对立面提出犀利反例、边界条件反驳与反事实推演。
  4. **底部——苏格拉底阶梯式三连问（交互闭环）**：
     - 展示 3 个层层递进的启发式追问。每个问题下方提供**“在此回应并重塑我的观点”**快捷输入框，学生作答后可点击**“提交修正后观点（二轮思辨）”**，触发新一轮评估并展示逻辑分数提升对比。

### 4.3 模块三：多维权衡判断决策沙盘（`/decision`）
- **核心目标**：辅助本科生在多目标冲突、信息不完备下做出理性权衡判断。
- **页面布局（左控右图 4:8 分栏）**：
  1. **左侧控制台（`WeightSliders.tsx`）**：
     - 预设决策模板切换（`毕业去向：保研读博 vs 大厂就业 vs 跨界创业`、`科研选题：热门大模型应用 vs 冷门基础理论`、`城市选址：超一线高薪高压 vs 新一线均衡发展`）+ 自定义决策议题与 2～4 个备选方案输入。
     - **5 个实时权重滑块（0%～100%，自动归一化显示占比）**：如 `长期发展上限`、`短期确定收益`、`试错与沉没成本`、`个人兴趣匹配度`、`抗风险韧性`。
     - **关键交互体验**：拖动滑块时，右侧雷达图和综合加权得分**60fps 实时本地重算**；点击“DeepSeek 深度沙盘推演”时，调用 API 生成各方案在各维度的底层打分、依据与风险评估。
  2. **右侧可视化沙盘（`DecisionCharts.tsx`）**：
     - 顶部：**综合加权推荐度排序条**（展示各方案实时加权总分与最优推荐度，附带“前提条件提醒”，绝不武断代替用户做决定）。
     - 中部左：**Recharts 5 维能力/收益对比雷达图**（多方案半透明叠色对比）。
     - 中部右：**短期收益 vs 长期天花板对比柱状图**。
     - 下部：**SWOT 动态态势矩阵（2×2 卡片）** + **“最坏情境压力测试与止损建议卡（Worst-Case Stress Test）”**（明确列出：如果选 A 失败了，退路与机会成本是什么）。

### 4.4 模块四：全域跨学科知识库中心与个人认知画像（`/knowledge`）
- **核心目标**：兑现“在知识库添加海量资源文件”的设计承诺，提供真实的资源管理、上传解析、检索测试与个人认知成长记录。
- **页面布局**：
  1. **顶部统计与上传栏**：展示当前知识库已挂载资源总数、总切片数（Chunks）、覆盖学科门类（12 类），以及**「上传本地资源文件（支持 .md / .txt / .json）」拖拽区**。用户拖入新文档后，后端立即执行切片并写入本地运行时知识索引，立即可在透镜与思辨模块中被 DeepSeek 引用！
  2. **知识库浏览器**：按学科分类筛选（哲学、经济学、法学、计算机、社会学、心理学、管理学、系统科学等），支持关键词检索预览命中片段与相关性评分。
  3. **个人认知边界画像**：基于学生在本地 `localStorage` 中累计触发过的跨学科透镜、思辨场次和决策沙盘记录，用 Recharts 渲染**“个人 12 学科认知探索雷达图”**与“待拓展认知盲区推荐”。

### 4.5 模块五：1亿元 PMO 工程管理全景驾驶舱（`/pmo`）
- **核心目标**：与《工程管理》期末大作业报告形成闭环联动，直观呈现本项目作为 1 亿元大型工程的全生命周期管理指标。
- **页面内容**：
  1. **顶层 KPI 卡片**：总预算 `10,000.00 万元`、成本绩效基准 BAC `9,600.00 万元`、M18 成本绩效指数 `CPI = 0.9559`、M18 进度绩效指数 `SPI = 0.9420`。
  2. **成本分解结构（CBS）交互式环形图**：清晰展示 6 大科目（算力底座 2200万、知识库工程 2600万、高颜值前后端研发 2800万、质量安全 600万、管理推广 800万、储备金 1000万）占比与明细。
  3. **36 个月时间-成本累计 S 曲线（PV / EV / AC 对比折线图）** + **M18 挣值偏差与纠偏措施卡片** + **核心风险矩阵热力图**。

---

## 5. TypeScript 数据契约与后端 API 接口规范

编码 Agent 须在 `src/lib/types.ts` 中定义严格的类型契约，所有 API 接口均遵循以下请求与响应结构：

```typescript
// src/lib/types.ts

export interface KnowledgeCitation {
  chunkId: string;        // 例如 "KB-02-C03"
  docTitle: string;       // 例如 "《制度经济学与外部性导论》"
  discipline: string;     // 例如 "经济学"
  relevanceScore: number; // 0~1
  excerpt: string;        // 原文切片内容
}

// 1. 全域跨学科认知透镜
export interface LensRequest {
  topic: string;
  enableRag?: boolean;
}

export interface DisciplinePerspective {
  discipline: string;         // 学科名称
  colorToken: string;         // indigo | cyan | emerald | amber | rose | violet
  coreAssumption: string;     // 该学科底层核心假设
  analyticalFramework: string;// 关键分析模型/工具
  insightSummary: string;     // 针对当前议题的深度剖析 (100-150字)
  blindSpotWarning: string;   // 该单一视角的认知盲区警示
  citationIds: string[];      // 引用的知识库切片 ID 列表
}

export interface LensResponse {
  topic: string;
  coreSynthesis: string;      // 跨学科综合元洞察
  perspectives: DisciplinePerspective[]; // 固定 6 个学科视角
  relations: Array<{
    from: string;
    to: string;
    type: 'synergy' | 'tension';
    label: string;
  }>;
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
  severity: 'high' | 'medium' | 'low';
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
export interface DecisionRequest {
  dilemma: string;            // 决策情境描述
  options: string[];          // 2-4 个备选方案
  weights: {
    longTermCeiling: number;  // 0-100
    shortTermCertainty: number;
    riskResilience: number;
    costEfficiency: number;
    passionAlignment: number;
  };
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
```

### API 路由契约说明
| 路由端点 | 方法 | 调度 DeepSeek 模型 | 核心流程 |
| :--- | :---: | :---: | :--- |
| `/api/cognitive/lens` | `POST` | `deepseek-chat` | 解析 `topic` $\rightarrow$ 调用 `rag.retrieve(topic, 6)` $\rightarrow$ 注入知识库切片并调用 DeepSeek (`response_format: { type: 'json_object' }`) $\rightarrow$ Zod 校验返回 `LensResponse` |
| `/api/cognitive/socratic` | `POST` | `deepseek-reasoner` (主) / `deepseek-chat` (JSON格式化保底) | 解析 `thesis` $\rightarrow$ 调用 `rag.retrieve(thesis + "逻辑谬误", 5)` $\rightarrow$ 请求 `deepseek-reasoner` 获取 `reasoning_content` 与结构化 JSON $\rightarrow$ 返回 `SocraticResponse` |
| `/api/cognitive/decision` | `POST` | `deepseek-chat` | 解析 `dilemma` 与 `options` $\rightarrow$ 调用 `rag.retrieve(dilemma + "决策模型", 4)` $\rightarrow$ 生成各方案 5 维基准分与 SWOT/压力测试 JSON $\rightarrow$ 返回 `DecisionResponse` |
| `/api/knowledge` | `GET` / `POST` | 无 | `GET`: 返回所有已加载知识库文件目录、学科分布与检索结果；`POST`: 接收用户上传的 `.md`/`.txt` 文本并切分入库（内存中持久化至运行时缓存/本地 JSON 文件） |

---

## 6. DeepSeek API 集成、Prompt 工程与轻量级 RAG 实现细节

### 6.1 `src/lib/deepseek.ts` 核心封装规范
1. **API Key 优先级**：优先读取请求头 `request.headers.get('x-deepseek-key')`（来自前端用户在设置弹窗输入的 Key），若为空则读取 `process.env.DEEPSEEK_API_KEY`。若两者均为空，**不报错崩溃**，直接平滑返回 `src/data/demo-presets.ts` 中最匹配的预设推演结果（标记 `isDemoMode: true`），若是自定义全新问题且无 Key，则通过轻量级模板合成合理响应并提示用户填入 Key 解锁实时 AI 深度推演。
2. **模型调度与 `deepseek-reasoner` 兼容细节**：
   - `deepseek-chat` 支持 `response_format: { type: "json_object" }` 与 `temperature: 0.4`。
   - **重要避坑指南**：`deepseek-reasoner`（R1）在部分 API 版本中不支持强制 `response_format` 或 `temperature` 参数，且其输出中包含 `message.reasoning_content`（思维链）和 `message.content`（最终答案）。因此封装函数必须：
     - 不向 `deepseek-reasoner` 传递 `temperature`；
     - 在 System/User Prompt 末尾明确要求“最终输出必须严格包裹在单一 JSON 对象中，禁止额外寒暄”；
     - 编写健壮的 `extractJsonFromMarkdown(text)` 正则提取器（剥离 ` ```json ... ``` ` 围栏），若 R1 偶发输出非标准 JSON，自动降级调用一次 `deepseek-chat` 做结构化提取或回退 Demo 数据。

### 6.2 核心 System Prompt 工程模板（`src/lib/prompts.ts`）

#### （1）全域跨学科透镜 Prompt（`LENS_SYSTEM_PROMPT`）
```text
你是“CogniVista 观睿”大学本科生全域认知赋能平台的【跨学科百科与认知解构委员会】。
你的使命是帮助本科生打破单一学科的专业壁垒与信息茧房，而非给出简单的是非结论。

【任务要求】
针对用户输入的议题，结合提供的【校内跨学科知识库切片】，从恰好 6 个差异显著的学科视角（如：计算机科学、制度经济学、法学、社会学、科技哲学、认知心理学等，根据议题动态选择最贴切的 6 个学科）进行深度解构。

【刚性约束】
1. 严禁替学生做价值定论，必须展示不同学科底层的核心假设冲突与方法论差异。
2. 每个学科卡片必须包含一个“认知盲区警示（blindSpotWarning）”，提醒学生该学科视角的局限性。
3. 必须尽可能引用【校内跨学科知识库切片】中的 chunkId，严禁编造不存在的 chunkId。
4. 输出必须是合法的 JSON 对象，严格匹配以下 Schema：{ topic, coreSynthesis, perspectives[6], relations[] }。
```

#### （2）苏格拉底理性思辨场 Prompt（`SOCRATIC_SYSTEM_PROMPT`）
```text
你是“CogniVista 观睿”平台的【苏格拉底思辨导师兼逻辑审视官】。
你的职责是：严厉而友善地剖析本科生输入观点的逻辑结构，绝不直接替学生写论文或给出标准答案！

【防代写与启发式护栏】
如果检测到用户粘贴作业题目要求代写全文，你必须拒绝直接代写，改为拆解该题目的核心论证难点，指出其潜在的认知陷阱，并用提问引导学生自主构建论点。

【任务要求】
1. 客观评估用户论证的严密性（rigorScore 0-100，及三个子维度分）。
2. 精准诊断用户文本中存在的逻辑谬误或认知偏差（如：滑坡谬误、虚假两难、幸存者偏差、诉诸权威、稻草人谬误等），引用用户原句并给出解析。
3. 正方强化（proSideReinforcement）：发掘并提炼用户观点中最具价值的合理内核，并补充 3 条学术级论据（引用知识库 chunkId）。
4. 反方魔鬼代言人（conSideChallenge）：站在最强对立面，提出尖锐的反例与反事实冲击。
5. 苏格拉底三连问（socraticQuestions）：生成 3 个层层递进的追问（第1问：概念澄清；第2问：隐含前提挑战；第3问：极端边界与伦理后果推演）。
6. 严格输出为合法 JSON 对象。
```

#### （3）多维决策权衡沙盘 Prompt（`DECISION_SYSTEM_PROMPT`）
```text
你是“CogniVista 观睿”平台的【多准则决策分析（MCDA）与系统动力学推演顾问】。
针对本科生面临的复杂抉择与备选方案，客观评估每个方案在 5 个维度的基准得分（0-100）：
- longTermCeiling（长期发展上限）
- shortTermCertainty（短期确定性）
- riskResilience（抗风险韧性）
- costEfficiency（时间与经济性价比）
- passionAlignment（内驱力与长期自洽度）

【刚性约束】
1. 严禁武断告诉用户“你应该选 A”。必须呈现多维权衡得失、SWOT 矩阵，以及最重要的“最坏情境压力测试（worstCaseScenario）”与“止损退路方案（mitigationPlan）”。
2. 结合知识库中的博弈论、沉没成本与决策科学切片提供方法论支撑。
3. 严格输出为合法 JSON 对象。
```

### 6.3 轻量级本地 RAG 知识库引擎设计（`src/lib/rag.ts`）
1. **知识库预置资源（`src/data/knowledge-base/*.md`）**：
   Agent 在搭建原型时，应在 `src/data/knowledge-base/` 下编写 **8~12 份高质量、内容充实的跨学科 Markdown 资源文档**（每份约 800~1500 字，带 Frontmatter 元数据：`title`、`discipline`、`author`、`keywords`），涵盖：
   - `01-philosophy-logic-fallacies.md`（形式逻辑、24种常见逻辑谬误与苏格拉底诘问法）
   - `02-economics-game-theory-externality.md`（外部性、机会成本、沉没成本与纳什均衡）
   - `03-law-ai-ethics-copyright.md`（知识产权归属、算法治理与数字正义论）
   - `04-cs-algorithms-information-cocoon.md`（推荐系统协同过滤、信息茧房与技术中立性反思）
   - `05-sociology-public-sphere.md`（哈贝马斯公共领域、技术分层与社会结构变迁）
   - `06-psychology-dual-process-bias.md`（卡尼曼双系统理论、确认偏误与幸存者偏差）
   - `07-management-mcda-decision.md`（多准则决策分析 MCDA、SWOT 与二八原则）
   - `08-science-paradigm-systems.md`（库恩科学范式转移、系统动力学与非线性反馈回路）
2. **切片与混合检索算法（Pure TypeScript 实现）**：
   - **切片器（Chunker）**：按 Markdown 二级标题 `##` 及段落长度（每片约 250~400 字符，保留 50 字符重叠）自动生成 `KBChunk` 对象（含 `chunkId` 如 `KB-01-C02`、`docTitle`、`discipline`、`content`、`tokens`）。
   - **混合打分器（Hybrid Scorer）**：对用户输入 Query 进行中英文分词/N-gram 切词（提取 2-gram 与 3-gram 中文词组 + 英文单词），计算 **BM25 词频逆文档频率得分 + 学科关键词权重加成 + 标题匹配加成**，返回归一化相关性最高的 Top-K 切片。
   - **热更新入库**：当用户在 `/knowledge` 页面上传新 `.md`/`.txt` 文件调用 `POST /api/knowledge` 时，立即解析切片并追加到内存索引及本地 JSON 缓存文件中，实现零重启即时检索。

---

## 7. 给开发 Agent 的分步实施路线图与验收清单

建议按以下 5 个阶段依次执行构建与验证：

### Phase 1：工程初始化与视觉设计底座
- [ ] 使用 `create-next-app` 初始化 Next.js (App Router + TypeScript + Tailwind CSS) 项目，安装 `lucide-react`、`framer-motion`、`recharts`、`openai`、`zod`。
- [ ] 配置深空学术风 CSS Tokens、毛玻璃通用类（`.glass-card`）与暗/浅双主题切换。
- [ ] 实现 `AppShell.tsx`（含左侧导航栏、顶部模型状态胶囊、`ApiKeyModal.tsx` 与右侧 `CitationDrawer.tsx`）。

### Phase 2：预置知识库资源与轻量 RAG 引擎
- [ ] 在 `src/data/knowledge-base/` 创建 8 份跨学科核心 Markdown 文档。
- [ ] 实现 `src/lib/rag.ts`（启动加载、切片、N-gram/BM25 混合检索、新文件追加）。
- [ ] 实现 `GET/POST /api/knowledge` 接口。

### Phase 3：DeepSeek API 智能编排层与 Demo 兜底
- [ ] 定义 `src/lib/types.ts` 与 `src/lib/prompts.ts`。
- [ ] 实现 `src/lib/deepseek.ts`（支持 Header 传入或 `.env.local` 读取 Key，`deepseek-chat` 与 `deepseek-reasoner` 双模型路由，JSON 容错提取，`reasoning_content` 提取）。
- [ ] 编写 `src/data/demo-presets.ts`，为透镜、思辨、决策三大模块各自准备至少 2 组高水准完整推演数据作为无 Key 演示兜底。
- [ ] 实现 `/api/cognitive/lens`、`/api/cognitive/socratic`、`/api/cognitive/decision` 三个 Route Handler。

### Phase 4：五大高颜值前端交互页面开发
- [ ] 开发 `/lens`：流光议题框 + 自定义可交互 SVG 星系图（节点点击/悬停联动） + 6 维学科玻璃卡片 + 知识库溯源抽屉。
- [ ] 开发 `/socratic`：论点输入 + 逻辑严密性环形评分盘 + 谬误诊断标签 + DeepSeek-R1 思维链折叠区 + 红蓝对抗双栏 + 三连问二轮反驳交互。
- [ ] 开发 `/decision`：决策模板切换 + 5 轴动态权重滑块（拖拽即时重算总分与雷达图） + Recharts 雷达图/柱状图 + SWOT 矩阵 + 压力测试警示卡。
- [ ] 开发 `/knowledge`：12 学科资源库浏览、文件拖拽上传入库、切片检视、个人认知雷达画像（基于 `localStorage` 历史统计）。
- [ ] 开发 `/pmo`：1 亿元工程管理驾驶舱（CBS 饼图、36 月 S 曲线、M18 EVM 指标与风险矩阵）。

### Phase 5：全链路自测与构建验收
- [ ] 执行 `npm run build` 确保零 TypeScript 类型错误与零 SSR Hydration 报错。
- [ ] 验证**无 Key 演示模式**下五大页面全部可完整点击、拖拽滑块、查看溯源抽屉。
- [ ] 验证**填入真实 DeepSeek API Key 后**，三大核心接口能真实返回 `deepseek-chat` / `deepseek-reasoner` 结果并正确渲染。
