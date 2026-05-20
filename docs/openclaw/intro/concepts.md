# 2. 核心概念图解

::: info 本章你将学到
- OpenClaw 的五个核心组件：Gateway / Agent / Channel / Skill / Memory
- 它们怎么协同工作（一条消息从进来到回去都经历了什么）
- 看完后你应该能"听懂"后续章节的所有"行话"
:::

::: tip 为什么先讲概念
很多教程上来就让你装软件，结果你装完了但完全不知道自己在干嘛。OpenClaw 概念比 ChatGPT 多一些，**先花 15 分钟搞懂这几个词，后面所有教程会顺畅 10 倍**。
:::

## 2.1 全景图：先看一张图

```
┌─────────────────────────────────────────────────────────────┐
│                  你（用户）                                  │
│         ↑↓ 发消息 / 收回复                                   │
└─────────────────────────────────────────────────────────────┘
              ↑↓                       ↑↓
        ┌─────────────┐         ┌─────────────┐
        │  飞书 / 微信 │         │  Telegram   │   ← Channel（通道）
        │   钉钉 / QQ │         │   Slack 等  │
        └──────┬──────┘         └──────┬──────┘
               │                       │
               └───────────┬───────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │           Gateway（网关）             │   ← 整个 OpenClaw 的大脑/总机
        │  · 24h 后台常驻进程                  │
        │  · ws://127.0.0.1:18789              │
        │  · 路由消息、管 session、管记忆      │
        └──────────────────┬───────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │            Agent（智能体）            │   ← 一个有人格的 AI
        │  · Soul 文件定义身份和行为           │
        │  · 可以装多个 Skill                   │
        │  · 有自己的 Memory                    │
        └──┬──────────────────┬───────────────┘
           ↓                  ↓                ↓
    ┌──────────┐       ┌──────────┐    ┌──────────┐
    │  Skill 1 │       │  Skill 2 │    │ LLM API  │   ← Skill：能力包
    │ 收发邮件 │       │ 抓网页   │    │ Claude/  │   ← LLM：大脑
    └──────────┘       └──────────┘    │ GPT/...  │
                                       └──────────┘
```

记住这张图，下面逐个讲解。

## 2.2 Gateway（网关） — 整个系统的"总机"

**一句话**：Gateway 是一个**永远在后台运行**的程序，所有消息都从它过一遍。

它就像公司前台/总机：
- 飞书发来个消息？前台先收到
- 决定这条消息交给哪个 Agent 处理？前台来路由
- Agent 处理完要回消息？走前台发出去
- 谁要查 agent 状态？问前台

### 技术上它是什么

- 一个 **Node.js 长进程**，启动后一直跑
- 监听本地端口 `ws://127.0.0.1:18789`（WebSocket）
- macOS 下用 `launchd` 注册，Linux 用 `systemd`，Windows（WSL2）也用 systemd
- 启动命令：`openclaw gateway --port 18789`

### 你为什么会经常听到它

- 安装 OpenClaw 后第一件事是"装 Gateway 守护进程"
- 排查问题：90% 的"接不通"问题先看 Gateway 是否在运行
- 命令 `openclaw gateway start/stop/restart/status` 都是管它

::: warning 一个机器只能有一个 Gateway
不是只能跑一个 Agent，而是**一个 Gateway 进程可以同时托管多个 Agent**。你不需要装多个 OpenClaw。
:::

## 2.3 Agent（智能体） — 一个"AI 人格"

**一句话**：Agent 是一个具体的 AI 角色——有自己的身份、自己的记忆、自己的工具权限。

打个比方：
- **Gateway** = 一家公司的总机
- **Agent** = 公司里的具体员工。可以有"前台小姐"、"程序员小王"、"客服小李"等不同员工，每人技能不同、权限不同

一个常见用法：
- 工作 Agent：能访问公司邮箱、Notion、GitHub，但不能动家里的智能家居
- 家庭 Agent：能管家庭日历、购物清单、智能音箱，但不知道公司任何事

两个 Agent 同时跑在同一个 Gateway 下，**互不干扰**。

### Agent 的三块构成

