# 17. 写你自己的 Skill

::: info 本章你将学到
- Skill 文件的完整 schema（agentskills.io v1）
- 从 0 写一个真实的 skill（手把手）
- 三种写法：从模板 / 从对话 / 纯手写
- 测试 + 迭代 + 发布
:::

::: tip 跟上一章不同
[16 章](/hermes/advanced/skills) 讲"Hermes 自动产 skill"。
**本章讲你**主动写 skill。
适合：你脑子里已经有清晰流程，想立刻让 Hermes 用上，不等它自学。
:::

## 17.1 案例需求

我们要写一个 skill `daily-standup-prep`：

> 每天早上 9:00 前，自动整理：
> - 昨天我提交了哪些 PR / commit
> - 今天日历上有什么会
> - 邮箱里"未读 + 重要"的邮件
> - 输出格式：3 段精简文字，发到飞书 / Telegram

跟着做完你会有一个真正自己写的 skill 跑在 Hermes 上。

## 17.2 三种创建方式

### 方式 A：模板生成

```bash
hermes skills create daily-standup-prep
```

会问几个问题：
```
? Description: 每天早上整理待办，发到 IM
? Triggers (comma-sep): 早会准备, daily standup
? Tools needed: git, google-calendar, gmail
? Backend: local

✓ Created: ~/.hermes/skills/daily-standup-prep/
   ├── SKILL.md
   └── README.md (你写说明给别人看的)
```

打开编辑器自动加载 SKILL.md 让你改。

### 方式 B：从对话生成

跟 Hermes 来回演示一次，然后说"存成 skill"：

```
你: 现在示范一下早会准备流程：
   1. 跑 git log 看昨天 commit
   2. 调 google-calendar 看今天会议
   3. 调 gmail 看未读邮件
   4. 整理成 3 段发飞书

[Hermes 跑一遍]

你: 把刚才的过程存成 skill，叫 daily-standup-prep
```

Hermes 自动写 SKILL.md。

### 方式 C：纯手写

```bash
mkdir -p ~/.hermes/skills/daily-standup-prep
vim ~/.hermes/skills/daily-standup-prep/SKILL.md
```

下面详讲手写。

## 17.3 SKILL.md 完整 schema

```markdown
---
schema: agentskills/v1            # 标准版本
name: daily-standup-prep          # 唯一 ID，全小写连字符
version: 1                        # 起始 1
description: 每天早上整理昨天进展 + 今天日程 + 重要邮件
author: 你的名字 / GitHub handle
license: MIT
created: 2026-05-19
updated: 2026-05-19

# === 触发条件 ===
triggers:
  - "早会准备"
  - "daily standup"
  - "今天有啥安排"
  - cron: "0 8 * * 1-5"      # 工作日早 8 点自动

# === 输入 ===
inputs:
  - name: date
    type: date
    default: today
    description: 准备哪一天的（默认今天）

# === 输出 ===
outputs:
  - name: summary
    type: markdown
    description: 三段文字
  - name: action_items
    type: array
    description: 提取的待办

# === 用到的工具 ===
tools_used:
  - shell_exec        # 跑 git log
  - api_call          # 调 google-calendar
  - api_call          # 调 gmail
  - send_message      # 发 IM

# === 可用的 fallback ===
fallbacks:
  - if: tool_fail
    then: skip_and_continue
  - if: empty_results
    then: notify_user_no_data

# === 配置 ===
config:
  repos_to_check:
    - ~/projects/ai-learning-docs
    - ~/projects/some-app
  gmail_label_filter: "important"
  output_channel: feishu        # 发到哪
  output_format: detailed       # detailed / concise
---

# Daily Standup Prep

## 用途
每天早上整理"昨天 / 今天 / 邮件"三件套，让你 1 分钟看完做完所有准备。

## 详细步骤

### 步骤 1: 查昨天 commit
对 config.repos_to_check 里每个仓库:
```bash
cd <repo> && git log --since="yesterday 00:00" --until="yesterday 23:59" \
  --author="$(git config user.email)" --oneline
```

### 步骤 2: 查今天日程
调 google-calendar.list_events(date: today)，过滤掉:
- 全天事件（如生日）
- "无需准备"标签的

### 步骤 3: 查重要邮件
调 gmail.list(query: "is:unread label:important newer_than:1d")

### 步骤 4: 整理输出
按以下格式：

\`\`\`markdown
## 📅 ${date} 早会准备

### 📌 昨天完成
- 仓库 A: 3 commits ([abc1234] feat: x, ...)
- 仓库 B: 1 commit

### 🗓 今天日程
- 10:00-11:00 产品评审
- 14:00-15:00 1on1 with 王总
- 16:30 demo prep

### 📧 重要邮件 (2 封未读)
- 王总: 关于明天 demo 调整 (5h ago)
- 客户 X: 合同确认 (8h ago)
\`\`\`

### 步骤 5: 发送
调 send_message(channel: config.output_channel, content: 上面 markdown)

## 已知坑
- git log 在没改动天数会返回空，正常处理为"昨天休息了"
- google-calendar token 过期 24h 一次，自动 refresh
- gmail 重要邮件标签依赖你自己在 Gmail 设的 filter
- output_channel 没配的话默认发到 CLI

## 失败模式
- 任一步失败不致命，**继续后续步骤**
- 全失败 → 输出"今天什么数据都没拿到，要查一下网络"

## 示例输入
"今天早会准备"
"daily standup"
（或定时触发）

## 示例输出
（见步骤 4 模板）

## 改进方向
- v2: 加 Sentry P0/P1 alerts
- v2: 加 Linear / Jira 工单
- v3: AI 自动总结邮件不要全文
```

