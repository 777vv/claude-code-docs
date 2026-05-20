# 6. 安装 Hermes

::: info 本章你将学到
- 一行命令装 Hermes
- 国内加速安装方法
- 装完后用 `hermes doctor` 验证环境
- 第一次启动 `hermes` 长什么样
- 升级 / 重装 / 卸载方法
- 常见报错速查
:::

::: tip 本章预计 10 分钟
前置：你已按 [第 5 章](/hermes/intro/python-uv) 装好 git + curl，Windows 用户已经在 WSL2 Ubuntu 里。
:::

## 6.1 一行命令装好

打开终端（Windows 用户进 WSL2 Ubuntu 终端），运行：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

::: warning 不要加 sudo
```bash
# ❌ 错的
sudo curl ... | sudo bash

# ✅ 对的
curl ... | bash
```
Hermes 装在你的 home 目录（`~/.hermes`），加了 sudo 反而出权限问题。
:::

### 国内加速版（用 ghfast.top 代理）

如果上面命令卡 / 失败：

```bash
curl -fsSL https://ghfast.top/https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### 它会做什么（看输出）

```
[1/8] Detecting system... macOS arm64
[2/8] Installing uv... ✓
[3/8] Installing Python 3.11... ✓
[4/8] Cloning hermes-agent... ✓
[5/8] Setting up virtual environment... ✓
[6/8] Installing hermes-agent[cron,cli,pty,mcp]... ✓
[7/8] Installing Node.js v22... ✓
[8/8] Installing ripgrep, ffmpeg... ✓

✓ Hermes installed successfully!

Run 'source ~/.bashrc' (or ~/.zshrc) then 'hermes' to start.
```

整个过程 **5-10 分钟**（看网速）。

## 6.2 让 hermes 命令生效

```bash
source ~/.bashrc        # 如果你用 bash
# 或
source ~/.zshrc         # 如果你用 zsh
```

或者**关掉终端再重新打开**。

### 验证装好

```bash
hermes --version
```

应该输出：
```
hermes-agent 0.8.x
```

如果提示 `command not found`，看 6.7 节排错。

## 6.3 跑 hermes doctor 体检

正式用之前先**自检环境**：

```bash
hermes doctor
```

输出类似：
```
🔍 Hermes Doctor

Environment
  ✓ OS: macOS 14.5 (arm64)
  ✓ Python: 3.11.7
  ✓ uv: 0.5.2
  ✓ Node.js: v22.1.0
  ✓ Git: 2.43.0
  ✓ ripgrep: 14.1.0
  ✓ ffmpeg: 6.1

Hermes
  ✓ Version: 0.8.3
  ✓ Workspace: ~/.hermes
  ✓ Config: ~/.hermes/config.yaml

LLM Providers
  ⚠ Nous Portal: not configured
  ⚠ OpenRouter: not configured
  ⚠ OpenAI: not configured
  → Run 'hermes setup' to configure

Memory
  ✓ SQLite FTS5: ready
  ✓ Honcho: ready (not yet trained)

Backends
  ✓ local: ready
  ✗ docker: docker not installed (optional)
  ✗ ssh: no remote configured (optional)

3 warnings: configure at least one LLM provider to start.
```

::: tip 经验之谈
**以后遇到任何问题，第一反应不要去搜论坛，先跑 `hermes doctor`**，80% 的问题它能直接告诉你答案。
:::

## 6.4 第一次启动

```bash
hermes
```

### 第一次会问你

```
👋 Welcome to Hermes Agent!

It looks like you haven't configured an LLM provider yet.
Would you like to run setup now?

[Y/n]
```

按 `Y`，进入 setup 向导。详细向导走读见 [9 章](/hermes/setup/hermes-setup)。

如果你**先想跳过 setup 看看界面**：

```bash
hermes --no-setup
```

会进 CLI 界面但不能跑（缺 LLM）。

### CLI 界面长这样

```
╭─────────────────────────────────────────────╮
│  Hermes Agent · v0.8.3 · provider: not set   │
│  Workspace: ~/.hermes                         │
├─────────────────────────────────────────────┤
│                                              │
│  Hi! Configure an LLM first with /setup     │
│                                              │
├─────────────────────────────────────────────┤
│ > _                                          │
╰─────────────────────────────────────────────╯

