# 27. 案例 3：英语学习陪练

::: info 这个案例你将搭出什么
- 每日早 8 点：推 3 个新单词（含例句、词根、同义辨析）
- 晚上 22 点：抽 5 个本周学过的词出题（多选 + 翻译造句）
- 答错的词自动进"错题本"
- 每周日 19 点：生成本周学习报告
- 任何时间私聊它："考我"，立刻随机出 3 题
- agent 用 memory 跟踪你掌握程度，渐进难度
:::

## 27.1 用到的能力

- Memory 系统（核心：跟踪每个词的"熟练度"）
- 定时 workflow
- LLM 出题 + 评分
- 自定义 skill：词表管理 + 答题判分

## 27.2 准备：装一个自定义 skill

`english-tracker` skill 在 [17 章](/openclaw/advanced/write-skill) 类似的方法手写。结构：

```
skills/english-tracker/
├── SKILL.md
├── handler.js
└── words.json       ← 词表数据
```

`words.json`（示例）：
```json
{
  "words": [
    { "word": "ephemeral", "meaning": "短暂的", "level": 1, "wrong_count": 0, "last_quiz": null },
    { "word": "verbose", "meaning": "冗长的", "level": 1, "wrong_count": 0, "last_quiz": null },
    { "word": "robust", "meaning": "强健的", "level": 0, "wrong_count": 0, "last_quiz": null }
  ]
}
```

`SKILL.md`:
```markdown
---
id: english-tracker
permissions: [file_read, file_write]
---

# 英语单词追踪器

## Capabilities

### pick_today_words(count: int)
随机选 N 个**未学过或熟练度低**的词，返回数组。

### mark_word(word: str, correct: bool)
标记某词答题对错。错→ wrong_count+1。

### get_review_words(count: int)
返回最近答错次数多的 N 个词（错题本）。

### add_words(words: array)
批量加词到词表。
```

`handler.js`:
```javascript
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORDS_FILE = join(__dirname, 'words.json');

async function load() {
  const data = await readFile(WORDS_FILE, 'utf-8');
  return JSON.parse(data);
}
async function save(data) {
  await writeFile(WORDS_FILE, JSON.stringify(data, null, 2));
}

export async function pick_today_words(count = 3) {
  const { words } = await load();
  const candidates = words
    .filter(w => w.level < 5)
    .sort((a, b) => (a.level - b.level) || (Math.random() - 0.5));
  return candidates.slice(0, count);
}

export async function mark_word(word, correct) {
  const data = await load();
  const w = data.words.find(x => x.word === word);
  if (!w) return { ok: false, error: 'word not found' };
  if (correct) w.level = Math.min(5, w.level + 1);
  else { w.wrong_count++; w.level = Math.max(0, w.level - 1); }
  w.last_quiz = new Date().toISOString();
  await save(data);
  return { ok: true, level: w.level };
}

export async function get_review_words(count = 5) {
  const { words } = await load();
  return words
    .filter(w => w.wrong_count > 0)
    .sort((a, b) => b.wrong_count - a.wrong_count)
    .slice(0, count);
}

export async function add_words(words) {
  const data = await load();
  data.words.push(...words);
  await save(data);
  return { added: words.length };
}
```

## 27.3 创建 english-coach agent

`agent.yaml`:
```yaml
id: english-coach
name: 英语陪练
model:
  provider: deepseek
  model: deepseek-chat
soul: ./soul.md
skills:
  - core/memory
  - english-tracker
channels:
  - feishu       # 推送和聊
  - telegram     # 备用
behavior:
  language: zh-CN
```

`soul.md`:
```markdown
# 你是谁
英语老师 Coach。陪伴主人每天学英语，温和但严格。

# 教学风格
- 解释词义用最简单的中文，**不超过 15 字**
- 例句优先用主人感兴趣的领域（编程/科技）
- 出题不送分，但答错时给出正解+记忆口诀
- 鼓励但不油腻

# 任务时间表
- 早 8:00: 推 3 个新词
- 晚 22:00: 出题考 5 个最近学的
- 每周日 19:00: 周报

# 主人偏好
- 兴趣领域: 编程、AI、科技
- 当前水平: 雅思 6.5 左右
- 弱项: 词根记忆 / GRE 词汇

# 输出规范
- 推词格式:
  ```
  📚 今日新词

  **ephemeral** [ɪˈfem(ə)rəl] adj. 短暂的
  > 词根: ephemer- (一天的) + -al
  > 例: All popularity is ephemeral in tech.
  > 同义辨析: transient (强调一闪而过) / fleeting (强调难抓住)
  ```

- 出题格式:
  ```
  Q1. "robust" 的意思是?
   A. 优雅的  B. 强健的 ✓  C. 朴素的  D. 复杂的

  请回复: 1B 2A 3C ... 这种格式
  ```

# 边界
- 不给翻译软件式直译，要给"如何记住"的方法
- 主人答错时不要责备，给鼓励+技巧
```

## 27.4 三个 workflow

### Workflow A: 早 8 点推词

