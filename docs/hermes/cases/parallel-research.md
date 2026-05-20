# 32. 案例 8：多 agent 并行调研

::: info 这个案例你将做出来
让 Hermes 派 **5-10 个 subagent 同时调研** 同一个话题的不同角度：
- 一小时调研 10 家公司
- 一晚上扫 200 篇论文找规律
- 30 分钟生成全面对比报告

效率比单 agent 串行高 **5-10 倍**。

**Hermes 杀手特性之一**，OpenClaw / Claude Code 都做不到这种"研究级"并行。
:::

## 32.1 任务设定

我们做一个真实任务：

> 调研 5 家 AI 编程助手公司（Anthropic / OpenAI / Cursor / Replit / Cognition）：
> - 创始人背景
> - 最近 12 个月融资
> - 核心产品 + 定价
> - 用户增长 / GitHub stars
> - 最近 3 个月动态
> - 对 Hermes 的潜在威胁
>
> 1 小时内交付对比报告。

## 32.2 单 agent 做要多久

```bash
hermes "调研 [5 家公司]，每家深挖以上 6 个维度"
```

- 一家家调研，串行
- 调用 web_search → 拉网页 → 整理 → 下一家
- **预估时间**：每家 15 分钟，5 家 ≈ 75 分钟
- 而且 context 越填越满，后面调研质量下降

## 32.3 Subagent 并行做

```bash
hermes "
派 5 个 subagent 同时调研:
- subagent A: Anthropic
- subagent B: OpenAI
- subagent C: Cursor
- subagent D: Replit
- subagent E: Cognition

每个 subagent 用以下 schema:
- founders
- funding (last 12 months)
- products + pricing
- growth_metrics
- recent_news (last 3 months)
- threat_assessment

汇总成对比表。
"
```

Hermes 内部：
```
🚀 派 5 个 subagent...
   subagent-a [Anthropic]:    model=claude-sonnet-4-6, backend=local
   subagent-b [OpenAI]:       model=claude-sonnet-4-6, backend=local
   subagent-c [Cursor]:       model=deepseek-chat, backend=local
   subagent-d [Replit]:       model=deepseek-chat, backend=local
   subagent-e [Cognition]:    model=deepseek-chat, backend=local

⏳ 并发执行中（最大 5 个并发）...

[12 分钟后]

✓ subagent-a 完成 (Anthropic)
✓ subagent-b 完成 (OpenAI)
✓ subagent-c 完成 (Cursor)
✓ subagent-d 完成 (Replit)
✓ subagent-e 完成 (Cognition)

📋 主 agent 汇总成对比表:

| 维度 | Anthropic | OpenAI | Cursor | Replit | Cognition |
|---|---|---|---|---|---|
| Founders | Dario+Daniela | Sam Altman | Aman+Sualeh | Amjad Masad | Scott Wu |
| Funding 12M | $7.3B Series E | $6.6B | $400M Series C | $97M | $2B |
| ...

总耗时: 15 分钟（含主 agent 汇总）
成本: ¥6.5（5×subagent + 主 agent）
```

**15 分钟 vs 单 agent 75 分钟，5x 加速**。

## 32.4 进阶：异构 subagent（不同 model + backend）

不同任务难度给不同资源：

```yaml
subagents:
  pools:
    deep-research:
      model: claude-sonnet-4-6
      backend: modal           # 云端，独立沙箱
      max: 3

    quick-fact-check:
      model: deepseek-chat
      backend: local           # 便宜快
      max: 10
```

```
你: 调研 50 家创业公司:
   先用 quick-fact-check 池过一遍每家基础信息（5 维度），
   然后用 deep-research 池深挖 top 10 有潜力的。
```

Hermes 智能分配：
```
Stage 1 (quick-fact-check):
  10 个并发 × 5 分钟/家 = 25 分钟（50 家）
  每家成本 ¥0.10

Stage 2 (deep-research):
  3 个并发 × 20 分钟/家 = 70 分钟（top 10）
  每家成本 ¥3.50

总成本: 50 × ¥0.10 + 10 × ¥3.50 = ¥40
总时间: 25 + 70 = ~1.5h
单 agent 做要 30+ h
```

## 32.5 Subagent 互相协作

主 agent 不只是分发-汇总，还能让 subagent **互相校验**：

```
你: 调研 GPT-5 的 benchmark 数据：
  - subagent A 去官方网站抓
  - subagent B 去 OpenAI 博客抓
  - subagent C 去第三方评测站（HF / lmsys）抓

抓完互相对比，找出官方 vs 第三方差异
```

Hermes：
```
Stage 1: 3 个 subagent 并行抓数据
Stage 2: 主 agent 收 3 份数据
Stage 3: 派 1 新 subagent "对比员" 找差异
Stage 4: 主 agent 整合最终报告

总结:
官方报告 MMLU 92.3%，但 lmsys 测出来 89.1%。
差异原因（推测）:
- 官方用 5-shot, lmsys 用 0-shot
- 官方测试集可能有 contamination
建议引用第三方数据更可信。
```

