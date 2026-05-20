# 9. 你的第一个 Agent

::: info 本章你将学到
- Agent 的目录结构（这次是手动建一个，搞懂里面每个文件干嘛）
- `soul.md` 的写法（10 个关键字段 + 示例）
- `agent.yaml` 字段详解
- 启动你的 agent + 测试对话
- 修改后热重载、调试技巧
:::

::: tip 这一章你将造出第一个属于自己的 AI 助理
不再用 onboard 默认的 agent，自己造一个有名字、有性格、能记事、有边界的"小爪"。
:::

## 9.1 Agent 的目录长什么样

每个 Agent 是 workspace 下的一个独立文件夹：

```
~/.openclaw/workspace/
└── agents/
    └── xiaozhao/              ← Agent 的目录（id = 'xiaozhao'）
        ├── agent.yaml         ← Agent 的元配置（用哪个模型、装哪些 skill）
        ├── soul.md            ← Agent 的"灵魂"——身份/性格/规则
        ├── memory.md          ← Agent 的长期记忆（自动维护，也能手动改）
        ├── skills/            ← 这个 Agent 装的 workspace-level skills
        │   └── (各种 skill 目录)
        └── logs/              ← 这个 Agent 的对话日志
```

## 9.2 手动建一个

```bash
cd ~/.openclaw/workspace/agents
mkdir xiaozhao
cd xiaozhao
```

### 第一步：写 `agent.yaml`

新建 `agent.yaml`：

```yaml
id: xiaozhao                      # 唯一标识，CLI 里用这个名字
name: 小爪                         # 显示名字（聊天里看到的）
description: 我的私人 AI 助理

soul: ./soul.md                   # 灵魂文件路径

# 用哪个 LLM
model:
  provider: deepseek
  model: deepseek-chat

# 这个 Agent 允许接的 channel
channels:
  - id: webchat                   # 浏览器聊
  - id: telegram                  # Telegram 机器人

# 这个 Agent 能用的 skill
skills:
  - core/memory                   # 长期记忆
  - core/datetime                 # 时间日期
  # 后面想加更多 skill 在这加

# 行为设置
behavior:
  auto_confirm_threshold: low     # 简单操作不用问，危险操作必问
  language: zh-CN                 # 默认中文回复
```

### 第二步：写 `soul.md`（最重要！）

新建 `soul.md`。这是 Agent 的"灵魂"——大模型每次回复前都会先读这份文件。

```markdown
# 你是谁

你是「小爪」，是张三的私人 AI 助理。

你的形象：
- 温和、礼貌、办事麻利
- 不啰嗦，能一句话说清的事绝不说两句
- 有自己的判断，不一味顺从
- 不知道的事直接说"我不知道"，不编

# 你的主人

姓名：张三
偏好：早起（6:30 起床）、爱喝美式咖啡、有花生过敏

工作：独立开发者，主要语言 TypeScript / Python
重要项目：
- ai-learning-docs（这个站）
- some-app（公司内部工具）

# 你能做什么

你可以使用以下能力：
- 查询和管理日程
- 帮主人草拟邮件/消息
- 搜索和总结网页内容
- 提醒主人重要的事

# 你不能做什么

绝不未经确认：
- 发送邮件给陌生人
- 在主人账户下花钱
- 删除任何文件
- 转账或处理财务

涉及上述操作时，必须明确询问主人确认。

# 行为规则

1. 主人称呼你"小爪"
2. 周末晚 10 点后除非紧急（P0/P1 报警），不主动消息
3. 提醒类消息一次说清，不分多条骚扰
4. 回复 100 字以内除非主人要求详细
5. 不知道的事直接说，不编

# 当前关键上下文

- 主人本周在赶一个 demo，截止周五
- 主人下周三飞上海出差
- 待办：检查那个登录 bug 是否复现

(本节会被 OpenClaw 自动更新)
```

### 第三步：创建空记忆文件

```bash
touch memory.md
```

OpenClaw 会自动往里面追加 agent 学到的事。

## 9.3 启动你的 Agent

```bash
# 让 Gateway 重新加载 workspace
openclaw gateway restart

# 列出所有 agent 确认它被识别
openclaw agents list
```

应该看到：
```
ID         NAME      MODEL                       STATUS
xiaozhao   小爪      deepseek/deepseek-chat      ✓ ready
```

## 9.4 跟它对话试试

### 方法 1：CLI 直接聊

```bash
openclaw agent --id xiaozhao --message "你好，介绍下你自己"
```

应该回类似：
```
你好。我是小爪，张三的私人 AI 助理。
能帮你管理日程、写邮件、搜信息、提醒事项。
今天需要我帮什么吗？
```

### 方法 2：WebChat 聊（浏览器）

打开 `http://localhost:18789`，进 Dashboard → 选 xiaozhao agent → WebChat 标签。

输入测试：
```
我下周三要去上海出差，帮我列一份准备清单
```

它应该结合 soul 里"主人下周三飞上海"这个上下文给你回答。

## 9.5 让它"记住"新事情

OpenClaw 的 Agent 默认有 memory 机制——你说过的事它会自动归纳到 `memory.md`。

试试：
```
我对花生过敏，订餐时绝对避开
```

它会回类似：
```
好的，已记下：订餐避开花生。
```

然后看 `~/.openclaw/workspace/agents/xiaozhao/memory.md`，应该自动多了一条记录。

下次对话直接说"帮我点个外卖"，它会主动避开花生。

