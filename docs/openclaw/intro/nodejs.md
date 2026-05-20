# 5. 装好 Node.js

::: info 本章你将学到
- 为什么要装 Node.js（一句话解释清）
- 三大系统的零基础安装步骤（Win/Mac/Linux）
- 为什么用 nvm 而不是直接装
- 验证安装成功的标准命令
- 国内用户加速 npm 的方法
:::

## 5.1 一句话：为什么要装 Node.js

OpenClaw 是用 **Node.js 写的**——就像 Photoshop 用 C++ 写、得有 Windows/Mac 系统才能跑一样，OpenClaw 得有 Node.js 才能跑。

Node.js 装好后，你才能用它带的 `npm` 命令去装 OpenClaw（以及 OpenClaw 后续要的依赖）。

::: tip 装一次受益很多年
Node.js 是当今最流行的 JavaScript 运行时之一，装好后能跑 OpenClaw、VuePress、各种命令行工具，远不只是为了 OpenClaw。值得装。
:::

## 5.2 我应该装哪个版本？

| 版本 | 推荐度 |
|---|---|
| **Node.js 24.x**（最新 LTS） | ⭐⭐⭐⭐⭐ 强烈推荐 |
| Node.js 22.19+ | ⭐⭐⭐⭐ OpenClaw 最低要求 |
| Node.js 20.x 及以下 | ❌ 不能用 |

新装就直接装 24.x；已经装了 22.19+ 不用动。

## 5.3 为什么用 nvm 而不是直接装？

**nvm** = Node Version Manager（Node 版本管理器）。

直接装 Node.js 的问题：
- 以后想升级很麻烦
- 同时用多个项目要求不同 Node 版本时切换困难
- 装包权限经常报错

用 nvm 装的好处：
- `nvm install 24` 一行装新版本
- `nvm use 22` 一秒切到旧版本
- 装包不需要 sudo
- 后续维护爽到飞起

**所以本章统一用 nvm 装**。Windows 用 nvm-windows，Mac/Linux 用 nvm。

## 5.4 Windows 安装（WSL2 + nvm）

::: warning 必须用 WSL2
OpenClaw 不能在原生 Windows 跑，必须装 WSL2。本节先教 WSL2 安装，再在 WSL2 里装 Node.js。
:::

### 步骤 1：装 WSL2

打开 **PowerShell（管理员）**，执行：

```powershell
wsl --install -d Ubuntu
```

这一条命令做完三件事：
1. 启用 Windows 的 WSL 功能
2. 装 WSL2 内核
3. 装 Ubuntu Linux 发行版

装完**重启电脑**。

### 步骤 2：首次启动 Ubuntu

重启后，开始菜单搜 "Ubuntu" → 打开。

第一次启动会让你设：
- 用户名（小写英文，比如你的姓拼音）
- 密码（设个你记得住的）

进入 Ubuntu 终端后，先更新一下系统：

```bash
sudo apt update && sudo apt upgrade -y
```

### 步骤 3：在 Ubuntu 里装 nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

::: tip 上面一行国内可能下载失败
**国内备用**（用 gitee 镜像）：
```bash
curl -o- https://gitee.com/mirrors/nvm/raw/v0.40.1/install.sh | bash
```
:::

安装完成后，**关掉终端再重新打开**（让 nvm 生效），然后验证：

```bash
command -v nvm
# 应该输出: nvm
```

### 步骤 4：用 nvm 装 Node.js 24

```bash
nvm install 24
nvm use 24
nvm alias default 24
```

验证：
```bash
node --version
# 应该输出: v24.x.x

npm --version
# 应该输出: 10.x.x 或更高
```

✅ Windows 装好了。**以后所有 OpenClaw 命令都在 Ubuntu 终端里跑**，不在 PowerShell。

## 5.5 macOS 安装（推荐用 Homebrew + nvm）

### 步骤 1：装 Homebrew（如果还没装）

打开终端（按 `⌘ + 空格` 搜 "Terminal"），跑：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

::: tip 国内用户镜像
官方源很慢的话，用清华镜像：
```bash
/bin/bash -c "$(curl -fsSL https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/install.sh)"
```
:::

安装完成后按它提示加 PATH（通常是 `eval "$(/opt/homebrew/bin/brew shellenv)"` 写进 `~/.zshrc`）。

### 步骤 2：用 Homebrew 装 nvm

