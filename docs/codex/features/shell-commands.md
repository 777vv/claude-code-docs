# Shell 命令执行

> **本文你将学会：** Codex 如何在终端执行命令、输出如何反馈给 AI、以及安全注意事项。

## 概述

Codex 不只能改代码，还能直接执行 Shell 命令。这让它可以：

- 运行测试并根据结果修复代码
- 安装依赖包
- 编译、构建项目
- 执行数据处理脚本
- 操作 git

---

## 命令执行示例

### 运行并修复测试

```
运行 npm test，如果有失败的测试，帮我修复代码直到全部通过
```

Codex 会：
1. 执行 `npm test`
2. 读取错误输出
3. 定位到失败的代码
4. 修改代码
5. 再次运行测试验证

### 安装和配置依赖

```
安装 axios 和 lodash，并在 src/api.js 中用 axios 替换现有的 fetch 调用
```

### 批量文件操作

```
找出 src 目录下所有超过 200 行的 .js 文件，列出文件名和行数
```

---

## 命令安全机制

Codex 在执行命令前会展示将要执行的命令内容：

```
即将执行：npm install axios --save
确认执行？[Y/n]
```

在 **Auto 模式**下，以下类型的命令会**自动执行**（无需确认）：
- `npm install` / `pip install`（包管理）
- `npm test` / `pytest`（测试运行）
- `git add / commit`（git 操作）
- 读取文件内容的命令（`cat`、`ls` 等）

以下类型的命令**始终需要确认**：
- 删除文件 / 目录（`rm -rf`）
- 网络请求（`curl`、`wget`）
- 修改系统配置
- 涉及 `sudo` 的命令

---

## 命令执行的工作目录

Codex 命令始终在你**启动 Codex 时所在的目录**执行：

```bash
cd ~/my-project
codex
# Codex 执行的所有命令工作目录 = ~/my-project
```

::: warning
Codex 不会因为你的指令中提到某个子目录就自动 `cd` 进去。如果需要在子目录执行，可以明确说明：
```
在 packages/api 目录下运行 npm install
```
:::

---

## 查看命令历史

所有 Codex 执行过的命令都会显示在会话 UI 中。你也可以通过 shell history 查看：

```bash
history | grep -E "npm|git|python"
```

---

## 实用场景示例

### CI/CD 验证

```
运行以下检查，如果有问题请修复：
1. npm run lint
2. npm run typecheck
3. npm test
确保三个命令全部通过
```

### 项目初始化

```
帮我用 create-react-app 创建一个新的 TypeScript 项目，
项目名叫 my-dashboard，
然后安装 react-query 和 tailwindcss，
并完成 tailwindcss 的初始配置
```

### 数据处理

```
在当前目录有一个 data.csv 文件，
帮我写一个 Python 脚本统计每列的缺失值数量并输出报告
然后运行这个脚本
```
