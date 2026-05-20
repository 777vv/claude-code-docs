# 23. 国内 channel 接入

::: info 本章你将学到
- 国内 5 大 IM 接入 OpenClaw 的对比（飞书 / 钉钉 / 企微 / QQ / 微信）
- 飞书已在 [11 章](/openclaw/setup/feishu) 详细讲过，这里讲剩下 4 个
- 钉钉机器人完整接入
- 企业微信完整接入
- QQ 接入（用 OneBot 协议，进阶）
- 微信个人号方案（灰色地带，必读风险）
- 哪个场景该选哪个
:::

## 23.1 国内 IM 对比

| Channel | 申请难度 | 风险 | 功能 | 适合 |
|---|---|---|---|---|
| **飞书** | ⭐⭐ | 极低 | ⭐⭐⭐⭐⭐ | 全场景推荐 |
| **钉钉** | ⭐⭐ | 极低 | ⭐⭐⭐⭐ | 阿里系企业 |
| **企业微信** | ⭐⭐⭐ | 极低 | ⭐⭐⭐⭐ | 腾讯系企业 |
| **QQ** | ⭐⭐⭐⭐ | 中（非官方） | ⭐⭐⭐ | 个人玩家 / 二次元 |
| **微信个人号** | ⭐⭐⭐⭐⭐ | **高（封号）** | ⭐⭐⭐ | 不推荐生产用 |

**结论**：
- **企业 / 工作场景** → 飞书 / 钉钉 / 企微（都用官方 bot API，安全）
- **个人 / 家庭** → 飞书个人版（最简单）
- **想接微信群** → 看 23.5 节风险评估

## 23.2 钉钉接入

### 适合
- 公司用钉钉的
- 想要"机器人 + 群里 @ 它" 这种基础体验

### 步骤 1：创建钉钉自建应用

