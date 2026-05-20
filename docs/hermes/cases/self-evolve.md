# 25. 案例 1：自进化日记

::: info 这个案例你将看到
- Hermes 用一周后**自动**生成的 10+ 个 skill
- 怎么观察、对比、引导 Hermes 进化方向
- 把 self-improving 玩到极致的 5 个实践技巧
- 真实"进化前 vs 进化后"对比

**这个案例是 Hermes 独有的——其他 AI 工具完全做不到。**
:::

## 25.1 实验设置

我们做一个真实实验：
- 一台干净 Hermes（默认配置）
- 一个真实用户（每天用 30+ 分钟）
- 完全不手写 skill / memory
- 7 天后看 `~/.hermes/skills/` 长什么样

## 25.2 Day 1：基线（什么都没有）

```bash
ls ~/.hermes/skills/
```
```
（空）
```

```bash
hermes "总结这篇 arxiv 论文: https://arxiv.org/abs/2403.xxxxx"
```

Hermes 第一次做这事：
```
🛠️ fetch_url → PDF...
🛠️ read_pdf → 抽取
🛠️ web_search → 验证作者机构
🛠️ run_python → 处理一些数学符号
🛠️ LLM 生成摘要

(耗时 4m 23s, 12 次工具调用)

📋 论文摘要：...
```

**任务复杂度 ≥ 5 工具调用，触发自动 skill 生成**。

24h 后看：
```bash
ls ~/.hermes/skills/
```
```
summarize-arxiv-paper.md         # ← 自动产生
```

## 25.3 Day 3：开始有"重复模式"

第 3 天，做了几次类似 arxiv 总结后：

```bash
hermes "总结 https://arxiv.org/abs/2404.xxxxx"
```

这次：
```
🧬 Using skill: summarize-arxiv-paper (v1)
🛠️ fetch_url ...
🛠️ read_pdf ...

(耗时 1m 50s, 5 次工具调用)        ← 速度 2 倍快
```

skill 在用了。

同期生成的还有：
```
~/.hermes/skills/
├── summarize-arxiv-paper.md       (used 5x)
├── debug-pytest-failure.md        ← Day 2 跑 pytest 失败时学的
└── git-changelog-this-week.md     ← Day 3 给项目生成 changelog 时学的
```

## 25.4 Day 7：Skill 已成体系

一周后：

```bash
hermes skills list
```

```
NAME                              VERSION   USES   SUCCESS   LAST_USED
summarize-arxiv-paper             3         8      0.88      yesterday
debug-pytest-failure              2         5      0.80      3d ago
git-changelog-this-week           1         3      1.00      yesterday
review-react-component            1         4      0.75      4d ago
extract-action-items-from-email   1         2      1.00      2d ago
generate-pr-description           2         4      1.00      today
fix-typescript-type-errors        1         3      0.67      5d ago
weekly-arxiv-digest               1         1      1.00      yesterday
analyze-redis-slow-query          1         1      1.00      4d ago
plan-feature-implementation       1         2      0.50      6d ago
```

**10 个 skill，全自动**。

## 25.5 看一个 skill 是怎么"进化"的

```bash
hermes skills history summarize-arxiv-paper
```

```
v1 (Day 1, after first use)
  - Basic skeleton from successful first run
  - Steps: fetch PDF → extract sections → summarize
  - 1 known issue: latex math symbols

v2 (Day 3, after a v1 failure)
  - Added: handling of encrypted PDFs (give up gracefully)
  - Added: fallback to arxiv abstract API if PDF fails
  - Success rate: 65% → 78%

v3 (Day 5, after user feedback)
  - User said "summary 太长了" → adjusted: max 5 bullets, each ≤ 30 chars
  - Added: 作者所属机构 weighting (top-tier 加权)
  - Success rate: 78% → 88%
```

每次失败 / 用户纠正都让 skill 自我修订。

## 25.6 自己引导进化方向

Hermes 自学速度快，但**方向需要你引导**。技巧：

### 技巧 1：show, don't tell

```
你: （第一次让它做某事）打开 Logseq 把今天的笔记按标签分类

[Hermes 跑了 8 个工具调用完成]

你: 把刚才的过程存成 skill，叫 organize-logseq-by-tag
```

主动命名 + 主动存。Hermes 立刻有这个 skill，不用等自然学。

### 技巧 2：纠错时直接说

