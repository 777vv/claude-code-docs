# 13. 技能（Skills）

::: info 本章你将学到
- Skills 是什么，与 CLAUDE.md 的区别
- 如何创建和调用技能
- frontmatter 所有字段详解
- 带参数、动态上下文注入等高级用法
:::

## 13.1 Skills 是什么

**Skills** 是放在特定目录下、带有 frontmatter 的 Markdown 文件。

与 CLAUDE.md 的关键区别：
- CLAUDE.md 的内容**每次会话都会加载**（消耗上下文）
- Skill 的内容**只在被调用时才加载**（按需消耗上下文）

这意味着你可以在 Skill 里放大量详细的参考资料，而不用担心上下文消耗。

**适合放在 Skills 里的内容**：
- 完整的工作流程说明
- 详细的规范和标准
- 需要特定工具授权的操作
- 可复用的任务模板

## 13.2 文件存放位置

| 作用范围 | 路径 |
|---------|------|
| 个人（所有项目）| `~/.claude/skills/<name>/SKILL.md` |
| 项目（当前项目，可提交 git）| `.claude/skills/<name>/SKILL.md` |
| 插件提供 | `<plugin>/skills/<name>/SKILL.md` |

## 13.3 创建第一个技能

```bash
# 创建技能目录
mkdir -p ~/.claude/skills/explain-code
```

编辑 `~/.claude/skills/explain-code/SKILL.md`：

```markdown
---
name: explain-code
description: 用可视化图表和类比解释代码。当用户问"这怎么工作的？"时使用。
---

当解释代码时，始终按以下步骤：

1. **从类比开始**：把代码比作日常生活中的事物
2. **画个 ASCII 图**：展示数据流、结构或关键关系
3. **逐步走读**：解释每一步发生了什么，用中文
4. **指出一个坑**：这段代码最常见的误解或错误用法是什么
```

**调用方式**：
```
# 方式 1：直接在斜杠后输入名称
/explain-code

# 方式 2：Claude 自动识别触发
这段代码是怎么工作的？  ← Claude 会自动调用 explain-code skill
```

## 13.4 frontmatter 字段详解

```yaml
---
name: skill-name                    # 名称（小写字母、数字、连字符）
description: 做什么，什么时候用     # 影响 Claude 是否自动触发！写得具体
arguments:                          # 位置参数（可选）
  - name: issue-number
    description: GitHub issue 编号
disable-model-invocation: true      # true = 只能手动调用，不会自动触发
user-invocable: false               # false = 从 / 菜单隐藏
allowed-tools:                      # 技能活跃时自动允许的工具
  - Bash(gh *)
  - Read
model: opus                         # 技能活跃时切换到指定模型
paths:                              # 只在处理这些文件时激活
  - "src/api/**/*.ts"
context: fork                       # 在隔离的子代理上下文中运行
---
```

::: tip description 字段的重要性
`description` 直接决定 Claude 是否会**自动**触发这个 Skill。写得越具体越好：

```yaml
# 差：
description: 代码审查

# 好：
description: 审查 Pull Request 的代码质量、安全漏洞和性能问题。
             当用户说"审查这个 PR"或"帮我看看这段代码"时使用。
```
:::

## 13.5 带参数的技能

```markdown
---
name: fix-issue
description: 修复 GitHub issue，当用户说"修复 issue #xxx"时使用
disable-model-invocation: true
allowed-tools:
  - Bash(gh *)
  - Read
  - Edit
  - Bash(git *)
---

修复 GitHub issue #$ARGUMENTS，按我们的编码规范：

1. 用 `gh issue view $ARGUMENTS` 查看 issue 详情
2. 理解问题描述和复现步骤
3. 找到相关代码，理解根本原因
4. 实现修复
5. 写测试覆盖这个 bug
6. 创建 commit 和 PR，PR 描述中引用 issue
```

**调用**：
```
/fix-issue 1234
```

Claude 会把 `$ARGUMENTS` 替换成 `1234`。

## 13.6 动态上下文注入

用 `` !`<命令>` `` 语法，在 Skill 内容发送给 Claude 之前**先执行一条命令**，把输出插入到提示里：

```markdown
---
name: pr-summary
description: 总结当前 PR 的改动内容和影响
allowed-tools:
  - Bash(gh *)
---

## 当前 PR 上下文（自动获取）
- PR diff: !`gh pr diff`
- PR 评论: !`gh pr view --comments`
- 改动文件: !`gh pr diff --name-only`
- CI 状态: !`gh pr checks`

## 你的任务
基于以上信息，写一份 PR 摘要：
1. 这个 PR 做了什么（一句话）
2. 主要改动点（3-5 条）
3. 潜在风险（如有）
4. 测试覆盖情况
```

## 13.7 在隔离上下文中运行

设置 `context: fork` 让技能在独立的子代理上下文中运行，不污染主会话：

```yaml
---
name: security-audit
description: 对当前代码做安全审计，发现漏洞
context: fork
model: opus
allowed-tools:
  - Read
  - Grep
  - Glob
---
```

## 13.8 内置 Skills（Bundled Skills）

Anthropic 提供了以下开箱即用的技能：

| 命令 | 功能 |
|------|------|
| `/simplify` | 三个代理并行审查代码质量、复杂度、可读性，然后修复 |
| `/debug [描述]` | 开启详细调试日志，分析问题根因 |
| `/batch <指令>` | 大规模并行改动，自动拆分任务 |
| `/loop [间隔] [prompt]` | 循环执行提示词（如每 5 分钟检查一次）|
| `/claude-api` | 加载 Anthropic SDK 参考文档 |
| `/fewer-permission-prompts` | 分析历史，生成权限白名单 |

---

下一步：[子代理（Subagents）](/claude-code/advanced/subagents)
