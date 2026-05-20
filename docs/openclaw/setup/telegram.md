# 10. 接入 Telegram

::: info 本章你将学到
- 为什么 Telegram 是新手最易上手的 channel
- 从 @BotFather 申请一个 bot 的完整流程
- 把 bot token 填到 OpenClaw 配置
- 在 Telegram 里和你的 Agent 聊天
- 群聊场景、`/command` 命令、文件上传等进阶
- 常见报错和 webhook vs polling 区别
:::

::: warning 国内用户注意
Telegram 在国内**默认不可访问**，需要科学上网。
如果你在国内、又不想折腾翻墙，请直接看下一章 [11. 接入飞书](/openclaw/setup/feishu)。
:::

## 10.1 为什么先讲 Telegram

| 因素 | 评价 |
|---|---|
| 申请门槛 | ⭐⭐⭐⭐⭐ 最低（5 分钟，零审核） |
| 文档质量 | ⭐⭐⭐⭐⭐ 官方文档极清晰 |
| 速度 | ⭐⭐⭐⭐ 国外服务器，国内需代理 |
| 功能 | ⭐⭐⭐⭐ 支持文件、按钮、内联模式 |

**新手的"Hello World"channel** —— 跑通 Telegram，你就理解了所有 channel 的接入逻辑，其他 channel 是一样的套路。

## 10.2 申请 Telegram Bot

### 步骤 1：装 Telegram

