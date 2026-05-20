# 💻 工程师 / 程序员的 AI 提效路径

> **核心承诺**：学完每周省 **5-10 小时**——从"翻文档找代码"变成"描述需求让 AI 干"。

::: info 本页给你什么
- 工程师最高频的 7 个痛点 + 对应解决方案
- 推荐工具组合（不是 4 个都学，先学 1-2 个）
- 一条按周排的学习路径（4 周入门，3 个月精通）
- 每个解决方案都有**直达章节链接**，点过去就有完整教程
- 预计能省多少时间 + 真实社区反馈
:::

---

## 你日常被哪些事消耗精力？

| 痛点 | 现状 | AI 帮你怎么干 | 直达教程 |
|---|---|---|---|
| **🐛 调 bug 翻半天上下文** | grep 来 grep 去，读 200 个文件 | Claude Code 自主探索代码库定位修复 | [复杂 Bug 调试 →](/claude-code/cases/debug) |
| **🏗️ 历史代码不敢动** | 怕一改炸一片 | AI 先列重构方案 → 分步执行 → 测试覆盖兜底 | [遗留代码重构 →](/claude-code/cases/refactor) |
| **🌙 CI 半夜挂了没人看** | 早上才知道 | OpenClaw 24h 守夜 → AI 分析失败 → 飞书 @ 责任人 | [项目守夜人 →](/openclaw/cases/project-watchdog) |
| **📱 移动端临时想改代码** | 必须打开电脑 | 飞书一句话 → OpenClaw → Codex 改 → 自动提 PR | [AI 帮你写代码 →](/openclaw/cases/code-assistant) |
| **📝 PR 描述总要现写** | 每次写半小时 | AI 看 diff 自动生成清晰的 PR 描述 | [Claude Code 实战 →](/claude-code/cases/) |
| **🔧 重复脚手架 / boilerplate** | 写第 N 个 CRUD 模块 | AI 按你项目规范一键生成 | [CLAUDE.md 记忆 →](/claude-code/advanced/memory) |
| **🌍 翻墙不稳定不想折腾** | 用不了 Claude / GPT | 用国内 DeepSeek / 通义 / Kimi 走 Codex | [Codex 国内模型 →](/codex/china-models/overview) |

---

## 推荐工具组合（按"投入产出比"排序）

### 🥇 第一优先：Claude Code 或 Codex（二选一）

**学完能干**：写代码 / 改代码 / 重构 / Code Review，所有 IDE 内编程场景。

| 你的情况 | 推荐 |
|---|---|
| 能稳定翻墙、追求质量 | **[Claude Code](/claude-code/guide/intro)** 27 章 |
| 国内、不想折腾、要 DeepSeek/通义 | **[Codex](/codex/guide/what-is-codex)** 22 章 |
| 都试试 → 1 周后选一个长期用 | 没坏处，工具免费 |

::: tip 一句话区别
**Claude Code** 代理式强，能"自己探索代码库"。
**Codex** 轻量、国内能用、文档保姆级。
功能高度重合，**别两个都精通**——选一个深用。
:::

### 🥈 第二优先：OpenClaw（差异化场景才学）

**学完能干**：远程触发任务、CI 守夜、IM 里调 AI 改代码。

不是所有工程师都需要——**这些场景才适合学**：
- ✅ 你想"出门时也能改代码"（飞书一句话提 PR）
- ✅ 你的项目要 24h 巡检（CI 失败自动告警）
- ✅ 你团队用飞书/钉钉，想接 AI bot
- ❌ 你只想在电脑前用 AI 写代码 → 不必学这个

[OpenClaw 40 章 →](/openclaw/)

### 🥉 第三优先：Hermes（研究 / 高阶玩家）

**学完能干**：multi-backend 调度、训练数据生成、subagent 并行。

适合：
- AI 工程师 / 微调爱好者
- 想"用一周后让 AI 越用越懂自己"的人

[Hermes 40 章 →](/hermes/)

---

## 4 周入门路径（每周 2-3 小时）

### Week 1：装上跑通
- [ ] **Day 1-2**：[Claude Code 安装](/claude-code/guide/install) 或 [Codex 安装](/codex/guide/installation)
- [ ] **Day 3**：[国内模型接入](/codex/china-models/overview)（国内用户必看）
- [ ] **Day 4-5**：拿一个**真实小项目**试着让 AI 改 3 个 bug

**周末检查**：能不能让 AI 帮你独立完成 1 个完整小任务（带测试）？

### Week 2：进阶用法
- [ ] [CLAUDE.md 记忆系统](/claude-code/advanced/memory) — 让 AI 记住项目规范
- [ ] [斜杠命令](/claude-code/basics/slash-commands) — 加速常用操作
- [ ] [计划模式](/claude-code/advanced/plan-mode) — 复杂任务先规划再执行

### Week 3：实战案例
跟着做 1-2 个：
- [ ] [从零搭建全栈项目](/claude-code/cases/fullstack)
- [ ] [遗留代码重构](/claude-code/cases/refactor)
- [ ] [复杂 Bug 调试](/claude-code/cases/debug)

### Week 4：自动化
- [ ] [GitHub Actions 集成](/claude-code/integration/github-actions) — CI 里也用上 AI
- [ ] （可选）[OpenClaw 入门](/openclaw/intro/what-is) — 解锁远程触发场景

---

## 3 个月精通路径

