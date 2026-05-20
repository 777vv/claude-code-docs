# 8. 斜杠命令

::: info 本章你将学到
- 所有内置斜杠命令（7 大类，50+ 条）
- 如何创建自定义斜杠命令
- 常用命令的使用场景
:::

在交互式会话中，输入 `/` 可以看到所有可用命令并进行自动补全。

## 8.1 会话管理

| 命令 | 功能 |
|------|------|
| `/help` | 显示帮助和可用命令 |
| `/clear` | 清空上下文，开启新会话（别名：`/new`、`/reset`）|
| `/compact [指令]` | 总结对话历史以释放上下文，可加「聚焦指令」|
| `/context` | 可视化当前上下文占用分布 |
| `/resume`、`/continue` | 恢复之前的对话 |
| `/rewind` | 回到某个检查点（别名：`/checkpoint`、`/undo`）|
| `/branch [name]` | 从当前点创建对话分支（别名：`/fork`）|
| `/rename [name]` | 给当前会话命名 |
| `/export [filename]` | 导出会话为纯文本 |
| `/copy [N]` | 复制最后一次回复（或倒数第 N 次）|
| `/diff` | 交互式查看每次改动的 diff |
| `/cost` | Token 用量统计 |
| `/exit` | 退出 CLI（别名：`/quit`）|

::: tip /compact 的高级用法
```
/compact 专注于认证逻辑
/compact 只保留关于数据库 schema 的讨论
```
告诉 Claude 压缩时重点保留什么，避免丢失关键上下文。
:::

## 8.2 配置与状态

| 命令 | 功能 |
|------|------|
| `/config` | 打开设置界面（别名：`/settings`）|
| `/status` | 查看版本、模型、账号、连接状态 |
| `/doctor` | 诊断安装问题（按 `f` 让 Claude 自动修复）|
| `/model [name]` | 切换模型（`sonnet`、`opus`、`haiku`）|
| `/effort [level]` | 调整推理强度（`low/medium/high/xhigh/max`）|
| `/permissions` | 管理工具权限（别名：`/allowed-tools`）|
| `/sandbox` | 开关沙盒模式 |
| `/theme` | 切换颜色主题 |
| `/color` | 临时修改提示栏颜色 |
| `/keybindings` | 打开或创建快捷键配置文件 |
| `/statusline` | 配置状态栏显示内容 |

## 8.3 项目与记忆

| 命令 | 功能 |
|------|------|
| `/init` | 分析代码库自动生成 `CLAUDE.md` |
| `/memory` | 查看/编辑记忆文件，开关 auto memory |
| `/add-dir <path>` | 会话中追加工作目录 |

::: tip /init 的作用
在项目根目录运行 `/init`，Claude 会扫描项目结构、`package.json`、配置文件等，自动生成一个起点 `CLAUDE.md`，包含检测到的构建命令、测试指令和项目约定。

可以设置环境变量 `CLAUDE_CODE_NEW_INIT=1` 开启多阶段交互流程，Claude 会额外询问是否同时生成 skills、hooks 和个人记忆。
:::

## 8.4 扩展（技能 / 代理 / 钩子 / MCP / 插件）

| 命令 | 功能 |
|------|------|
| `/skills` | 列出所有可用技能 |
| `/agents` | 管理子代理配置 |
| `/hooks` | 查看钩子配置 |
| `/mcp` | 管理 MCP 服务器连接，查看 OAuth 状态 |
| `/plugin` | 浏览插件市场，管理已安装插件 |
| `/reload-plugins` | 热重载所有插件（不需要重启）|

## 8.5 工作流（内置 Skills）

这些是 Anthropic 官方内置的工作流命令，本质上是 Skills：

| 命令 | 功能 |
|------|------|
| `/plan [描述]` | 进入计划模式，让 Claude 先探索再规划 |
| `/review [PR]` | 本地评审 PR 或当前分支 |
| `/ultrareview [PR]` | 云端多代理深度评审（付费）|
| `/security-review` | 分析当前分支的安全风险 |
| `/simplify [focus]` | 3 个代理并行审查并修复代码质量问题 |
| `/debug [描述]` | 开启调试日志并分析问题 |
| `/batch <指令>` | 大规模并行改动（自动拆成 5–30 个子任务，每个开独立 PR）|
| `/loop [间隔] [prompt]` | 按间隔循环执行提示词 |
| `/schedule` | 创建定时任务（Anthropic 托管，别名：`/routines`）|
| `/claude-api` | 加载 Anthropic SDK 参考资料 |
| `/fewer-permission-prompts` | 扫描历史生成权限白名单，减少弹窗 |

::: tip /batch 的威力
```
/batch 把 src/ 下所有 React 类组件迁移到函数组件
/batch 给所有没有测试的 service 文件补充单元测试
/batch 把所有 console.log 改成 logger.debug
```
Claude 会把任务拆分，**并行**处理多个文件，每个生成独立 PR。
:::

## 8.6 GitHub / 远程 / 多端

| 命令 | 功能 |
|------|------|
| `/install-github-app` | 一键配置 GitHub Actions 集成 |
| `/install-slack-app` | 安装 Claude Slack App |
| `/autofix-pr` | 云端监视 PR 失败并自动推送修复 |
| `/teleport` | 把网页会话拉回本地终端（别名：`/tp`）|
| `/desktop` | 当前会话转到桌面 App（别名：`/app`）|
| `/remote-control` | 让本会话可被 claude.ai 远程控制（别名：`/rc`）|
| `/voice [hold\|tap\|off]` | 语音听写 |
| `/mobile` | 显示下载手机 App 的二维码（别名：`/ios`、`/android`）|

## 8.7 杂项实用命令

| 命令 | 功能 |
|------|------|
| `/btw <问题>` | 问「顺便问一下」，不污染主对话上下文 |
| `/fast [on\|off]` | 开关快速模式（使用 Opus 的快速推理）|
| `/focus` | 聚焦视图：只显示最新 prompt 和结果 |
| `/tui [default\|fullscreen]` | 切换终端渲染器 |
| `/recap` | 生成一行会话摘要 |
| `/stats` | 可视化每日用量、会话记录、连胜 |
| `/usage` | 查看订阅用量和限制 |
| `/insights` | 分析你的 Claude Code 使用报告 |
| `/powerup` | 通过动画教程发现新功能 |
| `/tasks` | 管理后台任务（别名：`/bashes`）|
| `/release-notes` | 查看更新日志 |
| `/feedback` | 提交反馈（别名：`/bug`）|
| `/team-onboarding` | 从使用历史生成团队上手指南 |

## 8.8 创建自定义斜杠命令

你可以创建自己的 `/命令名` 命令，本质上是一个 Skill 文件。

**创建步骤**：

```bash
# 个人级命令（所有项目可用）
mkdir -p ~/.claude/skills/my-command
```

编辑 `~/.claude/skills/my-command/SKILL.md`：

```markdown
---
name: my-command
description: 描述这个命令做什么，什么时候该用
---

当用户调用这个命令时，执行以下步骤：

1. ...
2. ...
```

创建后，输入 `/my-command` 即可调用。

**项目级命令**（只在当前项目可用，可提交到 git 共享给团队）：

```bash
mkdir -p .claude/skills/deploy-check
```

详细的 Skills 创建说明见 [第 13 章：技能](/claude-code/advanced/skills)。

---

下一步：[键盘快捷键](/claude-code/basics/shortcuts)
