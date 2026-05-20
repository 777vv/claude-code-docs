# 29. 案例 5：飞书问答机器人

::: info 这个案例你将搭出什么
公司飞书群里员工 @ 机器人问任何问题：
- "请假流程是什么"
- "VPN 怎么连"
- "财务报销怎么填"
- "公司哪个项目用了 Vue"

机器人去检索内部知识库（飞书文档 / Notion / Confluence / Markdown 仓库）→ 综合多源 → 给精准答案 + 文档链接。

预计搭建：90 分钟（含建知识库索引）。
:::

## 29.1 用到的能力

- 飞书 channel（[11 章](/openclaw/setup/feishu) 已讲）
- RAG（Retrieval-Augmented Generation）—— 把文档转向量、检索后再 LLM 总结
- vector-db skill / MCP server
- 自定义文档导入流程

## 29.2 整体架构

```
员工在群里 @ 机器人 + 问题
     ↓
qa-bot agent
  1. 解析问题
  2. 调 RAG skill 检索相关文档（向量相似度 top 5）
  3. 把检索到的内容 + 问题给 LLM
  4. LLM 生成答案 + 标注来源
  5. 飞书卡片回复（带文档链接）
```

## 29.3 准备：建文档向量库

### 步骤 1：装 vector-db skill

```bash
openclaw skill install vector-db
openclaw skill install embedding-bge      # 中文 embedding 模型
```

### 步骤 2：导入文档

`scripts/build-knowledge-base.js`:
```javascript
import { VectorDB } from 'openclaw-skill-vector-db';
import { embed } from 'openclaw-skill-embedding-bge';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const docsDir = './company-docs';      // 你的本地文档目录
const db = new VectorDB('./kb.sqlite');

// 简单分块：每 500 字一块
function chunk(text, size = 500, overlap = 50) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

async function ingest(filePath) {
  const text = await readFile(filePath, 'utf-8');
  const chunks = chunk(text);
  for (let i = 0; i < chunks.length; i++) {
    const vector = await embed(chunks[i]);
    await db.insert({
      content: chunks[i],
      vector,
      meta: { path: filePath, chunk_id: i, source: filePath.split('/').pop() }
    });
  }
  console.log(`✓ ${filePath} (${chunks.length} chunks)`);
}

async function main() {
  const files = await readdir(docsDir);
  for (const f of files.filter(x => x.endsWith('.md'))) {
    await ingest(join(docsDir, f));
  }
  console.log('Done.');
}

main();
```

跑：
```bash
node scripts/build-knowledge-base.js
```

### 步骤 3：自动从飞书/Notion 同步（高阶）

如果文档在飞书云文档 / Notion，写定时 workflow 拉取：

```yaml
# workflows/kb-sync.yaml
trigger:
  cron: "0 3 * * *"        # 每天凌晨 3 点
steps:
  - id: pull
    agent: kb-syncer
    task: "从飞书空间 XXX 拉所有 md 导出到 ./company-docs/"
  - id: rebuild
    shell: "node scripts/build-knowledge-base.js"
```

## 29.4 创建 qa-bot agent

`agent.yaml`:
```yaml
id: qa-bot
name: 公司知识小助手
model:
  provider: deepseek
  model: deepseek-chat
soul: ./soul.md
skills:
  - core/memory
  - vector-db
  - embedding-bge
channels:
  - feishu
behavior:
  language: zh-CN
```

`soul.md`:
```markdown
# 你是谁
公司内部知识小助手。员工问什么，去知识库查，给精准答案。

# 工作流程
1. 接到问题，先想 1-2 个搜索关键词
2. 调 vector-db.search(query, top_k=5)
3. 把检索到的内容 + 原问题给自己思考
4. 生成答案，**必须**附上来源（文档名 + 段落）

# 输出规范
- 直接回答，不啰嗦
- 不知道就说"我没找到相关信息，可以联系 HR/IT/财务部门"
- 不编（hallucination）
- 复杂问题分点
- 附带源文档链接

# 边界
- 不回答公司机密外的事（如个人薪资、人事）
- 群里不主动开新话题
- 一次问答最长 300 字（再多用户也不看）
```

