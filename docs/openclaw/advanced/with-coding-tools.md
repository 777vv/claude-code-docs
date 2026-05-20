# 21. 联动 Codex / Claude Code

::: info 本章你将学到
- 为什么"OpenClaw + Codex / Claude Code"是黄金组合
- 三种联动模式：被动调用 / 主动调度 / 流水线
- 安装 `coding-agent` skill，让 OpenClaw 在 IM 里写代码
- 实战：飞书里一句话 → 自动改代码 → 提 PR → 通知你
- 安全和权限注意事项
:::

## 21.1 为什么要联动

OpenClaw、Codex、Claude Code 各有所长：

| 工具 | 擅长 | 短板 |
|---|---|---|
| **OpenClaw** | 多 channel / 长跑 / 协作 | 在 IDE 里写代码体验差 |
| **Codex** | 终端写代码 / 速度快 / 开源 | 不能"被远程触发" |
| **Claude Code** | 复杂代码 / 大代码库重构 | 同上 |

**联动后的格局**：
- 你在飞书发"修一下 user-service 的登录 bug"
- OpenClaw 收到 → 调 Codex / Claude Code 实际改代码
- 代码改完 → OpenClaw 提 PR → 回复你 PR 链接

效果：**手机随时随地触发"AI 帮我改代码"，电脑可以关机**。

## 21.2 三种联动模式

### 模式 A：OpenClaw → 调 Codex CLI

最简单。OpenClaw 把 Codex 当一个 shell 命令调。

```javascript
// skill 里
const result = await ctx.shell.run(
  'codex',
  ['--cwd', '/path/to/repo', '-m', '修复登录 bug'],
);
```

### 模式 B：OpenClaw → 调 Claude Code

类似：
```javascript
const result = await ctx.shell.run(
  'claude',
  ['--print', '修复登录 bug'],
  { cwd: '/path/to/repo' },
);
```

### 模式 C：OpenClaw 作"项目经理"编排多步

```
你说 "修 bug"
    ↓
OpenClaw（项目经理）
    ↓ 拆分任务
1. git clone 仓库
2. Claude Code 改代码
3. 跑测试
4. 推分支
5. 调 GitHub MCP 提 PR
6. 通知你
```

每一步可能用不同工具——OpenClaw 串起来。

## 21.3 装 coding-agent skill

OpenClaw 社区有现成的 `coding-agent` skill，封装了上述能力：

```bash
openclaw skill install coding-agent
```

它会要你配：
```bash
# .env
CODING_AGENT_TOOL=codex          # 用哪个：codex / claude
CODING_AGENT_WORKSPACE=/home/user/repos    # repo 工作目录
GITHUB_PAT=ghp_xxxxx              # 提 PR 需要
```

确认 codex 或 claude 命令在 PATH 里能跑：
```bash
which codex     # 应该返回路径
codex --version
```

如果没装 Codex，看 [Codex 入门](/codex/guide/installation)。

## 21.4 配 agent 用上

新建一个专门的 agent，叫 `coder-bot`：

```yaml
# coder-bot/agent.yaml
id: coder-bot
name: 编程小助手
model:
  provider: deepseek               # 编程小助手对话用便宜模型
  model: deepseek-chat
soul: ./soul.md
skills:
  - coding-agent
  - core/git
mcp:
  - github                         # 提 PR 要 GitHub MCP
channels:
  - feishu
behavior:
  auto_confirm_threshold: high     # 改代码必须确认
```

`soul.md`:
```markdown
# 你是谁
你是 [name] 的编程小助手 coder-bot。
专门接管"远程触发的代码任务"——主人在 IM 里说"修 X bug"，你去 clone 仓库、调 Codex/Claude Code 改代码、推分支、提 PR。

# 工作流
收到代码任务后：
1. 解析: 仓库名 / 任务描述 / 紧急程度
2. 确认: 在 IM 回复 "我要在 [repo] 仓库做 [task]，确认开始?"
3. 等主人 ✅
4. 执行: 调 coding-agent skill
5. 报告: 把 PR 链接发回 IM

# 边界
- 主人不点 ✅ 不开始
- 失败立刻报，不假装成功
- 测试不通过不提 PR
- 涉及生产配置 / 数据库 schema 改动必须人工 review
```

## 21.5 实战测试

