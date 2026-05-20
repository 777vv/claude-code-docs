# 17. 写你的第一个 Skill

::: info 本章你将学到
- Skill 目录结构（手把手建一个）
- SKILL.md 的 6 个关键字段
- 用 JavaScript 或 Python 写实际执行的代码
- 调试技巧：单测、加日志、迭代
- 案例：从零做一个"摸鱼度日历"skill
:::

::: tip 本章预计动手 30 分钟
跟着做完你会有一个真正自己写的 skill 跑在 OpenClaw 上。
:::

## 17.1 Skill 的最小结构

```
my-mooyu-calendar/
├── SKILL.md           ← 说明书（必需，告诉 LLM 怎么用）
├── handler.js         ← 实际执行代码（必需）
├── package.json       ← 依赖列表（如果用了第三方库）
└── README.md          ← 给人看的（可选）
```

就这么简单。

## 17.2 案例需求：摸鱼度日历

我们要写一个 skill，名叫 `mooyu-calendar`。功能：

```
用户问："今天能摸鱼吗"
↓
skill 计算：今天距下个法定节假日还有几天
↓
返回："距五一假期还有 3 天，再忍忍 ✨"
```

很实用是吧。开干。

## 17.3 第一步：建目录

```bash
cd ~/.openclaw/workspace/skills
mkdir mooyu-calendar
cd mooyu-calendar
```

## 17.4 第二步：写 SKILL.md（核心）

SKILL.md 是给 LLM 看的说明书。写好这个，LLM 才知道何时调你的 skill、怎么调、期待什么。

```markdown
---
id: mooyu-calendar
name: 摸鱼度日历
version: 1.0.0
author: 你的名字
permissions:
  - network         # 要联网拉节假日
description: 查询距下一个法定节假日还有多少天
---

# 摸鱼度日历

帮主人查"距离下一个法定节假日还有几天"，给疲惫的打工人一点希望。

## Capabilities

### days_until_holiday()

返回距离下一个中国法定节假日的天数和节日名。

**输入**：无

**输出**：
```json
{
  "days": 3,
  "holiday_name": "劳动节",
  "holiday_date": "2026-05-01",
  "encouragement": "再忍忍 ✨"
}
```

## When to use

当用户提到以下意图，调用本 skill：
- 今天能摸鱼吗
- 距离下次假期多久
- 还有几天放假
- 假期啥时候

## Examples

User: 今天能摸鱼吗？
Action: call days_until_holiday()
Response: "距五一假期还有 3 天，再忍忍 ✨"

User: 下个假期是啥时候
Action: call days_until_holiday()
Response: "下一个假期是劳动节（5 月 1 日），还有 3 天。"
```

::: tip 写 SKILL.md 的核心原则
- **写给 LLM 看，不是写给开发者看**
- 一定要有 `When to use` 节，列出触发关键词 / 意图
- `Examples` 越多越好，LLM 会模仿
- `Capabilities` 用清晰的函数签名 + JSON 输出格式
:::

## 17.5 第三步：写 handler.js（实际执行）

新建 `handler.js`：

```javascript
// 中国 2026 年法定节假日列表（实际项目可以拉 API）
const HOLIDAYS_2026 = [
  { name: '元旦',     date: '2026-01-01' },
  { name: '春节',     date: '2026-02-17' },
  { name: '清明',     date: '2026-04-04' },
  { name: '劳动节',   date: '2026-05-01' },
  { name: '端午节',   date: '2026-06-19' },
  { name: '中秋节',   date: '2026-09-25' },
  { name: '国庆节',   date: '2026-10-01' },
];

const ENCOURAGEMENTS = [
  '再忍忍 ✨',
  '马上就到 💪',
  '坚持下去 🌟',
  '快了快了 🎉',
  '加油打工人 ☕',
];

/**
 * 计算距离下一个法定节假日的天数
 */
export async function days_until_holiday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 找下一个未到的节假日
  const next = HOLIDAYS_2026
    .map(h => ({ ...h, dateObj: new Date(h.date) }))
    .filter(h => h.dateObj >= today)
    .sort((a, b) => a.dateObj - b.dateObj)[0];

  if (!next) {
    return {
      days: null,
      holiday_name: null,
      holiday_date: null,
      encouragement: '今年假期都过完啦，明年再战 🎊',
    };
  }

  const days = Math.ceil((next.dateObj - today) / (1000 * 60 * 60 * 24));

  return {
    days,
    holiday_name: next.name,
    holiday_date: next.date,
    encouragement: ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)],
  };
}
```

::: tip 函数名要和 SKILL.md 一致
SKILL.md 里写 `days_until_holiday()`，handler.js 里就 export 这个名字。
:::

## 17.6 第四步：写 package.json（如果没用第三方包可省略）

```json
{
  "name": "mooyu-calendar",
  "version": "1.0.0",
  "type": "module",
  "main": "handler.js"
}
```

如果你用了第三方包（如 `axios`），加 `dependencies`：

```json
{
  "name": "mooyu-calendar",
  "version": "1.0.0",
  "type": "module",
  "main": "handler.js",
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

然后 `cd` 进去跑 `npm install`。

## 17.7 第五步：让 agent 用上

`agent.yaml` 加：

```yaml
skills:
  - core/memory
  - mooyu-calendar       # ← 加这一行
```

reload：
```bash
openclaw agents reload xiaozhao
```

## 17.8 第六步：测试

```bash
openclaw agent --id xiaozhao -m "今天能摸鱼吗"
```

应该回：
```
距劳动节假期还有 3 天，再忍忍 ✨
```

🎉 你的第一个 skill 跑起来了！

## 17.9 进阶：用 Python 写 skill

OpenClaw 也支持 Python skill。在 `handler.py` 里写：

```python
from datetime import date

