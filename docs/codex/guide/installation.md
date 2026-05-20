# 安装 Codex

> **本文你将学会：** 在 macOS、Linux、Windows 三个平台上安装并验证 Codex CLI。

## 前置条件：安装 Node.js

Codex 需要 **Node.js 18 或更高版本**。先检查你是否已经安装：

```bash
node --version
```

如果输出类似 `v20.x.x`，跳过这一节。如果报错或版本低于 18，按下方说明安装。

::: details macOS 安装 Node.js
推荐用 [nvm](https://github.com/nvm-sh/nvm)（Node 版本管理器）：

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 重启终端后安装最新 LTS 版 Node
nvm install --lts
nvm use --lts

# 验证
node --version   # 应输出 v22.x.x 或更高
```
:::

::: details Linux (Ubuntu/Debian) 安装 Node.js
```bash
# 使用 NodeSource 官方仓库
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证
node --version
npm --version
```
:::

::: details Windows 安装 Node.js
1. 前往 [nodejs.org](https://nodejs.org) 下载 **LTS 版**安装包（`.msi` 格式）
2. 双击安装，全程默认选项即可
3. 安装完成后打开 **PowerShell** 验证：
```powershell
node --version
npm --version
```

> **Windows 用户注意：** Codex 在 Windows 上推荐通过 WSL2 使用，详见 [Windows + WSL2 完整配置](/codex/advanced/windows-setup)。
:::

---

## 安装 Codex

Node.js 准备好后，一条命令全局安装 Codex：

```bash
npm install -g @openai/codex
```

::: tip 安装很慢？
国内 npm 网速较慢，可以先切换为淘宝镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install -g @openai/codex
```
:::

### 验证安装

```bash
codex --version
```

输出版本号（如 `1.x.x`）说明安装成功。

---

## 首次运行

```bash
codex
```

第一次运行会创建配置目录 `~/.codex/`，并进入一个全屏终端 UI。

::: info 配置目录说明
```
~/.codex/
├── config.toml     ← 主配置文件（模型、API Key 等）
├── instructions.md ← 全局自定义指令（可选）
└── skills/         ← 自定义技能文件（可选）
```
:::

---

## macOS 安装完整演示

```bash
# 1. 安装 nvm（如果还没有）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.zshrc   # 或 source ~/.bashrc

# 2. 安装 Node.js LTS
nvm install --lts

# 3. 安装 Codex
npm install -g @openai/codex

# 4. 验证
codex --version

# 5. 启动
codex
```

---

## Linux 安装完整演示

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g @openai/codex
codex --version
```

---

## 常见安装问题

### `npm install -g` 报权限错误（macOS/Linux）

```bash
# 方法一：加 sudo（不推荐）
sudo npm install -g @openai/codex

# 方法二（推荐）：配置 npm 全局目录到用户目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
npm install -g @openai/codex
```

### 安装后 `codex` 命令找不到

检查 npm 全局 bin 目录是否在 PATH 中：

```bash
npm bin -g       # 查看全局 bin 目录
echo $PATH       # 查看当前 PATH
```

将 npm 的 bin 目录加入 PATH：
```bash
echo 'export PATH="$(npm bin -g):$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Windows 上安装报错

Windows 原生支持有限，推荐使用 WSL2 环境。详见 [Windows + WSL2 完整配置](/codex/advanced/windows-setup)。

---

## 下一步

安装完成后：
- 👉 [快速开始](/codex/guide/quick-start) — 完成你的第一个任务
- 🔑 [认证与 API Key](/codex/guide/authentication) — 配置模型访问凭证
- 🇨🇳 [接入国内模型](/codex/china-models/overview) — 使用 DeepSeek / 通义千问等
