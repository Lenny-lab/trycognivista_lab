# CogniVista 观睿 — 全域认知智能赋能平台

> 大学本科生工程管理课程期末大作业：基于 RAG + 双档大模型推理的认知增强原型系统

CogniVista（观睿）面向本科生的学习与思辨场景，将大模型推理、BM25 检索增强（RAG）与工程管理方法结合为五大核心视图，帮助学生跨越学科边界进行深度分析、理性思辨与复杂决策。

## 五大核心视图

| 视图 | 路由 | 能力 |
|---|---|---|
| 全域认知透镜 | `/lens` | 交互式学科星系图 + 6 维学科卡片 + RAG 原文溯源 |
| 苏格拉底思辨场 | `/socratic` | 逻辑严密性仪表盘 + 推理模型思维链 + 红蓝对抗 + 二轮追问 |
| 多维权衡决策沙盘 | `/decision` | 5 轴动态权重滑块 + 五维雷达图 + SWOT + 压力测试 |
| 知识库中心 | `/knowledge` | 12 学科语料，支持 `.md/.txt/.json` 拖拽切片入库 + 认知边界雷达图 |
| PMO 工程驾驶舱 | `/pmo` | 1 亿元 PMO 全景：CBS 环形图 + 36 月 S 曲线 + M18 EVM 监控 + 风险矩阵 |

## 技术栈

- **框架**：Next.js 15（App Router）+ React 19 + TypeScript 5.8
- **样式**：Tailwind CSS 3 + framer-motion
- **可视化**：Recharts（雷达图 / 环形图 / S 曲线）
- **检索**：自研 BM25 引擎（12 学科内置语料，支持运行时切片入库）
- **推理**：OpenAI 兼容协议接入 DeepSeek / 阿里云百炼等，双档模型（chat + reasoner），JSON 结构化输出 + zod 校验，无 Key 时自动回退内置高保真 Demo 数据集

## 快速开始

```bash
cd cognivista-prototype
npm install
npm run dev        # http://localhost:3000
```

Windows 用户可直接双击仓库根目录的 `开启.bat`（自动安装依赖、启动服务并打开浏览器），`关闭.bat` 一键停止。

### 大模型配置（可选）

系统零 Key 开箱即用（内置演示数据集）。如需实时推理，两种方式任选：

1. **界面热配置**：启动后点击右上角「演示模式 (点击配置 Key)」，输入你的 API Key，仅存于浏览器本地；
2. **服务端环境变量**：复制 `cognivista-prototype/.env.local.example` 为 `.env.local` 并按注释填写（支持 DeepSeek 官方及任意 OpenAI 兼容端点）。

## 仓库结构

```
├── cognivista-prototype/     # 原型系统（Next.js App Router）
│   ├── src/app/             #   页面路由 + API 服务端路由
│   ├── src/components/      #   五大视图组件
│   ├── src/lib/             #   BM25 检索引擎 / LLM 客户端 / 提示词
│   └── src/data/            #   12 学科知识库 + 演示数据集
├── figures/                 # 报告插图
├── CogniVista观睿_工程管理期末大作业.tex   # 课程报告 LaTeX 源码
├── CogniVista观睿_工程管理报告.pdf         # 课程报告（最终版）
└── CogniVista观睿_原型系统技术开发文档.md  # 原型系统技术文档
```

## 相关文档

- [原型系统运行指南](cognivista-prototype/README.md)
- [原型系统技术开发文档](CogniVista观睿_原型系统技术开发文档.md)
- [工程管理课程报告（PDF）](CogniVista观睿_工程管理报告.pdf)

## 许可证

[MIT](LICENSE)
