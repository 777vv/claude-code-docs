# 31. 案例 7：训练数据生成

::: info 这个案例你将做（开发者向）
用 Hermes 内置的 **trajectory generation** 批量生成：
- agent ReAct 推理过程的完整轨迹
- 工具调用 → 结果 → 下一步推理 → ... 全链路
- 符合 SFT / DPO / RLHF 格式
- 5000 条数据 30 分钟搞定

适合：想微调自己的 agent 模型 / 做评估 / 研究的开发者。

**这是 Hermes 独家能力——其他 AI 工具完全没这功能。**
:::

::: tip 不写代码的可跳过本章
这是开发者向。如果你只想"用 AI"不"训 AI"，看下个案例就好。
:::

## 31.1 Trajectory 是什么

一条 trajectory = 一次任务的完整记录：

```jsonl
{
  "id": "traj_001",
  "user_query": "总结这篇 arxiv 论文",
  "trace": [
    {"step": 1, "type": "reasoning", "content": "需要先拉 PDF"},
    {"step": 2, "type": "tool_call", "tool": "fetch_url", "args": {...}, "result": "..."},
    {"step": 3, "type": "reasoning", "content": "现在解析 abstract"},
    {"step": 4, "type": "tool_call", "tool": "read_pdf", ...},
    {"step": 5, "type": "reasoning", "content": "整合成中文摘要"},
    {"step": 6, "type": "final_response", "content": "..."}
  ],
  "metadata": {
    "model": "deepseek-chat",
    "tokens": {"input": 12500, "output": 3200},
    "duration_ms": 45000,
    "success": true,
    "cost_usd": 0.018
  }
}
```

可以用来：
- **SFT 训练**：教新 agent 模型"该怎么干"
- **DPO**：成功 trajectory 是 chosen / 失败是 rejected
- **评估 benchmark**：测试新模型在你的场景上的表现
- **debug**：看 agent 怎么"想"的

## 31.2 默认就在记

Hermes 默认所有任务都记 trajectory（除非禁了）：

```yaml
# config.yaml
trajectory:
  enabled: true
  storage: ~/.hermes/data/trajectories.db
  retention_days: 90
  redact_pii: true             # 自动脱敏个人信息
```

跑了一段时间后：

```bash
hermes trajectory stats
```

```
Period: last 90 days

Total trajectories: 1,247
By outcome:
  ✓ Success: 1,089 (87%)
  ✗ Failed: 158 (13%)

By model:
  deepseek-chat: 823
  claude-sonnet-4-6: 224
  kimi-128k: 156
  others: 44

By task category (auto-classified):
  code-generation: 312
  research / summarization: 287
  data-analysis: 198
  multi-step automation: 167
  others: 283

Average tokens per trajectory:
  Input: 8,400
  Output: 2,100
```

## 31.3 导出 trajectory

```bash
hermes export trajectory \
  --since 2026-04-01 \
  --filter "outcome:success" \
  --format jsonl \
  --output ~/data/trajs.jsonl
```

参数：
- `--since` / `--until` 时间范围
- `--filter` 过滤（outcome / model / category / tools_used 等）
- `--format` jsonl / parquet / hf_dataset
- `--output` 输出路径

### 输出格式 jsonl（默认）

```jsonl
{"id":"traj_001","user_query":"...","trace":[...],"metadata":{...}}
{"id":"traj_002","user_query":"...","trace":[...],"metadata":{...}}
...
```

每行一个 trajectory，方便 stream 处理。

### 输出格式 hf_dataset

直接生成 Hugging Face datasets 可用的：

```bash
hermes export trajectory --format hf_dataset --output ~/data/my-trajs/
```

```python
# Python 加载
from datasets import load_from_disk
ds = load_from_disk("~/data/my-trajs")
print(ds[0])
```

## 31.4 批量生成（不只是被动记，主动跑）

如果想**有目的地生成** trajectory（不只是日常自然产生）：

### 方式 1：批量跑一组 prompts

`~/.hermes/batch/prompts.jsonl`:
```jsonl
{"id":"p001","query":"总结 https://arxiv.org/abs/X1"}
{"id":"p002","query":"总结 https://arxiv.org/abs/X2"}
{"id":"p003","query":"重构这个 react 组件: ..."}
{"id":"p004","query":"找 ~/code 里所有 deprecated 用法"}
...
```

```bash
hermes batch run prompts.jsonl \
  --parallel 5 \
  --output trajs.jsonl
```

- `--parallel 5`：5 个 subagent 并行
- 自动记每次 trajectory

### 方式 2：模拟用户

Hermes 内置 "user simulator"：

```bash
hermes batch generate \
  --user-profile "Python dev with 5y experience" \
  --domain "code-refactoring" \
  --count 5000 \
  --output 5000-refactoring-trajs.jsonl
```

User simulator 生成 5000 个真实风格的查询 → Hermes 执行 → 全部 trajectory 入库。**一晚上 5000 条**。

::: warning 用 simulator 注意
- 跑一晚上 5000 次 LLM 调用，**成本** ≈ ¥30-200（看模型）
- 必须设 budget 上限
- simulator 生成的查询和真实用户分布不完全一样
:::

## 31.5 用 trajectories 微调

