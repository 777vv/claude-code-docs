# 11. 接入飞书

::: info 本章你将学到
- 为什么国内用户选飞书做 channel 最爽
- 从飞书开放平台创建一个"自建应用"完整流程
- 开通必要的 bot 权限
- 配置事件订阅，让 OpenClaw 能收到群消息
- 把 App ID / App Secret 填到 OpenClaw 配置
- 真机测试 + 群里使用
- 个人版 vs 企业版区别、常见坑
:::

## 11.1 为什么飞书是国内首选

| 因素 | 评价 |
|---|---|
| 国内访问 | ⭐⭐⭐⭐⭐ 直连，不要代理 |
| 申请门槛 | ⭐⭐⭐⭐ 比微信 / 钉钉 都简单 |
| 文档质量 | ⭐⭐⭐⭐ 飞书开放平台官方文档详尽 |
| 功能 | ⭐⭐⭐⭐⭐ 富文本、卡片、群机器人、单聊全支持 |
| 风险 | ⭐⭐⭐⭐ 官方机器人 API，不会被封号 |

**vs 微信**：微信个人号有封号风险（灰色地带），企微要企业认证。
**vs 钉钉**：钉钉机器人能用，但 OpenClaw 对飞书的官方 SDK 适配更完整。
**vs QQ**：QQ 要装非官方协议库，不稳定。

结论：**国内新手直接飞书**，没必要绕路。

## 11.2 准备：开一个飞书账号

