# 16. Skills 系统入门

::: info 本章你将学到
- Skill 是什么、为什么没它 Agent 几乎没用
- 三种 Skill 来源：内置 / ClawHub / 自定义
- 怎么浏览 ClawHub 找好用的 skill
- 装一个 skill 的完整流程
- 怎么让 agent 真正"用上"装好的 skill
:::

## 16.1 Skill 是 Agent 的"手"

Agent 默认只能聊天——它的"大脑"是 LLM，但**没有手**。

Skill 就是给 Agent 装上各种工具：
- 装 `gmail` skill → Agent 有了"收发邮件的手"
- 装 `browser` skill → Agent 有了"打开浏览器的手"
- 装 `github` skill → Agent 有了"管理仓库的手"

::: tip 类比
没装 skill 的 Agent = 一个只会动嘴说话的人。
装了 skill = 这个人现在有十只手、能开车、能写代码、能做饭。
:::

## 16.2 Skill 的三个来源

| 来源 | 怎么装 | 特点 |
|---|---|---|
| **Bundled（内置）** | 已经装好了 | 核心能力，OpenClaw 自带 |
| **Managed（ClawHub）** | `openclaw skill install <name>` | 社区作品，几百个 |
| **Workspace（自定义）** | 自己写或 fork 改 | 完全你掌控 |

### Bundled 默认有哪些

```bash
openclaw skills list --source bundled
```

通常包含：
- `core/memory` - 长期记忆管理
- `core/datetime` - 时间日期查询
- `core/calc` - 基础计算
- `core/web-search` - 网页搜索（用 DuckDuckGo / Bing 等）
- `core/url-fetch` - 抓单个网页

## 16.3 ClawHub 是什么

