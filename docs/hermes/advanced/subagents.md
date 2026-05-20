# 21. Subagents + Worktree

::: info 本章你将学到
- 什么时候需要"派几个 subagent 同时干"
- Hermes 的 subagent 机制详解
- Git Worktree 在 Hermes 里的作用
- 实战：5 路并行调研 + 汇总
- 资源 / 成本 / 安全控制
:::

## 21.1 Subagent 是什么

**主 agent**：和你直接对话的那个 Hermes。
**Subagent**：主 agent **派生**出来执行特定任务的"子分身"。

每个 subagent：
- 独立 context（不污染主对话）
- 可独立 model（贵的活用 Claude，便宜的用 DeepSeek）
- 可独立 backend（本地 / Modal / SSH）
- 完成后把结果返还主 agent

### 单 agent vs subagent

| 场景 | 单 agent | Subagent |
|---|---|---|
| "调研 1 家公司" | ✅ | 用 subagent 过度 |
| "调研 5 家公司各自维度" | ❌ 串行慢 | ✅ 并行 5 倍快 |
| "写代码 + 跑测试 + 检查 lint" | ✅ 顺序就行 | 无需 |
| "扫 100 个文件找 bug" | ❌ context 爆 | ✅ 分发 |
| "同时跑 long-task A + 维持对话" | ❌ 阻塞 | ✅ 后台 |

## 21.2 真实案例

### 案例 A：并行调研

```
你: 调研 GPT-5 / Claude 4.6 / Gemini 3 / Llama 4 / Hermes-3 这 5 个模型，
   每个维度: 能力、定价、benchmark、社区动态、关键 use case。
   最后汇总成对比表。

Hermes:
🚀 启动 5 个 subagent 并行调研...

[Subagent A] GPT-5 ............ 4m 23s ✓
[Subagent B] Claude 4.6 ....... 3m 51s ✓
[Subagent C] Gemini 3 ......... 5m 12s ✓
[Subagent D] Llama 4 .......... 4m 02s ✓
[Subagent E] Hermes-3 ......... 3m 18s ✓

📊 5 个调研完成（总 5m，串行要 25m+）。
汇总成 markdown 对比表...

| 维度 | GPT-5 | Claude 4.6 | Gemini 3 | Llama 4 | Hermes-3 |
|---|---|---|---|---|---|
| ...
```

### 案例 B：扫代码找 bug

```
你: 扫一遍这个 monorepo（约 200 个 Python 文件），
   找出所有"可能的 race condition"

Hermes:
分批派 subagent，每个负责 ~20 文件...
[Subagent 1-10] 并行扫描中...

发现 7 处可疑：
1. apps/api/auth.py:42 ...
2. ...
```

### 案例 C：后台长跑 + 主对话

```
你: 训练这个微调任务，预计 2 小时

Hermes:
派 subagent 到 modal backend 跑训练（后台），
你可以继续和我聊别的，训完通知你。

你: 那同时帮我看一下今天的会议安排
Hermes: [回应主对话，subagent 后台继续训]

[2h 后]
[Subagent: 训练完成] checkpoint 在 modal://xxx
```

## 21.3 配置 subagent

`~/.hermes/config.yaml`：

```yaml
subagents:
  enabled: true
  max_concurrent: 10                # 同时最多 10 个
  default_model: deepseek/deepseek-chat
  default_backend: local
  default_timeout: 30m
  isolation: true                   # 独立 context（强烈建议 true）

  # 资源上限（防止失控）
  budget:
    per_subagent_usd: 1            # 单个 subagent 上限
    total_concurrent_usd: 5         # 同时跑的总和上限
```

## 21.4 显式派 subagent

你可以**直接命令**派几个 subagent：

```
你: 派 3 个 subagent:
   - subagent A: 调研 OpenAI 最近的发布
   - subagent B: 调研 Anthropic 最近的发布
   - subagent C: 调研 Google AI 最近的发布
   都用 deep-research toolset，30 分钟内汇总

Hermes:
✓ 派 A (deepseek/deepseek-reasoner)
✓ 派 B (anthropic/claude-sonnet-4-6)
✓ 派 C (deepseek/deepseek-chat)
[全部启动，等待结果...]
```

### CLI 方式

```bash
hermes subagent spawn \
  --task "调研 OpenAI 最近发布" \
  --model anthropic/claude-sonnet-4-6 \
  --backend local \
  --timeout 30m
```

返回 subagent id：
```
✓ Spawned: sa_abc123
```

查看：
```bash
hermes subagent list
hermes subagent logs sa_abc123
hermes subagent kill sa_abc123     # 强制终止
```

## 21.5 自动派 subagent（高级）

主 agent 自己判断"这任务该不该派 subagent"。soul 配置：

```markdown
# soul.md

## 并行策略
当任务满足以下条件**自动**派 subagent:
- 任务可拆分为 ≥3 个独立子任务
- 每个子任务预估 > 2 分钟
- 子任务互不依赖
- 当前并发 < max_concurrent

当满足时:
1. 告诉用户准备派 N 个 subagent
2. 等用户 OK 后真的派
3. 等所有返回再汇总
```

## 21.6 Worktree 是什么

**Git Worktree** = git 原生功能。同一个仓库可以同时 checkout 多个分支到不同目录。

Hermes 用 worktree 来**让多个 subagent 同时在同一仓库工作而互不干扰**。

### 没 worktree 的问题

```
Subagent A: 修 bug #1 → checkout feature/fix-bug-1
Subagent B: 同时修 bug #2 → checkout feature/fix-bug-2
```

两个 subagent 在同一目录切分支会冲突。

### 有 worktree

