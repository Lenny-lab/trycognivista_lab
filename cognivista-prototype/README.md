# CogniVista 观睿 — 原型系统运行指南

## 1. 环境准备
- Node.js >= 20
- npm >= 10

## 2. 安装依赖与启动
```bash
cd cognivista-prototype
npm install
npm run dev
```
访问 `http://localhost:3000`。

## 3. DeepSeek API 配置（可选）
- **方式 A（界面热配置）**：启动后点击右上角「演示模式 (点击配置 Key)」胶囊，输入你的 `sk-...` DeepSeek API Key 即可实时切换至 `deepseek-chat` (V3) 与 `deepseek-reasoner` (R1) 双模型推理。
- **方式 B（服务端环境变量）**：复制 `.env.local.example` 为 `.env.local` 并填入 `DEEPSEEK_API_KEY=`。
- **零 Key 开箱即用**：未配置 Key 时系统自动启用内置高保真学术演示数据集（Demo Fallback），五大模块全部可交互体验。

## 4. 五大核心视图
- `/lens`（及 `/`）：全域跨学科认知透镜（交互式星系图 + 6 维学科卡片 + RAG 原文溯源）
- `/socratic`：苏格拉底理性思辨场（逻辑严密性仪表盘 + DeepSeek-R1 思维链 + 红蓝对抗 + 二轮追问）
- `/decision`：多维权衡判断决策沙盘（5 轴动态权重滑块 + 五维雷达图 + SWOT + 压力测试）
- `/knowledge`：12 学科知识库中心（支持 `.md/.txt/.json` 拖拽实时切片入库 + 个人认知边界雷达图）
- `/pmo`：1 亿元 PMO 工程管理全景驾驶舱（CBS 环形图 + 36 月 S 曲线 + M18 EVM 监控 + 风险矩阵）
