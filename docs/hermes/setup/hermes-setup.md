# 9. hermes setup 向导走读

::: info 本章你将学到
- `hermes setup` 这一条命令做的所有事
- 7 个向导问题逐个解读，新手怎么答
- 跑完后 Hermes 配置长什么样
- 重跑 setup 调整配置
- 跳过向导手写配置的方法
:::

::: tip 一句话定位
`hermes setup` 是**新手专属的"配置零代码 GUI"**——所有 LLM / tool / memory 选项问你一遍，自动生成 yaml。
:::

## 9.1 什么时候跑 setup

| 场景 | 是否跑 |
|---|---|
| 第一次装完 Hermes | ✅ 必须 |
| 想换 LLM provider | ✅ 跑一次或手改 yaml |
| 想加新 channel | ❌ 用 `hermes platform add` |
| 想换 backend | ❌ 用 `hermes config set backend` |
| 完全重置 | ✅ `hermes setup --reset` |

## 9.2 启动向导

```bash
hermes setup
```

如果是装完 Hermes 第一次跑 `hermes`，会**自动**问你要不要 setup，按 Y 进入。

## 9.3 7 个问题逐个解读

### 问题 1：欢迎 + 检测环境

```
👋 Welcome to Hermes Agent setup!

✓ Detected OS: macOS 14.5 arm64
✓ Python: 3.11.7
✓ uv: 0.5.2
✓ Workspace: ~/.hermes

This wizard will help you configure:
  - LLM provider
  - Default model
  - Toolsets
  - Memory backend
  - Messaging platforms (optional)

Continue? [Y/n]
```

按 `Y` 继续。

### 问题 2：选 LLM provider

```
? Which LLM provider would you like to use?
  ❯ Nous Portal (Hermes-3 models, OAuth)
    OpenRouter (200+ models, single key)
    OpenAI
    Anthropic (Claude)
    DeepSeek
    Kimi/Moonshot
    MiniMax
    Aliyun (通义千问)
    Zhipu (GLM)
    NovitaAI
    Ollama (local)
    Custom (OpenAI-compatible endpoint)
```

按 `↓` 选，回车确认。

**新手推荐**：
- 国内不翻墙：DeepSeek
- 想试 Hermes 自家模型：Nous Portal（OAuth 一键登录方便）
- 一个 Key 调多家：OpenRouter

### 问题 3：填 API Key 或 OAuth

#### 如果选了 Nous Portal
```
? Nous Portal uses OAuth. Opening browser...
  [Press Enter when authenticated]
```
浏览器自动开 Nous 登录页，登录完回终端按回车。

#### 如果选了其他 (DeepSeek 等)
```
? Paste your DeepSeek API key:
  > sk-_________________________________
```
**注意**：粘贴时 key 是**隐藏的**（看不到字符），怕粘错的话先复制到记事本看一眼。

### 问题 4：选默认模型

```
? Choose default model:
  ❯ deepseek-chat (¥1/1M tokens, 64K context)
    deepseek-reasoner (¥1/¥8, reasoning, 64K)

Test this model now? [Y/n]
```

新手选**性价比最高的**那个（DeepSeek 选 `deepseek-chat`）。

按 Y 让它测试一下能不能调通。

### 问题 5：选 toolsets（工具集）

```
? Select toolsets to enable (Space to toggle):
  ❯ ✓ core         (file, shell, web - 11 tools, recommended)
    ✓ code         (code search, git, lint - 9 tools)
    ☐ data         (csv, json, pdf - 6 tools)
    ☐ browser      (Playwright web automation - 4 tools)
    ☐ media        (image, audio - 5 tools)
    ☐ deep-research (web crawl, multi-source - 7 tools)
  [done]
```

**新手推荐**：先勾 `core` + `code` 就够。`browser` / `data` 等用到时再启用（`hermes tools` 命令）。

### 问题 6：（可选）选 backend

```
? Default backend (where tasks execute):
  ❯ local         (this machine, simplest)
    docker        (isolated container)
    ssh           (remote server)
    modal         (Modal cloud, pay-per-use)
    daytona       (Daytona dev environment)
    skip          (decide later)
```

**新手选 local**。其他 backend 等熟悉了再切（[35 章](/hermes/deploy/backends)）。