```bash
# 仓库 ~/projects/my-app
# 主 worktree: ~/projects/my-app (main 分支)
# Worktree A: ~/projects/my-app-bug1 (fix-bug-1 分支)
# Worktree B: ~/projects/my-app-bug2 (fix-bug-2 分支)

Subagent A: cd ~/projects/my-app-bug1, 改代码
Subagent B: cd ~/projects/my-app-bug2, 改代码
```

完全隔离。

### Hermes 自动管 worktree

```yaml
subagents:
  worktree:
    enabled: true
    base_dir: ~/.hermes/worktrees
    auto_cleanup: after_merge      # PR 合并后自动删 worktree
```

派 subagent 改代码：
```
你: 同时修这 3 个 bug，提 3 个 PR

Hermes:
派 3 subagent，每个用独立 worktree:
- ~/.hermes/worktrees/bug-1 (fix/bug-1 分支)
- ~/.hermes/worktrees/bug-2 (fix/bug-2 分支)
- ~/.hermes/worktrees/bug-3 (fix/bug-3 分支)

[改完，PR 合并后自动删 worktree]
```

## 21.7 subagent 间共享信息

默认独立 context。但需要共享时：

### 方式 1：通过主 agent 转发

主 agent 收到 subagent A 的结果，发给 subagent B。手动协调。

### 方式 2：共享 storage

```yaml
subagents:
  shared_storage:
    type: sqlite
    path: ~/.hermes/subagent-shared.db
```

任何 subagent 都能 `await ctx.storage.set/get(key, value)`。

### 方式 3：消息传递

```
subagent A: await ctx.send_to("subagent-B", {"data": ...})
subagent B: data = await ctx.receive("subagent-A")
```

## 21.8 多 model 编排

省钱+提质同时做到：

```yaml
subagents:
  pools:
    cheap-research:
      model: deepseek/deepseek-chat
      max: 10                # 最多 10 个并发
      use_for: ["简单调研", "数据收集"]

    quality-analysis:
      model: anthropic/claude-sonnet-4-6
      max: 3
      use_for: ["深度分析", "对比报告", "代码 review"]

    local-private:
      model: ollama/qwen2.5:14b
      max: 2
      use_for: ["处理敏感数据"]
```

主 agent 根据任务类型派对应 pool。

## 21.9 资源 / 成本控制

```yaml
subagents:
  budget:
    per_subagent_usd: 1
    per_session_usd: 10        # 单次主对话所有 subagent 总和
    daily_total_usd: 50
    action_on_exceed: kill     # warn / pause / kill

  resource:
    max_concurrent: 10
    max_per_pool:
      cheap-research: 10
      quality-analysis: 3

  timeout:
    default: 30m
    max: 4h                    # 超过 4h 强制 kill
```

## 21.10 安全

⚠️ **每个 subagent 都有完整的工具权限**。意味着：
- 10 个并行 subagent = 10 倍滥用风险
- 一个被 prompt injection 攻击 = 整体危险

**必做**：
```yaml
subagents:
  per_subagent:
    isolation: docker            # 各跑独立 docker 容器
    tools_allow_override: false  # subagent 不能改主 agent 的工具白名单
    require_confirm_inherit: true # 继承主 agent 的 confirm 规则
```

## 21.11 监控

实时看所有 subagent：

```bash
hermes subagent list --live
```

输出（动态更新）：
```
ID        TASK             MODEL              BACKEND   STATUS    COST    ELAPSED
sa_001    调研 GPT-5       claude-sonnet-4-6  local     running   $0.12   2m 30s
sa_002    调研 Claude 4.6  deepseek-chat      local     running   ¥0.08   2m 28s
sa_003    扫文件 batch 1   deepseek-chat      modal     running   $0.03   1m 12s
...

Total: 5 running, $0.31 + ¥0.15 spent
```

## 21.12 常见误用

### ❌ "subagent 越多越好" 综合症
派 50 个 subagent 干 1 小时任务 → 上下文管理失控、成本爆炸。
**经验法则**：并发 ≤ 10，每个任务能 5 分钟内完成。

### ❌ 给每个 subagent 都用 Claude Opus
省钱的本意没了。**用便宜模型干杂活，贵模型只汇总**。

### ❌ subagent 失败不处理
设 `action_on_subagent_fail: skip / retry / abort_all`。

### ❌ 没有 timeout
某 subagent 死循环跑一晚上 → 早上看账单哭。**永远设 timeout**。

## 21.13 vs OpenClaw 的多 agent

| | OpenClaw 多 agent | Hermes Subagents |
|---|---|---|
| 目的 | 多场景分工（个人助理 / 编程助手） | 单任务并行加速 |
| 生命周期 | 长跑（agent 一直存在） | 短跑（任务完成即销毁） |
| 数量 | 通常 1-5 个 | 单任务可派 10+ |
| 适合 | 不同 IM / 不同人格 | 调研 / 扫描 / 并行处理 |

**两者可同时用**：你有一个长跑"个人助理" agent，它在调研任务时派 10 个 subagent 加速。

---

## 看完这一章你应该知道

✅ Subagent = 主 agent 派生的临时执行单元
✅ 适合"任务可并行"场景
✅ 每个独立 context / model / backend
✅ Worktree 让多 subagent 改同一仓库不冲突
✅ Pool / Budget / Timeout 三件套防失控
✅ Hermes Subagents ≠ OpenClaw 多 agent（不同概念）

---

## 进阶篇结束 🎉

你已经掌握 Hermes 的全部核心进阶能力。
下面 3 章是**国内适配**，国内用户必读；后 10 章是**实战案例**。

**下一步**：[22. 国内 LLM 接入 →](/hermes/china/models)