| 月份 | 主要内容 | 产出 |
|---|---|---|
| **Month 1** | 主工具 + 国内适配 | 日常 90% 编程任务都能用 AI |
| **Month 2** | Hooks / MCP / Subagents | 自动化你的专属工作流 |
| **Month 3** | OpenClaw / Hermes 跨工具组合 | 移动端触发、训练数据生成、subagent 并行调研 |

---

## 真实场景估算

按月活跃使用 AI 协助约 30-50 次：

| 场景 | 单次省时间 | 月度省时 |
|---|---|---|
| 改 1 个 bug（不用翻文档） | 30-90 分钟 | 5-15 小时 |
| 重构 1 个模块 | 2-5 小时 | 2-8 小时 |
| 写 1 个 PR 描述 | 15-30 分钟 | 2-5 小时 |
| 写 boilerplate 模板代码 | 10-30 分钟 | 3-8 小时 |
| **月度总计** | | **15-40 小时** |

**保守估算**：每周省 **5-10 小时**。激进估算（重度使用）：每周 **10-20 小时**。

::: tip 工具不替代你
AI 替代的是"翻文档 / 找上下文 / 写 boilerplate"这种低创造性劳动。
**你的核心价值是判断和决策**——这部分越用 AI 越值钱。
:::

---

## 国内用户特别提醒

### 🇨🇳 必读
- [Codex 国内模型完整对接](/codex/china-models/overview)
- [Claude Code 国内模型接入](/claude-code/china/models)
- [国内 LLM 价格对比](/openclaw/china/models)

### 💰 月度成本预估（国内）
- 用 DeepSeek 起步：**¥10-30/月**
- 用通义 Max：**¥50-150/月**
- 雇兼职助理对比：**¥3000+/月**

---

## 常见疑问

**Q：完全没接触过 AI，能直接学吗？**
A：能。直接从 [Claude Code 入门](/claude-code/guide/intro) 开始，第 1 章会带你搞懂概念。提示词怎么写的细节在用的过程中会自然掌握。

**Q：我用 GitHub Copilot 就够了，还需要这些吗？**
A：Copilot 是 IDE 内**补全**，本站的工具是**代理式**——AI 能自主完成多步任务（如"修这个 bug 并跑测试"），定位不同，**可以并存**。

**Q：会不会让我自己变菜？**
A：取决于你怎么用。把 AI 当**会帮你查文档的同事**而不是**会替你思考的人**，技术能力反而长得更快。

**Q：和 Cursor 比怎么选？**
A：本站讲的 Claude Code / Codex 都是**官方 CLI 工具**，比 Cursor 更通用（任何编辑器都能用）。Cursor 强在 IDE 体验，**没冲突，可同时用**。

**Q：和 ChatGPT 网页版比？**
A：网页版只能复制粘贴。Claude Code / Codex **能直接读写你的文件、运行命令**，这是质的差别。

---

## 下一步去哪？

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:24px">

<a href="/claude-code/guide/intro" style="display:block;padding:20px;border:1px solid var(--vp-c-divider);border-radius:12px;text-decoration:none;background:var(--vp-c-bg-elv);transition:border-color .2s" onmouseover="this.style.borderColor='var(--vp-c-brand-1)'" onmouseout="this.style.borderColor='var(--vp-c-divider)'">
  <div style="font-weight:600;color:var(--vp-c-text-1);margin-bottom:6px">🟠 Claude Code 入门 →</div>
  <div style="font-size:13px;color:var(--vp-c-text-2)">主线推荐 · 27 章节</div>
</a>

<a href="/codex/guide/what-is-codex" style="display:block;padding:20px;border:1px solid var(--vp-c-divider);border-radius:12px;text-decoration:none;background:var(--vp-c-bg-elv);transition:border-color .2s" onmouseover="this.style.borderColor='#10A37F'" onmouseout="this.style.borderColor='var(--vp-c-divider)'">
  <div style="font-weight:600;color:var(--vp-c-text-1);margin-bottom:6px">🟢 Codex 入门 →</div>
  <div style="font-size:13px;color:var(--vp-c-text-2)">国内首选 · 22 章节</div>
</a>

<a href="/openclaw/intro/what-is" style="display:block;padding:20px;border:1px solid var(--vp-c-divider);border-radius:12px;text-decoration:none;background:var(--vp-c-bg-elv);transition:border-color .2s" onmouseover="this.style.borderColor='var(--vp-c-brand-1)'" onmouseout="this.style.borderColor='var(--vp-c-divider)'">
  <div style="font-weight:600;color:var(--vp-c-text-1);margin-bottom:6px">🦞 OpenClaw 概念入门 →</div>
  <div style="font-size:13px;color:var(--vp-c-text-2)">搞懂概念 + 装上跑通</div>
</a>

<a href="/community" style="display:block;padding:20px;border:1px solid var(--vp-c-divider);border-radius:12px;text-decoration:none;background:var(--vp-c-bg-elv);transition:border-color .2s" onmouseover="this.style.borderColor='var(--vp-c-brand-1)'" onmouseout="this.style.borderColor='var(--vp-c-divider)'">
  <div style="font-weight:600;color:var(--vp-c-text-1);margin-bottom:6px">💬 进群提问 →</div>
  <div style="font-size:13px;color:var(--vp-c-text-2)">作者微信 / 群二维码</div>
</a>

</div>

---

## 切换到其他角色

不是工程师？看其他路径：

- [💼 产品 / 运营 / PM →](/for/pm)
- [📚 创作者 / 研究员 →](/for/creator)
- [🏠 普通人 / 学生 →](/for/general)