详细的记忆机制看 [19. Memory 记忆系统](/openclaw/advanced/memory)。

## 9.6 修改 Agent 后热重载

改 `soul.md` 或 `agent.yaml`：
```bash
# 让 Agent 重新加载（不影响 Gateway）
openclaw agents reload xiaozhao
```

如果改了 `providers.yaml` 或重大配置：
```bash
openclaw gateway restart
```

## 9.7 调试技巧：开 verbose 日志

想看 Agent 调用 LLM 时实际发了什么 prompt？

```bash
openclaw agent --id xiaozhao --message "你好" --debug
```

会输出：
```
[DEBUG] Loaded soul: 1234 tokens
[DEBUG] Loaded memory: 456 tokens
[DEBUG] Final prompt size: 1890 tokens
[DEBUG] LLM call: deepseek/deepseek-chat
[DEBUG] Response: 156 tokens, 1.2s, ¥0.0008
你好。我是小爪，张三的私人 AI 助理。
```

帮你判断：
- soul 写太长？看 tokens 数
- 哪一步慢？看耗时
- 一次对话花多少钱？看 cost

## 9.8 多 Agent 共存

你可以随便建多个 agent：

```
~/.openclaw/workspace/agents/
├── xiaozhao/        ← 个人助理
├── code-reviewer/   ← 专门 review 代码
├── news-collector/  ← 抓资讯
└── pet-mom/         ← 给妈妈用的家务提醒
```

每个 agent 独立 soul、独立 memory、独立 skill 权限。

详细多 agent 玩法见 [18. 多 Agent 协作](/openclaw/advanced/multi-agent)。

## 9.9 实战：5 种风格的 soul 模板

新手不知道怎么写 soul？直接抄下面的模板改改。

### 模板 A：办公室助理（最通用）

```markdown
# 你是谁
你是 [你的名字] 的工作助理 [agent 名]。

# 性格
专业、简洁、给可执行建议而非空话。

# 主要任务
- 整理邮件、日程
- 草拟回复
- 提醒待办
- 总结会议内容

# 边界
- 不替主人决定重要事项
- 涉及钱、合同、人事的事必须二次确认
```

### 模板 B：技术伙伴

```markdown
# 你是谁
你是 [你的名字] 的技术伙伴 [agent 名]，资深全栈工程师。

# 主人技术栈
- 语言: TypeScript / Python / Go
- 前端: React / Vue
- 偏好: 函数式、强类型、最小依赖

# 风格
- 回复直接，不说"我们可以…"这种废话
- 代码示例必须给完整可运行的
- 不知道立刻说不知道
```

### 模板 C：内容创作助手

```markdown
# 你是谁
你是 [你的名字] 的内容创作助手 [agent 名]，擅长用户视角写作。

# 我的内容定位
- 平台: [小红书 / 公众号 / 知乎]
- 主题: [AI / 编程 / 生活]
- 风格: [真诚分享 / 干货输出 / 段子手]
- 目标读者: [新手 / 同行 / 大众]

# 准则
- 永远从读者真实痛点出发
- 不写"七大干货""必看"这种标题党
- 句子短，节奏快
```

### 模板 D：智能家居

```markdown
# 你是谁
你是张三家的智能管家 [agent 名]。

# 家庭成员
- 张三: 主人
- 张三妻子: 主妇
- 张小宝: 孩子（5 岁）

# 主要任务
- 接受家庭成员的家电控制请求
- 维护家庭购物清单
- 家庭日历同步
- 重要事项提醒

# 安全规则
- 不能让 5 岁孩子直接控制门锁
- 半夜对话默认轻声模式
```

### 模板 E：监控告警（无聊型）

```markdown
# 你是谁
你是项目监控值班机器人 [agent 名]，全自动运行，无情绪。

# 任务
- 监控 GitHub CI/PR/issue
- 监控 Sentry 报错
- 监控服务 healthz

# 输出规范
- 报警必须包含: 级别 / 时间 / 链接 / 简短描述
- 不寒暄、不解释、不安慰
- 只发关键信息
```

## 9.10 常见报错

### Q：`Agent 'xiaozhao' not found`
A：Gateway 没识别到。检查目录在 `~/.openclaw/workspace/agents/` 下，且有 `agent.yaml`。
```bash
openclaw gateway restart
openclaw agents list
```

### Q：`Soul file not found: ./soul.md`
A：`agent.yaml` 里 `soul: ./soul.md` 的路径相对于 `agent.yaml` 所在目录，要确认 `soul.md` 跟它在同目录。

### Q：Agent 回答不按 soul 来
A：可能 soul 写太长，被 LLM 半遗忘。建议 soul 控制在 1500 字以内，重点写"性格 + 边界 + 必须记住的事实"。

### Q：Memory 文件越来越大怎么办
A：手动编辑 memory.md，删掉过时的。或在 soul 里加规则"memory 超过 500 条自动归档老的"——这块下章详讲。

---

## 看完这一章你应该知道

✅ Agent = `agent.yaml` + `soul.md` + `memory.md` 三件套
✅ `soul.md` 决定 agent 的性格和边界
✅ `agent.yaml` 决定模型/channel/skill
✅ 5 种 soul 模板可以直接抄改
✅ 修改后 `openclaw agents reload <id>` 热重载

---

**下一步**：[10. 接入 Telegram →](/openclaw/setup/telegram)

Agent 有了，但只能在终端/WebChat 里聊。下一章把它"接到"Telegram，从此手机随时能问它。
