import { ragEngine } from "@/lib/rag";
import { DECISION_TEMPLATES } from "@/data/preset-topics";
import type {
  DecisionRequest,
  DecisionResponse,
  LensResponse,
  SocraticResponse,
} from "@/lib/types";

const LENS_PRESETS: Record<string, Omit<LensResponse, "citations" | "usedModel" | "isDemoMode">> = {
  "生成式 AI 是否会重塑大学教育与版权秩序": {
    topic: "生成式 AI 是否会重塑大学教育与版权秩序",
    coreSynthesis:
      "生成式 AI 并非简单的“效率工具”或“作弊机器”，而是一场同时触发知识生产范式重构（教育学）、创作者权益再分配（法学/经济学）以及思维惰性风险（心理学）的系统性技术冲击。单一学科的管制或崇拜均会陷入局部盲区，必须在“保护人类创造性激励”与“重塑高阶思辨评价体系”之间构建动态制度均衡。",
    perspectives: [
      {
        discipline: "计算机科学",
        colorToken: "indigo",
        coreAssumption: "知识表征可被高维概率分布压缩，检索增强生成（RAG）是抑制概率幻觉的核心工程路径。",
        analyticalFramework: "自回归 Transformer 架构 + RAG 强溯源检索机制",
        insightSummary:
          "AI 的本质是基于海量语料的条件概率预测，在标准化代码与知识复述上已实现边际成本趋零；但原生模型存在长尾幻觉缺陷，高校应用必须依赖知识库强溯源架构实现事实锁定。",
        blindSpotWarning: "易陷入“技术决定论”，忽视目标函数背后隐含的价值排序与教育公平外溢效应。",
        citationIds: ["KB-04-C02", "KB-04-C03"],
      },
      {
        discipline: "法学",
        colorToken: "cyan",
        coreAssumption: "著作权法保护人类独创性表达以激励文化创新，公共利益与私有产权需保持法定边界。",
        analyticalFramework: "转换性使用（Fair Use）判定 + 算法正当程序原则",
        insightSummary:
          "大模型预训练抓取海量受版权保护文献引发“输入端合理使用边界”与“输出端人类智力投入认定”双重挑战。高校知识库必须建立合法授权镜像与细粒度引用追溯机制。",
        blindSpotWarning: "法律规范天然具有滞后性，过度静态的版权壁垒可能阻碍学术开源协作与教育普惠。",
        citationIds: ["KB-03-C01", "KB-03-C02"],
      },
      {
        discipline: "教育学",
        colorToken: "emerald",
        coreAssumption: "学习的本质是学习者在“最近发展区”内的主动意义建构，而非标准答案的机械搬运。",
        analyticalFramework: "布鲁姆认知目标分类学 + 维果茨基自适应脚手架",
        insightSummary:
          "AI 迅速贬值了“记忆与低阶应用”能力的市场溢价，倒逼大学课堂将考核重心跃迁至“分析、评价与跨界创造”。AI 应扮演苏格拉底式脚手架，而非代劳写作业的替代品。",
        blindSpotWarning: "容易理想化学生的自律水平，低估绩点竞争压力下学生向“工具理性代写”滑落的风险。",
        citationIds: ["KB-11-C01", "KB-11-C02"],
      },
      {
        discipline: "经济学",
        colorToken: "amber",
        coreAssumption: "理性主体在约束条件下最大化效用，制度设计需解决外部性与激励相容问题。",
        analyticalFramework: "外部性内部化（科斯定理） + 知识公地悲剧模型",
        insightSummary:
          "若 AI 厂商免费抽取创作者作品训练模型而未给予反馈补偿，将产生显著负外部性并削弱原创供给激励；微版权场景交易成本高昂，亟需构建集体版权许可池与溯源分成机制。",
        blindSpotWarning: "过度将教育与创作简化为价格和收益激励，低估了学术共同体的非货币声誉与内在求知欲。",
        citationIds: ["KB-02-C02", "KB-02-C03"],
      },
      {
        discipline: "心理学",
        colorToken: "rose",
        coreAssumption: "人类受限于认知吝啬本能，默认倾向于依赖省力的系统 1 直觉而非高负荷的系统 2 慢思考。",
        analyticalFramework: "卡尼曼双系统理论 + 流畅性错觉（Illusion of Fluency）",
        insightSummary:
          "AI 生成的丝滑文本极易诱发“流畅性错觉”，让学生误以为读懂答案就等于掌握知识，进而跳过深度加工所需的必要认知阻力，长远看可能削弱元认知监控能力。",
        blindSpotWarning: "偏重个体微观心理机制，容易忽略制度环境与社会结构对学生焦虑情绪的外部塑造。",
        citationIds: ["KB-06-C01", "KB-06-C03"],
      },
      {
        discipline: "历史学",
        colorToken: "violet",
        coreAssumption: "媒介技术的长时段演进往往重构知识权威与教育组织形态，而非单向毁灭思考本身。",
        analyticalFramework: "年鉴学派长时段（Longue Durée）理论 + 路径依赖",
        insightSummary:
          "回溯古腾堡印刷术普及五百年历史，每次信息复制成本暴跌都会引发“人类记忆退化”的焦虑，但最终都淘汰了机械抄写、催生了现代研究型大学与批判性学术规范。",
        blindSpotWarning: "历史类比可能掩盖当代生成式 AI 具备“类推理代理能力”这一前所未有的结构性断代特征。",
        citationIds: ["KB-10-C01", "KB-10-C02"],
      },
    ],
    relations: [
      { from: "计算机科学", to: "法学", type: "tension", label: "海量语料自由训练 vs 著作权排他保护" },
      { from: "经济学", to: "法学", type: "synergy", label: "版权许可池实现负外部性内部化" },
      { from: "教育学", to: "心理学", type: "synergy", label: "脚手架追问对抗流畅性错觉" },
      { from: "计算机科学", to: "教育学", type: "tension", label: "一键流畅生成 vs 必要认知阻力" },
      { from: "历史学", to: "教育学", type: "synergy", label: "长时段印证评价重心向高阶迁移" },
      { from: "心理学", to: "经济学", type: "tension", label: "短期认知省力偏好 vs 长期人力资本折旧" },
    ],
  },

  "算法推荐如何制造信息茧房": {
    topic: "算法推荐如何制造信息茧房",
    coreSynthesis:
      "信息茧房并非单纯由“邪恶代码”单方面制造，而是推荐系统短期点击率优化（计算机科学）、人类固有确认偏误（心理学）、注意力商业变现（经济学）与社交回音室效应（社会学）四重力量共振耦合的复杂涌现结果。",
    perspectives: [
      {
        discipline: "计算机科学",
        colorToken: "indigo",
        coreAssumption: "系统目标可通过可微损失函数与历史交互序列的协同过滤进行精准优化。",
        analyticalFramework: "强化学习“探索-利用（Exploration-Exploitation）”权衡",
        insightSummary:
          "当推荐模型过度追求即时 CTR 与停留时长时，策略会坍缩为对用户既有兴趣的过度“利用”，牺牲跨领域随机“探索”，导致推荐分布迅速窄化为封闭同温层。",
        blindSpotWarning: "倾向于把公共讨论极化归结为可通过调参解决的工程指标问题，忽视商业激励机制。",
        citationIds: ["KB-04-C01", "KB-04-C03"],
      },
      {
        discipline: "心理学",
        colorToken: "rose",
        coreAssumption: "大脑偏好与既有信念一致的信息以降低认知失调带来的心理能耗。",
        analyticalFramework: "确认偏误（Confirmation Bias） + 选择性接触假说",
        insightSummary:
          "即便没有算法推荐，人类也会主动搜寻支持自身偏见的证据并回避反面观点。算法实际上充当了心理确认偏误的高倍放大器，将潜意识偏好固化为显性信息环境。",
        blindSpotWarning: "过度强调人性弱点可能客观上为平台推卸算法设计责任提供辩护。",
        citationIds: ["KB-06-C01", "KB-06-C02"],
      },
      {
        discipline: "社会学",
        colorToken: "cyan",
        coreAssumption: "个体信息获取镶嵌于社群认同与媒介公共领域结构之中。",
        analyticalFramework: "哈贝马斯公共领域理论 + 群体极化（Group Polarization）",
        insightSummary:
          "同质化信息流切断了不同社会阶层与学科背景之间的“弱关系”交叉接触，情绪化内容获得更高传播权重，使数字公共领域碎片化为彼此对立的回音室。",
        blindSpotWarning: "有时高估“纯同质茧房”的封闭程度，低估线下真实社交与跨平台偶遇的破壁作用。",
        citationIds: ["KB-05-C01", "KB-05-C02"],
      },
      {
        discipline: "经济学",
        colorToken: "amber",
        coreAssumption: "注意力是稀缺经济资源，平台商业模式决定产品形态演化方向。",
        analyticalFramework: "双边市场与注意力经济激励模型",
        insightSummary:
          "广告变现模式迫使平台争夺用户边际停留分钟数；挑动情绪与迎合既有偏好在商业回报上远高于推送高门槛的跨学科深度内容，形成了市场失灵的负外部性。",
        blindSpotWarning: "易把一切用户行为看作被动受众被商业收割，忽略付费优质内容与主动检索工具的反制空间。",
        citationIds: ["KB-02-C02", "KB-02-C03"],
      },
      {
        discipline: "法学",
        colorToken: "emerald",
        coreAssumption: "具有基础设施属性的算法平台应当承担与影响力相匹配的公共治理责任。",
        analyticalFramework: "算法透明度与算法正当程序（Algorithmic Due Process）",
        insightSummary:
          "《互联网信息服务算法推荐管理规定》要求赋予用户关闭个性化推荐、选择兴趣标签与审查特征偏见的法定权利，防止黑箱排序操纵公共议程。",
        blindSpotWarning: "单纯强制“提供关闭按钮”在用户惰性面前往往流于形式，难以实质性改善信息生态。",
        citationIds: ["KB-03-C02"],
      },
      {
        discipline: "文学",
        colorToken: "violet",
        coreAssumption: "语言、隐喻与叙事框架决定了个体理解异质世界的想象力边界。",
        analyticalFramework: "伽达默尔“视域融合”阐释学",
        insightSummary:
          "长期沉浸于碎片化算法投喂会削弱读者对长难文本、歧义张力与“他者视域”的耐受力，唯有通过深度跨界阅读才能重构与陌生经验对话的阐释能力。",
        blindSpotWarning: "人文审美倡导难以直接转化为可规模化落地的数字产品交互机制。",
        citationIds: ["KB-09-C01", "KB-09-C02"],
      },
    ],
    relations: [
      { from: "计算机科学", to: "心理学", type: "synergy", label: "协同过滤与确认偏误形成增强闭环" },
      { from: "经济学", to: "计算机科学", type: "synergy", label: "注意力变现驱动CTR贪婪优化" },
      { from: "社会学", to: "经济学", type: "tension", label: "公共理性商谈 vs 流量极化变现" },
      { from: "法学", to: "计算机科学", type: "tension", label: "算法透明合规 vs 商业黑箱排序" },
      { from: "文学", to: "心理学", type: "tension", label: "他者视域融合 vs 认知省力惰性" },
    ],
  },

  "碳达峰约束下的产业转型权衡": {
    topic: "碳达峰约束下的产业转型权衡",
    coreSynthesis:
      "“双碳”目标本质上是一场跨越经济代际公平、能源物理约束、国际贸易规则与产业组织重塑的超级系统工程。激进的短期行政限产与消极的技术等待均会引发系统性失衡，需要在时间延迟与非线性反馈中寻找稳态转型路径。",
    perspectives: [
      {
        discipline: "系统科学",
        colorToken: "indigo",
        coreAssumption: "能源-经济-生态复合系统充满时间延迟与非线性增强/调节反馈回路。",
        analyticalFramework: "系统动力学（System Dynamics）反馈回路模型",
        insightSummary:
          "化石能源退出与新能源储能基建之间存在 5~10 年时间延迟。若忽视时间延迟进行“运动式减碳”，会触发供应链震荡与能源价格飙升的恶性调节回路。",
        blindSpotWarning: "系统仿真模型高度依赖参数假设，对突发地缘政治或颠覆性技术突破预测力有限。",
        citationIds: ["KB-08-C02", "KB-08-C03"],
      },
      {
        discipline: "经济学",
        colorToken: "amber",
        coreAssumption: "碳排放是典型的跨代负外部性，碳定价是实现低成本减排的核心激励工具。",
        analyticalFramework: "碳排放权交易市场（ETS） + 外部性内部化",
        insightSummary:
          "相比一刀切行政关停，全国碳市场通过价格信号让边际减排成本最低的企业优先减排，实现全社会总转型成本最小化；同时需警惕高耗能产业跨区转移的“碳泄漏”。",
        blindSpotWarning: "市场定价难以在短期内解决新能源重资产初期的资本门槛与区域就业冲击。",
        citationIds: ["KB-02-C02", "KB-02-C03"],
      },
      {
        discipline: "管理学",
        colorToken: "emerald",
        coreAssumption: "企业战略转型需要在多元冲突目标间寻求帕累托最优与组织韧性。",
        analyticalFramework: "多准则决策分析（MCDA） + 最坏情境压力测试",
        insightSummary:
          "传统制造企业面临“ESG合规要求、短期现金流承压、绿色技改沉没风险”三重约束，需利用 MCDA 量化各转型路径的盈亏平衡点与阶段止损底线。",
        blindSpotWarning: "微观企业视角的局部最优叠加起来，未必自动满足宏观国家能源安全约束。",
        citationIds: ["KB-07-C01", "KB-07-C02"],
      },
      {
        discipline: "法学",
        colorToken: "cyan",
        coreAssumption: "绿色转型需要可预期的法治框架与国际气候贸易规则话语权。",
        analyticalFramework: "碳边境调节机制（CBAM）合规 + 环境法风险预防原则",
        insightSummary:
          "欧盟 CBAM 碳关税实质上将环境规则转化为国际贸易壁垒。国内企业急需构建符合国际互认标准的碳足迹核查法律合规体系，降低出口贸易摩擦风险。",
        blindSpotWarning: "法律规制侧重合规底线与责任归属，难以直接激发底层的工程技术创新活力。",
        citationIds: ["KB-03-C03"],
      },
      {
        discipline: "社会学",
        colorToken: "rose",
        coreAssumption: "产业结构剧变伴随区域就业结构重组与“公正转型（Just Transition）”诉求。",
        analyticalFramework: "社会分层与结构性就业替代分析",
        insightSummary:
          "传统煤电与重化工集中地区面临显著的结构性失业与地方财政萎缩压力。若缺乏再培训与社会保障托底，环保议题可能演变为区域公平撕裂的社会议题。",
        blindSpotWarning: "过度强调短期社会稳定保护，可能延缓落后高耗能产能的必要出清节奏。",
        citationIds: ["KB-05-C02", "KB-05-C03"],
      },
      {
        discipline: "历史学",
        colorToken: "violet",
        coreAssumption: "每一次主导能源体系更替都伴随着全球地缘经济重心的长时段转移。",
        analyticalFramework: "能源转型史与技术路径依赖（Path Dependence）",
        insightSummary:
          "从薪柴到煤炭、再到石油电力，能源基础设施具有极强的资产专用性与路径依赖。中国在光伏、特高压与动力电池上的先发积累正在重塑百年能源地缘格局。",
        blindSpotWarning: "历史上的能源转型多为增量叠加，而本次碳约束要求化石能源存量主动替代，难度倍增。",
        citationIds: ["KB-10-C01", "KB-10-C02"],
      },
    ],
    relations: [
      { from: "系统科学", to: "经济学", type: "tension", label: "基建时间延迟 vs 短期碳价剧烈波动" },
      { from: "管理学", to: "法学", type: "synergy", label: "合规碳足迹核查支撑出口供应链韧性" },
      { from: "经济学", to: "社会学", type: "tension", label: "市场出清效率 vs 资源型地区公正转型" },
      { from: "历史学", to: "系统科学", type: "synergy", label: "路径依赖解释旧能源锁定惯性" },
      { from: "法学", to: "管理学", type: "tension", label: "国际碳关税倒逼企业加速绿色技改" },
    ],
  },

  "基因编辑技术的伦理边界": {
    topic: "基因编辑技术的伦理边界",
    coreSynthesis:
      "CRISPR 等基因编辑技术使人类首次拥有精准改写生命底层代码的能力。如何在“救治绝症患者的有利原则”与“防范生殖系不可逆风险及基因阶层固化”之间划定全球共识红线，是生命科学、法学与哲学共同面临的世纪考题。",
    perspectives: [
      {
        discipline: "医学",
        colorToken: "emerald",
        coreAssumption: "医学技术的首要目标是减轻患者病痛，但必须以安全可控与知情同意为前提。",
        analyticalFramework: "生命伦理学四原则（自主、不伤害、有利、公正）",
        insightSummary:
          "体细胞编辑（如治疗地中海贫血）仅作用于个体且不遗传，临床获益明确；但生殖系胚胎编辑涉及脱靶突变与无法征得未出生后代“知情同意”的根本伦理困境。",
        blindSpotWarning: "临床医生往往聚焦单个患者救治紧迫性，容易低估技术泛化后的长远种群社会后果。",
        citationIds: ["KB-12-C01", "KB-12-C02"],
      },
      {
        discipline: "法学",
        colorToken: "cyan",
        coreAssumption: "面对可能造成跨代不可逆损害的前沿科技，法律必须设立事前风险预防红线。",
        analyticalFramework: "风险预防原则（Precautionary Principle） + 监管沙盒",
        insightSummary:
          "全球主流立法严禁将经过基因编辑的人类胚胎用于生殖目的。未来治理需区分“临床治疗”与“商业增强”，并对生物实验室建立穿透式伦理审查与刑事责任追溯。",
        blindSpotWarning: "各国监管尺度不均可能催生“伦理套利（Ethics Dumping）”与地下医疗黑市。",
        citationIds: ["KB-03-C03"],
      },
      {
        discipline: "哲学",
        colorToken: "indigo",
        coreAssumption: "人类尊严建立在主体自主性之上，人不应被物化为父母或资本预设的“设计品”。",
        analyticalFramework: "康德目的王国伦理 + 价值理性审视",
        insightSummary:
          "哈贝马斯指出，若后代的遗传特征由前代单方面设计定制，将破坏代际之间平等的道德主体地位，使新生儿在出生前即丧失对自身生命开放性的自主权。",
        blindSpotWarning: "抽象的哲学本质主义辩论有时难以回应罕见病家庭极其具体的现实绝望。",
        citationIds: ["KB-01-C03"],
      },
      {
        discipline: "社会学",
        colorToken: "rose",
        coreAssumption: "昂贵的生物增强技术会与既有财富分配结构结合，制造结构性不平等。",
        analyticalFramework: "生物社会分层与“基因鸿沟”预警模型",
        insightSummary:
          "当基因编辑从“修复缺陷”滑向“智力、体能与外貌增强”，高昂费用将使富裕阶层把经济优势写入生物学遗传，固化为几乎不可跨越的“基因种姓”分化。",
        blindSpotWarning: "可能陷入反乌托邦叙事预设，忽视普惠性基因疗法纳入公共医保的可能性。",
        citationIds: ["KB-05-C02", "KB-12-C02"],
      },
      {
        discipline: "心理学",
        colorToken: "amber",
        coreAssumption: "父母的焦虑与风险感知偏差极易在技术可及性面前转化为非理性选择。",
        analyticalFramework: "前景理论与“基因决定论”认知偏差",
        insightSummary:
          "商业机构宣传容易诱导公众陷入“单基因决定智商/性格”的简化错觉，忽略环境教养与多基因复杂交互，导致家庭在焦虑驱动下承担极高未知生理风险。",
        blindSpotWarning: "个体心理矫正无法替代公共卫生机构的强制性科普与广告监管。",
        citationIds: ["KB-06-C02"],
      },
      {
        discipline: "系统科学",
        colorToken: "violet",
        coreAssumption: "基因组是一个高度耦合的非线性调控网络，牵一发而动全身。",
        analyticalFramework: "复杂系统涌现性 + 基因多效性（Pleiotropy）网络分析",
        insightSummary:
          "单一基因位点往往同时参与多项生理通路（如某抗病毒突变可能伴随认知或代谢脆弱性）。人为敲除或替换单个位点可能在群体演化长河中削弱基因库多样性。",
        blindSpotWarning: "复杂系统不确定性论证若被绝对化，可能无限期冻结急需的罕见病临床试验。",
        citationIds: ["KB-08-C03"],
      },
    ],
    relations: [
      { from: "医学", to: "法学", type: "tension", label: "临床救治紧迫性 vs 生殖系禁用红线" },
      { from: "哲学", to: "社会学", type: "synergy", label: "反对人类设计物化与基因阶级固化" },
      { from: "系统科学", to: "医学", type: "synergy", label: "基因多效性警示脱靶与远期未知风险" },
      { from: "心理学", to: "社会学", type: "synergy", label: "父母焦虑放大商业增强市场需求" },
      { from: "法学", to: "哲学", type: "synergy", label: "风险预防原则守护未出生后代主体性" },
    ],
  },
};