完整 pipeline 30 分钟搞定。

## 32.6 实战配置

### config.yaml

```yaml
subagents:
  enabled: true
  max_concurrent: 10

  pools:
    fast-cheap:
      model: deepseek/deepseek-chat
      backend: local
      max: 10
      budget_per_run_usd: 0.10
      timeout: 5m

    deep-quality:
      model: anthropic/claude-sonnet-4-6
      backend: modal
      max: 3
      budget_per_run_usd: 1.00
      timeout: 30m

    private-isolated:
      model: ollama/qwen2.5:14b
      backend: docker
      max: 2

  worktree:
    enabled: true                # subagent 改代码时用
    base_dir: ~/.hermes/worktrees

  observability:
    log_each_subagent: true
    progress_update_interval: 30s
```

### 主 agent soul 加协调能力

```markdown
## 并行调研策略

收到调研任务时：
1. 拆分: 把任务拆成可并行的子任务（≤10 个）
2. 派单: 简单子任务用 fast-cheap pool，复杂的用 deep-quality
3. 监控: 每 30s 看进度，超时 / 失败的 subagent 替换或 skip
4. 汇总: 收齐结果后整合，找异常 / 矛盾
5. 校验: 重要发现派额外 subagent 验证
```

## 32.7 实时监控

跑长任务时看进度：

```bash
hermes subagent list --live
```

终端实时刷新：
```
ID        TASK                  POOL          STATUS     COST    ELAPSED  PROGRESS
sa_001    Anthropic 调研         deep-quality  running    $0.45   8m 23s   ▓▓▓▓▓▓░░ 75%
sa_002    OpenAI 调研            deep-quality  running    $0.52   8m 21s   ▓▓▓▓▓░░░ 60%
sa_003    Cursor 调研            fast-cheap    done       ¥0.08   3m 02s   ✓
sa_004    Replit 调研            fast-cheap    done       ¥0.06   2m 45s   ✓
sa_005    Cognition 调研         fast-cheap    running    ¥0.04   2m 18s   ▓▓▓▓▓▓▓░ 85%

Total: 3 running, 2 done | $0.97 + ¥0.18 spent | Avg ETA: 4 min
```

## 32.8 常见误用

### ❌ 子任务有依赖关系还派并行
```
错: subagent A 写代码，subagent B 测代码 ← B 需要等 A
对: A 完成后主 agent 再派 B（顺序而非并行）
```

### ❌ 子任务全用最贵 model
省钱设计：**杂活 deepseek，深度活 claude**。

### ❌ 不设 timeout
某 subagent 死循环跑一晚上 → 早起看账单哭。**永远设 timeout**。

### ❌ subagent 数 > 实际有用
调研 5 家公司派 20 subagent → 重复浪费。**每个 subagent 应有明确独立任务**。

## 32.9 跨工具组合：Hermes Subagent + Codex/Claude Code

让 subagent 调外部编程工具：

```
你: 派 3 个 subagent，每个负责 1 个仓库的迁移:
- subagent A: 把 repo-1 从 Vue 2 升 Vue 3，用 Codex
- subagent B: 把 repo-2 从 Python 3.8 升 Python 3.11，用 Claude Code
- subagent C: 把 repo-3 的 React 类组件改成 hooks，用 Codex
```

Hermes：
```
subagent A: shell_exec("codex --task '升 Vue 3'") in worktree-1
subagent B: shell_exec("claude --task '升 Python 3.11'") in worktree-2
subagent C: shell_exec("codex --task '改 hooks'") in worktree-3

并行 3 倍速完成 3 个仓库迁移。
```

详见 [33 章 联动其他工具](/hermes/cases/with-other-tools)。

## 32.10 资源 / 成本估算

按上述 5 家公司调研任务：

| 配置 | 时间 | 成本 |
|---|---|---|
| 单 agent 串行 deepseek | 75 min | ¥2 |
| 单 agent 串行 claude | 75 min | ¥30 |
| 5 subagent 全 deepseek | 15 min | ¥4 |
| 5 subagent 全 claude | 15 min | ¥60 |
| 异构（2 claude + 3 deepseek） | 15 min | ¥25 |

**异构是性价比之王**。

## 32.11 安全

10 个 subagent 同时跑 = 10 倍滥用风险。必做：

- [ ] 每个 subagent 设 `budget_per_run` 上限
- [ ] 跨 subagent 共享只读 storage
- [ ] subagent 不能改主 agent 配置
- [ ] 高危工具（shell / browser）按池配置 allow/deny
- [ ] 日志全留，定期审计

---

## 看完这个案例你应该会

✅ Subagent 并行做调研 5-10x 加速
✅ 异构 pool（fast-cheap + deep-quality）
✅ Subagent 互相协作（校验 / 对比）
✅ 实时监控进度
✅ 跨工具组合：subagent 调 Codex / Claude Code
✅ 安全清单不能少

---

**下一步**：[33. 案例 9：联动 Codex / Claude Code / OpenClaw →](/hermes/cases/with-other-tools)

下一个：把本站 4 个工具串起来跑组合工作流。
