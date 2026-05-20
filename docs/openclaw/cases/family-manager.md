# 34. 案例 10：家庭管家

::: info 这个案例你将搭出什么
家庭微信群里：
- 任何人说"晚上买番茄" → 加进购物清单
- 说"该交水电费啦" → 给负责人提醒
- "周末安排" → AI 帮排周末活动 + 通知所有人
- 每周日晚总结这周谁干了什么家务
- 5 岁孩子说"我饿了" → 自动给妈妈发消息

预计搭建：60 分钟。
:::

::: tip 适合的场景
- 你家用微信群 / 飞书群 / iMessage 群组
- 想替代 "便利贴 + 白板 + 各种提醒 APP"
- 想让爸妈 / 孩子 / 老人都能用（自然语言而不是 APP）
:::

## 34.1 用到的能力

- 家庭群 channel（飞书最稳，微信用 wechaty / 或企微外部好友替代）
- 共享 memory（家庭信息共享）
- 多人识别 + 角色区分
- 简单 KV 存储（购物清单）
- 自定义 skill：购物清单 / 家务排班

## 34.2 装 skill

```bash
openclaw skill install kv-store          # 简单数据持久化
openclaw skill install datetime-cn       # 国内日期相关（节假日 / 春节）
```

家庭购物清单 / 家务排班是自定义 skill，照 [17 章](/openclaw/advanced/write-skill) 写。

## 34.3 创建 jia-bao agent（家宝）

`agent.yaml`:
```yaml
id: jia-bao
name: 家宝
model:
  provider: deepseek
  model: deepseek-chat
soul: ./soul.md
skills:
  - core/memory
  - core/datetime
  - kv-store
  - shopping-list
  - chore-tracker
channels:
  - feishu                # 推荐
  # - wechat              # 如果用 wechaty
behavior:
  language: zh-CN
  auto_confirm_threshold: medium
```

`soul.md`:
```markdown
# 你是谁
家宝，是张三一家的智能管家。

# 家庭成员
- 张三 (爸爸, 主人, ID: ou_xxx)
- 王芳 (妈妈, ID: ou_yyy)
- 张小宝 (儿子, 5 岁, ID: ou_zzz)
- 张奶奶 (奶奶, 70 岁, ID: ou_aaa)

# 性格
温和、耐心、用大白话。对 5 岁孩子用更简单的话。

# 我能做的事

## 购物清单
- 任何人说"买 XX" / "记一下 XX" → 加进清单
- 说"购物清单" → 列出所有未买
- 说"买了 XX" → 标记已买

## 家务管理
- 谁干了什么家务 → 自动记录
- 周日晚总结这周家务分布
- 公平提醒下周该谁干啥

## 提醒
- 自然语言: "周四提醒爷爷吃药" → 加日历
- 周期: "每月 5 号交水电费" → 固定提醒

## 紧急情况
- 张小宝说"我饿了" / "我想妈妈" → 同时 ping 妈妈 + 奶奶
- 关键词识别: "受伤" / "不舒服" / "怕" → 立即升级到爸爸 + 妈妈

# 沟通边界
- 对大人: 简洁专业
- 对小宝: "宝宝你好呀～" 语气，回复短，多用 emoji
- 对奶奶: 大字、简单句、不用专业词

# 安全
- 不告诉小宝任何"危险"信息（药品、火源、出门一个人）
- 涉及金钱必须爸爸或妈妈确认
- 5 岁孩子说"我要叫外卖" / "我要买玩具" → 必须爸妈确认
- 不主动建议陌生人加入家庭群
```

## 34.4 自定义 skill: shopping-list

`skills/shopping-list/SKILL.md`:
```markdown
---
id: shopping-list
permissions: [file_read, file_write]
---

## Capabilities

### add(item: string, requester: string)
加一项到购物清单。

### list()
列出所有未买项。

### mark_bought(item: string, buyer: string)
标记已买。

### clear_old(days: int)
删除超过 N 天的旧项。
```

`handler.js`:
```javascript
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), 'list.json');

async function load() {
  try { return JSON.parse(await readFile(FILE, 'utf-8')); }
  catch { return { items: [] }; }
}
async function save(d) { await writeFile(FILE, JSON.stringify(d, null, 2)); }

export async function add(item, requester) {
  const d = await load();
  d.items.push({
    item, requester,
    added: new Date().toISOString(),
    bought: false
  });
  await save(d);
  return { ok: true, total_unbought: d.items.filter(i => !i.bought).length };
}

export async function list() {
  const d = await load();
  return d.items.filter(i => !i.bought);
}

export async function mark_bought(item, buyer) {
  const d = await load();
  const target = d.items.find(i => !i.bought && i.item.includes(item));
  if (!target) return { ok: false, error: '未找到' };
  target.bought = true;
  target.bought_by = buyer;
  target.bought_at = new Date().toISOString();
  await save(d);
  return { ok: true };
}
```

