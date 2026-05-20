# 28. 案例 4：论文追踪助手

::: info 这个案例你将搭出什么
- 每天扫 arxiv 你关注分类（cs.AI / cs.CL / cs.LG）的新论文
- AI 按"和我研究方向相关性"评分
- 精选 Top 5 翻译标题 + 一句话摘要 + 推荐理由
- 周末打包发"周精选"到邮箱 / 飞书
- 长期 memory 学习你的偏好（你点过赞的论文 → 同类加权）
:::

## 28.1 用到的能力

- arxiv API 抓取（自定义 skill）
- Memory 持久化你的偏好
- LLM 长文摘要 + 评分
- 邮件 / 飞书推送

## 28.2 准备：写 arxiv-fetcher skill

```
skills/arxiv-fetcher/
├── SKILL.md
└── handler.js
```

`SKILL.md`:
```markdown
---
id: arxiv-fetcher
permissions: [network]
---

## Capabilities

### fetch_recent(categories: string[], days: int)
拉最近 N 天指定分类的新论文。

输出每条:
{ "id": "2405.xxxxx", "title": "...", "abstract": "...", "authors": [...], "url": "..." }
```

`handler.js`:
```javascript
import { XMLParser } from 'fast-xml-parser';

export async function fetch_recent(categories = ['cs.AI', 'cs.CL'], days = 1) {
  const catQuery = categories.map(c => `cat:${c}`).join(' OR ');
  const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(catQuery)}&start=0&max_results=100&sortBy=submittedDate&sortOrder=descending`;

  const xml = await (await fetch(url)).text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const data = parser.parse(xml);

  const since = Date.now() - days * 86400000;
  return data.feed.entry
    .map(e => ({
      id: e.id.split('/').pop(),
      title: e.title.replace(/\s+/g, ' ').trim(),
      abstract: e.summary.replace(/\s+/g, ' ').trim(),
      authors: Array.isArray(e.author) ? e.author.map(a => a.name) : [e.author.name],
      url: e.id,
      published: e.published,
    }))
    .filter(p => new Date(p.published).getTime() >= since);
}
```

```bash
cd skills/arxiv-fetcher
npm install fast-xml-parser
```

## 28.3 创建 arxiv-watcher agent

`agent.yaml`:
```yaml
id: arxiv-watcher
name: arxiv 追踪员
model:
  provider: deepseek
  model: deepseek-reasoner       # 评分需要推理
soul: ./soul.md
skills:
  - core/memory
  - arxiv-fetcher
channels:
  - feishu
```

`soul.md`:
```markdown
# 你是谁
arxiv 论文追踪员。每天给主人看最新论文，挑相关性最高的。

# 主人的研究方向（关键）
- 主线: LLM agents / multi-agent systems
- 次线: prompt engineering / RAG / 评估方法
- 不关心: 纯 vision / 纯 speech / 理论数学

# 评分规则（0-100）
- 标题命中关键词: +30
- 摘要 abstract 命中: +30
- 作者是知名团队 (Anthropic/OpenAI/DeepMind/MetaAI/Allen AI): +15
- 是 survey/benchmark 类（综述型）: +10
- 引用主人最近点赞的论文同主题: +20

# 输出规范
- 每篇:
  - 中文翻译标题
  - 1 句话摘要（中文，<40 字）
  - 评分 + 推荐理由（1 句）
  - 链接

# 边界
- 不评论，不主观
- 评分严格按规则
- 已经推送过的论文不重复（用 memory 记 push 过的 id）
```

## 28.4 Workflow: 每日扫描 + 周末精选

### 每日扫描（早 9 点）

```yaml
# workflows/arxiv-daily.yaml
name: arxiv 每日扫描
trigger:
  cron: "0 9 * * 1-7"