如果你没有飞书：
- 个人/小团队：[feishu.cn](https://www.feishu.cn) → 注册免费版
- 企业：用公司的飞书

::: tip 个人也能用
飞书有免费的个人/小团队版（10 人以下），完全够你跑 OpenClaw 玩。
:::

## 11.3 创建"自建应用"

### 步骤 1：进开放平台

[open.feishu.cn](https://open.feishu.cn) → 登录 → **「开发者后台」**

### 步骤 2：创建企业自建应用

点 **「创建企业自建应用」**。

填：
- **应用名称**：OpenClaw 小爪（随便取）
- **应用描述**：我的 OpenClaw 机器人
- **应用图标**：随便选个

创建成功 → 跳进应用详情页。

### 步骤 3：拿到凭证

左侧菜单 → **「凭证与基础信息」**

记录这两项：
- **App ID**：`cli_xxxxxxxxxxxxxxxxx`
- **App Secret**：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (点"显示"才能看到)

::: warning 这两个不要泄露
任何人有了这两个就能假装你的应用调飞书 API。
:::

## 11.4 开通"机器人"能力

左侧菜单 → **「应用能力」** → **「机器人」** → **「启用」**

启用后下方会出现配置项，先暂时不动。

## 11.5 配置权限

左侧菜单 → **「权限管理」** → 搜索/勾选下面的权限：

### 必备权限（最小集）

```
✅ im:message                  发送消息
✅ im:message.group_at_msg     接收群里 @ 机器人的消息
✅ im:message.p2p_msg          接收单聊消息
✅ im:chat                     查询群信息
✅ im:resource                 上传图片/文件
✅ contact:user.base:readonly  读取用户基本信息（如用户名）
```

### 进阶权限（看需要加）

```
docx:document             读写飞书文档
sheets:spreadsheet        读写飞书表格
calendar:calendar         读写日程
approval:approval         读写审批
```

权限申请后**记得点"申请发布版本"**——管理员审核通过才生效。

::: tip 个人开发免审
个人开发者用免费版飞书时通常**自己就是管理员**，自己点同意即可。
:::

## 11.6 配置事件订阅（关键）

让 OpenClaw 能收到消息事件。

### 步骤 1：选订阅方式

左侧菜单 → **「事件与回调」** → 切到 **「事件配置」**

订阅方式两种：
- **回调** 飞书往你的 URL 推（要公网 HTTPS）
- **长连接** 飞书和你的服务建长连（**新手强烈推荐**，本地能用）

**选「长连接」**。

### 步骤 2：选要订阅的事件

点 **「添加事件」**，搜索勾选：

```
✅ im.message.receive_v1       接收消息（关键，必选）
✅ im.message.message_read_v1  消息已读（可选）
✅ im.chat.member.user.added_v1   群成员加入（可选）
```

### 步骤 3：（仅回调方式）配置 URL + 验签

如果你选了"回调"方式：
- 请求 URL：填你的公网 HTTPS 地址（如 `https://yourdomain.com/openclaw/feishu`）
- Verification Token / Encrypt Key 飞书会给你，填到 OpenClaw 配置里

新手用长连接的话**这步跳过**。

## 11.7 把飞书配置填进 OpenClaw

### `.env` 加：

```bash
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 新建 channel 配置

`~/.openclaw/workspace/channels/feishu.yaml`：

```yaml
id: feishu
type: feishu

# 凭证
app_id: ${FEISHU_APP_ID}
app_secret: ${FEISHU_APP_SECRET}

# 消息接收方式
# long_polling (推荐, 长连接)
# webhook (要公网, 进阶)
mode: long_polling

# 默认路由给哪个 agent
default_agent: xiaozhao

# 群消息处理模式
# mention_only: 只响应 @ 机器人（推荐）
# all_messages: 群里所有消息都响应（吵且费 token）
group_mode: mention_only

# 是否在私聊（DM）里默认响应
respond_in_dm: true

# 白名单：哪些用户能用这个 bot
# 留空 = 所有人（飞书内的用户）
# 列出 open_id = 只允许这些
allowed_users: []
```

### 重启 Gateway

```bash
openclaw gateway restart
```

### 看 channel 状态

```bash
openclaw channels list
```

应该看到：
```
ID       TYPE     STATUS     AGENT
feishu   feishu   ✓ active   xiaozhao
```

`status` 不是 `active` 的话查 [常见报错](#_11-10-常见报错)。

## 11.8 测试：在飞书里聊天

### 单聊测试

飞书 → 通讯录 → 搜索你创建的"OpenClaw 小爪"机器人 → 进入聊天。

发：
```
你好，介绍下你自己
```

应该几秒收到 Agent 回复。

✅ 私聊通了。

### 群聊测试

1. 飞书创建一个测试群（自己一个人也行）
2. 群设置 → 群机器人 → 添加机器人 → 选你的"OpenClaw 小爪"
3. 群里发：
   ```
   @小爪 北京天气怎么样
   ```
4. 机器人响应。

::: tip 找不到自己的机器人？
确保应用 → **「版本管理与发布」** → 已创建并发布过版本。
个人开发版本通常自己审核通过。
:::

## 11.9 进阶玩法

### 让 bot 给用户发 / 群发消息

```bash
# 给具体用户发
openclaw message send \
  --channel feishu \
  --target ou_xxxxxxxxxx   \
  --message "今天会议 4 点"

# 给群发
openclaw message send \
  --channel feishu \
  --target oc_xxxxxxxxxx \
  --message "项目周报已生成"
```

`ou_xxx` 是用户的 open_id，`oc_xxx` 是群的 chat_id。在飞书 API 调试或 webhook 回调里能拿到。

### 富卡片消息（按钮、表单）

飞书支持发**互动卡片**——比普通文本好看十倍：

```yaml
# skill 里
{
  msg_type: "interactive",
  card: {
    elements: [
      { tag: "div", text: { content: "今日待办" } },
      { tag: "action", actions: [
        { tag: "button", text: { content: "标记完成" }, value: { action: "done", id: "task-1" } }
      ]}
    ]
  }
}
```

### 接入飞书文档

装 skill `feishu-docs` 后，Agent 能：
- 读你的飞书文档内容
- 往文档里写入
- 接 OKR/任务系统

详见 [22 章 国内 channel 接入](/openclaw/china/channels)。

## 11.10 常见报错

### Q：channel status: `✗ error: 99991663 invalid app credentials`
A：App ID 或 App Secret 错了。回开发者后台「凭证与基础信息」复制最新的。

### Q：私聊能用、群里 @ 它不响应
A：检查三处：
1. 群设置 → 已添加机器人？
2. 权限 → `im.message.receive_v1` 已申请且通过？
3. `group_mode: mention_only` 设了？
4. 在飞书里 @ 用的是机器人的中文名，不是英文 id

### Q：报错 `message type not support`
A：你的 skill 返回了飞书不支持的消息类型。看错误日志，常见是返回了 `markdown` 但飞书要 `text` 或 `post`。

### Q：群成员说"机器人没反应"
A：先单聊确认机器人是否响应。如果单聊都没反应：长连接断了，重启 Gateway。

### Q：长连接经常掉线
A：检查服务器网络稳定性。飞书长连接每 5 分钟心跳一次，弱网会断。换 webhook 模式（要有公网域名）。

### Q：用户开通机器人需要审批？
A：企业版默认要管理员审批。你是企业开发者请联系管理员通过。个人版自己审。

## 11.11 安全清单

- **App Secret 像密码**：绝不进 GitHub
- **长连接更安全**：不需要暴露公网端口
- **生产环境必开 IP 白名单**：开发者后台「IP 白名单」只放你服务器 IP
- **必备 allowed_users 白名单**：免费版飞书任何同事都能加机器人对话，万一你的机器人接了昂贵 LLM……
- **群机器人尽量 `mention_only`**：避免吵 + 烧 token

---

## 看完这一章你应该知道

✅ 飞书开发者后台创建自建应用，拿 App ID / App Secret
✅ 开必备 5 个权限（im:message 系列）
✅ 用长连接订阅 `im.message.receive_v1`
✅ OpenClaw 配 `feishu.yaml`，重启即用
✅ 群里默认 `mention_only`，安全 + 省 token

---

**下一步**：[12. CLI 命令手册 →](/openclaw/ops/cli)

配置部分到这里告一段落。下一篇起进入「日常操作」——OpenClaw 所有命令的速查手册。
