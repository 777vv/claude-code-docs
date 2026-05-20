# 官方模型一览

> **本文你将学会：** OpenAI 为 Codex 提供了哪些模型、各自的特点和适用场景。

## 模型速查表

| 模型名称 | 特点 | 适用场景 | 消耗速度 |
|----------|------|----------|----------|
| `gpt-5.5` | 最强综合能力 | 复杂任务、需要广泛知识 | 高 |
| `gpt-5.2-codex` | 最强代码 Agent | 大型重构、Windows 支持 | 高 |
| `gpt-5.1-codex-mini` | 轻量快速 | 日常小任务、快速迭代 | 低（4× 更多用量） |
| `gpt-5.1-codex-max` | 超长推理 | 项目级复杂任务 | 很高 |
| `gpt-5.3-codex-spark` | 近实时响应 | 快速问答（仅 Pro）| 极低 |
| `o3` | 深度推理 | 算法题、复杂逻辑 | 高 |
| `o4-mini` | 轻量推理 | 日常推理任务 | 中 |

---

## 各模型详解

### gpt-5.2-codex（推荐日常使用）

Codex CLI 的主力模型，专门针对代码 Agent 场景优化：

- **上下文压缩**：长对话自动压缩，不会因 token 耗尽中断
- **大型重构**：处理跨多文件的重构任务更稳定
- **Windows 原生支持**：在 PowerShell 环境下表现最佳

```bash
codex --model gpt-5.2-codex
```

---

### gpt-5.1-codex-mini（省量首选）

性能略低于 `gpt-5.2-codex`，但 token 消耗约为其 1/4：

- 适合：简单 Bug 修复、代码解释、日常问答
- 不适合：复杂多步骤重构、需要大量推理的任务

```bash
codex --model gpt-5.1-codex-mini
```

---

### gpt-5.5（旗舰通用）

OpenAI 最新旗舰模型，不只是代码：

- 编程 + 研究 + 复杂知识工作均擅长
- 适合需要结合外部知识的任务（如：按行业最佳实践重构代码）

---

## 如何切换模型

### 启动时指定

```bash
codex --model gpt-5.1-codex-mini
```

### 在 config.toml 中设置默认模型

```toml
# ~/.codex/config.toml
[model]
name = "gpt-5.2-codex"
```

---

## 选哪个模型？

```
日常开发 → gpt-5.2-codex（默认，均衡）
    ↓ 嫌贵 / 想节省用量
gpt-5.1-codex-mini（省量版）
    ↓ 在国内 / 没有 OpenAI 账号
查看 → 国内模型对接章节
```

::: tip 国内用户
如果你在中国大陆无法稳定访问 OpenAI API，建议使用国内模型替代。性能相近但无需翻墙，详见 [国内模型对接总览](/codex/china-models/overview)。
:::
