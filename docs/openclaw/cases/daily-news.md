# 25. 案例 1：每日资讯晨报

::: info 这个案例你将搭出什么
每天早上 8 点，OpenClaw 自动：
1. 抓 V2EX 热门 + Hacker News 头条 + 你订阅的 RSS（约 20-50 条）
2. AI 按"AI / 编程 / 工具 / 杂项"四类整理
3. 重要的标红 / 高亮
4. 生成飞书富卡片或 Telegram 长消息
5. 推到你的"今日资讯"群

预计搭建时间：30-45 分钟。
:::

## 25.1 用到的能力

- ✅ Workflow（cron 定时触发）
- ✅ rss skill（订阅源抓取）
- ✅ web-search / url-fetch（HN / V2EX 抓页）
- ✅ LLM 摘要 + 分类
- ✅ Channel 推送（飞书 / Telegram 任选）

## 25.2 整体架构

```
crontab "0 8 * * *"
        ↓
news-collector agent
   ├─ rss.fetch (我的订阅源 × N)
   ├─ web-fetch (V2EX 热门页)
   └─ web-fetch (HN /front)
        ↓ 拼成原始数据
news-analyzer agent
   └─ LLM: 分类 + 摘要 + 标记重要
        ↓ 结构化结果
news-formatter agent
   └─ 转飞书卡片或 Telegram MD
        ↓
feishu / telegram channel: 推送
```

## 25.3 准备：装 skill

```bash
openclaw skill install rss
openclaw skill install url-fetch
openclaw skill install html-to-markdown
```

## 25.4 创建 3 个 agent

### Agent A: news-collector

```bash
mkdir -p ~/.openclaw/workspace/agents/news-collector
cd ~/.openclaw/workspace/agents/news-collector
```

`agent.yaml`:
```yaml
id: news-collector
name: 资讯抓取员
model:
  provider: deepseek
  model: deepseek-chat
soul: ./soul.md
skills:
  - rss
  - url-fetch
  - html-to-markdown
behavior:
  language: zh-CN
```

`soul.md`:
```markdown
# 你是谁
资讯抓取专员。负责按命令从多个源抓最近资讯，原样汇总（不做摘要不评论）。

# 数据源（按命令决定抓哪几个）
- V2EX 热门: https://www.v2ex.com/?tab=hot
- Hacker News: https://news.ycombinator.com/front
- 我的 RSS:
  - https://nadeshiko.co/rss
  - https://www.solidot.org/index.rss
  - https://www.appinn.com/feed

# 输出格式
返回 JSON 数组，每条:
{
  "source": "v2ex / hn / rss",
  "title": "...",
  "url": "...",
  "summary_raw": "正文前 500 字"
}

# 边界
- 不评论，不分类，原样汇总
- 抓不到的源跳过，不报错
- 重复内容只保留一份
```

### Agent B: news-analyzer

```bash
mkdir ~/.openclaw/workspace/agents/news-analyzer
cd ~/.openclaw/workspace/agents/news-analyzer
```

`agent.yaml`:
```yaml
id: news-analyzer
name: 资讯分析师
model:
  provider: deepseek
  model: deepseek-reasoner       # 推理模型，分类更准
soul: ./soul.md
```

`soul.md`:
```markdown
# 你是谁
资讯分析师。给定原始资讯数组，输出分类整理 + 重要性评分。

# 输入
news-collector 返回的 JSON 数组

# 输出格式
{
  "categories": {
    "ai": [
      { "title": "...", "url": "...", "one_liner": "一句话总结", "importance": "high/medium/low" }
    ],
    "coding": [...],
    "tools": [...],
    "misc": [...]
  },
  "tldr": "今日 5 个最关键看点（如果有）"
}

# 分类规则
- ai: 大模型 / AI 应用 / agent / 数据集 等
- coding: 编程语言 / 框架 / 工具链 / 开源项目
- tools: 软件、SaaS、生产力工具
- misc: 其他有趣的

# importance 判断
- high: 行业重大事件、必看
- medium: 值得了解
- low: 知道一下即可

# 边界
- 每类最多 5 条
- one_liner 中文，不超 30 字
- tldr 最多 5 条
```

### Agent C: news-formatter

```bash
mkdir ~/.openclaw/workspace/agents/news-formatter
cd ~/.openclaw/workspace/agents/news-formatter
```

`agent.yaml`:
```yaml
id: news-formatter
name: 排版员
model:
  provider: deepseek
  model: deepseek-chat
soul: ./soul.md
```

`soul.md`:
```markdown
# 你是谁
排版员。把 news-analyzer 的结构化结果转成 IM 友好的消息。

# 输出格式选择
- feishu_card: 飞书富卡片 JSON
- telegram_md: Telegram MarkdownV2
- plain: 纯文本（兜底）

# 格式要求
- 顶部: 📰 今日资讯晨报 + 日期
- TLDR 块: 加粗显示
- 4 个分类，每个一个 section
- high 重要性的标 🔥
- 每条带链接

# 边界
- 不修改内容，只排版
- 链接保持可点击
- 长度控制在 IM 单条上限内（飞书 6KB / Telegram 4096 字符）
```

## 25.5 写 workflow 串起来

`~/.openclaw/workspace/workflows/daily-news.yaml`:

```yaml
name: 每日资讯晨报
description: 抓取 → 分析 → 排版 → 推送

trigger:
  cron: "0 8 * * *"            # 每天 8 点
  timezone: Asia/Shanghai

steps:
  - id: collect
    agent: news-collector
    task: |
      抓以下源:
      - V2EX 热门页
      - HN 头版
      - RSS 订阅源全部
      返回 JSON 数组。
    timeout: 120s
    output: raw_news

  - id: analyze
    agent: news-analyzer
    task: "分类整理以下资讯，给出 TLDR"
    input: ${collect.raw_news}
    timeout: 60s
    output: analyzed

  - id: format
    agent: news-formatter
    task: "转成飞书富卡片格式"
    input: ${analyze.analyzed}
    timeout: 30s
    output: card

  - id: send
    channel: feishu
    target: oc_xxxxxxxxxxxxxx     # 你的资讯群 chat_id
    message: ${format.card}
    message_type: interactive     # 飞书富卡片
```

