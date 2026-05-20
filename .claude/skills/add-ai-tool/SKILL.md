---
name: add-ai-tool
description: Use when the user asks to add a new AI tool / agent / coding assistant chapter set to this learning site. Triggers on phrases like "增加 X 工具", "新增 Y", "把 Z 接入", "add X docs", "新接入一个 AI 工具", or whenever scope = "build a new tool section under docs/". Handles authoritative research, beginner-friendly outline drafting (with user confirmation), repo scaffolding, sidebar/nav/homepage updates, 8-section chapter template, build verification, and style consistency with the existing 3 tool sections (Claude Code / Codex / OpenClaw).
---

# add-ai-tool · 接入新 AI 工具的标准化 SOP

当用户提出「加 X 工具到学习站」时，**严格按本 SOP 走**，避免重复踩坑。

---

## ⚠️ 第 0 步：触发后立刻做的 3 件事

1. **先 TaskCreate 一个总任务**（"接入 X 工具"），跟踪整个流程
2. **绝不立刻动手写章节**——必须先「资料 → 目录 → 用户确认 → 脚手架 → 样本章 → 用户确认基调 → 批量写」
3. **每个"大方向不确定"的地方都要问用户**，不要拍板

---

## 第 1 步：抓权威资料（最高优先级）

避免 hallucination。**必须并行**调用：

```
WebFetch  → 工具的 GitHub README（拿 install / 架构 / 命令）
WebFetch  → 工具的官方网站首页（拿 tagline / 定位 / 特性）
WebSearch → "<工具名> tutorial 2026"（拿英文教程实践）
WebSearch → "<工具名> 中文 教程"（拿国内方案、镜像、社区）
```

整理出至少：
- 一句话定位（official tagline）
- 核心特性 5-7 个
- 安装命令（含国内加速方案）
- 系统要求（OS / 语言 / 版本）
- 支持的 LLM 列表
- 支持的 channel/接口列表
- 核心概念词（区分于已有工具的"行话"）
- License、maintainer

**如果工具搜不到 / 信息零散 / 像虚构** → 必须问用户「这是不是 X 工具，能给个 repo / 官网链接吗？」

---

## 第 2 步：起目录大纲（先给用户看，**不要直接写**）

### 标准 8 段式（雷打不动的骨架）

| 段 | 章数 | 内容 |
|---|---|---|
| 入门篇 | 5-6 | 是什么 / 概念图解 / 能不能 / 系统要求 / 装前置 / 装本体 |
| 配置篇 | 4-5 | API Key / 模型供应商 / 第一个实例 / IM 接入 ×1-2 |
| 操作篇 | 3-4 | CLI 速查 / Dashboard / 日志故障 / 安全清单 |
| 进阶篇 | 4-6 | Skills / 高级特性 / 与其他 AI 工具联动 |
| 国内适配 | 3 | 国产 LLM 接入 / 国内 channel / 网络与镜像 |
| 实战案例 | 4-10 | **必须突出该工具差异化能力**，不要和已有工具雷同 |
| 部署篇 | 2-3 | 本地 vs 云 / Docker / 进阶部署 |
| 参考 | 3 | 故障大全 / 术语表 / 资源链接 |

总章数：**27-40**（看工具复杂度）

### 实战案例数量决策表

| 工具类型 | 案例建议数 |
|---|---|
| 单一功能（如 IDE 插件、CLI 编程） | 3-4 |
| 多场景平台（agent 框架） | 6-10 |
| 研究型 / 小众 | 4-6 |

### 标号
统一格式：`1. 什么是 X` → `40. 资源链接`，**全站连续编号**（不要每篇重起 1）。

### 给用户的目录交付物
- Markdown 表格 / 列表
- 每章一句话价值
- 标注"⭐ 本站特色章节"（联动已有工具的）
- 估总章数 + 节奏建议
- **结尾必须 3-4 个 confirm 问题**：
  - 范围合适？
  - 顺序合理？
  - 实战案例方向对吗？
  - 总章数能接受吗？

**等用户拍板**——他可能要砍/合/补/调顺序。

---

## 第 3 步：搭脚手架（用户确认目录后立刻做）

### 3.1 建目录结构

```bash
mkdir -p docs/<tool-id>/{intro,setup,ops,advanced,china,cases,deploy,reference}
```

