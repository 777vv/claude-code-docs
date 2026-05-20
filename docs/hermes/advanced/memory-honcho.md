# 19. Honcho 记忆 + Memory

::: info 本章你将学到
- Hermes 5 层记忆架构详解
- Honcho 是个什么"用户建模" 神器
- FTS5 全文搜索玩法
- memory.md / user.md 的手动编辑
- 双压缩 + Anthropic prompt caching 省 70-90% 成本
:::

## 19.1 5 层记忆全景

回顾 [2 章](/hermes/intro/concepts) 提过的：

```
┌────────────────────────────────────────────┐
│ 1. Working Memory  当前对话上下文           │  自动
├────────────────────────────────────────────┤
│ 2. Session Memory  FTS5 全文索引历史会话   │  自动
├────────────────────────────────────────────┤
│ 3. memory.md       长期事实（可手编）       │  自动+手动
├────────────────────────────────────────────┤
│ 4. user.md         用户偏好画像（可手编）   │  自动+手动
├────────────────────────────────────────────┤
│ 5. Honcho          深度用户建模             │  完全自动
└────────────────────────────────────────────┘
```

下面逐个讲。

## 19.2 第 1 层: Working Memory（工作记忆）

当前对话的全部上下文。

控制：

```yaml
# ~/.hermes/config.yaml
memory:
  working:
    max_turns: 30                  # 最近 30 轮对话进 prompt
    summarize_after: 20            # 超 20 轮的老的自动摘要
    summary_model: deepseek/deepseek-chat   # 摘要用便宜模型
```

### 自动摘要机制

对话第 21 轮起，前 10 轮被压缩成 1-2 段摘要：
```
[Summary of turns 1-10]
用户在调试一个 React 项目的 redux store 问题，
试了 reset / clear cache / 改 middleware 3 种方法，
最后定位到是 thunk 没正确处理 async action。
```

后 20 轮保持原文。

效果：50 轮长对话 prompt 实际只有 ~8K tokens。

## 19.3 第 2 层: Session Memory（FTS5 全文搜索）

每次对话结束**自动入库**，建 SQLite FTS5 全文索引。

随时搜：
```bash
hermes memory search "redis 性能"
```

输出：
```
3 sessions matched:

1. [2026-04-15 22:30] redis-perf-fix (45 messages, 1h 23m)
   ...上次我们改了 maxmemory-policy 解决了 evict 慢的问题...

2. [2026-03-20 14:00] cache-design (28 msg, 56m)
   ...讨论用 redis 还是 memcached...

3. [2026-02-08 09:15] startup-tuning (12 msg, 18m)
   ...配置 redis cluster...
```

### 载入续聊

```bash
hermes /load redis-perf-fix
```

或在 TUI：
```
> /load 1
```

直接接着 4 月 15 号那次对话继续聊，Hermes 当时的所有 context 都恢复。

### 在普通对话里隐式搜

不用显式 `/search`。Hermes 自己会用：

```
你: 之前那个 redis 性能问题最后怎么解决的？

Hermes (内部): 调 memory.search("redis 性能") → 找到 2026-04-15 session
Hermes: 4 月 15 号你改了 maxmemory-policy 从 noeviction 到 allkeys-lru,
       同时把 evict 触发阈值从 100% 调到 85%，问题解决。
```

::: tip FTS5 索引文件
存在 `~/.local/share/hermes/sessions.db`。100 万条对话占约 200MB，性能仍 < 100ms 查询。
:::

## 19.4 第 3 层: memory.md（长期事实）

`~/.hermes/memory.md` —— 你的"个人事实库"，markdown 自由格式。