```yaml
# workflows/english-morning.yaml
name: 英语早课
trigger:
  cron: "0 8 * * *"
steps:
  - id: pick
    agent: english-coach
    task: |
      1. 调 english-tracker.pick_today_words(3)
      2. 给每个词写解释 + 例句 + 词根
      3. 按 soul 规范的格式输出 Markdown
  - id: send
    channel: feishu
    target: ${MY_OPEN_ID}
    message: ${pick}
```

### Workflow B: 晚 22 点测验

```yaml
# workflows/english-quiz.yaml
name: 晚间测验
trigger:
  cron: "0 22 * * *"
steps:
  - id: quiz
    agent: english-coach
    task: |
      1. 调 english-tracker，拉今天 + 最近 7 天教过的词
      2. 随机选 5 个出题（多选）
      3. 输出题目和"等待回答"提示

  - id: send
    channel: feishu
    target: ${MY_OPEN_ID}
    message: ${quiz}
```

回答会被 agent 自然处理（不需要 workflow）—— soul 里教它"收到 1B 2A 这种回答自动调 mark_word 标记"。

### Workflow C: 周日 19 点周报

```yaml
# workflows/english-weekly.yaml
name: 英语周报
trigger:
  cron: "0 19 * * 0"
steps:
  - id: report
    agent: english-coach
    task: |
      生成本周英语学习报告：
      - 本周新学词数
      - 答题正确率
      - 最常错的 3 个词（建议重点复习）
      - 累计掌握度（level=5 词数 / 总词数）
      - 给一句鼓励
  - id: send
    channel: feishu
    target: ${MY_OPEN_ID}
    message: ${report}
```

## 27.5 实际使用示范

### 早 8:00 收到

```
📚 今日新词（3 个）

1. **ephemeral** [ɪˈfem(ə)rəl] adj. 短暂的
   词根: ephemer- (一天的) + -al
   例: All popularity is ephemeral in tech.
   辨析: transient (一闪而过) / fleeting (难抓住)

2. **robust** [roʊˈbʌst] adj. 强健的；稳健的
   例: A robust API survives bad inputs.
   口诀: ro (强) + bust (爆破不了的)

3. **verbose** [vɜːˈboʊs] adj. 冗长的；多话的
   例: His commit messages are too verbose.
   辨析: wordy (口语化的) / long-winded (绕弯子)

晚上 22 点我会考你 ✏️
```

### 晚 22:00 收到

```
🎯 今晚 5 题

Q1. "ephemeral" 意思?
   A. 永恒的  B. 短暂的  C. 神秘的  D. 重要的

Q2. "verbose" 用在以下场景哪个合适?
   A. 一个简洁的回答
   B. 一段冗长的演讲
   C. 一封紧急邮件
   D. 一段简短诗句

... (Q3-Q5)

请回复: 1B 2A 3C 这种格式
```

你回："1B 2B 3A 4D 5C"

```
判分中...

Q1 ✅ ephemeral - B 短暂的
Q2 ✅ verbose - B 冗长的演讲
Q3 ❌ robust - 正解 D (strong/sturdy)
   记忆: ro-bust 撼不动的，像 robot 一样耐操
Q4 ✅
Q5 ❌ ...

本次 3/5。错的两题已加入错题本，下次重点复习。
```

### 周日 19:00 收到

```
📊 本周英语周报

📈 数据
- 本周学新词: 21 个
- 测验场次: 6 次
- 平均正确率: 76%
- 累计掌握 (level 5): 87 / 142 = 61%

🔥 最容易错的词:
1. obscure (错 3 次) — 模糊的、晦涩的
2. ambiguous (错 2 次) — 模棱两可的
3. nuanced (错 2 次) — 微妙的

💪 加油！本周比上周提升了 8%。下周继续！
```

### 临时考你

任何时候发：
```
你: 考我

english-coach:
来 3 道:
Q1. "transient" 意思?
   A. ...
```

## 27.6 进阶：导入你想学的词表

```bash
openclaw agent --id english-coach -m "我想学 GRE 高频词，每天 5 个，先加 100 个进词表"
```

agent 会调 english-tracker.add_words 批量加。或者你直接编辑 `words.json`。

## 27.7 多人共用（家庭学习）

```yaml
# 给孩子的版本
id: english-coach-kid
soul: ./soul-kid.md      # 用更简单语言，多用例子
```

`soul-kid.md` 改成"用拼音 / 简单中文，例句来自动画 / 日常生活"。

## 27.8 成本

按上述用量，月度约 ¥10-20。比报 1V1 班便宜 200 倍。

---

## 看完这个案例你应该会

✅ 写一个状态有持久化的自定义 skill
✅ 用 agent + skill + workflow 组合做"长期任务"
✅ Memory 跟踪用户进度
✅ 多场景 cron（早学晚考、周报）

---

**下一步**：[28. 案例 4：论文追踪助手 →](/openclaw/cases/arxiv-tracker)

下一个案例：让 OpenClaw 帮你追前沿论文——arxiv 监控 + 摘要 + 推荐。