export function getLensDemoFallback(topic: string): LensResponse {
  const exact = LENS_PRESETS[topic.trim()];
  const citations = ragEngine.retrieve(topic, 6);

  if (exact) {
    const ids = Array.from(new Set(exact.perspectives.flatMap((p) => p.citationIds)));
    const resolvedCitations = ragEngine.getCitationsByIds(ids);
    return {
      ...exact,
      citations: resolvedCitations.length > 0 ? resolvedCitations : citations,
      usedModel: "deepseek-chat",
      isDemoMode: true,
    };
  }

  // 自定义议题无 Key 时的智能检索合成兜底
  const fallbackDisciplines: Array<{
    discipline: string;
    colorToken: LensResponse["perspectives"][number]["colorToken"];
    assumption: string;
    framework: string;
    blindSpot: string;
  }> = [
    {
      discipline: "哲学",
      colorToken: "indigo",
      assumption: "任何社会或技术议题的底层都隐含着价值排序与概念边界预设。",
      framework: "工具理性 vs 价值理性分析框架",
      blindSpot: "容易停留在抽象思辨层，缺乏对具体量化执行约束的敏感度。",
    },
    {
      discipline: "经济学",
      colorToken: "amber",
      assumption: "资源稀缺条件下，制度结果取决于各参与方的激励相容与外部性成本。",
      framework: "机会成本权衡与外部性内部化模型",
      blindSpot: "易将非货币化的情感、公平与文化尊严折算为单一效用函数。",
    },
    {
      discipline: "法学",
      colorToken: "cyan",
      assumption: "技术创新与行为自由必须在正当程序、权责对等与风险预防边界内运行。",
      framework: "正当程序原则与权利义务平衡框架",
      blindSpot: "成文规则常滞后于前沿实践演化，难以覆盖灰色创新地带。",
    },
    {
      discipline: "计算机科学",
      colorToken: "emerald",
      assumption: "复杂信息处理可通过抽象建模、算法优化与可验证系统架构实现规模化。",
      framework: "系统边界建模与“探索-利用”权衡",
      blindSpot: "容易假设目标函数完整可测，忽略社会技术系统的非预期反馈。",
    },
    {
      discipline: "社会学",
      colorToken: "rose",
      assumption: "个体决策与现象涌现受制于社会网络、资源分层与公共领域结构。",
      framework: "数字认知鸿沟与结构化约束视角",
      blindSpot: "有时过度强调宏观结构决定力，低估微观主体的能动创新空间。",
    },
    {
      discipline: "心理学",
      colorToken: "violet",
      assumption: "人类认知受制于双系统负荷与直觉启发式偏差。",
      framework: "卡尼曼双系统模型与元认知监控",
      blindSpot: "聚焦个体认知机制，可能忽视跨学科制度环境的宏观影响。",
    },
  ];

  const perspectives = fallbackDisciplines.map((d, idx) => {
    const matched =
      citations.find((c) => c.discipline === d.discipline) ||
      citations[idx % Math.max(citations.length, 1)];
    return {
      discipline: d.discipline,
      colorToken: d.colorToken,
      coreAssumption: d.assumption,
      analyticalFramework: d.framework,
      insightSummary: `从${d.discipline}视角审视“${topic}”，核心在于识别其背后的${d.framework}约束。${
        matched
          ? `结合校内知识库《${matched.docTitle}》的理论脉络，应当警惕单一维度推导导致的认知窄化。`
          : "建议结合多学科实证证据进行交叉验证。"
      }`,
      blindSpotWarning: d.blindSpot,
      citationIds: matched ? [matched.chunkId] : [],
    };
  });

  return {
    topic,
    coreSynthesis: `当前处于离线演示模式（未配置 DeepSeek API Key）。系统已联动本地跨学科知识库检索出 ${citations.length} 条相关理论切片，为您生成“${topic}”的六维认知解构骨架。点击右上角配置 DeepSeek API Key 后，即可解锁针对任意自定义议题的实时大模型深度推演。`,
    perspectives,
    relations: [
      { from: "哲学", to: "经济学", type: "tension", label: "价值规范诉求 vs 效率激励计算" },
      { from: "计算机科学", to: "法学", type: "tension", label: "技术快速迭代 vs 规则滞后治理" },
      { from: "经济学", to: "社会学", type: "tension", label: "个体效用最优 vs 群体结构公平" },
      { from: "心理学", to: "哲学", type: "synergy", label: "元认知监控支撑理性自我反思" },
      { from: "社会学", to: "法学", type: "synergy", label: "公共领域诉求推动制度规范完善" },
    ],
    citations,
    usedModel: "deepseek-chat",
    isDemoMode: true,
  };
}