HOLIDAYS_2026 = [
    {"name": "元旦", "date": date(2026, 1, 1)},
    {"name": "春节", "date": date(2026, 2, 17)},
    # ...
]

def days_until_holiday():
    today = date.today()
    upcoming = [h for h in HOLIDAYS_2026 if h["date"] >= today]
    if not upcoming:
        return {"days": None, "encouragement": "今年都过完啦"}
    upcoming.sort(key=lambda x: x["date"])
    next_h = upcoming[0]
    return {
        "days": (next_h["date"] - today).days,
        "holiday_name": next_h["name"],
        "holiday_date": str(next_h["date"]),
    }
```

`SKILL.md` 前置元数据加：
```yaml
runtime: python
```

OpenClaw 自动用 Python 跑（需要本机有 Python 3.10+）。

## 17.10 调用外部 API 的 skill

进阶例子：用真实节假日 API（不用硬编码）。

`handler.js`:
```javascript
export async function days_until_holiday() {
  // 用免费节假日 API
  const res = await fetch('https://date.appworlds.cn/holiday-list?year=2026');
  const data = await res.json();
  const today = new Date(); today.setHours(0,0,0,0);

  const next = data.list
    .map(h => ({ name: h.name, dateObj: new Date(h.date) }))
    .filter(h => h.dateObj >= today)
    .sort((a,b) => a.dateObj - b.dateObj)[0];

  const days = Math.ceil((next.dateObj - today) / (1000*60*60*24));
  return { days, holiday_name: next.name, holiday_date: next.dateObj.toISOString().split('T')[0] };
}
```

记得 SKILL.md 里 `permissions: [network]` 要有 `network`。

## 17.11 接收参数的 skill

例：search_holiday(year, name)

`SKILL.md`:
```markdown
### search_holiday(year: int, name: string)

查询某年某节日的具体日期。

**输入**：
- year: 年份（如 2026）
- name: 节日名称（如 "春节"）

**输出**：
```json
{ "found": true, "date": "2026-02-17" }
```
```

`handler.js`:
```javascript
export async function search_holiday(year, name) {
  const list = ALL_HOLIDAYS[year] || [];
  const found = list.find(h => h.name.includes(name));
  return found
    ? { found: true, date: found.date }
    : { found: false };
}
```

LLM 看到 SKILL.md 会自动从用户的话里提取参数：
```
用户：明年春节是哪天
↓ LLM 解析
search_holiday(year=2027, name="春节")
```

## 17.12 调试技巧

### 加日志

```javascript
import { logger } from 'openclaw/skill-runtime';

export async function days_until_holiday() {
  logger.info('called');
  const result = ...;
  logger.debug('result', result);
  return result;
}
```

实时看：
```bash
openclaw logs tail --skill mooyu-calendar
```

### 直接 CLI 调用

不通过 LLM、直接调 skill 测试：

```bash
openclaw skill invoke mooyu-calendar days_until_holiday
```

输出：
```json
{
  "days": 3,
  "holiday_name": "劳动节",
  "holiday_date": "2026-05-01",
  "encouragement": "再忍忍 ✨"
}
```

skill 报错时这个最快。

### 写单测

新建 `handler.test.js`:
```javascript
import { test } from 'node:test';
import assert from 'node:assert';
import { days_until_holiday } from './handler.js';

test('returns positive days', async () => {
  const result = await days_until_holiday();
  assert.ok(result.days === null || result.days >= 0);
  assert.ok(result.holiday_name || result.encouragement);
});
```

跑：
```bash
node --test handler.test.js
```

## 17.13 错误处理

skill 报错会让 LLM 困惑。良好做法：

```javascript
export async function days_until_holiday() {
  try {
    // ... 主逻辑
    return { success: true, days, holiday_name: next.name };
  } catch (error) {
    logger.error('failed', { error: error.message });
    return {
      success: false,
      error: 'Cannot fetch holidays',
      hint: 'Try again later or check network',
    };
  }
}
```

LLM 看到 `success: false` 会礼貌地告诉用户失败原因。

## 17.14 发布到 ClawHub（可选）

写得自己满意，想分享：

```bash
cd my-mooyu-calendar
openclaw skill publish
```

按提示登录 ClawHub 账号 → 选 license → 发布。

别人就能：
```bash
openclaw skill install mooyu-calendar
```

直接装你的 skill。

::: tip 发布前
- README.md 写清楚怎么用、装啥
- SKILL.md 里的 examples 越多越好
- 加 license 字段（推荐 MIT）
- 测好再发，别一发就坑别人
:::

## 17.15 进阶能力

写顺手了可以探索这些：

- **跨 skill 调用**：你的 skill 调用别的 skill（如调 web-search 找数据再处理）
- **状态保存**：skill 在本地存数据（每次调用都能读上次结果）
- **流式输出**：长任务实时返回进度（不让 LLM 干等）
- **UI 卡片**：返回 OpenClaw Canvas 卡片（按钮、表单、图表）
- **触发器 skill**：监听事件而非被调（如 cron / webhook）

这些都在官方文档 [docs.openclaw.ai/skills/advanced](https://docs.openclaw.ai/skills/advanced)。

---

## 看完这一章你应该知道

✅ Skill = SKILL.md（说明书）+ handler.js/py（执行代码）
✅ SKILL.md 写好 `Capabilities` / `When to use` / `Examples` 三块
✅ JavaScript 或 Python 都能写
✅ `openclaw skill invoke <name> <fn>` 直接测试
✅ 调外部 API 记得加 `permissions: [network]`
✅ 写顺了可以发到 ClawHub 分享

---

**下一步**：[18. 多 Agent 协作 →](/openclaw/advanced/multi-agent)

一个 Agent 不够用？下一章教你跑多个 Agent，各管一摊、协同工作。
