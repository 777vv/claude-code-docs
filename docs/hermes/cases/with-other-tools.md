# 33. 案例 9：联动 Codex / Claude Code / OpenClaw

::: info 这个案例你将做出来
让本站 4 个 AI 工具**协同工作**：
- **Hermes**：主控调度 + 长跑记忆
- **OpenClaw**：接国内 IM（飞书 / 钉钉）
- **Codex / Claude Code**：实际改代码

效果：飞书发"修个 bug" → OpenClaw → Hermes → Codex/Claude → 提 PR → 反馈飞书。

**本站独家组合方案**。
:::

## 33.1 4 工具协同架构

```
[国内 IM: 飞书 / 钉钉 / 微信]
        ↓
[OpenClaw Gateway] ← 接国内 IM 的入口层
        ↓ 转发
[Hermes Gateway] ← 主控大脑、长记忆、协调器
        ↓ 派任务
   ┌────┴────┬──────────┬────────────┐
   ↓         ↓          ↓            ↓
[Codex]   [Claude Code]  [Hermes 自己干]  [浏览器自动化]
 编程     高阶编程        通用 agent      Browser Use
```

每个工具发挥所长：
- **OpenClaw**: 国内 IM（Hermes 不支持）
- **Hermes**: agent loop / Honcho 记忆 / subagent 并行
- **Codex**: 终端轻量编程
- **Claude Code**: 复杂多文件改动

## 33.2 准备：4 个工具都装好

```bash
# 1. Hermes
hermes --version           # v0.8+

# 2. OpenClaw
openclaw --version         # v1.2+

# 3. Codex
codex --version

# 4. Claude Code
claude --version
```

每个工具按各自章节装好。

## 33.3 OpenClaw 配 Hermes 桥接

让 OpenClaw 把国内 IM 消息转发到 Hermes。

`~/.openclaw/workspace/skills/hermes-bridge/SKILL.md`:
```markdown
---
id: hermes-bridge
permissions: [shell_exec]
---

# Hermes 桥接

把用户消息转发给 Hermes 处理，等回复后转回用户。

## Capability: relay(message, user_id)
调用 hermes CLI 处理，返回结果。
```

`handler.js`:
```javascript
import { execFile } from 'child_process';
import { promisify } from 'util';
const exec = promisify(execFile);

export async function relay(message, user_id) {
  const { stdout, stderr } = await exec('hermes', [
    message,
    '--quiet',
    '--user', String(user_id),
    '--timeout', '600'         // 10 分钟
  ]);
  return stdout.trim();
}
```

OpenClaw agent.yaml:
```yaml
id: bridge-agent
soul: ./soul.md
skills: [hermes-bridge]
channels: [feishu, dingtalk]
```

soul.md:
```markdown
# 你是 Hermes 的桥梁
所有用户消息原样转 Hermes，回复转回。不自己回答。
```

## 33.4 Hermes 配 Codex / Claude Code 工具

Hermes 已经能跑 shell。让它知道 Codex / Claude Code 可用：

`~/.hermes/skills/coding-tools/SKILL.md`:
```markdown
---
name: coding-tools
description: 协调 Codex / Claude Code 完成代码任务
---

# 编程工具调度

## 何时用 Codex
- 单文件小改（< 50 行）
- 简单 bug fix
- 写小脚本

## 何时用 Claude Code
- 多文件重构
- 大代码库重构
- 复杂 architectural 改动
- 跨项目协调

## 工作流
1. 解析任务: 仓库 / 任务描述 / 紧急度
2. 选工具: 按上面规则
3. 设置 worktree: cd repo && git checkout -b auto/<task>
4. 调用 codex 或 claude:
   - codex --task "..."
   - claude -p "..."
5. 跑测试 / lint
6. git push + 提 PR (用 GitHub MCP)
7. 把 PR 链接报回主人

## 失败处理
- 测试不通过 → 不提 PR，把 WIP 推到分支
- 工具超时 → 切到另一个工具试
- 多次失败 → 把状态告诉主人，让他人工介入
```

## 33.5 完整工作流：飞书发"修 bug"

### 用户视角

```
你 (飞书): @小爪 修一下 user-service 项目登录超时 bug，
         尝试用 Codex 改，跑通测试后提 PR

[等 8 分钟]

@小爪 (飞书): ✅ 完成
PR: https://github.com/.../pull/87
摘要: 修改了 src/auth/login.ts 第 42 行的 timeout 设置
测试: 132 passed
等你 review。
```

### 系统内部

```
[飞书 webhook]
       ↓
OpenClaw bridge-agent 收到消息
       ↓ relay()
hermes "修 user-service 登录超时 bug，用 Codex 改完提 PR"
       ↓ Hermes 加载 coding-tools skill
Hermes 推理:
  - 仓库: user-service
  - 任务: bug fix
  - 选 Codex（小改）
  - worktree: ~/projects/user-service-fix-login

Hermes 执行步骤:
  1. git checkout -b fix/login-timeout
  2. codex --task "fix login timeout bug" --cwd .
  3. (Codex 跑了 4 分钟改完)
  4. npm test → 132 passed
  5. git push origin fix/login-timeout
  6. github MCP create PR
  7. 返回 PR 链接

[回 OpenClaw]
       ↓
OpenClaw 推回飞书
       ↓
用户看到 PR 链接
```

8 分钟搞定整个流程，**完全在飞书里发起 + 收到**。

## 33.6 多工具组合的其他场景

### 场景 A：周末自动维护