`<tool-id>` 是工具的 URL slug（小写、连字符）。例：`claude-code`、`codex`、`openclaw`、`hermes`。

### 3.2 写 `docs/<tool-id>/index.md`（工具落地页）

模板（参考 docs/openclaw/index.md）：

```markdown
---
layout: home
hero:
  name: "<Tool Name>"
  text: "<一句话定位>"
  tagline: <副标题 · N 章节 · 小白友好 · 持续更新>
  image:
    src: /lighthouse-logo.svg          # 或工具专属 logo
    alt: <Tool Name>
  actions:
    - theme: brand
      text: 新手从这里开始 →
      link: /<tool-id>/intro/what-is
    - theme: alt
      text: 直接装上跑起来
      link: /<tool-id>/intro/install
    - theme: alt
      text: 国内模型接入
      link: /<tool-id>/china/models
features:
  - icon: ...
    title: ...
    details: ...
  (6 个 feature)
---

<div style="margin-top:64px">

## 它和 <已有工具> 有什么不一样？
<对比表>

## 你能用它做什么
<3-6 个 bullet>

## 5 分钟跑通第一步
<极简安装命令>

## 学习交流群
<二维码>

</div>
```

### 3.3 改 `docs/.vitepress/config.ts`

#### nav 增项
在 `nav: [...]` 数组中加一条（放在已有工具之后、`学习交流` 之前）：
```ts
{ text: '<Tool Name>', link: '/<tool-id>/', activeMatch: '/<tool-id>/' },
```

#### sidebar 新键
在 `sidebar: {}` 内加：
```ts
'/<tool-id>/': [
  { text: '入门', collapsed: false, items: [...] },
  { text: '配置', collapsed: false, items: [...] },
  { text: '日常操作', collapsed: false, items: [...] },
  { text: '进阶', collapsed: false, items: [...] },
  { text: '国内适配', collapsed: false, items: [...] },
  { text: '实战案例', collapsed: false, items: [...] },
  { text: '部署', collapsed: false, items: [...] },
  { text: '参考', collapsed: false, items: [...] },
  { text: '学习与交流', items: [{ text: '加入交流群', link: '/community' }] },
],
```

每条 item 格式：`{ text: '<n>. <章节中文标题>', link: '/<tool-id>/<dir>/<file>' }`（**用统一编号**）。

#### 临时加 ignoreDeadLinks（写作期间）
```ts
ignoreDeadLinks: [
  /^\/<tool-id>\//,
],
```

**写完所有章节后务必删掉**。

### 3.4 改 `docs/index.md`（首页工具矩阵）

把"更多工具陆续接入"占位卡替换 / 在已有工具卡之后加一张：

```html
<a href="/<tool-id>/" style="display:block;padding:28px;border:1px solid var(--vp-c-divider);border-radius:14px;..."
   onmouseover="this.style.borderColor='<工具主色>'">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
    <div style="width:48px;height:48px;border-radius:10px;background:linear-gradient(135deg,<c1>,<c2>);
                display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;font-weight:700">
      <emoji or 字母>
    </div>
    <div>
      <div style="font-weight:700;font-size:18px;color:var(--vp-c-text-1)"><Tool Name></div>
      <div style="font-size:12px;color:var(--vp-c-text-3)"><N 章节副标题></div>
    </div>
  </div>
  <div style="font-size:14px;color:var(--vp-c-text-2);line-height:1.6;margin-bottom:12px">
    <一句话价值（说出它和别的工具不同处）>
  </div>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <span style="font-size:11px;padding:3px 8px;...">标签 1</span>
    <span style="font-size:11px;padding:3px 8px;...">标签 2</span>
    <span style="font-size:11px;padding:3px 8px;...">标签 3</span>
  </div>
</a>
```

**注意工具矩阵布局**：≤4 张卡 2×2，5-6 张卡 3×2，超过 6 张要重新设计成"工具索引页 `/tools/`"路由。

### 3.5 改 `docs/start/index.md`（入门页"下一步去哪"）

在 "看完了，下一步去哪？" 网格里加一张卡：

```html
<a href="/<tool-id>/" style="...border-color:<工具主色>'">
  <div style="font-weight:600;color:var(--vp-c-text-1);margin-bottom:6px"><emoji> 学 <Tool Name></div>
  <div style="font-size:13px;color:var(--vp-c-text-2)"><1 句话差异化定位></div>
</a>
```

