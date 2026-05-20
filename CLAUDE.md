# CLAUDE.md

本文件给在这个仓库里干活的 Claude Code（或任何 AI agent）看，目的是让你**一进来就懂上下文 + 知道规矩**，少踩坑。

---

## 1. 这是什么项目

「**AI 学习站**」—— 面向中文用户的零基础 AI 工具学习站。

- **技术栈**：VitePress 1.6 + Markdown（**不是** Vue 组件项目，所有内容是 md）
- **包管理**：npm（已锁 `package-lock.json`）
- **部署**：腾讯云 CloudBase 静态托管（无服务端，**不能写后端逻辑**）
- **当前规模**：4 个工具区，共 **141 个章节**
  - Claude Code 27 章 (`/claude-code/`)
  - Codex 22 章 (`/codex/`)
  - OpenClaw 40 章 (`/openclaw/`)
  - Hermes 40 章 (`/hermes/`)

每个工具都按统一 8 段式结构：**入门 / 配置 / 操作 / 进阶 / 国内适配 / 实战案例 / 部署 / 参考**。

---

## 2. 目录结构

```
ai-learning-docs/
├── docs/
│   ├── .vitepress/
│   │   ├── config.ts                 # 站点配置（nav / sidebar / theme / 重定向）
│   │   └── theme/
│   │       ├── index.ts
│   │       └── custom.css            # 全站样式覆盖
│   ├── public/                       # 静态资源（图片 / SVG）
│   │   ├── hero-learning.svg         # 首页 Hero 灯塔图（重要）
│   │   ├── lighthouse-logo.svg       # 左上角 logo
│   │   └── qun.png                   # 学习群二维码
│   ├── index.md                      # 站点首页（B+ 三入口 + 4 工具矩阵）
│   ├── start/index.md                # /start/ 「从这里开始」入门 6 件套
│   ├── community.md                  # 学习群页
│   ├── claude-code/                  # 27 章 Claude Code 内容
│   │   ├── guide/ basics/ advanced/ china/ integration/ cases/ tips/
│   ├── codex/                        # 22 章 Codex
│   │   ├── guide/ features/ models/ china-models/ advanced/ config/
│   │   ├── faq.md
│   │   ├── resources.md
│   │   └── index.md                  # Codex 工具落地页
│   ├── openclaw/                     # 40 章 OpenClaw
│   │   ├── intro/ setup/ ops/ advanced/ china/ cases/ deploy/ reference/
│   │   └── index.md
│   ├── hermes/                       # 40 章 Hermes（最新接入）
│   │   ├── intro/ setup/ ops/ advanced/ china/ cases/ deploy/ reference/
│   │   └── index.md
│   ├── guide/ basics/ advanced/ china/ cases/ tips/ integration/
│   │   # 这些目录里全是 301 重定向占位文件（旧 URL → 新 /claude-code/ 路径）
│   │   # 不要在这些目录新增正式内容
│   └── ...
├── .claude/
│   └── skills/
│       └── add-ai-tool/
│           └── SKILL.md              # 接入新工具的标准 SOP（重要）
├── CLAUDE.md                         # 本文件
├── README.md
└── package.json
```

### 关键文件

| 文件 | 干嘛用 | 改它要小心什么 |
|---|---|---|
| `docs/.vitepress/config.ts` | nav / sidebar / 主题 / lastUpdated | 加工具时按现有结构，不要乱改顺序 |
| `docs/index.md` | 首页 Hero + 工具矩阵 + 场景速查 | 工具矩阵 ≤4 张卡保持 2×2，>4 要重设计 |
| `docs/start/index.md` | 完全新手的入门 6 件套 | 加新工具时同步加"学 X"卡 |
| `.claude/skills/add-ai-tool/SKILL.md` | 接入新工具 SOP | **加新 AI 工具前必读** |

---

## 3. 常用命令

### 开发
```bash
npm install                # 装依赖（只第一次）
npm run dev                # http://127.0.0.1:5173
npm run build              # 生产构建（含死链校验）
npm run preview            # 本地预览
```

### 文档审计（月度维护）
```bash
npm run audit              # 快速 LLM 审计（5-10 分钟）—— 走 /update skill
npm run audit:full         # 完整 LLM 审计（60-90 分钟）
npm run audit:tool hermes  # 单工具 LLM 审计
npm run audit:check        # 上游 hash 变化检测（不调 LLM，30 秒）
npm run audit:links        # 死链检查（5 分钟）
```

输出在 `audit-reports/`。详见该目录 README。

::: tip dev server 端口冲突
端口被占时 VitePress 自动用 5174、5175。建议先 `lsof -ti:5173 | xargs kill -9` 再启，保证 URL 一致。
:::

---

## 4. 工作流约定（**重要**）

### 4.1 加新工具

