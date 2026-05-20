# 9. 键盘快捷键

::: info 本章你将学到
- 交互式会话中的所有快捷键
- 最高频使用的快捷键组合
- 如何自定义快捷键
:::

在交互式会话中按 `?` 可查看所有快捷键。

## 9.1 核心快捷键

| 快捷键 | 功能 | 使用场景 |
|--------|------|---------|
| <kbd>Esc</kbd> | 中断 Claude 当前动作 | Claude 走错方向时立即叫停，上下文保留 |
| <kbd>Esc</kbd> <kbd>Esc</kbd> | 打开 rewind 菜单 | 回到任意之前的检查点 |
| <kbd>Ctrl</kbd>+<kbd>D</kbd> | 退出 CLI | 结束会话 |
| <kbd>Ctrl</kbd>+<kbd>C</kbd> | 取消当前输入 | 清空正在输入的内容 |
| <kbd>Shift</kbd>+<kbd>Tab</kbd> | 循环切换权限模式 | 在 default → plan → acceptEdits → auto 间切换 |

::: tip Esc 和 Esc+Esc 的区别
- **单次 Esc**：打断正在执行的操作，保留上下文，可以立即重新提问或纠正方向
- **双击 Esc**：弹出时间线菜单，选择一个检查点回滚，所有该点之后的改动都会撤销
:::

## 9.2 输入编辑快捷键

| 快捷键 | 功能 |
|--------|------|
| <kbd>↑</kbd> / <kbd>↓</kbd> | 浏览命令历史 |
| <kbd>Tab</kbd> | 命令和文件路径自动补全 |
| <kbd>Shift</kbd>+<kbd>Enter</kbd> | 多行输入（换行不提交）|
| <kbd>Ctrl</kbd>+<kbd>A</kbd> | 光标移到行首 |
| <kbd>Ctrl</kbd>+<kbd>E</kbd> | 光标移到行尾 |
| <kbd>Ctrl</kbd>+<kbd>K</kbd> | 删除光标后所有内容 |
| <kbd>Ctrl</kbd>+<kbd>U</kbd> | 删除光标前所有内容 |

## 9.3 导航快捷键

| 快捷键 | 功能 |
|--------|------|
| `/` | 显示所有命令和技能（弹出选择器）|
| `?` | 显示快捷键帮助 |
| `@` | 引用文件（弹出自动补全选择器）|

## 9.4 计划模式快捷键

| 快捷键 | 功能 |
|--------|------|
| <kbd>Ctrl</kbd>+<kbd>G</kbd> | 在计划模式中，用编辑器打开当前 plan 进行编辑 |

## 9.5 Shift+Tab 权限模式循环

`Shift+Tab` 是最常用的快捷键之一，每按一次循环到下一个权限模式：

```
default → plan → acceptEdits → auto → default → ...
```

| 模式 | 说明 |
|------|------|
| `default` | 每个修改都询问你（最安全）|
| `plan` | 只读，Claude 只能探索不能改动 |
| `acceptEdits` | 自动接受文件修改（但 Bash 命令还需确认）|
| `auto` | 智能判断，危险操作才弹窗 |

## 9.6 多行输入

默认按 <kbd>Enter</kbd> 立即提交。要输入多行内容有两种方式：

**方式一：Shift+Enter**（需要终端支持）

```bash
# 先配置终端，让 Shift+Enter 发送换行符
/terminal-setup
```

**方式二：用反斜杠续行**

```
实现一个用户登录功能：\
- 支持邮箱+密码登录 \
- 登录成功后返回 JWT Token \
- 密码错误超过 5 次锁定账号 30 分钟
```

**方式三：先写到文件，然后引用**

```
@/tmp/my-task.txt 按这个需求实现
```

## 9.7 自定义快捷键

运行 `/keybindings` 会打开（或创建）`~/.claude/keybindings.json`，可以添加自定义快捷键：

```json
{
  "bindings": [
    {
      "key": "ctrl+r",
      "command": "history.search"
    },
    {
      "key": "ctrl+shift+c",
      "command": "session.compact"
    }
  ]
}
```

---

下一步：[CLAUDE.md 与记忆系统](/claude-code/advanced/memory)
