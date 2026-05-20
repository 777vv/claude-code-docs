# 7. 申请你的第一个 LLM API Key

::: info 本章你将学到
- Hermes 支持哪些 LLM（含 Nous 自家 Portal）
- 国内国外推荐选哪家
- Nous Portal / OpenRouter / DeepSeek / Kimi / MiniMax 完整申请教程
- 怎么把 Key 配进 Hermes
:::

## 7.1 Hermes 支持的 LLM 全清单

Hermes 兼容**几乎所有**主流 LLM 服务：

| 类别 | 服务商 | 国内直连 |
|---|---|---|
| **Nous 自家** | Nous Portal | ⚠️ 部分 |
| **聚合（一个 Key 调多家）** | OpenRouter (200+) / NovitaAI | ⚠️ 要代理 |
| **国外大厂** | OpenAI / Anthropic / Google Gemini | ❌ 要代理 |
| **国内大厂** | 通义千问 / Kimi / MiniMax / 智谱 GLM | ✅ |
| **小米** | MiMo | ✅ |
| **NVIDIA** | NIM (Nemotron) | ⚠️ |
| **GLM 系** | z.ai / GLM | ✅ |
| **本地** | Ollama / vLLM / llama.cpp | ✅（自己跑） |
| **自定义** | 任何 OpenAI 兼容 endpoint | 看你后端 |

## 7.2 选哪家？（按场景）

| 我的情况 | 推荐 |
|---|---|
| 国内、想最便宜 | **DeepSeek** |
| 国内、要质量好 | **通义千问 Max** 或 **Kimi K2** |
| 国内、Hermes 战略合作 | **MiniMax**（和 Nous 有合作） |
| 国外、追求质量 | **Anthropic Claude** |
| 想一个 Key 调多家 | **OpenRouter** |
| 想用 Nous 自训模型 | **Nous Portal** |
| 极致隐私 / 离线 | **Ollama 本地** |

::: tip 新手起步建议
**国内**：DeepSeek（最便宜）
**国外**：OpenRouter（一个 Key 全通）
**研究向**：Nous Portal（独家 Hermes 系列模型）
:::

## 7.3 方案 A：Nous Portal（Hermes 自家）

Nous Portal 是 Nous Research 自家的 LLM 服务，集成了他们自训的 **Hermes 模型系列**（注意：这里的 Hermes 是 Nous 训的 LLM 模型名字，和 Hermes Agent 工具同名但是两回事）。

### 优势
- 用的就是 Nous Research 自训模型，**调优过 agent 场景**
- OAuth 登录，免 API Key 管理
- 和 Hermes Agent 工具集成最深

