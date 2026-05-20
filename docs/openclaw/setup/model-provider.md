# 8. 配置模型供应商

::: info 本章你将学到
- OpenClaw 的 provider 配置文件长什么样
- 怎么同时配多家 LLM（DeepSeek + Claude + Ollama 同时上）
- 怎么给不同 Agent 用不同模型
- 成本监控：怎么知道每天烧了多少钱
- 切换默认模型 / 单次调用临时换模型
:::

## 8.1 什么是 "Provider"

OpenClaw 把每家 LLM 公司叫一个 **provider**（供应商）。比如：
- DeepSeek 是一个 provider
- OpenAI 是一个 provider
- Anthropic 是一个 provider
- Ollama 本地也是一个 provider

**关键点**：你可以**同时配多个 provider**。比如：
- 平时聊天用 DeepSeek（便宜）
- 写复杂代码切到 Claude（质量好）
- 涉及敏感数据用 Ollama（不出本机）

OpenClaw 帮你统一调度，应用层无感。

## 8.2 Provider 配置在哪

`~/.openclaw/workspace/providers.yaml`

如果文件不存在，新建一个。下面是完整示例（**包含多家供应商同时配置**）：

```yaml
providers:
  # ============== 国内 ==============
  - id: deepseek
    type: openai-compatible      # DeepSeek 是 OpenAI 兼容协议
    base_url: https://api.deepseek.com/v1
    api_key: ${DEEPSEEK_API_KEY}
    models:
      - name: deepseek-chat       # 主力对话模型
        context_window: 64000
        max_output: 8000
      - name: deepseek-reasoner   # 推理增强模型
        context_window: 64000
        max_output: 8000
        reasoning: true

  - id: qwen
    type: openai-compatible
    base_url: https://dashscope.aliyuncs.com/compatible-mode/v1
    api_key: ${DASHSCOPE_API_KEY}
    models:
      - name: qwen-plus
        context_window: 131000
      - name: qwen-max
        context_window: 32000

  # ============== 国外 ==============
  - id: anthropic
    type: anthropic
    api_key: ${ANTHROPIC_API_KEY}
    models:
      - name: claude-sonnet-4-6
        context_window: 200000
      - name: claude-opus-4-7
        context_window: 200000

  - id: openai
    type: openai
    api_key: ${OPENAI_API_KEY}
    models:
      - name: gpt-5
        context_window: 200000
      - name: gpt-4o-mini
        context_window: 128000

  # ============== 本地 ==============
  - id: ollama
    type: openai-compatible
    base_url: http://localhost:11434/v1
    api_key: ollama                # Ollama 不验证，随便填
    models:
      - name: qwen2.5:7b
        context_window: 32000
      - name: deepseek-r1:8b
        context_window: 32000

# 默认 Agent 用哪家 provider 的哪个模型
default:
  provider: deepseek
  model: deepseek-chat
```

::: tip 你不需要全配
**新手只配一个就行**——把你 7 章申请到的那家加进去即可。等以后想扩展再加。
:::

## 8.3 字段详解

```yaml
- id: deepseek               # 唯一标识，自取，后面 Agent 配置会引用
  type: openai-compatible    # 协议类型，下面表会讲
  base_url: https://...      # API 地址
  api_key: ${DEEPSEEK_API_KEY}  # 从 .env 读取
  models:
    - name: deepseek-chat    # 这家 provider 提供的具体模型名
      context_window: 64000  # 上下文窗口大小（token）
      max_output: 8000       # 单次输出最大 token
      reasoning: false       # 是否是推理模型
```

### `type` 字段取值

| type | 适用 |
|---|---|
| `openai-compatible` | 大部分供应商都支持这个协议（DeepSeek/通义/Kimi/Moonshot/智谱/Ollama 等） |
| `openai` | OpenAI 官方 |
| `anthropic` | Anthropic 官方 |
| `google` | Google Gemini |
| `bedrock` | AWS Bedrock |

**新手 99% 用 `openai-compatible`**，因为国内服务商几乎都兼容这个协议。

### 怎么从 `.env` 引用变量

`.env` 文件：
```bash
DEEPSEEK_API_KEY=sk-xxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-yyyyy
```

`providers.yaml` 用 `${VAR_NAME}` 引用：
```yaml
api_key: ${DEEPSEEK_API_KEY}
```

这样 Key 不会写死在 yaml 里，方便 yaml 进 git 而不泄露 Key。

## 8.4 应用配置：重启 Gateway

```bash
openclaw gateway restart
```

任何 yaml 改动都要重启。

## 8.5 验证配置生效

```bash
openclaw providers list
```

应该输出：
```
PROVIDER   MODELS                              STATUS
deepseek   deepseek-chat, deepseek-reasoner    ✓ healthy
qwen       qwen-plus, qwen-max                 ✓ healthy
anthropic  claude-sonnet-4-6, claude-opus-4-7  ✓ healthy
ollama     qwen2.5:7b, deepseek-r1:8b          ✓ healthy
```

`status` 是 `✓ healthy` 表示能正常调用，`✗ error` 通常是 Key 错或网络不通。

## 8.6 给不同 Agent 用不同模型

每个 Agent 的 `agent.yaml` 里可以指定它用哪个 provider+model：

