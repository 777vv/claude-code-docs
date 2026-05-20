# 32. 案例 8：AI 帮你写代码

::: info 这个案例你将搭出什么
**移动端可触发的远程编程工作流**：
- 飞书/Telegram 一句话："修一下 user-service 登录超时 bug"
- OpenClaw 自动 clone 仓库 → 调 Codex/Claude Code 改代码
- 跑测试 → 通过则推分支
- 自动提 PR
- 把 PR 链接回报到 IM @ 你

预计搭建：90 分钟（含装 Codex 等）。
:::

::: tip 本站特色案例
这是 OpenClaw + Codex / Claude Code 三件套联动的标志性案例，
也是 [21. 联动 Codex / Claude Code](/openclaw/advanced/with-coding-tools) 的完整落地。
:::

## 32.1 用到的能力

- Codex 或 Claude Code（按本站对应章节装好）
- coding-agent skill（社区现成方案）
- github MCP（提 PR 用）
- git skill（本地 clone/commit/push）
- shell skill（跑测试 / lint）⚠️ 高危
- 强制 confirm 机制

## 32.2 准备：装好编程工具

### Codex
按 [Codex 安装章节](/codex/guide/installation)。

### Claude Code
按 [Claude Code 安装章节](/claude-code/guide/install)。

### 验证命令在 PATH
```bash
which codex      # 输出: /usr/local/bin/codex
which claude     # 输出: /usr/local/bin/claude
codex --version
claude --version
```

## 32.3 装 OpenClaw 端 skill

```bash
openclaw skill install coding-agent
openclaw skill install git
openclaw skill install shell
openclaw mcp install @modelcontextprotocol/server-github
```

## 32.4 配 GitHub PAT（细粒度）

[github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)

**只勾必要权限**（最小集）：
- Repository access: 选你想让 agent 改的仓库
- Repository permissions:
  - Contents: Read and write
  - Pull requests: Read and write
  - Workflows: Read（看 CI 状态）

不要勾：
- Administration
- Delete repository
- 任何 organization 权限

复制 token，填 `.env`:
```bash
GITHUB_PAT=github_pat_xxxxxxxxxxxxxx
```

## 32.5 创建 coder-bot agent

```bash
mkdir -p ~/.openclaw/workspace/agents/coder-bot
```

`agent.yaml`:
```yaml
id: coder-bot
name: 编程助手
model:
  provider: deepseek
  model: deepseek-chat            # 解析意图用便宜模型
soul: ./soul.md
skills:
  - coding-agent
  - git
  - shell
mcp:
  - github
channels:
  - feishu
  - telegram
behavior:
  auto_confirm_threshold: high    # 任何修改都问
  workspace: /home/user/repos     # agent 操作的本地仓库根目录
```

`soul.md`:
```markdown
# 你是谁
编程助手。专门接受远程触发的代码任务，调用 Codex / Claude Code 实际改代码。

# 我能干的事
- 修 bug (输入: 现象 / 期望)
- 加新功能 (输入: 需求)
- 重构 (输入: 重构目标)
- 写文档 (输入: 文档类型)
- 跑测试 / lint / format
- 提 PR

# 标准工作流
收到任务后:
1. **解析**: 识别仓库 / 任务描述 / 紧急度
2. **确认**: 在 IM 回复:
   "准备在 [repo] 仓库做 [task]
   计划用 [Codex/Claude Code] 工具
   预计 [N] 分钟
   是否开始?"
3. **等用户 ✅** (auto_confirm_threshold: high 保证必问)
4. **执行**:
   - git clone (如果还没 clone)
   - cd 仓库, git checkout -b auto/<task-slug>
   - 调用 codex/claude 改代码
   - 跑 npm test / pytest / 其他
   - git commit -m "..." (清晰描述)
   - git push
   - 通过 github MCP 提 PR (不直接推 main)
5. **报告**:
   ✅ 成功: PR 链接 + 改动摘要 + 测试结果
   ❌ 失败: 错误信息 + 已尝试的步骤 + 建议

# 边界 (生死线)
- 永不直接 push 到 main / master
- 永不修改不在本仓库的文件
- 永不 force push
- 永不 git reset / 删历史
- 涉及 db migration / production config 必须二次确认
- 测试不通过不提 PR (除非用户明确 "ignore tests")
- 单次任务最长 30 分钟，超时主动中止

# 工具选择
- 简单任务（< 10 行改动）→ Codex
- 复杂任务（重构 / 多文件）→ Claude Code
- 用户指定 → 听用户的
```

## 32.6 实际使用对话

### 简单 bug 修复

```
你: @coder-bot 修一下 ai-learning-docs 仓库里 404 页样式问题

coder-bot:
准备在 ai-learning-docs 仓库做"修复 404 页样式问题"。

计划:
1. clone latest main
2. 让 Codex 定位 404 相关文件
3. 调整 CSS
4. 跑 npm run build 确认通过
5. 推分支 fix/404-style
6. 提 PR

工具: Codex
预计: 5 分钟

是否开始?

你: ✅

coder-bot:
开工。

[3 分钟后]

coder-bot:
✅ 完成。

PR: https://github.com/xxx/ai-learning-docs/pull/87
摘要: 修改了 docs/404.md 的 inline CSS，加了 max-width: 600px 和 margin: auto 让内容居中。
测试: npm run build 通过 (12.4s)，无新警告。

等你 review。
```