// ==========================================
// 二、苏格拉底理性思辨场 Demo Presets
// ==========================================

const SOCRATIC_INTERNSHIP_PRESET: Omit<SocraticResponse, "citations" | "usedModel" | "isDemoMode"> = {
  rigorScore: 54,
  subScores: {
    evidenceStrength: 48,
    logicalConsistency: 58,
    premiseTransparency: 44,
  },
  fallacies: [
    {
      name: "虚假两难（False Dilemma）",
      severity: "high",
      quoteFromUser: "把所有课余时间都用来刷实习，学通识课没有实用价值",
      explanation:
        "将“刷实习提升就业技能”与“学习通识课拓展底层思维”强行对立为非此即彼的零和博弈，忽视了二者在不同成长周期的互补协同效应。",
    },
    {
      name: "功利主义窄化（短期工具理性）",
      severity: "high",
      quoteFromUser: "企业校招只看实习经历……对找工作毫无帮助",
      explanation:
        "将大学四年整体教育目标等价于“拿到第一份校招 Offer 的短期筛选信号”，忽略了入职 3~5 年后决定职业上限的跨学科整合力、判断力与表达力。",
    },
    {
      name: "幸存者偏差（Survivorship Bias）",
      severity: "medium",
      quoteFromUser: "企业校招只看实习经历和简历项目",
      explanation:
        "过度聚焦凭借多段实习拿到大厂 Offer 的显性样本，忽略了大量因同质化实习堆砌（内卷军备竞赛）却缺乏底层思考深度而被技术变革快速淘汰的沉默样本。",
    },
  ],
  proSideReinforcement: {
    coreKernel:
      "你的观点敏锐地捕捉到了当代劳动力市场存在“信号筛选机制（Signaling）”的现实：在信息不对称的校招中，高质量实习确实能有效验证工程落地能力与职场适应度，降低用人单位的试错成本。",
    academicArguments: [
      "【信号理论视角】在斯宾塞（Spence）劳动力市场信号模型下，高质量实习履历是比空泛自评更难伪造的能力信号，能显著提升首份工作匹配效率。",
      "【实践建构主义】真实业务场景中的反馈闭环具有高保真度，能帮本科生修正象牙塔内的知识盲区，明确后续选课的针对性。",
      "【机会成本意识】在大三大四关键求职窗口期，合理配置垂直实习时间确实优于盲目堆砌无目标的水课。",
    ],
  },
  conSideChallenge: {
    devilsAdvocateThesis:
      "若所有学生都将 100% 精力投入短期岗位技能训练，不仅会陷入低边际回报的“实习军备竞赛囚徒困境”，更会在 AI 快速替代初级执行岗位的浪潮下丧失跨界迁移与判断力护城河。",
    counterExamples: [
      "【AI 替代效应反例】过去只需熟练操作特定软件或编写基础增删改查代码即可胜任的实习技能，如今正被大模型以指数级速度接管，而高阶批判与复杂问题定义能力恰恰源自通识与多学科训练。",
      "【博弈论囚徒困境】当全年级都在无底线刷第 4、5 段同质化日常实习时，实习对简历的边际区分度趋近于零，所有人耗尽时间却未提升整体就业质量。",
      "【职业中后期分化实证】在管理岗位与交叉学科研发中，制约工程师晋升的往往不是技术工具不熟，而是缺乏经济学权衡、伦理判断与人文沟通的“通识底层素养”。",
    ],
  },
  socraticQuestions: [
    {
      level: 1,
      question: "你所界定的“实用价值”具体是指毕业当年的起薪最大化，还是指十年尺度下的职业抗风险与自我实现能力？",
      intentHint: "概念澄清：厘清“实用”的时间尺度与评价维度",
    },
    {
      level: 2,
      question: "你的推论隐含了一个前提——“通识课的内容与校招所需核心能力完全正交”。如果某门逻辑学或制度经济学通识课能帮你看穿商业模式陷阱，它还属于“毫无帮助”吗？",
      intentHint: "前提挑战：检验隐含的“能力二分法”假设是否成立",
    },
    {
      level: 3,
      question: "假设 3 年后生成式 AI 接管了 80% 标准化初级执行工作，一位有 5 段流水线实习但只会按指令执行的学生，与一位有 2 段扎实实习+深厚跨学科思维的学生，谁的不可替代性更高？",
      intentHint: "边界推演：在技术变革反事实情境下检验论证韧性",
    },
  ],
  reasoningProcess: `[DeepSeek-R1 思维链推理摘要]
1. 识别核心主张：用户主张“100%课余时间刷实习 > 学通识课”，依据为“校招只看实习与项目”。
2. 抽取隐含前提 P1：大学教育唯一/最高价值即通过校招首轮简历筛选；P2：实习与通识学习之间存在绝对排斥关系（零和博弈）；P3：校招看重的技能无法从通识思维中获得迁移收益。
3. 谬误扫描：
   - “把所有课余时间……没有实用价值”存在典型的【虚假两难】极端量化词（“所有”、“毫无”）；
   - 将短期招聘信号等同于全部教育价值，属于【工具理性窄化】；
   - 援引经济学知识库 [KB-02-C03] 博弈论囚徒困境，刷同质实习存在显著边际效用递减。
4. 构造红蓝平衡：遵循“仁慈原则”，先肯定信号理论下实习的真实价值，再以 AI 时代初级技能贬值作为反事实冲击，设计 3 阶苏格拉底诘问引导用户修正极端全称判断。`,
};

