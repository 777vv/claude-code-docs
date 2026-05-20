# 快速开始

> **本文你将学会：** 配置好 API Key 后，5 分钟内完成你的第一个 Codex 任务。

::: tip 前提条件
- 已安装 Codex（参考 [安装指南](/codex/guide/installation)）
- 已有可用的 API Key（OpenAI 或 [国内模型](/codex/china-models/overview) 均可）
:::

---

## 第一步：配置 API Key

在启动 Codex 之前，先设置好访问凭证。最简单的方式是设置环境变量：

```bash
# 临时设置（当前终端会话有效）
export OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxx"

# 永久设置（推荐，写入 shell 配置文件）
echo 'export OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxx"' >> ~/.zshrc
source ~/.zshrc
```

::: warning 国内用户
如果你使用 DeepSeek / 通义千问 / Kimi 等国内模型，配置方式略有不同，请先看 [国内模型对接总览](/codex/china-models/overview)，再回来继续本教程。
:::

---

## 第二步：创建一个练习项目

用一个空目录来练习，避免误操作正式项目：

```bash
mkdir codex-demo && cd codex-demo
git init   # 重要！Codex 依赖 git 跟踪文件改动
```

::: danger 务必在 git 仓库中使用
Codex 通过 git 记录所有改动，这样你随时可以用 `git diff` 查看变化，用 `git checkout .` 回滚。**没有 git 初始化的目录中操作存在风险。**
:::

---

## 第三步：启动 Codex

```bash
codex
```

成功启动后，你会看到一个全屏终端 UI，底部是输入框，顶部是对话区域。

---

## 第四步：完成你的第一个任务

在输入框中输入以下内容，然后按回车：

```
创建一个 Python 脚本，读取当前目录下所有 .txt 文件，统计每个文件的行数并打印出来
```

你会看到 Codex：
1. 思考任务需求
2. 创建 `count_lines.py` 文件
3. 写入代码
4. （可能）运行脚本验证

当 Codex 要执行某个操作时，会显示确认提示——默认的 **Auto 模式**会在当前目录内自动执行，但涉及外部网络或其他目录时会询问你。

---

## 常用操作快捷键

| 按键 | 功能 |
|------|------|
| `Enter` | 发送消息 |
| `Shift + Enter` | 换行（不发送） |
| `Ctrl + C` | 中断当前操作 |
| `Ctrl + D` 或 输入 `exit` | 退出 Codex |
| `↑ / ↓` | 翻看历史消息 |
| `Esc` | 取消当前输入 |

---

## 查看和回滚改动

Codex 每次改文件前都会进行 git 提交，所以你可以随时：

```bash
# 查看 Codex 做了哪些改动
git log --oneline
git diff HEAD~1

# 回滚到操作前
git checkout HEAD~1 -- .

# 或者回滚到最初状态
git reset --hard HEAD~3  # 回退 3 次操作
```

---

## 在已有项目中使用

进入你的项目目录，直接启动 Codex：

```bash
cd ~/my-project
codex
```

建议在第一次使用时告诉 Codex 项目背景，这样它能更准确地理解你的需求：

```
这是一个 React + TypeScript 项目，使用 Tailwind CSS，后端是 Express。
帮我在 src/components 目录下创建一个 LoadingSpinner 组件。
```

---

## 实用提示词示例

以下是一些好用的提示词模板：

```bash
# 解释代码
解释 src/utils/auth.ts 这个文件的作用和主要函数

# 修复 Bug
运行 npm test，如果有测试失败，帮我修复

# 添加功能
给 UserCard 组件添加一个 onClick 属性，点击后触发 onSelect 回调

# 代码审查
帮我审查最近一次 git commit 的代码，列出潜在问题

# 重构
把 utils/helpers.js 里的所有函数改成 TypeScript 并加上类型注解
```

---

## 下一步

掌握了基本用法后，进一步探索：

- 🔐 [Agent 权限模式](/codex/features/agent-modes) — 了解 Auto/只读/完全三种模式的区别
- 📝 [AGENTS.md 自定义指令](/codex/advanced/agents-md) — 为项目配置专属 AI 行为
- 🇨🇳 [国内模型对接](/codex/china-models/overview) — 切换为国内模型降低使用成本
