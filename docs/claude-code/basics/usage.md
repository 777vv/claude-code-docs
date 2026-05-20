# 6. 基础使用

::: info 本章你将学到
- Claude Code 的 3 种运行模式
- 管道输入和 Unix 协作方式
- 会话续接和恢复
- @引用文件、粘贴图片等输入技巧
:::

## 6.1 三种运行模式

| 命令 | 模式 | 适用场景 |
|------|------|---------|
| `claude` | **交互式** | 日常开发，持续对话 |
| `claude "任务描述"` | **交互 + 初始提示** | 带着具体任务启动 |
| `claude -p "查询"` | **非交互（print）** | 脚本、CI/CD、管道处理 |

### 交互式模式

```bash
claude                      # 启动空会话
claude "帮我理解这个项目"    # 带初始提示启动
```

### 非交互模式（`-p`）

`-p` 即 `--print`，执行一次查询后立即退出，适合自动化场景：

```bash
# 单次查询
claude -p "这个项目用了哪些依赖？"

# 结合 --output-format 输出结构化数据
claude -p "列出所有 API 端点" --output-format json

# 流式输出（适合实时处理大量输出）
claude -p "分析这段日志" --output-format stream-json
```

## 6.2 管道输入

Claude Code 遵循 Unix 哲学，能和其他命令组合使用：

```bash
# 分析日志文件
tail -200 app.log | claude -p "这里有异常吗？"

# 审查代码改动
git diff main | claude -p "这些改动有安全问题吗？"

# 读取文件内容
cat error.log | claude -p "解释这个错误原因"

# 配合 jq 处理 JSON
curl -s https://api.example.com/data | claude -p "总结这个 API 响应"

# 分析 git 历史
git log --oneline -50 | claude -p "最近做了哪些主要改动？"
```

## 6.3 会话续接与恢复

每次运行 `claude` 默认都是全新的会话（不记得之前的内容）。用以下方式续接：

```bash
# 继续当前目录最近的对话（最常用）
claude -c

# 交互式选择要恢复的会话（会显示列表）
claude -r

# 按会话名称恢复
claude -r "auth-refactor"

# 启动时给会话起名（以后可以按名称恢复）
claude -n "user-auth-feature"
```

::: tip 养成起名习惯
给重要会话起有意义的名字（`claude -n "任务名"`），以后可以精确恢复，不用在列表里找。
:::

## 6.4 输入技巧

### @引用文件

在提示里输入 `@` 可以引用特定文件，Claude 会自动读取它：

```
@src/auth/login.ts 这个函数里的 token 刷新逻辑有问题吗？
把 @package.json 里的所有依赖升级到最新版本
对比 @src/old-api.ts 和 @src/new-api.ts 的差异
```

### 粘贴图片

截图后直接在终端 <kbd>Ctrl+V</kbd> / <kbd>Cmd+V</kbd> 粘贴，Claude 能理解图片内容：

```
[粘贴设计稿截图] 帮我用 CSS 实现这个布局
[粘贴错误截图] 这个报错是什么原因？
[粘贴 UI 截图] 和这个设计对比，我的实现有什么差异？
```

### 拖入文件

从文件管理器把文件拖入终端，会自动填入完整路径。

### 贴 URL

```
阅读 https://docs.example.com/api 里的文档，然后帮我写对应的 SDK
```

::: warning URL 需要加入允许列表
Claude 默认不会主动访问 URL。你需要在 `/permissions` 里允许，或者 Claude 会在第一次访问时询问你。
:::

### 运行 Shell 命令

在提示里用 `!` 前缀可以运行一条 shell 命令，结果会插入对话：

```
! git status
! npm test 2>&1 | head -50
```

## 6.5 实用工作模式

### 快速提问不污染上下文

```
/btw 顺便问一下，ES2022 的 await 在 top-level 怎么用？
```

`/btw` 的回答不会进入对话历史，不消耗上下文。

### 在计划模式下只读探索

```bash
# 启动时直接进入只读模式（不能修改任何东西）
claude --permission-mode plan
```

非常适合在动手前先彻底理解代码库。

### 带额外目录访问权限

```bash
# 给 Claude 额外访问 ~/shared-libs 的权限
claude --add-dir ~/shared-libs

# 在会话中动态添加
/add-dir ../shared-config
```

---

下一步：[CLI 命令与参数完整参考](/basics/cli)