最终目标——拿 jsonl 训自己的 agent 模型。

### 用 Unsloth / Axolotl 训

```python
# train.py
from unsloth import FastLanguageModel
from datasets import load_dataset

model, tok = FastLanguageModel.from_pretrained("meta-llama/Llama-3.1-8B")
ds = load_dataset("json", data_files="trajs.jsonl")

# 处理 trajectory 成训练格式
def format_traj(t):
    messages = [{"role":"user","content":t["user_query"]}]
    for step in t["trace"]:
        if step["type"] == "tool_call":
            messages.append({"role":"assistant","content":f"<tool>{step['tool']}({step['args']})</tool>"})
            messages.append({"role":"tool","content":step["result"]})
        elif step["type"] == "final_response":
            messages.append({"role":"assistant","content":step["content"]})
    return {"messages": messages}

ds = ds.map(format_traj)

# SFT 训
trainer = SFTTrainer(model, dataset=ds, ...)
trainer.train()
```

跑完得到一个**懂你工作流的小模型**。

### 用 Hermes 训完的模型

直接接回 Hermes：
```yaml
llm:
  providers:
    my-fine-tuned:
      type: openai-compatible
      base_url: http://localhost:8000/v1   # vllm 起的服务
      models: [my-llama-agent]
```

然后用：
```bash
hermes --model my-fine-tuned/my-llama-agent
```

省 LLM API 费 + 完全私有 + 懂你的风格。

## 31.6 评估：trajectory 当 benchmark

把同一批 prompts 在不同 model 跑出 trajectory，**对比谁好**：

```bash
hermes batch run prompts.jsonl --model deepseek-chat --output trajs-deepseek.jsonl
hermes batch run prompts.jsonl --model claude-sonnet-4-6 --output trajs-claude.jsonl
hermes batch run prompts.jsonl --model my-fine-tuned --output trajs-mine.jsonl

hermes trajectory compare \
  trajs-deepseek.jsonl trajs-claude.jsonl trajs-mine.jsonl \
  --metrics success_rate,avg_steps,cost,latency
```

```
                  success_rate    avg_steps   cost/query   avg_latency
deepseek-chat     0.86            6.2          ¥0.05        3.2s
claude-sonnet-4-6 0.94            5.8          ¥1.30        4.1s
my-fine-tuned     0.91            5.5          (本地)        2.8s
```

明确知道你的微调模型值不值得。

## 31.7 数据脱敏

Trajectory **包含完整对话**——可能含个人信息 / 密码 / 公司机密。

### 自动脱敏

```yaml
trajectory:
  redact:
    enabled: true
    patterns:
      - type: email
      - type: phone_cn
      - type: id_card_cn
      - type: api_key
      - type: ssh_private_key
      - regex: "MY_COMPANY_SECRET"
    action: replace
    placeholder: "[REDACTED]"
```

每次记 trajectory 时自动替换敏感模式。

### 导出前过滤

```bash
hermes export trajectory \
  --filter-sensitive \
  --redact-aggressive \
  --review-before-export      # 让你看一遍样本再保存
```

::: danger 千万别把 trajectory 直接上传 HuggingFace
不少人犯过这个错——上传的训练数据里有自己 API key / 邮箱 / 内部代码片段。
:::

## 31.8 共享 trajectory（贡献社区）

Hermes 社区有公共 trajectory 数据集，你可以贡献你的（脱敏后）：

```bash
hermes trajectory contribute \
  --dataset agentbench-2026 \
  --category code-refactoring \
  --license CC-BY-4.0 \
  --anonymize true
```

贡献后会显示在 [agentskills.io 数据集页面](https://agentskills.io/datasets)，被其他研究者使用。

## 31.9 监控 trajectory 质量

定期看哪些任务总失败 → 改 skill / prompt：

```bash
hermes trajectory analyze --since 7d --by-category
```

```
WEEK ANALYSIS

Category: code-refactoring
  Total: 124
  Success: 76 (61%)        ⚠️ 低
  Common failure: "infinite tool loop"
  Suggestion: review skill 'auto-refactor', might have a bug

Category: summarization
  Total: 287
  Success: 271 (94%)       ✓ 健康

Category: data-analysis
  Total: 198
  Success: 152 (77%)
  Common failure: "pandas import not available in modal backend"
  Suggestion: add pandas to modal image
```

诊断 + 改进流程闭环。

## 31.10 法律 / 合规

- ✅ 你**自己**的 trajectory 完全归你
- ⚠️ 包含**他人**对话的（如群聊） → 注意是否有同意
- ⚠️ 公开发布前**必须脱敏 + 审一遍**
- ⚠️ 商用训练数据有合规要求（看所在地法律）

---

## 看完这个案例你应该会

✅ Trajectory 是什么，能干啥
✅ 默认就在记，按需 export
✅ 批量生成 5000+ 条用 batch / simulator
✅ 用 trajectory 微调自己的 agent 模型
✅ 用于评估对比不同 model
✅ 严格脱敏避免泄露

---

**下一步**：[32. 案例 8：多 agent 并行调研 →](/hermes/cases/parallel-research)

下一个：Subagents 实战，5 路并行调研 + AI 汇总。
