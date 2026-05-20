# 16. Skills 自改进系统

::: info 本章你将学到
- 为什么 Skills 是 Hermes 区别于其他 agent 的杀手特性
- 自动生成 skill 的触发机制
- agentskills.io 开放标准
- 怎么查看 / 编辑 / 删除 / 分享你的 skills
- 怎么主动让 Hermes 学一个新流程
:::

## 16.1 回顾：Skill 是什么

[2 章](/hermes/intro/concepts) 讲过。再快速过一遍：

**Skill = Hermes 从过往任务里总结的 markdown 文件，记录"做某类任务的最佳路径"。**

下次遇到同类任务，Hermes 直接读 skill 不绕路。

跟 OpenClaw 的 skill 不同：
- **OpenClaw skill**：你或第三方手写的"工具包"
- **Hermes skill**：Hermes **自己**写的"经验沉淀"

## 16.2 真实样本：Hermes 自己写的 skill 长这样

`~/.hermes/skills/summarize-arxiv-paper.md`：

```markdown
---
name: summarize-arxiv-paper
version: 3
description: 给一个 arxiv URL，输出中文摘要+5 关键点+推荐理由
created: 2026-04-15
updated: 2026-05-08
times_used: 12
success_rate: 0.92
---

# 总结 arxiv 论文

## 触发条件
用户消息包含 arxiv.org URL 或 "总结...论文"

## 步骤
1. 用 fetch_url 拿 PDF（注意:abs/ 改成 pdf/）
2. 调用 read_pdf 提取 abstract / introduction / conclusion
3. 判断作者所属机构（top-tier 加权）
4. 输出格式如下

## 输出模板
{
  title_zh: 中文翻译,
  authors: [...],
  affiliation: 主要单位,
  key_points: [5 个 bullet],
  relevance_to_user: 1-10 (基于 user.md 兴趣对比)
}

## 已知坑
- v1 vs v2 版本要看 dateline 取最新
- 公式抽不出来，跳过即可
- 作者列表>10 人时只取前 3 + et al.
- 中文翻译的术语对照表见 user.md 偏好

## 失败模式
- PDF 加密 → 报错+建议人工
- abstract 缺失 → 用 introduction 替代
- 网络超时 → retry 3 次
```

看到的元数据：
- `times_used: 12` —— 用过 12 次
- `success_rate: 0.92` —— 12 次中 11 次成功
- `version: 3` —— 第 3 版（每次失败后自我迭代）
- `updated: 2026-05-08` —— 上次改进时间

## 16.3 自动生成 skill 的触发条件

默认配置下，Hermes 满足以下任一条件**自动**生成 skill：

| 触发 | 含义 |
|---|---|
| **`min_tool_calls: 5`** | 任务调用了 ≥5 个工具 |
| **重复模式检测** | 你过去 N 天做过 ≥3 次相似任务 |
| **显式命令** | "把刚才那个流程存成 skill" |
| **任务复杂度评分** | LLM 觉得"这个流程值得记下来" |

### 看自动生成日志

```bash
hermes logs search "auto-skill" --since 7d
```

输出：
```
2026-05-15 10:23: Auto-skill 'debug-pytest-failure' generated
2026-05-16 14:45: Auto-skill 'arxiv-summary' updated (v2 → v3)
2026-05-18 09:12: Auto-skill 'weekly-report' generated
```

### 调整触发阈值

```yaml
# ~/.hermes/config.yaml
memory:
  auto_skill_generation:
    enabled: true
    min_tool_calls: 5            # 默认 5
    min_repeat_count: 3          # 重复模式 3 次触发
    min_session_minutes: 2       # 任务持续 ≥2 分钟才考虑
    review_before_save: false    # true = 生成后让你确认
```

::: tip review_before_save 适合谨慎玩家
开了之后，Hermes 生成 skill 会先给你看一眼：
```
🧬 我想存这个 skill:
   name: summarize-arxiv
   triggers: arxiv.org URL
   steps: ...
保存？[Y/n/edit]
```
:::

## 16.4 主动让 Hermes 学一个流程

不想等自动？直接说：

```
你: 把刚才整理 ~/Documents PDF 的流程存成 skill，
   名字叫 "organize-pdfs-by-content"

Hermes:
好的，我会从最近的对话提炼步骤生成 skill...

🧬 已生成 ~/.hermes/skills/organize-pdfs-by-content.md
   触发条件: "整理 X 目录的 PDF" 类提问
   核心步骤: 5 步
   预计省时: 下次约快 60%
```

或更细：

```
你: 教你一个流程: 每次有人在 GitHub 给我提 issue:
    1. 标 priority label (P0-P3)
    2. 如果是 bug 试着复现
    3. 找最相关的代码 owner
    4. 在 issue 里 @ 那个人
    把这个存成 skill
```

Hermes 把你的话直接转成 skill。

## 16.5 查看 / 管理 skill

### 列出全部