```yaml
# ~/.openclaw/workspace/agents/coding-agent/agent.yaml
id: coding-agent
soul: ./soul.md
model:
  provider: anthropic
  model: claude-sonnet-4-6     # 写代码的用 Claude
```

```yaml
# ~/.openclaw/workspace/agents/chat-agent/agent.yaml
id: chat-agent
soul: ./soul.md
model:
  provider: deepseek
  model: deepseek-chat         # 日常对话用 DeepSeek
```

这样同一个 Gateway 下，多个 Agent 各用各的模型，账单分得清。

## 8.7 单次调用临时换模型

CLI 调用时可以临时指定：

```bash
# 默认用 deepseek
openclaw agent --message "写个 hello world"

# 这次临时用 Claude
openclaw agent --message "写个 hello world" --provider anthropic --model claude-sonnet-4-6
```

适合一次性测试、对比模型效果。

## 8.8 成本监控：每天烧了多少钱

OpenClaw 内置 token 使用统计：

```bash
openclaw stats usage --period 7d
```

输出类似：
```
Period: last 7 days

PROVIDER    MODEL                INPUT TOKENS   OUTPUT TOKENS   COST
deepseek    deepseek-chat        1,234,567      234,567         ¥1.70
anthropic   claude-sonnet-4-6    345,678        67,890          $4.21
ollama      qwen2.5:7b           567,890        123,456         (local)

TOTAL                                                            ¥1.70 + $4.21
```

::: tip 设预警
可以设单日上限，超了 OpenClaw 自动停用（避免无限刷爆账单）：

`providers.yaml` 加：
```yaml
budget:
  daily_limit: 50          # ¥50/天
  per_agent_limit: 10      # 单 agent ¥10/天
  action_on_exceed: pause  # 超了暂停（可选 alert/log）
```
:::

## 8.9 实战配置示例（按场景）

### 场景 A：国内新手最小配置

只用 DeepSeek，最便宜。

```yaml
providers:
  - id: deepseek
    type: openai-compatible
    base_url: https://api.deepseek.com/v1
    api_key: ${DEEPSEEK_API_KEY}
    models:
      - name: deepseek-chat
        context_window: 64000

default:
  provider: deepseek
  model: deepseek-chat
```

### 场景 B：国内进阶（双供应商）

平时 DeepSeek，遇到难活切通义 Max。

```yaml
providers:
  - id: deepseek
    type: openai-compatible
    base_url: https://api.deepseek.com/v1
    api_key: ${DEEPSEEK_API_KEY}
    models:
      - name: deepseek-chat

  - id: qwen
    type: openai-compatible
    base_url: https://dashscope.aliyuncs.com/compatible-mode/v1
    api_key: ${DASHSCOPE_API_KEY}
    models:
      - name: qwen-max
        context_window: 32000

default:
  provider: deepseek
  model: deepseek-chat
```

### 场景 C：海外质量优先

```yaml
providers:
  - id: anthropic
    type: anthropic
    api_key: ${ANTHROPIC_API_KEY}
    models:
      - name: claude-sonnet-4-6
      - name: claude-opus-4-7

default:
  provider: anthropic
  model: claude-sonnet-4-6
```

### 场景 D：隐私优先（本地 + 云备份）

主用 Ollama，无网络时仍能用。云端 DeepSeek 作 fallback。

```yaml
providers:
  - id: ollama
    type: openai-compatible
    base_url: http://localhost:11434/v1
    api_key: ollama
    models:
      - name: qwen2.5:14b
        context_window: 32000

  - id: deepseek
    type: openai-compatible
    base_url: https://api.deepseek.com/v1
    api_key: ${DEEPSEEK_API_KEY}
    models:
      - name: deepseek-chat

default:
  provider: ollama
  model: qwen2.5:14b

fallback:
  provider: deepseek
  model: deepseek-chat
```

## 8.10 常见报错速查

### Q：`Provider 'xxx' not found`
A：`agent.yaml` 里写的 provider id 在 `providers.yaml` 里没定义。检查拼写。

### Q：`Model 'xxx' not available for provider 'yyy'`
A：你引用的模型名在 `models` 列表里没列。要么加进去，要么用支持的模型。

### Q：`base_url` 拼错了 → 一直超时
A：常见错误：少了 `/v1`、少了 `https://`、写成 `api.openai.com` 没加 `https://`。

### Q：用 Ollama 报 `ECONNREFUSED`
A：Ollama 服务没启。先在另一个终端跑 `ollama serve`，或 macOS 打开 Ollama 应用。

### Q：阿里通义报 `403 Forbidden`
A：DashScope 的 base_url 容易写错。正确是：
```
https://dashscope.aliyuncs.com/compatible-mode/v1
```
不是 `dashscope.aliyuncs.com/api/v1`（那是另一套 SDK 用的协议）。

---

## 看完这一章你应该知道

✅ `providers.yaml` 写所有 LLM 供应商配置
✅ 99% 国内服务商用 `openai-compatible` 协议
✅ `.env` 存 Key，yaml 用 `${VAR}` 引用
✅ 可以同时配多家，给不同 Agent 用不同模型
✅ `openclaw stats usage` 看每天烧了多少钱

---

**下一步**：[9. 你的第一个 Agent →](/openclaw/setup/first-agent)

模型有了，下一章开始造你的第一个"AI 人格"——给它取名、写性格、设权限。
