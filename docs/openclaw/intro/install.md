# 6. 安装 OpenClaw

::: info 本章你将学到
- 用 npm 一行命令装好 OpenClaw
- 跟着 onboard 向导走完首次配置
- 把 Gateway 注册成系统服务（开机自启）
- 验证安装成功的 5 个检查点
- 卸载方式（万一以后想换电脑）
:::

::: tip 本章预计 10 分钟
前提：你已经按 [第 5 章](/openclaw/intro/nodejs) 装好 Node.js 22.19+。
:::

## 6.1 一句话总览安装流程

```
npm install -g openclaw    （装核心）
        ↓
openclaw onboard --install-daemon    （引导配置 + 注册后台服务）
        ↓
回答几个问题（模型用什么、channel 接哪个等）
        ↓
openclaw gateway --port 18789    （启动）
        ↓
打开浏览器看 Dashboard → 完工
```

## 6.2 第一步：用 npm 装 OpenClaw

打开终端（Windows 用户是 WSL2 的 Ubuntu 终端），跑：

```bash
npm install -g openclaw@latest
```

::: tip 大概要等多久
国内换了淘宝镜像后约 30 秒~2 分钟。会输出一堆 `add` 提示，正常。
:::

### 验证装好了

```bash
openclaw --version
```

应该输出类似：
```
openclaw v1.x.x
```