例子：
```markdown
# 长期记忆

## 主人基本
- 张三，1990 年生，北京
- 独立开发者，做 ai-learning-docs 项目

## 偏好
- 早起 6:30，咖啡只喝美式不加奶糖
- 不吃花生（过敏）
- 健身周一三五

## 工作
- 主语言: TypeScript / Python / Go
- 当前项目: ai-learning-docs (持续维护)
- 紧急任务: some-app demo（5/23 截止）

## 重要联系人
- 老板 王总: 技术问题找
- 直属 boss 李总: 日常对接

## 偏好的工具 / 服务
- 编辑器: Neovim + LunarVim
- 终端: Alacritty + Tmux
- 浏览器: Firefox + uBlock
- 笔记: Logseq
```

Hermes 调用 LLM 前**自动**把 memory.md 注入 prompt（不是全部，按相关性挑）。

### 自动 vs 手动添加

#### 自动
LLM 听到关键信息会调 `memory.append(...)` 写入。例如你说"我对花生过敏"，自动追加。

#### 手动

```bash
hermes memory add "我下个月要去日本出差"
```

或直接编辑：
```bash
nvim ~/.hermes/memory.md
```

### 让 Hermes 忘掉

```bash
hermes memory forget "花生过敏"
# 或
> /forget 花生过敏
```

会在文件里 mark 为"forgotten"，下次不再注入。

## 19.5 第 4 层: user.md（偏好画像）

`~/.hermes/user.md` —— 比 memory 更高层的"我是怎样的人"。

例子：
```markdown
# 用户画像

## 沟通风格
- 偏好简洁直接，不喜欢"在这个问题上"这种废话
- 接受适度自嘲 / 段子（但工作场景克制）
- 拒绝 emoji 滥用（每段最多 1 个）

## 知识背景
- 技术深度: 资深（10+ 年）
- 语言: 中文母语，英文阅读专业级
- 不熟悉的领域: 法律、医疗、金融

## 决策模式
- 数据驱动 > 直觉
- 偏好 reversible 的小步实验
- 接受 50% 不完美换 80% 速度

## 教学偏好
- 喜欢类比 / 比喻而非纯抽象
- 看代码示例比看文字描述快
- 不喜欢被 hand-hold（嫌啰嗦）

## 常见 frustrations
- AI 说"我不能做这个"但其实能
- 装很多依赖才能用
- 过长的"礼貌"开场白
```

Hermes 看完这个，会**自动调整**回答风格——直接、给代码、不写废话。

### 自动生成

跑一阵后让 Hermes 总结：

```bash
hermes user-profile generate
```

它会根据你过去 N 次对话自动写一份。你 review 后保存。

### 手动调整

直接编辑 `user.md`。改完立刻生效。

## 19.6 第 5 层: Honcho（最深的层）