```yaml
# Hermes workflow
trigger:
  cron: "0 10 * * 6"          # 周六 10 点

steps:
  - id: deps
    hermes_task: "用 Codex 在 ai-learning-docs 仓库跑 npm-check-updates，更新 minor，提 PR"

  - id: refactor
    hermes_task: "用 Claude Code 重构 src/legacy 模块，提 PR"
    sub_agents:
      tools: [claude-code]

  - id: docs
    hermes_task: "用 Codex 给所有公开函数加 JSDoc"

  - id: notify
    openclaw_send:
      channel: feishu
      target: ${MY_OPEN_ID}
      message: "周末维护完成，3 个 PR 等 review"
```

整套周末自动跑，周一回来 3 个 PR 等你看。

### 场景 B：紧急 hotfix（生产报警 → AI 修）

```
[Sentry 收到 P0 报警]
       ↓ webhook
OpenClaw 收到，转 Hermes
       ↓
Hermes 分析:
  - 错误类型: NullPointer
  - 文件位置: src/api/user.ts:42
  - 用 Claude Code (因为要看整个 user 模块)

Hermes 调 Claude Code:
  → 定位问题
  → 修代码 + 写回归测试
  → push hotfix 分支
  → 提 PR
       ↓
飞书 P0 告警群收到:
"🚨 自动修复 PR 已提，等你 review:
 PR: ...
 测试覆盖: 已加 3 个用例
 风险评估: 低（只改了 user.ts 第 42 行附近）"
```

凌晨报警，AI 自动初步修，你早上看一眼就 merge。

### 场景 C：研究 → 实现一条龙

```
你 (CLI): 调研 5 个开源 RAG 框架，选一个最适合我们的接进项目

Hermes:
Stage 1 (subagents): 5 个 subagent 并行调研 5 个框架
Stage 2 (汇总): 给出对比报告
Stage 3 (推荐): "推荐 LlamaIndex，因为：..."
Stage 4 (实现): "要我用 Claude Code 把它接入吗？"

你: 好

Stage 5: Hermes 调 Claude Code:
  - 创建分支 feature/integrate-llamaindex
  - 装包
  - 写 integration 代码
  - 写测试
  - 提 PR

总时间: 1.5 小时
你只需要: 拍 2 个板（"OK 调研" + "OK 实现"）
```

## 33.7 数据流和记忆共享

不同工具间的状态共享：

```
Hermes Honcho (中心记忆)
  ├── 知道用户偏好（用户喜欢 TypeScript / 偏好简洁 PR 描述）
  ├── 知道项目历史（哪个 PR 最近 review 通过）
  └── 决策时综合 Honcho 数据

OpenClaw Memory
  ├── 知道国内 IM 上下文（群成员 / 群规则）
  └── 转发时携带必要 context 给 Hermes

Codex / Claude Code
  ├── 各自有自己的工作日志（agent.md）
  └── Hermes 调用时透传任务上下文
```

整套系统**像一个团队**，不同人各司其职，由 Hermes 当 PM 协调。

## 33.8 配置统一

为避免重复配置，可建共享 `.env`：

```bash
# ~/.shared-env
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
DEEPSEEK_API_KEY=sk-xxx
GITHUB_PAT=ghp_xxx
FEISHU_APP_ID=cli_xxx
FEISHU_APP_SECRET=xxx
```

每个工具 `.env` 引用：
```bash
# ~/.hermes/.env
source ~/.shared-env

# ~/.openclaw/workspace/.env
source ~/.shared-env
```

避免在 4 个工具重复配 Key。

## 33.9 调试技巧

整套链路有多层，出问题查：

```bash
# 1. OpenClaw 那一头
openclaw logs tail --channel feishu

# 2. Hermes 处理
hermes logs tail --since 5m

# 3. Codex / Claude Code 输出
# 通常在 Hermes log 里 capture 了，搜:
hermes logs search "codex" --since 1h
```

## 33.10 安全：4 工具同时上线的复杂度

每多一层工具，攻击面就多一层。**额外注意**：

- 4 个工具都各自有 API Key → 任何一个泄露都危险
- OpenClaw 接公网 IM → 收到的"指令"可能含 prompt injection
- Hermes 调 Codex / Claude Code → 给了它们高权限
- 必须**全链路 sandbox**：

```yaml
# Hermes config.yaml
backend:
  default: docker            # 不要 local

subagents:
  isolation: docker
```

OpenClaw 同样跑在容器里。**整个组合方案部署在独立机器**，不要主力机。

## 33.11 ROI 分析

按月度：

| 模式 | 时间投入 | 成本 |
|---|---|---|
| 全手动（你自己干所有事） | 100 h | 你的时薪 × 100 |
| 4 工具协同 | 30 h（你 review + 拍板）+ AI 70 h | LLM API ¥500-2000 |

如果你时薪 ¥200，节省 70 小时 = ¥14000，扣 AI 成本净省 ≈ ¥12000。**值。**

---

## 看完这个案例你应该会

✅ 4 工具各司其职的组合架构
✅ OpenClaw 桥接 Hermes 让国内 IM 也能用 Hermes
✅ Hermes 调度 Codex / Claude Code 跑编程任务
✅ 周末维护 / 紧急 hotfix / 研究实现 3 种场景
✅ 跨工具记忆 + 配置共享
✅ 安全：全链路 sandbox

---

**下一步**：[34. 案例 10：从 OpenClaw 迁移 →](/hermes/cases/migrate-from-openclaw)

最后一个独家案例：用 `hermes claw migrate` 一键从 OpenClaw 跳到 Hermes。
