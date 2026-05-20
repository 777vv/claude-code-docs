# 28. 案例 4：个人知识库构建

::: info 这个案例你将搭出
把你的：
- 历史对话（自动入 FTS5）
- 个人笔记（Logseq / Obsidian / Markdown 文件夹）
- 收藏的文章（Pocket / Instapaper / 浏览器收藏夹）
- 公司文档（Notion / Confluence / 飞书）

**全部接入 Hermes 检索 + 推理**。

问 "上次那个 redis 怎么解决的"，Hermes 翻你所有笔记 + 历史对话给答案。
:::

## 28.1 整体架构

```
┌──────────────────────────────────────┐
│       你的对话历史 (FTS5)             │  ← Hermes 自带
├──────────────────────────────────────┤
│   ~/Documents/notes/*.md 笔记       │  ← 自定义索引
├──────────────────────────────────────┤
│       Logseq / Obsidian             │  ← 通过 skill
├──────────────────────────────────────┤
│       Notion / 飞书云文档           │  ← 通过 MCP
├──────────────────────────────────────┤
│       浏览器收藏 / Pocket           │  ← API 接入
└──────────────────────────────────────┘
            ↓ Hermes 统一检索
       「上次那个 X 怎么搞的」
            ↓
   Hermes 跨源搜索 + AI 总结 + 给答案
```

## 28.2 第一层：对话历史（自带）

FTS5 已经自动索引所有 Hermes 对话。无需做任何事。

```bash
hermes memory search "redis 性能"
```

## 28.3 第二层：本地 markdown 笔记

很多人有 `~/Documents/notes/` 一堆 markdown。让 Hermes 索引：

### 装 local-notes skill

```bash
hermes skills install local-notes
```

配置：
```yaml
# ~/.hermes/skills/local-notes/config.yaml
sources:
  - path: ~/Documents/notes
    pattern: "**/*.md"
  - path: ~/Documents/work
    pattern: "**/*.md"
  - path: ~/.logseq/graph
    pattern: "**/*.md"

index:
  refresh_interval: 1h
  database: ~/.hermes/data/notes.db
```

### 首次索引

```bash
hermes notes index
```

输出：
```
Indexing 1234 files...
  ~/Documents/notes/*: 567 files (4.5 MB)
  ~/Documents/work/*: 234 files (2.1 MB)
  ~/.logseq/graph/*: 433 files (8.9 MB)

Indexed 12,345 chunks in 23s.
```

### 用

```
你: 我记得我有篇笔记是关于"用 zustand 替代 redux"的，
   找一下我当时的结论

Hermes:
🔍 搜本地笔记...
找到 1 篇相关:

📄 ~/Documents/notes/2025-09-15-state-management.md
> "...实测下来 zustand 在小项目里 dx 好太多，
>  但状态复杂、要 middleware 时还是 redux 稳。
>  结论：50KB 以下 zustand，50KB+ redux。"
```

精准。

## 28.4 第三层：Logseq / Obsidian 深度集成

### Logseq

Logseq 的图谱 / 双链 / 块引用都是 markdown，local-notes skill 自动处理。

进一步：知道 Logseq 的特殊语法（`[[wiki link]]` / `((block ref))`）：

```bash
hermes skills install logseq-aware
```

之后能：
```
你: 我所有标 #重要 的页面里，最近一周有哪些待办？

Hermes:
🔍 解析 Logseq 标签...
找到 23 个 #重要 页面，其中 5 个有未完成 TODO:
1. [[2026-05-15]] - 准备 demo 视频
2. [[Project X]] - 修登录 bug
...
```

### Obsidian

类似。`obsidian-aware` skill。

## 28.5 第四层：Notion / 飞书云文档

通过 MCP 接入：

```bash
hermes mcp install mcp-server-notion
hermes mcp install mcp-server-feishu-docs
```

`config.yaml`:
```yaml
mcp:
  servers:
    - id: notion
      env: { NOTION_TOKEN: ${NOTION_TOKEN} }
    - id: feishu-docs
      env: { FEISHU_APP_ID: ..., FEISHU_APP_SECRET: ... }
```

用：
```
你: 看一下我 Notion 里 "客户对话记录" 数据库，
   过去 3 个月跟客户 X 聊了什么

Hermes:
📋 检索 Notion "客户对话记录"...
找到 12 条:
- 2026-03-15: 初步需求沟通
- 2026-03-22: 报价确认
- 2026-04-08: 合同细节
...
```

## 28.6 第五层：浏览器收藏 / Pocket

### Pocket

