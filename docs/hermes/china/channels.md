# 24. 国内 channel 现实

::: info 本章你将学到
- 为什么 Hermes 默认**不支持**国内主流 IM
- 国内用户的 3 个现实选择
- 用 OpenClaw 当"桥梁"接 Hermes 到飞书 / 钉钉 / 微信
- 直接给 Hermes 加自定义 channel（高阶）
- 邮件作为 fallback channel
:::

::: warning 诚实定位
Hermes 由 Nous Research（美国团队）开发，**原生只支持国际 IM**：
- ✅ Telegram / Discord / Slack / WhatsApp / Signal / Matrix / Email / CLI
- ❌ 飞书 / 钉钉 / 企业微信 / QQ / 微信

国内 IM 重度用户，**首选 [OpenClaw](/openclaw/)**——它原生支持所有国内 IM。
本章给"既想用 Hermes 又重度依赖国内 IM"的用户**桥接方案**。
:::

## 24.1 三种现实选择

| 选择 | 适合 | 难度 |
|---|---|---|
| **A. 用 CLI / Telegram + 邮件** | 个人技术玩家 | ⭐ |
| **B. OpenClaw 桥接** | 需要国内 IM 同时玩 Hermes 特性 | ⭐⭐⭐ |
| **C. 自写 channel 适配器** | Python 老手 | ⭐⭐⭐⭐ |

逐个讲。

## 24.2 选择 A：CLI / Telegram + 邮件

**最简单**——接受 Hermes 不接国内 IM，用：

| 场景 | 用什么 |
|---|---|
| 日常对话 | CLI（终端 `hermes`） |
| 移动端 | Telegram bot（如果能翻墙） |
| 接收通知 | Email（hermes 内置 email gateway） |
| 触发任务 | cron / webhook |

### Email channel（国内独家推荐）

很多人忘了 Email 也算 IM——而且**国内绝对能用**。

```bash
hermes platform add email
```

向导：
```
? Email provider:
  ❯ SMTP (general)
    Gmail
    Outlook
    iCloud

? SMTP host:
  > smtp.qq.com

? Port:
  > 587

? Username:
  > yourname@qq.com

? Password (app password, not login pwd):
  > xxxx xxxx xxxx xxxx

? Incoming (IMAP):
  > imap.qq.com:993

? Sender filter (only respond to these):
  > yourname@qq.com,boss@company.com
```

之后 hermes 监听这个邮箱，**任何邮件自动当对话**：
- 你发邮件给 hermes（标题或正文写需求）
- hermes 处理后回邮件

适合：
- 长任务结果接收（trajectory / 周报）
- 非紧急 / 不需要实时
- 完全合规（国内国外通用）

## 24.3 选择 B：OpenClaw 桥接 Hermes（推荐）

如果你既要 Hermes 的 self-improving 能力 + 国内 IM 接入，**最佳方案是装两个工具**：
- **OpenClaw**：接管国内 IM（飞书 / 钉钉 / 微信 / QQ）
- **Hermes**：跑后台 self-improving agent

让 OpenClaw 当"传话员"，把消息转给 Hermes 处理。

### 架构

```
国内 IM（飞书 / 钉钉 / 微信）
    ↑↓
  OpenClaw Gateway
    ↑↓ 内部转发
  Hermes（用 CLI / 内部 API）
```

### 配置步骤

#### 步骤 1：装好两个工具

按各自章节先装好。

#### 步骤 2：让 OpenClaw 装 hermes-bridge skill

```bash
openclaw skill install hermes-bridge
```

（社区维护，**或自己写**——下节示范）

#### 步骤 3：OpenClaw 配置转发

`~/.openclaw/workspace/agents/bridge/agent.yaml`：
```yaml
id: hermes-bridge-agent
soul: ./soul.md
skills:
  - hermes-bridge
channels:
  - feishu              # 国内 IM 接入
```

soul.md:
```markdown
# 你是 Hermes 的桥梁
所有用户消息原样转给 Hermes 处理，把 Hermes 的回复转回用户。
不要自己回答，自己只做转发。
```

hermes-bridge skill（Python 简化版）：
```python
import subprocess

@skill("hermes-bridge")
async def relay_to_hermes(user_message, user_id):
    # 调 hermes CLI 处理
    result = subprocess.run(
        ["hermes", user_message, "--quiet", "--user", str(user_id)],
        capture_output=True, text=True, timeout=300
    )
    return result.stdout
```

#### 效果

```
你: （在飞书）@小爪 调研一下 vLLM 这个开源项目，写个对比报告

[OpenClaw 收到] → [转给 Hermes] → [Hermes 用 subagent 调研] → [回 OpenClaw] → [发飞书]
```

你在飞书里享受了 Hermes 的**所有能力**：subagents 并行、Honcho 记忆、self-improving skills。

::: tip 这是本站独家组合方案
两个工具协同：OpenClaw 解决国内 IM，Hermes 解决 AI 能力深度。
:::

## 24.4 选择 C：自写 channel 适配器

Python 老手可以直接给 Hermes 加自定义 channel。

### Hermes Channel 接口

