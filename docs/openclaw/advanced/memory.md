# 19. Memory 记忆系统

::: info 本章你将学到
- 为什么 LLM "金鱼脑"必须靠 Memory 系统救
- OpenClaw 三层记忆架构（工作 / 会话 / 长期）
- memory.md 文件怎么读 / 怎么手动改
- 记忆抽取策略：什么进 memory，什么不进
- 记忆检索策略：每次对话怎么"从一堆 memory 里找相关的"
- 实战：让 Agent 记住主人 50+ 件偏好
:::

## 19.1 为什么需要 Memory

**LLM 本身没有记忆**——每次 API 调用都是"全新对话"。

如果你刚跟 ChatGPT 说"我对花生过敏"，关掉再开，它完全不记得。这就是"金鱼脑"。

OpenClaw 在 LLM 外面包了一层 **Memory 系统**——每次调用 LLM 前，把"相关的历史信息"主动塞进 prompt，假装 LLM 记得你。

::: tip 一个比喻
没 Memory 的 LLM = 每天上班失忆的同事
有 Memory 的 LLM = 一个有"记事本"的同事，每天上班翻一翻就知道昨天聊到哪了
:::

## 19.2 三层记忆架构

```
┌──────────────────────────────────────────────┐
│  长期记忆 (Long-term)                         │
│  ├─ Soul 里的固定事实                         │
│  └─ memory.md 里持续累积的事实                 │
│  范围: 永久                                   │
│  例: "主人对花生过敏"                          │
├──────────────────────────────────────────────┤
│  会话记忆 (Session)                           │
│  └─ 最近 N 次对话的关键摘要                   │
│  范围: 数天到数周（可配置）                   │
│  例: "上周三聊过北京出差的事，已定酒店"        │
├──────────────────────────────────────────────┤
│  工作记忆 (Working)                           │
│  └─ 当前这次对话的完整上下文                  │
│  范围: 当前对话                               │
│  例: "5 分钟前你说'帮我订餐'"                  │
└──────────────────────────────────────────────┘
```

每次 LLM 调用，OpenClaw 会**合并这三层**装进 prompt：
```
[soul.md 内容]
[相关的长期记忆 N 条]
[相关的会话记忆 M 条]
[当前对话的最近 K 轮]
[用户这一条消息]
```

## 19.3 memory.md 长什么样

文件位置：`~/.openclaw/workspace/agents/<agent-id>/memory.md`

例子：
```markdown
# Long-term Memory for xiaozhao

## 主人偏好
- 主人对花生过敏（2026-03-15 学到）
- 主人喝美式咖啡，不加糖（2026-04-02）
- 主人作息：早 6:30 起、晚 11 点睡（2026-04-10）

## 工作
- 主要项目：ai-learning-docs（持续维护）
- 项目 some-app 的 demo 截止 2026-05-23（紧急）

## 家庭
- 配偶：张三妻子（飞书 ou_xxxx）
- 孩子：张小宝，5 岁
- 父母联系频率：每周日下午电话

## 重要联系人
- 老板 王总（ou_yyy）：技术问题找他确认
- 直属 boss 李总（ou_zzz）：日常对接

## 第三方账号偏好
- 默认订餐平台：美团（主人偏好）
- 默认出行：滴滴
```

它就是一个 Markdown 文件——**你可以手动改**。

## 19.4 记忆是怎么"自动"加进去的

OpenClaw 装了 `core/memory` skill 后，每次对话结束 LLM 会主动判断：
> 这次对话里有没有"应该长期记住的事"？

如果有，调用 `memory.append()` 写进 memory.md。

### 触发记忆抽取的常见信号

LLM 看到这类话会想"记下来"：
- 用户直接说："记一下：xxx"
- 用户表达稳定偏好："我喜欢/不喜欢/总是/从来不"
- 用户提到重要事实："我家狗叫旺财"
- 用户更正信息："不是 5 点，是 5 点半"

### 不会被记的

- 一次性问答："今天天气？"
- 临时上下文："这个 bug 怎么改"
- 已知的事重复说

::: tip 怎么强制记
对 agent 直接说：
```
请把这件事记到长期记忆里：我每周三晚 7 点和老婆约会，那天不要 ping 我。
```
:::

### 怎么强制忘

```
请从长期记忆里删掉关于咖啡偏好的条目。
```

或手动改 memory.md。

## 19.5 怎么把记忆"塞进" prompt（检索策略）

memory.md 可能有几百上千条。每次对话只能塞**相关**的几条进 prompt（不然太长 + 贵）。

OpenClaw 默认用 **embedding + 余弦相似度**：

```
1. memory.md 的每一条记忆，事先转成 embedding（数学向量）
2. 用户这一条消息也转 embedding
3. 余弦相似度排序
4. 取 top N（默认 10 条）塞进 prompt
```

### 配置检索策略

```yaml
# agent.yaml
memory:
  retrieval:
    strategy: embedding         # embedding（推荐）/ keyword / hybrid / all
    top_n: 10                   # 取最相关 10 条
    similarity_threshold: 0.5   # 相似度低于 0.5 的不要
    embedding_model: bge-base   # 用哪个 embedding 模型
```

### 4 种检索策略对比

| 策略 | 效果 | 速度 | 成本 |
|---|---|---|---|
| `all` | 把所有 memory 塞进 prompt | 完美 | 慢，贵 |
| `keyword` | 用关键词匹配 | 一般 | 快，免费 |
| `embedding` | 语义相似度匹配 | 好 | 中，少量调 embedding API |
| `hybrid` | embedding + keyword 双路 | 最好 | 中等 |

