# 13. Dashboard 控制台

::: info 本章你将学到
- Dashboard 在哪打开、能看什么
- 8 个主面板的功能详解（Agents / Channels / Chat / Skills / Memory / Stats / Logs / Settings）
- 远程访问 Dashboard 的安全姿势
- 哪些事 Dashboard 比 CLI 方便、哪些事还是要回 CLI
:::

## 13.1 怎么打开

浏览器访问：`http://localhost:18789`

::: tip 端口不一样？
默认 18789。如果你启动 Gateway 时改了 port，要用对应的。`openclaw gateway status` 能看当前端口。
:::

## 13.2 Dashboard 全景

```
┌──────────────────────────────────────────────────┐
│ 🦞 OpenClaw            user@host  ✓ 1.2.3       │ ← 顶栏
├──────────────────────────────────────────────────┤
│                                                  │
│  📊 Dashboard      ← 全局概览                    │
│  🤖 Agents          ← 所有 agent 管理            │
│  💬 Chat            ← 浏览器里直接和 agent 聊    │
│  📡 Channels        ← 渠道状态、消息流量         │
│  🧩 Skills          ← 装/管/写 skill             │
│  🧠 Memory          ← 翻看 agent 记忆            │
│  📈 Stats           ← 用量、成本                 │
│  📋 Logs            ← 实时日志、历史搜索         │
│  ⚙️ Settings        ← Provider、Network、备份    │
│                                                  │
└──────────────────────────────────────────────────┘
```

逐个面板详解。

## 13.3 主页 Overview

打开 Dashboard 第一眼看到的：

- **System Status**: Gateway 在跑 ✓, port 18789, uptime 2h 13m
- **Active Agents**: 2 个，分别用什么模型
- **Active Channels**: 3 个，最近 24h 处理了 234 条消息
- **Today's Cost**: ¥1.25 (vs 昨天 ¥0.98)
- **Recent Activity**: 最近 10 条对话摘要

适合**每天开机第一眼瞄一下**，确认一切正常。

## 13.4 Agents 面板

### 看到什么

每个 agent 一张卡片：
- 名字、ID
- 使用的 model
- 已挂的 channel
- 装了几个 skill
- 最近活跃时间
- 今日对话数 / token 使用

### 能做什么

- ✏️ 编辑 soul.md（在线编辑器，省得开 vim）
- 🔄 Reload agent（不重启 gateway）
- ⏸ 暂停 agent（暂时不响应任何消息）
- 🗑 删除 agent（带二次确认）
- ➕ 创建新 agent（向导式，比手写 yaml 简单）

::: tip Soul 在线编辑
对小白超友好——不用知道文件路径、不用 vim，浏览器里直接改保存。
:::

## 13.5 Chat 面板

**Dashboard 内置 WebChat**，相当于一个本地的 ChatGPT 界面。

特点：
- 不用装任何 IM 也能和 agent 对话
- 切换不同 agent
- 历史记录保留
- 显示 agent 调用了哪些 skill、用了多少 token

适合：
- 开发 / 调试 skill 时
- 隐私敏感对话（完全本地）
- 临时想问个事但不想开 IM

## 13.6 Channels 面板

每个 channel 显示：
- 连接状态（✓ active / ⚠ disconnected / ✗ error）
- 接的 agent
- 今日消息数
- 错误率
- 最后一条消息时间

能做：
- 启 / 停 / 重启某个 channel
- 看实时消息流（最近 50 条 in/out）
- 测试连接（点"Ping"按钮）

诊断 channel 问题最快的地方。

## 13.7 Skills 面板

分三个 tab：

### Installed（已装）
列出你装了的所有 skill。能：
- 启用 / 禁用
- 卸载
- 看 SKILL.md 详情
- 看它对哪个 agent 可用

### Browse（浏览市场）
集成 ClawHub 的 UI——浏览社区 skill，一键安装。

按分类找：
- 📧 邮件 / 消息
- 📅 日程 / 任务
- 🌐 浏览器 / 网页抓取
- 💻 开发 / Git
- 🏠 智能家居
- 📊 数据 / 报表
- ……

### My Skills（自己写的）
你 workspace 里自定义的 skill。可以在线编辑 SKILL.md。

## 13.8 Memory 面板

每个 agent 一个 tab，显示：
- Long-term memory（长期记忆，soul-level 持久）
- Session memory（会话记忆，最近 N 次对话）
- Working memory（当前对话的临时记忆）

能做：
- 浏览 / 搜索 memory 条目
- 手动添加一条
- 删除某条（agent 就忘了）
- 导出 JSON（备份用）

::: tip 帮 agent "改记忆"
有时候 agent 记错了事（比如把"我家狗叫旺财"记成"我家狗叫小黑"），来这个面板手动改一下比训话半天有效。
:::

## 13.9 Stats 面板

