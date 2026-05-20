---
name: update-docs
description: Use when the user runs `/update` slash command, or asks to "update docs", "check if docs are outdated", "扫描文档", "对比官方文档", "audit chapters against upstream". Scans all tool chapters under docs/, compares to authoritative sources (official sites, GitHub, community wikis), reports stale/wrong content with concrete fix suggestions. Default is dry-run report; --apply mode edits files (with user confirmation per file).
---

# update-docs · 文档新鲜度审计 SOP

本 skill 在你看到用户输入 `/update` 或类似意图（"扫描文档" / "对比官方文档" / "看哪些过时了"）时触发。

**核心目标**：识别站内 4 个工具文档与上游官方资料的差异，给出可执行的修订建议。

---

## ⚠️ 第 0 步：先确认 5 件事

触发后**不要立刻动手**：

1. **范围**：扫全部 4 个工具？还是只扫某个？看用户传的参数。
2. **模式**：dry-run 出报告 vs 直接改文件？默认 dry-run。
3. **时效**：扫所有章节 vs 跳过最近 N 天改过的？
4. **快速 vs 全面**：只对比关键事实（命令/版本/URL）vs 全文比对？
5. **TaskCreate 一个总任务**跟踪进度

如果用户说"全扫并改"，先**确认一遍**：「这会读 141 个 markdown + 抓 30+ 个官方页面，预计 ¥X，¥Y 分钟，确认吗？」

---

## 第 1 步：摸清待扫文档

```bash
# 不要 Read 全部 141 个文件——先列出来
find docs/{claude-code,codex,openclaw,hermes} -name "*.md" | sort
```

按工具分组。每个工具的章节列表+最后修改时间（用 `git log` 拿）：

```bash
for f in $(find docs/<tool>/ -name "*.md"); do
  git log -1 --format="%ai %s | $f" -- "$f"
done | sort -r
```

最近改的章节优先级**低**（刚改过通常还新鲜）。

### 工具 → 官方源对照表

每个工具维护一份"权威源清单"，用于对比：

| 工具 | 官方 / 权威源 |
|---|---|
| **Claude Code** | docs.anthropic.com/claude-code · github.com/anthropics/claude-code · changelog |
| **Codex** | github.com/openai/codex · openai 官方博客 |
| **OpenClaw** | docs.openclaw.ai · github.com/openclaw/openclaw · clawhub.ai |
| **Hermes** | hermes-agent.nousresearch.com · github.com/NousResearch/hermes-agent · agentskills.io |

**国内服务商**（DeepSeek/通义/Kimi/MiniMax/智谱）也要看官方，价格/模型名变化频繁。

---

## 第 2 步：抓关键"易过时"内容

不是所有内容都需要对比——**只关注高变动的事实**。优先级：

### 🔴 高频变动（每月可能变）
- LLM 模型名、价格、context window
- 命令行 flag / 参数
- 安装命令
- 版本号 / star 数 / 章节统计
- API endpoint URL

### 🟡 中频变动（每季度）
- 工具集 / channel 支持列表
- 推荐配置
- 安全特性 / 默认行为
- 第三方依赖（Node / Python 版本要求）

### 🟢 稳定（一年以上不变）
- 概念图解（Gateway / Agent 等架构）
- 使用场景
- 比喻 / 教学内容

**默认只检 🔴 + 🟡，跳过 🟢**（除非用户明确要全扫）。

### 用 Grep 批量定位

```bash
# 找所有 LLM 价格陈述
grep -rn "¥[0-9]\+/1M\|\$[0-9]\+/" docs/

# 找版本号
grep -rn "v0\.[0-9]\+\|version: [0-9]" docs/

# 找具体命令
grep -rn "^\s*npm install -g\|^\s*pip install\|^\s*hermes \|^\s*openclaw " docs/

# 找绝对 URL（可能换了的）
grep -rnE "https?://[^)\"' ]+" docs/<tool>/ | grep -v "screenshot\|qun.png"
```

---

## 第 3 步：抓上游对比

**并行**抓官方源（用 WebFetch / WebSearch）：

```
WebFetch https://docs.anthropic.com/claude-code  → 拿当前命令清单
WebFetch https://github.com/openai/codex/releases  → 拿最新 release
WebFetch https://docs.openclaw.ai/api/cli  → 拿当前 CLI 命令
WebFetch https://hermes-agent.nousresearch.com/docs/installation  → 拿装法
WebFetch https://platform.deepseek.com/api-docs/pricing  → 拿当前价
WebSearch "openclaw v1 release notes 2026"  → 看是否有大版本
```

