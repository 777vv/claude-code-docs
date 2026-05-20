# 3. 能做什么 / 不能做什么

::: info 本章你将学到
- OpenClaw 能力的真实边界（避免预期错位）
- 5 大类擅长场景 + 真实例子
- 3 类它不擅长的场景，建议用别的工具
- 一个判断"我的需求是不是适合 OpenClaw"的小流程
:::

::: warning 为什么这一章很重要
新人最常见的两种"翻车"是：
1. **预期太高**：以为"装了 OpenClaw 我就有个 JARVIS" → 用一周失望
2. **预期太低**：以为"就是个聊天机器人吧" → 错过它的真正威力

这一章帮你校准期待。
:::

## 3.1 它擅长的 5 大类事

### ① 周期性 / 定时执行（杀手锏）

OpenClaw 最强的能力是**让 AI"自己启动"做事**——你不需要主动找它对话。

```
每天 8 点：抓 Hacker News + V2EX + 我关注的 RSS，
        AI 总结后推到飞书"今日资讯"群

每周五 16:00：扫这周完成的 GitHub PR + Linear 工单，
            生成周报草稿发我邮箱

每小时一次：检查 Sentry 有没有 P0 报错，
          有的话钉钉+短信双路报警

每月 1 号：从 OSS 后台拉上月账单，
        和预算对比，超额了发警告
```

::: tip 为什么 ChatGPT 做不到这事
ChatGPT 必须你主动打开网页才能用。OpenClaw 是**后台常驻**的，可以挂在 cron 上自动执行——这就是"代理"和"聊天机器人"的本质区别。
:::

### ② 多源信息聚合与处理

```
"把今天 Gmail 收到的所有邮件，按重要性归类，
重要的 ping 我，垃圾的直接归档"

"扫一遍我的微博、Twitter、知乎 timeline，
摘出和 AI 编程相关的内容生成日报"

"我刚发的会议录音转文字 + 摘要 + 提取待办，
分别发给参会的张三李四王五"
```

OpenClaw 能**串联多个数据源 + 多个工具 + 多个收件人**，单一聊天机器人做不到这种"工作流"。

### ③ 多人协作场景（团队 / 家庭）

```
公司飞书群里：
@小爪 上次客户提的功能怎么排期了
↓
小爪：去 Notion 检索 → 给出当前 owner 和预计上线时间

家庭微信群里：
说"明晚吃番茄炒蛋"
↓
小爪：自动加进购物清单（番茄、鸡蛋）
↓
说"我下班了"
↓
小爪：同步到老婆的钉钉日历"老公下班"
```

**关键能力**：群里多人发消息 OpenClaw 都能听到，能区分谁是谁，能给每个人不同回复。

### ④ 桥接 / 自动化"两个 app 之间的事"

```
GitHub PR 提交 → 自动 @ 团队 review + Notion 建跟踪卡片

Stripe 收到付款 → 自动开发票 + 发给客户 + 入账到飞书表格

新邮件标"紧急" → 自动转语音电话给我（用 Twilio API）

Telegram 收到任意文件 → 自动归类存到 OneDrive 对应文件夹
```

很多"工具 A → 工具 B"的衔接需求，以前要用 Zapier / IFTTT / n8n。**OpenClaw 是免费、自托管、AI 加持的替代品**。

### ⑤ 也能写代码（联动 Codex / Claude Code）

```
在飞书随手发：
"修一下 user-service 项目登录接口的超时 bug"

OpenClaw 会：
1. clone 仓库到本地
2. 调用 Codex（或 Claude Code）让 AI 改代码
3. 跑测试
4. 推分支
5. 提 PR
6. 把 PR 链接发回飞书 @ 你
```

OpenClaw **不取代** Codex / Claude Code，但能把它们包装成"在飞书里能调用的服务"。详见 [21. 联动 Codex/Claude Code](/openclaw/advanced/with-coding-tools) 和 [32. 案例：AI 帮你写代码](/openclaw/cases/code-assistant)。

## 3.2 它不擅长 / 不适合的事

### ❌ 一次性的"问个问题就走"

如果你只是想：
- 写个邮件草稿
- 翻译一段话
- 让 AI 帮我想几个名字

**直接打开 ChatGPT 网页更快**。装 OpenClaw + 配置 + 维护守护进程，对一次性问答来说成本太高。

::: tip 经验法则
如果一件事你**只会做一次**，用网页 ChatGPT/Claude。
如果你会**反复做、定时做、或者要让别人也能用**，才上 OpenClaw。
:::

### ❌ 重度纯编程工作流

你坐在电脑前认真写代码、需要 AI 在 IDE 内联帮你？
- **更适合的工具**：Claude Code、Codex、Cursor、Continue

OpenClaw 能写代码，但它**没有 IDE 集成**。让它在飞书里改代码适合"远程/移动场景"，不适合"我坐在电脑前正在 hack 一个 bug"。

### ❌ 复杂的视觉创作 / 多模态生成

OpenClaw 是文本对话工具：
- 不能生成图（除非装 skill 调 Midjourney/DALL·E API）
- 不能直接改图、剪视频、做动画
- 不能"看"一个网页的设计好不好看

这些事**专门工具更强**（如 Midjourney、CapCut、Figma）。

### ❌ 完全没有任何技术基础