```bash
brew install nvm
```

按它输出的说明配置 shell（典型的，把以下加到 `~/.zshrc`）：

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$(brew --prefix nvm)/nvm.sh" ] && \. "$(brew --prefix nvm)/nvm.sh"
[ -s "$(brew --prefix nvm)/etc/bash_completion.d/nvm" ] && \. "$(brew --prefix nvm)/etc/bash_completion.d/nvm"
```

执行 `source ~/.zshrc` 让它生效。

### 步骤 3：装 Node.js 24

```bash
nvm install 24
nvm use 24
nvm alias default 24
```

### 步骤 4：验证

```bash
node --version    # v24.x.x
npm --version     # 10.x.x+
```

✅ macOS 装好了。

## 5.6 Linux 安装（Ubuntu/Debian/Fedora 通用）

### 步骤 1：装 nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

国内：

```bash
curl -o- https://gitee.com/mirrors/nvm/raw/v0.40.1/install.sh | bash
```

### 步骤 2：让 nvm 生效

```bash
source ~/.bashrc       # 如果你用 bash
# 或
source ~/.zshrc        # 如果你用 zsh
```

或者关掉终端重开。

### 步骤 3：装 Node.js 24

```bash
nvm install 24
nvm use 24
nvm alias default 24
```

### 步骤 4：验证

```bash
node --version    # v24.x.x
npm --version     # 10.x.x+
```

✅ Linux 装好了。

## 5.7 国内 npm 加速

国内访问 npm 官方仓库（registry.npmjs.org）速度感人。**建议换淘宝镜像**：

```bash
npm config set registry https://registry.npmmirror.com
```

验证：
```bash
npm config get registry
# 输出: https://registry.npmmirror.com
```

以后 `npm install` 都会从国内镜像走，速度起飞。

::: tip 想切回官方源
```bash
npm config set registry https://registry.npmjs.org
```
:::

## 5.8 装包速度还不够快？用 pnpm

OpenClaw 官方支持三种包管理器：**npm**（自带）、**pnpm**、**bun**。

如果你嫌 npm 慢，可以装 pnpm（速度快 2-3 倍，省磁盘）：

```bash
npm install -g pnpm
```

以后装 OpenClaw 用：
```bash
pnpm install -g openclaw@latest    # 代替 npm install
```

::: tip 新手不必折腾
新手用 npm 就行，能跑就别瞎换。等用熟了再考虑 pnpm/bun。
:::

## 5.9 常见报错速查

### Q：`nvm: command not found`
A：nvm 没装好或没 source 配置文件。
```bash
# Mac/Linux
source ~/.zshrc   # 或 ~/.bashrc

# 或关掉终端重开
```

### Q：装 Node 时报 `Permission denied`
A：你之前用 `sudo npm install` 装过东西污染了权限。
最干净的修复方法：
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Q：Windows 下 `wsl --install` 报错 "0x80370102"
A：BIOS 里没开 CPU 虚拟化。重启进 BIOS，找 `VT-x` (Intel) 或 `SVM` (AMD)，开启。

### Q：装完 nvm，但 `node` 命令找不到
A：可能没运行 `nvm use 24`，或者 default 没设。再来一次：
```bash
nvm use 24
nvm alias default 24
```

### Q：npm install 卡住不动 / 超慢
A：换淘宝镜像（见 5.7 节）。

## 5.10 自查清单

确认以下四条**全部**通过，才能进下一章：

```bash
# 1. Node.js 版本 >= 22.19
node --version

# 2. npm 能用
npm --version

# 3. 全局装包目录有写权限（试装一个无关包）
npm install -g cowsay
cowsay hello
# 能看到一头牛说 hello 就 OK

# 4. （国内用户）npm 镜像已换
npm config get registry
# 应该是淘宝镜像
```

如果四条都过，恭喜，可以装 OpenClaw 了。

---

## 看完这一章你应该知道

✅ 为什么要装 Node.js（OpenClaw 的运行环境）
✅ Node.js 22.19+ 是最低要求，推荐 24.x
✅ Win/Mac/Linux 都用 nvm 装，省事
✅ 国内必换淘宝镜像
✅ 自查清单 4 条全过 = 准备好了

---

**下一步**：[6. 安装 OpenClaw →](/openclaw/intro/install)

终于到正主了——一条 npm 命令装好，然后跟着 onboard 向导走完配置。
