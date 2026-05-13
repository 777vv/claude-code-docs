# 17. 配置文件详解

::: info 本章你将学到
- 所有配置文件的位置和用途
- settings.json 的完整字段说明
- 环境变量配置方法
- 配置优先级和加载顺序
:::

## 17.1 配置文件总览

| 文件 | 位置 | 用途 | 优先级 |
|------|------|------|--------|
| `~/.claude/settings.json` | 用户主目录 | 全局默认配置 | 低 |
| `~/.claude.json` | 用户主目录 | 账号认证信息 | 中 |
| `.claude/settings.json` | 项目根目录 | 项目级配置 | 高 |
| `.mcp.json` | 项目根目录 | MCP 服务器定义 | 按需 |
| `CLAUDE.md` | 项目根目录 | 会话指令（AI 读取）| 会话级 |
| `CLAUDE.local.md` | 项目根目录 | 本地私有指令 | 最高 |

## 17.2 settings.json 完整字段

```json
{
  // ── 模型 ──────────────────────────────────────────
  "model": "sonnet",
  // 可用值：sonnet, opus, haiku，或完整模型 ID

  "modelOverrides": {
    "sonnet": "claude-sonnet-4-6",
    "opus": "claude-opus-4-7"
  },

  // ── API 连接 ───────────────────────────────────────
  "apiBase": "https://api.anthropic.com",
  // 国内用户可配置代理：https://api.siliconflow.cn/v1

  "apiKey": "${ANTHROPIC_API_KEY}",
  // 建议用环境变量，不要直接写入

  // ── 权限 ───────────────────────────────────────────
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(npm run *)",
      "Read",
      "Write"
    ],
    "deny": [
      "Bash(sudo *)",
      "Bash(rm -rf *)",
      "Bash(git push --force *)"
    ],
    "autoApprove": false
  },

  // ── MCP 服务器 ──────────────────────────────────────
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  },

  // ── 钩子 ────────────────────────────────────────────
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$FILE_PATH\"",
            "timeout": 30
          }
        ]
      }
    ]
  },

  // ── 编辑器 ──────────────────────────────────────────
  "editor": {
    "name": "code",
    "formatOnSave": true
  },

  // ── 终端 ────────────────────────────────────────────
  "terminal": {
    "shell": "/bin/bash",
    "timeout": 30000
  },

  // ── 功能开关 ────────────────────────────────────────
  "autoMemoryEnabled": true,
  "disableAllHooks": false,

  // ── 环境变量（会被合并到 Claude 执行的所有命令环境中）
  "env": {
    "NODE_ENV": "development",
    "USE_BUILTIN_RIPGREP": "0"
  }
}
```

## 17.3 模型配置详解

```bash
# settings.json 方式
{
  "model": "sonnet",
  "modelOverrides": {
    "sonnet": "claude-sonnet-4-6-20251001"
  }
}

# 环境变量方式（更高优先级）
export ANTHROPIC_DEFAULT_SONNET_MODEL=claude-sonnet-4-6-20251001
export ANTHROPIC_DEFAULT_OPUS_MODEL=claude-opus-4-7-20251001
export ANTHROPIC_DEFAULT_HAIKU_MODEL=claude-haiku-4-5-20251001

# 在 /model 选择器中添加自定义模型
export ANTHROPIC_CUSTOM_MODEL_OPTION=provider/my-custom-model
export ANTHROPIC_CUSTOM_MODEL_OPTION_NAME=我的定制模型
export ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION=针对代码审查优化的版本
```

## 17.4 核心环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `ANTHROPIC_API_KEY` | API 密钥 | `sk-ant-...` |
| `ANTHROPIC_API_BASE` | API 端点（配置代理时修改）| `https://api.anthropic.com` |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | 默认 Sonnet 模型 ID | `claude-sonnet-4-6` |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | 默认 Opus 模型 ID | `claude-opus-4-7` |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | 默认 Haiku 模型 ID | `claude-haiku-4-5` |
| `ANTHROPIC_HTTP_TIMEOUT` | HTTP 超时（毫秒）| `60000` |
| `HTTP_PROXY` | HTTP 代理 | `http://127.0.0.1:7890` |
| `HTTPS_PROXY` | HTTPS 代理 | `http://127.0.0.1:7890` |
| `ANTHROPIC_BETAS` | 启用 Beta 功能 | `structured-outputs` |
| `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` | 禁用实验性功能 | `1` |

### 在不同 Shell 中设置

::: code-group

```bash [Bash / Zsh]
# 临时（当前 shell 会话）
export ANTHROPIC_API_KEY="sk-ant-..."

# 永久（加入 ~/.bashrc 或 ~/.zshrc）
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.bashrc
source ~/.bashrc
```

```powershell [PowerShell]
# 临时
$env:ANTHROPIC_API_KEY = "sk-ant-..."

# 永久（写入用户级环境变量）
[Environment]::SetEnvironmentVariable(
    "ANTHROPIC_API_KEY", "sk-ant-...", "User"
)
```

```cmd [Windows CMD]
# 永久（需重新打开 CMD 才生效）
setx ANTHROPIC_API_KEY "sk-ant-..."
```

:::

## 17.5 ~/.claude.json — 账号信息

::: warning 安全提示
`~/.claude.json` 包含你的认证信息，不要分享或提交到版本控制系统。
:::

```json
{
  "accounts": [
    {
      "type": "console",
      "apiKey": "sk-ant-..."
    }
  ],
  "activeAccount": 0,
  "lastSessionId": "sess_xxx",
  "sessionHistory": [
    {
      "id": "sess_xxx",
      "project": "/Users/me/my-project",
      "lastAccess": "2026-05-13T10:30:00Z"
    }
  ]
}
```

## 17.6 配置优先级（低→高）

```
~/.claude/settings.json      (全局默认)
       ↓
.claude/settings.json        (项目级)
       ↓
环境变量                      (高优先级)
       ↓
命令行参数                    (最高优先级)
```

::: tip 调试配置
运行 `claude doctor` 可以查看当前实际生效的配置来源和值，方便排查冲突。
:::

---

下一步：[插件（Plugins）](/advanced/plugins)