**新手用默认 `embedding`** 即可。memory 超过 500 条时建议 `hybrid`。

## 19.6 工作记忆的细节

工作记忆 = 当前对话的最近几轮。

```yaml
memory:
  working:
    max_turns: 20            # 最近 20 轮对话进 prompt
    summarize_after: 10      # 超 10 轮时，老的自动总结成 1 段
```

### 自动总结机制

对话 30 轮后：
- 最近 10 轮：完整保留（"还热乎"）
- 第 11-30 轮：被 LLM 自动总结成一段摘要

避免 prompt 越聊越长爆 context window。

## 19.7 会话记忆

会话记忆 = 最近 N 天的对话摘要。

```yaml
memory:
  session:
    retention_days: 30        # 保留 30 天
    summarize_per_session: true   # 每次对话结束自动总结
```

例子（一个 session 的摘要）：
```
[2026-05-15 21:30] 用户报告项目 demo 准备问题，
列出 3 项待办：A 录屏脚本、B 数据准备、C 演讲稿练习。
约定周三晚 8 点 review。
```

下次跟 agent 说"上次聊到哪了？"，它能精准答上。

## 19.8 多 agent 共享 memory

两个场景需要共享：

### 场景 A：家里所有 agent 共享"主人偏好"

```yaml
# global.yaml
shared_memory:
  - id: family-facts
    path: ~/.openclaw/workspace/shared-memory/family.md
```

每个 agent 配：
```yaml
# agent.yaml
memory:
  use_shared:
    - family-facts
```

任何一个 agent 学到的"花生过敏"都会进 family.md，所有 agent 都能查到。

### 场景 B：互不干扰

不配 `use_shared`，每个 agent 自己一份 memory.md。例：
- 工作 agent 不该知道家里事
- 家庭 agent 不该知道公司机密

## 19.9 实战：让 Agent 记住主人 50+ 件偏好

### 第一步：初始 memory 模板

手写一份初始 memory.md 给 agent 一个起点：

```markdown
# 长期记忆

## 个人基本
- 姓名：张三
- 生日：1990-05-18
- 城市：北京海淀
- 职业：独立开发者

## 偏好
- 早起，6:30 起床
- 喜欢美式咖啡（不加糖、不加奶）
- 健身：每周一三五 19:00-20:30
- 阅读偏好：技术 + 投资 + 心理学

## 过敏 / 禁忌
- 花生 ❌
- 海鲜 ⚠️（少量可以）

## 工作偏好
- 番茄钟工作 25 分钟休 5 分钟
- 14:00-16:00 不开会（深度工作时段）
- 周五下午开放 1on1

## 项目
- 当前主要项目：ai-learning-docs
- 紧急项目：some-app demo（5 月 23 截止）

## 家庭
- 配偶：xx
- 孩子：xx，5 岁
- 父母：xx, xx

## 重要联系人
- 老板 王总（ou_xxx）
- 直属 boss 李总（ou_yyy）

## 设备 / 服务
- Mac 主力机 + iPad Pro
- 偏好搜索引擎：DuckDuckGo
- 默认订餐：美团
```

### 第二步：让 agent "认领"这份记忆

```
@xiaozhao 我刚更新了你的长期记忆，请确认你读过 memory.md 里的所有内容。
```

agent 应该回复"已读到 X 条关键事实，记住了 a, b, c..."。

### 第三步：日常自动累积

agent 会在后续对话中自动追加新事实。一个月后你的 memory.md 可能涨到 100+ 条。

### 第四步：定期 review

```bash
# 看 memory 状态
openclaw memory list --agent xiaozhao --count

# 删过时的条目
openclaw memory remove --agent xiaozhao --id mem_xxx

# 或直接 vim memory.md 手动整理
```

::: tip 建议每月清一次
memory 越长，每次对话注入的 token 越多。100 条以内体验最佳，超 200 条建议手动归并精简。
:::

## 19.10 隐私 / 安全

memory.md **明文存放**——任何能读你机器的人都能看到。

### 推荐做法

- ✅ 默认 `.openclaw` 目录设 700 权限：`chmod 700 ~/.openclaw`
- ✅ 不写极敏感信息（如密码、身份证号）
- ✅ 加密备份（如用 `gpg` 加密导出文件）
- ❌ 不要 push 到 GitHub
- ❌ 不要在多人共用电脑上裸跑

### 真正敏感的事用"secret skill"管

```bash
openclaw skill install secrets-vault
```

这个 skill 把敏感信息加密存（master password 解锁），agent 用时按需解密。比裸 memory 安全。

---

## 看完这一章你应该知道

✅ Memory 是给 LLM "金鱼脑"加挂的笔记本
✅ 三层：工作（当下对话）/ 会话（最近几天）/ 长期（永久）
✅ memory.md 可以手动改、可以 reset
✅ 4 种检索策略，默认 embedding 够用
✅ 多 agent 可共享 memory（家庭场景）或隔离（工作 vs 家庭）
✅ 月度 review 维持 100 条以内最佳

---

**下一步**：[20. MCP 协议接入 →](/openclaw/advanced/mcp)

Memory 让 agent 记住事，MCP 让 agent 接入更多外部工具（数据库、API、远程系统）。
