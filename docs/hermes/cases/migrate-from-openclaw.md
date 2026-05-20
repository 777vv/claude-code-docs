# 34. 案例 10：从 OpenClaw 迁移

::: info 这个案例你将做到（本站独家）
你在 [OpenClaw 章节](/openclaw/) 学完后，发现 Hermes 的某些能力更适合你（self-improving / multi-backend / trajectory）。

**`hermes claw migrate` 一键迁移**：
- OpenClaw 的 agent 配置 → Hermes agent
- OpenClaw 的 memory.md → Hermes memory.md
- OpenClaw 的 skills → Hermes skills（自动转格式）
- OpenClaw 的对话历史 → Hermes FTS5 索引

不丢任何东西，平滑跳船。
:::

## 34.1 迁移前思考

**你真的要迁吗**？

迁移到 Hermes 适合：
- ✅ 你想要 self-improving skills
- ✅ 你想要 multi-backend（云沙箱 / SSH / Modal）
- ✅ 你想做 trajectory 训练数据
- ✅ 你想要 Honcho 深度用户建模
- ✅ 你接受用 Python 而非 Node.js
- ✅ 你不需要国内 IM（或用 [33 章](/hermes/cases/with-other-tools) 的 OpenClaw 桥接方案）

**不要完全迁的情况**：
- ❌ 你重度依赖 OpenClaw 的飞书 / 钉钉 / 微信 / QQ
- ❌ 你的工作流深度耦合 OpenClaw 特有 skill
- ❌ 你的团队都已经熟悉 OpenClaw

::: tip 建议: 并行而非替代
**最佳实践是两者并行**：
- OpenClaw 接国内 IM（[33 章](/hermes/cases/with-other-tools) 桥接）
- Hermes 跑后台 self-improving agent
:::

## 34.2 准备工作

### 备份你的 OpenClaw

```bash
tar -czf ~/openclaw-backup-$(date +%F).tar.gz ~/.openclaw
```

迁移失败也能回滚。

### 装好 Hermes

按 [第 6 章](/hermes/intro/install) 装好 Hermes，跑过 `hermes setup` 至少配好 LLM。

### 看看你 OpenClaw 有啥

```bash
ls ~/.openclaw/workspace/
openclaw agents list
openclaw skills list
```

## 34.3 一键迁移

```bash
hermes claw migrate
```

向导：

```
🦞 Migration from OpenClaw to Hermes

Detected OpenClaw at: ~/.openclaw
Found:
  - 3 agents (xiaozhao, code-bot, news-collector)
  - 12 skills
  - 234 memory entries
  - 1,247 session histories
  - 2 channels (feishu, telegram)

What would you like to migrate?
  ❯ ✓ Agents (configs + souls)
    ✓ Skills (convert format)
    ✓ Memory (memory.md, user preferences)
    ✓ Session history (for FTS5 search)
    ☐ Channels (NOT recommended - Hermes won't support feishu)
    ☐ Trajectory (OpenClaw doesn't have this concept)

? Mode:
  ❯ Merge (add to existing Hermes data)
    Replace (overwrite existing - 危险)
    Side-by-side (don't touch existing, add as 'imported-' prefix)

? Auto-translate concepts?
  ❯ Yes (e.g. OpenClaw "agent" → Hermes "agent" with adjustments)
    No (raw copy, may need manual fixes)
```

按 Enter / 选择即可。

### 跑完输出

```
Migration log:

[Agents]
  ✓ xiaozhao → ~/.hermes/agents/xiaozhao/
    - soul.md converted (1 syntax adjustment)
    - agent.yaml: OpenClaw 'channels' → Hermes 'platforms'
    - skills list updated (mapped 5 OpenClaw → Hermes equivalents)

  ✓ code-bot → ~/.hermes/agents/code-bot/
  ✓ news-collector → ~/.hermes/agents/news-collector/

[Skills]
  ✓ summarize-arxiv          → converted (1:1 mapping)
  ✓ daily-news-collector     → converted
  ✓ code-review              → converted (require_confirm adjusted)
  ⚠ shopping-list            → converted with warning (Hermes 路径不同)
  ⚠ english-coach            → converted (注意: 持久化方式从 file → SQLite)
  ✗ wechaty-relay            → SKIPPED (Hermes 不支持微信)
  ...

[Memory]
  ✓ 234 entries imported to ~/.hermes/memory.md
  ✓ user preferences extracted to ~/.hermes/user.md
  ✓ Honcho seeded with imported memory (initial profile generated)

[Sessions]
  ✓ 1,247 sessions indexed into FTS5
  Time: 3m 45s

[Channels]
  - feishu: SKIPPED (Hermes 不原生支持，建议保留 OpenClaw 桥接)
  - telegram: ✓ migrated (token + config)

[Skipped]
  - 2 skills (wechaty-relay, feishu-internal-only)
  - 1 channel (feishu)

[Manual review needed]
  - shopping-list skill: 路径从 ./list.json 改成 ~/.hermes/data/shopping.json
  - 5 memory entries 含 OpenClaw 特有概念，可能需要修订
  Report: ~/.hermes/migration-2026-05-19.md

Total: 3 agents, 10 skills, 234 memories, 1247 sessions migrated.
Time: 8 minutes.

Next steps:
  1. hermes doctor                    # 检查
  2. hermes "你好"                    # 测试新 agent
  3. cat ~/.hermes/migration-2026-05-19.md  # 看详细报告
```

## 34.4 验证迁移

### Step 1: doctor

