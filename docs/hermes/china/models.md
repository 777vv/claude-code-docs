# 22. 国内 LLM 接入

::: info 本章你将学到
- Hermes 适配的国产 LLM 完整清单
- DeepSeek / Kimi / 通义 / GLM / MiniMax / MiMo / Ollama 完整接入
- Hermes + MiniMax 战略合作的玩法
- 多供应商混用 + fallback
- 国内独有的 Hermes 兼容点（vs OpenClaw 章节）
:::

::: tip 章节定位
和 [OpenClaw 22 章](/openclaw/china/models) 总体方案相似，本章重点讲 Hermes 配置差异：
- 配置格式（Hermes yaml schema 不同）
- Hermes 独家：MiniMax / Nous Portal 集成
- 兼容 `hermes model` 交互菜单
:::

## 22.1 Hermes 对国产模型的支持级别

| 模型 | 支持级 | 协议 |
|---|---|---|
| **DeepSeek** | ⭐⭐⭐⭐⭐ 完整 | openai-compatible |
| **Kimi (Moonshot)** | ⭐⭐⭐⭐⭐ 完整 | openai-compatible |
| **通义千问 (DashScope)** | ⭐⭐⭐⭐ 完整 | openai-compatible |
| **MiniMax** | ⭐⭐⭐⭐⭐ **战略合作** | minimax 原生 + openai-compatible |
| **智谱 GLM** | ⭐⭐⭐⭐ 完整 | openai-compatible |
| **小米 MiMo** | ⭐⭐⭐ 实验性 | openai-compatible |
| **Ollama** | ⭐⭐⭐⭐⭐ 完整 | openai-compatible |

## 22.2 选型决策（5 秒版）

| 你的情况 | 推荐 |
|---|---|
| 完全新手、想最便宜 | **DeepSeek** |
| 长文档分析 / 大代码库 | **Kimi K2 (128K)** |
| 中文质量优先 | **通义千问 Max** |
| 想跟 Hermes 玩深度集成 | **MiniMax**（战略合作伙伴） |
| 隐私 / 离线 / 不花钱 | **Ollama 本地** |
| 实验新模型 | **MiMo / GLM** |

## 22.3 DeepSeek 完整配置（推荐起步）

### 申请

