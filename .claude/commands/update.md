---
description: 扫描站内所有工具文档，对比官方资料，输出差异/过时清单 + 修订建议
argument-hint: "[tool-id|all] [--apply|--report-only] [--since DAYS]"
allowed-tools: Skill, Read, Grep, Glob, WebFetch, WebSearch, Bash, Edit, Write, Agent, mcp__playwright__browser_navigate, mcp__playwright__browser_take_screenshot
---

# /update — 文档新鲜度审计

你被触发是因为用户运行了 `/update $ARGUMENTS`。

**立即做的事**：

1. 调用 `update-docs` skill（用 Skill 工具）
2. 把用户传的参数原样转给 skill

## 参数解析

| 参数 | 含义 |
|---|---|
| 空 / `all` | 扫所有工具（Claude Code / Codex / OpenClaw / Hermes） |
| `claude-code` / `codex` / `openclaw` / `hermes` | 只扫该工具 |
| `--apply` | 不只是报告，直接改文件（**默认是只报告不改**） |
| `--report-only` | 只生成报告（默认行为，可显式标） |
| `--since 30` | 只扫最近 N 天没改过的章节（节省时间） |
| `--fast` | 快速模式：只对比关键事实（命令 / 版本 / 价格 / URL），不全文比对 |

## 使用示例

```
/update                  # 默认: 扫全部，只出报告
/update hermes           # 只扫 Hermes
/update codex --apply    # 扫 Codex 并直接改
/update all --since 60   # 全扫，但跳过最近 60 天改过的章节
```

## 注意

- `--apply` 模式下，**每个文件改动前必须给用户看 diff 确认**
- 不要静默改 markdown
- 改完跑 `npm run build` 验证不死链
- 最终交付一份 `update-report-YYYY-MM-DD.md` 给用户