## 25.6 测试 workflow

### 先手动跑一次

```bash
openclaw workflow run daily-news
```

输出：
```
[10:23:45] Step: collect
[10:23:46]   Agent news-collector started
[10:24:02]   ✓ Done (47 items collected, 16s, ¥0.02)
[10:24:02] Step: analyze
[10:24:03]   Agent news-analyzer started
[10:24:45]   ✓ Done (categorized, 42s, ¥0.18)
[10:24:45] Step: format
[10:24:46]   Agent news-formatter started
[10:24:50]   ✓ Done (card built, 4s, ¥0.01)
[10:24:50] Step: send
[10:24:51]   ✓ Sent to feishu/oc_xxx
[10:24:51] Workflow complete (66s total, ¥0.21)
```

去飞书看群里应该出现一张精美卡片。

### 启用 cron

```bash
openclaw workflow enable daily-news
```

明早 8 点自动开始。

## 25.7 渐进迭代

第一次跑出来的效果通常**不完美**。常见调整：

### 调整 1：源不够 / 太多
改 news-collector 的 soul.md 里"数据源"清单。

### 调整 2：分类不准
改 news-analyzer 的 soul.md 里"分类规则"，给更明确的例子。

### 调整 3：摘要太长 / 太短
soul 里加约束："one_liner 不超 25 字" / "至少 20 字"。

### 调整 4：重要性判断保守 / 激进
"importance=high 是当天必看（一周看不超过 3 条）"

### 调整 5：飞书卡片不好看
直接看 LLM 返回的 JSON，自己调 schema。或换成 `plain` 文本先验证流程。

## 25.8 实际效果示例

飞书群里收到的消息：

```
📰 今日资讯晨报 · 2026-05-19 周一

🌟 TLDR
• OpenAI 发布 GPT-5.1，多模态能力大幅提升 🔥
• Anthropic 推出 Claude Code v2，IDE 集成更深
• Vue 4 正式版发布，性能提升 40%
• ...

🤖 AI（5 条）
🔥 [OpenAI 发布 GPT-5.1](https://...) — 多模态能力跃升，编码能力接近 Claude
   • [Anthropic Claude Code v2 发布](https://...) — IDE 集成深度增强
   ...

💻 编程（5 条）
   • [Vue 4 正式版](https://...) — 性能提升 40%
   ...

🛠 工具（4 条）
   ...

🎲 杂项（3 条）
   ...
```

## 25.9 进阶玩法

### 个性化推荐（基于你 star/收藏过的）

在 news-analyzer 的 soul 里加：
```markdown
# 主人偏好（用于打分加权）
- 重点关注: TypeScript, Rust, AI agent, 命令行工具
- 不感兴趣: 加密货币, web3, 区块链
```

LLM 会自动给你关注的话题更高分。

### 多平台同步

```yaml
- id: send_feishu
  channel: feishu
  target: oc_work
  message: ${format.card}

- id: send_telegram
  channel: telegram
  target: 123456789
  message: ${format.telegram}
```

一份资讯同时发飞书 + Telegram。

### 周报模式（每周日总结一周）

新建 `weekly-news.yaml`，cron 改 `0 18 * * 0`，task 改成"汇总过去 7 天 + 选出 Top 10"。

### 私聊订阅模式

订阅者私聊 bot："订阅 AI 类资讯"，bot 把他们加到列表，每天分类只推送他订阅的。

进阶 skill：`subscription-manager`。

## 25.10 常见问题

### Q：cron 没触发
- 检查 `openclaw workflow list` 状态是 enabled
- Gateway 必须在跑（cron 是 Gateway 内部触发的）
- 时区设对没？`timezone: Asia/Shanghai`

### Q：RSS 抓不到
- 有些源要 User-Agent，配置 skill：
  ```yaml
  rss:
    user_agent: "Mozilla/5.0 ..."
  ```

### Q：LLM 返回的不是合法 JSON
- 在 soul 里加：`只输出 JSON，不要 markdown 代码块包裹`
- 用 `deepseek-reasoner` 比 `deepseek-chat` 更稳

### Q：飞书卡片显示乱
- 直接看 `${format.card}` 的内容，去 [飞书卡片调试器](https://open.feishu.cn/tool/cardbuilder) 粘进去看预览
- 通常是 JSON 结构错

### Q：太烧钱
- 用 deepseek-chat 而非 reasoner
- 减少 RSS 源数量
- 让 news-collector 只返回标题，不返回正文

## 25.11 成本估算

按上述配置，一次 workflow 跑：
- collect: ~5K tokens × ¥0.001/K = ¥0.005
- analyze: ~10K input + 3K output ≈ ¥0.06
- format: ~3K + 2K ≈ ¥0.015

**单次约 ¥0.08-0.20，月度（30 天）约 ¥3-6**。完全可承受。

---

## 看完这个案例你应该会

✅ 写 3 个协作的 agent（collector / analyzer / formatter）
✅ 用 workflow yaml 串联多步
✅ 接 cron 实现定时
✅ 渐进迭代调整效果
✅ 推送到飞书 / Telegram

---

**下一步**：[26. 案例 2：个人办公助理 →](/openclaw/cases/office-helper)

下一个案例：让 OpenClaw 接管你的 Gmail / 日历 / Notion，做真正的白领助理。