1. [钉钉开发者后台](https://open-dev.dingtalk.com/) 登录
2. 「应用开发」→「H5 微应用」或「企业内部应用」→ 创建
3. 填名字、描述、Logo

### 步骤 2：开机器人能力

进应用详情 → 「应用能力」→「机器人」→ 启用。

### 步骤 3：配凭证

进 「凭证与基础信息」，记下：
- **AppKey**：`dingxxxxxxxxxxxxxxxxx`
- **AppSecret**：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 步骤 4：配置权限

「权限管理」勾选：
- 通讯录读权限（基础）
- 企业群消息（必需）

### 步骤 5：配置事件订阅

「订阅事件」→ 添加：
- `im.bot.private_chat_msg`（私聊消息）
- `im.bot.group_chat_msg`（群消息）
- `im.bot.user_added`（机器人被加群）

订阅方式选「Stream 模式」（**新手强烈推荐**，类似飞书长连接，本地能跑）。

### 步骤 6：OpenClaw 配置

`.env`:
```bash
DINGTALK_APP_KEY=dingxxxxxxxxxxxxxxx
DINGTALK_APP_SECRET=xxxxxxxxxxxxxxxxxxxx
```

`~/.openclaw/workspace/channels/dingtalk.yaml`:
```yaml
id: dingtalk
type: dingtalk
mode: stream                   # Stream 模式 = 长连接
app_key: ${DINGTALK_APP_KEY}
app_secret: ${DINGTALK_APP_SECRET}
default_agent: xiaozhao
group_mode: mention_only
allowed_users: []
```

重启：
```bash
openclaw gateway restart
openclaw channels list
```

### 步骤 7：测试

钉钉 → 工作台 → 找到你的应用 → 进入聊天窗口 → 发消息测试。

群里测试：拉机器人进群 → @机器人 + 内容。

### 钉钉 vs 飞书

| | 飞书 | 钉钉 |
|---|---|---|
| 个人能用 | ✅ 个人版免费 | ❌ 主要企业 |
| 应用市场 | ✅ | ✅ |
| Bot API 完整度 | ✅✅✅ | ✅✅ |
| 开发文档 | ✅✅✅ | ✅✅ |
| OpenClaw 适配 | ✅ 完整 | ✅ 较好 |

## 23.3 企业微信接入

### 适合
- 公司全员用企业微信
- 想接微信生态（企微能加微信好友）

### 步骤 1：创建企微应用

1. [企微管理后台](https://work.weixin.qq.com/) 登录（要管理员账号）
2. 「应用管理」→「自建」→ 创建应用
3. 填名字、Logo、可见范围

### 步骤 2：拿凭证

应用详情页：
- **AgentId**：`1000xxx`
- **Secret**：点「查看 Secret」

企业基本信息：
- **CorpID**：`ww xxxxxxxxxxxxxx`

### 步骤 3：配置回调（接收消息）

「应用功能」→「接收消息」→「设置 API 接收」

需要：
- 公网可访问的 HTTPS URL
- Token、EncodingAESKey（这里手动生成）

::: warning 企微只支持 webhook 回调
不像飞书 / 钉钉有 stream 模式，企微必须公网 URL。
新手如果不想买云服务器：先用 **frp / ngrok / cloudflare tunnel** 把本地端口暴露。
:::

### 步骤 4：OpenClaw 配置

`.env`:
```bash
WECOM_CORP_ID=wwxxxxxxxxxxxxxx
WECOM_AGENT_ID=1000xxx
WECOM_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
WECOM_CALLBACK_TOKEN=your_token
WECOM_CALLBACK_AES_KEY=your_aes_key_43_chars
```

`~/.openclaw/workspace/channels/wecom.yaml`:
```yaml
id: wecom
type: wecom
mode: webhook
corp_id: ${WECOM_CORP_ID}
agent_id: ${WECOM_AGENT_ID}
secret: ${WECOM_SECRET}
callback:
  token: ${WECOM_CALLBACK_TOKEN}
  aes_key: ${WECOM_CALLBACK_AES_KEY}
  path: /openclaw/wecom         # 你的公网 URL 后缀
default_agent: xiaozhao
```

并把回调 URL 填回企微后台：
```
https://yourdomain.com/openclaw/wecom
```

点验证 → 通过即生效。

### 测试

企微里搜你的应用 → 发消息测试。

## 23.4 QQ 接入（OneBot 协议）

::: warning 进阶 / 自担风险
QQ 没官方 bot API，社区方案基于"协议反向工程"。腾讯不官方支持，**有小概率风控**。
个人玩家用没问题，**生产环境不建议**。
:::

### 原理

OneBot v11 / v12 是社区标准协议。常用实现：
- **NapCat**（推荐，活跃）
- **Lagrange.Core**
- **go-cqhttp**（老牌但维护中断）

### 步骤 1：装 NapCat

```bash
# Docker 跑 NapCat
docker run -d --name napcat \
  -e ACCOUNT=你的QQ号 \
  -p 3000:3000 \
  -p 6099:6099 \
  -v $(pwd)/napcat:/app/napcat \
  mlikiowa/napcat-docker:latest
```

详细步骤看 [NapCat 文档](https://napneko.github.io/)。

### 步骤 2：扫码登录

```bash
docker exec -it napcat /bin/sh
# 容器里跑：napcat qrcode
```

QQ 手机扫码登录。

### 步骤 3：OpenClaw 配置

```yaml
# channels/qq.yaml
id: qq
type: onebot
mode: ws_reverse              # 让 NapCat 主动连 OpenClaw
ws_endpoint: ws://localhost:3000
access_token: your_access_token
default_agent: xiaozhao
group_mode: mention_only
```

### 步骤 4：测试

QQ 给你的账号发条消息，OpenClaw 应该收到。

### 风险提醒

- 长期挂可能触发 QQ 风控
- 频繁发消息（>30 条/分钟）会被限速甚至封号
- **个人玩家用**，公司号别上

## 23.5 微信个人号（强烈警告）

::: danger 不推荐生产使用
微信对非官方协议**严打**。
被封号 = 损失通讯录 + 聊天记录 + 支付绑定 + 朋友圈，代价巨大。
本节仅为完整性介绍，**自己评估风险**。
:::

### 方案对比

| 方案 | 原理 | 风险 |
|---|---|---|
| **wechaty** | 多种 puppet 适配（iPad/Web/PadLocal） | 高 |
| **iPad 协议** | 模拟 iPad 端协议 | 高（最近一年封号率上升） |
| **企微 + 外部联系人** | 企微账号加外部微信好友 | **低**（推荐替代） |

### 推荐替代：企微+外部联系人

- 配企业微信（公司号或个体户认证）
- 加微信好友、进微信群（双方都看得到）
- 所有交互走企微的官方 API
- **零封号风险**

详见微信官方 [企业微信加外部好友](https://open.work.weixin.qq.com/help2/pc/14931)。

### 实在要用 wechaty

最小示例（**仅个人玩家 / 自担风险**）：

```bash
# 装 wechaty + puppet
npm install -g wechaty @wechaty/puppet-padlocal

# 申请 padlocal token（要钱，¥99/月）
# https://pad-local.com/
```

配置：
```yaml
# channels/wechat.yaml
id: wechat
type: wechaty
puppet: padlocal
padlocal_token: ${PADLOCAL_TOKEN}
default_agent: xiaozhao
respond_in_dm: true
group_mode: mention_only        # 必须 mention_only，否则瞬间风控
```

⚠️ 强烈提醒：
- 用小号（不是主力号）
- 不要给陌生人发消息
- 不要进 100+ 大群
- 控制消息频率 < 10 条/分钟

## 23.6 多 channel 同时挂的实战配置

```
~/.openclaw/workspace/channels/
├── feishu.yaml          ← 主要 channel（工作）
├── dingtalk.yaml        ← 副渠道（接 ToB 客户）
├── telegram.yaml        ← 个人随手发
└── webchat.yaml         ← 浏览器备用
```

每个 channel.yaml 指定路由的 default_agent。OpenClaw 自动统一管理。

## 23.7 国内 channel 综合速查表

| 你的场景 | 推荐 channel |
|---|---|
| 公司用飞书 | **feishu** |
| 公司用钉钉 | **dingtalk** |
| 公司用企微 | **wecom** |
| 个人项目 / 想试试 | **telegram**（要翻墙）或 **feishu** |
| 家庭管家（家人微信群） | **企微 + 外部好友** 或 **wechaty**（自担风险） |
| 二次元 / QQ 社群 | **qq (onebot)** |
| 浏览器临时 | **webchat** |

## 23.8 安全清单（国内 channel 专属）

✅ 必做
- 飞书 / 钉钉 / 企微 用官方 API，**安全可靠**
- 所有 channel 配 `allowed_users` 白名单
- `mention_only` 防群里被滥用

⚠️ 注意
- QQ 用 NapCat 等：用小号
- 微信 wechaty：避免主力号
- 接外部用户：开 rate_limit 防滥用 token

❌ 不要
- 把"操作公司系统"的 agent 挂在个人微信上
- 在公开群里用未鉴权的 bot

---

## 看完这一章你应该知道

✅ 国内 5 大 IM 接入方法
✅ 飞书 / 钉钉 / 企微 = 官方 API，安全
✅ QQ 用 OneBot 协议，个人玩家友好
✅ 微信个人号有封号风险，**建议用企微+外部好友替代**
✅ 多 channel 可同时挂，按场景路由

---

**下一步**：[24. 网络与镜像加速 →](/openclaw/china/network)

最后一篇国内适配——npm 镜像、代理配置、国内云部署优化。