详见 [OpenClaw 22.3 节](/openclaw/china/models#_22-3-deepseek-完整对接) 申请流程。

### Hermes 配置

`~/.hermes/.env`:
```bash
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

`~/.hermes/config.yaml`:
```yaml
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
          reasoning: true
  default: deepseek/deepseek-chat
```

或一行命令：
```bash
hermes model
# 选 DeepSeek → 粘 Key
```

## 22.4 Kimi (Moonshot) 完整配置

### 申请

1. [platform.moonshot.cn](https://platform.moonshot.cn) 注册充值
2. 创建 API Key

### 配置

```yaml
llm:
  providers:
    kimi:
      type: openai-compatible
      base_url: https://api.moonshot.cn/v1
      api_key: ${MOONSHOT_API_KEY}
      models:
        - name: moonshot-v1-8k
          context_window: 8000
        - name: moonshot-v1-32k
          context_window: 32000
        - name: moonshot-v1-128k        # 长文档主力
          context_window: 128000
        - name: kimi-k2                  # 最新一代
          context_window: 256000
```

::: tip Kimi 长文档场景
读 800 页 PDF / 1MB 代码库时用 Kimi K2，**Hermes 自动**在长 context 任务自动切到 Kimi（如果配置了 routing 规则）。
:::

## 22.5 通义千问完整配置

```yaml
llm:
  providers:
    qwen:
      type: openai-compatible
      base_url: https://dashscope.aliyuncs.com/compatible-mode/v1
      api_key: ${DASHSCOPE_API_KEY}
      models:
        - name: qwen-plus
          context_window: 131000
        - name: qwen-max
          context_window: 32000
        - name: qwen-turbo
          context_window: 8000
        - name: qwen2.5-72b-instruct     # 开源版（性价比之选）
```

::: warning 阿里 base_url 容易错
**对**：`https://dashscope.aliyuncs.com/compatible-mode/v1`
**错**：`https://dashscope.aliyuncs.com/api/v1`
:::

## 22.6 MiniMax（Hermes 战略合作）

Hermes 和 MiniMax 有官方合作——**Hermes 对 MiniMax 的支持最深**。

### 申请

1. [platform.minimaxi.com](https://platform.minimaxi.com) 注册
2. 充值（新户有免费额度）
3. 「API Keys」创建 + 拿 GroupID

### 配置

```bash
# .env
MINIMAX_API_KEY=xxxxxxxxxxxxxxxxxxxxx
MINIMAX_GROUP_ID=xxxxx
```

```yaml
llm:
  providers:
    minimax:
      type: minimax               # ← Hermes 内置原生支持
      api_key: ${MINIMAX_API_KEY}
      group_id: ${MINIMAX_GROUP_ID}
      models:
        - name: MiniMax-M2
          context_window: 1000000   # 100 万 token（业内最长）
        - name: abab6.5s-chat
        - name: abab6.5-chat
```

### Hermes-MiniMax 独家集成

- ✅ 完整 multi-modal 支持（语音 / 图像）
- ✅ 原生 function-calling 协议
- ✅ Hermes Subagents 用 MiniMax 时**省 30%** token（缓存优化）

## 22.7 智谱 GLM

```yaml
llm:
  providers:
    zhipu:
      type: openai-compatible
      base_url: https://open.bigmodel.cn/api/paas/v4
      api_key: ${ZHIPU_API_KEY}
      models:
        - name: glm-4.5
          context_window: 128000
        - name: glm-4.5-flash         # 便宜版
          context_window: 128000
        - name: glm-4v                # 视觉
```

## 22.8 小米 MiMo（实验性）

小米推出的 LLM，Hermes 实验性支持。

```yaml
llm:
  providers:
    mimo:
      type: openai-compatible
      base_url: https://api.mimo.xiaomi.com/v1
      api_key: ${MIMO_API_KEY}
      models:
        - name: mimo-pro
```

## 22.9 Ollama 本地

完全免费 + 离线。详见 [OpenClaw 22.8 节](/openclaw/china/models#_22-8-ollama-本地完整对接)。

Hermes 配置：

```yaml
llm:
  providers:
    ollama:
      type: openai-compatible
      base_url: http://localhost:11434/v1
      api_key: ollama
      models:
        - name: qwen2.5:14b
          context_window: 32000
        - name: deepseek-r1:8b
        - name: llama3.3:70b           # 大模型，要好显卡
```

## 22.10 多 provider 混用（推荐）

```yaml
llm:
  providers:
    deepseek: {...}              # 日常便宜
    kimi: {...}                  # 长文档
    minimax: {...}               # 多模态 / Hermes 集成
    ollama: {...}                # 敏感数据 / 离线

  routing:
    rules:
      # 长 context → Kimi
      - match: { context_size_gt: 50000 }
        provider: kimi
        model: moonshot-v1-128k

      # 推理 → DeepSeek Reasoner
      - match: { task_type: "reasoning" }
        provider: deepseek
        model: deepseek-reasoner

      # 视觉 → MiniMax
      - match: { has_image: true }
        provider: minimax
        model: MiniMax-M2

      # 敏感 → 强制本地
      - match: { tags: ["sensitive"] }
        provider: ollama
        model: qwen2.5:14b

  default: deepseek/deepseek-chat
  fallback:
    - kimi/moonshot-v1-32k
    - deepseek/deepseek-chat
```

## 22.11 成本对比（国内场景实测）

跑同样 100 轮典型对话（约 30K tokens in, 10K out）：

| 模型 | 总花费 |
|---|---|
| DeepSeek-V3 | ¥0.50-1 |
| Kimi 32K | ¥1.50-3 |
| Kimi 128K | ¥5-8 |
| 通义 Plus | ¥1-2 |
| 通义 Max | ¥10-15 |
| GLM 4.5 | ¥2-3 |
| MiniMax M2 | ¥3-5 |
| Ollama 14B | 免费 |

**结论**：日常 DeepSeek 用爽，长 / 重要任务切 Kimi/通义 Max。

## 22.12 hermes model 交互菜单

不喜欢编辑 yaml？

```bash
hermes model
```

界面：
```
Current default: deepseek/deepseek-chat

Configured providers:
  ✓ deepseek (4 models)
  ✓ kimi (3 models)
  ✗ minimax (not configured)
  ✗ qwen (not configured)
  ✗ ollama (Ollama service not running)

Actions:
  [1] Add new provider
  [2] Switch default
  [3] Configure routing rules
  [4] Test all providers
  [5] Configure budget
  [q] Quit
```

按 1 → 选 MiniMax → 输入 Key + Group ID → 自动配进 yaml。

## 22.13 常见报错

### Q：DeepSeek 报 `Insufficient Balance`
**修复**：充值。看 [platform.deepseek.com](https://platform.deepseek.com) 控制台。

### Q：MiniMax 报 `GroupID is required`
**修复**：除了 API Key，MiniMax 还要 group_id。控制台「账户与开发管理」里找。

### Q：Kimi 上下文超长报错
**修复**：可能用了 8K 模型但塞了 50K。换 `moonshot-v1-128k`。

### Q：Ollama `Connection refused`
**修复**：`ollama serve` 启它。或 mac 应用没打开。

### Q：通义 base_url 错
**修复**：必须是 `compatible-mode/v1` 路径。

---

## 看完这一章你应该知道

✅ Hermes 完整支持国内 7 大 LLM
✅ DeepSeek 起步、Kimi 长文档、通义 Max 高质量
✅ **MiniMax 是 Hermes 战略合作**（独家原生协议）
✅ Ollama 本地完全免费
✅ 多 provider 用 routing 规则按场景分配
✅ `hermes model` 交互菜单替代手写 yaml

---

**下一步**：[23. 网络与镜像加速 →](/hermes/china/network)

模型有了，下一章解决网络速度问题（PyPI / GitHub 加速）。
