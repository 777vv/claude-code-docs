# 39. 术语表

::: info 干嘛用
- Hermes 专有词中英对照
- 看文档 / 讨论时不迷路
- 快速查"这个词到底啥意思"
:::

## 39.1 Hermes 核心概念

| 中文 | 英文 | 解释 |
|---|---|---|
| 智能体 | Agent | 一个 AI 人格，有自己的 soul / memory / skills |
| 灵魂 | Soul (soul.md) | Agent 的系统提示词，定义身份和行为 |
| 网关 | Gateway | Hermes 后台主进程，所有消息从它过 |
| 守护进程 | Daemon | 长跑后台服务（如 gateway daemon）|
| 工具 | Tool | 原子动作（read_file / shell_exec 等），Hermes 内置 40+ |
| 工具集 | Toolset | 工具的分组（core / code / data 等）|
| 技能 | Skill | Markdown 文件描述的复杂流程，**Hermes 自动生成 + 自迭代** |
| 平台 | Platform | 消息收发接口（Telegram / Discord / CLI 等）—— 类似 OpenClaw 的 channel |
| 后端 | Backend | 任务实际执行环境（local / docker / ssh / modal 等 7 种）|
| 智能循环 | Agent Loop | ReAct 推理-行动循环 |
| 子代理 | Subagent | 主 agent 派生的临时执行单元，独立 context |
| 工作树 | Worktree | git worktree，让 subagent 同时在同一仓库工作不冲突 |

## 39.2 记忆系统专有词

| 中文 | 英文 | 解释 |
|---|---|---|
| 工作记忆 | Working Memory | 当前对话上下文 |
| 会话记忆 | Session Memory | FTS5 索引的历史会话 |
| 长期记忆 | Long-term Memory (memory.md) | 跨会话永久事实 |
| 用户画像 | User Profile (user.md) | 偏好 / 风格 / 知识背景 |
| Honcho | Honcho | Plastic Labs 的开源用户建模 SDK |
| FTS5 | FTS5 | SQLite 全文搜索 v5（Hermes 用它索引对话）|
| 双压缩 | Dual Compression | 长 prompt 的 LLM 摘要 + token pruning |
| Prompt 缓存 | Prompt Caching | Anthropic 独家，重复前缀只收 1/10 费用 |

## 39.3 训练 / 评估专有词

| 中文 | 英文 | 解释 |
|---|---|---|
| 轨迹 | Trajectory | 一次任务的完整推理-行动记录，可导出训练用 |
| SFT | Supervised Fine-Tuning | 监督微调，用 trajectory 训练新模型 |
| DPO | Direct Preference Optimization | 偏好优化训练（chosen vs rejected） |
| RLHF | RL from Human Feedback | 人类反馈强化学习 |
| ReAct | Reason + Act | LLM 思考-行动循环模式 |

## 39.4 LLM / 模型相关

| 中文 | 英文 | 解释 |
|---|---|---|
| 上下文窗口 | Context Window | LLM 一次能处理的最大 token |
| 推理模型 | Reasoning Model | 加入显式 chain-of-thought 的模型（DeepSeek R1 / o1）|
| 函数调用 | Function Calling | LLM 决定调外部函数能力 |
| 工具调用 | Tool Use | 同 Function Calling |
| 流式 | Streaming | LLM 边生成边返回 |
| 提示词 | Prompt | 给 LLM 的输入 |
| 嵌入 | Embedding | 文本转向量（FTS5 之外的检索用）|
| 幻觉 | Hallucination | LLM 编不存在的事实 |

## 39.5 协议 / 协议词

| 中文 | 英文 | 解释 |
|---|---|---|
| 模型上下文协议 | MCP (Model Context Protocol) | 跨 AI 工具的"插件"标准 |
| 开源代理技能 | agentskills.io | Hermes skill 文件的开放标准 |

## 39.6 Backend 类型词