export function getSocraticDemoFallback(
  thesis: string,
  previousRoundContext?: string
): SocraticResponse {
  const citations = ragEngine.retrieve(`${thesis} 逻辑谬误 批判性思维`, 5);
  const isSecondRound = Boolean(previousRoundContext && previousRoundContext.trim().length > 0);

  if (thesis.includes("实习") && thesis.includes("通识")) {
    if (isSecondRound) {
      return {
        ...SOCRATIC_INTERNSHIP_PRESET,
        rigorScore: 81,
        subScores: {
          evidenceStrength: 78,
          logicalConsistency: 84,
          premiseTransparency: 80,
        },
        fallacies: [
          {
            name: "仍需注意边界条件限定",
            severity: "low",
            quoteFromUser: thesis.slice(0, 48),
            explanation:
              "你在二轮修正中已成功消除了“全称绝对化”谬误，引入了分阶段动态权衡视角；建议进一步补充“不同专业（如纯基础学科 vs 工程应用学科）在实习与通识配比上的差异化边界”。",
          },
        ],
        proSideReinforcement: {
          coreKernel:
            "修正后的观点已从“非此即彼的二元对立”跃迁为“时间窗口动态配置模型”，逻辑稳健性与抗反驳能力大幅增强。",
          academicArguments: [
            "结合布鲁姆认知分类学，你在低年级夯实跨学科评价框架、高年级强化实习转化，符合认知发展阶梯。",
            "有效规避了同质化实习军备竞赛导致的边际收益坍塌风险。",
            "兼顾了短期劳动力市场信号传递与长期不可替代性护城河构建。",
          ],
        },
        reasoningProcess: `[DeepSeek-R1 二轮修正评估思维链]
对比用户首轮观点与本轮修正内容：
- 用户吸纳了“分阶段动态配置”与“区分短期信号与长期能力”的反问提示，去掉了“所有/毫无”等绝对全称修饰词。
- 逻辑严密性由 54 分跃升至 81 分（+27），前提透明度显著改善。`,
        citations,
        usedModel: "deepseek-reasoner",
        isDemoMode: true,
      };
    }

    return {
      ...SOCRATIC_INTERNSHIP_PRESET,
      citations,
      usedModel: "deepseek-reasoner",
      isDemoMode: true,
    };
  }

  // 通用高质量思辨 Demo 兜底
  const baseScore = isSecondRound ? 79 : 61;
  return {
    rigorScore: baseScore,
    subScores: {
      evidenceStrength: isSecondRound ? 76 : 56,
      logicalConsistency: isSecondRound ? 82 : 64,
      premiseTransparency: isSecondRound ? 78 : 54,
    },
    fallacies: isSecondRound
      ? [
          {
            name: "次级边界条件待完善",
            severity: "low",
            quoteFromUser: thesis.slice(0, 50),
            explanation:
              "二轮修正已回应了主要前提质疑，论证层次更加立体。若能补充实证反例的容纳机制，严密性可进一步提升至 85+。",
          },
        ]
      : [
          {
            name: "隐含前提未显性化",
            severity: "medium",
            quoteFromUser: thesis.slice(0, 60),
            explanation:
              "当前论断在事实描述与价值判断之间跨度较大，建议显性说明支撑结论成立的边界条件与核心假设。",
          },
          {
            name: "单一视角归因倾向",
            severity: "medium",
            quoteFromUser: thesis.slice(0, 45),
            explanation:
              "倾向于将复杂多因社会/教育现象归因于单一驱动因素，忽略了制度反馈回路与长时段演化约束。",
          },
        ],
    proSideReinforcement: {
      coreKernel: `你的论述指出了当前情境中最具现实张力的核心痛点，具备明确的实践问题意识（当前为演示模式，配置 DeepSeek API Key 后将由 R1 进行逐字深度拆解）。`,
      academicArguments: [
        citations[0]
          ? `结合知识库《${citations[0].docTitle}》（${citations[0].discipline}），该观点触及了效率优化与主体激励的核心机制。`
          : "从理性决策视角看，个体在有限资源约束下追求显性目标符合激励相容直觉。",
        "在短期可执行性与可观测结果上，你的立论提供了清晰的操作方向。",
        "若能补充对比实验数据或边界限定条件，该核心立论将更具学术说服力。",
      ],
    },
    conSideChallenge: {
      devilsAdvocateThesis:
        "从反方视角看，若将该主张推广为普遍原则，可能在长期激励相容、认知能力退化或社会公平维度触发意料之外的负外部性。",
      counterExamples: [
        "【边界极端测试】如果所有参与者均按此策略行动，系统的总体均衡收益是否会因“合成谬误”而恶化？",
        "【长期反馈延迟】短期看似高效的局部最优解，往往会在 3～5 年延迟反馈期后暴露结构性脆弱。",
        "【价值冲突反例】当效率指标与公平、自主性或学术诚信发生正面冲突时，原论证缺乏优先级仲裁准则。",
      ],
    },
    socraticQuestions: [
      {
        level: 1,
        question: "在你刚才的核心表述中，最关键的价值判定标准（如“好”“有用”“应该”）具体是如何操作化定义的？",
        intentHint: "概念澄清：避免核心术语含混带来的推论漂移",
      },
      {
        level: 2,
        question: "你的论证默认了一个前提：外部技术或制度环境在未来 3 年内保持静态不变。如果该前提失效，你的结论还成立吗？",
        intentHint: "前提挑战：检验假设的时空适用边界",
      },
      {
        level: 3,
        question: "设想你面对一位完全处于弱势条件下的同龄人，按照你的方案执行最坏可能承担什么不可逆代价？",
        intentHint: "边界推演：进行最坏情境压力测试与伦理换位",
      },
    ],
    reasoningProcess: `[演示模式思维链摘要]
已通过本地 Hybrid RAG 引擎匹配 ${citations.length} 条逻辑学与跨学科参考切片。
${
  isSecondRound
    ? "检测到用户提交了二轮修正观点，逻辑严密性评分由首轮基准上调至 79 分。"
    : "检测到用户未配置在线 DeepSeek API Key，已启用本地逻辑框架诊断引擎；配置 Key 后将直连 deepseek-reasoner 输出完整实时思维链。"
}`,
    citations,
    usedModel: "deepseek-reasoner",
    isDemoMode: true,
  };
}

