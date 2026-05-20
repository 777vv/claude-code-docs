# 25. 故障排除

::: info 本章你将学到
- 诊断工具的使用方法
- 常见错误的原因和修复步骤
- 如何获取帮助
:::

## 25.1 诊断工具

遇到问题，先跑这些命令：

```bash
# 全面诊断（首选）
claude doctor

# 查看版本
claude --version

# 详细日志（调试 API 连接）
claude --debug "api"

# 调试 MCP 连接
claude --debug "mcp"

# 调试所有内容
claude --debug "api,mcp,hooks"

# 把调试日志写到文件
claude --debug-file /tmp/debug.log
```

在会话中：
```
/doctor       → 诊断，按 f 让 Claude 自动修复
/status       → 查看账号、模型、连接状态
/heapdump     → 导出内存堆快照（排查内存问题）
```

## 25.2 安装后 `claude` 命令找不到

**原因**：安装目录不在 `PATH` 中。

```bash
# macOS / Linux：把 ~/.local/bin 加入 PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 或 Zsh
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Windows**：
- 检查是否安装了 [Git for Windows](https://git-scm.com/downloads/win)
- 重新运行安装脚本

**npm 安装后找不到**：参见 [官方故障排除文档](https://code.claude.com/docs/en/troubleshooting#native-binary-not-found-after-npm-install)。

## 25.3 登录失败 / 认证错误

```bash
# 重新登录
claude auth login

# 查看认证状态
claude auth status

# 如果用 API Key，验证 Key 是否有效
curl -H "x-api-key: $ANTHROPIC_API_KEY" \
     https://api.anthropic.com/v1/messages \
     -d '{"model":"claude-haiku-4-5","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}' \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json"
```

## 25.4 网络连接问题（国内用户）

```bash
# 测试 API 可达性
curl -I https://api.anthropic.com

# 走代理测试
curl -I --proxy http://127.0.0.1:7890 https://api.anthropic.com

# 用国内服务商
export ANTHROPIC_API_BASE="https://api.siliconflow.cn/v1"
export ANTHROPIC_API_KEY="your-siliconflow-key"
```

详细国内配置见 [国内模型接入](/china/models)。

## 25.5 搜索失败（ripgrep 问题）

**Alpine Linux 或 musl 系统**：

```bash
# 安装依赖
apk add libgcc libstdc++ ripgrep

# 或禁用内置 ripgrep，使用系统安装的
# 在 ~/.claude/settings.json 中添加：
{
  "env": {
    "USE_BUILTIN_RIPGREP": "0"
  }
}
```

## 25.6 Windows 找不到 Git Bash

```json
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
  }
}
```

## 25.7 Claude 不遵循 CLAUDE.md

1. 运行 `/memory` 验证文件是否被加载
2. 让指令更具体：「用 2 格缩进」比「代码要整洁」有效
3. 检查多个 CLAUDE.md 是否互相冲突（运行 `claude doctor`）
4. 文件太长时精简（建议 < 200 行），或用 path-scoped rules

## 25.8 权限弹窗太频繁

```
# 方法 1：切换到 auto 模式（Shift+Tab 循环）
# 方法 2：自动生成白名单
/fewer-permission-prompts

# 方法 3：手动添加规则
/permissions
→ 添加 allow: Bash(git *) 等规则
```

## 25.9 上下文消耗太快

```
# 查看占用分布
/context

# 手动压缩
/compact 只保留关于认证的讨论

# 任务间清空
/clear

# 长研究任务交给子代理
用 Explore 子代理分析 src/ 目录
```

## 25.10 Hooks 不工作

```bash
# 验证 settings.json 语法
cat .claude/settings.json | python -m json.tool

# 临时禁用所有 hooks（排查是否是 hooks 问题）
# 在 settings.json 中添加：
{
  "disableAllHooks": true
}

# 查看已配置的 hooks
/hooks

# 手动测试 hook 脚本
echo '{"toolName":"Write","filePath":"test.ts"}' | \
  bash .claude/hooks/my-hook.sh
```

## 25.11 内存/CPU 过高

```
/heapdump     导出堆快照到桌面（然后用 Chrome DevTools 分析）
```

如果是持续性问题，检查是否有大文件被反复读取（可能是 node_modules 目录没有被忽略）。

在 `.claude/settings.json` 中排除大目录：

```json
{
  "ignorePatterns": [
    "node_modules",
    ".git",
    "dist",
    "build",
    "*.min.js"
  ]
}
```

## 25.12 获取帮助

| 渠道 | 说明 |
|------|------|
| 📚 官方文档 | [code.claude.com/docs](https://code.claude.com/docs) |
| 🐛 故障排除 | [code.claude.com/docs/en/troubleshooting](https://code.claude.com/docs/en/troubleshooting) |
| 💬 Discord | [anthropic.com/discord](https://www.anthropic.com/discord) |
| 🐙 GitHub Issues | [github.com/anthropics/claude-code/issues](https://github.com/anthropics/claude-code/issues) |
| 💡 会话内 | 输入 `/help`，或直接问 Claude「怎么...」|
| 📮 反馈 | `/feedback` 或 `/bug` |