| 类型 | 解释 |
|---|---|
| local | 本机 |
| docker | Docker 容器 |
| ssh | 远程 SSH 服务器 |
| modal | Modal 云函数（按秒计费）|
| daytona | Daytona 云开发环境 |
| singularity | HPC 集群容器格式 |
| vercel-sandbox | Vercel 边缘沙箱 |

## 39.7 Channel / Platform 词

| 平台 | 解释 |
|---|---|
| CLI | 命令行交互 |
| Telegram | Telegram bot |
| Discord | Discord bot |
| Slack | Slack app |
| WhatsApp | WhatsApp |
| Signal | Signal |
| Matrix | Matrix 协议 |
| Email | 邮件（IMAP+SMTP）|

## 39.8 命令前缀 / 标志

| 词 | 解释 |
|---|---|
| `hermes setup` | 初次配置向导 |
| `hermes doctor` | 环境体检 |
| `hermes gateway` | 后台进程管理 |
| `hermes model` | LLM 管理 |
| `hermes tools` | toolset 管理 |
| `hermes platform` | channel 管理 |
| `hermes skills` | skill 管理 |
| `hermes memory` | 记忆管理 |
| `hermes trajectory` | trajectory 管理 |
| `hermes claw migrate` | 从 OpenClaw 迁移（本站重点）|

## 39.9 Hermes 独有但容易混淆的

| 词 | 容易混淆什么 | 区别 |
|---|---|---|
| Hermes Agent (工具) | Hermes 模型 | Hermes Agent = 这个 agent 框架；Hermes 模型 = Nous 训的 LLM 模型名 |
| Hermes 7 模型 | Hermes Agent v0.7 | 前者是 LLM 模型版本，后者是 agent 框架版本 |
| Honcho | Hermes 自带 | Honcho 是独立开源项目（Plastic Labs），Hermes 集成它 |
| MCP | Skill | MCP 是协议（跨工具），Skill 是 Hermes 内部"经验"文件 |
| Subagent | Multi-agent | Subagent 是临时派生；OpenClaw 那种 multi-agent 是长跑独立 |

## 39.10 常用缩写

| 缩写 | 全称 |
|---|---|
| API | Application Programming Interface |
| CLI | Command Line Interface |
| LLM | Large Language Model |
| SFT | Supervised Fine-Tuning |
| RAG | Retrieval-Augmented Generation |
| MCP | Model Context Protocol |
| TUI | Terminal User Interface |
| OAuth | Open Authorization |
| PAT | Personal Access Token |
| PII | Personally Identifiable Information |
| FTS5 | Full-Text Search v5 (SQLite) |
| VPS | Virtual Private Server |
| WSL | Windows Subsystem for Linux |
| HPC | High-Performance Computing |
| MFA | Multi-Factor Authentication |
| TTL | Time To Live |
| OOM | Out Of Memory |

## 39.11 LLM 服务商速查

| 缩写 | 全称 |
|---|---|
| Nous | Nous Research（Hermes 的发起公司）|
| DeepSeek | 深度求索 |
| Qwen | 通义千问（阿里）|
| Kimi | 月之暗面 |
| GLM | 智谱 AI |
| MiniMax | MiniMax |
| MiMo | 小米 MiMo |
| Anthropic | Anthropic / Claude |
| OpenAI | OpenAI / GPT |
| Gemini | Google Gemini |

## 39.12 工具公司速查

| 名字 | 是什么 |
|---|---|
| Nous Research | Hermes 的开发公司 |
| Plastic Labs | Honcho 的开发公司 |
| Astral | uv / ruff / pyflakes 的开发公司 |
| Modal | Modal 云函数 |
| Daytona | Daytona 云开发环境 |
| MiniMax | Hermes 战略合作 LLM 供应商 |

---

**下一步**：[40. 资源链接 & FAQ →](/hermes/reference/resources)

整套教程最后一篇——官方链接、社区、推荐阅读、收尾 FAQ。