```
你: 这个 arxiv summary skill 漏了一点 —— "method" 部分应该单独摘一段，
   你之前都跳过了。改一下 skill。

Hermes:
更新 summarize-arxiv-paper:
+ 新加: 步骤 4. 单独摘 method 部分（重点 + 局限）
版本 v3 → v4
```

明确告诉它哪里错。它自我修订。

### 技巧 3：定期 review

每周日晚跑：

```bash
hermes skills review --since 7d
```

输出：
```
🧬 Skills evolution this week:

Created (3):
  - new-skill-A
  - new-skill-B
  - new-skill-C

Improved (2):
  - existing-skill-X (v2 → v3)
  - existing-skill-Y (v1 → v2)

Failed often (warning, success < 60%):
  - flaky-skill-Z (4 uses, 50% success)
    → 建议: 看 logs 找原因，或 disable
```

主动 disable 表现不好的，避免 LLM 老用错的。

### 技巧 4：分享和导入

把你团队人写好的 skill 互相分享：

```bash
# 我导出
hermes skills export summarize-arxiv-paper --output mine.tar.gz

# 同事导入
hermes skills import mine.tar.gz
```

或发到 agentskills.io。

### 技巧 5：领域专家化

让 Hermes 专精某个领域：

```
你: 我接下来一周专注做"React 性能优化"。
   你帮我建一个 react-perf agent，
   所有这类任务都派给它处理，让它快速积累 skill。
```

```bash
hermes agent create react-perf --soul ./react-perf-soul.md
hermes "@react-perf 帮我分析 ProfilerProvider 的性能"
```

一周后 react-perf agent 的 skill 全是关于 React 优化的。**比通用 agent 在这领域强 10 倍**。

## 25.7 真实进化日记摘录

社区一位重度用户分享的（已脱敏）：

```
Week 1: 用了 5 天，3 个 skill 自动产生
  - summarize-arxiv
  - debug-pytest
  - generate-pr-desc

Week 2: 10 个 skill，开始用 Honcho 推断
  - 加上了 fix-typescript-types
  - 加上了 weekly-report
  - Honcho: "用户深度 TypeScript / 偏好简洁回复"

Week 4: 25 个 skill，能感觉到 Hermes "变快"
  - 复杂任务从 4 分钟降到 1 分钟
  - 风格匹配越来越准（不用每次说"简洁点"）

Week 8: 47 个 skill，开始有跨 skill 复用
  - "weekly-report" 会调 "git-changelog-this-week"
  - "fix-typescript-types" 会调 "lint-and-format"
  - 高阶 skill 由低阶组合，自动涌现

Month 3: 80 个 skill, Hermes 像"了解我 2 年的同事"
```

## 25.8 进化是否会"走偏"

可能。常见走偏：

### ❌ 学了坏习惯
你某次让 Hermes 跳过测试 → 它学了"测试可以跳"。
**修复**：明确告诉 "那是一次性的，不要常规跳测试"。

### ❌ Skill 互相矛盾
两个 skill 都试图处理"代码 review"但策略不同。
**修复**：手动 review skill 列表，合并矛盾的。

### ❌ 老 skill 没更新
半年前学的 skill 用了过时的 API。
**修复**：定期 `hermes skills review --since 90d` 看哪些老 skill 失败率涨了。

### ❌ Honcho 画像偏了
你工作变了但 Honcho 还按旧画像。
**修复**：`hermes memory honcho --reset`。

## 25.9 给"完全没耐心等进化"的人

```bash
hermes skills bootstrap --from agentskills.io --user-style ./user.md
```

从 agentskills.io 上拉一批适合你画像的 skill 起步，**跳过冷启动**。

## 25.10 进化的成本

**进化本身花 token**：
- 自动 skill 生成：每次 ~¥0.05（需要 LLM 反思任务）
- Honcho 训练：每周后台跑约 ¥1
- Skill 改进：失败时触发，~¥0.03/次

总：**每月约 ¥10-30** 用于"进化"。换来下次任务快 50%+ 显著值。

---

## 看完这个案例你应该知道

✅ Hermes 用得越久，自动 skill 越多
✅ 一周 10 个、一个月 25 个、三个月 80 个（典型节奏）
✅ 主动用 5 个技巧引导方向：show / 纠错 / review / 分享 / 专家化
✅ 进化可能走偏，定期 review + reset
✅ 这是**其他 AI 工具完全做不到的**

---

**下一步**：[26. 案例 2：多 backend 实战 →](/hermes/cases/multi-backend)

第一个案例看完进化，下一个看 Hermes 的**另一独家特性**：多 backend 灵活调度。