如果提示 `command not found`，看 [常见报错速查](#_6-7-常见报错速查)。

## 6.3 第二步：跑 onboard 引导

```bash
openclaw onboard --install-daemon
```

`--install-daemon` 参数让它**顺便把 Gateway 注册成系统服务**，省得以后手动开。

向导会问几个问题。**新手按下面回答**：

### 问题 1：Quick Start 还是 Custom？
```
? Choose setup mode:
  ❯ Quick Start (recommended for first time)
    Custom
```
**选 Quick Start**。Custom 是给老手深度定制的，第一次别选。

### 问题 2：用哪个 LLM？
```
? Select your AI provider:
  ❯ Anthropic (Claude)
    OpenAI (GPT-4/GPT-5)
    DeepSeek
    Aliyun (通义千问)
    Ollama (local)
    Custom (OpenAI-compatible)
```

**新手推荐**：
- **国外用户、有 Claude/OpenAI Key** → 选对应的
- **国内用户、想低成本** → 选 **DeepSeek**（最便宜、不用翻墙）
- **完全没 Key** → 选 DeepSeek，下一章教你 5 分钟申请

选好后会让你贴 API Key，你先随便贴个字符串占位也行——下一章 [7. 申请 API Key](/openclaw/setup/api-key) 会教你怎么搞到正版 Key 再回来填正式的。

### 问题 3：选一个 channel 起步
```
? Pick ONE messaging platform to start:
    WhatsApp
  ❯ Telegram
    Slack
    Discord
    Feishu (飞书)
    DingTalk (钉钉)
    WebChat (browser)
    Skip for now
```

**新手推荐**：
- **能翻墙** → Telegram（最简单，5 分钟搞定）
- **国内** → Feishu（飞书）
- **完全不想配 IM** → WebChat（浏览器直接用）
- **先体验下，再想用什么** → Skip for now

选了之后向导会带你做基础配置（细节看后面 [10. 接入 Telegram](/openclaw/setup/telegram) 或 [11. 接入飞书](/openclaw/setup/feishu)）。

### 问题 4：装哪些 Skill？
```
? Install starter skills?
  ❯ Skip for now (install later)
    Recommended set (memory, web-search, calendar)
    Choose individually
```

**强烈建议 Skip**。新手装一堆 skill 反而搞不清楚每个干嘛。等你跑通基础后再按需装。

### 问题 5：UI 选哪个？
```
? Default UI for first launch:
  ❯ Web Dashboard (recommended)
    CLI only
    macOS app (download separately)
```

**选 Web Dashboard**。能用浏览器看状态、消息、日志，对新手友好太多。

### 配置完成

向导跑完会输出类似：
```
✓ Workspace created at ~/.openclaw/workspace
✓ Daemon installed (will auto-start on login)
✓ Gateway running at http://localhost:18789
✓ Open http://localhost:18789 in browser to see Dashboard

Done! Run `openclaw gateway status` to check.
```

## 6.4 第三步：启动 / 检查 Gateway

如果 onboard 已经帮你启动了，跳过这一步。否则手动启：

```bash
openclaw gateway --port 18789
```

或者用 systemd / launchd 已经注册的服务：

```bash
openclaw gateway start
```

### 检查 Gateway 在跑

```bash
openclaw gateway status
```

应该看到：
```
● openclaw-gateway
   Status: running
   PID: 12345
   Uptime: 2m
   Port: 18789
   Workspace: ~/.openclaw/workspace
```

## 6.5 第四步：打开 Dashboard 验证

浏览器访问 **`http://localhost:18789`**

::: tip 如果你装在远程服务器上
要用 `http://<服务器IP>:18789`，并确保防火墙开放 18789 端口。
**注意：** 公网暴露这个端口有安全风险，建议走 SSH 隧道或 Tailscale，详见 [29. 本地 vs 云端](/openclaw/deploy/local-vs-cloud)。
:::

应该看到 Dashboard 页面，包含：
- 你的 Agent 列表
- 连接的 channel
- 已装的 skill
- 实时日志

## 6.6 第五步：发第一条消息试试

打开 Dashboard 里的 **WebChat** 标签（如果没装其他 channel）。

试着发：
```
你好，你是谁
```

正常会收到回复，类似：
```
我是你的 OpenClaw 助理小爪。
我能帮你查询信息、执行任务、管理日程等。
有什么我可以帮你的吗？
```

::: warning 如果回复"API Key 无效"
说明你 onboard 时占位的 Key 不能用了。打开：
```
~/.openclaw/workspace/.env
```
把里面的 Key 改成真 Key，然后重启 Gateway：
```bash
openclaw gateway restart
```
:::

## 6.7 常见报错速查

### Q：`npm install -g openclaw` 报 EACCES Permission denied
A：没用 nvm 装 Node，全局目录是 root 拥有。**最干净的修复**：装 nvm 重装 Node（见 [5. 装好 Node.js](/openclaw/intro/nodejs)）。

临时硬办法（不推荐）：
```bash
sudo npm install -g openclaw@latest
```

### Q：`openclaw: command not found`
A：npm 全局 bin 目录没在 PATH 里。
```bash
echo $PATH
npm config get prefix
# 检查 prefix/bin 是否在 PATH 里
```

如果不在，加进 shell 配置（`~/.zshrc` 或 `~/.bashrc`）：
```bash
export PATH="$(npm config get prefix)/bin:$PATH"
```

### Q：onboard 卡住不动
A：网络问题。如果你在国内，先确认：
1. 用了淘宝镜像
2. 选的 LLM 是国内能直连的（DeepSeek / 通义 / Kimi）
3. 选的 channel 是国内能直连的（飞书 / 钉钉 / WebChat）

### Q：`openclaw gateway start` 报 "Port 18789 already in use"
A：之前的 Gateway 没关。先杀掉：
```bash
openclaw gateway stop
# 或粗暴一点
lsof -ti:18789 | xargs kill -9
```

### Q：浏览器打开 localhost:18789 显示 "Cannot connect"
A：Gateway 没跑。
```bash
openclaw gateway status
# 如果 not running:
openclaw gateway start
```

### Q：Dashboard 能打开但 WebChat 不能发消息
A：通常是 API Key 没配对。打开 `~/.openclaw/workspace/.env` 确认 Key 正确，重启 Gateway。

### Q：Windows WSL2 能跑但 Windows 浏览器打不开 localhost:18789
A：WSL2 默认绑定到 WSL 内部 IP。在 PowerShell（管理员）跑：
```powershell
wsl --shutdown
```
然后重新打开 WSL2 启 Gateway。**新版 WSL2 会自动转发 localhost 到 Windows**。

## 6.8 怎么升级 OpenClaw

```bash
npm install -g openclaw@latest
openclaw gateway restart
```

完事。

## 6.9 怎么卸载 OpenClaw

```bash
# 1. 停掉 Gateway
openclaw gateway stop

# 2. 卸载 daemon 注册
openclaw uninstall-daemon

# 3. 删除 npm 包
npm uninstall -g openclaw

# 4. （可选）删除所有配置和数据
rm -rf ~/.openclaw
```

::: warning 第 4 步会删掉所有 Agent 配置、Memory、Skill
卸载前如果想保留这些，先备份 `~/.openclaw` 目录。
:::

## 6.10 这一章完了，但 Agent 还没真正能干活

到这里你的 OpenClaw **能跑了，能聊天了**，但还没有真正的"能力"——它现在只是个穿了 OpenClaw 外壳的 ChatGPT。

接下来需要：
- 配一个真实可用的 LLM API Key（章 7-8）
- 写第一个自己的 Agent（章 9）
- 接入聊天工具（章 10/11）

走完这 5 章，你就有一个**完全可用的私人 AI 助理**了。

---

## 看完这一章你应该知道

✅ `npm install -g openclaw@latest` 一行装好
✅ `openclaw onboard --install-daemon` 走完 5 个引导问题
✅ Gateway 跑在 localhost:18789，Dashboard 浏览器可以看
✅ 升级一行命令、卸载四行命令
✅ 常见报错有了排查思路

---

**下一步**：[7. 申请你的第一个 LLM API Key →](/openclaw/setup/api-key)

OpenClaw 装好了但还没"大脑"——下一章教你 5 分钟搞到一个能用的 API Key。