## 17.4 验证 skill

### 测试加载

```bash
hermes skills view daily-standup-prep
```

应该完整输出。

### 测试触发

```bash
hermes "今天早会准备"
```

Hermes 应该匹配到这个 skill 并执行。看输出：

```
🧬 Using skill: daily-standup-prep (v1)

🛠️ Step 1: Checking yesterday's commits...
   $ cd ~/projects/ai-learning-docs && git log ...
   → 3 commits found

🛠️ Step 2: Fetching today's calendar...
   → 3 events

🛠️ Step 3: Checking important unread emails...
   → 2 unread

📋 早会准备:
...
```

### 看 trajectory

```bash
hermes trajectory last
```

看每步是否按 SKILL.md 描述执行。

## 17.5 调试常见错误

### Q：skill 列出来但触发不上

```bash
hermes skills test daily-standup-prep --query "早会准备"
```

输出：
```
Match score: 0.78 (threshold 0.65) ✓
Triggers matched: "早会准备"
```

如果 score < 0.65：
- 加更多 triggers 词
- 改 description 更准确

### Q：skill 触发但跳错步骤

打开 debug 看：
```bash
hermes --debug "今天早会准备"
```

看 LLM 的 reasoning 输出，找出它在哪一步偏了。

通常原因：
- SKILL.md 步骤描述模糊（用更具体的话）
- 工具名错（hermes 找不到那个工具）
- 配置字段没写（如 repos_to_check）

### Q：步骤 1 跑成功了但跳到步骤 5

加更明确的顺序提示：

```markdown
## 详细步骤

**必须按 1→2→3→4→5 顺序执行，不要跳过中间步骤。**

### 步骤 1: ...
[步骤 1 完成才能进步骤 2]
```

## 17.6 迭代

发现 skill 不完美？随时改。

```bash
hermes skills edit daily-standup-prep
```

改完保存 → 下次触发就用新版。版本号建议**手动升级**：

```yaml
---
version: 2
updated: 2026-05-20
changelog:
  - v2: Added Linear ticket integration
  - v1: Initial
---
```

## 17.7 发布到 agentskills.io

```bash
hermes skills publish daily-standup-prep
```

向导问：public / unlisted、tags、license（推荐 MIT）。

发布后：
- 别人能 `hermes skills install <url>` 装你的
- 你的 GitHub profile 自动有 contributor 徽章
- agentskills.io 上有公开页面，可分享

::: tip 发布前必做
- README.md 写清楚怎么用 + 配置
- 写完整 examples
- 删掉**所有个人信息**（API key / 邮箱 / 内部仓库路径）
- 至少自测 5 次
:::

## 17.8 高阶：带代码的 skill

简单 skill 纯 markdown。复杂的可带 Python / JS：

```
~/.hermes/skills/daily-standup-prep/
├── SKILL.md
├── handler.py              # 复杂逻辑写代码
├── templates/
│   └── output.md.j2       # Jinja2 输出模板
└── tests/
    └── test_handler.py
```

handler.py:
```python
from hermes_skill_sdk import skill, tools

@skill(name="daily-standup-prep")
async def run(date, config):
    commits = []
    for repo in config["repos_to_check"]:
        result = await tools.shell_exec(
            f"cd {repo} && git log --since='{date} 00:00' --oneline"
        )
        commits.append({"repo": repo, "log": result.stdout})

    events = await tools.api_call("google-calendar.list_events", date=date)
    emails = await tools.api_call("gmail.list", query="is:unread label:important")

    output = render_template("output.md.j2", commits=commits, events=events, emails=emails)

    await tools.send_message(
        channel=config["output_channel"],
        content=output
    )
    return {"ok": True, "summary": output}
```

复杂逻辑用代码更可靠。但**简单的纯 markdown 就够**——LLM 自己会读 markdown 决定怎么调工具。

## 17.9 skill 设计原则

✅ **好 skill 的特征**
- 单一明确的触发条件
- 步骤清晰可测
- 失败处理周全
- 配置可改不写死
- 输出格式明确

❌ **避免**
- 一个 skill 试图覆盖太多任务（拆分）
- 步骤写得太抽象（"分析数据"是啥意思？）
- 没考虑失败兜底
- 硬编码个人信息

---

## 看完这一章你应该知道

✅ 三种创建方式：模板 / 对话 / 手写
✅ SKILL.md 包含 schema + frontmatter + 步骤
✅ `hermes skills test` 验证触发
✅ trigger 词 / description 决定匹配度
✅ 复杂逻辑可带 Python / JS
✅ 发布到 agentskills.io 让别人用

---

**下一步**：[18. 40+ 内置工具一览 →](/hermes/advanced/tools)

skill 是"经验"，tool 是"动作"。下一章过一遍 Hermes 内置的 40+ 工具。