::: warning 国内访问
- DeepSeek / 通义 / 阿里 / 飞书 等国内服务直接抓
- 翻墙才能抓的（Anthropic / OpenAI / Hermes）注意国内代理
:::

每个上游页面**只提取你需要对比的字段**，不要全文存（费 token）。

---

## 第 4 步：逐项对比

对每条"易过时"事实，生成对比记录：

```yaml
finding:
  file: docs/hermes/setup/api-key.md
  line: 78
  type: pricing
  current: "DeepSeek Chat 输入约 ¥0.001/千 tokens"
  upstream: "DeepSeek Chat 输入 ¥0.27/百万 tokens (2026-05)"
  upstream_source: https://platform.deepseek.com/api-docs/pricing
  status: outdated
  confidence: high
  suggestion: |
    改成: "DeepSeek Chat 输入约 ¥0.27/百万 tokens"
    并加备注: "(价格随时调整，以官方为准)"
```

字段含义：
- `status`: `outdated` / `wrong` / `style-only` / `ok`
- `confidence`: high（上游明确）/ medium（推断）/ low（不确定）
- `suggestion`: 给出**具体的新文本**，不要只说"过时了"

---

## 第 5 步：生成报告

存到 `audit-reports/update-report-YYYY-MM-DD.md`：

```markdown
# 文档新鲜度审计 - 2026-05-19

**扫描范围**：4 工具 / 141 章节
**耗时**：23 分钟
**LLM 成本**：¥3.20
**抓取上游**：32 个页面

## 总览

| 工具 | 章节 | 问题数 | 🔴 严重 | 🟡 中等 | 🟢 轻微 |
|---|---|---|---|---|---|
| Claude Code | 27 | 5 | 1 | 3 | 1 |
| Codex | 22 | 8 | 2 | 4 | 2 |
| OpenClaw | 40 | 12 | 3 | 6 | 3 |
| Hermes | 40 | 18 | 5 | 9 | 4 |
| **合计** | **141** | **43** | **11** | **22** | **10** |

## 🔴 严重问题（11 个）

### 1. docs/hermes/setup/api-key.md:78
- **现状**: "DeepSeek Chat 输入约 ¥0.001/千 tokens"
- **上游**: 2026-05 已涨到 ¥0.27/百万
- **来源**: https://platform.deepseek.com/api-docs/pricing
- **建议**: ...

### 2. docs/codex/guide/installation.md:23
- **现状**: `npm install -g @openai/codex`
- **上游**: 包名已改为 `@openai/codex-cli`
- **建议**: ...

(等等)

## 🟡 中等问题（22 个）

...

## 🟢 轻微 / 风格（10 个）

...

## 上游变化但本站无需改

- Hermes v0.9 即将发布（预计 6 月）—— 等正式发了再更
- OpenClaw 新增 [feature X] —— 当前章节已有铺垫，无需立即改

## 建议下一步

- [ ] 用户 review 这份报告，确认要改的
- [ ] `/update --apply` 跑修改流程
- [ ] 改完 `npm run build` 验证
- [ ] 提 PR / commit
```

报告里**永远不要直接 Edit 文件**——这一步纯只读。

---

## 第 6 步：(--apply 模式) 改文件

只有用户传 `--apply` 才进这步。

### 强制流程

对每个 `🔴 严重` 问题：

1. **展示 diff 给用户**：
   ```
   # docs/hermes/setup/api-key.md
   - DeepSeek Chat 输入约 ¥0.001/千 tokens
   + DeepSeek Chat 输入约 ¥0.27/百万 tokens (2026-05 价格，以官方为准)
   ```
2. **AskUserQuestion** 确认：应用 / 跳过 / 改文案
3. 同意后 Edit 文件
4. 跳下一个

::: warning 不要批量改
**绝对不要**一次性自动改所有发现的问题。每个都要确认。原因：
- 上游可能也不全对（如某些非官方教程过时）
- 用户可能有"特意保留某说法"的原因
- 一次改太多 review 不过来
:::

### 改完跑验证

```bash
npm run build 2>&1 | tail -10
```

要看到 `build complete in XX s` 且**无死链**。出错回滚刚才的 Edit。

---

## 第 7 步：提交 / 收尾

改完了：

1. 列出所有改动的文件
2. 让用户决定：
   - 立即 git commit
   - 先 review 再 commit
   - 撤销
