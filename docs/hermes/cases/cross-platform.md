# 27. 案例 3：跨平台对话连续

::: info 这个案例你将体验
**同一段对话在 3 个平台无缝接续**：
- 早上 Telegram 起话
- 中午 Signal 在外面接着
- 下午 CLI 收尾

全程：
- 同一个 Hermes agent
- 同一份记忆
- 上一句的 context 还在
- 不用复述

OpenClaw 也能做类似，但 Hermes 的 Honcho 记忆深度更上一层。
:::

## 27.1 整体架构

```
你的 Hermes 实例（跑在家里 / 云上）
        ↑↓
    Gateway 统一管理
        ↑↓ 同一个 agent
   ┌──────────────────────────┐
   ↓        ↓        ↓        ↓
Telegram  Signal   Slack    CLI
```

所有平台共享 Hermes 的：
- working memory（当前对话上下文）
- session memory（FTS5 历史）
- memory.md / user.md（个人事实）
- Honcho（用户建模）

平台只是**入口**，不影响 agent 状态。

## 27.2 配置三个平台

```bash
# Telegram
hermes platform add telegram

# Signal
hermes platform add signal

# CLI 不用配，hermes 命令直接用
```

确保配置：
```yaml
# ~/.hermes/config.yaml
platforms:
  telegram:
    default_agent: default
  signal:
    default_agent: default
  cli:
    default_agent: default
```

**关键**：3 个平台都路由到同一个 `default` agent。

## 27.3 实测对话

### 早 9:00 Telegram

```
你: （手机 Telegram）今天有几件事：
1. 准备 demo 修改方案
2. 跟客户 X 确认下周时间
3. 找王总同步项目进度

帮我把这 3 件事排个优先级，下午 3 点前要完成哪几个？

Hermes:
（短暂思考）
建议顺序：
1. 🔴 (P0) 跟客户 X 确认时间 — 涉及下周日程，先做
2. 🟡 (P1) 找王总同步 — 关键决策依赖
3. 🟢 (P2) demo 修改方案 — 你自己能控制节奏

下午 3 点前必做: 1 和 2 (估计 1 小时)
3 可以放今晚或明天。

要我帮你 draft 给客户 X 的消息吗？
```

### 中午 12:30 Signal

（你在外面吃饭，电脑没带）

```
你: （手机 Signal）刚跟客户 X 通话了，他建议下周三 14:00
   王总那边还没找到他，他在飞机上

Hermes:
（同一份记忆，知道你早上说的事）
好的更新:
✅ 客户 X 时间确认: 下周三 14:00
⏳ 王总同步暂搁置（在飞机）→ 等他落地通知我

我把客户 X 的时间加进你日历了，
要不要现在 draft 一份 demo 修改方案的 outline，
等王总有空时直接发给他？
```

注意它**记得早上的事**——没让你复述。

### 下午 16:00 CLI（你回家了）

```
你: （家里电脑 hermes CLI）王总刚好上线，
   你给我准备下要跟他说的要点

Hermes:
（继续上下文）
要跟王总说的:
1. 客户 X 下周三 14:00 demo 确认了 ←今天搞定的
2. 当前 demo 修改方案 (已 draft outline，3 个方向):
   - 方向 A: 强化 X 功能演示
   - 方向 B: 加入客户场景案例
   - 方向 C: 简化技术细节
3. 需要他拍板的 2 个问题:
   - 是否邀请 PR 同事一起？
   - 客户希望我们准备 backup demo 吗？

要不要把这份摘要发飞书给王总？或者你直接读给他听？
```

**全程一气呵成**，每个平台都接得上前面。

## 27.4 怎么做到的

### 1. Single Source of Truth

所有平台都连同一个 Hermes Gateway 进程。Gateway 把消息丢给同一个 agent。

### 2. 记忆全局共享

```yaml
memory:
  scope: global             # 不区分平台
  shared:
    - working
    - session
    - memory.md
    - user.md
    - honcho
```

### 3. 用户身份关联

不同平台你的身份不同（Telegram user_id vs Signal phone vs CLI local user）。配关联：

```yaml
# ~/.hermes/config.yaml
identity:
  primary_user: zhangsan
  aliases:
    - platform: telegram
      id: 123456789
    - platform: signal
      number: "+86138xxxx"
    - platform: cli
      user: $USER
```

不同平台来的消息，Hermes 知道**都是你**。

### 4. Honcho 跨平台学习

Honcho 学到的"你"也是全局的——你在 Telegram 言简意赅，CLI 里啰嗦，Hermes 都知道这是同一个人不同心情。

## 27.5 常见误区

### ❌ "我开两个 agent 一个接 Telegram 一个接 CLI"
分开就丢了记忆共享。**1 个 agent 接所有平台**才对。

### ❌ "每个平台独立 memory"
对私密场景有用（如工作 agent 不该看到家庭对话）。**但跨平台连续的前提是共享 memory**。

### ❌ "Hermes 应该自动认出我在不同平台"
不是自动。**必须配 `identity.aliases`**。

## 27.6 隐私边界

某些平台的对话不想全局共享？

```yaml
platforms:
  signal:
    memory_scope: private        # 这个 platform 的对话只入这平台 memory
  telegram:
    memory_scope: global         # 共享
```

或单条对话 opt-out：
```
> /private 这段不要记
（接下来的对话不入 memory）
> /resume
（恢复正常）
```

## 27.7 多设备同步

如果你的 Hermes 跑在 VPS / 自家服务器，那笔记本 / 手机 / 平板都通过 Gateway 远程访问，自然同步。

如果跑多个 Hermes 实例（公司 + 家里），可以同步 memory：

```bash
# 公司机器
hermes memory export --output workplace.tar.gz

# 家里机器
hermes memory import workplace.tar.gz --merge
```

但 Honcho 数据库不建议合并（容易冲突）——**最好只跑一个 Hermes 实例**。

## 27.8 适用场景

✅ 日常工作连续场景（早上 Telegram → 公司 Slack → 家里 CLI）
✅ 跨设备临时记事（手机起、电脑接）
✅ 团队协作（飞书继续 CLI 的话题）

❌ 严格分割工作 / 私生活的人（建议两个 agent）
❌ 多人共用（每人单独 agent + memory）

## 27.9 隐私警告

**全局共享 memory 意味着**：
- 工作的事 → 家里 Telegram 也能聊出来
- 家里事 → 公司 CLI 里 Hermes 也"知道"
- 万一某平台被入侵 → memory 全泄露

敏感分离用：
```yaml
memory:
  scope: per_agent
agents:
  work-agent:
    platforms: [slack, work-email]
  personal-agent:
    platforms: [telegram, signal]
```

工作和个人完全隔离。

---

## 看完这个案例你应该会

✅ 一个 Hermes 实例 + 多平台共享一个 agent
✅ 配 `identity.aliases` 关联多平台身份
✅ memory.scope 全局 / 私有 / per_agent 控制共享粒度
✅ 跨平台对话无需复述，体验丝滑
✅ 注意隐私边界，敏感场景做隔离

---

**下一步**：[28. 案例 4：个人知识库构建 →](/hermes/cases/knowledge-base)

下一个案例：FTS5 + Honcho 打造你的"第二大脑"。
