# 8. 配置模型供应商

::: info 本章你将学到
- Hermes 的 provider 配置文件长什么样
- 怎么给不同任务用不同模型（路由策略）
- 模型自动 fallback / 降级
- 成本监控：每天烧了多少钱
- 实战配置示例（个人 / 团队 / 研究）
:::

## 8.1 配置文件在哪

`~/.hermes/config.yaml` —— 全站主配置文件。

API Key 走 `~/.hermes/.env`，yaml 用 `${ENV_VAR}` 引用。

## 8.2 完整 yaml 结构

```yaml
# ~/.hermes/config.yaml
llm:
  providers:
    deepseek:
      type: openai-compatible
      base_url: https://api.deepseek.com/v1
      api_key: ${DEEPSEEK_API_KEY}
      models:
        - name: deepseek-chat
          context_window: 64000
          max_output: 8000
        - name: deepseek-reasoner
          context_window: 64000
          max_output: 8000
          reasoning: true
      timeout: 60s
      max_retries: 3

    kimi:
      type: openai-compatible
      base_url: https://api.moonshot.cn/v1
      api_key: ${MOONSHOT_API_KEY}
      models:
        - name: moonshot-v1-128k
          context_window: 128000
        - name: moonshot-v1-32k
          context_window: 32000

    anthropic:
      type: anthropic
      api_key: ${ANTHROPIC_API_KEY}
      models:
        - name: claude-sonnet-4-6
        - name: claude-opus-4-7
      prompt_caching: true            # 启用 Anthropic 的 prompt cache

  default: deepseek/deepseek-chat
  fallback: kimi/moonshot-v1-32k

  # 全局 token 优化（详见 19 章 memory）
  optimization:
    dual_compression: true
    summary_after_turns: 20
    summary_model: deepseek/deepseek-chat   # 用便宜的模型做摘要

# 预算控制
budget:
  daily_limit_usd: 5
  monthly_limit_usd: 100
  action_on_exceed: warn              # warn / pause / block
```

## 8.3 type 字段取值

| type | 协议 | 适用 |
|---|---|---|
| `openai` | OpenAI 官方 | OpenAI |
| `openai-compatible` | OpenAI 协议（兼容版） | 99% 国内服务商 / Ollama |
| `anthropic` | Anthropic 原生 | Claude（有 prompt cache 等独家特性） |
| `google` | Google Gemini | Gemini |
| `bedrock` | AWS Bedrock | 企业 AWS |
| `minimax` | MiniMax 原生 | MiniMax |
| `nous-portal` | Nous 自家 | Nous Portal（OAuth） |

::: tip 99% 国产用 `openai-compatible`
中国主流 LLM 服务（DeepSeek/通义/Kimi/智谱）都兼容 OpenAI API 协议，统一用这个 type 配。
:::

## 8.4 多模型路由

不同场景用不同模型，省钱+提质。

### 方式 1：按 agent 配

```yaml
agents:
  default:
    model: deepseek/deepseek-chat

  research:                    # 调研 agent 用推理模型
    model: deepseek/deepseek-reasoner

  long-doc:                    # 长文档 agent 用 Kimi
    model: kimi/moonshot-v1-128k

  codegen:                     # 写代码用 Claude
    model: anthropic/claude-sonnet-4-6
```

跑某 agent：
```bash
hermes --agent research "调研这 5 个开源框架的对比"
```

### 方式 2：按任务类型自动路由（高级）

```yaml
llm:
  routing:
    rules:
      - match: { task_type: "long_document" }
        provider: kimi
        model: moonshot-v1-128k
      - match: { task_type: "code_generation" }
        provider: anthropic
        model: claude-sonnet-4-6
      - match: { task_type: "summarization" }
        provider: deepseek
        model: deepseek-chat
    fallback: deepseek/deepseek-chat
```

Hermes 自己判断任务类型，自动选模型。

### 方式 3：CLI 临时切

```bash
# 这次用 Claude
hermes --model anthropic/claude-sonnet-4-6 "重构这个项目"

# 这次用 Kimi 128K
hermes --model kimi/moonshot-v1-128k "总结这本 800 页的书"
```

## 8.5 模型 fallback / 降级

主 provider 挂了自动切到备份：

```yaml
llm:
  default: anthropic/claude-sonnet-4-6
  fallback:
    - kimi/moonshot-v1-32k            # 先试 Kimi
    - deepseek/deepseek-chat          # 再试 DeepSeek
    - ollama/qwen2.5:14b              # 最后本地

  fallback_triggers:
    - 429    # 限速
    - 500    # 服务器错
    - timeout
```

Anthropic 限速 / 不通时自动用 Kimi 续上。

## 8.6 成本监控

### 看本次会话花了多少

```bash
# 在 Hermes CLI 里：
> /cost
```

输出：
```
This session:
  - Tokens: 12,345 in / 4,567 out
  - Cost: ¥0.18
  - Model: deepseek/deepseek-chat

Today total:
  - 23 sessions
  - Cost: ¥3.45
```

### 看历史用量

```bash
hermes stats --period 7d
hermes stats --period 30d --by-model
```

### 预算上限

```yaml
budget:
  daily_limit_usd: 5
  monthly_limit_usd: 100
  per_model_daily:
    anthropic/claude-opus-4-7: 2     # 单 model 单日上限（贵的限严点）
    deepseek/deepseek-chat: 10
  action_on_exceed: pause            # 超额怎么办
```

