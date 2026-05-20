# 39. 术语表

::: info 这一章干嘛用
- 中英对照所有 OpenClaw 相关行话
- 速查表，看到生词来这里
- 跟社区 / 文档对照时不迷路
:::

## 39.1 OpenClaw 核心

| 中文 | 英文 | 解释 |
|---|---|---|
| 网关 | Gateway | OpenClaw 的中央后台服务，所有消息都从它过 |
| 智能体 | Agent | 一个 AI 人格，有自己的身份/记忆/权限 |
| 灵魂 | Soul (soul.md) | Agent 的系统提示词，定义身份和行为 |
| 通道 | Channel | 消息收发的接口（飞书、Telegram 等） |
| 技能 | Skill | 给 Agent 加工具的 Markdown 包 |
| 守护进程 | Daemon | 后台一直运行的服务 |
| 节点 | Node | 连到 Gateway 的设备（手机、摄像头等） |
| 工作区 | Workspace | 存储所有配置/数据的目录（默认 ~/.openclaw/workspace） |
| 画布 | Canvas | Agent 控制的可视化页面 |
| 配对 | Pairing | 设备首次连 Gateway 的授权流程 |
| 记忆 | Memory | Agent 的长期/短期记忆系统 |
| 工作流 | Workflow | 串联多个 step 的自动化流程（yaml） |
| 触发器 | Trigger | 启动 workflow 的事件（cron / webhook / 消息） |
| 编排 | Orchestration | 多 agent 协同完成复杂任务 |

## 39.2 LLM 通用

| 中文 | 英文 | 解释 |
|---|---|---|
| 大语言模型 | LLM | Large Language Model，AI 的"大脑" |
| 上下文 | Context | LLM 一次能"看到"的内容长度 |
| 上下文窗口 | Context Window | LLM 最大上下文长度（如 200K tokens） |
| Token | Token | LLM 计费/计算的最小单位（约 1 中文 = 1.5 token） |
| 提示词 | Prompt | 给 LLM 的输入 |
| 系统提示词 | System Prompt | 设定 LLM 角色的固定提示（在 OpenClaw 里就是 soul） |
| 推理 | Reasoning | 模型深度思考的过程 |
| 温度 | Temperature | 控制输出随机性（0-1，越高越发散） |
| 函数调用 | Function Calling | LLM 决定调外部函数的能力 |
| 工具调用 | Tool Use | 同 Function Calling |
| 流式 | Streaming | LLM 边生成边返回（不等全文完成） |
| 微调 | Fine-tuning | 用自己数据训练专属模型 |
| 嵌入 | Embedding | 把文本转成数学向量（语义检索用） |
| 向量数据库 | Vector DB | 存 embedding + 相似度检索 |
| 检索增强生成 | RAG | Retrieval-Augmented Generation，"先查后答" |
| 幻觉 | Hallucination | LLM 编不存在的事实 |

## 39.3 Skill / MCP

| 中文 | 英文 | 解释 |
|---|---|---|
| 内置技能 | Bundled Skill | OpenClaw 自带的核心 skill |
| 托管技能 | Managed Skill | 从 ClawHub 安装的 skill |
| 工作区技能 | Workspace Skill | 自己写在 workspace 里的 skill |
| 技能注入 | Skill Injection | OpenClaw 选相关 skill 塞给 LLM |
| 技能发现 | Skill Discovery | OpenClaw 找出可用 skill 列表 |
| 模型上下文协议 | MCP | Model Context Protocol，跨 AI 工具的"工具"标准 |
| MCP 服务器 | MCP Server | 实现 MCP 协议的服务（一个工具集合） |
| 能力 | Capability | Skill 暴露的具体功能（如 send_email） |

## 39.4 Agent 协作

| 中文 | 英文 | 解释 |
|---|---|---|
| 单 Agent | Single-agent | 一个 agent 干所有事 |
| 多 Agent | Multi-agent | 多个 agent 协作 |
| 主从 | Master-Slave | 一个 agent 调另一个 |
| 路由 | Routing | 消息分发到哪个 agent |
| 委托 | Delegate | Agent 把任务交给另一个 agent |
| 守门员 | Router Agent | 专门做"该派给谁"决策的 agent |
| ReAct | Reason + Act | LLM 的思考-行动循环模式 |

## 39.5 Channel 相关

| 中文 | 英文 | 解释 |
|---|---|---|
| 长轮询 | Long Polling | 客户端不停问"有消息吗"（Telegram bot 用） |
| 长连接 | Long Connection | 双方持续连着（飞书 / 钉钉 stream 模式） |
| 回调 | Webhook | 服务器主动推消息给你的 URL |
| 验签 | Signature Verification | 验证消息来源合法 |
| 鉴权 | Authentication | 确认调用方身份 |
| 授权 | Authorization | 决定能做什么 |