```bash
hermes skills list
```

输出：
```
NAME                       VERSION   TIMES_USED   SUCCESS_RATE   LAST_USED
summarize-arxiv-paper      3         12           0.92           2d ago
debug-pytest-failure       2         8            0.75           5d ago
organize-pdfs-by-content   1         3            1.00           1h ago
weekly-report-generator    1         4            1.00           3d ago
```

### 查看详情

```bash
hermes skills view summarize-arxiv-paper
```

输出 markdown 全文。

### 编辑

```bash
hermes skills edit summarize-arxiv-paper
```

打开默认 `$EDITOR` 编辑。改完保存自动生效。

### 删除

```bash
hermes skills remove debug-pytest-failure --confirm
```

### 禁用（不删）

```bash
hermes skills disable summarize-arxiv-paper
```

Hermes 不会再用它，但文件还在。

## 16.6 agentskills.io 开放标准

Hermes 生成的 skill 符合 [agentskills.io](https://agentskills.io) 标准——这意味着：

- ✅ **跨工具可移植**：理论上能在其他兼容 agent 上跑
- ✅ **可分享**：发布到 agentskills.io 让别人下
- ✅ **可下别人写的**

### 标准格式（简化）

```markdown
---
schema: agentskills/v1
name: <skill-name>
description: ...
triggers: [...]
inputs:
  - name: ...
    type: ...
outputs:
  - name: ...
    type: ...
tools_used: [list_dir, read_pdf, ...]
---

# Skill 标题

## 触发条件
...

## 步骤
1. ...
```

### 发布到 agentskills.io

```bash
hermes skills publish summarize-arxiv-paper
```

向导：
```
? Authenticate with agentskills.io? [Y/n]
  > Y
[Opens browser for OAuth]

? Public or unlisted?
  ❯ Public (community can discover)
    Unlisted (only with link)

? Tags (comma-separated):
  > arxiv,research,summarization

✓ Published: https://agentskills.io/skills/your-handle/summarize-arxiv-paper
```

### 安装别人的 skill

```bash
# 从 URL
hermes skills install https://agentskills.io/skills/anthropic/code-review

# 或从浏览的复制
hermes skills install agentskills://debug-react-hooks
```

::: warning 第三方 skill 必看源码
agentskills.io 没有官方审核。装前看 SKILL.md + 实际逻辑，避免恶意 skill。详见 [15 章](/hermes/ops/security-checklist#_15-4-🟡-skill-安全)。
:::

## 16.7 Skill 进化机制

每次用 skill 完成任务后，Hermes 会：

1. **记录用量** —— times_used + 1
2. **判断成功** —— success_rate 更新
3. **看是否要改进** ——
   - 失败率 > 30% → 自动 review + 修正
   - 用户说"上次那个 skill 漏了 X" → 直接改

进化日志：

```bash
hermes skills history summarize-arxiv-paper
```

```
v1 (2026-04-15): Created from session abc123
v2 (2026-04-22): Added "处理加密 PDF" 失败模式
v3 (2026-05-08): Improved 中文翻译术语对照逻辑
```

可以回滚：

```bash
hermes skills rollback summarize-arxiv-paper --to v2
```

## 16.8 跨 agent 共享 skill

一个 Hermes 实例下可以有多个 agent。skill 默认归个人，但能共享：

```yaml
# ~/.hermes/config.yaml
skills:
  scope: shared              # 默认: per_agent / shared
```

或单独标某 skill 是共享：

```markdown
---
name: summarize-arxiv-paper
shared: true             # ← 所有 agent 都可用
---
```

## 16.9 Skill 性能优化

Hermes 用 skill 时**不是把全文塞进 prompt**——它只塞触发条件 + 关键步骤摘要。

控制：

```yaml
skills:
  context_budget_tokens: 2000       # 单 skill 注入预算
  matching_threshold: 0.65          # 触发相似度
  parallel_match: true              # 多 skill 并行匹配
```

skill 多了 ≥ 50 个开始要调整。

## 16.10 我应该自己写 skill 还是等 Hermes 自动写

**等自动**：
- 你完全不知道流程长啥样
- 重复任务很少
- 用 < 1 个月

**自己写**：
- 流程在你脑子里清晰
- 想立刻有效（不想等 Hermes 自己学）
- 想分享 / 商业化

下一章详讲怎么自己写一个。

---

## 看完这一章你应该知道

✅ Skill = Hermes 自动从过往任务沉淀的"经验文件"
✅ 默认 5+ 工具调用的任务触发自动生成
✅ 可主动命令"存成 skill"
✅ `hermes skills list/view/edit/remove` 管理
✅ agentskills.io 是开放标准，可分享 / 下别人写的
✅ skill 自带版本和成功率，自动迭代改进

---

**下一步**：[17. 写你自己的 Skill →](/hermes/advanced/write-skill)

不等自动生成？下一章手把手教你写一个 skill。