### 3.6 工具配色 / Logo

- **遵循品牌色规则**：尽量用本站统一橙色系 `#c6613f` / `#d97757` / `#e8906d`。如果工具有自己强烈的官方色（如 Codex 的 `#10A37F`、Anthropic 的橙色），允许局部使用作 accent。
- **Logo**：优先用工具官方 logo 颜色。若无现成，造一个 SVG 放 `docs/public/<tool-id>-logo.svg`。

---

## 第 4 步：写章节 1 当样本（关键：等用户拍板基调）

只写**章节 1（"<Tool> 是什么"）**，发给用户确认调性后再批量写。

### 章节 1 必含元素

1. 顶部 `::: info 本章你将学到`（4-5 个 bullet）
2. **1.1 一句话定位** + 加粗关键词 + 维护者 / Star / 协议
3. **1.2 和已有工具对比表**（必含 ChatGPT + 本站已有工具）
4. **1.3 能做什么**（5 大类 + 真实代码块示例）
5. **1.4 在哪里使用**（channel / IDE / 端入口表）
6. **1.5 适用场景**（最适合 / 不太适合）
7. **1.6 安全 / 关键限制**（红线提醒）
8. **1.7 谁维护 / 协议**（让读者放心投入）
9. `## 看完这一章你应该知道`（4-5 个 ✅）
10. `**下一步**: [2. ... →](链接)` + 一句话理由

### 给用户的确认问题模板

> 章节 1 写完，请你过目一下"调性"，确认 OK 我批量写后续 39 章。
>
> 这些选择会成为后面统一模板：
> - 长度（~250 行）
> - emoji 用量
> - 比喻 / 段子密度
> - 表格 vs 文字比例
> - 统计数字（如 star 数会过时）
> - 安全提醒强度
>
> 回 "调性 OK，继续" 或具体改动。

---

## 第 5 步：批量写章节（按 8 段顺序）

### 单章节内部模板（雷打不动）

```markdown
# <n>. <章节标题>

::: info 本章你将学到
- 知识点 1
- 知识点 2
- 知识点 3
- 知识点 4
:::

::: tip / warning
（视章节性质决定，前置提醒）
:::

## <n>.1 第一小节
...
## <n>.2 第二小节
...

## <n>.X 常见错误速查（强烈建议）
| 报错 / 现象 | 原因 | 解决 |
|---|---|---|

---

## 看完这一章你应该知道

✅ 4-5 个 bullet

---

**下一步**：[<n+1>. ... →](/<tool-id>/<dir>/<file>)

<一句话引出下一章>
```

### 章节长度参考

- 概念章：150-250 行
- 配置章 / 操作章：200-350 行
- 实战案例：250-450 行
- 参考 / 术语：100-300 行

**控制总文档量**：单工具区 ≤ 12000 行（再多用户读不动）。

### 风格基调清单

✅ **必做**
- 1-3 个生活化比喻（每章至少 1 个）
- 国内方案优先 / 国内国外对比
- 安全 / 红线显式 `::: warning`
- 错误信息中英对照
- 价格 / 资源消耗给数字
- 引用本站已有章节（跨工具联动）

❌ **禁止**
- SEO 套话（"在 2026 年的今天……"）
- 罗列式凑字数
- 不验证就编 API / 命令
- 仅英文术语不带中文
- 不写"看完这一章应该知道"

### 写作节奏

按 8 段批量推进。每写完 1 段（5-10 章）：
1. 在 TaskUpdate 里标 completed
2. `npm run build` 跑一遍验证
3. 若死链都是未来章节（正常），继续
4. 若有语法错 / 真死链，**立刻修**不要堆积

---

## 第 6 步：验证与收尾

### 6.1 删 ignoreDeadLinks

写完最后一章后，**立刻**删掉 config.ts 里的临时 ignore：

```ts
// 删掉这块
ignoreDeadLinks: [
  /^\/<tool-id>\//,
],
```

跑 `npm run build`：
- 通过 ✅ → 收尾
- 报死链 ❌ → 修到通过

### 6.2 全站完整 build

```bash
cd <project root>
npm run build 2>&1 | tail -20
```

要看到 `build complete in XX s`，**不能有 dead link 报错**。

