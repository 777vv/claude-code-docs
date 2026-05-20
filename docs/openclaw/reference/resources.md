# 40. 资源链接 & FAQ

::: info 本章你将得到
- 官方资源完整索引
- 优质中文 / 英文社区
- 推荐阅读 / 视频 / 课程
- 全教程通览 FAQ
- 学完之后下一步建议
:::

## 40.1 官方资源

| 资源 | 链接 |
|---|---|
| **官网** | [openclaw.ai](https://openclaw.ai) |
| **官方文档** | [docs.openclaw.ai](https://docs.openclaw.ai) |
| **GitHub 主仓库** | [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw) |
| **ClawHub（skill 市场）** | [clawhub.ai](https://clawhub.ai) |
| **NVIDIA NemoClaw** | [nvidia.com/en-us/ai/nemoclaw](https://www.nvidia.com/en-us/ai/nemoclaw/) |
| **X / Twitter 官方账号** | [@openclaw](https://x.com/openclaw) |
| **作者博客** | [steipete.me](https://steipete.me) |
| **Discord 官方社区** | discord.gg/openclaw |
| **Issue Tracker** | [github.com/openclaw/openclaw/issues](https://github.com/openclaw/openclaw/issues) |

## 40.2 中文社区资源

| 资源 | 链接 | 说明 |
|---|---|---|
| **OpenClaw 中文社区** | [clawd.org.cn](https://clawd.org.cn) | 国内最活跃 |
| **OpenClaw 汉化版** | [openclaw.qt.cool](https://openclaw.qt.cool) | 中文 UI + Dashboard |
| **中文文档站** | [github.com/liyupi/openclaw-guide](https://github.com/liyupi/openclaw-guide) | 350+ 篇文档翻译 |
| **LitClaw**（轻量替代） | [claw.liliai.cn](https://claw.liliai.cn) | 基于 OpenClaw 内核的国内分发 |
| **本站学习交流群** | 见首页二维码 | OpenClaw + Claude Code + Codex 综合 |

## 40.3 推荐阅读

### 概念入门
- 📖 [OpenClaw Architecture, Explained](https://ppaolo.substack.com/p/openclaw-system-architecture-overview) - 架构深度分析
- 📖 [How OpenClaw Works: Understanding AI Agents](https://bibek-poudel.medium.com/how-openclaw-works-understanding-ai-agents-through-a-real-architecture-5d59cc7a4764) - Medium 详解
- 📖 [What Is OpenClaw? Open-Source AI Assistant For 2026](https://www.digitalocean.com/resources/articles/what-is-openclaw) - DigitalOcean 综述

### 实战进阶
- 📖 [OpenClaw Zero to Hero - for People Who Hate Terminal](https://pub.towardsai.net/openclaw-wont-bite-a-zero-to-hero-guide-for-people-who-hate-terminal-14dd1ae6d1c2) - Towards AI
- 📖 [OpenClaw AI Agent Framework: Setup Guide](https://dextralabs.com/blog/openclaw-ai-agent-frameworks/) - DextralLabs
- 📖 [Practical Guide for Developers](https://dev.to/laracopilot/what-is-openclaw-ai-in-2026-a-practical-guide-for-developers-25hj) - DEV Community

### 安全主题
- 📖 [OpenClaw Security Best Practices](https://docs.openclaw.ai/security)
- 📖 [Prompt Injection: A Critical AI Vulnerability](https://owasp.org/llm-top10/) - OWASP LLM Top 10
- 📖 [NVIDIA NemoClaw 白皮书](https://www.nvidia.com/nemoclaw/security-whitepaper)

### 相关技术
- 📖 [Model Context Protocol 官方文档](https://modelcontextprotocol.io)
- 📖 [Anthropic Claude 模型卡](https://www.anthropic.com/claude)
- 📖 [DeepSeek 官方文档](https://platform.deepseek.com/docs)

## 40.4 视频教程

- 📺 OpenClaw 官方 YouTube 频道
- 📺 [Bilibili OpenClaw 中文教程合集](https://search.bilibili.com/all?keyword=OpenClaw)
- 📺 油管 "How to Build Your Own AI Agent with OpenClaw" 系列

## 40.5 全套 OpenClaw 教程 FAQ

### Q1：我是完全的小白，从哪一章开始？
→ 严格按顺序 1 → 6 章，把"概念 + 装好"打通。然后按你的兴趣跳到任意实战案例。

### Q2：跑过本教程后我能干嘛？
你将能：
- 独立部署 OpenClaw
- 配置任意国内外 LLM
- 接入飞书 / Telegram 等 IM
- 写自己的 skill
- 多 agent 协作
- 部署到云 / Docker
- 玩转 10 个实战场景

### Q3：教程里命令复制粘贴报错怎么办？
→ 大概率你前置依赖没装好。回查 4-6 章是否每一步通过。或看 [38. 故障排除](/openclaw/reference/troubleshoot)。

### Q4：我没钱买 API，能跑完整教程吗？
→ 大部分章节能。完全免费方案：
- 用 Ollama 跑本地模型（[7.6 节](/openclaw/setup/api-key#_7-6-方案-d-本地跑-ollama-完全免费)）
- WebChat 替代付费 IM
- 自己玩，不接外部用户
缺点：本地模型质量比 API 弱一档，实战案例效果会差点。

### Q5：教程会持续更新吗？
→ 会。OpenClaw 在持续演进，本站会跟进。关注：
- 本站 GitHub（issue/star 收新章节通知）
- 加学习交流群

### Q6：和 Claude Code / Codex 比 OpenClaw 强在哪里？
→ 不是替代关系。三者职能不同（见 [1. OpenClaw 是什么](/openclaw/intro/what-is)）：
- **Claude Code/Codex**：纯编程，IDE/终端用
- **OpenClaw**：日常自动化，IM 用，编程是它众多能力之一

最佳组合：**Claude Code/Codex 写代码，OpenClaw 跑后台 / 接 IM / 调度它们**（[21 章](/openclaw/advanced/with-coding-tools)）。

### Q7：本教程没讲到的高级特性？
**进阶玩家可探索**：
- 自定义 LLM provider 实现
- Skill 流式输出（streaming response）
- Canvas 复杂 UI 构建
- 多 Gateway 联邦（geo-distributed）
- 企业级 SSO / SAML 集成
- Federated Learning 用本地数据微调

这些建议直接看官方文档 + 源码。

### Q8：在哪里能找人帮我？
→ 按优先级：
1. **本站交流群**（中文，新手友好）→ 首页二维码
2. **OpenClaw 中文社区** clawd.org.cn
3. **Discord 官方** discord.gg/openclaw（英文为主）
4. **GitHub Issues**（提 bug / 功能请求）

### Q9：商用 OpenClaw 要授权吗？
→ MIT 协议，**商用免费**。但：
- 不能去掉 MIT 协议头
- ClawHub 上有些 skill 是其他协议（用前看）
- NVIDIA NemoClaw 商用条款单独看（生产用建议联系 NVIDIA）

### Q10：OpenClaw 会被淘汰吗？
→ 短期不会。理由：
- 21 万 + GitHub star
- 真正的开源（MIT）
- NVIDIA 投入做 NemoClaw 证明工业认可
- 创始人持续投入（不是 demo 后跑路）

长期看，AI 工具迭代快，但即使有"更好的下一代"，OpenClaw 的概念（Gateway / Agent / Skill / Channel）大概率会被继承。**学到的概念是迁移性的**。

## 40.6 学完了，下一步建议

恭喜你看完了 OpenClaw 全部 40 章！

### 立刻可以做：
1. **挑一个实战案例真的搭起来**（推荐从 [25. 资讯晨报](/openclaw/cases/daily-news) 开始）
2. **进交流群分享你的 setup**——看别人怎么玩
3. **写一个自己的 skill 发到 ClawHub**

### 中期：
4. **学一下本站其他工具**：
   - [Claude Code 27 章](/claude-code/guide/intro) - 改代码神器
   - [Codex](/codex/guide/what-is-codex) - OpenAI 的命令行 AI
5. **看一下相关 AI agent 框架**对比：
   - AutoGPT / LangGraph / AutoGen / CrewAI

### 长期：
6. **学 MCP 协议**做工具，给所有 AI 应用用
7. **跟踪前沿**：订阅 arxiv cs.AI（本站案例 28 教你怎么做）
8. **建立自己的 AI 工作流体系**——把 OpenClaw + Codex + Claude Code 串起来

## 40.7 致谢

- **Peter Steinberger** - OpenClaw 的发起人和主要维护者
- **OpenClaw 中文社区** - 提供大量中文资料
- **liyupi/openclaw-guide** - 翻译了大量官方文档
- **NVIDIA** - 推 NemoClaw 让企业能放心用
- **本站读者** - 你的阅读和反馈让本教程持续改进

## 40.8 反馈与改进

教程有错 / 过时 / 不清楚的地方？
- 提 issue：[本站 GitHub](https://github.com/777vv/claude-chinese-docs/issues)
- 进群直说（本站交流群）

每个反馈都会被认真看。

---

## 🎉 全部 40 章完成

你已经从"听说 OpenClaw"走到了"能独立部署 + 玩出花样"。
现在去搭点真东西，让 AI 真的帮你干活。

**祝你玩得开心 🦞**

---

← [返回 OpenClaw 首页](/openclaw/) | [回到本站首页](/)
