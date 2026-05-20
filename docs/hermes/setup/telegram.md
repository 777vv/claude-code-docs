# 10. 接入 Telegram

::: info 本章你将学到
- 为什么 Telegram 是最易上手的 channel
- 从 @BotFather 申请 bot 完整流程
- 用 `hermes platform add telegram` 配置
- 启动 gateway 让 bot 真的能收消息
- 群聊、白名单、防滥用配置
:::

::: warning 国内访问
Telegram 在国内**默认不可访问**，需要稳定翻墙。
不能翻墙的看下一章 [11. 接入 Discord](/hermes/setup/discord) 或直接用 [23. 国内 channel 现实](/hermes/china/channels) 的桥接方案。
:::

## 10.1 为什么 Telegram 是 Hermes 的首推 channel

| 因素 | 评分 |
|---|---|
| 申请门槛 | ⭐⭐⭐⭐⭐ 5 分钟、零审核 |
| 文档 | ⭐⭐⭐⭐⭐ Telegram Bot API 是业界标杆 |
| Hermes 适配 | ⭐⭐⭐⭐⭐ 原生支持 |
| 功能 | ⭐⭐⭐⭐ 文件 / 按钮 / 内联 / 群聊全支持 |

## 10.2 申请 Telegram Bot

### 步骤 1：装并注册 Telegram

