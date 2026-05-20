# 19. 国内模型接入

::: info 本章你将学到
- 为什么国内用户需要特殊配置
- 5 大服务商的详细接入步骤
- 国内模型 vs 官方 Claude 的能力对比
- 推荐选择方案
:::

::: warning 重要说明
Claude Code 默认使用 Anthropic 的 Claude 系列模型。通过以下配置，你可以让它兼容支持 OpenAI-compatible API 的国内服务商，实现同样的 AI 辅助编码体验。不同服务商的模型能力有所差异，部分高级功能可能受限。
:::

## 19.1 方案对比

| 服务商 | 特点 | 推荐指数 | 配置难度 |
|--------|------|---------|---------|
| **硅基流动** | 原生 Claude 模型，国内速度快 | ⭐⭐⭐⭐⭐ | 低 |
| **OpenRouter** | 聚合全球模型，统一接口 | ⭐⭐⭐⭐ | 低 |
| **通义千问** | 阿里云自研，长上下文 | ⭐⭐⭐ | 中 |
| **智谱 AI** | 国产 GLM 系列 | ⭐⭐⭐ | 中 |
| **代理转发** | 访问官方 API | ⭐⭐⭐ | 中高 |

## 19.2 硅基流动（推荐首选）

[siliconflow.cn](https://siliconflow.cn) — 支持 Claude 原版模型，国内访问速度快。

**优势**：
- ✅ 原生支持 Claude Sonnet / Opus / Haiku
- ✅ 国内低延迟
- ✅ 有免费额度，按量计费
- ✅ 与 Anthropic API 格式高度兼容

**配置步骤**：

```bash
# 1. 注册账号：访问 https://siliconflow.cn
# 2. 获取 API Key：控制台 → API Key 管理 → 创建

# 3. 配置环境变量（推荐写入 ~/.bashrc 或 ~/.zshrc）
export ANTHROPIC_API_KEY="your-siliconflow-key"
export ANTHROPIC_API_BASE="https://api.siliconflow.cn/v1"

# 4. 验证
claude doctor
```

**settings.json 配置方式**（`~/.claude/settings.json`）：

```json
{
  "apiBase": "https://api.siliconflow.cn/v1",
  "apiKey": "${ANTHROPIC_API_KEY}",
  "model": "anthropic/claude-sonnet-4-20250514"
}
```

**可用模型**：

| 模型 ID | 说明 |
|---------|------|
| `anthropic/claude-sonnet-4-20250514` | Claude Sonnet 4（推荐）|
| `anthropic/claude-opus-4-20250514` | Claude Opus 4（最强）|
| `anthropic/claude-haiku-4-20250514` | Claude Haiku 4（快速便宜）|
| `deepseek-ai/DeepSeek-V3` | DeepSeek V3（国产替代）|
| `Qwen/Qwen2.5-Coder-32B-Instruct` | 通义千问编程专用 |

## 19.3 OpenRouter（多模型聚合）

[openrouter.ai](https://openrouter.ai) — 一个密钥访问全球数百种模型。

**优势**：
- ✅ 一套接口访问 Claude、GPT-4、Gemini 等多种模型
- ✅ 可以灵活切换模型对比效果
- ✅ 支持 Claude 最新版本

**配置**：

```bash
# 1. 注册：https://openrouter.ai
# 2. 创建 API Key：Dashboard → API Keys

export ANTHROPIC_API_KEY="sk-or-your-key"
export ANTHROPIC_API_BASE="https://openrouter.ai/api/v1"
```

```json
{
  "apiBase": "https://openrouter.ai/api/v1",
  "apiKey": "${ANTHROPIC_API_KEY}",
  "model": "anthropic/claude-sonnet-4-5"
}
```

**OpenRouter 上的热门模型**：

| 模型 ID | 说明 |
|---------|------|
| `anthropic/claude-sonnet-4-5` | Claude Sonnet 4.5 |
| `anthropic/claude-opus-4` | Claude Opus 4 |
| `deepseek/deepseek-coder` | DeepSeek 编程版 |
| `qwen/qwen-2.5-coder-32b-instruct` | 通义千问编程版 |
| `meta-llama/llama-3.1-70b-instruct` | Llama 3.1 70B |

## 19.4 通义千问（阿里云）

[dashscope.console.aliyun.com](https://dashscope.console.aliyun.com) — 阿里云自研，长上下文支持好。

**优势**：
- ✅ 超长上下文（最长 100 万 token）
- ✅ 阿里云企业级稳定性
- ✅ 中文理解能力强

**配置**：

```bash
# 1. 注册阿里云账号，开通 DashScope 服务
# 2. 创建 API Key：控制台 → 百炼 → API-KEY

export ANTHROPIC_API_KEY="your-dashscope-key"
export ANTHROPIC_API_BASE="https://dashscope.aliyuncs.com/compatible-mode/v1"
```

```json
{
  "apiBase": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "apiKey": "${ANTHROPIC_API_KEY}",
  "model": "qwen-plus"
}
```

**可用模型**：

| 模型 ID | 说明 |
|---------|------|
| `qwen-turbo` | 最快响应，低延迟 |
| `qwen-plus` | 平衡（推荐）|
| `qwen-max` | 最强能力 |
| `qwen-long` | 超长上下文（100 万 token）|
| `qwen-coder-turbo` | 编程专用 |

## 19.5 智谱 AI（GLM 系列）

[open.bigmodel.cn](https://open.bigmodel.cn) — 清华大学背景，GLM 自研模型。

**配置**：

```bash
# 1. 注册：https://open.bigmodel.cn
# 2. 控制台 → API Key → 创建

export ANTHROPIC_API_KEY="your-zhipu-key"
export ANTHROPIC_API_BASE="https://open.bigmodel.cn/api/paas/v4"
```

```json
{
  "apiBase": "https://open.bigmodel.cn/api/paas/v4",
  "apiKey": "${ANTHROPIC_API_KEY}",
  "model": "glm-4-flash"
}
```

**可用模型**：

| 模型 ID | 说明 |
|---------|------|
| `glm-4-flash` | 快速、低成本（推荐入门）|
| `glm-4` | 标准版 |
| `glm-4-plus` | 增强版 |
| `glm-4v` | 支持图像输入 |

## 19.6 DeepSeek

[platform.deepseek.com](https://platform.deepseek.com) — 国内最强开源代码模型之一。

**配置**：

```bash
# 1. 注册：https://platform.deepseek.com
# 2. API Keys → Create API Key

export ANTHROPIC_API_KEY="sk-your-deepseek-key"
export ANTHROPIC_API_BASE="https://api.deepseek.com/v1"
```

```json
{
  "apiBase": "https://api.deepseek.com/v1",
  "apiKey": "${ANTHROPIC_API_KEY}",
  "model": "deepseek-coder"
}
```

**可用模型**：

| 模型 ID | 说明 |
|---------|------|
| `deepseek-chat` | 通用对话 |
| `deepseek-coder` | 编程专用（推荐）|
| `deepseek-reasoner` | 深度推理 |

## 19.7 能力对比

| 功能 | Claude 原版 | 国内模型 |
|------|------------|---------|
| 代码理解和生成 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐（略低）|
| 中文理解 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐（更好）|
| 长上下文 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐（通义最强）|
| 工具调用 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐（部分支持）|
| 多模态（图像）| ⭐⭐⭐⭐⭐ | ⭐⭐⭐（部分支持）|
| 推理深度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐（接近）|
| 访问速度（国内）| ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 价格 | $$ | $ |

::: tip 选择建议
- **最接近官方体验**：硅基流动（原版 Claude 模型）
- **最省钱**：DeepSeek（价格极低，代码能力强）
- **中文最好**：通义千问 qwen-max
- **多模型试用**：OpenRouter（可以灵活切换）
:::

---

下一步：[代理与网络配置](/china/proxy)