## 39.6 部署 / 运维

| 中文 | 英文 | 解释 |
|---|---|---|
| 沙箱 | Sandbox | 隔离环境，限制能干啥 |
| 容器 | Container | Docker 容器 |
| 镜像 | Image | Docker 镜像 |
| 编排 | Orchestration | Docker Compose / Kubernetes |
| 持久化 | Persistence | 数据保存到磁盘 |
| 卷 | Volume | Docker 数据卷 |
| 端口转发 | Port Forwarding | 把容器内端口暴露出来 |
| 反向代理 | Reverse Proxy | Nginx 等代理多个后端 |
| 隧道 | Tunnel | 加密通道（SSH Tunnel / Cloudflare Tunnel） |
| 内网穿透 | NAT Traversal | 把内网服务暴露公网 |
| 监控 | Monitoring | 跟踪服务状态/性能 |
| 告警 | Alert | 出问题主动通知 |
| 优雅停机 | Graceful Shutdown | 处理完正在做的事再退出 |

## 39.7 安全

| 中文 | 英文 | 解释 |
|---|---|---|
| 提示注入 | Prompt Injection | 恶意输入操纵 LLM |
| 越狱 | Jailbreak | 绕过 LLM 安全护栏 |
| 最小权限 | Least Privilege | 只给完成任务必需的权限 |
| 二次确认 | Two-step Confirmation | 重要操作需要再点一次同意 |
| 审计日志 | Audit Log | 谁、什么时候、做了什么，可追溯 |
| 个人身份信息 | PII | Personally Identifiable Information |
| 脱敏 | Redaction | 把敏感信息打码 |
| 密钥管理 | Secret Management | 存 API Key 等敏感凭据 |
| 防火墙 | Firewall | 网络入口过滤 |
| 白名单 | Allowlist | 只允许这些 |
| 黑名单 | Denylist | 拒绝这些 |
| 速率限制 | Rate Limiting | 防滥用，限调用频率 |
| 配额 | Quota | 用量上限 |

## 39.8 中国本地化

| 中文 | 英文 | 解释 |
|---|---|---|
| 翻墙 | VPN / Proxy | 跨过 GFW 访问国外服务 |
| 国内直连 | China Direct | 国内能直接访问，不需代理 |
| 镜像源 | Mirror | npm/pip 等的国内副本（淘宝镜像等） |
| 中转服务 | Relay | 帮国内调海外 API 的中间服务 |
| 聚合 | Aggregator | 把多家 LLM 服务整合（硅基流动 / OpenRouter） |
| 备案 | ICP Registration | 国内云服务必须的网站备案 |

## 39.9 LLM 服务商

| 简称 | 全称 | 国家 |
|---|---|---|
| Anthropic | Anthropic / Claude | 美国 |
| OpenAI | OpenAI / GPT | 美国 |
| Google | Google / Gemini | 美国 |
| DeepSeek | 深度求索 | 中国 |
| Qwen | 通义千问（阿里） | 中国 |
| Kimi | 月之暗面 | 中国 |
| GLM | 智谱 AI | 中国 |
| Llama | Meta AI | 美国 |
| Ollama | Ollama（本地） | 跨平台 |

## 39.10 缩写速查

| 缩写 | 全称 |
|---|---|
| **API** | Application Programming Interface |
| **CLI** | Command Line Interface |
| **HTTP** | HyperText Transfer Protocol |
| **HTTPS** | HTTP Secure (TLS 加密) |
| **JSON** | JavaScript Object Notation |
| **YAML** | YAML Ain't Markup Language |
| **REST** | REpresentational State Transfer |
| **WS** | WebSocket |
| **SDK** | Software Development Kit |
| **OS** | Operating System |
| **NAS** | Network-Attached Storage |
| **VPN** | Virtual Private Network |
| **VPS** | Virtual Private Server |
| **SaaS** | Software as a Service |
| **OAuth** | Open Authorization |
| **PAT** | Personal Access Token |
| **JWT** | JSON Web Token |
| **TTS** | Text To Speech |
| **STT** | Speech To Text |
| **ASR** | Automatic Speech Recognition |
| **OCR** | Optical Character Recognition |
| **OOM** | Out Of Memory |
| **CRUD** | Create / Read / Update / Delete |
| **TLDR** | Too Long Didn't Read |
| **DM** | Direct Message |
| **PR** | Pull Request |
| **CI** | Continuous Integration |
| **CD** | Continuous Deployment |
| **WSL** | Windows Subsystem for Linux |

---

**下一步**：[40. 资源链接 & FAQ →](/openclaw/reference/resources)

整套教程最后一篇——官方链接、社区、推荐阅读、收尾 FAQ。