`chore-tracker` 类似，记录"谁洗了碗/谁拖了地"。

## 34.5 实际对话示范

### 加购物

```
妈妈: 家宝，晚上要买番茄和鸡蛋

家宝:
好的妈妈 ✅
已加入购物清单:
- 番茄 (妈妈)
- 鸡蛋 (妈妈)

现在清单: 5 项未买
```

### 列出清单

```
爸爸: 购物清单

家宝:
📝 当前清单 (5 项):
- 番茄 (妈妈, 今天)
- 鸡蛋 (妈妈, 今天)
- 厨房洗洁精 (奶奶, 昨天)
- 小宝奶粉 (爸爸, 3 天前)
- 卫生纸 (妈妈, 4 天前)
```

### 5 岁孩子用

```
小宝: 家宝家宝 我饿了 想吃饭

家宝:
小宝你好呀 ☺️
我已经告诉妈妈啦，妈妈马上来 💕
你先喝点水好不好？

(同时私聊妈妈:
📢 小宝说他饿了
- 时间: 11:23
- 现在还有 1 小时到饭点
- 要我提醒你提前做或者给小宝拿个饼干吗?)
```

### 周报

```
[周日 21:00 群里]
家宝:
📊 本周家务报告

🧹 大家干了啥
- 爸爸: 倒垃圾 ×7, 接小宝 ×3, 洗碗 ×2
- 妈妈: 做饭 ×14, 洗衣 ×3, 接小宝 ×4
- 奶奶: 买菜 ×5, 整理客厅 ×4, 看小宝 ×6

💡 观察
妈妈做饭次数最多 (14 次)，全家辛苦了 🙏
建议下周爸爸轮流做 2 顿，给妈妈减负。

📅 下周提醒
- 周三: 物业费缴费 (爸爸)
- 周五: 小宝幼儿园家长会 (妈妈)
- 周日: 奶奶生日 🎂 (全员)
```

## 34.6 紧急情况处理

soul 里规则：
```markdown
# 紧急词触发
检测到以下词，立即升级到爸妈:
- "受伤" / "流血" / "摔了"
- "不舒服" / "肚子疼" / "头疼"
- "怕" / "害怕"
- "陌生人"

发到爸妈私聊 (高优先级):
"⚠️ [谁] 在 [时间] 说了: [原话]
请立刻关注。"
```

## 34.7 多人识别

family-manager 通过 channel 的 user_id 自动识别说话人。soul 中 4 个家庭成员 ID 写明。

新成员加入家庭群：
```
家宝:
我不认识这位新朋友。爸爸或妈妈，能告诉我这是谁吗?

(等爸妈回:"这是表姐张红")

家宝: 好的，欢迎张红！我记下了。
(memory 自动追加: "张红 - 表姐, 偶尔来家里")
```

## 34.8 隐私保护

家庭事务可能涉及隐私。soul 加：

```markdown
# 隐私
- 不主动透露成员位置（除非紧急）
- 不记录涉及银行卡 / 身份证号 的对话
- 老人小孩对话不外发
- 任何成员说"删掉这条" → 立刻 forget
```

## 34.9 微信群接入风险

如果用微信家庭群（不是飞书 / 企微），用 wechaty 方案有封号风险。

**更安全的替代**：
1. 全家迁到飞书个人版（10 人以下免费）→ 用飞书 channel
2. 或用 iMessage（如果都是 iPhone）

详见 [23. 国内 channel 接入](/openclaw/china/channels)。

## 34.10 给老人 / 孩子的可访问性

- 用大字号回复
- 用 emoji 替代复杂概念
- 重要信息加语音 (TTS skill，让 AI 朗读)
- 紧急情况直接打电话 (twilio)

```yaml
# agent.yaml
behavior:
  user_specific:
    - user_id: ou_zzz       # 小宝
      style: simple-kid
      tts: true              # 自动朗读
    - user_id: ou_aaa       # 奶奶
      style: simple-elderly
      font_size: large
      tts: true
```

## 34.11 成本

按家庭日均 30 条对话：
- LLM: ¥0.05/条 × 30 = ¥1.5/天
- 月度: ¥45

替代各种 APP / 提醒服务 / 家庭沟通成本。

---

## 看完这个案例你应该会

✅ 多人识别 + 角色区分
✅ 自定义共享数据 skill（购物清单 / 家务）
✅ 不同成员不同沟通风格
✅ 紧急情况升级机制
✅ 老人 / 孩子的无障碍设计

---

## 🎉 10 个实战案例全部完成

至此你已经掌握了 OpenClaw 几乎所有的核心场景。
下面 3 章是**部署相关**——把你做好的 OpenClaw 长期跑起来。

---

**下一步**：[35. 本地 vs 云端 →](/openclaw/deploy/local-vs-cloud)

OpenClaw 跑在家里电脑还是云服务器? 对比 5 个维度做出选择。