### 复杂任务

```
你: @coder-bot 把 user-service 项目里的回调地狱重构成 async/await

coder-bot:
准备在 user-service 仓库做"async/await 重构"。

预估范围: ~15 文件
建议工具: Claude Code (复杂多文件改动)
预计耗时: 15-20 分钟
风险: 中等，涉及很多核心代码路径

建议:
1. 先在一个 spike 分支上做
2. 全量跑测试
3. 测试通过才提 PR
4. 提 PR 后建议你本地 checkout 跑一遍再 merge

是否继续? 用 Codex 还是 Claude Code?

你: 用 Claude Code

coder-bot:
好的，启动 Claude Code 模式。

[18 分钟后]

coder-bot:
完成。

PR: https://github.com/xxx/user-service/pull/124
改动: 14 个文件，约 380 行
摘要:
- 转 15 个 callback 函数为 async/await
- 保留所有原始函数签名（向后兼容）
- 加了 try/catch 错误处理

测试:
✅ npm test 全部通过 (132 passed)
✅ npm run lint 通过
⚠️  npm run e2e 跳过（环境不支持）

建议你本地跑一遍 e2e 再合。
```

### 任务失败

```
coder-bot:
❌ 任务失败

任务: 修复 login flow 中的 race condition
仓库: backend-api
阶段: 测试

错误:
npm test 失败，user.test.ts 第 142 行 timeout。
Claude Code 改完代码后跑了 3 次测试，2 次失败。

已尝试:
1. 加了锁
2. 改用 mutex
3. 重构为顺序调用

可能原因:
该 bug 涉及外部 service mock，Claude Code 无法可靠重现。
建议人工介入。

要我把当前的代码状态推到分支 wip/race-fix 供你接手吗?

你: 推一下

coder-bot:
✅ 推送到 wip/race-fix。
分支 URL: https://github.com/xxx/backend-api/tree/wip/race-fix
我已经在 PR 描述里写了我尝试的方案和失败的测试，你接着改时可以参考。
```

## 32.7 安全配置

### 1. 隔离环境（强制）

```yaml
# global.yaml
agents:
  coder-bot:
    sandbox:
      type: docker             # 强制在 Docker 里跑
      image: coder-bot:latest
      mount:
        - ~/repos:/workspace:rw
      network: bridged
      cpu_limit: 2
      memory_limit: 4G
```

### 2. PAT 范围最小化

每个仓库一个独立 PAT，不复用：
```bash
GITHUB_PAT_PROJECT_A=xxx
GITHUB_PAT_PROJECT_B=yyy
```

`coding-agent` skill 按仓库找对应 PAT。

### 3. 禁用直推

shell skill 加 hook：
```javascript
// 在 git push 前拦截
if (args.includes('main') || args.includes('master')) {
  throw new Error('Refused: cannot push directly to main/master');
}
```

### 4. PR 自动加 Draft 标签

让你必须手动改 Draft → Ready，防止 agent 自己合自己的 PR。

### 5. 操作日志

```bash
openclaw logs tail --agent coder-bot --level info > coder-bot-audit.log
```

定期审计 agent 干了啥。

## 32.8 进阶玩法

### 定时维护任务

```yaml
# workflows/weekly-cleanup.yaml
trigger:
  cron: "0 10 * * 1"
steps:
  - id: deps
    agent: coder-bot
    task: "在 ai-learning-docs 仓库跑 npm-check-updates，更新 patch + minor 版本，测试通过提 PR"

  - id: lint
    agent: coder-bot
    task: "全量跑 prettier + eslint --fix，提 PR"
```

每周一自动跑，项目永远保持 fresh。

### 紧急 hotfix 模式

```
你: 紧急: prod 数据库连接泄漏，hotfix 加连接池上限

coder-bot:
🚨 紧急 hotfix 模式启动

跳过常规流程:
- 不写测试（紧急）
- 不等 PR review (直接 merge?? 等你确认)
- 推到 hotfix/db-pool-fix 分支

预估 3 分钟搞定。开始?
```

紧急但仍有 confirm 防误操作。

## 32.9 失败模式 / 兜底

agent 不擅长的：
- 大规模架构重构（语境太大）
- 需要业务理解的修改（不知道用户痛点）
- 涉及多个仓库协调

兜底：失败时把当前 WIP 推到分支，留下 commit history 给人接手。

## 32.10 成本

按中等使用（日均 3 个任务）：
- DeepSeek 解析: ¥0.5/天
- Claude Code 实际改: ¥5-15/任务 × 3 = ¥15-45/天
- 月度: ¥400-1300

替代的是开发时间。如果你时薪 ¥500，每月节省 5 小时就回本。

---

## 看完这个案例你应该会

✅ 配置 OpenClaw + Codex / Claude Code 联动
✅ 强制 confirm + 沙箱 + PR-only 三道安全锁
✅ Workflow 实现定时维护
✅ 失败兜底（WIP 分支保留状态）

---

**下一步**：[33. 案例 9：自媒体一稿多发 →](/openclaw/cases/content-distribute)

下一个：写一遍内容，自动适配公众号 / 小红书 / 知乎风格分发。