### 问题 7：（可选）现在配 channel？

```
? Connect a messaging platform now?
  ❯ Skip (use CLI only for now)
    Telegram
    Discord
    Slack
    WhatsApp
    Signal
    Email
```

**新手强烈建议 Skip**，先用 CLI 跑通再接 IM。Channel 配置详见 [10-11 章](/hermes/setup/telegram)。

### 结束

```
✅ Setup complete!

Configuration saved to:
  ~/.hermes/config.yaml
  ~/.hermes/.env

Try it now:
  hermes "say hello"

Open the docs:
  https://hermes-agent.nousresearch.com/docs

Happy hacking! 🧬
```

## 9.4 跑完后看配置长啥样

`~/.hermes/config.yaml`:
```yaml
version: 0.8

llm:
  providers:
    deepseek:
      type: openai-compatible
      base_url: https://api.deepseek.com/v1
      api_key: ${DEEPSEEK_API_KEY}
      models:
        - { name: deepseek-chat, context_window: 64000 }
        - { name: deepseek-reasoner, context_window: 64000, reasoning: true }
  default: deepseek/deepseek-chat

toolsets:
  enabled:
    - core
    - code
  disabled:
    - data
    - browser
    - media
    - deep-research

backend:
  default: local

memory:
  honcho: enabled
  fts5: enabled
  user_md: ~/.hermes/user.md
  memory_md: ~/.hermes/memory.md
  auto_skill_generation:
    enabled: true
    min_tool_calls: 5
```

`~/.hermes/.env`:
```bash
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

## 9.5 重跑 setup

随时可以重跑改配置：

```bash
hermes setup
```

它会**保留现有配置**，问你"要改哪部分？"：

```
? Existing config found. What to update?
  ❯ Add new LLM provider
    Change default model
    Toggle toolsets
    Change backend
    Add messaging platform
    Reset everything
    Quit
```

### 完全重置

```bash
hermes setup --reset
```

**会备份**现有 config 到 `~/.hermes/config.yaml.bak.YYYY-MM-DD`。

## 9.6 跳过向导手写配置

如果你 yaml 熟，直接写：

```bash
# 1. 写 config.yaml（按 8 章模板）
nvim ~/.hermes/config.yaml

# 2. 写 .env
nvim ~/.hermes/.env

# 3. 验证
hermes doctor
```

`hermes doctor` 会检测 yaml 语法错 + 试调 LLM 看是否能通。

## 9.7 常见问题

### Q：向导卡在第 4 步（测试模型）超时
**原因**：网络问题或 Key 错。
**修复**：
```bash
# 跳过测试
hermes setup --skip-test
# 然后手动测
hermes "hi"
```

### Q：选了 Nous Portal 但浏览器没开
**原因**：headless 环境（如 SSH 远程）。
**修复**：
- 在有浏览器的机器上跑 OAuth 拿 token
- 复制 token 到目标机器 `.env`：`NOUS_OAUTH_TOKEN=...`
- 跑 `hermes setup --provider nous-portal --token <token>`

### Q：toolset 不知道选哪些
**修复**：先选 `core`，其他用到时启用：
```bash
hermes tools           # 进交互管理
```

### Q：跑完 setup 但 `hermes` 还报"no provider"
**原因**：可能 `.env` 没生效。
**修复**：
```bash
# 重启 shell
exec $SHELL

# 或手动 source
source ~/.bashrc
```

### Q：API Key 粘进去看起来是空的
**原因**：终端隐藏输入。不是真的空。直接回车试试。

### Q：想批量配置（脚本化）
**修复**：用 yaml 模板 + 环境变量，跳过向导：

```bash
# 写好 config.yaml + .env
hermes doctor    # 验证
hermes           # 开干
```

适合给团队批量发部署。

---

## 看完这一章你应该知道

✅ `hermes setup` 是新手 GUI，7 个问题搞定基础配置
✅ 跑完生成 `config.yaml` + `.env`
✅ 重跑可以"只改一部分"
✅ 老手可直接写 yaml 跳过向导
✅ 装完后用 `hermes doctor` 验证

---

**下一步**：[10. 接入 Telegram →](/hermes/setup/telegram)

CLI 跑通了？下章把 Hermes 接到 Telegram，手机随时聊。
