# 1. Hermes 是什么？

::: info 本章你将学到
- Hermes 是什么、解决了什么"已有 AI 工具解决不了"的问题
- 它和 ChatGPT、Claude Code、Codex、OpenClaw 的关键差异
- 它能用在哪些真实场景
- 它**不适合**做哪些事，避免预期错位
- 谁在维护、能用多久
:::

## 1.1 一句话定位

**Hermes Agent** 是 [Nous Research](https://nousresearch.com) 推出的**自我进化（self-improving）开源 AI Agent 框架**——你装上跑一段时间，它**自己**会从过往任务里总结经验、写成 skill 沉淀下来，下一次遇到同类任务就更熟练。

官方 tagline 是一句很直白的话：

> **"The agent that grows with you"** —— 那个和你一起成长的 agent

它**不是**一个聊天机器人，**不是**一个 IDE 插件，**不是**一个工作流编排器。它是一个**长跑型 AI agent 平台**，核心是把"用 LLM 完成任务"这件事**做到能自己学习和进化**。

> **关键词**：自我进化（Self-Improving）· 多后端（Multi-Backend）· 跨会话记忆（Persistent Memory）· 训练数据可导出（Trajectory）· Python 原生

## 1.2 它和 ChatGPT / Claude Code / Codex / OpenClaw 哪里不一样

新手最容易把这五类工具混成一锅粥。一张表分清：

| 维度 | ChatGPT | Claude Code | Codex | OpenClaw | **Hermes** |
|---|---|---|---|---|---|
| **类别** | 聊天 | 编程助手 | 编程助手 | 个人 AI 助手 | **自进化 AI Agent** |
| **跑在哪** | OpenAI 云 | 终端 / IDE | 终端 | 本地常驻 | **本地 / Docker / SSH / 云沙箱（7 选 1）** |
| **语言栈** | — | TypeScript | TypeScript | Node.js | **Python (uv)** |
| **杀手特性** | 通用问答 | IDE 集成深 | 终端原生 | 50+ IM channel | **用得越久越懂你 + 自动产 skill** |
| **记忆** | 单会话 | CLAUDE.md | AGENTS.md | memory + skills | **Honcho 用户建模 + FTS5 搜索 + 自动 skill** |
| **数据所有权** | OpenAI 服务器 | 本地 + API | 本地 + API | 完全本地 | **完全本地（含云沙箱也是你的账号）** |
| **训练数据导出** | ❌ | ❌ | ❌ | ❌ | ✅ **trajectory 批量导出** |

::: tip 三句话理解差异
- **ChatGPT** = 一个聪明的网友，每次见面都把你当陌生人
- **Claude Code / Codex** = 一个能直接改代码的远程同事
- **OpenClaw** = 住在你飞书/IM 里的私人秘书，多人协作
- **Hermes** = 一个会读自己日记的研究助理，**今天的它比昨天更懂你**
:::

## 1.3 它最大的卖点：自我进化

这是 Hermes 区别于其他 agent 的核心特性，值得单独说。

### 怎么个进化法

你给它一个任务（比如"帮我整理这个 GitHub 仓库的 issue，按优先级排"）。Hermes 完成这个任务可能要调 5-15 次工具：拉仓库、读 issue、查上下文、归类、排序、输出。

任务完成后，**Hermes 自动**：

1. 复盘整个过程：哪几步关键、哪几步绕路、有没有踩坑
2. 把经验提炼成一份 markdown 文件（一个 skill）
3. 存到 `~/.hermes/skills/`，下次遇到类似任务直接调用

下次你说"再帮我整理 X 仓库的 issue"——它**直接看自己写的 skill**，**不再绕路**，速度和质量都提升。

::: tip 这意味着什么
**用得越久越聪明**——这是其他 AI 工具做不到的。
而且生成的 skill 符合 [agentskills.io](https://agentskills.io) 开放标准，**可以分享给别人 / 复用别人写的**。
:::

### 真实演化案例

来自社区一位用户实测：装 Hermes 一周后，它自己生成了 12 个 skill，比如：
- `summarize-arxiv-paper.md` —— 8 次后总结的"读论文给摘要"流程
- `debug-pytest-failure.md` —— 第三次 debug pytest 失败时沉淀的
- `rewrite-for-xiaohongshu.md` —— 你让它改过几次小红书风格后自创的

这些 skill **完全是你的工作流模式**，别人的 Hermes 一开始没有，但你能把这些 skill 发到 agentskills.io 让别人复用。

## 1.4 它能做什么（真实场景）

### 个人技术工作流
```
帮我把 ai-learning-docs 仓库这周的 commit 整理成 changelog
监控 arxiv cs.AI 分类，每周给我精选 5 篇推送
我电脑关机时，凌晨 3 点用 SSH 后端跑那个备份脚本
```

### 跨平台对话
```
（在 Telegram 起话）老婆生日想买礼物，预算 1500，她喜欢手作
（出门到了公司，切到 Signal 续）那个手作博主你查到几个备选？
（回家用 CLI 收尾）选第二个 OK，帮我下单。
```

### 信息深度处理
```
读完这本 800 页的 PDF，给我提取所有"看似无关但作者反复提到"的概念
分析这个 git 仓库一年的 PR 数据，告诉我谁是隐藏的高产者
```

### 训练数据生成（开发者向）
```
为我的微调任务生成 5000 条 "工具调用 → 推理 → 结果" 的训练样本
压缩这些 trajectory 到 50K tokens 以内方便微调
```

### 多 agent 并行调研
```
开 5 个 subagent 同时调研这 5 个 LLM 公司的最新发布，
一小时后汇总成对比表给我
```

### 写代码（与编程助手协作）
Hermes **不是专门的编程助手**，但内置 40+ 工具能干一般的代码任务。复杂代码场景建议它去调 Claude Code / Codex。详见 [33. 联动其他工具](/hermes/cases/with-other-tools)。

## 1.5 你能在哪里跟它对话

Hermes 的 channel 数比 OpenClaw 少（一开始定位就更专一），但覆盖技术型用户的核心 IM：

| 端 | 支持 |
|---|---|
| **命令行 CLI** | ✅ 主战场，功能最全 |
| **Telegram** | ✅ |
| **Discord** | ✅ |
| **Slack** | ✅ |
| **WhatsApp** | ✅ |
| **Signal** | ✅ |
| **Matrix** | ✅ |
| **Email** | ✅（通过 gateway） |
| 飞书 / 钉钉 / 企微 / QQ / 微信 | ❌ **暂不直接支持**，国内用户看 [24 章](/hermes/china/channels) 的桥接方案 |

::: warning 国内用户预警
Hermes 原生不支持飞书 / 钉钉 / 企微 / 微信 / QQ 这些国内 IM。
如果你严重依赖国内 IM 通信 → 选 [OpenClaw](/openclaw/) 更合适。
如果你能接受用 CLI / Telegram / Email 当主入口 → Hermes 完全够。
:::

## 1.6 适用场景

**最适合用 Hermes 的人**
- 开发者 / 研究员 / 技术深度玩家
- 想要"用得越久越懂自己"的长期助手
- 需要把任务跑在多种环境（本地 + 云沙箱）
- 关心数据隐私 / 喜欢 self-hosted
- 想给微调模型造训练数据
- 习惯命令行交互

**不太适合的场景**
- ❌ **要在飞书 / 钉钉 / 微信里给团队用** → 看 OpenClaw
- ❌ **要 IDE 里边写代码边问 AI** → 看 Claude Code / Codex
- ❌ **零编程基础、只想点点点** → Hermes 命令行门槛偏高
- ❌ **要快速一次性问答** → 直接用 ChatGPT 网页更省事

## 1.7 安全 / 关键限制

::: warning 安装前必读
1. **不支持 Windows 原生**——必须用 WSL2（Windows Subsystem for Linux）
2. **演进速度快**——从 v0.1.0 到 v0.8.0 两个月，API 在小版本间可能不兼容
3. **40+ 内置工具有权限**——包括 shell 执行、文件读写、浏览器自动化
4. **trajectory 数据可能含敏感信息**——导出训练数据时记得脱敏
5. **生产环境建议跑沙箱后端**（Modal / Daytona / Vercel Sandbox），不要直接在主力机跑高权限工具
:::

Hermes 本身和 OpenClaw 一样默认对**敏感操作要确认**，但社区 skill 和 MCP server **不是官方审核**，装前必须看一眼源码。详见 [15. 安全清单](/hermes/ops/security-checklist)。

## 1.8 它由谁维护、能用多久

- **作者 / 公司**：[Nous Research](https://nousresearch.com) ——以训练开源 LLM（Hermes 系列模型）出名的研究机构，技术口碑非常硬
- **首发时间**：2026 年 2 月
- **协议**：MIT License（最宽松，商用零顾虑）
- **GitHub**：[github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
- **社区**：6 万+ Star（截至 2026 年 4 月）+ MiniMax 战略合作
- **更新节奏**：极快（两个月 v0.1 → v0.8，平均每周一个版本）

::: tip 你应该担心它"消失"吗？
- ✅ Nous Research 是行业有名的开源 AI 研究组织，**做开源生态是它的核心业务**
- ✅ MIT 协议——就算公司倒了，代码永远在
- ✅ 已经有 MiniMax 等大厂战略合作
- ⚠️ 演进太快，**大版本可能不兼容**——建议小版本之间升级，遇大版本看 release notes

短期看：**放心投入学习**。
:::

---

## 看完这一章你应该知道

✅ Hermes 是会自我进化的开源 AI Agent，"用得越久越聪明"
✅ 和 Claude Code / Codex（IDE 编程）、OpenClaw（多 IM 协作）定位完全不同
✅ Python 写的、不支持原生 Windows（要 WSL2）
✅ 6 万 + Star，MIT 协议，Nous Research 维护
✅ 国内 IM（飞书/钉钉/微信）暂不支持，是它的短板

---

**下一步**：[2. 核心概念图解 →](/hermes/intro/concepts)

搞懂 Agent Loop / Skills / Tools / Backend / Gateway / Memory 这六个词——这是后续 39 章的基础词汇。
