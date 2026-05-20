# 31. 案例 7：项目 24h 守夜人

::: info 这个案例你将搭出什么
24 小时盯着你的项目：
- GitHub CI 失败 → AI 分析原因 → @ 可能责任人
- 新 PR 提交 → 自动 review（小修改自动 LGTM，大改 ping 你）
- Sentry P0 报错 → 立即电话/短信/飞书三路告警
- 主服务 healthz 异常 → 升级到运维 oncall

预计搭建：60-90 分钟。
:::

## 31.1 用到的能力

- GitHub webhook（接 push / PR / workflow_run 事件）
- Sentry webhook
- 自定义 healthz 巡检 cron
- 分级告警路由（不同级别走不同渠道）
- 多 agent 协作（按之前 [18 章](/openclaw/advanced/multi-agent) 的 CI 监控案例）

## 31.2 装 skill / MCP

```bash
openclaw skill install webhook              # 接收外部事件
openclaw mcp install @modelcontextprotocol/server-github
openclaw skill install twilio               # 电话/短信告警（OpenAPI 兼容）
```

## 31.3 三个 agent

### `ci-watcher` - 监听 webhook

```yaml
id: ci-watcher
name: CI 哨兵
model:
  provider: deepseek
  model: deepseek-chat
soul: ./soul.md
skills:
  - webhook
mcp:
  - github
```

soul.md（简化）：
```markdown
监听 GitHub webhook 事件:
- workflow_run.completed + failure → 调 analyzer agent
- pull_request.opened → 调 pr-reviewer agent
其余事件忽略。
```

### `ci-analyzer` - 分析失败

```yaml
id: ci-analyzer
model:
  provider: anthropic
  model: claude-sonnet-4-6     # 分析需要质量
mcp:
  - github
```

soul:
```markdown
拿到 workflow_run 失败事件 → 通过 GitHub MCP 拉:
1. 失败的 job log
2. 最近 5 个 commit（找可能责任人）
3. 仓库 README（理解上下文）

输出 JSON:
{
  type: test_fail / build_fail / lint_fail / deploy_fail / flaky,
  error_summary: "...",
  likely_culprit_commit: "abc123",
  likely_owner: "github-user",
  fix_suggestion: "一句话建议",
  severity: P0/P1/P2
}
```

### `alert-router` - 按级别告警

```yaml
id: alert-router
model:
  provider: deepseek
  model: deepseek-chat
skills:
  - twilio
channels:
  - feishu
  - dingtalk
```

soul:
```markdown
收到 incident JSON，按 severity 路由:

P0 (服务宕机, 数据库挂):
- 飞书 @ oncall 群
- 钉钉 @ 全员
- 电话 oncall + 主管（最多 3 通）
- SMS 备份

P1 (CI 大面积失败, 关键功能错):
- 飞书 @ owner 私聊
- 钉钉群通知

P2 (单个 test flaky, lint 错):
- 飞书发到 #ci 群，不 @ 个人

P3 (其他):
- 仅写入飞书机器人日志

发送后等 5 分钟,未确认:
- P0 升级电话
- P1 升级短信
```

## 31.4 GitHub webhook 配置

GitHub 仓库 → Settings → Webhooks → Add webhook：
- Payload URL: `https://yourdomain.com/openclaw/webhook/github`
- Content type: `application/json`
- Secret: 设个长随机串，OpenClaw 配置里也填
- Events: `Workflow runs`, `Pull requests`, `Issues`

OpenClaw `~/.openclaw/workspace/channels/webhook.yaml`:
```yaml
id: webhook
type: webhook
listen_port: 18790
endpoints:
  - path: /webhook/github
    secret: ${GITHUB_WEBHOOK_SECRET}
    default_agent: ci-watcher
```

要让 OpenClaw 公网可达，用 [24 章](/openclaw/china/network) 的 Cloudflare Tunnel / frp。

## 31.5 Workflow 串联

```yaml
# workflows/ci-monitor.yaml
trigger:
  webhook: github
  filter:
    event: workflow_run
    conclusion: failure

steps:
  - id: collect
    agent: ci-watcher
    task: "提取 workflow run 元数据"
    input: ${event.payload}
    output: incident

  - id: analyze
    agent: ci-analyzer
    task: "分析失败原因"
    input: ${collect.incident}
    output: analysis

  - id: route
    agent: alert-router
    task: "按 severity 发告警"
    input: { incident: ${collect.incident}, analysis: ${analyze.analysis} }
```

## 31.6 PR auto-review workflow