// ==========================================
// 三、多维权衡判断决策沙盘 Demo Presets
// ==========================================

const DECISION_PRESET_EVALUATIONS: Record<
  string,
  Omit<DecisionResponse, "citations" | "usedModel" | "isDemoMode">
> = {
  [DECISION_TEMPLATES[0].dilemma]: {
    dilemma: DECISION_TEMPLATES[0].dilemma,
    overallGuidance:
      "三项路径本质上对应三种截然不同的“风险-期权”结构：读博是用 5 年短期现金流折价换取长期学术/顶尖研发期权；大厂就业以最高短期确定性累积工程资本与现金流；创业则是高波动非对称赌注。建议依据个人家庭风险缓冲垫与内心科研耐受力动态调节左侧权重滑块。",
    evaluations: [
      {
        optionName: "本校/顶尖高校保研读博",
        scores: {
          longTermCeiling: 91,
          shortTermCertainty: 64,
          riskResilience: 78,
          costEfficiency: 62,
          passionAlignment: 82,
        },
        shortTermYield: 42,
        longTermYield: 92,
        swot: {
          strengths: ["高学历壁垒与前沿科研试错空间", "可参与国家级重大课题与顶尖学术网络"],
          weaknesses: ["3~5年机会成本较高，短期补贴微薄", "对导师资源与科研心理韧性高度依赖"],
          opportunities: ["高校教职、顶尖实验室及 AI 首席科学家通道", "跨学科博士更容易形成稀缺复合壁垒"],
          threats: ["延期毕业风险与发表内卷压力", "产业技术迭代速度超越传统论文发表周期"],
        },
        worstCaseScenario:
          "读博第 3 年课题方向被产业界开源模型降维打击或遇到不匹配导师，面临退学沉没成本与高龄重返求职市场的双重焦虑。",
        mitigationPlan:
          "入学前充分调研导师组近年毕业去向与发文节奏；博二前保留工程代码能力与暑期产业联培接口，必要时争取转硕及时止损。",
      },
      {
        optionName: "头部科技大厂核心研发岗就业",
        scores: {
          longTermCeiling: 76,
          shortTermCertainty: 90,
          riskResilience: 74,
          costEfficiency: 88,
          passionAlignment: 68,
        },
        shortTermYield: 92,
        longTermYield: 75,
        swot: {
          strengths: ["极高首年现金流回报与真实亿级并发工程历练", "快速建立独立经济能力与行业人脉"],
          weaknesses: ["工作内容易陷入业务螺丝钉化，自主探索空间受限", "长期存在组织裁员与年龄曲线压力"],
          opportunities: ["2~3年后可凭工程资本内部转岗 AI 架构或带资读博/创业", "快速积累第一桶金提升抗风险底气"],
          threats: ["互联网行业周期波动与高频加班导致认知学习时间被挤压"],
        },
        worstCaseScenario:
          "入职边缘业务线遭遇部门裁撤优化，且长期执行重复性需求开发导致技术视野窄化、再求职议价能力下降。",
        mitigationPlan:
          "校招优先锁定核心基建或 AI 中台部门；保持每周 6 小时“非工作领域跨学科阅读与开源输出”，将储蓄率维持在 45% 以上构建 18 个月自由现金储备。",
      },
      {
        optionName: "结合AI方向组建轻量级跨界创业团队",
        scores: {
          longTermCeiling: 95,
          shortTermCertainty: 28,
          riskResilience: 42,
          costEfficiency: 52,
          passionAlignment: 92,
        },
        shortTermYield: 35,
        longTermYield: 88,
        swot: {
          strengths: ["全栈主导权与极速商业闭环成长，认知迭代速度是常人3倍", "若跑通PMF可获得指数级非线性回报"],
          weaknesses: ["现金流脆弱、客户冷启动难度大", "团队分歧与大厂同质化免费功能挤压风险极高"],
          opportunities: ["依托高校双创孵化政策与低成本大模型API验证垂直细分场景"],
          threats: ["底层模型能力升级直接吞噬套壳应用价值", "失败后可能错过应届生校招黄金身份窗口"],
        },
        worstCaseScenario:
          "投入 14 个月及启动资金后产品未找到真实付费刚需，团队解散且失去应届生身份，面临高心理落差与求职空窗期质疑。",
        mitigationPlan:
          "严守“精益验证红线”：不重资产囤积算力，利用现有 API 与 6 周 MVP 快速测试真实付费意愿；设定 6 个月/5 万元止损线，并把项目全过程沉淀为高质量全栈作品集。",
      },
    ],
  },

  [DECISION_TEMPLATES[1].dilemma]: {
    dilemma: DECISION_TEMPLATES[1].dilemma,
    overallGuidance:
      "科研选题的核心张力在于“短期发文确定性”与“长期学术辨识度”之间的权衡。纯追逐热门工程容易沦为参数调优苦力，纯做冷门理论则面临极高发表寂寞期，“AI + 传统学科交叉融合”往往处于帕累托前沿的甜点区。",
    evaluations: [
      {
        optionName: "热门生成式 AI 垂直应用工程",
        scores: {
          longTermCeiling: 74,
          shortTermCertainty: 86,
          riskResilience: 62,
          costEfficiency: 84,
          passionAlignment: 74,
        },
        shortTermYield: 88,
        longTermYield: 70,
        swot: {
          strengths: ["开源生态丰富，原型验证快，极易衔接工业界实习", "选题热点关注度高"],
          weaknesses: ["同质化竞争极度惨烈，创意保鲜期往往不足 3 个月"],
          opportunities: ["可快速产出可演示系统用于竞赛或求职作品集"],
          threats: ["大厂发布新基座模型可能一夜之间覆盖你的工作"],
        },
        worstCaseScenario:
          "辛辛苦苦调优半年的 Prompt 与 Workflow 在顶会投稿前夕被基座模型原生能力替代，导致创新点归零。",
        mitigationPlan:
          "避免只做浅层封装，将重心下沉至“领域专属评测基准（Benchmark）”或“行业真实约束下的系统工程架构”。",
      },
      {
        optionName: "长周期冷门跨学科基础理论探索",
        scores: {
          longTermCeiling: 93,
          shortTermCertainty: 38,
          riskResilience: 72,
          costEfficiency: 55,
          passionAlignment: 88,
        },
        shortTermYield: 36,
        longTermYield: 94,
        swot: {
          strengths: ["竞争者极少，一旦突破即建立极深学术护城河", "思维训练极度扎实"],
          weaknesses: ["18个月本科周期内极可能无实质成果产出，影响推免绩点加分"],
          opportunities: ["契合顶尖学者长期基础研究审美，利于申请海外全奖博士"],
          threats: ["研究路径被中途证伪或缺乏同行评审共鸣导致陷入孤独内耗"],
        },
        worstCaseScenario:
          "大四推免季来临前核心定理推导卡壳，无任何阶段性论文或竞赛奖项支撑保研竞争。",
        mitigationPlan:
          "采用“主线长周期 + 支线综述/实证短平快论文”双轨策略，确保在 M9 节点有保底阶段成果可交付。",
      },
      {
        optionName: "AI + 传统学科方法论交叉融合",
        scores: {
          longTermCeiling: 89,
          shortTermCertainty: 76,
          riskResilience: 84,
          costEfficiency: 80,
          passionAlignment: 86,
        },
        shortTermYield: 74,
        longTermYield: 90,
        swot: {
          strengths: ["兼具跨学科稀缺壁垒与工程可验证性，进可申博退可就业", "完美避开纯 AI 算力军备竞赛"],
          weaknesses: ["初期需同时补齐两个学科的术语与方法论，学习坡度较陡"],
          opportunities: ["当前国家自然科学基金与各大顶会最青睐的交叉赛道"],
          threats: ["若未真正深入目标学科痛点，易沦为“两头不靠”的生硬拼接"],
        },
        worstCaseScenario:
          "双方学科评审专家互相认为不够“纯粹”，导致在单一学科期刊投稿受阻。",
        mitigationPlan:
          "锚定一位传统学科真问题导师与一位计算方法导师实行“双导师制”，确保解决的是真实存在的行业刚需问题。",
      },
    ],
  },

  [DECISION_TEMPLATES[2].dilemma]: {
    dilemma: DECISION_TEMPLATES[2].dilemma,
    overallGuidance:
      "城市选择实质上是在为“早期信息密度溢价”和“生活成本折旧率”定价。对于刚毕业 3 年内的青年而言，城市更大的意义在于信息密度与容错机会，而非过早追求静态安逸，但高薪若全部被房租与通勤吞噬则需重新审视净储蓄率。",
    evaluations: [
      {
        optionName: "北京/上海超一线城市拼搏",
        scores: {
          longTermCeiling: 92,
          shortTermCertainty: 74,
          riskResilience: 70,
          costEfficiency: 54,
          passionAlignment: 80,
        },
        shortTermYield: 76,
        longTermYield: 90,
        swot: {
          strengths: ["顶尖高校、头部总部与前沿信息密度全国最高", "跳槽与跨界机会基数极大"],
          weaknesses: ["居住与通勤时间成本极高，净储蓄转化率受压"],
          opportunities: ["更容易接触高维认知圈层与国际化视野"],
          threats: ["长期高压环境下的身心耗竭与落户购房门槛"],
        },
        worstCaseScenario:
          "工作 3 年后名义薪资不低但净存款有限，同时因高压工作缺乏个人成长空间，陷入“留不下又回不去”的夹心困境。",
        mitigationPlan:
          "设定清晰的“超一线三年复盘机制”：前 3 年全力吸收高密度人脉与项目履历，若未能进入头部 20% 增长曲线则果断携履历降维迁往新一线。",
      },
      {
        optionName: "杭州/成都/苏州新一线都市圈",
        scores: {
          longTermCeiling: 84,
          shortTermCertainty: 82,
          riskResilience: 86,
          costEfficiency: 88,
          passionAlignment: 84,
        },
        shortTermYield: 82,
        longTermYield: 85,
        swot: {
          strengths: ["综合性价比极优：产业机会充足且居住通勤体验友好", "人才补贴与落户政策较为宽松"],
          weaknesses: ["部分细分赛道顶尖总部数量略少于京沪"],
          opportunities: ["数字经济、硬科技与先进制造集群正在加速吸纳高素质青年"],
          threats: ["当地核心雇主高度集中于少数龙头企业，跳槽备选面相对窄"],
        },
        worstCaseScenario:
          "所在行业在当地仅有一两家头部企业，一旦遭遇裁员被迫跨省换城寻找同档次岗位。",
        mitigationPlan:
          "优先选择产业结构多元化（兼顾硬科技、互联网与国央企研发中心）的新一线枢纽城市，并保持跨区域远程行业联络。",
      },
      {
        optionName: "高校/科研院所所在二线宜居城市",
        scores: {
          longTermCeiling: 65,
          shortTermCertainty: 88,
          riskResilience: 89,
          costEfficiency: 92,
          passionAlignment: 72,
        },
        shortTermYield: 78,
        longTermYield: 64,
        swot: {
          strengths: ["生活成本低、储蓄率与闲暇时间充裕，幸福感基线稳定", "体制或高校周边生态安稳"],
          weaknesses: ["前沿商业与技术信息流较慢，职业天花板相对显性可见"],
          opportunities: ["利用充裕业余时间开展远程协作、独立科研或副业探索"],
          threats: ["容易在安逸圈中逐渐丧失对外部市场剧变的敏感度"],
        },
        worstCaseScenario:
          "五年后地方产业萎缩或个人对稳定工作产生职业倦怠，却因技能迭代停滞难以重返高竞争市场。",
        mitigationPlan:
          "刻意加入全国性线上技术/学术社群，每年至少参与 2 次一线城市行业峰会保持认知同步。",
      },
    ],
  },
};