```python
# ~/.hermes/custom_platforms/feishu.py

from hermes.platform import Platform, Message, ReplyContext

class FeishuPlatform(Platform):
    name = "feishu"

    def __init__(self, app_id, app_secret):
        self.app_id = app_id
        self.app_secret = app_secret
        # 飞书 SDK 初始化

    async def connect(self):
        """长连接订阅事件"""
        await feishu_sdk.connect()
        await feishu_sdk.subscribe("im.message.receive_v1", self._on_message)

    async def _on_message(self, event):
        """飞书消息进来 → 转成 Hermes Message"""
        msg = Message(
            text=event["content"]["text"],
            user_id=event["sender"]["sender_id"],
            chat_id=event["message"]["chat_id"],
            platform="feishu",
        )
        await self.dispatch(msg)   # 给 Hermes 处理

    async def reply(self, ctx: ReplyContext, text: str):
        """Hermes 回复 → 转发到飞书"""
        await feishu_sdk.send_message(
            chat_id=ctx.chat_id,
            text=text,
        )

# 注册
def register():
    return FeishuPlatform(
        app_id=os.environ["FEISHU_APP_ID"],
        app_secret=os.environ["FEISHU_APP_SECRET"],
    )
```

### 接入 Hermes

```yaml
# ~/.hermes/config.yaml
platforms:
  custom:
    - id: feishu
      module: ~/.hermes/custom_platforms/feishu.py
      enabled: true
```

```bash
hermes gateway restart
hermes platform list
```

应看到飞书。

::: warning 这条路工作量大
飞书 / 钉钉 / 企微的 SDK + 长连接 + 验签都得自己写。**预计 2-3 天开发**。

更省时的就是用方案 B（OpenClaw 桥接）。
:::

## 24.5 各国内 IM 适配难度

| IM | 难度 | 备注 |
|---|---|---|
| **飞书** | ⭐⭐ | 官方 SDK 全 |
| **钉钉** | ⭐⭐ | 官方 SDK 全 |
| **企业微信** | ⭐⭐⭐ | 要公网 HTTPS 回调 |
| **QQ** | ⭐⭐⭐⭐ | 没官方 bot，用 OneBot 协议 |
| **微信个人号** | ⭐⭐⭐⭐⭐ | 灰色地带，封号风险 |

最划算的是接飞书 + 钉钉。

## 24.6 国内用户实战推荐

按角色：

### 角色 A：独立开发者 / 个人玩家
- 用 CLI + Telegram（翻墙）+ Email
- 不接飞书 / 微信

### 角色 B：技术博主 / 内容创作者
- 用 CLI + Email + 公众号自动发布
- 选 OpenClaw + Hermes 双工具协作

### 角色 C：企业内技术员
- 公司用飞书 → 接 OpenClaw 飞书 + 桥接 Hermes
- 个人长跑用 Hermes CLI

### 角色 D：研究员 / 科研工作者
- CLI 为主，Email 通知长跑任务
- 国外服务（OpenRouter）+ 翻墙

## 24.7 性能提示

桥接架构会有额外延迟（OpenClaw → Hermes → OpenClaw 来回）：

| 链路 | 延迟 |
|---|---|
| 用户 → Hermes 直接 CLI | 1-3 s |
| 用户 → Telegram → Hermes | 2-5 s |
| 用户 → 飞书 → OpenClaw → Hermes → OpenClaw → 飞书 | 5-15 s |

桥接慢 3-5 倍。可接受。

## 24.8 国内 LLM + 国内 IM 全套组合

最简化的全国产方案：

```
飞书消息
  ↓
OpenClaw (Node.js, 接国内 IM)
  ↓ 转发
Hermes (Python, 跑 agent loop)
  ↓ 调
DeepSeek / Kimi / MiniMax (国产 LLM)
  ↓ 任务结束
Hermes 写 skill / 更新 Honcho 记忆
  ↓ 回复
OpenClaw → 飞书 → 用户
```

整套 **完全本地 + 国产 + 不需要翻墙**。

## 24.9 等官方支持

Hermes 社区有持续讨论加国内 IM 原生支持：
- 飞书：[Issue #523](https://github.com/NousResearch/hermes-agent/issues/523)
- 微信：[Issue #687](https://github.com/NousResearch/hermes-agent/issues/687)

预计在 v1.0 之前可能加入（**不保证**）。

---

## 看完这一章你应该知道

✅ Hermes 原生不支持国内 IM，**这是真实限制**
✅ 国内 IM 重度用户**首推 OpenClaw**
✅ 既要 Hermes 能力又要国内 IM → OpenClaw 桥接 Hermes（最佳）
✅ 高级玩家可自写 Python channel 适配器
✅ Email channel 是简洁的兜底（完全合规）

---

## 国内适配篇结束 🎉

到这里 Hermes 在国内的所有适配你都掌握了。
下一篇起进入 **10 个实战案例**——挑你感兴趣的看。

**下一步**：[25. 案例 1：自进化日记 →](/hermes/cases/self-evolve)

第一个实战：用一周后翻 Hermes 自己生成的 skill，看它如何"进化"。