OpenClaw 不是"下载安装就能用"。最低门槛：
- 能打开终端跑命令
- 能编辑 JSON / Markdown 文件
- 能复制粘贴 API Key
- 看得懂报错并搜索

如果上面任何一条做不到，**建议先用 ChatGPT 等网页工具**，等你有了基础技能再来。

## 3.3 它的硬性技术限制

| 限制 | 说明 | 影响 |
|---|---|---|
| **必须有 LLM** | 离线状态下完全不能用 | 没 API Key 或没网 = 罢工 |
| **依赖 LLM 能力** | 模型菜，OpenClaw 也菜 | 用 DeepSeek 还是 Claude，体验差距巨大 |
| **机器要常开** | Gateway 关了所有任务都停 | 笔记本合盖 / 关机时 Agent 不工作 |
| **Skill 有学习成本** | 复杂任务需要找/装/配 skill | 不是"想到就能立刻做" |
| **Channel 申请门槛** | 不同 IM 接入难度差异大 | 微信 / QQ 比 Telegram 麻烦得多 |

## 3.4 决策流程：我的需求该用什么？

```
你的需求是不是 "改代码 / 写代码 / debug"？
├─ 是 → 用 Claude Code 或 Codex（OpenClaw 是远程触发的辅助）
└─ 否
   ├─ 是不是 "一次性问答 / 翻译 / 写文案"？
   │   ├─ 是 → ChatGPT / Claude 网页版
   │   └─ 否
   │      ├─ 是不是 "定时执行 / 周期任务 / 自动化"？
   │      │   ├─ 是 → OpenClaw 强项 ✅
   │      │   └─ 否
   │      │      ├─ 是不是 "多人在 IM 里共用"？
   │      │      │   ├─ 是 → OpenClaw 强项 ✅
   │      │      │   └─ 否
   │      │      │      ├─ 是不是 "串联多个 app 的工作流"？
   │      │      │      │   ├─ 是 → OpenClaw / n8n / Zapier
   │      │      │      │   └─ 否 → 可能不需要任何 AI 工具
```

## 3.5 真实用户怎么用 OpenClaw

我们整理了社区里**最常见的 5 种用法**，看你属于哪种：

### 类型 A：独立开发者 / 自由职业
- 主要场景：项目监控 + 客户消息提醒 + 自动开发票
- 装的 channel：Telegram + Slack
- 装的 skill：github / stripe / gmail / notion

### 类型 B：企业内部工具开发者
- 主要场景：把公司知识库 / 文档接入 IM 问答
- 装的 channel：飞书 / 钉钉 / 企业微信
- 装的 skill：knowledge-base RAG / database / 内部 API 调用

### 类型 C：内容创作者
- 主要场景：选题收集 + 多平台分发 + 数据汇总
- 装的 channel：微信 + Telegram
- 装的 skill：rss / browser-automation / 公众号发布 / 小红书发布

### 类型 D：办公室白领
- 主要场景：邮件分类 + 日程提醒 + 周报生成
- 装的 channel：飞书 + 邮件
- 装的 skill：gmail / google-calendar / notion / 简历筛选

### 类型 E：智能家居玩家
- 主要场景：语音控制家电 + 家庭日程 + 提醒
- 装的 channel：微信群 + iMessage
- 装的 skill：home-assistant / weather / shopping-list

::: tip 你属于哪种？
对照看一下，决定你的"初始配置"。本站案例章节会有针对性的完整教程。
:::

## 3.6 常见误解 FAQ

**Q：OpenClaw 是不是想替代 ChatGPT？**
A：不是。OpenClaw 是**调度 ChatGPT/Claude/其他 LLM**的平台，本身不提供智能。

**Q：OpenClaw 完全免费吗？**
A：**框架免费、开源**，但你要给它配 LLM——大多数 LLM API 是要付费的（DeepSeek 例外，超便宜）。Ollama 本地模型可以完全免费但需要好显卡。

**Q：跑 OpenClaw 会不会很费电 / 占内存？**
A：Gateway 本身**很轻量**（一个 Node.js 进程，通常占 200MB 内存）。真正费资源的是 LLM——但 LLM 跑在云端 API，你的电脑不需要算。本地跑 Ollama 才需要好硬件。

**Q：万一 LLM 给了错误指令，OpenClaw 真的会执行吗？**
A：默认配置下**敏感操作需要确认**。但你要小心配 skill 权限——给了 `shell` skill 就等于给了删机器的能力。详见 [15. 安全清单](/openclaw/ops/security-checklist)。

**Q：我能让 OpenClaw 一直跑在家里的 NAS / 树莓派上吗？**
A：**完全可以**。这是它最受欢迎的部署方式之一。NAS / 树莓派 + 国产 LLM API + Telegram/微信 channel = 私人 24h AI 助理。

---

## 看完这一章你应该知道

✅ OpenClaw 擅长：定时执行、多源聚合、协作、工作流串联、远程触发编程
✅ 不擅长：一次性问答、纯 IDE 内编程、视觉创作
✅ 有最低技术门槛（终端 + 编辑文件 + API Key）
✅ 自己属于哪种使用类型，应该装什么 channel + skill

---

**下一步**：[4. 系统要求与安全提醒 →](/openclaw/intro/requirements)

知道它能干什么了，下一章看你的电脑能不能跑、跑的时候有哪些坑要避。