ClawHub = OpenClaw 官方的 skill 市场，地址 [clawhub.ai](https://clawhub.ai)。

类比：
- npm 是 Node.js 的包市场
- PyPI 是 Python 的包市场
- **ClawHub 是 OpenClaw 的 skill 市场**

社区任何人能上传，下载免费。**截至本文写作约 3000+ 个 skill**。

## 16.4 怎么找好用的 skill

### 方法 1：浏览器逛 ClawHub

打开 [clawhub.ai](https://clawhub.ai)，可以按分类筛：
- 📧 **邮件**：gmail / outlook / mailgun / sendgrid
- 📅 **日历**：google-calendar / outlook-cal / cal-dot-com
- 🌐 **浏览器**：playwright / puppeteer / browserbase
- 💻 **开发**：github / gitlab / git / linter / formatter
- 🗄 **数据库**：postgres / mysql / mongodb / redis / sqlite
- 📊 **数据**：csv / excel / json / yaml
- 🏠 **智能家居**：home-assistant / hue / nest
- 🤖 **AI 工具**：image-gen / image-analyze / speech-to-text
- 🔗 **集成**：notion / airtable / slack / discord

每个 skill 页面会显示：
- 描述
- 装机数
- 评分
- 最后更新
- 作者
- SKILL.md 全文（看用法）
- 源码链接

### 方法 2：从 Dashboard 里搜

打开 `http://localhost:18789` → Skills → Browse → 搜索框。

直接装、卸更方便。

### 方法 3：CLI 搜

```bash
openclaw skill search email
```

输出：
```
NAME              VERSION   INSTALLS   SCORE
gmail             1.2.0     128K       ★★★★★
outlook           1.0.3     45K        ★★★★☆
mailgun           0.9.1     12K        ★★★☆☆
imap-generic      0.5.0     8K         ★★★☆☆
```

## 16.5 装一个 skill 的标准流程

以装 `gmail` 为例。

### 步骤 1：看 SKILL.md

不要无脑装。先看它要什么权限：

```bash
openclaw skill info gmail
```

输出会包含：
```
Name: gmail
Version: 1.2.0
Author: openclaw-community
Permissions:
  - network                 ← 调 Gmail API
  - secrets.read            ← 读 OAuth token
Required Config:
  - GMAIL_OAUTH_TOKEN       ← 你要去 Google Cloud Console 申请
Description:
  Read, send, search Gmail. ...
```

确认权限可接受、能搞到配置后再装。

### 步骤 2：装

```bash
openclaw skill install gmail
```

或装到指定 agent：
```bash
openclaw skill install gmail --agent xiaozhao
```

### 步骤 3：填配置

很多 skill 需要 API Key / OAuth token。skill 装好后 OpenClaw 会提示：

```
Skill 'gmail' installed.

Required config (add to .env):
  GMAIL_OAUTH_TOKEN=<your token>

Skill website provides token wizard:
  https://clawhub.ai/skills/gmail#oauth-setup
```

按提示去对应服务申请、填进 `.env`。

### 步骤 4：让 agent 用上

在 `agent.yaml` 的 `skills` 列表里加：

```yaml
skills:
  - core/memory
  - gmail
```

reload agent：
```bash
openclaw agents reload xiaozhao
```

### 步骤 5：测试

```bash
openclaw agent --id xiaozhao -m "看一下我邮箱有几封未读"
```

Agent 应该会调用 gmail skill 返回数量。

## 16.6 OpenClaw 怎么"知道"调哪个 skill

每个 skill 的 SKILL.md 里有**调用说明**，OpenClaw 会把这些说明（不是源码！）打包成 prompt 喂给 LLM。

例子（gmail 的 SKILL.md 节选）：
```markdown
## Capabilities

- list_unread(): 列出未读邮件
- search(query: string): 搜索邮件
- send(to: string, subject: string, body: string): 发邮件
- get(message_id: string): 读全文

## When to use

When user asks anything about email: reading, searching, sending.
```

LLM 看到后会"知道有这些手"，需要时调用对应的 capability。

::: tip 智能注入
OpenClaw **不会**把你装的所有 skill 一股脑塞进 prompt（那会浪费 token 还混淆 LLM）。
它会先让 LLM 分析意图，**只挑相关的 skill** 注入。
:::

## 16.7 推荐给新手的 10 个 skill

刚入门可以装这 10 个，覆盖 80% 需求：

| Skill | 干嘛用 | 配置难度 |
|---|---|---|
| **core/memory** | 长期记忆（已内置） | 0 |
| **core/web-search** | 网页搜索（已内置） | 0 |
| **rss** | 抓 RSS 订阅源 | ⭐ |
| **url-summarize** | 抓网页 + AI 摘要 | ⭐ |
| **html-to-markdown** | HTML 转 Markdown | ⭐ |
| **gmail** 或 **outlook** | 邮件管理 | ⭐⭐⭐（要 OAuth） |
| **google-calendar** | 日历管理 | ⭐⭐⭐（要 OAuth） |
| **notion** | Notion 集成 | ⭐⭐（要 API Token） |
| **github** | GitHub 仓库 | ⭐⭐（要 PAT） |
| **weather** | 天气查询 | ⭐（要 API Key） |

装完这 10 个，你的 Agent 已经能：
- 收 / 发邮件
- 看 / 改日程
- 抓资讯做摘要
- 管理笔记
- 监控 GitHub
- 查天气
- 记住所有你告诉它的事

## 16.8 国内对应的"替代品"清单

ClawHub 上的 skill 很多是国外服务，国内用户对应：

| 国外 skill | 国内替代 |
|---|---|
| `gmail` | `qq-mail` / `163-mail` |
| `google-calendar` | `feishu-calendar` / `dingtalk-calendar` |
| `notion` | `feishu-docs` / `lark-bitable` |
| `github` | `gitee` 或继续用 github（慢） |
| `slack` | `feishu-bot` / `dingtalk-bot` |
| `google-drive` | `aliyundrive` / `cloud189` |
| `home-assistant` | 同名（国内也通用） |
| `weather`（OpenWeather） | `caiyun-weather` 彩云天气 |

详细见 [23. 国内 channel 接入](/openclaw/china/channels)。

## 16.9 Skill 装错了怎么办

### 卸载

```bash
openclaw skill uninstall gmail
```

`agent.yaml` 里也记得删掉对应行，reload agent。

### 临时禁用（不卸载）

```bash
openclaw skill disable gmail --agent xiaozhao
```

等想用再 enable。

### 升级

```bash
openclaw skill update gmail
# 或全部升级
openclaw skill update --all
```

## 16.10 安全提醒（不要跳过）

Skill 能让 Agent 做很多事，包括坏事。装第三方 skill 前：

✅ **必看**：SKILL.md 描述 + 它申请的权限
✅ **强烈建议**：扫一眼源码（看有没有 `eval` / `child_process` / 偷偷外联）
✅ **生产环境**：只用 ClawHub 上**有官方 verified 标的**或 100+ 装机量的 skill
❌ **新手不要**装这些：`shell-exec`, `rm`, `password-store`, `crypto-wallet`

详见 [15. 安全清单](/openclaw/ops/security-checklist)。

---

## 看完这一章你应该知道

✅ Skill = Agent 的"手"，没它聊不出花
✅ 三种来源：bundled / ClawHub / 自定义
✅ ClawHub 上 3000+ 个 skill，按需装
✅ 装 skill 5 步：看 → 装 → 配 → 挂到 agent → 测
✅ 新手 10 个推荐 skill
✅ 国外 skill 大多有国内替代品

---

**下一步**：[17. 写你的第一个 Skill →](/openclaw/advanced/write-skill)

ClawHub 没有你想要的？下一章手把手教你从 0 写一个 skill。