export function getDecisionDemoFallback(req: DecisionRequest): DecisionResponse {
  const citations = ragEngine.retrieve(`${req.dilemma} 多准则决策 SWOT 机会成本`, 4);
  const preset = DECISION_PRESET_EVALUATIONS[req.dilemma.trim()];

  if (preset) {
    // 如果用户调整了方案名字或增减了方案，尽量匹配或补齐
    const mappedEvaluations = req.options.map((optName, idx) => {
      const matched =
        preset.evaluations.find((e) => e.optionName === optName) ||
        preset.evaluations[idx % preset.evaluations.length];
      return {
        ...matched,
        optionName: optName,
      };
    });

    return {
      dilemma: req.dilemma,
      overallGuidance: preset.overallGuidance,
      evaluations: mappedEvaluations,
      citations,
      usedModel: "deepseek-chat",
      isDemoMode: true,
    };
  }

  // 自定义决策情境合成兜底
  const evaluations = req.options.map((optName, idx) => {
    const base = 62 + ((idx * 11) % 24);
    return {
      optionName: optName,
      scores: {
        longTermCeiling: Math.min(95, base + (idx === 0 ? 12 : 4)),
        shortTermCertainty: Math.min(95, 88 - idx * 14),
        riskResilience: Math.min(95, 72 + (idx % 2 === 0 ? 8 : -6)),
        costEfficiency: Math.min(95, 75 + (idx === 1 ? 10 : 0)),
        passionAlignment: Math.min(95, 70 + idx * 7),
      },
      shortTermYield: Math.min(95, 85 - idx * 15),
      longTermYield: Math.min(95, 70 + idx * 10),
      swot: {
        strengths: [`“${optName}”在当前权重框架下具备清晰的核心比较优势`, "能够直接积累可迁移的核心个人资本"],
        weaknesses: ["在资源集中投入期间会挤压其他备选路径的时间窗口", "存在前期适应学习曲线成本"],
        opportunities: ["可结合跨学科复合能力形成差异化竞争位置", "随行业演进具备二次跃迁接口"],
        threats: ["外部宏观环境或评价标准变化可能拉低预期回报", "若缺乏阶段性止损指标易陷入沉没成本陷阱"],
      },
      worstCaseScenario: `假设投入 12~18 个月后外部市场风向反转或预期收益低于基准 40%，选择“${optName}”可能面临阶段性时间机会成本损失。`,
      mitigationPlan: `为“${optName}”设置第 6 个月阶段检核里程碑（Milestone），保留基础通用技能与现金流缓冲垫以实现低成本转向。`,
    };
  });

  return {
    dilemma: req.dilemma,
    overallGuidance: `当前处于演示模式（未配置 DeepSeek API Key）。系统已依据多准则决策分析（MCDA）方法论为您生成 ${req.options.length} 个方案的基准评分与压力测试骨架；拖动左侧权重滑块即可实时重算综合推荐度。配置 DeepSeek Key 后可针对您的真实情境生成定制化深度推演。`,
    evaluations,
    citations,
    usedModel: "deepseek-chat",
    isDemoMode: true,
  };
}
