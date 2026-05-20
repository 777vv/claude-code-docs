# 3. 能做什么 / 不能做什么

::: info 本章你将学到
- Hermes 的 6 大类擅长场景 + 真实例子
- 4 类它不擅长 / 不适合的场景
- 一个判断"我的需求是不是适合 Hermes"的小流程
- 5 种典型用户画像对照
:::

::: warning 为什么这一章很重要
Hermes 不是"装上就有 JARVIS"——它是个**研究型 / 技术型工具**。
预期错位是新用户翻车最常见的原因。这一章帮你提前校准。
:::

## 3.1 它擅长的 6 大类事

### ① 长跑型任务（看着 agent 自己进化）

Hermes 最大的卖点。**你用得越久，它越懂你**。

```
第 1 周：你说"读这篇 arxiv 论文给摘要"
→ Hermes 笨拙地试了 8 次工具调用，勉强完成

第 2 周：你又说同样的事
→ Hermes 看了自己上次写的 skill，3 步搞定

第 1 个月：你说"读这本 800 页的书给我提取核心论点"
→ Hermes 已经会自己用"先看目录-再扫节标题-再深读关键章"的方法
```

::: tip 这是 ChatGPT / Claude Code 做不到的
它们每次和你对话都是"陌生人"。Hermes 是"积累中的同事"。
:::

### ② 多 backend 灵活调度

不只是本机跑——把任务派去合适的地方：

```
"分析这个 10GB 的数据集" → backend: modal (云算力)
"重构本项目代码" → backend: local (本机文件)
"夜里 3 点跑备份" → backend: ssh (远程，我电脑可以关)
"调研 5 个网站对比" → 派 5 个 subagent，每个独立沙箱
```

### ③ 深度信息加工

Hermes 擅长"啃硬骨头"——长文档、复杂代码库、多源资料：

```
"读这 50 篇相关论文，找出'看似无关但作者反复提到'的概念"

"分析这个开源项目一年的所有 PR，告诉我:
 - 隐藏的高产作者（commit 量小但合并率高）
 - 最常被推翻的设计决策
 - 哪个模块改动最频繁"

"对比这 3 本投资学经典作者的核心观点差异，
 找出共同的盲点"
```

### ④ 训练数据生成（开发者向）

Hermes 内置 **trajectory generation**——把任务执行过程导出成训练样本：

```
"为我的微调模型生成 5000 条 trajectory:
 - 用户提问 → 推理 → 工具调用 → 结果 → 最终回复
 - 输出为 JSONL 格式，符合 SFT 格式标准"
```

跑完得到一份能直接用来微调 LLM 的数据集。**只有 Hermes 内置这能力**。

### ⑤ 跨平台对话连续

```
（早上 Telegram）今天有个紧急 bug，先帮我查
（中午 Signal）那个 bug 的根因找到了吗？
（下午 CLI）OK 那把修复方案落地，提个 PR
```

不同 channel 切换，Hermes **同一个记忆**。这点和 OpenClaw 类似，但 Hermes 的 Honcho 记忆更深入。

### ⑥ 并行调研 / 多 agent

```
"调研这 10 家 AI 创业公司的:
 - 创始人背景
 - 融资历史
 - 核心产品
 - 最近 3 个月动态"

→ Hermes 派 10 个 subagent 并行调研
→ 30 分钟后汇总成一份 markdown 报告
→ 单个 agent 串行做要 5 小时
```

## 3.2 它不擅长 / 不适合的事

### ❌ 在飞书 / 钉钉 / 企业微信 / 微信 / QQ 里用

Hermes 原生**不支持国内 IM**。社区有桥接方案但不稳。

**国内 IM 重度用户** → 用 [OpenClaw](/openclaw/) 更顺。

### ❌ IDE 内联 AI 编程

```
你在 VS Code 写代码 → 想要 inline 补全 / 内联改代码
```

这不是 Hermes 的强项。建议：
- 代码补全：用 [Claude Code](/claude-code/guide/intro) / [Codex](/codex/) / Copilot / Cursor
- Hermes 适合"我描述一个任务，你去搞定"，不适合"我打字时辅助我"

### ❌ 零编程基础

Hermes 要求至少：
- 能开终端
- 看得懂报错并搜索
- 知道 Python 大概是什么
- 能编辑 markdown / yaml

如果上面任何一条不会，建议先用 ChatGPT 网页版熟悉 AI，再来碰 Hermes。

### ❌ 一次性问答

```
"帮我翻译这段话"
"帮我想 3 个产品名"
"周报怎么写"
```

直接 ChatGPT / Claude 网页更省事。Hermes 是**长跑助手**，不是临时答疑。

## 3.3 它的硬性限制

