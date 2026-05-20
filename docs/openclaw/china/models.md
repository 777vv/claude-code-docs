# 22. 国内 LLM 接入

::: info 本章你将学到
- 5 大国产 LLM 完整对接教程（DeepSeek / 通义千问 / Kimi / 智谱 / Ollama）
- 每家的定价、速度、能力简评
- OpenClaw 配置完整 yaml
- 国内聚合方案（硅基流动 / OpenRouter）什么时候用
- 哪种场景该选哪个模型
:::

::: tip 不用读全
按你选定要用的那家直接跳到对应小节。**新手如果还没决定，看完 22.2 选型表后选一个开始**。
:::

## 22.1 国产 LLM 全景

| 模型 | 公司 | 价格区间 | 中文 | 编码 | 多模态 | 国内直连 |
|---|---|---|---|---|---|---|
| **DeepSeek-V3** | 深度求索 | 🟢 最便宜 | ★★★★ | ★★★★★ | 无 | ✅ |
| **DeepSeek-R1** | 深度求索 | 🟢 便宜 | ★★★★ | ★★★★★ | 无 | ✅ |
| **通义千问 Plus** | 阿里 | 🟢 便宜 | ★★★★★ | ★★★★ | 有 Qwen-VL | ✅ |
| **通义千问 Max** | 阿里 | 🟡 中等 | ★★★★★ | ★★★★★ | 有 | ✅ |
| **Kimi K2** | 月之暗面 | 🟡 中 | ★★★★ | ★★★★ | 文档强 | ✅ |
| **智谱 GLM-4.5** | 智谱AI | 🟡 中 | ★★★★ | ★★★★ | 有 GLM-4V | ✅ |
| **Ollama 本地** | 自部署 | 🟢 免费 | 看模型 | 看模型 | 看模型 | ✅（不用网） |

## 22.2 选型建议（按场景）

| 我的场景 | 推荐 |
|---|---|
| 入门 / 学习 / 预算紧 | **DeepSeek V3**（便宜质量好） |
| 中文写作 / 文档 | **通义千问 Plus** |
| 编程 / 代码相关 | **DeepSeek V3 或 Claude**（如果能上） |
| 长文档分析 | **Kimi K2**（128K context 起步） |
| 多模态（看图） | **通义 Qwen-VL** / 智谱 GLM-4V |
| 隐私 / 离线 | **Ollama 本地** |
| 想一个 Key 调多家 | **硅基流动**（见 22.7） |

## 22.3 DeepSeek 完整对接

### 价格（2026 年 5 月）

| 模型 | 输入 ¥/1M tokens | 输出 ¥/1M tokens |
|---|---|---|
| deepseek-chat | ¥1 | ¥2 |
| deepseek-reasoner | ¥1 | ¥8 |

打个比方：来回聊一万条普通对话约 ¥3-5。**新手 ¥10 起步用一个月没问题**。

### 申请步骤