`action_on_exceed`：
- `warn`：日志警告但继续跑
- `pause`：暂停该 model，继续用其他
- `block`：完全停止

## 8.7 Anthropic Prompt Caching（独家优化）

如果你用 Anthropic Claude，**强烈建议开 prompt_caching**：

```yaml
providers:
  anthropic:
    type: anthropic
    api_key: ${ANTHROPIC_API_KEY}
    prompt_caching: true
    cache_ttl: 5m                # 缓存 5 分钟
```

效果：
- 相同的 prompt prefix（如 system prompt）**只收 1/10 费用**
- Hermes 长 context 场景能省 **70%-90%** 成本
- 速度也快很多

::: tip 适用场景
- 长对话（system prompt 重复多）
- 多 subagent 共享前缀
- agent loop（每轮都把历史塞回去）

**实测**：跑一个 50 轮对话，开 cache 比不开省 ¥3-5。
:::

## 8.8 实战配置示例

### 配置 A：国内新手最小

```yaml
llm:
  providers:
    deepseek:
      type: openai-compatible
      base_url: https://api.deepseek.com/v1
      api_key: ${DEEPSEEK_API_KEY}
      models:
        - { name: deepseek-chat, context_window: 64000 }
  default: deepseek/deepseek-chat

budget:
  daily_limit_usd: 1
```

### 配置 B：国内进阶（多 provider）

```yaml
llm:
  providers:
    deepseek:
      type: openai-compatible
      base_url: https://api.deepseek.com/v1
      api_key: ${DEEPSEEK_API_KEY}
      models: [deepseek-chat, deepseek-reasoner]

    kimi:
      type: openai-compatible
      base_url: https://api.moonshot.cn/v1
      api_key: ${MOONSHOT_API_KEY}
      models: [moonshot-v1-32k, moonshot-v1-128k]

    minimax:
      type: minimax
      api_key: ${MINIMAX_API_KEY}
      group_id: ${MINIMAX_GROUP_ID}
      models: [MiniMax-M2]

  routing:
    rules:
      - match: { context_size_gt: 50000 }
        provider: kimi
        model: moonshot-v1-128k
      - match: { task_type: "reasoning" }
        provider: deepseek
        model: deepseek-reasoner
    fallback: deepseek/deepseek-chat
```

### 配置 C：国外质量优先

```yaml
llm:
  providers:
    anthropic:
      type: anthropic
      api_key: ${ANTHROPIC_API_KEY}
      models: [claude-sonnet-4-6, claude-opus-4-7]
      prompt_caching: true

    openai:
      type: openai
      api_key: ${OPENAI_API_KEY}
      models: [gpt-5, gpt-4o-mini]

  default: anthropic/claude-sonnet-4-6
  fallback: openai/gpt-4o-mini

budget:
  daily_limit_usd: 20
  per_model_daily:
    anthropic/claude-opus-4-7: 5
```

### 配置 D：研究 / 微调向

```yaml
llm:
  providers:
    nous-portal:
      type: nous-portal
      oauth_token: ${NOUS_OAUTH_TOKEN}
      models: [Hermes-3-405B, Hermes-3-70B]

    anthropic:
      type: anthropic
      api_key: ${ANTHROPIC_API_KEY}
      models: [claude-sonnet-4-6]
      prompt_caching: true

  default: nous-portal/Hermes-3-70B
  optimization:
    dual_compression: true
    summary_model: nous-portal/Hermes-3-70B
```

## 8.9 用 hermes model 交互式管理

不想编辑 yaml？

```bash
hermes model
```

交互菜单：
```
Current default: deepseek/deepseek-chat

Available models:
  ✓ deepseek/deepseek-chat (default)
    deepseek/deepseek-reasoner
    kimi/moonshot-v1-32k
    kimi/moonshot-v1-128k
    ollama/qwen2.5:14b

Actions:
  [1] Switch default
  [2] Add new provider
  [3] Remove provider
  [4] Test a provider
  [5] Edit budget
  [q] Quit

>
```

简单的 CRUD 操作。复杂的还是建议直接编辑 yaml。

## 8.10 常见报错

### `Provider 'xxx' not found`
yaml 里 `default` / `agent.model` 写的 provider id 在 `providers:` 里没定义。

### `Model 'xxx' not in provider's models list`
模型名拼写错。注意 `deepseek-chat` 不是 `deepseek-v3`。

### 阿里 DashScope `403 Forbidden`
base_url 写错。**对**：`https://dashscope.aliyuncs.com/compatible-mode/v1`

### Ollama `ECONNREFUSED`
ollama 没启。`ollama serve` 启动它。

### `Insufficient quota`
预算超了。改 `daily_limit` 或充值。

---

## 看完这一章你应该知道

✅ `~/.hermes/config.yaml` 配 LLM provider
✅ 不同 agent / 任务类型路由不同模型
✅ Fallback 让主模型挂了自动切备份
✅ Anthropic prompt_caching 省 70-90% 成本
✅ `budget` 防止账单暴涨
✅ `hermes model` 交互式管理

---

**下一步**：[9. hermes setup 向导走读 →](/hermes/setup/hermes-setup)

不喜欢手写 yaml？下章带你跑 `hermes setup` 交互式向导，自动生成 yaml。
