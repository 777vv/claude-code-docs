# 26. 案例 2：个人办公助理

::: info 这个案例你将搭出什么
一个常驻的「office-helper」agent：
- 📧 自动分类 Gmail / Outlook 邮件（重要/工作/通知/垃圾）
- 📅 早上汇报今天日程，会议前 15 分钟提醒
- ✏️ 草拟邮件回复（你确认后发送）
- 📝 周五下午自动生成本周工作周报
- 🗒 待办事项同步到 Notion / 飞书多维表格

预计搭建：60 分钟（一次性）。
:::

## 26.1 用到的能力

- gmail / outlook skill
- google-calendar / outlook-calendar skill
- notion 或 feishu-bitable skill
- 定时 workflow
- 长期 memory（记你的偏好）

## 26.2 准备：装 skill

```bash
openclaw skill install gmail              # 或 outlook
openclaw skill install google-calendar    # 或 outlook-calendar
openclaw skill install notion             # 或 feishu-bitable
```

每个 skill 装好后按提示去对应服务申请 OAuth token / API key，填进 `.env`。

## 26.3 创建 office-helper agent

```bash
mkdir -p ~/.openclaw/workspace/agents/office-helper
cd ~/.openclaw/workspace/agents/office-helper
```

`agent.yaml`:
```yaml
id: office-helper
name: 办公助理
model:
  provider: deepseek
  model: deepseek-chat
soul: ./soul.md
skills:
  - core/memory
  - core/datetime
  - gmail
  - google-calendar
  - notion
channels:
  - feishu
behavior:
  auto_confirm_threshold: medium
  language: zh-CN
```

`soul.md`:
```markdown
# 你是谁
你是张三的办公助理。专注于邮件、日程、待办、周报。

# 主人偏好
- 工作时间: 9:00-18:00
- 不打扰时段: 12:00-13:30（午休）、18:00 之后
- 深度工作时段: 14:00-16:00（不主动 ping）
- 周五 17:00 等周报

# 行为
1. **邮件分类**: 收到新邮件按"紧急/工作/通知/垃圾"打标
2. **紧急定义**: 来自老板 王总（boss@...）或包含"紧急/asap/今天必须"字样
3. **代写邮件**: 主人说"回复 xxx 那封" → 草拟 → 主人确认 → 发送
4. **会议提醒**: 会议前 15 分钟 ping 主人
5. **周报**: 每周五 17:00 拉本周完成项 → 生成草稿 → 等主人改 → 发到 notion
6. **不打扰**: 不打扰时段除非紧急（紧急定义见上）

# 边界
- 发邮件必须确认
- 删邮件、归档大批必须确认
- 修改日程必须确认
```

## 26.4 三个常用 workflow

### Workflow A: 早会播报（每天 8:30）

`workflows/morning-brief.yaml`:
```yaml
name: 早会播报
trigger:
  cron: "30 8 * * 1-5"
  timezone: Asia/Shanghai

steps:
  - id: brief
    agent: office-helper
    task: |
      汇总今天的:
      1. 紧急未读邮件数 + 标题
      2. 今天所有日程（时间 + 标题 + 参会人）
      3. Notion 里今天到期的待办

      格式化成 feishu 消息发给主人。

  - id: send
    channel: feishu
    target: ${MY_OPEN_ID}
    message: ${brief}
```

### Workflow B: 会议 15 分钟前提醒

`workflows/meeting-alert.yaml`:
```yaml
name: 会议前提醒
trigger:
  cron: "*/5 * * * 1-5"        # 每 5 分钟检查一次
  timezone: Asia/Shanghai

steps:
  - id: check
    agent: office-helper
    task: |
      查日程：
      - 接下来 15-20 分钟内有会议？
      - 如果有，发提醒：会议标题 / 时间 / 参会人 / 文档链接
      - 如果没有，返回 SKIP
    output: alert

  - id: send
    channel: feishu
    target: ${MY_OPEN_ID}
    message: ${alert}
    condition: alert != "SKIP"
```

### Workflow C: 周报生成（周五 16:30）

