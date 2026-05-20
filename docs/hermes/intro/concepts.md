# 2. 核心概念图解

::: info 本章你将学到
- Hermes 的 6 大核心概念：Agent Loop / Skills / Tools / Backend / Gateway / Memory
- 它们怎么协同工作（一个任务从输入到完成都经历了什么）
- Hermes 的概念和 OpenClaw 哪里相似、哪里不同
:::

::: tip 为什么先讲概念
**搞懂这几个词，后面 38 章顺畅 10 倍**。Hermes 概念比 OpenClaw 更"研究型"，但本质都简单——这一章用图和大白话讲清。
:::

## 2.1 全景图：一张图先看懂

```
┌──────────────────────────────────────────────────────────┐
│                       你（用户）                          │
│         ↑↓ CLI / Telegram / Discord / Email             │
└──────────────────────────────────────────────────────────┘
              ↑↓
        ┌─────────────────┐
        │    Gateway      │   ← 单一后台进程，统一收发
        │  (hermes gateway)│
        └────────┬────────┘
                 ↓ 把消息发给：
        ┌─────────────────┐
        │   Agent Loop    │   ← Hermes 的"思考-行动"循环
        │  (ReAct cycle)  │
        └────────┬────────┘
            ↓ 每一轮可能：
   ┌────────┴────────┬───────────┬─────────────┐
   ↓                 ↓           ↓             ↓
┌──────┐         ┌──────┐   ┌──────────┐  ┌──────────┐
│ LLM  │         │ Tool │   │ Skill 检 │  │ Subagent │
│ 调用 │         │ 调用 │   │ 索 / 注入│  │ 派生     │
└──────┘         └──────┘   └──────────┘  └──────────┘
                     ↓
            实际跑在哪里？
   ┌────────┬───────┬─────┬───────┬───────┬─────────┬─────────┐
   ↓        ↓       ↓     ↓       ↓       ↓         ↓
 Local   Docker   SSH   Modal Daytona Singular  Vercel
        ↑↑↑ 这些就是 7 种 Terminal Backend ↑↑↑
                     ↓ 任务完成后
              ┌─────────────────┐
              │    Memory       │   ← 三层记忆 + 自动产 skill
              │ (Honcho/FTS5/   │
              │  自动 skill)    │
              └─────────────────┘
```

记住这张图，下面逐个讲解。

## 2.2 Gateway（网关） — 后台总管

**一句话**：Gateway 是一个**永远在后台**的进程，统一管所有消息收发。

### 它和 OpenClaw 的 Gateway 像不像？
**很像**——OpenClaw 和 Hermes 都用 "Gateway = 单一后台进程" 这个架构。

差别只是：
- OpenClaw Gateway 是 Node.js 写的，端口 18789
- Hermes Gateway 是 Python 写的，启动方式 `hermes gateway`

### 启动命令

```bash
hermes gateway              # 启动 gateway 后台进程
hermes gateway --daemon     # 注册成系统服务，开机自启
```

### 你为什么会经常听到它

- 给 IM（Telegram/Discord/Slack...）发消息要先 `hermes gateway`
- 添加新 IM 平台用 `hermes platform add <name>`
- 排查 IM 收不到消息时第一件事是看 Gateway 在不在跑

## 2.3 Agent Loop（智能循环） — 它的"大脑工作方式"

**一句话**：Hermes 用 **ReAct 模式**（Reason + Act 推理+行动循环）思考。

### 一轮 loop 长这样

```
你: 帮我整理一下 ~/Documents 里的所有 PDF，
   按内容分类到子文件夹

Hermes 内部：
┌─ Loop 1
│   Reason: "我需要先看看 ~/Documents 里有什么 PDF"
│   Act: 调用 ls 工具列文件
│   Result: 找到 47 个 PDF
├─ Loop 2
│   Reason: "我需要看每个 PDF 大概是什么内容"
│   Act: 调用 read-pdf 工具读前 500 字
│   Result: 拿到内容片段
├─ Loop 3
│   Reason: "我可以分成: 论文 / 合同 / 财务 / 杂项 4 类"
│   Act: 调用 mkdir + mv 工具移动文件
│   Result: 完成
└─ 完成: 报告分类结果给你
```

### 关键设计：每轮都有 LLM 决策

不像传统脚本"写好步骤往下跑"，Hermes 每一步**都让 LLM 重新判断"现在该干嘛"**。这让它能：
- 应对意外（一个 PDF 加密了？跳过 + 报告）
- 中途调整（"哦原来还有 .docx，加进来一起整"）
- 自我反思（"上一步效果不好，换个方法试"）

::: tip 这就是 agent 和 chatbot 的本质差别
chatbot：你说一句，它答一句，结束
agent：你说一个目标，它反复"想-做-想-做"直到目标完成
:::

## 2.4 Tools（工具） — 内置 40+ 件

**一句话**：Tool 是 Hermes 出厂自带的 40+ 个"内置技能"，覆盖最常用的操作。

不像 OpenClaw 默认 Agent 是"光杆司令"得装 skill 才能干活，**Hermes 开箱就有 40+ 件工具能用**。