```bash
hermes skills install pocket-archive
# 配 Pocket access token
```

```yaml
sources:
  - pocket:
      include_tags: [tech, ai, productivity]
```

### 浏览器收藏夹

Chrome bookmarks:
```bash
hermes skills install chrome-bookmarks
# 自动找 ~/Library/Application Support/Google/Chrome/Default/Bookmarks
```

Firefox 类似。

### Raindrop.io / Instapaper

通过 API 同样能接。

## 28.7 统一查询接口

配置一个"个人知识库" skill 让 Hermes 自动多源查：

```yaml
# ~/.hermes/skills/personal-kb/config.yaml
sources:
  - hermes_history          # 对话历史
  - local_notes             # 本地笔记
  - logseq                  # Logseq
  - notion                  # Notion
  - pocket                  # Pocket
  - chrome_bookmarks        # 浏览器

retrieval:
  strategy: hybrid          # 关键词 + embedding
  top_n_per_source: 3
  rerank: true
  llm_summarize: true
```

```
你: 上次我跟客户 X 聊产品 roadmap 时讨论的优先级是啥来着？

Hermes (内部):
1. 查 hermes_history: 找到 5 条相关对话
2. 查 notion (客户记录): 找到 1 条会议纪要
3. 查 local_notes: 找到 1 篇内部 brainstorm

[多源整合 + AI 总结]

👉 综合：
2 周前的会议你和客户 X 确认的优先级:
1. (P0) 单点登录集成
2. (P1) 数据导出 API
3. (P2) 多人协作
P3 被砍掉了（参考会议纪要：feishu://...）

你后来在内部 brainstorm 里加了一条 P0.5: 移动端适配，
但还没和客户确认（笔记：~/notes/...md）。
```

跨源整合 + 上下文准确。

## 28.8 自动同步

不手动跑索引，让它后台自动：

```yaml
# config.yaml
schedules:
  - cron: "0 3 * * *"               # 凌晨 3 点
    command: "hermes notes index --quiet"

  - cron: "0 4 * * *"
    command: "hermes mcp refresh notion"

  - cron: "0 5 * * *"
    command: "hermes mcp refresh feishu-docs"
```

每天凌晨更新索引，白天用是最新。

## 28.9 Honcho 增强

Hermes 学了一周后，Honcho 知道：
- 你最常问哪些话题
- 你偏好哪种来源的答案
- 你看到答案后通常会再问什么

下次问问题，**Hermes 主动预拉相关上下文**，不是等你问。

```
你: 上周 redis 的事...

Hermes:
（Honcho: 用户经常问 redis 性能 + 上次解决方案）
你说的是 5 月 10 号那次 maxmemory-policy 调整吗？
当时的笔记和讨论我都翻了，要不要直接给你 summary？
```

## 28.10 隐私

知识库包含你**全部生活轨迹**——这是最敏感的东西。

```yaml
knowledge_base:
  encryption: at_rest         # 数据库加密
  backup_encrypted: true
  share_with_subagents: false # 不让 subagent 访问
  exclude_paths:
    - ~/private/
    - ~/Documents/journal/   # 私人日记不入库
```

跨平台共享时**严格控制**哪些源能从公网访问到。

## 28.11 知识库的"忘记"

记太多反而干扰。定期清理：

```bash
# 看库大小
hermes kb stats

# 清旧的（一年前 + 没被访问过的）
hermes kb prune --older-than 1y --no-recent-access

# 完全清某源
hermes kb remove --source notion
```

## 28.12 实测效果

社区用户反馈：
- 用 6 个月后，"我的第二大脑" 感觉对得起这词
- 知道我去年提过的 X 项目细节
- 帮我连接之前没意识到的思路
- 但**初期 3 个月效果一般**——索引还在建、Honcho 还在学

## 28.13 成本

- 索引：一次性 ~¥1-3（取决于文档量）
- 每次查询：¥0.05-0.20（含多源检索 + LLM 总结）
- 每天查 50 次：¥3-10/天，¥90-300/月
- **省的时间**远超成本

---

## 看完这个案例你应该会

✅ 5 层数据源接入 Hermes 检索
✅ FTS5 + embedding + MCP 三件套
✅ Logseq / Obsidian 深度集成
✅ 后台自动同步索引
✅ Honcho 让 Hermes "懂你在问什么"
✅ 隐私边界严控

---

**下一步**：[29. 案例 5：定时夜班任务 →](/hermes/cases/cron-night)

下一个：让 Hermes 在你睡觉时上 SSH 远程服务器跑任务。