| 限制 | 影响 |
|---|---|
| **Windows 必须 WSL2** | 原生 Windows 用户要装 WSL（额外一道门槛） |
| **Python 3.11+** | 老 Linux 发行版默认 Python 可能是 3.8/3.9，要升 |
| **演进速度极快** | v0.1 → v0.8 两个月，小版本可能不兼容 |
| **国内 IM 不原生支持** | 飞书/钉钉/微信玩家配 OpenClaw 更合适 |
| **某些 backend 要订阅** | Modal / Daytona / Vercel Sandbox 有自己的付费模式 |
| **40+ 工具中部分高危** | shell / browser_use / file_write 默认要 confirm |

## 3.4 决策流程：我适合 Hermes 吗？

```
你有 Python 基础或能接受学一点吗？
├─ 完全不会 → 先 ChatGPT 入门，半年后回来
└─ 能接受
   ├─ 你重度依赖飞书 / 钉钉 / 微信？
   │   ├─ 是 → 选 OpenClaw 更顺
   │   └─ 否
   │      ├─ 你的主要场景是 IDE 内写代码？
   │      │   ├─ 是 → 选 Claude Code / Codex / Cursor
   │      │   └─ 否
   │      │      ├─ 你想要"用得越久越懂你"的助手？
   │      │      │   ├─ 是 → Hermes 强项 ✅
   │      │      │   └─ 否
   │      │      │      ├─ 你需要训练数据 / 多 backend / 研究向？
   │      │      │      │   ├─ 是 → Hermes 唯一选项 ✅
   │      │      │      │   └─ 否 → 可以选 OpenClaw 也行
```

## 3.5 5 种典型 Hermes 用户画像

### 画像 A：独立研究者 / PhD 学生
- 场景：追前沿论文、生成训练数据、跑多 backend 实验
- 装：trajectory + arxiv skill + modal backend
- 投入：高（每周用 15+ 小时）
- 回报：自己的研究助手，越用越懂你的方向

### 画像 B：技术博主 / 教程作者
- 场景：信息收集 + 多渠道发布 + 数据分析
- 装：web_search + browser_use + custom 发布 skill
- 投入：中（每天 1-2 小时）
- 回报：自动化日常重复劳动

### 画像 C：高级开发者 / Indie Hacker
- 场景：多项目监控、远程触发 SSH 任务、夜跑 cron
- 装：git + github + shell + ssh backend
- 投入：中
- 回报：电脑关机也能干活

### 画像 D：AI 工程师 / 微调爱好者
- 场景：构造 SFT 数据、agent 评估、prompt 调试
- 装：trajectory + 自写评估 skill + Honcho
- 投入：高
- 回报：训练数据流水线 + 工程化 prompt 测试

### 画像 E：技术决策者 / 投资分析
- 场景：并行调研、多源对比、深度报告
- 装：subagents + web + browser_use
- 投入：中
- 回报：从"我要看 10 个公司"到"汇总报告"30 分钟

## 3.6 常见误解 FAQ

**Q：Hermes 能完全替代 ChatGPT 吗？**
A：日常聊天问答 ChatGPT 网页更快。Hermes 是长跑任务工具。

**Q：Hermes 能替代 OpenClaw 吗？**
A：定位不同。重 IM 协作选 OpenClaw，研究/技术深度选 Hermes。
**而且**：可以同时用——Hermes 跑技术任务、OpenClaw 接团队 IM。

**Q：Hermes 写代码比 Claude Code 强吗？**
A：不强。Hermes 是"通用 agent"，编程是它众多能力之一。专门写代码 Claude Code / Codex 更强。但 Hermes 可以**调用** Claude Code / Codex 完成代码任务（详见 [33 章](/hermes/cases/with-other-tools)）。

**Q：装了 Hermes 要花多少钱？**
A：框架免费（MIT）。成本主要是：
- LLM API（一般 $5-50/月，看用量）
- 自托管：电费可忽略 / 云服务器 $5+/月
- 可选 backend 订阅（Modal / Daytona 免费额度通常够）

**Q：自我进化是不是营销话术？**
A：不是。看 `~/.hermes/skills/` 目录就知道——你用一周后里面真的会出现你没手写过的 skill。但**效果**取决于你用的多专、任务多重复——做完全随机的事，自我进化效果差。

**Q：能让 Hermes 自己上网注册账号吗？**
A：技术上能（browser_use skill），但**强烈不建议**。账号注册要手机验证 / 反爬，Hermes 不擅长且风险大。

---

## 看完这一章你应该知道

✅ Hermes 擅长：长跑学习 / 多 backend / 深度信息 / trajectory / 跨平台 / 并行
✅ Hermes 不擅长：国内 IM / IDE 编程 / 零基础 / 临时问答
✅ Windows 用户必须 WSL2
✅ 5 种典型用户画像帮你自检是否适合
✅ 决策流程图给你确切答案

---

**下一步**：[4. 系统要求与安全提醒 →](/hermes/intro/requirements)

确认适合 Hermes 了？下一章看你电脑能不能跑、跑的时候有哪些坑要避。