### 主要工具类别

| 类别 | 代表工具 |
|---|---|
| **文件操作** | `read_file` / `write_file` / `list_dir` / `glob` / `grep` |
| **终端** | `shell_exec` / `run_python` |
| **网络** | `web_search` / `fetch_url` / `download` |
| **代码** | `code_search` / `analyze_repo` |
| **浏览器** | `browser_use` （v0.8+ 集成） |
| **图像** | `analyze_image` / `generate_image` |
| **音频** | `transcribe` |
| **数据** | `parse_csv` / `read_pdf` / `read_docx` |
| **Git** | `git_clone` / `git_diff` / `git_log` |

### 工具集（Toolset）

40+ 全开太多 token 会爆，所以 Hermes 用 **Toolset 分组管理**：

```bash
hermes tools                # 进交互式管理界面
```

可以勾选某个 agent 用哪些 toolset。比如：
- 只跑数据分析 → 启用 `data` + `web` 工具集
- 编码场景 → 启用 `code` + `git` + `shell`

详见 [18. 40+ 内置工具一览](/hermes/advanced/tools)。

## 2.5 Skills（技能） — Hermes 的杀手特性

**一句话**：Skill 是 Hermes **自动从过往任务里总结**的 markdown 文件，下次遇到类似任务直接复用。

### Tool vs Skill 的区别

| | Tool | Skill |
|---|---|---|
| 谁写的 | Hermes 内置 | **Hermes 自己写**（或你手写） |
| 是什么 | 一个原子动作（如 `read_file`） | 一组复杂操作的"经验沉淀" |
| 例子 | "读文件" | "怎么读懂一个 React 项目的入口" |

### 一个真实的 skill 文件长这样

```markdown
---
name: summarize-arxiv-paper
description: 给一个 arxiv URL，输出中文摘要 + 5 个关键点
---

# 总结 arxiv 论文

## 步骤
1. 用 fetch_url 拿 PDF
2. 用 read_pdf 提取 abstract / introduction / conclusion 三段
3. 检查作者所属机构（top-tier 机构权重高）
4. 用 LLM 生成 5 个 bullet 关键点

## 已知坑
- v1 vs v2 版本要看 latestSubmission
- 数学公式抽不出来，跳过即可

## 输出格式
{
  title: 中文翻译,
  authors: [...],
  key_points: [5 个],
  reading_time: 估计耗时分钟
}
```

### 自动生成时机

Hermes 在以下情况会**自动**生成 skill：
- 任务调用 ≥ 5 次工具完成
- 你说"这个 X 任务以后会经常做"
- 你直接命令"把刚才那个流程存成 skill"

详见 [16. Skills 自改进系统](/hermes/advanced/skills)。

### agentskills.io 开放标准

