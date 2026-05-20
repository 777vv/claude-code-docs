# 11. 接入 Discord

::: info 本章你将学到
- 为什么开发者圈喜欢用 Discord 而不是 Telegram
- 在 Discord Developer Portal 申请 bot 完整流程
- Bot 权限 (Intents) 配置——容易踩坑
- 用 `hermes platform add discord` 接入
- 服务器（群）/ DM / Slash 命令配置
- 国内访问方案
:::

::: warning 国内访问
Discord 在国内也需要翻墙。不能稳定翻墙的用户参考 [23. 国内 channel 现实](/hermes/china/channels)。
:::

## 11.1 Discord vs Telegram

| | Telegram | Discord |
|---|---|---|
| **主流用户** | 全球综合 | **开发者 / 游戏玩家 / 技术社区** |
| **bot 申请** | 1 分钟（@BotFather） | 5-10 分钟（Developer Portal） |
| **群聊机制** | 普通群 | **服务器（多频道）** |
| **slash 命令** | 简陋 | **原生且强大** |
| **embed 卡片** | 普通 | **非常漂亮** |
| **bot 文档** | 简单 | 详细但复杂 |

::: tip 选 Discord 的理由
- 你已经在 Discord 上活跃
- 想在技术社区分享你的 bot
- 喜欢丰富的 UI（embed / 按钮 / select / modal）
- 想用 Slash Commands 体验
:::

## 11.2 申请 Discord Bot

### 步骤 1：注册 Discord

