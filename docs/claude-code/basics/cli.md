# 7. CLI 命令与参数完整参考

::: info 本章你将学到
- 所有 `claude` 子命令
- 所有常用命令行参数（Flags）
- 模型选择和输出格式控制
:::

::: tip
`claude --help` **不会列出所有参数**。本章是最完整的中文参考。
:::

## 7.1 顶级命令

| 命令 | 说明 |
|------|------|
| `claude` | 启动交互式会话 |
| `claude "query"` | 带初始提示启动 |
| `claude -p "query"` | 单次查询，结束后退出 |
| `claude update` | 立即升级到最新版 |
| `claude doctor` | 诊断安装与配置 |
| `claude auth` | 账号管理（见下方）|
| `claude mcp` | 管理 MCP 服务器 |
| `claude plugin` | 管理插件（别名 `plugins`）|
| `claude agents` | 列出所有子代理 |
| `claude setup-token` | 生成 CI 用的长效 Token |

### auth 子命令

```bash
claude auth login            # OAuth 登录（Claude 订阅）
claude auth login --console  # API Key 登录（Anthropic Console）
claude auth login --bedrock  # Amazon Bedrock
claude auth login --vertex   # Google Vertex AI
claude auth logout           # 退出登录
claude auth status           # 查看登录状态
```

### mcp 子命令

```bash
claude mcp add <name> <command>   # 添加 MCP 服务器
claude mcp list                    # 列出已配置的服务器
claude mcp remove <name>           # 移除服务器
claude mcp get <name>              # 查看某个服务器详情
```

## 7.2 会话控制参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `-c`, `--continue` | 继续当前目录最近的对话 | `claude -c` |
| `-r [id/name]` | 按 ID 或名称恢复会话 | `claude -r auth-fix` |
| `-n <name>` | 给本次会话命名 | `claude -n "feature-x"` |
| `--fork-session` | 恢复时创建新 ID（保留原会话） | `claude -c --fork-session` |
| `--bare` | 极简模式，跳过 hooks/skills/plugins | `claude --bare` |

## 7.3 模型与能力参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--model <name>` | 指定模型 | `--model opus` |
| `--fallback-model <name>` | 模型过载时的备选模型 | `--fallback-model sonnet` |
| `--agent <name>` | 指定使用的子代理 | `--agent security-reviewer` |
| `--worktree, -w [name]` | 在隔离的 git worktree 中启动 | `claude -w feature-auth` |

**可用模型名称**：

| 简称 | 对应模型 |
|------|---------|
| `sonnet` | claude-sonnet-4-6（默认）|
| `opus` | claude-opus-4-7 |
| `haiku` | claude-haiku-4-5 |

## 7.4 权限控制参数

| 参数 | 说明 |
|------|------|
| `--permission-mode <mode>` | 启动时的权限模式 |
| `--dangerously-skip-permissions` | 跳过所有权限确认 ⚠️ |
| `--allowedTools "Bash(git *) Read"` | 预批准指定工具 |
| `--disallowedTools "Edit"` | 禁用指定工具 |
| `--tools "Bash,Edit,Read"` | 只允许白名单工具 |

**权限模式（`--permission-mode`）选项**：

| 模式 | 行为 |
|------|------|
| `default` | 每个修改性操作都询问（默认）|
| `acceptEdits` | 自动接受所有文件编辑 |
| `plan` | 只读：不能修改任何东西 |
| `auto` | 分类器判断，危险操作才问你 |
| `bypassPermissions` | 跳过所有检查 ⚠️ |

## 7.5 输入/输出参数

| 参数 | 说明 | 适用 |
|------|------|------|
| `--output-format text` | 纯文本输出（默认）| `-p` 模式 |
| `--output-format json` | JSON 格式输出 | `-p` 模式，脚本解析 |
| `--output-format stream-json` | 流式 JSON 输出 | `-p` 模式，实时处理 |
| `--max-turns <n>` | 限制 agent 最大回合数 | 防止无限循环 |
| `--max-budget-usd <n>` | 最大花费（美元）| 成本控制 |

## 7.6 系统提示参数

| 参数 | 说明 |
|------|------|
| `--append-system-prompt "..."` | 在默认 System Prompt 后追加文本 |
| `--system-prompt "..."` | 完全替换 System Prompt |

```bash
# 示例：让 Claude 只用中文回复
claude --append-system-prompt "请始终用中文回复，即使用户用英文提问"

# 示例：给 CI 用，只返回结构化结果
claude -p "审查这个 PR" --system-prompt "你是一个严格的代码审查员。只输出 JSON，格式：{score: 0-10, issues: []}"
```

## 7.7 调试参数

| 参数 | 说明 |
|------|------|
| `--verbose` | 详细日志 |
| `--debug [category]` | 调试模式，可指定分类 |
| `--debug-file <path>` | 将调试日志写入文件 |

```bash
# 调试 API 和 MCP 连接
claude --debug "api,mcp"

# 将所有日志写到文件
claude --debug-file /tmp/claude-debug.log
```

## 7.8 IDE 集成参数

```bash
# 自动连接到已打开的 IDE 窗口（VS Code / JetBrains）
claude --ide

# 进入特定 worktree
claude -w my-feature --ide
```

## 7.9 目录参数

```bash
# 给 Claude 额外访问 ~/docs 的权限
claude --add-dir ~/docs

# 多个额外目录
claude --add-dir ~/shared-libs --add-dir ~/configs
```

## 7.10 MCP 相关参数

```bash
# 加载指定的 MCP 配置文件（而不是默认的 .mcp.json）
claude --mcp-config ./custom-mcp.json
```

---

下一步：[斜杠命令完整参考](/claude-code/basics/slash-commands)