Hermes 生成的 skill 符合 [agentskills.io](https://agentskills.io) 标准——意味着：
- 可以分享给别人
- 可以下别人写的 skill 用
- 跨 agent 框架可移植（理论上能跑在其他兼容 agent 上）

这是 Hermes 比 OpenClaw skill **更"标准化"**的地方。

## 2.6 Backend（执行后端） — 任务跑在哪里

**一句话**：同一个 Hermes agent 可以选择**在哪儿跑实际任务**——本机？Docker？远程服务器？云沙箱？

这是 Hermes **最独特的能力**——OpenClaw 没有，Claude Code 没有。

### 7 种 backend

| Backend | 跑在 | 适合 |
|---|---|---|
| **local** | 本机 | 日常默认 |
| **docker** | 容器 | 隔离环境 |
| **ssh** | 远程服务器 | 笔记本关机，服务器继续跑 |
| **modal** | [Modal](https://modal.com) 云函数 | 临时大算力，跑完即销毁 |
| **daytona** | [Daytona](https://daytona.io) 云开发环境 | 标准化开发沙箱 |
| **singularity** | HPC 高性能容器 | 学术 / 科研集群 |
| **vercel-sandbox** | Vercel Sandbox | 临时一次性任务 |

### 切换 backend

```bash
# 本次会话用 docker backend
hermes --backend docker

# 把某个任务派到云上跑
hermes "训练这个模型" --backend modal

# 全局默认改成 ssh
hermes config set backend ssh
```

详见 [35. 7 种 backend 选型](/hermes/deploy/backends)。

## 2.7 Memory（记忆） — Hermes 怎么"记住事"

LLM 是"金鱼脑"——每次调用都不记得之前。Hermes 用**多层记忆**让 agent 跨会话有连续性。

### Hermes 的 5 层记忆

```
┌────────────────────────────────────────────┐
│ 1. Working Memory (当前对话)               │
│    自动维护，无需管                        │
├────────────────────────────────────────────┤
│ 2. Session Memory (FTS5 全文搜索)          │
│    用 SQLite FTS5 索引你的所有历史对话     │
│    任何时候能搜 "上次我们怎么解决 X 问题"  │
├────────────────────────────────────────────┤
│ 3. memory.md (个人长期事实)                │
│    "用户对花生过敏" 这类                   │
├────────────────────────────────────────────┤
│ 4. user.md (用户偏好画像)                  │
│    "用户喜欢简洁回复 / 偏好 TypeScript"     │
├────────────────────────────────────────────┤
│ 5. Honcho (深度用户建模)                   │
│    自动学习沟通风格 / 决策模式 / 知识盲区  │
└────────────────────────────────────────────┘
```

### Honcho 是个什么东西？

[Honcho](https://honcho.dev) 是 Plastic Labs 出的开源用户建模库。把它接到 Hermes 后，agent 会**自动**：
- 分析你的沟通风格（言简意赅？啰嗦？情感型？）
- 推测你的知识背景（资深？新手？某领域专家？）
- 记录你的决策模式（保守？激进？数据驱动？）

**用了一个月后**，Hermes 知道你听哪种解释更顺畅、怎么提问最高效。

详见 [19. Honcho 记忆 + Memory](/hermes/advanced/memory-honcho)。

### Token 压缩

长对话 prompt 会爆 context window。Hermes 用 **双压缩**：
- 老对话用 LLM 总结成摘要
- 配合 Anthropic prompt caching，重复部分不重发

实测一个跑了 100 轮的对话，prompt 实际只有 8K tokens（vs 不压缩的 50K+）。

## 2.8 Subagents（子代理） — 并行多任务

**一句话**：一个 Hermes 可以**派生**多个隔离的子 agent 同时跑不同任务。

### 典型场景

```
你: 调研 GPT-5 / Claude 4.6 / Gemini 3 这 3 个模型的最新发布，
   每个深挖一下能力、定价、benchmark，最后汇总成对比表

Hermes:
  → 派 3 个 subagent 各负责一家
  → 它们隔离运行（独立 context，互不干扰）
  → 一小时后我会汇总结果

Subagent A: 调研 GPT-5 ...
Subagent B: 调研 Claude 4.6 ...
Subagent C: 调研 Gemini 3 ...
   ↓ 各自完成
Hermes 主进程: 拿到 3 份报告，汇总成对比表给你
```

### 关键设计

- 每个 subagent 独立 context（不会互相干扰）
- 可以用不同 model（如调研用 Claude，汇总用 DeepSeek 省钱）
- 主 agent 控制派生 / 取消 / 超时

详见 [21. Subagents + Worktree](/hermes/advanced/subagents)。

## 2.9 串起来：一个任务的完整旅程

你说"调研 3 个开源 LLM 框架，对比写报告"：

```
1. 你 → Telegram bot → Gateway 收到消息
       ↓
2. Gateway 路由给主 agent，启动 Agent Loop
       ↓
3. Loop 1: LLM 推理 "需要并行调研，派 subagent"
       ↓
4. 派 3 个 subagent，分别用 ssh backend 跑在 3 台服务器上
       ↓
5. 每个 subagent 自己的 Agent Loop:
   - 调 web_search 工具找资料
   - 调 fetch_url 工具读文档
   - 调 LLM 生成结构化摘要
       ↓
6. 3 个 subagent 完成，主 agent 收到结果
       ↓
7. Loop N: LLM 生成最终对比表
       ↓
8. 通过 Gateway 推回 Telegram 给你
       ↓
9. 这次任务调用 ≥ 5 个工具，触发自动 skill 生成
       ↓
10. 新 skill `compare-llm-frameworks.md` 写入 ~/.hermes/skills/
       ↓
11. Honcho 更新用户画像 "用户关心开源生态 / 比较向"
```

下次你说"再调研一下 5 个 agent 框架对比"——Hermes **直接看自己刚写的 skill**，**速度和质量都提升**。

## 2.10 还有一些次要概念，先有个印象

| 词 | 一句话解释 |
|---|---|
| **Trajectory** | 一次任务的完整"思考-行动"轨迹，可导出当微调数据 |
| **Toolset** | 工具的分组（如 `code` / `web` / `data`），按需启用 |
| **Worktree** | git worktree 风格的隔离工作目录，subagent 用 |
| **MCP** | Model Context Protocol，跨 AI 工具的"插件"标准（同 OpenClaw） |
| **uv** | Python 的极速包管理（Hermes 用它装依赖） |
| **agentskills.io** | Skill 文件的开源开放标准 |

详见各自章节。

---

## 看完这一章你应该知道

✅ Gateway 是后台总管，统一收发消息
✅ Agent Loop = ReAct 推理-行动循环，每步 LLM 决策
✅ Tools 是 40+ 内置工具，开箱即用
✅ **Skills 是 Hermes 自己沉淀的"经验"**（杀手特性）
✅ 7 种 Backend 让任务能跑在本地 / Docker / 远程 / 云沙箱
✅ 5 层 Memory + Honcho 让 agent 越用越懂你
✅ Subagents 支持并行调研 / 隔离多任务

---

**下一步**：[3. 能做什么 / 不能做什么 →](/hermes/intro/can-do)

知道概念了，下一章看真实场景：Hermes 擅长什么、不擅长什么，避免预期错位。