```bash
hermes doctor
```

应看到：
- ✓ 3 agents loaded
- ✓ 10 skills active
- ✓ Memory loaded
- ⚠ 1 skill needs manual config fix

### Step 2: 测对话

```bash
hermes --agent xiaozhao "你还记得我对花生过敏吗？"
```

预期：
```
是的，主人。我记得你对花生过敏。
（这条记忆从 OpenClaw 迁移而来）
订餐 / 聚会等场景我会自动避开花生制品。
```

记忆**真的**迁过来了。

### Step 3: 测 skill

```bash
hermes --agent xiaozhao "今天的资讯晨报"
```

如果你 OpenClaw 有这个 skill，Hermes 应该能跑。**会和 OpenClaw 结果对比看是否一致**。

## 34.5 概念映射表

| OpenClaw 概念 | Hermes 对应 | 是否完全等价 |
|---|---|---|
| Agent | Agent | ✅ |
| Soul (soul.md) | Soul (soul.md) | ✅ |
| Memory (memory.md) | memory.md + Honcho | ⚠️ Honcho 是新增 |
| Skill (Markdown 包) | Skill (Markdown / Python) | ⚠️ schema 略不同 |
| Channel | Platform | ⚠️ 名字变了 |
| Gateway | Gateway | ✅ |
| Tool (内置) | Tool (Hermes 40+) | ⚠️ OpenClaw 工具更少，需要等价映射 |
| Workflow yaml | （Hermes 没有显式 workflow） | ❌ 需要改写成 agent loop + skills |
| MCP | MCP | ✅ |

最大的差异：**OpenClaw 的 workflow yaml** Hermes 没有对应物，需要重写成 Hermes 的"主 agent + skills" 模式。

迁移工具会**尽力转换**，但 workflow 通常需要你手动 review。

## 34.6 dry-run 预览

不确定迁移效果？先 dry-run：

```bash
hermes claw migrate --dry-run
```

模拟跑一遍，**不实际写入**。输出与正式跑一致的 log，你看完决定是否真迁。

## 34.7 部分迁移

只迁某部分：

```bash
# 只迁 agent
hermes claw migrate --include agents

# 只迁 memory + sessions
hermes claw migrate --include memory,sessions

# 排除某些
hermes claw migrate --exclude channels,skills
```

## 34.8 边迁边用（双跑模式）

不想立刻砍 OpenClaw？

```bash
hermes claw migrate --mode side-by-side
```

迁移结果加 `imported-` 前缀。两个工具同时跑一段时间，确认 Hermes OK 再退 OpenClaw。

## 34.9 回滚

迁移后悔了？

### 方法 1: 删迁移结果

```bash
hermes claw migrate --rollback
```

会把所有 `imported-` 前缀的 agent / skill 删掉。

### 方法 2: 完全恢复 OpenClaw（如果你已经在用它）

```bash
tar -xzf ~/openclaw-backup-2026-05-19.tar.gz -C /
openclaw gateway restart
```

## 34.10 迁移后建议工作流

```
第 1 周（试用）:
  - OpenClaw 主用，Hermes 备用
  - 每天用 Hermes 跑 1-2 个任务，对比效果

第 2-3 周（Hermes 学习中）:
  - 50/50 用两个工具
  - 注意 Hermes 自动生成的 skill

第 4 周（决断）:
  - 如果 Hermes self-improving 效果显著 → 主切 Hermes
  - 如果不需要 self-improving → 回 OpenClaw

第 5+ 周（最优解）:
  - 国内 IM 留在 OpenClaw
  - 技术 / 研究任务用 Hermes
  - 用 [33 章](/hermes/cases/with-other-tools) 的桥接让两者协同
```

## 34.11 常见问题

### Q：迁移会不会双倍存数据？
默认会留 OpenClaw 原数据**不动**。Hermes 拷贝一份。要省空间，可：
```bash
hermes claw migrate --mode move-not-copy  # 移动而非拷贝
```

### Q：OpenClaw 的飞书 channel 真的没法迁？
是。Hermes 没原生飞书支持。建议：
- OpenClaw 保留运行接飞书
- Hermes 用 [33 章桥接](/hermes/cases/with-other-tools)

### Q：迁完跑 hermes 报"skill X 不工作"
看 migration report 的 manual review 部分。通常是路径 / 权限 / API 差异，手动改。

### Q：Honcho 没"学习记录"，迁完是空的怎么办？
Honcho 是 Hermes 独有，从 0 开始学。前两周效果不明显，**这是正常的**。

### Q：OpenClaw 的 workflow yaml 完全没迁
对。Hermes 用不同的方式（agent + skills + cron）。迁移工具会把每个 workflow **生成一份建议的 Hermes 改写方案**到 `~/.hermes/migration-suggestions/`，你手动 review + 改写。

---

## 看完这个案例你应该会

✅ `hermes claw migrate` 一键迁移
✅ Agent / Skill / Memory / Session 全迁
✅ Channel 不迁（Hermes 不支持飞书等）
✅ Dry-run 预览 + 部分迁移 + 双跑模式
✅ 推荐方案: OpenClaw 留接 IM + Hermes 跑后台

---

## 🎉 10 个实战案例完成

至此你已经掌握 Hermes 几乎所有核心场景。
下面 3 章是**部署相关**，让 Hermes 长期跑起来。

**下一步**：[35. 7 种 backend 选型 →](/hermes/deploy/backends)

第一篇部署：Hermes 的 7 种 backend 深度对比 + 何时选哪个。