飞书私聊 `coder-bot`：
```
帮我修 ai-learning-docs 项目里那个 404 页样式问题
```

预期对话：
```
coder-bot:
好的。我准备在 ai-learning-docs 仓库做"修复 404 页样式问题"。
打算用 Codex 做以下步骤：
1. clone 最新 main
2. 让 Codex 定位 404 页面相关文件并修改
3. 跑 lint 和 build
4. 推到新分支 fix/404-style
5. 提 PR

确认开始吗？

你: ✅

coder-bot:
开工。预计 3-5 分钟。

(2 分钟后)

coder-bot:
✅ 完成。
PR: https://github.com/xxx/ai-learning-docs/pull/87
摘要: 修改了 docs/404.md 的 CSS，加了 max-width 和居中对齐。
测试: lint 通过，build 通过。
等你 review。
```

## 21.6 进阶：定时巡检型联动

让 OpenClaw 定时跑 codex 自动维护项目：

```yaml
# workflows/weekly-maintenance.yaml
trigger:
  cron: "0 10 * * 1"            # 每周一 10 点

steps:
  - id: deps-update
    agent: coder-bot
    task: "在 ai-learning-docs 仓库跑 npm-check-updates，更新 minor 版本依赖，跑测试，提 PR"

  - id: lint-fix
    agent: coder-bot
    task: "在 ai-learning-docs 仓库跑 prettier 全量格式化 + eslint --fix，提 PR"

  - id: notify
    channel: feishu
    target: oc_dev_group
    message: "本周维护任务已跑完，请 review PR"
```

每周一自动跑——你的项目永远保持依赖最新、风格统一。

## 21.7 反向：Codex / Claude Code → 调 OpenClaw

也能反过来。Codex / Claude Code 写代码时调 OpenClaw 发通知：

```bash
# 在 Codex 终端里
claude -p "重构 user 模块完成后，让我手机收到飞书通知"

# Claude Code 自动调用：
openclaw message send --channel feishu --target ou_xxx --message "重构完成"
```

这要 OpenClaw 在 PATH 里。

## 21.8 安全清单

代码助手能 push 代码、提 PR、改你电脑的仓库——风险大。**必须做**：

✅ **专用机器**：跑 coder-bot 的机器只放你自己的代码、用一个隔离 GitHub PAT（细粒度权限）
✅ **PAT 最小权限**：只给特定 repo 的 read + PR 权限，**不给** admin / delete
✅ **auto_confirm_threshold: high**：每次改代码必须 IM 确认
✅ **PR 而非直推**：永远走 PR，不让 agent 直接 push 到 main
✅ **不挂在公司 OpenClaw**：用你的私人 OpenClaw 操作个人项目，别把公司项目挂上去（除非公司专门评估过）

## 21.9 选型建议

| 你的场景 | 推荐 |
|---|---|
| 个人项目，远程触发 AI 改代码 | OpenClaw + Codex |
| 个人项目，要求质量更高 | OpenClaw + Claude Code |
| 公司开源项目维护 | OpenClaw + Codex（开源协议） |
| 复杂大项目重构 | Claude Code 主力 + OpenClaw 触发 |
| 周期性维护任务 | OpenClaw workflow + Codex |
| 移动端临时改代码 | OpenClaw 飞书 + Codex |

## 21.10 实战案例的延伸

详细的"AI 在 IM 里帮你写代码"完整案例见：
- [32. 案例 8：AI 帮你写代码](/openclaw/cases/code-assistant)

包含：
- coder-bot 完整 soul + 配置
- 安全测试脚本
- 失败回滚机制
- 多个真实 PR 示例

---

## 看完这一章你应该知道

✅ OpenClaw + Codex/Claude Code = 移动端可触发的 AI 编程
✅ `coding-agent` skill 是现成方案
✅ 必须用专用 agent + 高 confirm 阈值 + 细粒度 PAT
✅ 永远走 PR，不直推
✅ 周期性任务用 workflow 跑

---

## 进阶篇结束 🎉

你已经掌握 OpenClaw 的全部核心进阶能力。
下面三章是**国内适配**，国内用户必读；后面 10 章是**实战案例**，挑你感兴趣的看。

**下一步**：[22. 国内 LLM 接入 →](/openclaw/china/models)

国内五大主流模型（DeepSeek / 通义 / Kimi / 智谱 / Ollama）保姆级接入教程。