**永远走 SOP**：`.claude/skills/add-ai-tool/SKILL.md` 是接入新工具的全流程标准。

简化版：
1. 抓权威资料（WebSearch + WebFetch 工具官网/GitHub）
2. **先给用户看目录大纲等确认**，不要直接写章节
3. 搭脚手架 + 临时加 `ignoreDeadLinks: [/^\/<tool-id>\//]`
4. **写章节 1 当样本等用户拍板基调**，再批量写
5. 总结交付

### 4.2 章节内部模板（雷打不动）

每个章节开头：
```markdown
# <n>. <章节标题>

::: info 本章你将学到
- 4-5 个 bullet
:::
```

章节末尾：
```markdown
---

## 看完这一章你应该知道

✅ 4-5 个 bullet

---

**下一步**：[<n+1>. ... →](/<tool-id>/<dir>/<file>)

<一句话引出下一章>
```

中间小节用 `## <n>.X 子标题` 编号。

### 4.3 全站连续编号

每个工具的章节从 `1.` 一直编到该工具的最后一章。**不要每个 markdown 重起 `1.`**。

### 4.4 文件命名

- 全小写 + 连字符：`what-is.md` / `migrate-from-openclaw.md`
- URL slug 和文件名一致
- 工具 id 也是 URL slug：`claude-code` / `codex` / `openclaw` / `hermes`

### 4.5 跨工具引流（**本站独有价值，保留**）

每个工具至少留 1 章「联动其他工具」，让用户能在工具间跳转。例：
- OpenClaw ch21 → 联动 Codex / Claude Code
- Hermes ch33 → 联动 Codex / Claude Code / OpenClaw
- Hermes ch34 → 从 OpenClaw 迁移（`hermes claw migrate`）

---

## 5. 写作风格

### ✅ 必做

- 1-3 个生活化比喻（每章至少 1 个）
- 国内方案优先 / 国内国外对比表
- 安全 / 红线显式 `::: warning` 块
- 错误信息中英对照
- 价格 / 资源消耗给具体数字
- 引用本站已有章节（跨工具联动）
- 给小白看的——不假设读者懂行话

### ❌ 禁止

- SEO 套话（"在 2026 年的今天……"）
- 罗列式凑字数
- 不验证就编 API / 命令（必须 WebFetch 官方文档校对）
- 仅英文术语不带中文
- 不写"看完这一章应该知道"
- emoji 滥用（标题最多 1 个，段落正文一般不放）

### 章节长度参考

| 类型 | 行数 |
|---|---|
| 概念章 | 150-250 行 |
| 配置 / 操作章 | 200-350 行 |
| 实战案例 | 250-450 行 |
| 参考 / 术语 | 100-300 行 |

**单工具区总量 ≤ 12000 行**，再多读者吃不消。

---

## 6. 重要红线

### 🔴 永远不要

- ❌ 改 `docs/guide/` `docs/basics/` `docs/advanced/` `docs/china/` `docs/cases/` `docs/integration/` `docs/tips/` 里的内容
  - **这些是 301 重定向占位文件**，正式内容已迁到 `/claude-code/` 子路径
  - 想改 Claude Code 内容 → 改 `docs/claude-code/` 下对应文件
- ❌ 直接 push 到 main 不通过 `npm run build` 验证
- ❌ 引用未来章节的链接而**不加** `ignoreDeadLinks` 临时规则（会 build 失败）
- ❌ 把 API Key / 二维码 token 写进 markdown
- ❌ 改首页工具矩阵布局到 >4 张卡（要先升级成 `/tools/` 索引页路由）

### 🟡 要确认再做

- 跨章节大改（如调整全章节顺序）—— 先告诉用户
- 引入新依赖到 package.json —— 评估必要性
- 改 logo / 品牌色 —— 全站影响大
- 删除已发布的章节 —— 会破坏旧 URL，至少留 301 占位

---

## 7. 给 Claude 的工作建议

- **遇到"加新工具"请求**：先调用 `add-ai-tool` skill（SKILL.md 会自动加载），按 SOP 走。**不要凭印象写章节**。
- **遇到"改文档"请求**：先 Grep 确认要改的文件路径（注意区分占位文件 vs 正式内容）。
- **遇到"是否要……"问题**：本文件已明确禁止/建议的事直接说不/同意；不在本文件里的拿不准的事**先问用户**。
- **遇到 build 失败**：先 `npm run build 2>&1 | grep -E "(dead link|Error)"` 找具体错，不要瞎重启。

---

## 8. SKILL激活后展示

- **当某个SKILL被激活时，要展示给用户看。例如：SKILL XXX已被激活**
---

## 9. 联系 / 协作

- 站点 issue：本仓库 issues 区
- 学习群：首页二维码
- SOP 维护：`.claude/skills/add-ai-tool/SKILL.md` 持续更新
