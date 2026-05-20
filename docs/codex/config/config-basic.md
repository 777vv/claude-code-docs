# 基础配置参考

> `~/.codex/config.toml` 完整字段说明。

## 文件位置

```
~/.codex/config.toml        ← 主配置文件
~/.codex/instructions.md    ← 全局指令文件（可选）
~/.codex/skills/            ← 技能文件目录（可选）
```

---

## 完整配置示例

```toml
# ~/.codex/config.toml

# ── 模型提供商配置 ──────────────────────────────────────────
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

[model_providers.ollama]
name = "ollama"
api_key = "ollama"
base_url = "http://localhost:11434/v1"

# ── 默认使用的模型 ──────────────────────────────────────────
[model]
provider = "deepseek"           # 对应上方 model_providers 中的 key
name = "deepseek-chat"          # 该提供商下的模型名称

# ── Agent 行为配置 ──────────────────────────────────────────
[agent]
approval_mode = "auto"          # auto / read-only / full

# ── MCP 服务器配置 ──────────────────────────────────────────
[[mcp_servers]]
name = "filesystem"
transport = "stdio"
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"]
```

---

## 字段说明

### `[model_providers.*]`

| 字段 | 必填 | 说明 |
|------|:----:|------|
| `name` | ✅ | 提供商名称（标识符） |
| `api_key` | ✅ | API 密钥 |
| `base_url` | 仅第三方 | API 基础地址（OpenAI 默认不需要） |

### `[model]`

| 字段 | 必填 | 说明 |
|------|:----:|------|
| `provider` | ✅ | 使用哪个提供商（对应 `model_providers` 中的 key） |
| `name` | ✅ | 模型名称 |

### `[agent]`

| 字段 | 默认值 | 可选值 | 说明 |
|------|--------|--------|------|
| `approval_mode` | `auto` | `auto` / `read-only` / `full` | 默认权限模式 |

---

## 环境变量覆盖

也可以用环境变量来配置，适合不想写配置文件的场景：

```bash
# API Key
export OPENAI_API_KEY="sk-xxxxxxxx"

# 覆盖 API 基础地址（接入国内模型）
export OPENAI_BASE_URL="https://api.deepseek.com/v1"

# 指定模型
export OPENAI_MODEL="deepseek-chat"
```

::: tip 优先级
环境变量 > config.toml > 默认值
:::
