# 18. 多 Agent 协作

::: info 本章你将学到
- 什么时候需要"多 Agent"而不是"一个万能 Agent"
- 怎么在同一个 Gateway 下跑多个 Agent
- 三种协作模式：路由 / 主从 / 编排
- 实战：3 个 agent 协作做"项目监控 → AI 分析 → 飞书报警"
- Agent 之间怎么通信、共享数据
:::

## 18.1 为什么要多 Agent

一个 Agent 装太多 skill 会有这些问题：
- soul.md 越写越长（要覆盖各种边界）
- LLM 决策时干扰多（"这个用户的话该用哪个 skill?"）
- 权限混乱（订餐 skill 不该知道你的 GitHub token）
- 账单不清楚（哪个功能烧钱多？）

**多 Agent 的好处**：
- 每个 agent 专精一件事，soul 短而准
- 权限隔离（坏 skill 影响范围有限）
- 模型可分级（chat agent 用便宜模型，coding agent 用贵模型）
- 账单分得清
- 不同 channel 路由到不同 agent（家庭群是 agent A，公司群是 agent B）

::: tip 经验法则
当一个 agent 的 soul.md 超过 2000 字，或装了 8+ 个 skill，就该考虑拆成多个。
:::

## 18.2 建多个 Agent

跟 [9. 你的第一个 Agent](/openclaw/setup/first-agent) 一样，每个新 agent 一个目录：

```
~/.openclaw/workspace/agents/
├── xiaozhao/          ← 通用个人助理
├── code-reviewer/     ← 代码 review 专家
├── news-collector/    ← 抓资讯做摘要
└── home-manager/      ← 家庭事务（给老婆/妈用）
```

每个目录有自己的 `agent.yaml` + `soul.md` + `memory.md`。

## 18.3 路由：消息怎么分发到对的 agent

OpenClaw 提供 4 种路由策略，在 `channel.yaml` 里配。

### 策略 1：按 channel 分（最简单）

```yaml
# telegram.yaml
default_agent: xiaozhao        # Telegram 全归 xiaozhao 处理
```

```yaml
# feishu.yaml
default_agent: code-reviewer   # 飞书全归 code-reviewer 处理
```

每个 IM 接一个 agent，井水不犯河水。

### 策略 2：按用户 / 群 ID 路由

```yaml
# feishu.yaml
routing:
  - match: { chat_id: oc_family_group }      # 家庭群
    agent: home-manager
  - match: { chat_id: oc_work_group }        # 工作群
    agent: code-reviewer
  - match: { user_id: ou_boss_xxx }          # 老板私聊
    agent: xiaozhao
  default_agent: xiaozhao
```

### 策略 3：按关键词路由

```yaml
routing:
  - match: { contains: ['代码', 'review', 'PR'] }
    agent: code-reviewer
  - match: { contains: ['购物', '家务', '天气'] }
    agent: home-manager
  default_agent: xiaozhao
```

### 策略 4：让 LLM 自己决定（智能路由）

```yaml
routing:
  mode: llm
  router_agent: xiaozhao       # 用 xiaozhao 当"前台"
  available_agents:
    - code-reviewer
    - home-manager
    - news-collector
```

每条消息进来时，先让 `router_agent`（通常用便宜模型）判断"该给谁"，再转发。最灵活但贵一点。

## 18.4 三种协作模式

### 模式 A：纯路由（最常见）

```
用户消息
    ↓
Gateway 按规则选一个 agent
    ↓
该 agent 处理 + 回复
```

互相独立，互不感知。适合：不同场景不同 agent。

### 模式 B：主从（一个调另一个）

```
用户：写一个 hello world
    ↓
xiaozhao（前台 agent）收到
    ↓
xiaozhao 调用 code-reviewer agent 帮忙写代码
    ↓
code-reviewer 返回结果
    ↓
xiaozhao 整理回复给用户
```

实现：在 xiaozhao 的 skills 里装 `delegate-to-agent` skill（OpenClaw 内置）：

```yaml
# xiaozhao/agent.yaml
skills:
  - core/delegate
allowed_delegates:
  - code-reviewer
  - news-collector
```

xiaozhao 的 LLM 看到说明会知道"我可以委托任务给 code-reviewer"。

### 模式 C：编排（多 agent 流水线）

```
某事件触发（webhook / cron）
    ↓
news-collector：抓资讯
    ↓ 拿到原始数据
analyzer：AI 分析重要程度
    ↓ 拿到摘要
formatter：排版成报告
    ↓ 最终成品
notifier：发到飞书群
```

每个 agent 是流水线一节，OpenClaw 用 **Workflow** 编排：

```yaml
# workflows/daily-news.yaml
name: 每日资讯流水线
trigger:
  cron: "0 8 * * *"           # 每天 8 点
steps:
  - id: fetch
    agent: news-collector
    task: "抓取今天的 V2EX + HN 头条 10 条"
    output: raw_news

  - id: analyze
    agent: news-analyzer
    task: "评估重要性，挑出最重要 3 条"
    input: ${fetch.raw_news}
    output: top_3

  - id: format
    agent: news-formatter
    task: "排版成飞书消息卡片"
    input: ${analyze.top_3}
    output: card

  - id: send
    channel: feishu
    target: oc_daily_news_group
    message: ${format.card}
```

跑：`openclaw workflow run daily-news`，或让它按 cron 自动跑。

## 18.5 实战：项目监控流水线