App Store / Google Play / [telegram.org](https://telegram.org) 下载。
注册需海外手机号（或 Google Voice 等）。

### 步骤 2：找 @BotFather

Telegram 搜索 `@BotFather` —— **必须带蓝色 ✓ 官方认证**。点 START。

### 步骤 3：创建 bot

```
你: /newbot

BotFather: Alright, a new bot. Please choose a name for your bot.

你: My Hermes Bot           ← 显示名

BotFather: Now choose a username. Must end in 'bot'.

你: my_hermes_xyz_bot       ← 用户名，全局唯一，_bot 结尾

BotFather: Done! Your token:
          7890123456:AAGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**马上复制 token**保存好。

### 步骤 4：（可选）补充描述

```
/setdescription      ← bot 简介
/setabouttext        ← 关于
/setuserpic          ← 头像
/setcommands         ← 命令菜单
```

`/setcommands` 推荐填：
```
status - 查看 Hermes 状态
clear - 清空对话
help - 帮助
```

## 10.3 把 token 配进 Hermes

最简单的方式：

```bash
hermes platform add telegram
```

向导会问：
```
? Telegram Bot Token:
  > 7890123456:AAGxxxx...

? Allowed user IDs (comma-separated, empty = anyone):
  > 123456789

? Group mode:
  ❯ mention_only (recommended)
    all_messages
    private_only

? Route to which agent?
  ❯ default

✓ Telegram added.

Start the gateway:
  hermes gateway
```

::: tip 怎么找自己的 Telegram user_id？
Telegram 搜 `@userinfobot`，发条消息它会回你 user_id（一串数字）。
:::

## 10.4 启动 gateway

```bash
hermes gateway
```

输出：
```
🚀 Hermes Gateway started

Platforms:
  ✓ telegram (bot: @my_hermes_xyz_bot, mode: polling)

Agents:
  ✓ default (model: deepseek/deepseek-chat)

Listening for messages...
Press Ctrl+C to stop.
```

让它一直跑在终端里。

### 让它后台跑

```bash
# 选 1：用 tmux / screen
tmux new -s hermes
hermes gateway
# Ctrl+B 然后 D 后台

# 选 2：注册系统服务（推荐）
hermes gateway --daemon

# 选 3：用 nohup
nohup hermes gateway > ~/.hermes/gateway.log 2>&1 &
```

## 10.5 测试

Telegram 里搜你的 bot（`@my_hermes_xyz_bot`），点 START。

发：
```
你好，介绍下你自己
```

应该几秒收到 Hermes 回复。✅ Telegram 接通了。

## 10.6 群聊使用

### 把 bot 拉进群

1. 群设置 → 添加成员 → 搜你的 bot username → 邀请
2. 如果加不进：去 @BotFather → `/setjoingroups` → ENABLE

### 群里怎么说话

默认 `mention_only`，只响应 @ bot 的消息：

```
群消息: 今天天气不错      ← bot 不回
群消息: @my_hermes_xyz_bot 北京天气怎么样   ← bot 回
```

### 改成"所有消息都响应"（不推荐）

```bash
hermes platform config telegram
```

或编辑 `~/.hermes/platforms/telegram.yaml`:
```yaml
group_mode: all_messages
```

::: warning 谨慎用 all_messages
- 群里每条都过 LLM = token 烧光
- 经常误响应不相关消息
- 群成员会觉得吵
:::

## 10.7 进阶玩法

### 让 bot 主动给你发消息

```bash
# 命令行触发
hermes message send \
  --platform telegram \
  --to 123456789 \
  --text "下午 4 点开会提醒"
```

接 cron：
```bash
# crontab -e
0 16 * * 1-5 /home/user/.hermes/agent/venv/bin/hermes message send --platform telegram --to 123456789 --text "下午 4 点开会"
```

### 接收文件

```yaml
# ~/.hermes/platforms/telegram.yaml
accept_files: true
max_file_size_mb: 20
```

发 PDF / 图片给 bot，Hermes 会用对应工具处理（前提是装了 `read_pdf` / `analyze_image` 等）。

### Inline 按钮

agent 在回复里返回带按钮的卡片：
```python
# 在 skill 里
return {
  "text": "选择一个分类",
  "buttons": [
    [{"text": "📰 资讯", "callback": "news"}],
    [{"text": "📅 日程", "callback": "cal"}],
  ]
}
```

详见 [17 章写 skill](/hermes/advanced/write-skill)。

### 多 bot

不同场景用不同 bot：
```bash
hermes platform add telegram --name work-bot
hermes platform add telegram --name family-bot
```

每个独立 token + agent。

## 10.8 polling vs webhook

Hermes Telegram 默认 **polling**（bot 主动查"有没有新消息"）。

切换 webhook（公网部署用）：

```yaml
mode: webhook
webhook_url: https://yourdomain.com/hermes/telegram
webhook_port: 8443
```

需要公网 HTTPS 域名 + 在 BotFather 设 webhook URL。详见 [37 章云端部署](/hermes/deploy/cloud)。

**99% 个人用 polling 够**。

## 10.9 安全配置

```yaml
# ~/.hermes/platforms/telegram.yaml
id: telegram
token: ${TELEGRAM_BOT_TOKEN}

# 必备：白名单
allowed_users:
  - 123456789       # 你自己
  - 234567890       # 信任的朋友
allowed_groups:
  - -987654321      # 群 ID（负数）

# 群聊只在被 @ 时响应
group_mode: mention_only

# 防滥用
rate_limit:
  per_user_per_minute: 10
  daily_per_user: 200
```

::: warning 必须配 allowed_users
不配的话，任何人搜到你的 bot username 都能跟它聊——**用你的 LLM 账户烧 token**。
:::

## 10.10 常见报错

### Q：`401 Unauthorized`
**修复**：Token 错。去 @BotFather `/token` 重新看，更新 `.env`：
```bash
TELEGRAM_BOT_TOKEN=新token
```
然后 `hermes gateway restart`。

### Q：私聊能用，群里 @ 不响应
**清单**：
1. bot 已加入群？
2. group_mode 是 `mention_only`？
3. @ 时用的是 bot 完整 username（含 `_bot`）？
4. 在 BotFather 跑 `/setprivacy` 设了 DISABLE（让 bot 能看到群所有消息）？

### Q：`getUpdates failed: ECONNRESET`
**原因**：网络不稳定 / 代理切断。
**修复**：
```bash
# 给 Hermes 配代理
export HTTPS_PROXY=http://127.0.0.1:7890
hermes gateway restart
```

### Q：bot 收消息但回复发不出去
**清单**：
1. LLM provider 有问题？跑 `hermes doctor`
2. 余额没了？看 LLM 服务商账单
3. 配的 `allowed_users` 把回复目标排除了？

### Q：想让 bot 也能看群里的图片
**修复**：装 `analyze_image` skill / 工具集。
```bash
hermes tools
# 启用 media toolset
```

---

## 看完这一章你应该知道

✅ @BotFather 3 步申请 Telegram bot
✅ `hermes platform add telegram` 一步配置
✅ `hermes gateway` 启动后台
✅ 群聊默认 `mention_only`，被 @ 才响应
✅ 必须配 `allowed_users` 白名单
✅ polling 适合个人，webhook 公网部署用

---

**下一步**：[11. 接入 Discord →](/hermes/setup/discord)

Telegram 学会了？下一章接 Discord——技术圈的主流 IM。
