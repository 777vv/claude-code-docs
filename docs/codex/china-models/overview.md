# 国内模型对接总览

> **本文你将学会：** 为什么可以用国内模型、接入的原理是什么、以及选哪个模型最合适。

## 为什么国内用户需要替代方案？

使用 OpenAI 官方模型面临两个问题：

1. **网络问题**：国内直接访问 `api.openai.com` 不稳定
2. **支付问题**：OpenAI 不支持国内银行卡，需要借助第三方充值

好消息是：**国内主流 AI 模型均支持 OpenAI 兼容 API**，可以直接替换，体验几乎无差别。

---

## 接入原理（一图看懂）

```
你的指令
    ↓
Codex CLI
    ↓
OpenAI 兼容 API 请求（POST /v1/chat/completions）
    ↓
┌─────────────────────────────────┐
│  任意支持 OpenAI 格式的模型      │
│  DeepSeek / 通义千问 / Kimi / … │
└─────────────────────────────────┘
    ↓
返回结果给 Codex
```

Codex 本身不关心背后是哪家模型，只要 API 格式兼容即可。

---

## 模型选择指南

| 模型 | 免费额度 | 代码能力 | 中文理解 | 推荐指数 |
|------|----------|----------|----------|----------|
| **DeepSeek V3** | ✅ 有（较大） | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🔥 首推 |
| **通义千问 Coder** | ✅ 有 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 👍 推荐 |
| **Kimi k1.5** | ✅ 有（有限） | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 👍 推荐 |
| **Ollama 本地** | ✅ 完全免费 | ⭐⭐⭐ | ⭐⭐⭐ | 💻 离线首选 |
| **智谱 GLM-4** | ✅ 有 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 👍 推荐 |
| **文心一言 4.5** | ✅ 有 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🆗 可用 |
| **豆包 Pro** | ✅ 有 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🆗 可用 |

---

## 接入步骤概览（以 DeepSeek 为例）

所有国内模型的接入流程基本一致，分为 3 步：

**第一步：注册账号，获取 API Key**

前往对应平台官网注册账号，在开发者控制台生成 API Key。

**第二步：修改 Codex 配置文件**

```toml
# ~/.codex/config.toml
[model_providers.deepseek]
name = "deepseek"
api_key = "sk-xxxxxxxxxxxxxxxx"   # 你的 API Key
base_url = "https://api.deepseek.com/v1"

[model]
provider = "deepseek"
name = "deepseek-chat"
```

**第三步：验证是否生效**

```bash
codex
# 输入：你好，你是哪个模型？
```

如果回复包含模型信息，说明接入成功。

---

## 各模型保姆级教程

点击查看详细的图文教程，包含每一步截图说明：

- 🔍 [DeepSeek 保姆级教程](/codex/china-models/deepseek)（最推荐，免费额度最大）
- ☁️ [通义千问 保姆级教程](/codex/china-models/qwen)
- 🌙 [Kimi 保姆级教程](/codex/china-models/kimi)
- 🦙 [Ollama 完全离线方案](/codex/china-models/ollama-local)（无需 API Key，完全本地）
- 📋 [其他模型快速参考](/codex/china-models/others)（智谱、文心、豆包）

---

## 常见问题

::: details 国内模型和 OpenAI 模型有多大差距？
DeepSeek V3 在代码任务上与 GPT-4o 相当，某些代码基准测试中甚至超越。对于日常开发任务，体验差距不明显。
:::

::: details 会不会有数据安全问题？
国内模型均部署在国内服务器，代码不出境。敏感项目建议使用 Ollama 本地方案（代码完全不离开你的机器）。
:::

::: details 可以同时配置多个模型吗？
可以。在 `config.toml` 中配置多个 `[model_providers.*]`，启动时用 `--provider` 参数切换。
:::
