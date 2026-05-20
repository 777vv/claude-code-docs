# 40. 资源链接 & FAQ

::: info 本章你将得到
- Hermes 官方 / 社区资源完整索引
- 推荐阅读 / 视频 / 课程
- 全教程通览 FAQ
- 学完之后下一步建议
:::

## 40.1 官方资源

| 资源 | 链接 |
|---|---|
| **官网** | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com) |
| **GitHub 主仓库** | [github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) |
| **官方文档** | [hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs) |
| **Nous Portal** | [hermes-agent.nousresearch.com/portal](https://hermes-agent.nousresearch.com/portal) |
| **agentskills.io（skill 市场）** | [agentskills.io](https://agentskills.io) |
| **Issue Tracker** | [github.com/NousResearch/hermes-agent/issues](https://github.com/NousResearch/hermes-agent/issues) |
| **Discord 社区** | discord.gg/nous-research |
| **X / Twitter** | [@NousResearch](https://x.com/NousResearch) |

## 40.2 相关项目

| 项目 | 链接 |
|---|---|
| **Honcho（用户建模）** | [honcho.dev](https://honcho.dev) / [github.com/plastic-labs/honcho](https://github.com/plastic-labs/honcho) |
| **uv（Python 包管理）** | [github.com/astral-sh/uv](https://github.com/astral-sh/uv) |
| **Browser Use** | [github.com/browser-use/browser-use](https://github.com/browser-use/browser-use) |
| **MCP 协议** | [modelcontextprotocol.io](https://modelcontextprotocol.io) |

## 40.3 中文社区资源

| 资源 | 链接 | 说明 |
|---|---|---|
| **Hermes Agent 中文社区** | [hermesagent.org.cn](https://hermesagent.org.cn) | 国内最活跃 |
| **Hermes Agent 中文文档** | [hermes.xaapi.ai](https://hermes.xaapi.ai) | 翻译版 |
| **菜鸟教程 Hermes** | [runoob.com/ai-agent/hermes-agent.html](https://www.runoob.com/ai-agent/hermes-agent.html) | 基础入门 |
| **MiniMax + Hermes 集成** | [platform.minimaxi.com/docs/token-plan/hermes-agent](https://platform.minimaxi.com/docs/token-plan/hermes-agent) | 官方合作文档 |
| **本站学习交流群** | 见首页二维码 | Hermes + OpenClaw + Claude Code + Codex 综合 |

## 40.4 推荐阅读

### 入门概念
- 📖 [Practical Guide for Developers (DEV)](https://dev.to/laracopilot/hermes-agent-guide)
- 📖 [Hermes Agent: What It Is and How to Set It Up (DataCamp)](https://www.datacamp.com/tutorial/hermes-agent)
- 📖 [搬瓦工 VPS 部署 Hermes 教程](https://www.bandwagonhost.net/16480.html)

### 深度技术
- 📖 [Nous Research Blog](https://nousresearch.com/blog) - 官方技术博客
- 📖 [agentskills.io 设计文档](https://agentskills.io/spec)
- 📖 [Honcho User Modeling Whitepaper](https://honcho.dev/whitepaper)

### 相关技术
- 📖 [Model Context Protocol 官方文档](https://modelcontextprotocol.io)
- 📖 [uv 官方文档](https://docs.astral.sh/uv/)
- 📖 [Browser Use 文档](https://docs.browser-use.com)

## 40.5 视频教程

- 📺 Nous Research 官方 YouTube
- 📺 Bilibili "Hermes Agent 中文教程" 系列搜索
- 📺 "How to Build Self-Improving Agents with Hermes" 系列

## 40.6 全套教程 FAQ

### Q1：我是小白，从哪一章开始？
→ 严格按顺序 1 → 6 章，打通"概念 + 装好"。然后按兴趣跳到任意实战案例。

### Q2：跑完本教程能干啥？
你将能：
- 独立部署 Hermes
- 配置任意国内外 LLM
- 接入 Telegram / Discord / Email
- 玩自我进化 skill 系统
- 多 backend 调度
- 跑 trajectory 生成训练数据
- 用 subagents 并行
- 从 OpenClaw 平滑迁移
- 部署到 Docker / 云 / NAS / 树莓派

### Q3：我没钱买 API，能跑完整教程吗？
大部分能。完全免费方案：
- 用 Ollama 跑本地模型
- CLI 替代付费 IM
- local backend 不用云服务

缺点：本地模型质量比 API 弱一档。

### Q4：教程会持续更新吗？
会。Hermes 演进极快（每周一版），本站会跟进。
关注：
- 本站 GitHub
- 学习交流群

### Q5：Hermes vs OpenClaw 怎么选？
- **重 IM 协作 / 国内 IM** → OpenClaw
- **研究 / 技术深度 / self-improving** → Hermes
- **最佳**：两者并行（详见 [33 章](/hermes/cases/with-other-tools)）

### Q6：Hermes vs Claude Code / Codex 怎么选？
- **改代码** → Claude Code / Codex
- **跑 agent 任务** → Hermes
- 不冲突，可同时用

### Q7：本教程没讲的高级特性？
**进阶玩家可探索**：
- Hermes 内核源码（理解 ReAct loop 实现）
- 自定义 backend（写你自己的执行环境）
- Subagent 高级编排（DAG 任务依赖）
- Honcho 模型自定义训练
- 多 Hermes 实例联邦
- Trajectory 高级处理（数据清洗 / 增强）

直接看官方文档 + 源码。

### Q8：哪里能找人帮我？
按优先级：
1. **本站交流群** → 首页二维码
2. **Hermes Agent 中文社区** [hermesagent.org.cn](https://hermesagent.org.cn)
3. **Discord 官方** discord.gg/nous-research
4. **GitHub Issues**（提 bug / 功能请求）

### Q9：商用 Hermes 要授权吗？
→ MIT 协议，**商用免费**。但：
- 不能去 MIT 协议头
- agentskills.io 上 skill 各自的 license 要看
- 微调出来的模型如果训练数据有版权问题需要注意

### Q10：Hermes 会被淘汰吗？
短期不会。理由：
- 6 万+ GitHub star（持续增长）
- Nous Research 持续投入（这是他们核心产品）
- MIT 协议——就算公司不存在了代码还在
- 有 MiniMax 等大厂战略合作
- agentskills.io 生态在长

长期：AI agent 框架迭代快，但 Hermes 的**核心概念**（Agent / Skills / Backend / Memory）大概率会被继承。**学到的概念是迁移性的**。

### Q11：投入学 Hermes 时间值不值？
取决于你的场景：
- 一次性问 AI → ChatGPT 更值
- 长跑任务 / 自动化 → Hermes 一周入门，长期省时
- 研究 / 微调 → Hermes 是当前最好的选择之一

按"投入 vs 节省时间"算，**重度用户 1 个月回本**。

## 40.7 学完了，下一步建议

恭喜你看完了 Hermes 全部 40 章！

### 立刻可以做
1. **真的搭起一个实战案例**（推荐从 [25. 自进化日记](/hermes/cases/self-evolve) 开始）
2. **进交流群分享你的 setup**
3. **写一个自己的 skill 发到 agentskills.io**

### 中期
4. **学一下本站其他工具**：
   - [Claude Code](/claude-code/guide/intro) - 改代码神器
   - [Codex](/codex/) - OpenAI 终端 AI
   - [OpenClaw](/openclaw/) - 多 IM 个人助手
5. **看相关 agent 框架**对比：
   - AutoGen / LangGraph / CrewAI / Smol Agents

### 长期
6. **学 MCP 协议**做工具，给所有 AI 应用复用
7. **微调你自己的 agent 模型**（用 Hermes trajectory + Unsloth/Axolotl）
8. **建你自己的 AI 工作流生态**——Hermes + OpenClaw + Codex + Claude Code 串起来

## 40.8 致谢

- **Nous Research** - Hermes 的开发者
- **Plastic Labs** - Honcho 用户建模库
- **Astral** - uv 包管理
- **Browser Use** team - 浏览器自动化
- **MiniMax** - 战略合作
- **Hermes Agent 中文社区** - 国内推广
- **本站读者** - 你的反馈让本教程持续改进

## 40.9 反馈

教程有错 / 过时 / 不清楚的地方？
- 本站 GitHub 提 issue
- 进群直说

每个反馈都会被认真看。

## 40.10 寄语

Hermes 是一个**会和你一起成长**的工具。
学得越多，它越懂你。用得越久，回报越大。

不要追求一次掌握所有。
今天装上，跑跑看，让它自己学一段时间。
一个月后回头看 `~/.hermes/skills/`，你会被惊艳。

---

## 🎉 全部 40 章完成

你已经从"听说 Hermes"走到了"能独立部署 + 玩出花样"。
现在去搭点真东西，让 AI 真的和你一起成长。

**祝你玩得开心 🧬**

---

← [返回 Hermes 首页](/hermes/) | [回到本站首页](/)