3. 提交 commit 时 message 类似：
   ```
   docs: 月度更新 - 同步上游价格 / 命令 / 版本号

   - hermes: DeepSeek 价格更新
   - codex: 包名变更 @openai/codex → @openai/codex-cli
   - openclaw: 新增 v1.3 features
   - claude-code: ...

   Audit report: audit-reports/update-report-2026-05-19.md
   ```

---

## 节奏 / 资源预估

| 模式 | 时间 | LLM 成本 | 上游抓取 |
|---|---|---|---|
| `/update <tool> --fast --report-only` | 5-10 分钟 | ¥0.5-2 | 5-8 页 |
| `/update <tool> --report-only` | 15-25 分钟 | ¥2-5 | 10-15 页 |
| `/update all --report-only` | 60-90 分钟 | ¥10-20 | 30-40 页 |
| `/update <tool> --apply` | 时间 × 2 | + ¥0-3 | + 用户确认时间 |

**首次跑全扫预计 1.5 小时**，老手用 `--fast` 缩到 10-15 分钟。

---

## 频率建议

- **月度**：跑一次 `--fast` 扫所有工具（30 分钟覆盖大问题）
- **季度**：跑一次完整 `--report-only`（捕捉中等问题）
- **大版本前**：在某工具发新版后跑该工具的完整扫描

可以用 cron + GitHub Action 自动化（详见报告末尾的"自动化建议"）。

---

## 上游源清单（每个工具固定）

### Claude Code
- 主文档: docs.anthropic.com/claude-code
- GitHub: github.com/anthropics/claude-code
- Changelog: github.com/anthropics/claude-code/releases
- 中文社区: 暂无官方中文，参考个人博客谨慎

### Codex
- GitHub: github.com/openai/codex
- 文档: docs.codex.ai（如有）/ README
- Release notes: github.com/openai/codex/releases

### OpenClaw
- 主文档: docs.openclaw.ai
- GitHub: github.com/openclaw/openclaw
- ClawHub: clawhub.ai
- 中文社区: clawd.org.cn / hermesagent.org.cn

### Hermes
- 主文档: hermes-agent.nousresearch.com/docs
- GitHub: github.com/NousResearch/hermes-agent
- agentskills.io
- 中文社区: hermesagent.org.cn / hermes.xaapi.ai

### LLM 供应商（共用）
- DeepSeek: platform.deepseek.com/api-docs
- 通义: dashscope.console.aliyun.com（价格在控制台）
- Kimi: platform.moonshot.cn
- 智谱: open.bigmodel.cn
- MiniMax: platform.minimaxi.com
- Anthropic: docs.anthropic.com/en/docs/about-claude/pricing
- OpenAI: openai.com/api/pricing

---

## 常见情况

### Q：发现上游也错了 / 教程说法分歧
- 标 `confidence: low`，注明矛盾源
- 让用户决定

### Q：本站章节的"教学性比喻"过时
- 通常 🟢 级别，不强制改
- 除非比喻已经反事实（如"像 ChatGPT 一样不联网"——但 ChatGPT 现在能联网了）

### Q：发现章节里有 hallucination（编的命令 / 编的 API）
- 🔴 严重
- 改完同时记到 `lessons-learned.md`（如有），下次写新章节避免

### Q：扫到一半发现某工具大改版（如 v1.0 → v2.0）
- 立刻停，**告诉用户**
- 不要试图自动迁——大改版要重新规划目录
- 触发 `add-ai-tool` skill 的"全量更新"流程

### Q：报告该提交到 git 吗
- 默认**提到 `audit-reports/`** 但 `.gitignore` 排除
- 用户想保留历史的可以加入 git

---

## 失败模式

| 情况 | 应对 |
|---|---|
| 网络不通官方源 | 跳过，标 `status: cannot-verify` |
| 国内访问国外不稳 | 多 retry / 用 ghfast.top 代理 |
| 上游也变了但本站没变（站太老）| 列入报告但 confidence 高 |
| 改完 build 死链 | 撤销，让用户人工修 |
| 改完大版本不兼容（如 vitepress） | 用 git stash 回滚整个改动 |

---

## 触发后的标准开场白

**第一行必须告知用户 SKILL 已激活**（CLAUDE.md 第 12 节强制要求）：

```
🔍 SKILL `update-docs` 已激活

收到 /update 命令。我会:
1. 列出待扫范围（${scope}）
2. 并行抓上游对比
3. 生成 audit-reports/update-report-${DATE}.md
4. (如 --apply) 逐条让你确认修改

预估 ${TIME} 分钟 / ¥${COST}。开干吗？
```

等用户回 OK 才真跑。