Type '/' for commands, Ctrl+D to exit
```

退出：`Ctrl+D` 或输入 `/exit`。

## 6.5 升级 Hermes

由于 Hermes 演进快（每周一版）：

```bash
hermes update
```

会拉最新 git + 重装。3-5 分钟。

::: warning 大版本不一定兼容
v0.7 → v0.8 这种小版本一般兼容。但 v0.x → v1.0 升级前看 release notes。
:::

## 6.6 卸载 Hermes

```bash
# 1. 备份 workspace（如果你想保留 skills / memory）
tar -czf hermes-bak-$(date +%F).tar.gz ~/.hermes

# 2. 卸载
~/.hermes/agent/scripts/uninstall.sh

# 3. 或手动删除
rm -rf ~/.hermes
rm -rf ~/.local/share/hermes        # FTS5 索引
```

PATH 里 `hermes` 命令的引用也会自动删（如果你用安装脚本装的）。

## 6.7 常见报错速查

### Q：`curl: (35) SSL_ERROR_SYSCALL`
**原因**：网络断 / 代理冲突 / 证书过期。
**修复**：
```bash
# 检查能不能访问 GitHub
curl -I https://raw.githubusercontent.com
# 如果不行，用国内代理版（6.1 节）
```

### Q：装完 `hermes: command not found`
**原因**：PATH 没生效。
**修复**：
```bash
source ~/.bashrc        # 或 ~/.zshrc
# 还不行：
echo 'export PATH="$HOME/.hermes/agent/venv/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Q：`pip install hermes-agent` 报 ERROR: Could not find a version
**原因**：没用安装脚本，直接 pip 装。Hermes **不在 PyPI**，必须用安装脚本（或 git clone）。

### Q：装到一半报 "ripgrep installation failed"
**原因**：apt / brew 网络问题。
**修复**：手动装 ripgrep 再重新跑安装：
```bash
# macOS
brew install ripgrep
# Linux
sudo apt install ripgrep
# 然后重跑 hermes 安装脚本
```

### Q：WSL2 里装好了，但 Windows 浏览器打不开 Web UI
**原因**：WSL 端口转发问题。
**修复**：
```bash
# WSL2 里看 IP
ip addr show eth0 | grep inet
# 用这个 IP 而不是 localhost 访问
```
**或者**重启 WSL2：
```powershell
# PowerShell 管理员
wsl --shutdown
```

### Q：`hermes doctor` 报 "Python 3.11 not found"
**原因**：uv 装 Python 失败。
**修复**：
```bash
uv python install 3.11
# 重跑
hermes doctor
```

### Q：装完磁盘满了
**原因**：`~/.hermes` + venv + Python + Node.js + 工具加起来约 1.5 GB。
**修复**：腾出 5 GB 以上空间再装。

### Q：装在公司电脑 / 受限环境，缺很多权限
**修复**：用 Docker 部署（[36 章](/hermes/deploy/docker)）。Docker 内一切隔离，不需要本机额外权限。

## 6.8 这章结束你应该有什么

```
~/.hermes/
├── agent/              # Hermes 源码（git clone 来的）
│   ├── venv/           # uv 建的 Python 虚拟环境
│   └── scripts/
├── config.yaml         # （还没配，下章配）
├── skills/             # 空（用着用着会自动产生）
├── memory.md           # 空
└── user.md             # 空
```

`hermes` 命令在 PATH。`hermes doctor` 所有 ✓ 除了 LLM provider。

下一章配 LLM。

---

## 看完这一章你应该知道

✅ 一行 curl 装 Hermes，国内用 ghfast.top 代理
✅ 不要加 sudo
✅ 安装脚本自动装 8 件依赖
✅ `hermes doctor` 是后续排错神器
✅ 第一次跑 `hermes` 会自动引导 setup
✅ 升级一行 `hermes update`，卸载脚本自带

---

**下一步**：[7. 申请你的第一个 LLM API Key →](/hermes/setup/api-key)

Hermes 装好了但没"大脑"——下章教你 5 分钟搞到一个能用的 API Key。