1. 访问 [platform.deepseek.com](https://platform.deepseek.com)
2. 注册 → 实名（必须）
3. 充值至少 ¥10
4. 「API Keys」→ 创建 → 复制 `sk-xxxx`

### OpenClaw 配置

`.env`:
```bash
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

`providers.yaml`:
```yaml
providers:
  - id: deepseek
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

default:
  provider: deepseek
  model: deepseek-chat
```

### 验证

```bash
openclaw providers test deepseek
openclaw agent -m "你是谁"
```

## 22.4 通义千问 完整对接

### 价格

| 模型 | 输入 ¥/1M | 输出 ¥/1M |
|---|---|---|
| qwen-plus | ¥4 | ¥12 |
| qwen-max | ¥40 | ¥120 |
| qwen-turbo | ¥0.3 | ¥0.6（最便宜，但能力弱） |

::: tip 新用户大礼包
开通 DashScope 通常送 ¥10-50 免费额度，可以白嫖一段时间。
:::

### 申请步骤

1. [阿里云首页](https://www.aliyun.com) 注册 / 登录
2. 进 [DashScope 控制台](https://dashscope.console.aliyun.com/) → 开通
3. 「API-KEY 管理」→ 创建新 KEY → 复制

### OpenClaw 配置

`.env`:
```bash
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

`providers.yaml`:
```yaml
providers:
  - id: qwen
    type: openai-compatible
    base_url: https://dashscope.aliyuncs.com/compatible-mode/v1
    api_key: ${DASHSCOPE_API_KEY}
    models:
      - name: qwen-plus
        context_window: 131000
        max_output: 8000
      - name: qwen-max
        context_window: 32000
        max_output: 8000
      - name: qwen-turbo
        context_window: 8000
        max_output: 2000
```

::: warning 阿里 base_url 容易写错
**对**：`https://dashscope.aliyuncs.com/compatible-mode/v1`
**错**：`https://dashscope.aliyuncs.com/api/v1`（那是阿里专有协议，不兼容 OpenAI 格式）
:::

## 22.5 Kimi 完整对接

### 价格

| 模型 | ¥/1M tokens |
|---|---|
| moonshot-v1-8k | ¥12 |
| moonshot-v1-32k | ¥24 |
| moonshot-v1-128k | ¥60 |

128K 上下文场景（长文档分析、超大代码库）适合用 Kimi。

### 申请

1. [platform.moonshot.cn](https://platform.moonshot.cn) 注册
2. 充值 → 创建 API Key

### 配置

```bash
# .env
MOONSHOT_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

```yaml
# providers.yaml
providers:
  - id: kimi
    type: openai-compatible
    base_url: https://api.moonshot.cn/v1
    api_key: ${MOONSHOT_API_KEY}
    models:
      - name: moonshot-v1-8k
        context_window: 8000
      - name: moonshot-v1-32k
        context_window: 32000
      - name: moonshot-v1-128k
        context_window: 128000
```

## 22.6 智谱 GLM 完整对接

### 价格

| 模型 | ¥/1M tokens |
|---|---|
| glm-4.5 | ¥10-20 |
| glm-4.5-flash | ¥1 |
| glm-4v（多模态） | ¥50 |

### 申请

1. [open.bigmodel.cn](https://open.bigmodel.cn)
2. 注册 → 实名 → 「API Keys」创建

### 配置

```bash
ZHIPU_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

```yaml
providers:
  - id: zhipu
    type: openai-compatible
    base_url: https://open.bigmodel.cn/api/paas/v4
    api_key: ${ZHIPU_API_KEY}
    models:
      - name: glm-4.5
        context_window: 128000
      - name: glm-4.5-flash
        context_window: 128000
```

## 22.7 聚合方案：硅基流动 / OpenRouter

不想配 5 家？用聚合服务一个 Key 调多家。

### 硅基流动（国内）

- 网站：[siliconflow.cn](https://siliconflow.cn)
- 支持：DeepSeek / Qwen / GLM / Llama / 等几十家
- 价格：略加 5-10% 服务费
- 优势：一个账号、人民币付款、国内直连、有免费额度

配置：
```yaml
providers:
  - id: siliconflow
    type: openai-compatible
    base_url: https://api.siliconflow.cn/v1
    api_key: ${SILICONFLOW_API_KEY}
    models:
      - name: deepseek-ai/DeepSeek-V3
      - name: Qwen/Qwen2.5-72B-Instruct
      - name: meta-llama/Llama-3.3-70B-Instruct
```

### OpenRouter（国外为主）

- 网站：[openrouter.ai](https://openrouter.ai)
- 支持：Claude / GPT / Gemini / Llama / 全球几乎所有模型
- 优势：能调 Claude / GPT 不需国外信用卡（虚拟卡 / Crypto 充值）
- 缺点：国内不一定直连，常需代理

## 22.8 Ollama 本地完整对接

### 装 Ollama

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: 下载安装包 ollama.com
```

### 下推荐模型

```bash
# 平衡（中文友好，7B 需 8GB 显存）
ollama pull qwen2.5:7b

# 编码强（13B 需 16GB）
ollama pull deepseek-r1:8b

# 性能强但要好显卡（70B 需 48GB+）
ollama pull qwen2.5:72b
```

### OpenClaw 配置

```yaml
providers:
  - id: ollama
    type: openai-compatible
    base_url: http://localhost:11434/v1
    api_key: ollama          # 占位，Ollama 不验证
    models:
      - name: qwen2.5:7b
        context_window: 32000
      - name: deepseek-r1:8b
        context_window: 32000
```

`default` 切换到 ollama：
```yaml
default:
  provider: ollama
  model: qwen2.5:7b
```

### Ollama 优势 / 劣势

✅ 优势
- 完全免费
- 数据不出本机（隐私 ★★★★★）
- 离线也能用
- 没有 token 限制

❌ 劣势
- 需要好显卡（8B 模型至少 8GB 显存）
- 7B/8B 模型质量比 Claude/GPT-4 弱一档
- 跑得比云端慢（除非 RTX 4090 级别）

## 22.9 多 provider 混用

可以同时配多家，agent 按需切换。

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

  - id: ollama
    type: openai-compatible
    base_url: http://localhost:11434/v1
    api_key: ollama
    models:
      - name: qwen2.5:14b

default:
  provider: deepseek
  model: deepseek-chat

# 当默认 provider 挂了，自动切到 fallback
fallback:
  provider: qwen
  model: qwen-plus
```

不同 agent 用不同 provider：

```yaml
# coder-bot/agent.yaml
model: { provider: deepseek, model: deepseek-reasoner }   # 写代码用推理强的

# chat-bot/agent.yaml
model: { provider: ollama, model: qwen2.5:14b }           # 闲聊用免费的

# secret-bot/agent.yaml（处理敏感数据）
model: { provider: ollama, model: qwen2.5:14b }           # 强制本地
```

## 22.10 成本对比实测

跑同样的 1000 次对话（短问答）的实际花费：

| 方案 | 总花费 | 速度 | 质量 |
|---|---|---|---|
| DeepSeek-V3 | ¥3-5 | 快 | 不错 |
| 通义 qwen-plus | ¥10-15 | 快 | 好 |
| 通义 qwen-max | ¥80-120 | 中 | 顶级 |
| Kimi 32k | ¥15-25 | 中 | 好 |
| GPT-4o-mini | ¥30-50 | 快 | 好 |
| Claude Sonnet 4.6 | ¥80-150 | 快 | 顶级 |
| Ollama 7B | 免费 | 慢 | 一般 |

**结论**：日常用 DeepSeek 性价比无敌，遇到难题切到通义 Max 或 Claude。

## 22.11 常见报错

### `401 Unauthorized` 或 `Invalid API Key`
- Key 错或过期，去服务商后台重新生成

### `429 Too Many Requests`
- 调用频率太高，OpenClaw 已经在自动 retry，等等就好
- 高频场景考虑升级账户层级

### `Insufficient Balance`
- 账户余额不够，充值

### DashScope 报 `Model not found: qwen-plus`
- 检查 base_url 是否是 `compatible-mode/v1`
- 检查模型名拼写：阿里官方是 `qwen-plus` 不是 `qwen2.5-plus`

### Ollama 报 `ECONNREFUSED`
- Ollama 服务没启。`ollama serve` 或 macOS 打开 Ollama 应用

---

## 看完这一章你应该知道

✅ 5 大国产 LLM 价格和能力对比
✅ DeepSeek 性价比无敌（推荐新手起步）
✅ 通义 Max / Claude 适合高质量场景
✅ Kimi 适合超长文档
✅ Ollama 适合隐私 / 离线
✅ 硅基流动 一个 Key 调多家

---

**下一步**：[23. 国内 channel 接入 →](/openclaw/china/channels)

模型搞定，下一章让你的 agent 接到飞书 / 钉钉 / 企业微信 / QQ / 微信。