## 29.5 接到飞书群

按 [11 章](/openclaw/setup/feishu) 配好飞书 channel 后，channel.yaml 指定 default_agent:

```yaml
# channels/feishu.yaml
default_agent: qa-bot
group_mode: mention_only        # 只响应 @
```

然后把 bot 拉进员工群。

## 29.6 实际使用示范

```
张三: @qa-bot 请假流程是什么

qa-bot:
请假流程：
1. 飞书"OA 系统"申请 → 选请假类型
2. 半天内由直属 leader 审批
3. 通过后日历自动加请假事件
4. 如超 3 天，HR 邮件确认

📎 详见文档:
- 《员工请假管理制度 v3.2》(/docs/hr/leave-policy.md)
- 《OA 系统使用指南》(/docs/it/oa-guide.md)
```

```
李四: @qa-bot 我们项目里有哪个用了 Vue

qa-bot:
公司目前使用 Vue 的项目（按规模降序）:
1. 客户管理系统 CRM (Vue 3 + Pinia)
2. 数据大屏可视化 dashboard (Vue 2)
3. 内部 wiki 网站 (Vue 3 + VitePress)

📎 来源:
- 《2026 Q1 技术栈盘点》(/docs/tech/2026q1.md)
```

## 29.7 增强：多源检索

不只是本地 md。整合：
- **飞书云文档**: feishu-docs skill 列出 + 检索
- **GitHub Wiki**: github MCP
- **Notion**: notion skill
- **Confluence**: 通过其 API（社区有 skill）

soul 里写：
```markdown
# 数据源优先级
1. 本地 markdown 知识库（最快）
2. 飞书云文档（中等延迟）
3. GitHub Wiki（最慢，仅技术问题用）

按 1→2→3 顺序查，前面找到答案就不查后面。
```

## 29.8 安全：敏感问题处理

soul 加：
```markdown
# 敏感问题清单（必须拒绝）
- 个人薪资 / 绩效
- HR 评估
- 客户合同细节
- 财务数据 / 报表
- 法务文档

如果检测到上述意图，回复:
"这类信息涉及隐私/敏感，建议直接联系 HR/财务/法务部门。"
```

## 29.9 反馈优化

每次回答下方加 👍 / 👎 按钮（飞书互动卡片）。

- 👍 → memory 记 "成功回答 query"
- 👎 → memory 记 "失败回答" + 发到指定运维群

每月 review 失败案例 → 补文档 → 重建知识库。

## 29.10 性能优化

- 文档分块大小：500 字效果通常好（太小没上下文，太大稀释相关性）
- top_k：5 通常够用，少了召回低，多了 LLM 容易被噪声分散
- embedding 模型：中文优先 bge-base / bge-large，速度+质量平衡
- 查询缓存：高频问题缓存答案 1 小时（用 KV skill）

## 29.11 成本

按公司 100 人，日均 50 个问题：
- embedding: 一次 build kb ~¥0.5（一次性）
- 每次查询: ~¥0.05（含检索 + LLM 总结）
- 月度: 50 × 30 × ¥0.05 = ~¥75

每月 ¥75 替代一个全职 HR 答疑岗，回本很快。

---

## 看完这个案例你应该会

✅ 用 vector-db + embedding 做 RAG
✅ 文档分块、ingestion、定时同步
✅ 多源检索（本地 / 飞书 / GitHub）
✅ 敏感问题过滤
✅ 反馈闭环（👍👎 + memory）

---

**下一步**：[30. 案例 6：会议纪要自动整理 →](/openclaw/cases/meeting-notes)

下一个：会议录音上传 → AI 转文字 + 摘要 + 行动项 → 分发给参会人。