1. **Soul（灵魂）** — 一份 `soul.md` 文件，定义"你是谁，你的性格，你能做什么不能做什么"
2. **Skills** — 这个 Agent 装了哪些技能包
3. **Memory** — 这个 Agent 记住了哪些事

### 示例：一个 Agent 的 Soul 文件长这样

```markdown
# 你是谁
你是小张的私人助理 "小爪"，温和、礼貌、办事麻利。

# 行为准则
- 涉及付款必须二次确认
- 周末晚 10 点后不主动 ping，除非紧急
- 不知道的事直接说"不知道"，不编

# 你能用的工具
- gmail（收发邮件）
- google-calendar（看和改日程）
- notion（读写笔记）

# 长期记忆要点
- 主人偏好早起、喜欢咖啡
- 主人对花生过敏，订餐时绝对避开
```

::: tip Soul 不是固定模板
你可以自由写，OpenClaw 会把这份文件作为"系统提示词"塞给 LLM。后面 [9. 你的第一个 Agent](/openclaw/setup/first-agent) 会详细教怎么写。
:::

## 2.4 Channel（通道） — 怎么跟它对话

**一句话**：Channel 是消息的"管道"——决定你**通过什么 app** 和 Agent 聊天。

OpenClaw 支持 50+ channel：

| 国际 | WhatsApp / Telegram / Slack / Discord / iMessage / Signal / Teams |
|---|---|
| **国内** | **飞书 / 钉钉 / 企业微信 / QQ / 微信** |
| **网页** | WebChat（浏览器直接打开） |
| **命令行** | CLI（终端里直接对话） |

### 关键设计：一个 Agent 可以同时挂多个 Channel

举个例子：
- 你的 "私人助理 Agent" 同时挂在 **微信 + Telegram + WebChat** 三个 channel
- 你在家用微信跟它说"明天 8 点叫我起床"
- 第二天到公司，在 Telegram 继续问"早上让你帮我查的航班怎么样？"
- Agent 知道是同一个你，记忆是连贯的

这就是 OpenClaw 比"单个 IM 的机器人"强大很多的地方。

::: warning Channel 接入要看平台限制
不同 channel 申请难度不一样：
- **最简单**：Telegram（5 分钟）、Discord（10 分钟）
- **中等**：飞书（要建企业应用，20 分钟）、Slack（要建 app，20 分钟）
- **较复杂**：微信个人号（涉及风控、灰色地带）、QQ（要协议库）

本站会按从易到难给保姆级教程。新手建议先用 Telegram（如果能翻墙）或飞书（国内推荐）。
:::

## 2.5 Skill（技能） — 给 Agent 加"工具"

**一句话**：Skill 是一个 Markdown 包，告诉 Agent **"你现在多了一个新本事"**。

没有 Skill 的 Agent 是"光杆司令"——只能聊天，不能干活。

装了 Skill 之后：
- 装 `gmail` skill → 能收发邮件
- 装 `playwright-browser` skill → 能控制浏览器
- 装 `github` skill → 能管仓库、提 PR
- 装 `shell` skill → 能执行 shell 命令（**危险，慎装**）

### Skill 的来源

