# 13. 终端 UI 玩法

::: info 本章你将学到
- Hermes 交互式 TUI 的所有功能
- 斜杠命令（/help / /clear / /undo 等）全清单
- 多行编辑、历史记录、流式输出技巧
- Tab 补全 + Ctrl 快捷键
- 把 TUI 当成"专业开发工具"用的进阶玩法
:::

::: tip Hermes 的 TUI 是它的杀手特性之一
跟一般 CLI 不一样——它是个完整的**终端 IDE 风格界面**。多行编辑、流式、命令补全、文件拖拽全有。
:::

## 13.1 启动 TUI

```bash
hermes
```

界面：
```
╭──────────────────────────────────────────────────╮
│ Hermes Agent · v0.8.3                            │
│ Model: deepseek/deepseek-chat                    │
│ Backend: local · Cost today: ¥0.45                │
├──────────────────────────────────────────────────┤
│                                                  │
│ Last session: 帮我整理...                        │
│ (10 turns, 2h ago)                               │
│                                                  │
│ Type your message or '/' for commands           │
│                                                  │
├──────────────────────────────────────────────────┤
│ > _                                              │
╰──────────────────────────────────────────────────╯
```

## 13.2 斜杠命令

输入 `/` 触发命令菜单。常用：

| 命令 | 作用 |
|---|---|
| `/help` | 帮助 |
| `/clear` | 清当前对话历史 |
| `/save` | 把当前对话存成 markdown |
| `/undo` | 撤销上一轮（拒绝那次的工具调用结果） |
| `/redo` | 反悔撤销 |
| `/model` | 切换 LLM |
| `/backend` | 切换执行后端 |
| `/agent` | 切换 agent |
| `/cost` | 看本次会话花费 |
| `/tools` | 看 / 切工具集 |
| `/memory` | 看当前记忆 |
| `/search <query>` | 搜历史会话（FTS5） |
| `/load <session>` | 载入历史会话继续 |
| `/skills` | 看可用 skill |
| `/setup` | 进 setup 向导（不离开 TUI） |
| `/export` | 导出当前会话 |
| `/screenshot` | 截当前终端 |
| `/exit` 或 `Ctrl+D` | 退出 |

输入 `/` 会自动补全。Tab 切换候选。

## 13.3 多行输入

短消息一行回车就发。

**长消息（含代码）多行编辑**：
- `Shift + Enter`：换行不发送
- `Ctrl + J`：另一种换行
- `\` 行尾 + Enter：转义换行

或进入"多行模式"：
```
> /multiline
[Multi-line mode. End with Ctrl+D or /send]
请帮我重构以下代码：

def f(x):
    if x > 0:
        return ...

要求：1) 性能优化 2) 加类型注解 3) 写单测
^D
```

## 13.4 历史与导航

| 键 | 作用 |
|---|---|
| ↑ / ↓ | 翻历史输入（像 bash 一样） |
| Ctrl + R | 反向搜历史 |
| Ctrl + L | 清屏（不丢历史） |
| Ctrl + A / E | 行首 / 行尾 |
| Ctrl + W | 删一个词 |
| Ctrl + U | 删整行 |
| Alt + B / F | 按词跳前 / 后 |

熟悉 bash / readline 的用户瞬间上手。

## 13.5 文件操作

### 文件路径自动补全

输入 `~/Doc` 按 Tab → 补全成 `~/Documents/`。继续 Tab 列出文件。

### 拖拽文件到终端

macOS / Linux：把文件拖进终端窗口，路径自动粘贴到输入行。
也能拖文件夹。

### 引用文件内容

`@filename` 语法引用文件：
```
> 帮我 review @src/auth/login.ts 这个文件
```

Hermes 自动读 login.ts 加进上下文，不用你复制粘贴。

也能多个：
```
> 对比 @file1.py 和 @file2.py 的设计差异
```

也能引用文件夹：
```
> @src/ 这个目录的整体架构是怎样的？
```

Hermes 自动列文件 + 抽样阅读关键文件。

## 13.6 流式输出

Hermes 默认**流式**——LLM 边生成你边看到。

控制：
- `Ctrl + C`：**打断** LLM（不影响 session）
- `Ctrl + C` 两次：彻底退出 TUI

打断后会问："要重新生成 / 改提问 / 继续？"

::: tip 善用打断
LLM 走偏了？早点 Ctrl+C 重提问，省 token。
:::

## 13.7 工具调用可视化

LLM 调工具时 TUI 实时展示：

```
> 帮我看下 ai-learning-docs 这周的提交