### 6.3 Playwright 视觉验证

至少截这 3 个页面，肉眼确认无样式 break：
1. 工具首页 `/<tool-id>/`
2. 工具的章节 1（章节渲染、sidebar、outline）
3. 站点首页（确认新工具卡显示在矩阵里）

记得 `mcp__playwright__browser_resize({width: 1440, height: 900})` 再截图，否则会缩成手机宽度。

### 6.4 像素对齐验证

如果工具卡导致首页布局看起来不对齐：
- **必须用 `mcp__playwright__browser_evaluate` 测真实 left/right/width**
- 不能凭肉眼说"对齐了"

### 6.5 同步更新审计体系（**必做，5 处**）

⚠️ **关键步骤**：审计体系（`scripts/`、`audit-reports/`、`/update` skill、CLAUDE.md、README.md）默认不知道有新工具。
**写完 40 章后必须同步更新 5 处**，否则月度审计会漏检该工具：

#### ① `scripts/check-upstream-changes.mjs` 加权威源

打开文件，找到 `SOURCES` 对象，加新工具一行：

```javascript
const SOURCES = {
  'claude-code': [...],
  'codex': [...],
  'openclaw': [...],
  'hermes': [...],
  // ↓ 加你的新工具
  '<tool-id>': [
    { name: 'github-readme', url: 'https://raw.githubusercontent.com/<org>/<repo>/main/README.md' },
    { name: 'releases', url: 'https://api.github.com/repos/<org>/<repo>/releases/latest' },
    { name: 'docs-home', url: '<官方文档首页 url>' },
  ],
};
```

跑一次验证基线已记：
```bash
node scripts/check-upstream-changes.mjs <tool-id>
# 应输出 🆕 首次记录
```

#### ② `.claude/skills/update-docs/SKILL.md` 加官方源到清单

打开 `update-docs/SKILL.md`，找到「上游源清单（每个工具固定）」节，加新工具一段：

```markdown
### <Tool Name>
- 主文档: <url>
- GitHub: github.com/<org>/<repo>
- Release notes: github.com/<org>/<repo>/releases
- 中文社区: <如有>
```

#### ③ `CLAUDE.md` 更新「当前规模」

打开 `CLAUDE.md`，第 1 节「这是什么项目」里：
- 把"4 个工具区"改成"5 个工具区"
- 把"共 N 个章节"加上新工具章数
- 在工具列表里加一行 `- <Tool Name> N 章 (\`/<tool-id>/\`)`

第 2 节「目录结构」里把新工具目录也加上。

第 10 节「历史踩坑」里加一行：
```
- 20YY-MM：<Tool> 接入完成（N 章）。<本工具独家亮点 / 沉淀的经验>
```

#### ④ `README.md` 更新工具列表

打开仓库根 `README.md`，找到工具介绍区，加新工具的简介 + 章数 + 链接。

#### ⑤ `audit-reports/README.md` 更新历史表（可选）

打开 `audit-reports/README.md`，「历史」表格加一行：
```markdown
| 20YY-MM-DD | upstream-snapshots.json | 加入 <Tool> 的源 |
```

### 6.6 验证全套同步完成

```bash
# 1. build 仍然过
npm run build

# 2. 上游基线已建
node scripts/check-upstream-changes.mjs <tool-id>
# 输出应包含 🆕 首次记录

# 3. CLAUDE.md 的工具数 / 章节数对得上
grep -E "工具区|个章节" CLAUDE.md

# 4. README 提到了新工具
grep "<Tool Name>" README.md
```

四项全过 → 收尾完成。

---

## 第 7 步：总结交付

给用户的最终消息模板：

```
🎉 <Tool Name> 全部 N 章完成。Build 通过，零死链。

## 总览
<8 段 × 章数 表格>

## 关键集成
✅ 顶部导航加了 <Tool> 入口
✅ Sidebar 配置 8 个分组 + N 个章节
✅ 首页工具矩阵加卡片
✅ /start/ 页加入口
✅ 跨工具引流：第 X 章联动 ...
✅ Build N 秒过，无死链

## 已同步审计体系（5 处）
✅ scripts/check-upstream-changes.mjs 加了 <tool-id> 的 N 个源
✅ .claude/skills/update-docs/SKILL.md 加了官方源清单
✅ CLAUDE.md 工具数 / 章节数 / 历史记录已更新
✅ README.md 工具列表已加
✅ audit-reports 首次快照已建立

## 写作选择（用户可推翻）
（重要的非默认选择列出来，让用户后续可改）

dev server 还在 http://127.0.0.1:5173/ 跑着。
```