steps:
  - id: fetch
    agent: arxiv-watcher
    task: "调 arxiv-fetcher.fetch_recent(['cs.AI', 'cs.CL', 'cs.LG'], 1)"
    output: papers

  - id: score
    agent: arxiv-watcher
    task: "按 soul 规则给以下论文评分，挑出 score >= 50 的"
    input: ${fetch.papers}
    output: scored

  - id: format
    agent: arxiv-watcher
    task: "格式化前 5 篇成 Markdown，包含翻译标题/摘要/评分/链接"
    input: ${score.scored}

  - id: send
    channel: feishu
    target: ${MY_OPEN_ID}
    message: ${format}
    condition: ${score.scored.length} > 0
```

### 周末精选（周六 10 点）

```yaml
# workflows/arxiv-weekly.yaml
name: arxiv 周精选
trigger:
  cron: "0 10 * * 6"

steps:
  - id: fetch
    agent: arxiv-watcher
    task: "拉过去 7 天的论文"

  - id: top10
    agent: arxiv-watcher
    task: "评分排序，选 Top 10，每篇详细摘要（中英对照）"
    input: ${fetch}

  - id: send_mail
    channel: email
    to: ${MY_EMAIL}
    subject: "📚 本周 arxiv 精选 (${DATE})"
    body_html: ${top10}
```

## 28.5 学习偏好：让 agent "记住"你的口味

每次推论文都附带 `mark 赞 / 踩 / 已读` 按钮（飞书互动卡片）。点赞的论文 agent 会：

1. 提取关键词存入 memory
2. 下次评分时遇到同主题论文 +20

soul 加：
```markdown
# 学习主人偏好
当主人在飞书卡片点赞某篇论文:
1. 调 memory.add(title + abstract 关键词 + "主人点赞")
2. 未来评分时检测到这些关键词 +20
```

## 28.6 实际推送效果

```
📚 今日 arxiv 精选 (2026-05-19)

3 篇评分 ≥ 50:

⭐ 85 分
**Self-Reflective Multi-Agent Coordination with Verifier Critique**
> 多 agent 协作时用 verifier 评论改进单个 agent 决策

作者: Anthropic
推荐理由: 命中 multi-agent + verifier，主人最近收藏过类似方向
🔗 https://arxiv.org/abs/2405.xxxxx

⭐ 72 分
**TaskBench v3: A Comprehensive Benchmark for Tool-Using LLMs**
> Tool-using LLM 综合 benchmark，新增 50 个真实场景

作者: 清华 KEG
推荐理由: 评估方法 + tool use 双命中
🔗 https://arxiv.org/abs/2405.xxxxx

⭐ 55 分
**Beyond Reasoning: ...**
...
```

## 28.7 进阶：每篇生成"3 分钟讲解"

加 workflow step：
```yaml
- id: explain
  agent: arxiv-watcher
  task: |
    对评分最高的那篇，生成"3 分钟讲解"：
    - 问题是什么
    - 之前怎么做
    - 这篇怎么做（核心 idea）
    - 实验结果亮点
    - 局限
    每段不超 50 字。
```

适合早通勤路上看，不用读论文。

## 28.8 多领域订阅

研究两个方向？建两个 agent：
- `arxiv-watcher-llm`（agent / RAG）
- `arxiv-watcher-vision`（CV / generation）

每个独立 soul、独立 cron、独立 memory。互不打扰。

## 28.9 成本

按日均 1 次扫描 + 周末 1 次精选：
- 每日: ¥0.2-0.5（评分用 reasoner）
- 周末: ¥1-2（10 篇详细摘要）
- 月度: ~¥10-20

---

## 看完这个案例你应该会

✅ 用自定义 skill 抓 arxiv API
✅ 用 LLM 做相关性评分
✅ Memory 跟踪用户偏好
✅ 日 / 周双 workflow

---

**下一步**：[29. 案例 5：飞书问答机器人 →](/openclaw/cases/feishu-qa-bot)

下一个：把企业知识库接入飞书 bot，员工 @ 它问问题即得答。