`workflows/weekly-report.yaml`:
```yaml
name: 周报生成
trigger:
  cron: "30 16 * * 5"

steps:
  - id: collect
    agent: office-helper
    task: |
      拉本周（周一到今天）:
      1. 已完成 Notion 任务
      2. 已 close GitHub issue
      3. 已 merge 的 PR
      返回结构化 JSON。

  - id: draft
    agent: office-helper
    task: |
      基于以下数据生成中文周报草稿:
      ## 本周完成
      ## 本周进展
      ## 下周计划
      ## 需要协调
    input: ${collect}

  - id: notify
    channel: feishu
    target: ${MY_OPEN_ID}
    message: |
      📋 本周周报草稿已生成：
      ${draft}

      改好后请告诉我 "发送周报" 或 "保存为草稿"。
```

## 26.5 日常使用示范

### 紧急邮件即时提醒

office-helper 装了 gmail watch（webhook），新邮件触发：
```
🔴 紧急邮件
发件人: 王总 <boss@...>
标题: 关于明天 demo 的紧急调整
时间: 10:32

要点: 客户要求把 demo 推迟到下周二，需要重做 PPT 第 3 页。

要我草拟回复吗？
```

你回："草拟"
```
草稿：

王总好，

收到，已了解需求。我会:
1. 今天联系客户确认细节
2. 周末完成 PPT 修订
3. 周一上午 review

如果方案 OK 我现在发送。

——回复 / 修改 / 取消
```

### 自然语言改日程

```
你: 把明天下午 3 点的"产品评审"延后一小时

office-helper:
✏️ 即将修改:
  原: 2026-05-20 15:00-16:00 产品评审
  改: 2026-05-20 16:00-17:00 产品评审

会议室和参会人保持不变。确认吗?
```

### 自动周报

周五 16:30 你飞书弹消息：
```
📋 本周周报草稿：

## 本周完成
- 完成 user-service 重构（PR #87、#92）
- 修复登录超时 bug
- 写完 OpenClaw 中文文档前 6 章

## 本周进展
- AI 学习站 OpenClaw 章节进度 60%
- some-app demo 设计完成 70%

## 下周计划
- 完成 OpenClaw 实战案例 10 篇
- demo 完成内部 review

## 需要协调
- 等设计同学确认 demo 配色

——发送 / 修改 / 保存草稿
```

## 26.6 实战配置技巧

### 紧急邮件白名单

soul.md 里写明：
```markdown
# 紧急邮件判定
来自以下任一发件人 = 立刻提醒:
- 王总 (boss@company.com)
- 直属 boss (lizong@company.com)
- 客户 张总 (zhang@bigclient.com)

或邮件包含: "紧急" / "asap" / "立刻" / "今天必须"

其他邮件 = 进分类不立刻 ping。
```

### 自动总结长邮件

```markdown
# 处理长邮件
任何超过 500 字的邮件，先做摘要再展示：
- 3 句话核心
- 是否需要回复（是/否）
- 截止日期（如果有）
- 行动项（如果有）
```

### 防过度打扰

```markdown
# 打扰频率
- 普通邮件: 不实时提醒，累积到早会播报
- 紧急邮件: 立即提醒
- 上一次提醒到现在 < 30 分钟: 不再单独 ping，合并到下次播报
- 不打扰时段（午休/深夜）: 紧急也只 IM 静默推送，不外呼
```

## 26.7 安全提醒

📧 邮件代发风险：
- LLM 偶尔会"润色过头"——开 confirm，每封必看再发
- 设白名单，新邮件首次回复必须人工确认
- 包含金额 / 合同 / 密码的邮件**永远不自动回**

📅 日程改动风险：
- 涉及多人的会议必须确认
- 重复发生的会议（每周例会）改动谨慎

🔐 OAuth token 安全：
- gmail / calendar / notion 的 token 在 `.env`，照 [15 章](/openclaw/ops/security-checklist) 处理

## 26.8 成本估算

按日均：
- 早会播报: ¥0.05/次
- 会议提醒: ¥0.01/次 × 10 = ¥0.10
- 邮件分类: ¥0.10（30 封邮件）
- 即时对话: ¥0.50/天

**月度约 ¥20-30**，完全可承受。

---

## 看完这个案例你应该会

✅ 接 Gmail / Calendar / Notion 三件套
✅ 三种 workflow（早会播报 / 会议提醒 / 周报）
✅ 用 soul 定义打扰策略
✅ 紧急邮件白名单 + 长邮件摘要
✅ 安全开 confirm 防误发

---

**下一步**：[27. 案例 3：英语学习陪练 →](/openclaw/cases/english-coach)

下一个案例：让 OpenClaw 当你专属英语老师，每天推词、出题、跟踪进度。