需求：GitHub CI 失败时 → AI 分析失败原因 → 找潜在责任人 → 飞书@他

### 三个 agent

**`ci-watcher`** —— 接 GitHub webhook，监听 workflow_run 事件
```yaml
# ci-watcher/agent.yaml
model:
  provider: deepseek
  model: deepseek-chat
skills:
  - core/webhook
  - github
soul: ./soul.md
```

soul.md:
```markdown
# 你是谁
GitHub CI 监控员。专门处理 workflow_run 事件。

# 行为
收到 workflow_run.completed 事件且 conclusion=failure 时：
1. 调 github skill 拉失败 job 的日志
2. 把日志和元数据传给 ci-analyzer agent
3. 等待结果，转发给 ci-notifier agent
```

**`ci-analyzer`** —— 分析失败原因
```yaml
# ci-analyzer/agent.yaml
model:
  provider: anthropic          # 用 Claude 分析更准
  model: claude-sonnet-4-6
skills:
  - core/text-analyze
soul: ./soul.md
```

soul.md:
```markdown
# 你是谁
CI 失败分析师。输入日志，输出：
1. 失败类型（test_fail / build_fail / lint_fail / network / timeout）
2. 关键错误行
3. 可能的责任 commit（看 git log 找最近修改这块的人）
4. 修复建议（一句话）

# 输出格式
JSON。
```

**`ci-notifier`** —— 发飞书
```yaml
# ci-notifier/agent.yaml
model:
  provider: deepseek
  model: deepseek-chat
skills:
  - core/feishu-message
channels:
  - feishu
soul: ./soul.md
```

soul.md:
```markdown
# 你是谁
告警通知员。把 CI 分析结果转成飞书卡片：
- 失败仓库 / workflow / branch
- 错误摘要
- 可能负责人 @
- 链接到失败的 run
```

### Workflow 串起来

```yaml
# workflows/ci-monitor.yaml
name: CI 失败监控
trigger:
  webhook: github
  filter:
    event: workflow_run
    conclusion: failure

steps:
  - id: collect
    agent: ci-watcher
    task: "提取 workflow_run 数据和失败日志"
    output: incident

  - id: analyze
    agent: ci-analyzer
    task: "分析这次失败"
    input: ${collect.incident}
    output: analysis

  - id: notify
    agent: ci-notifier
    task: "发送告警"
    input: { incident: ${collect.incident}, analysis: ${analyze.analysis} }
```

跑起来后，GitHub CI 一失败，30 秒内你的飞书群就有：

```
🚨 [CI 失败] backend-api / main 分支

类型: test_fail
错误: TypeError in user.test.ts:42

可能责任人: @张三（最近修过这文件）

修复建议: 检查 mockReturnValue 类型，可能传错对象。

📎 完整日志: github.com/.../actions/runs/12345
```

效率提升 N 倍。

## 18.6 Agent 之间共享数据

3 种方式：

### 方式 1：共享 memory 文件夹

```yaml
# 两个 agent 都用同一个 memory
agents:
  shared_memory: ./shared-mem.md
```

xiaozhao 和 code-reviewer 共享一份 memory，知道彼此学到的事。

### 方式 2：用 KV 存储

```yaml
# agent.yaml
storage:
  type: kv
  backend: sqlite             # 或 redis
  path: ~/.openclaw/shared.db
```

skill 里可以 `await ctx.storage.set('key', value)` / `get('key')`。

### 方式 3：通过 channel 发消息

最简单：让 agent A 在内部 channel 给 agent B 发消息。

```javascript
// agent A 的 skill 里
await channel.send({
  to: 'internal://agent/code-reviewer',
  message: 'review this PR: ...'
});
```

## 18.7 资源 / 成本控制

多 agent 容易失控。建议：

```yaml
# global.yaml
agents:
  per_agent_quota:
    requests_per_minute: 20
    cost_per_day: 5            # ¥5/agent/天上限
  total_quota:
    cost_per_day: 50           # 全站 ¥50/天上限
```

超额自动 throttle，不会一夜烧光 ¥500。

## 18.8 常见误用

### ❌ "一个 agent 万能" 综合症
症状：xiaozhao 一个 agent 装 20 个 skill，soul 写 5000 字。
后果：响应慢、决策乱、调试难、贵。
解药：拆分。

### ❌ "agent 数量爆炸" 综合症
症状：每个小功能建一个 agent，30 个 agent 互相调来调去。
后果：路由复杂、维护噩梦。
解药：每个 agent 至少覆盖一个"完整角色"（如"个人助理""家庭管家"），不是单一动作。

### ❌ "深层主从" 综合症
症状：A 调 B，B 调 C，C 调 D……每层都过一次 LLM。
后果：响应慢 + 巨贵。
解药：层级 ≤ 2，更深用 workflow 编排而非 agent 嵌套。

---

## 看完这一章你应该知道

✅ 一个 agent 装太多 = 拆分时机
✅ 4 种路由策略：按 channel / 按 ID / 按关键词 / 让 LLM 决定
✅ 3 种协作：路由 / 主从 / 编排（workflow）
✅ workflow yaml 串联多 agent 实现复杂流水线
✅ Agent 共享数据：共享 memory / KV 存储 / 互发消息
✅ 必设 quota 防止失控

---

**下一步**：[19. Memory 记忆系统 →](/openclaw/advanced/memory)

多 agent 玩明白了？下一章深入 Memory——让 agent 真正"记住"事的关键机制。