手机：App Store / Google Play 搜 "Telegram"。
电脑：[telegram.org](https://telegram.org) 下载。

注册需要海外手机号（或者用 +86 + Google Voice 等）。

### 步骤 2：找 @BotFather

在 Telegram 搜索框输入 `@BotFather`，找到那个**带蓝色 ✓ 官方认证**的账号，点 START。

::: warning 别点错了
Telegram 有不少冒名 BotFather 的钓鱼账号。**只认带蓝色 ✓ 的官方账号**。
:::

### 步骤 3：创建 bot

跟 @BotFather 对话：

```
你: /newbot

BotFather: Alright, a new bot. How are we going to call it?
          Please choose a name for your bot.

你: My OpenClaw Bot          ← 显示名字，可中文

BotFather: Good. Now let's choose a username for your bot.
          It must end in `bot`. Like 'tetris_bot' or 'TetrisBot'.

你: my_openclaw_xyz_bot      ← 唯一用户名，必须 _bot 结尾且全局唯一

BotFather: Done! Congratulations on your new bot.
          You will find it at t.me/my_openclaw_xyz_bot

          Use this token to access the HTTP API:
          7890123456:AAGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

          Keep your token secure and store it safely.
```

**马上把这串 token 复制保存好**——它就是你的 bot 钥匙，泄露 = 别人能操控你的 bot。

### 步骤 4：（可选）给 bot 加描述

```
/setdescription      ← 设描述（用户进入聊天看到的）
/setabouttext        ← 设关于
/setuserpic          ← 设头像
```

按提示一步步配置即可。

### 步骤 5：（可选）配置命令菜单

```
/setcommands
```

选择你的 bot，然后输入命令列表（**每行一个**）：

```
help - 查看帮助
clear - 清空对话历史
status - 查看 Agent 状态
```

这样用户在聊天里按 `/` 就有提示菜单。

## 10.3 把 Bot Token 填进 OpenClaw

### 加到 `.env`

```bash
TELEGRAM_BOT_TOKEN=7890123456:AAGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 创建 channel 配置

新建 `~/.openclaw/workspace/channels/telegram.yaml`：

```yaml
id: telegram
type: telegram

# Bot Token（从 .env 读）
bot_token: ${TELEGRAM_BOT_TOKEN}

# 消息接收方式：polling（轮询）/ webhook
# 新手强烈推荐 polling，简单，本地能跑
mode: polling

# 这个 channel 默认路由给哪个 agent
# （没指定时所有消息都给这个 agent）
default_agent: xiaozhao

# 谁能跟这个 bot 说话（白名单）
# 留空 = 所有 Telegram 用户都能
# 填了 = 只有这些 user_id 能（防止陌生人骚扰）
allowed_users:
  - 123456789                   # 这是你自己的 Telegram user_id

# （可选）群聊里只在被 @ 时才响应
group_mode: mention_only
```

::: tip 怎么查我的 Telegram user_id
在 Telegram 搜 `@userinfobot`，跟它发条消息，它会回你 user_id（一串数字）。
:::

### 重启 Gateway

```bash
openclaw gateway restart
```

### 看 Channel 状态

```bash
openclaw channels list
```

应该看到：
```
ID         TYPE      STATUS     AGENT
telegram   telegram  ✓ active   xiaozhao
```

## 10.4 测试：发第一条消息

打开 Telegram，搜你创建的 bot（`@my_openclaw_xyz_bot` 或类似），点 START。

发条消息：
```
你好，介绍下你自己
```

应该几秒内收到 Agent 的回复：
```
你好。我是小爪，张三的私人 AI 助理...
```

✅ Telegram 接通了！

## 10.5 群聊里使用

### 把 bot 拉进群

1. 群里点设置 → 添加成员 → 搜你的 bot username → 邀请
2. （如果加不进）进 @BotFather → `/setjoingroups` → enable

### 群里怎么用

默认情况下，bot 只回应**直接 @ 它**的消息：

```
群消息: 今天天气不错
→ bot 不回（没 @ 它）

群消息: @my_openclaw_xyz_bot 北京天气怎么样
→ bot 回复天气
```

### 改成 "总是响应"（不推荐）

```yaml
# telegram.yaml
group_mode: all_messages
```

会让 bot 响应群里所有消息——除非你想做"群里 AI 智能体"，**否则别开**，太吵且烧 token。

## 10.6 进阶玩法

### 让 bot 主动给你发消息（cron 推送）

OpenClaw 可以**反向**给你发消息：

```bash
# 命令行触发一次
openclaw message send \
  --channel telegram \
  --target 123456789 \
  --message "下午 4 点开会提醒"
```

把这条命令丢进 cron：
```bash
# crontab -e
0 16 * * 1-5 openclaw message send --channel telegram --target 123456789 --message "下午 4 点开会"
```

工作日每天下午 4 点 Telegram 弹消息。

### 支持文件上传

用户把 PDF / 图片发给 bot，Agent 能拿到内容处理（前提是装了对应 skill）：

```yaml
# telegram.yaml
features:
  accept_files: true
  max_file_size: 20MB
```

### 内联按钮

让 Agent 给出按钮让用户点：

```javascript
// 在 skill 里
await channel.sendButtons({
  text: '需要我做什么？',
  buttons: [
    [{ text: '📰 看资讯', callback: 'news' }],
    [{ text: '📅 看日程', callback: 'cal' }],
    [{ text: '✉️ 看邮件', callback: 'mail' }],
  ]
})
```

详细看 [16. Skills 系统入门](/openclaw/advanced/skills-intro)。

## 10.7 polling vs webhook 怎么选

| | polling | webhook |
|---|---|---|
| **原理** | bot 不停问"有新消息吗" | Telegram 主动推消息给你 |
| **配置** | 一行 `mode: polling` | 要公网域名 + HTTPS |
| **延迟** | 1-3 秒 | 即时 |
| **适用** | **本地、家用、所有新手** | 部署到公网服务器、生产环境 |

**99% 的人用 polling 就够**。本教程默认 polling。

要切 webhook：
```yaml
mode: webhook
webhook_url: https://yourdomain.com/openclaw/telegram
```

并且要在 @BotFather 那里设 webhook URL。详见 [29. 本地 vs 云端部署](/openclaw/deploy/local-vs-cloud)。

## 10.8 常见报错

### Q：channel status 永远是 `✗ error: ETIMEDOUT`
A：网络打不通 Telegram。检查你的代理是否覆盖 OpenClaw 进程。最常见解：
```bash
# 给 Gateway 进程设代理
export HTTPS_PROXY=http://127.0.0.1:7890   # 改成你的代理地址
openclaw gateway restart
```

### Q：`401 Unauthorized`
A：Bot Token 错了。重新去 @BotFather 用 `/token` 命令查看。

### Q：群里 bot 不响应
A：
1. 确认 bot 已加入群（不是机器人状态）
2. 确认你 @ 了 bot 的完整 username（`@my_openclaw_xyz_bot` 不是 `@小爪`）
3. 检查 `group_mode` 是 `mention_only`

### Q：白名单不生效，所有人都能用
A：`allowed_users` 必须是数字 user_id 不是 username。@userinfobot 查 ID。

### Q：私聊响应，群里不响应
A：BotFather → `/setprivacy` → DISABLE。默认 enable 时 bot 在群里只能看到 @ 它的消息（看不到其他人的）。如果你的 group_mode 要 `all_messages`，需要 DISABLE privacy。

### Q：消息太长截断了
A：Telegram 单条消息限 4096 字符，OpenClaw 默认自动分段。如果长度还是有问题，检查日志看是不是没分段成功。

## 10.9 安全提醒

- **不要把 bot token 发到公开仓库**——别人捡到就能用你的 bot 发任意消息
- **必须配 allowed_users 白名单**，否则任何人搜到你的 bot 都能跟它聊（你来付 token 费）
- 群聊默认开 `mention_only`，避免随便就响应整群发言
- 涉及钱、密码的对话**用 OpenClaw 内置的"敏感字段过滤"**（telegram 历史会留在 Telegram 服务器）

---

## 看完这一章你应该知道

✅ @BotFather 三步创建 Telegram bot
✅ `telegram.yaml` 把 token + 路由配上
✅ polling 模式适合新手，webhook 适合公网部署
✅ 群聊默认 `mention_only`，被 @ 才响应
✅ 必须配 `allowed_users` 白名单防滥用

---

**下一步**：[11. 接入飞书 →](/openclaw/setup/feishu)

Telegram 学会了，下一章看国内 99% 用户的最佳选择——飞书，从零搭一个企业 bot。
