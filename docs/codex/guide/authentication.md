# 认证与 API Key

> **本文你将学会：** 如何获取 API Key、配置认证信息，以及管理多个模型的凭证。

## 认证方式概览

Codex 支持两种认证方式：

| 方式 | 适用场景 | 优点 |
|------|----------|------|
| **API Key（推荐）** | 大多数场景 | 灵活，支持所有模型提供商 |
| **ChatGPT 账号** | 已有 ChatGPT Plus/Pro | 无需单独购买 API 额度 |

---

## 方式一：使用 API Key

### OpenAI API Key

1. 前往 [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. 点击 **"Create new secret key"**
3. 复制生成的 Key（以 `sk-` 开头）

::: warning 注意
API Key 只显示一次，复制后妥善保存。如果丢失需要重新生成。
:::

配置到环境变量：

```bash
# ~/.zshrc 或 ~/.bashrc
export OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
```

### 国内模型 API Key

如果使用国内模型，API Key 的获取方式不同，请参考对应教程：

- 🔍 [DeepSeek API Key 申请](/codex/china-models/deepseek#获取-api-key)
- ☁️ [通义千问 API Key 申请](/codex/china-models/qwen#获取-api-key)
- 🌙 [Kimi API Key 申请](/codex/china-models/kimi#获取-api-key)

---

## 方式二：ChatGPT 账号登录

如果你有 ChatGPT Plus、Pro、Business 或 Edu 订阅，可以直接用账号登录：

```bash
codex auth login
```

按照终端提示完成浏览器授权流程。

::: info 账号登录适用的计划
- ChatGPT Plus（$20/月）
- ChatGPT Pro（$200/月）
- ChatGPT Business / Enterprise / Edu

免费版 ChatGPT 不支持 Codex CLI。
:::

---

## 在 config.toml 中管理凭证

比环境变量更结构化的方式是写入配置文件 `~/.codex/config.toml`：

```toml
# ~/.codex/config.toml

# 使用 OpenAI 官方
[model]
provider = "openai"
name = "gpt-5.2-codex"
api_key = "sk-xxxxxxxxxxxxxxxx"

# 或者使用国内模型（以 DeepSeek 为例）
[model]
provider = "deepseek"
name = "deepseek-coder-v3"
api_key = "sk-xxxxxxxxxxxxxxxx"
base_url = "https://api.deepseek.com/v1"
```

::: danger 安全提醒
`config.toml` 中包含 API Key，请确保：
1. 不要将此文件提交到 git 仓库
2. 设置合适的文件权限：`chmod 600 ~/.codex/config.toml`
:::

---

## 多模型切换

你可以在 `config.toml` 中配置多个模型提供商，然后在启动时指定：

```toml
# ~/.codex/config.toml

[model_providers.openai]
name = "openai"
api_key = "sk-openai-key"

[model_providers.deepseek]
name = "deepseek"
api_key = "sk-deepseek-key"
base_url = "https://api.deepseek.com/v1"

[model_providers.qwen]
name = "qwen"
api_key = "sk-qwen-key"
base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
```

启动时通过 `--model` 参数指定：

```bash
# 使用 DeepSeek
codex --model deepseek-coder-v3 --provider deepseek

# 使用通义千问
codex --model qwen-coder-plus --provider qwen
```

---

## 验证认证是否成功

启动 Codex 后，输入一个简单问题测试：

```
你好，请自我介绍一下
```

如果收到正常回复，说明认证配置成功。如果报错，常见错误和解决方法：

| 错误信息 | 原因 | 解决方法 |
|----------|------|----------|
| `401 Unauthorized` | API Key 无效或过期 | 重新生成 Key |
| `429 Too Many Requests` | 超出频率限制 | 等待几秒后重试 |
| `Connection refused` | 网络问题或 base_url 错误 | 检查网络和配置 |
| `Insufficient credits` | 余额不足 | 充值或换用其他模型 |

---

## 下一步

- 👉 [快速开始](/codex/guide/quick-start) — 用配置好的模型完成第一个任务
- 🇨🇳 [国内模型对接总览](/codex/china-models/overview) — 使用免费或低价的国内模型