🛠️ Tool call: shell_exec
   $ cd ~/projects/ai-learning-docs && git log --oneline --since="7 days ago"

   abc1234 feat: add hermes intro chapter
   def5678 fix: align homepage tool grid
   ...

[Tool output: 23 lines, click to expand]

🛠️ Tool call: web_search
   query: "vitepress sidebar config"

[3 results]

→ 本周 ai-learning-docs 提交了 23 次 commit，主要分布在：
  - Hermes 章节开发（12 次）
  - 首页对齐修复（5 次）
  ...
```

每个 tool call 是**可折叠 / 可展开**的块。

## 13.8 历史会话搜索

```
> /search 上周怎么解决的 redis 性能问题
```

或：
```
> /search redis --since 7d --top 5
```

Hermes 用 FTS5 全文索引返回相关历史会话。点回车载入续聊。

## 13.9 终端 themes

```yaml
# ~/.hermes/config.yaml
ui:
  theme: nord                # 主题: nord / dracula / solarized / monokai
  show_costs: true
  show_tool_calls: detailed  # detailed / collapsed / hidden
  font_ligatures: true       # 连字（FiraCode 等字体支持）
```

实时切换：
```
> /theme dracula
```

## 13.10 进阶：把 TUI 当 IDE 用

### Tmux 多面板

```bash
tmux new -s hermes

# 左面板：跑 hermes
hermes

# Ctrl+B "  分屏
# 右下面板：跑 hermes gateway
hermes gateway --verbose

# Ctrl+B %  纵向分屏
# 右上面板：跑代码 / 编辑
vim
```

效果：一个 tmux 窗口 = Hermes 对话 + Gateway 实时日志 + 代码编辑器，全键盘操作。

### Vim 集成

把 TUI 命令绑定到 vim 快捷键：
```vim
" ~/.vimrc
nnoremap <leader>h :!hermes "<C-R>=expand('%')<CR>"<CR>
```

在 vim 里按 `\h` 触发 Hermes 处理当前文件。

### 终端通知

```yaml
ui:
  notifications:
    enabled: true
    on_complete: true              # 任务完成响一声
    on_long_task: true             # 长任务（>30s）通知
    sound: glass                   # macOS sound effect
```

跑长任务时去喝咖啡，回来听见叮一声。

## 13.11 常见报错

### Q：TUI 显示乱码 / 中文方块
**修复**：
- 终端字体支持 CJK（推荐 JetBrains Mono / Cascadia Code Nerd / Hack）
- locale 设 UTF-8：`export LC_ALL=en_US.UTF-8`

### Q：颜色不对 / 看不清
**修复**：
```bash
hermes --no-color
# 或换 theme
> /theme solarized-light
```

### Q：Ctrl+C 退出整个 TUI 了，不是打断
**原因**：在等输入时按 Ctrl+C 默认退出。
**修复**：流式输出中按是打断，其他时候用 `/clear` 或 `/exit`。

### Q：流式很慢一字一字蹦
**原因**：终端 emulator 渲染慢。
**修复**：
- 换更快的终端（Alacritty / WezTerm / iTerm2）
- 关连字 / 主题
- 检查不是 SSH 慢

### Q：粘贴大段代码乱套
**修复**：开 bracketed paste：
```yaml
ui:
  bracketed_paste: true
```
现代终端默认开。

---

## 看完这一章你应该知道

✅ `/` 触发命令菜单，记 `/help /clear /save /undo` 等
✅ `@filename` 引用文件，省去复制粘贴
✅ Shift+Enter 多行输入
✅ Ctrl+C 打断 LLM 不丢 session
✅ `/search` 搜历史会话
✅ Tmux + Vim 组合让 TUI 变 IDE 体验

---

**下一步**：[14. hermes doctor 与排查 →](/hermes/ops/doctor)

会用就行了，下一章学怎么"出问题"时快速定位。