```yaml
# workflows/pr-review.yaml
trigger:
  webhook: github
  filter:
    event: pull_request
    action: opened

steps:
  - id: get_diff
    agent: ci-watcher
    task: "通过 github MCP 拉 PR diff"
    input: ${event.payload}
    output: diff

  - id: review
    agent: pr-reviewer            # 复用 case 32 里的 coder agent
    task: |
      Review 这个 PR:
      - 找潜在 bug
      - 检查 style
      - 提改进建议
      - 如果 <50 行简单改动且无 issue: 直接 LGTM
      - 否则: 列出问题
    input: ${get_diff.diff}
    output: review

  - id: comment
    agent: ci-watcher
    task: "把 review 作为 PR comment 提交"
    input: { pr: ${event.payload}, review: ${review.review} }
```

## 31.7 Sentry 集成

Sentry 项目 → Settings → Integrations → Webhooks → 添加：
- URL: `https://yourdomain.com/openclaw/webhook/sentry`
- Events: New Issue, Resolved

OpenClaw 配 webhook endpoint:
```yaml
endpoints:
  - path: /webhook/sentry
    default_agent: sentry-handler
```

`sentry-handler` agent 收到事件 → 评估 severity → 转 alert-router。

## 31.8 主动巡检（healthz）

webhook 是被动接事件。补一个主动巡检 workflow:

```yaml
# workflows/health-check.yaml
trigger:
  cron: "*/5 * * * *"           # 每 5 分钟

steps:
  - id: check
    agent: healthz-checker
    task: |
      curl 以下 endpoint:
      - https://api.company.com/health
      - https://www.company.com/health
      返回每个的 status code 和延迟。

  - id: alert
    agent: alert-router
    task: "如果有 endpoint 非 200 或延迟 > 5s，发 P1 告警"
    input: ${check}
    condition: ${check.has_failure}
```

## 31.9 防告警风暴

一次故障可能触发几十个事件，简单转发会刷屏。soul 加：

```markdown
# 告警去重
1. 5 分钟内同一仓库 + 同一类型错误：合并成一条
2. P0 告警 5 分钟内一次（防短信电话轰炸）
3. 已确认收到的告警：不再升级
4. 工作时间外 P2 告警攒到下个工作日早上汇总
```

## 31.10 oncall 排班集成

```yaml
oncall:
  schedule_source: pagerduty       # 或飞书机器人维护的轮值表
  primary:
    week1: { name: 张三, phone: +86xxx, feishu_id: ou_xxx }
    week2: { name: 李四, phone: +86yyy, feishu_id: ou_yyy }
  secondary:
    always: { name: 王总, phone: +86zzz }
```

agent 自动按当前周次找对应人。

## 31.11 实战告警示例

### P0 告警（数据库挂）

```
🔴 P0 告警 - 数据库连接失败

服务: api.company.com
检测时间: 2026-05-19 03:23:45
错误: ECONNREFUSED to db-master.company.com:5432
持续时间: 已 3 分钟

可能原因 (AI 分析):
- 数据库进程崩溃
- 网络中断
- 主库故障切换中

建议:
1. 立即登录主库检查
2. 启动备库 failover 流程

@oncall-张三 已电话 (第 1 次)
@主管-王总 已电话 (第 1 次)
```

### P2 告警（test flaky）

```
⚠️ P2 - CI test flaky

仓库: backend-api
Workflow: test
失败 job: integration-test
日志摘要: timeout on test "user login concurrent"

近 1 周该测试失败率: 12%
归类: 疑似 flaky test

建议: 加 retry 或拆分
不 @ 个人
```

## 31.12 安全提醒

- webhook secret 务必设强随机串
- GitHub token 用细粒度 PAT，只给监控仓库的读权限
- alert-router 的 Twilio key 高敏感，必须锁好（[15 章](/openclaw/ops/security-checklist)）
- 告警内容不要带敏感数据（密码 / token）

## 31.13 成本

按中等规模团队（5 个项目，日均 20 个 CI 事件，3 个 PR）：
- CI 分析: 20 × ¥0.05 = ¥1/天
- PR review: 3 × ¥0.20 = ¥0.6/天
- 月度: ¥50-80

不算电话短信。Twilio 短信 $0.0075/条，电话 $0.013/分钟。

---

## 看完这个案例你应该会

✅ 接 GitHub / Sentry webhook
✅ 多 agent 协作（监听 → 分析 → 告警）
✅ 分级告警 + 路由
✅ 主动巡检 cron
✅ 告警去重防风暴
✅ oncall 排班集成

---

**下一步**：[32. 案例 8：AI 帮你写代码 →](/openclaw/cases/code-assistant)

下一个：本站特色案例——OpenClaw 联动 Codex/Claude Code，远程触发改代码。