[discord.com](https://discord.com) 注册账号。

### 步骤 2：进 Developer Portal

[discord.com/developers/applications](https://discord.com/developers/applications) → 登录。

### 步骤 3：New Application

右上角 **New Application** → 取名（如 "My Hermes Bot"）→ Create。

### 步骤 4：拿 Application ID

应用主页 → General Information → 复制 **Application ID**（一串数字）。

### 步骤 5：建 Bot

左侧 **Bot** → 顶部蓝色 **Add Bot** → Yes do it!

### 步骤 6：拿 Bot Token

Bot 页面 → **Token** → **Reset Token** → 复制
（注意：token 只显示一次，没复制就重新 Reset）

### 步骤 7：开必要的 Intents（**容易踩坑**）

Bot 页面下方 **Privileged Gateway Intents**：

| Intent | 是否开 | 用途 |
|---|---|---|
| ✅ **MESSAGE CONTENT INTENT** | **必开** | 让 bot 看到消息正文 |
| ✅ **SERVER MEMBERS INTENT** | 开 | 识别用户身份 |
| ⚠️ PRESENCE INTENT | 看需要 | 看用户在线状态 |

::: warning 不开 MESSAGE CONTENT 会怎样
Bot 收到消息但**正文是空的**。Hermes 收到空消息会困惑或不响应。
**装好 bot 后忘开这个 intent 是 80% 新人翻车的原因。**
:::

### 步骤 8：邀请 bot 到服务器

左侧 **OAuth2** → **URL Generator**：

- Scopes 勾：✅ `bot` + ✅ `applications.commands`
- Bot Permissions 勾（最小集）：
  - ✅ Read Messages/View Channels
  - ✅ Send Messages
  - ✅ Read Message History
  - ✅ Embed Links
  - ✅ Attach Files
  - ✅ Add Reactions
  - ✅ Use Slash Commands

底部生成 URL → 复制 → 浏览器打开 → 选要加入的服务器 → 授权。

Bot 进入服务器，但显示**离线**。下面启 gateway 才能上线。

## 11.3 把 token 配进 Hermes

```bash
hermes platform add discord
```

向导：
```
? Discord Bot Token:
  > MTAxxxxxxxx...

? Application ID:
  > 1234567890123456789

? Default agent:
  ❯ default

? Listen in DMs?
  ❯ Yes

? Server channel mode:
  ❯ mention_only (only when @ bot)
    all_messages_in_channels
    slash_commands_only

? Channels to listen (optional):
  > <leave empty for all channels>

? Allowed user IDs (optional):
  > 234567890123456789

✓ Discord added.
```

## 11.4 启动 gateway

```bash
hermes gateway
```

输出：
```
🚀 Hermes Gateway started

Platforms:
  ✓ telegram (bot: @my_hermes_xyz_bot)
  ✓ discord (bot: MyHermesBot#1234)        ← 多了这条
```

Discord 服务器里 bot 状态会变 **在线（绿点）**。

## 11.5 测试

### DM 测试

Discord 直接私聊你的 bot。发：
```
你好
```
应该收到回复。

### 服务器 @ 测试

在加了 bot 的服务器某个频道发：
```
@MyHermesBot 介绍下你自己
```

收到回复 → ✅ 通了。

## 11.6 Slash Commands（推荐）

Discord 原生 slash commands 比 @ 体验好得多。

配置 `~/.hermes/platforms/discord.yaml`：
```yaml
slash_commands:
  enabled: true
  global: true               # 全 Discord 用户都能用，或限定 servers
  commands:
    - name: ask
      description: 问 Hermes 一个问题
      options:
        - name: question
          type: string
          required: true

    - name: research
      description: 让 Hermes 调研某个话题
      options:
        - name: topic
          type: string
          required: true

    - name: cost
      description: 查看今日 token 用量
```

重启 gateway。Discord 输入 `/` 应该看到这些命令的自动补全。

::: tip Slash Commands 比 @ 优势
- 自动补全更顺
- 参数解析清晰
- 用户不用记 bot 名字
- 看起来像"原生功能"
:::

## 11.7 Embed 卡片

Discord 的 embed 卡片是它的杀手特性——比 Telegram 漂亮太多。

```python
# skill 里返回
return {
  "embeds": [{
    "title": "📊 项目周报",
    "description": "本周提交了 23 个 PR",
    "color": 0x7c3aed,
    "fields": [
      {"name": "📈 PRs", "value": "23", "inline": True},
      {"name": "🐛 Bugs", "value": "5", "inline": True},
      {"name": "✅ Tests", "value": "247", "inline": True},
    ],
    "footer": {"text": "由 Hermes 自动生成"}
  }]
}
```

效果：紫色边框的卡片，3 个并列数字，底部说明。

## 11.8 多服务器

一个 bot 可以加入多个服务器。每个服务器独立处理。

配多服务器路由：
```yaml
# discord.yaml
servers:
  - id: "111111111"             # 服务器 A
    agent: research-agent
  - id: "222222222"             # 服务器 B
    agent: support-agent
  - id: "333333333"             # 服务器 C
    agent: default
```

不同服务器 @ bot，路由到不同 agent 处理。

## 11.9 国内访问

Discord 国内同样需要翻墙。Hermes 用代理：

```bash
# .env
HTTPS_PROXY=http://127.0.0.1:7890
NO_PROXY=localhost,127.0.0.1,api.deepseek.com,...

hermes gateway restart
```

或在 yaml 里只给 discord platform 配代理：
```yaml
# discord.yaml
proxy: http://127.0.0.1:7890
```

## 11.10 安全清单

```yaml
# discord.yaml
id: discord
token: ${DISCORD_BOT_TOKEN}
application_id: ${DISCORD_APP_ID}

# 服务器白名单（只在这些里响应）
allowed_servers:
  - "111111111"
  - "222222222"

# 用户白名单（只这些人能用）
allowed_users:
  - "234567890123456789"

# DM 默认开还是关
allow_dms: true

# 群里默认 mention only
channel_mode: mention_only

# 速率限制
rate_limit:
  per_user_per_minute: 10
  per_server_per_minute: 60
```

## 11.11 常见报错

### Q：Bot 在服务器显示离线
**清单**：
1. `hermes gateway` 启动了吗？
2. token 对吗？
3. Intent **MESSAGE CONTENT** 开了吗？

### Q：消息能收到但内容是空字符串
**原因**：MESSAGE CONTENT INTENT 没开。**最常见的 Discord bot 坑**。

### Q：DM 能用，服务器 @ 不响应
**清单**：
1. bot 加进了对应服务器？
2. bot 有 Read Messages 权限？
3. `channel_mode: mention_only` 配了？
4. @ 用的是 bot 完整 username（含 #1234）？

### Q：Slash command 不显示
**原因**：注册命令需要时间（全局可能 1 小时同步）。
**修复**：
```yaml
slash_commands:
  global: false
  test_servers: ["111111111"]   # 限服务器范围，秒同步
```

### Q：bot 经常掉线
**原因**：网络不稳。
**修复**：
- 部署到云服务器
- 或换 webhook 模式（更稳）

### Q：Discord 报 `401 Unauthorized`
**修复**：token 错。Developer Portal → Reset Token → 复制新 token。

---

## 看完这一章你应该知道

✅ Discord Developer Portal 申请 bot
✅ **MESSAGE CONTENT INTENT 必须开**（80% 翻车原因）
✅ OAuth2 URL Generator 邀请 bot 到服务器
✅ Slash Commands 比 @ 体验好
✅ Embed 卡片是 Discord 杀手特性
✅ 国内用代理或部署到海外服务器

---

## 配置篇结束 🎉

你的 Hermes 现在能：
- 跟你聊（CLI）
- 在 Telegram / Discord 里聊
- 用真实 LLM 思考
- 在云端 / 本地切换 backend

下一篇起进入 **日常操作**——CLI 全命令、终端 UI 玩法、排查、安全。

---

**下一步**：[12. CLI 命令手册 →](/hermes/ops/cli)
