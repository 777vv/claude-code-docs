# 5. 装好 Python + uv

::: info 本章你将学到
- 为什么不用现成 Python 而要"再装一个"
- Windows / macOS / Linux 三系统的完整准备步骤
- Hermes 安装脚本会**自动**给你装啥（你只要管前置）
- uv 是个什么神奇东西
- 国内 PyPI 镜像配置
:::

::: tip 简单结论
**Hermes 的安装脚本会自动装 Python 3.11 + uv**，你不需要手动装。
本章主要解决两件事：
1. **Windows 用户**：装好 WSL2 + Ubuntu
2. **所有用户**：确保 `git` 命令能用
:::

## 5.1 为什么不用系统现成 Python

你的电脑可能已经有 Python（macOS 自带 / Ubuntu 自带 / 你装过 anaconda 等）。但 Hermes 会**自己装一个独立的 Python**到 `~/.local`，原因：

| 用系统 Python | 用 uv 装的独立 Python |
|---|---|
| 版本可能太老（3.8/3.9） | 保证 3.11+ |
| 装包要 `sudo`，污染系统 | 独立环境，无需 sudo |
| 和其他项目冲突 | 完全隔离 |
| 升级麻烦 | `uv` 一行升级 |

**所以**：你不用动现有的 Python。让 Hermes 安装脚本自己处理。

## 5.2 Windows 用户：先装 WSL2

::: warning Windows 原生跑 Hermes 是 early beta
强烈建议走 WSL2 + Ubuntu 路径。
:::

### 步骤 1：装 WSL2

**管理员 PowerShell** 运行：

```powershell
wsl --install -d Ubuntu
```

这条命令做三件事：
1. 启用 Windows 的 WSL 功能
2. 装 WSL2 内核
3. 装 Ubuntu Linux

装完**重启电脑**。

### 步骤 2：首次启动 Ubuntu

开始菜单搜 "Ubuntu" → 打开。

第一次启动会让你设：
- 用户名（小写英文）
- 密码

进入 Ubuntu 终端后，**所有后续命令都在 Ubuntu 终端里运行**。

### 步骤 3：更新系统 + 装 git

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential
```

### 步骤 4：验证

```bash
git --version
curl --version
```

都能输出版本就 OK，跳到 5.5。

## 5.3 macOS 用户

### 步骤 1：装 Xcode Command Line Tools

打开终端（`⌘ + 空格` → "Terminal"），跑：

```bash
xcode-select --install
```

弹窗点"安装"，等 10 分钟左右。

这一步会自带 `git` 命令。

### 步骤 2：（可选）装 Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

国内用清华镜像：

```bash
/bin/bash -c "$(curl -fsSL https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/install.sh)"
```

### 步骤 3：验证

```bash
git --version
curl --version
```

OK 就跳到 5.5。

## 5.4 Linux 用户

### Ubuntu / Debian

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential
```

### Fedora / RHEL / CentOS

```bash
sudo dnf install -y git curl gcc make
```

### Arch / Manjaro

```bash
sudo pacman -S git curl base-devel
```

验证：

```bash
git --version
curl --version
```

## 5.5 测试 uv（可选，确认环境正常）

uv 是 Hermes 安装脚本会自动装的，但你可以提前试试：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

国内可能要走代理。如果失败，跳过——Hermes 安装脚本会再装一次。

装完看：

```bash
source ~/.bashrc          # 或 ~/.zshrc
uv --version
```

应该输出类似：
```
uv 0.5.x (Astral)
```

OK。

### 国内 PyPI 镜像

uv 用的是 PyPI，国内推荐用清华镜像加速。**全局配**：

```bash
mkdir -p ~/.config/uv
cat > ~/.config/uv/uv.toml <<'EOF'
[[index]]
name = "tsinghua"
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true
EOF
```

::: tip 也可以临时用
单次命令：
```bash
uv pip install xxx --index-url https://pypi.tuna.tsinghua.edu.cn/simple
```
:::

## 5.6 Hermes 安装脚本会**自动**做这些

如果你 5.2 / 5.3 / 5.4 已经做完，下一章一行命令装 Hermes 后，**它会自动**：

1. 检测系统
2. （如果没装）装 uv
3. 用 uv 装 Python 3.11 到 `~/.local`
4. 克隆 hermes-agent 仓库到 `~/.hermes/agent/`
5. 用 uv 创建独立 venv
6. 装 hermes-agent + 所有依赖
7. 装 Node.js v22（部分工具需要）
8. 装 ripgrep、ffmpeg
9. 把 `hermes` 命令加到 PATH

你只要确保：
- `git` 能用
- `curl` 能用
- 网络通（国内用代理或国产 LLM）

## 5.7 自查清单

进下一章前确认：

```bash
# 1. git 能用
git --version
# git version 2.x.x

# 2. curl 能用
curl --version
# curl 7.x.x

# 3. 至少 5 GB 可用磁盘
df -h ~

# 4. 国内用户：测试 GitHub 是否能访问
curl -s -o /dev/null -w "%{http_code}" https://raw.githubusercontent.com
# 如果不是 200，下一章用 ghfast.top 代理

# 5. 国内用户：PyPI 镜像配好
uv pip config list 2>/dev/null || echo "uv 还没装，跳过"
```

5 项确认完，进下一章正式装 Hermes。

## 5.8 常见报错速查

### Q：Windows `wsl --install` 报 0x80370102
**原因**：BIOS 没开 CPU 虚拟化。
**修复**：重启进 BIOS，找 `VT-x` (Intel) 或 `SVM` (AMD)，enable，保存重启。

### Q：WSL2 装完打开 Ubuntu 转圈不动
**原因**：内核版本过旧。
**修复**：管理员 PowerShell 跑：
```powershell
wsl --update
wsl --shutdown
```
再重新打开 Ubuntu。

### Q：macOS 装 Homebrew 报 SSL 错
**原因**：终端用了不识别的代理。
**修复**：
```bash
unset HTTPS_PROXY HTTP_PROXY ALL_PROXY
```
再装一次。

### Q：Linux 装 build-essential 报"Unable to locate package"
**原因**：apt 源没更新。
**修复**：
```bash
sudo apt update
```

### Q：uv 装好了但 `uv: command not found`
**原因**：没 source 配置文件。
**修复**：
```bash
source ~/.bashrc       # 或 ~/.zshrc
# 或者直接关闭终端再开
```

### Q：国内 GitHub raw 完全访问不了
**修复**：用代理或国内 GitHub 镜像。下一章会教用 ghfast.top 装 Hermes。

---

## 看完这一章你应该知道

✅ git + curl 是必须先装的
✅ Windows 必须 WSL2 + Ubuntu，所有命令在 Ubuntu 终端里跑
✅ macOS 用 `xcode-select --install` 装基础工具
✅ Hermes 安装脚本会**自动**装 Python 3.11 + uv + 其他依赖
✅ 国内用户配 PyPI 清华镜像 + 准备 GitHub 代理

---

**下一步**：[6. 安装 Hermes →](/hermes/intro/install)

终于到正主——一行命令装好，然后 `hermes setup` 配模型，10 分钟跑通。