可视化展示：
- **Token Usage**: 折线图，按日/周/月看
- **Cost Breakdown**: 饼图，按 provider/agent/channel 拆分
- **Response Time**: 平均、p50、p95、p99 响应延迟
- **Success Rate**: 调用 LLM 成功率

适合：
- 月底看账单（节流）
- 怀疑某 agent 是否在乱花钱
- 优化哪个慢

## 13.10 Logs 面板

```
🔍 [Filter] [Time range]  [Level]  [Search]

10:23:45 [INFO]  agent:xiaozhao  Received message from feishu/oc_xxx
10:23:46 [INFO]  agent:xiaozhao  LLM call: deepseek-chat (1200 tokens)
10:23:47 [INFO]  agent:xiaozhao  Skill: gmail.list_unread (12 emails)
10:23:48 [INFO]  agent:xiaozhao  Replied to feishu/oc_xxx
10:23:48 [DEBUG] gateway        Memory updated for xiaozhao
```

能做：
- 实时流（默认）
- 按 agent / channel / level 过滤
- 时间范围筛
- 关键字搜
- 导出 .log 文件给开发者排查

## 13.11 Settings 面板

包含子菜单：
- **Providers**：增删 LLM 供应商（也可以在 providers.yaml 改后这里重载）
- **Network**：代理设置（HTTPS_PROXY 等）
- **Backup**：手动备份 / 恢复 workspace
- **Updates**：检查 OpenClaw 新版
- **API Keys**：看 / 轮换 API Keys（界面 mask 显示，安全）

## 13.12 远程访问 Dashboard 的安全姿势

Dashboard 默认只绑 `127.0.0.1`（本机才能访问）。要从手机/外地访问？**不要直接公网暴露 18789 端口**。

### 推荐方案：SSH 隧道（最简单）

电脑里：
```bash
ssh -L 18789:localhost:18789 user@your-server
```

然后**本地浏览器**访问 `http://localhost:18789`，请求会自动转发到服务器。安全又简单。

### 推荐方案 2：Tailscale（移动端友好）

[Tailscale](https://tailscale.com) 是个"私人内网"工具：
1. 服务器和手机都装 Tailscale，登录同一账号
2. 服务器自动有个内网 IP（如 100.x.x.x）
3. 手机浏览器访问 `http://100.x.x.x:18789` 直达

跨设备无缝，**强烈推荐**。

### 反面教材：直接公网暴露 ❌

```yaml
# 千万别这样
gateway:
  bind_host: 0.0.0.0    # ❌ 任何人都能访问
```

如果一定要这么干，**至少必须**：
- 开启 Dashboard 鉴权（设密码）
- 上 HTTPS
- 加 IP 白名单

但**强烈不建议新手碰**——出事概率太大。

## 13.13 Dashboard vs CLI：什么时候用哪个

| 场景 | 推荐 |
|---|---|
| 第一次配置 / 体验 | Dashboard（可视化友好） |
| 写 / 改 soul.md | Dashboard 在线编辑 |
| 跑 cron / 脚本 | CLI（脚本里只能 CLI） |
| 实时看日志找 bug | 都行（看个人偏好） |
| 装新 skill | Dashboard 浏览市场更直观 |
| 重启服务 | CLI 更快 |
| 给同事演示 | Dashboard 一目了然 |
| 远程 SSH 维护 | CLI |
| 看花了多少钱 | Dashboard 图表更清晰 |
| 自动化 | 必须 CLI |

**结论**：两个都掌握。Dashboard 看状态、改配置；CLI 跑脚本、调命令。

## 13.14 常见问题

### Q：Dashboard 打不开（连接被拒）
A：Gateway 没启。`openclaw gateway start`。

### Q：能打开但页面一直转圈
A：Gateway 启了但卡死了。`openclaw gateway restart`。

### Q：远程服务器装的，浏览器访问不了
A：默认绑本机。要么走 SSH 隧道（推荐），要么改绑 `0.0.0.0`（不推荐，要加鉴权）。

### Q：Dashboard 显示中文乱码
A：浏览器编码设 UTF-8。或者换 Chrome / Firefox 最新版。

### Q：在线编辑 soul.md 保存后 agent 没生效
A：保存后 Dashboard 应该自动 reload agent。如果没生效手动 `openclaw agents reload <id>`。

---

## 看完这一章你应该知道

✅ Dashboard 在 `http://localhost:18789`
✅ 8 大面板：Overview / Agents / Chat / Channels / Skills / Memory / Stats / Logs / Settings
✅ Soul.md 在线编辑、Skill 在线浏览安装，对新手友好
✅ 远程访问用 SSH 隧道或 Tailscale，**不要**裸暴露
✅ Dashboard 看状态，CLI 跑脚本

---

**下一步**：[14. 日志与故障排查 →](/openclaw/ops/logs)

下一章专讲"出问题怎么办"——看懂日志、定位错误、常见症状速查。