| 来源 | 说明 |
|---|---|
| **Bundled（内置）** | OpenClaw 装好时自带的核心 skill |
| **Managed（社区）** | 从 [ClawHub](https://clawhub.ai) 一键安装，有几百个 |
| **Workspace（自写）** | 你自己写的 Markdown 包，放在 workspace 目录里 |

### 一个 Skill 长什么样

```
my-skills/
  email-summarizer/
    SKILL.md          ← 说明书，告诉 Agent 这个 skill 怎么用
    summarize.js      ← 实际执行的脚本
    config.json       ← 可选配置
```

`SKILL.md` 大概长这样：
```markdown
# email-summarizer

## 用途
对一封邮件进行摘要，提取要点。

## 调用方式
ask user for: email_content (string)
returns: summary (string), action_items (string[])

## 例子
输入：长篇会议纪要邮件
输出：3 行摘要 + 待办事项列表
```

LLM 看到这份说明就知道 "哦，我现在能调 email-summarizer 了，给它邮件正文就能拿摘要"。

::: tip 智能注入
OpenClaw **不会**把你装的所有 skill 一股脑塞给 LLM。它会根据当前对话**只挑相关的几个**注入。所以你可以放心装很多 skill，不会让 prompt 爆炸。
:::

后面 [16. Skills 系统入门](/openclaw/advanced/skills-intro) 和 [17. 写你的第一个 Skill](/openclaw/advanced/write-skill) 会详细教。

## 2.6 Memory（记忆） — 让 Agent "记住事"

**一句话**：Memory 是 Agent 跨对话也能记住的笔记。

LLM 本身是"金鱼记忆"——每次对话开始时什么都不记得。OpenClaw 给 Agent 加了三层记忆：

| 层级 | 范围 | 何时用 |
|---|---|---|
| **短期记忆** | 当前这次对话 | 自动维护，无需操心 |
| **会话记忆** | 跨多次对话，同一 channel | "上次我跟你说过那个 bug" 这类 |
| **长期记忆 (Soul)** | 永久存在，所有对话都能用 | "主人对花生过敏" 这类核心事实 |

Memory 文件在 workspace 目录下，是普通 Markdown，**你可以手动改**。

详见 [19. Memory 记忆系统](/openclaw/advanced/memory)。

## 2.7 把它们串起来：一条消息的完整旅程

假设你在飞书里发"帮我看下今天的天气，下雨我就带伞"：

```
1. 你在飞书发消息
       ↓
2. 飞书 channel 收到，转发给 Gateway
       ↓
3. Gateway 查路由表：这条消息归 "小爪 Agent" 处理
       ↓
4. Gateway 把消息 + 小爪的 Soul + 相关 Memory + 可用 Skill 列表，
   全部打包成 context，发给 LLM (Claude/GPT)
       ↓
5. LLM 看完决定："我需要调 weather skill"
       ↓
6. Gateway 调用 weather skill，拿到今天天气：小雨
       ↓
7. LLM 看到结果，决定回复："今天小雨，建议带伞 ☔"
       ↓
8. Gateway 把回复通过飞书 channel 推给你
       ↓
9. 你收到飞书消息：今天小雨，建议带伞 ☔
       ↓
10. Gateway 把这次对话存进 Memory，下次你说"上次我问天气..."它还记得
```

整个过程从你按发送到收到回复，通常 **1-3 秒**（取决于 LLM 速度）。

## 2.8 还有一些次要概念，先有个印象

| 词 | 一句话解释 |
|---|---|
| **Daemon** | "守护进程"的简称。Gateway 就是一个 daemon，OpenClaw 帮你自动注册成系统服务（开机自启） |
| **Node** | 一个连到 Gateway 的"设备"——可以是你的手机、电脑、Apple Watch，提供位置/摄像头/麦克风等能力 |
| **Canvas** | Agent 可以打开的"画板"页面（HTML），用于展示数据、图表、表单。跑在独立端口 18793 |
| **Workspace** | 一个项目目录，里面装着 Agent 的 Soul、Skill、Memory 等全部状态 |
| **ClawHub** | 官方 skill 市场，地址 [clawhub.ai](https://clawhub.ai) |
| **MCP** | Model Context Protocol，一种通用协议，让 Agent 能接入更多外部工具 |

这些会在后面对应章节展开，**现在有个印象就行**。

---

## 看完这一章你应该知道

✅ Gateway 是后台常驻进程，所有消息的"总机"
✅ Agent 是一个 AI 人格，由 Soul + Skills + Memory 三块组成
✅ Channel 是消息通道，一个 Agent 可以挂多个 channel 同时聊
✅ Skill 是给 Agent 加工具的 Markdown 包，从 ClawHub 装或自己写
✅ Memory 让 Agent 跨对话记住事，分短期/会话/长期三层
✅ 一条消息的完整流程是：Channel → Gateway → Agent + LLM + Skill → 回 Channel

---

**下一步**：[3. 能做什么 / 不能做什么 →](/openclaw/intro/can-do)

知道概念了，下一章带你看真实场景：哪些事 OpenClaw 能干漂亮、哪些事它干不来。
