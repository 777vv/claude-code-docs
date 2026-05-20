# 11. 权限与模式

::: info 本章你将学到
- Claude Code 的权限设计哲学
- 5 种权限模式及切换方法
- 如何精细配置允许和拒绝规则
- 沙盒模式的使用
:::

## 11.1 权限设计哲学

Claude Code 默认对任何可能影响系统的操作（写文件、运行 Bash、调用 MCP 工具）都会**征求你的同意**。这很安全，但有时会频繁打扰。

权限系统让你在安全性和便利性之间找到平衡。

## 11.2 五种权限模式

用 <kbd>Shift</kbd>+<kbd>Tab</kbd> 循环切换，或启动时用 `--permission-mode` 参数指定。

| 模式 | 行为 | 适用场景 |
|------|------|---------|
| `default` | 每个修改性操作都询问你 | 生产代码、不熟悉的代码库 |
| `plan` | 只读：Claude 只能探索和规划，不能修改任何东西 | 先理解再动手 |
| `acceptEdits` | 自动接受所有文件编辑，Bash 命令仍需确认 | 你信任的编辑任务 |
| `auto` | 智能分类器判断是否放行，危险操作才询问 | 长任务不想频繁确认 |
| `bypassPermissions` | 跳过所有权限检查 ⚠️ | 受控沙盒或完全信任环境 |

::: danger bypassPermissions 的风险
`bypassPermissions` 和 `--dangerously-skip-permissions` 让 Claude 可以自由执行任何命令，包括 `rm -rf`、`git push --force` 等危险操作。**只在你完全信任该会话并准备好接受后果的情况下使用**，例如：在隔离的 Docker 容器里、对临时的测试仓库。
:::

## 11.3 精细权限控制（/permissions）

在会话中输入 `/permissions` 打开权限管理界面，可以设置：

```
allow: Bash(npm run lint)      # 允许运行 npm run lint
allow: Bash(git commit *)      # 允许所有 git commit 命令
allow: Bash(git diff *)        # 允许所有 git diff 命令
allow: Read                    # 允许读取所有文件
allow: Write                   # 允许写入所有文件
ask:   Edit                    # Edit 操作还是要问
deny:  Bash(rm -rf *)          # 永远拒绝 rm -rf
deny:  Bash(sudo *)            # 永远拒绝 sudo
```

**通配符规则**：
- `Bash(git *)` — 所有以 `git ` 开头的命令
- `Bash(npm run *)` — 所有 `npm run` 命令
- `Bash(rm -rf *)` — 所有 `rm -rf` 命令

## 11.4 配置文件中的权限

把权限规则写入 `.claude/settings.json` 可以让规则持久化，每次启动自动生效：

```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(npm run *)",
      "Bash(npx prettier *)",
      "Read",
      "Write"
    ],
    "deny": [
      "Bash(sudo *)",
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Bash(DROP *)",
      "Bash(mkfs *)"
    ]
  }
}
```

## 11.5 自动生成权限白名单

不知道该允许哪些命令？让 Claude 帮你分析历史：

```
/fewer-permission-prompts
```

Claude 会扫描你之前的会话记录，找出你一贯批准的操作，自动生成一份权限白名单添加到 settings.json。**大幅减少以后的弹窗**。

## 11.6 沙盒模式（/sandbox）

在支持的系统（macOS Seatbelt、Linux seccomp）上，沙盒模式提供操作系统级别的隔离：

```
/sandbox        开关沙盒模式
```

开启后：
- 文件系统访问受限（只能访问被允许的目录）
- 网络访问受限
- 在这个受限边界内，Claude 可以自由工作而不需要频繁询问

::: tip 适合场景
沙盒模式特别适合长时间的自动化任务——你设好边界，让 Claude 在里面自主工作，不用频繁确认，也不用担心它越界。
:::

## 11.7 CLI 参数控制权限

```bash
# 启动时预批准特定工具
claude --allowedTools "Bash(git *) Read Write"

# 禁用特定工具
claude --disallowedTools "Bash(rm *)"

# 只允许白名单工具
claude --tools "Read,Grep,Glob"

# 进入只读计划模式
claude --permission-mode plan

# 危险：跳过所有权限确认
claude --dangerously-skip-permissions
```

---

下一步：[计划模式](/claude-code/advanced/plan-mode)
