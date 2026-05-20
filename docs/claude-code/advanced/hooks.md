# 15. 钩子（Hooks）

::: info 本章你将学到
- Hooks 是什么，与 CLAUDE.md 的区别
- 所有钩子事件类型
- 如何配置命令型和 HTTP 型钩子
- 用钩子自动格式化、阻止危险操作、发送通知
:::

## 15.1 Hooks 是什么

**Hooks（钩子）** 是在 Claude Code 生命周期特定时点自动执行的脚本或 HTTP 请求。

CLAUDE.md 是「建议」——Claude 可能会遵循；Hooks 是「强制」——**保证动作一定发生**，无论 Claude 有没有想到。

典型应用：
- 每次文件修改后自动运行格式化（Prettier、ESLint）
- 阻止 Claude 运行危险的 Bash 命令
- 会话结束后发 Slack 通知
- 提交前自动跑测试

## 15.2 钩子事件类型

| 事件 | 触发时机 |
|------|---------|
| `SessionStart` | 会话开始或恢复 |
| `SessionEnd` | 会话结束 |
| `UserPromptSubmit` | 用户提交 prompt 之前 |
| `PreToolUse` | 工具调用之前（**可以阻止！**）|
| `PostToolUse` | 工具调用成功之后 |
| `PostToolUseFailure` | 工具调用失败之后 |
| `Stop` | Claude 回答完毕 |
| `PreCompact` / `PostCompact` | 上下文压缩前后 |
| `Notification` | Claude 发出通知 |
| `FileChanged` | 监视的文件发生变化 |
| `SubagentStart` / `SubagentStop` | 子代理启动/结束 |

## 15.3 基础配置结构

在 `.claude/settings.json` 或 `~/.claude/settings.json` 中配置：

```json
{
  "hooks": {
    "<事件名>": [
      {
        "matcher": "<工具名或模式>",
        "hooks": [
          {
            "type": "command",
            "command": "要执行的命令",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

## 15.4 实用示例

### 示例一：文件修改后自动格式化

```json
{
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
  }
}
```

### 示例二：修改后自动跑 ESLint

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx eslint --fix \"$FILE_PATH\" 2>/dev/null || true",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### 示例三：阻止危险的删除命令

钩子配置：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm -rf *)",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous.sh"
          }
        ]
      }
    ]
  }
}
```

`.claude/hooks/block-dangerous.sh`：

```bash
#!/bin/bash
# 通过标准输出返回 JSON 来阻止工具调用
jq -n '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: "禁止执行 rm -rf，请先确认你真的想删除这些文件"
  }
}'
```

```bash
chmod +x .claude/hooks/block-dangerous.sh
```

### 示例四：会话结束后发 Slack 通知

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "http",
            "url": "https://hooks.slack.com/services/xxx/yyy/zzz",
            "method": "POST",
            "headers": { "Content-Type": "application/json" },
            "body": "{\"text\": \"Claude Code 会话已结束：$SESSION_ID\"}"
          }
        ]
      }
    ]
  }
}
```

### 示例五：提交前跑测试

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit *)",
        "hooks": [
          {
            "type": "command",
            "command": "npm test -- --passWithNoTests",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

## 15.5 四种钩子类型

| 类型 | 说明 |
|------|------|
| `command` | 执行本地 shell 脚本，通过 stdin 接收 JSON 事件数据 |
| `http` | 向 HTTP 端点发送 POST 请求 |
| `prompt` | 把事件数据发给 Claude，让它做是/否判断 |
| `agent` | 启动子代理做复杂验证 |

## 15.6 钩子可用的环境变量

| 变量 | 内容 |
|------|------|
| `$FILE_PATH` | 被操作的文件路径（Write/Edit 事件）|
| `$CLAUDE_PROJECT_DIR` | 当前项目根目录 |
| `$SESSION_ID` | 当前会话 ID |
| `$TOOL_NAME` | 触发钩子的工具名 |
| `$TOOL_INPUT` | 工具的输入参数（JSON）|

## 15.7 管理钩子

```
/hooks                  只读浏览所有已配置钩子
```

**完全禁用所有钩子**（调试时有用）：

```json
{
  "disableAllHooks": true
}
```

::: tip 让 Claude 帮你写钩子
直接告诉 Claude：
```
写一个钩子，每次 Claude 修改 TypeScript 文件后，自动运行 tsc --noEmit 检查类型错误
```
Claude 可以自动生成配置和脚本。
:::

---

下一步：[MCP 协议](/advanced/mcp)
