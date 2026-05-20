# Windows + WSL2 完整配置

> **本文你将学会：** 在 Windows 10/11 上通过 WSL2 安装并使用 Codex CLI 的完整步骤。

## 为什么需要 WSL2？

Codex 在 Windows 上运行时，推荐使用 WSL2（Windows Subsystem for Linux）：

- Shell 脚本执行需要 Linux/bash 环境
- 部分 npm 包在 Windows 原生环境有兼容问题
- WSL2 性能接近原生 Linux

::: info Windows 原生也支持
Codex 从 `gpt-5.2-codex` 版本起开始支持 Windows PowerShell 原生环境，如果不想用 WSL2，可以直接在 PowerShell 中运行，但功能略受限。
:::

---

## 第一步：安装 WSL2

打开 **PowerShell（以管理员身份运行）**，执行：

```powershell
# 安装 WSL2 并默认安装 Ubuntu
wsl --install

# 安装完成后重启电脑
```

重启后，Ubuntu 会自动启动并要求你设置用户名和密码。

::: tip 验证 WSL2 版本
```powershell
wsl --list --verbose
# 确认 VERSION 列显示 2
```
:::

---

## 第二步：在 WSL2 中安装 Node.js

打开 Ubuntu 终端（在开始菜单搜索 "Ubuntu"），执行：

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc

# 安装 Node.js LTS
nvm install --lts

# 验证
node --version   # 应显示 v22.x.x 或更高
npm --version
```

---

## 第三步：安装 Codex

```bash
npm install -g @openai/codex
codex --version
```

---

## 第四步：配置国内模型（可选）

```bash
mkdir -p ~/.codex
nano ~/.codex/config.toml
```

以 DeepSeek 为例：

```toml
[model_providers.deepseek]
name = "deepseek"
api_key = "sk-你的API Key"
base_url = "https://api.deepseek.com/v1"

[model]
provider = "deepseek"
name = "deepseek-chat"
```

---

## 第五步：在 Windows 项目目录中使用 Codex

WSL2 可以访问 Windows 的文件系统，路径格式为 `/mnt/c/...`：

```bash
# 进入 Windows 上的项目目录
cd /mnt/c/Users/你的用户名/Desktop/my-project

# 启动 Codex
codex
```

---

## 推荐：使用 VS Code + WSL 插件

VS Code 支持直接在 WSL 环境中开发，体验最佳：

1. 安装 [VS Code](https://code.visualstudio.com/)
2. 在 VS Code 中安装 **WSL 扩展**（`ms-vscode-remote.remote-wsl`）
3. 在 Ubuntu 终端中进入项目目录，运行 `code .` 即可用 VS Code 打开
4. 在 VS Code 的集成终端中运行 `codex`

---

## 常见问题

### WSL2 安装失败（需要开启虚拟化）

在 BIOS 中开启 CPU 虚拟化（Intel VT-x 或 AMD-V）：
1. 重启电脑，开机时按 F2/Del 进入 BIOS
2. 找到 "Virtualization Technology" 或 "SVM Mode"
3. 设置为 Enabled

### 网络问题（WSL2 无法访问外网）

```bash
# 在 WSL2 中检查 DNS
cat /etc/resolv.conf

# 如果 DNS 有问题，手动设置
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

### Windows Terminal 推荐

安装 [Windows Terminal](https://apps.microsoft.com/detail/9n0dx20hk701)（微软官方出品），体验比默认的 CMD 好很多：
- 支持多标签
- 支持 WSL2、PowerShell、CMD 在同一窗口切换
- 字体渲染更好，Codex 的 TUI 界面显示更完整

### PowerShell 原生使用（不用 WSL2）

如果你的系统中没有 WSL2，可以在 PowerShell 中直接安装使用：

```powershell
# 安装 Node.js（从 nodejs.org 下载安装包后）
npm install -g @openai/codex
codex --version
codex
```

注意：PowerShell 原生模式下，某些 Shell 命令可能不支持（如 `grep`、`find`），建议搭配 [Git Bash](https://git-scm.com/downloads) 使用。