---

## 工具特征 → 案例选型对照（避免案例雷同）

不同工具应突出不同案例方向，**避免和已有工具雷同**：

| 工具特征 | 适合的案例方向 |
|---|---|
| IDE 集成强 | "在 VS Code 里重构 / 跨文件修改 / 调试" |
| CLI / 终端原生 | "终端一行命令完成 X" |
| 多 channel 平台 | "在 IM 里 ××" / "群协作" |
| 自学习 / 自改进 | "用一周后 agent 自己写了哪些 skill" |
| 多 backend / sandbox | "同一任务在 N 种环境跑" |
| trajectory / 训练 | "生成微调数据集" |
| 浏览器自动化 | "AI 自动操作真实网页" |
| 长 context | "100K+ tokens 的超长文档分析" |
| 推理特化 | "复杂数学 / 编程 / 推理题" |
| 国内合规 | "接入飞书 / 钉钉 / 企微" |

**新案例必须有 ≥1 个本工具独有的能力点**。如果想不出，要么改案例方向，要么砍数量（宁缺毋滥）。

---

## 跨工具联动加分项（本站独有价值）

每个新工具至少留 1 章「联动 Claude Code / Codex / OpenClaw」，让老读者无缝跳船。

例如：
- Codex 章节里："Codex 和 Claude Code 怎么选"
- OpenClaw 章节里："让 OpenClaw 跑 Codex / Claude Code 当子代理"
- Hermes 章节里："从 OpenClaw 迁移到 Hermes（hermes claw migrate 命令）"

**这是本站区别于单工具文档站的核心价值**——保留。

---

## 失败模式 / 常见踩坑

| 问题 | 预防 |
|---|---|
| 用户说目录不合适，我已写了一半 | 永远先 **第 2 步用户确认目录** 再写 |
| 章节调性偏离用户期望 | 永远先写**章节 1** 让用户拍板 |
| Build 失败：dead link | 临时加 `ignoreDeadLinks`，写完删掉 |
| 首页对齐错乱 | 用 `browser_evaluate` 测真实坐标，不靠肉眼 |
| 章节里写错 API / 命令 | WebFetch 官方文档校对 |
| 多工具配色冲突 | 主色统一橙系，工具色只作 accent |
| 用户重复要"加完工具卡" | 工具数 > 6 时设计 `/tools/` 索引页 |
| dev server 卡死 / 端口冲突 | `lsof -ti:5173 \| xargs kill -9` 再启 |
| **跳过 6.5 同步审计体系** | 月度自动审计**漏检该工具**，新工具上游变了发现不了。务必走完 5 处同步 |
| 同步漏了 CLAUDE.md 工具数 | 下次 Claude 接手时数据对不上，会困惑。必更新第 1 节 + 第 10 节 |

---

## 配套数据：现有 3 个工具简表（参考）

| Tool | URL | 章数 | 特色案例 |
|---|---|---|---|
| Claude Code | `/claude-code/` | 27 | 全栈搭建 / 重构 / 调试 3 个案例 |
| Codex | `/codex/` | 22 | 国内模型保姆教程系列 |
| OpenClaw | `/openclaw/` | 40 | 10 个生活/办公自动化案例 |

未来加 Hermes 后建议 40 章左右、突出 "self-improving skills + 多 backend + 训练数据 + 从 OpenClaw 迁移"。

---

## 触发后的第一句话（标准开场）

**第一行必须告知用户 SKILL 已激活**（CLAUDE.md 第 12 节强制要求）：

```
🛠 SKILL `add-ai-tool` 已激活

收到。开干前先抓 <工具名> 的权威资料（GitHub / 官网 / 中英文社区），
确认核心能力和差异化点，然后给你目录草案确认。

整个流程会走完 7 步：资料 → 目录确认 → 脚手架 → 样本章 → 基调确认 → 批量写 39 章 → 收尾（含同步审计体系 5 处）
```

不要直接写章节。**永远先：资料 → 目录 → 用户确认 → 样本章 → 用户确认 → 批量写 → 同步审计体系**。