### 步骤
1. 访问 [hermes-agent.nousresearch.com/portal](https://hermes-agent.nousresearch.com/portal)
2. 注册（GitHub / Google 登录）
3. 选订阅或按用量计费
4. 在 Hermes 里：`hermes setup` → 选 Nous Portal → 浏览器 OAuth 完成

不用复制粘贴 Key——OAuth 自动完成。

## 7.4 方案 B：DeepSeek（国内首选）

最便宜 + 国内直连 + 中文好。和 OpenClaw 章节讲的一样，这里简化版。

### 步骤
1. [platform.deepseek.com](https://platform.deepseek.com) 注册 + 实名
2. 充值（最少 ¥10，新人有时送）
3. 「API Keys」→ 创建 → 复制 `sk-xxxxx`

### 配进 Hermes

`~/.hermes/config.yaml`：
```yaml
llm:
  providers:
    deepseek:
      type: openai-compatible
      base_url: https://api.deepseek.com/v1
      api_key: ${DEEPSEEK_API_KEY}
      models:
        - deepseek-chat
        - deepseek-reasoner
  default: deepseek/deepseek-chat
```

`~/.hermes/.env`：
```bash
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxx
```

或者更简单——直接跑：
```bash
hermes model
```
进交互菜单，选 DeepSeek，粘贴 Key 即可。

## 7.5 方案 C：OpenRouter（一个 Key 调 200+ 模型）

非常适合"想试不同模型"的玩家。

### 步骤
1. [openrouter.ai](https://openrouter.ai) 注册
2. 充值（信用卡或加密货币）—— 国内可用 PayPal / 虚拟卡
3. 创建 API Key（`sk-or-v1-xxxxx`）

### 配进 Hermes

```bash
hermes model
```
选 OpenRouter → 粘 Key → 它会拉所有可用模型给你选默认的。

或手动：
```yaml
llm:
  providers:
    openrouter:
      type: openai-compatible
      base_url: https://openrouter.ai/api/v1
      api_key: ${OPENROUTER_API_KEY}
      models:
        - anthropic/claude-sonnet-4-6
        - openai/gpt-5
        - meta-llama/llama-3.3-70b-instruct
        - deepseek/deepseek-chat
        - google/gemini-2.5-pro
  default: openrouter/deepseek/deepseek-chat
```

::: tip OpenRouter 国内访问
OpenRouter API endpoint 国内**通常需要代理**。如果不能稳定代理，建议直接用 DeepSeek 或 Kimi。
:::

## 7.6 方案 D：Kimi（长文档场景）

K2 模型 128K 上下文，适合分析超长文档 / 大代码库。

```bash
# 1. platform.moonshot.cn 注册充值
# 2. 创建 API Key
# 3. 配置:

# ~/.hermes/.env
MOONSHOT_API_KEY=sk-xxxxxxxxxxxxx
```

```yaml
# ~/.hermes/config.yaml
llm:
  providers:
    kimi:
      type: openai-compatible
      base_url: https://api.moonshot.cn/v1
      api_key: ${MOONSHOT_API_KEY}
      models:
        - moonshot-v1-128k          # 超长上下文
        - moonshot-v1-32k           # 平衡
```

## 7.7 方案 E：MiniMax（Hermes 战略合作）

MiniMax 和 Nous 有合作，Hermes 对 MiniMax 模型支持最深。

```bash
# 1. platform.minimaxi.com 注册
# 2. 充值（新户有免费额度）
# 3. 创建 API Key
```

```yaml
llm:
  providers:
    minimax:
      type: minimax           # Hermes 内置 minimax 协议支持
      api_key: ${MINIMAX_API_KEY}
      group_id: ${MINIMAX_GROUP_ID}
      models:
        - MiniMax-M2          # MiniMax 最新模型
        - abab6.5s-chat
```

## 7.8 方案 F：OpenAI / Anthropic

```yaml
llm:
  providers:
    openai:
      type: openai
      api_key: ${OPENAI_API_KEY}
      models:
        - gpt-5
        - gpt-4o-mini

    anthropic:
      type: anthropic
      api_key: ${ANTHROPIC_API_KEY}
      models:
        - claude-sonnet-4-6
        - claude-opus-4-7
```

::: warning 国内访问限制
这两家国内**直连不通**，需要：
- 翻墙
- 或用 OpenRouter 中转
- 或申请海外信用卡
:::

## 7.9 方案 G：Ollama（本地离线）

完全免费，但要好显卡。

```bash
# 1. 装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. 下模型
ollama pull qwen2.5:14b           # 中文好，14B 需 12GB 显存
ollama pull deepseek-r1:8b        # 推理强
```

```yaml
llm:
  providers:
    ollama:
      type: openai-compatible
      base_url: http://localhost:11434/v1
      api_key: ollama              # 占位，Ollama 不验证
      models:
        - qwen2.5:14b
        - deepseek-r1:8b
  default: ollama/qwen2.5:14b
```

## 7.10 验证 Key 能用

```bash
hermes model test
```

或直接对话：
```bash
hermes
> 你好，介绍下你自己

# 正常返回 → ✅
# 报错看 6.7 节排错
```

## 7.11 多 provider 同时配

可以全配。Hermes 用 `default` 字段决定默认用哪个：

```yaml
llm:
  providers:
    deepseek: {...}
    kimi: {...}
    openrouter: {...}
    ollama: {...}
  default: deepseek/deepseek-chat
  fallback: kimi/moonshot-v1-32k       # 默认挂了切到这个
```

切换：
```bash
# 临时切
hermes --model kimi/moonshot-v1-128k

# 永久改默认
hermes model set deepseek/deepseek-reasoner
```

## 7.12 ⚠️ API Key 安全

### 5 条铁律

1. **永不**把 `.env` 提交到 GitHub
2. `.gitignore` 加 `.env`
3. 不同设备 / 项目用不同 Key
4. 定期轮换（30 天）
5. 设月度上限（每家服务商后台都有）

### 万一泄露应急

1. 立刻去服务商后台撤销旧 Key
2. 生成新 Key 填 `.env`
3. `hermes update-key` 让 Hermes 重新读
4. 看历史账单找异常用量

---

## 看完这一章你应该知道

✅ Hermes 支持 10+ 家 LLM
✅ 国内首选 DeepSeek，研究向 Nous Portal，长文档 Kimi
✅ OpenRouter 一个 Key 调 200+ 模型
✅ 可以同时配多家，用 default + fallback
✅ Key 进 `.env`，绝不进 git

---

**下一步**：[8. 配置模型供应商 →](/hermes/setup/model-provider)

Key 有了，下章详讲 Hermes 的 provider 配置体系 + 多 provider 协作。