[Honcho](https://honcho.dev) 是 Plastic Labs 出的开源**用户建模** SDK。

### 它干啥

不是简单存"用户偏好"——它**持续推断**用户的：
- 沟通模式（话长短、句式、emoji 频率）
- 决策风格（保守 / 激进、依赖数据 / 直觉）
- 知识盲区（哪些概念你听了反应慢）
- 情绪倾向（哪种话题让你兴奋 / 烦躁）
- 关注重心（最近一周聊得最多的）

### 怎么用上

Hermes 出厂自带 Honcho 集成。每次对话**自动**喂数据 Honcho 训练。

启动后约**两周**Honcho 模型成熟，明显感觉 agent "更懂你"。

### 查看 Honcho 推断

```bash
hermes memory honcho profile
```

输出（示例）：
```
🧬 Honcho user profile (trained on 234 sessions)

Communication
  Avg message length: 35 chars (concise)
  Question ratio: 0.42
  Emoji density: 0.05 (low)
  Code block frequency: 0.31 (high)

Knowledge depth
  Technical: ★★★★★ (Senior)
  Domain expertise: Python > TypeScript > Go > Rust
  Weak areas: legal, medical, finance

Decision style
  Risk tolerance: medium-low
  Evidence preference: data-driven (0.78 / 1.0)
  Reversibility preference: high

Engagement patterns
  Most active: 10:00-12:00, 22:00-23:30
  Topics this week: AI agents, vim plugins, hermes
  Topics declining: react components

Frustrations (inferred)
  - Verbose explanations
  - Overly cautious AI responses
  - Setup complexity
```

::: tip 这才是 Hermes "growth" 的真意
不是字面意义上 LLM 升级——而是 Hermes **对你的理解模型**在长大。
:::

### 隐私

Honcho 数据存在 `~/.local/share/hermes/honcho.db`。**完全本地，不出网**（除非你主动 backup 到云）。

### 重置 Honcho

```bash
hermes memory honcho --reset
```

如果你觉得它"画像偏了"，可以重置重新学。

## 19.7 双压缩 + Anthropic prompt caching

Hermes 的两大成本优化技术。

### 双压缩（Dual Compression）

```yaml
memory:
  optimization:
    dual_compression: true
    compression_levels:
      light: pruning           # 去重 / 删空白
      heavy: summarization     # LLM 摘要
    summary_model: deepseek/deepseek-chat
    summary_threshold_tokens: 4000     # 超 4K 时压缩
```

效果：
- 50 轮对话 prompt 50K → 实际 8K
- 摘要用便宜模型，省 90% 摘要成本

### Anthropic Prompt Caching

如果用 Claude，**强烈建议开**：

```yaml
llm:
  providers:
    anthropic:
      prompt_caching: true
      cache_ttl: 5m
```

效果：
- system prompt / 长记忆 / skill 列表的部分**只收 1/10 费用**
- agent 多轮对话**省 70-90% 成本**
- 速度也快（cache hit 延迟 < 100ms）

## 19.8 多 agent 共享 memory

跨 agent 共享个人事实，但各自有独立画像：

```yaml
memory:
  shared:
    - memory.md            # 个人事实共享（花生过敏所有 agent 都知道）
    - user.md              # 偏好共享
  per_agent:
    - skills               # skill 各管各的
    - honcho               # 画像各管各的（工作 agent 和家庭 agent 画像不同）
```

## 19.9 备份记忆

记忆是你的"数字大脑"——丢了就重头来。

```bash
# 全备份
tar -czf hermes-mem-$(date +%F).tar.gz \
  ~/.hermes/memory.md \
  ~/.hermes/user.md \
  ~/.hermes/skills/ \
  ~/.local/share/hermes/

# 或用 Hermes 内置
hermes memory export --output hermes-mem.tar.gz
```

### 跨设备同步

适合多设备用 Hermes（笔记本 + 台式 + 服务器）：

```bash
# 用 git
cd ~/.hermes
git init
git add memory.md user.md skills/
git commit -m "..."
git remote add origin <private-repo>
git push
```

**只同步 markdown，不同步 .db**（Honcho / FTS5 数据太大）。

## 19.10 常见问题

### Q：Hermes 没记住我说过的事
**清单**：
1. `hermes memory list` 看 memory.md 有没有相关条目
2. 没有 → LLM 没决定 append。手动 `hermes memory add "..."`
3. 有 → 看 retrieval threshold 是不是太高

### Q：memory.md 越来越大
**修复**：定期归并精简。
```bash
hermes memory compact
# 把相关条目合并，删过时的
```

### Q：Honcho 推断好像偏了
**修复**：
```bash
hermes memory honcho --reset
```
或手动改 user.md 强制覆盖。

### Q：FTS5 搜索结果不相关
**修复**：重建索引
```bash
hermes memory rebuild-index
```

---

## 看完这一章你应该知道

✅ 5 层记忆: Working / Session / memory.md / user.md / Honcho
✅ FTS5 让 100 万对话都能秒搜
✅ memory.md 手动编辑随时生效
✅ Honcho 自动学你的沟通风格、决策模式
✅ 双压缩 + prompt cache 省 70-90% 成本
✅ memory 跨设备同步用 git（只同步 .md）

---

**下一步**：[20. MCP 协议接入 →](/hermes/advanced/mcp)

记忆让 Hermes 懂你，MCP 让它能接入更多外部工具。
