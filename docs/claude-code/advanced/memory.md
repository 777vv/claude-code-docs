# 10. CLAUDE.md 与记忆系统

::: info 本章你将学到
- 为什么需要记忆系统
- CLAUDE.md 的文件层级和作用范围
- 怎么写出高效的 CLAUDE.md
- Auto Memory（自动记忆）的工作方式
:::

## 10.1 为什么需要记忆系统

每次启动 Claude Code，上下文都是全新的——它不记得上次你说的任何事情。两种机制让它跨会话拥有「记忆」：

| 机制 | 谁来写 | 放什么 | 适合 |
|------|--------|--------|------|
| **CLAUDE.md** | 你自己 | 指令、规范、约定 | 项目惯例、构建命令、编码风格 |
| **Auto Memory** | Claude 自己 | 学到的经验和偏好 | 调试心得、你纠正过的错误 |

## 10.2 CLAUDE.md 文件层级

Claude Code 按以下优先级加载多个位置的 CLAUDE.md，**后加载的优先级更高**：

| 作用域 | 路径 | 用途 |
|--------|------|------|
| 组织级 | `/Library/Application Support/ClaudeCode/CLAUDE.md`（macOS）<br>`/etc/claude-code/CLAUDE.md`（Linux）<br>`C:\Program Files\ClaudeCode\CLAUDE.md`（Windows）| 整个组织统一规范，IT 管理 |
| 用户级 | `~/.claude/CLAUDE.md` | 你所有项目的个人偏好 |
| 项目级（团队共享）| `./CLAUDE.md` 或 `./.claude/CLAUDE.md` | 提交到 git，团队共享 |
| 项目本地（仅自己）| `./CLAUDE.local.md` | 加入 `.gitignore`，个人覆盖 |

::: tip 推荐实践
- 把团队约定放在 `./CLAUDE.md` 并提交到 git
- 把个人偏好放在 `~/.claude/CLAUDE.md`
- 把不想共享的本地覆盖放在 `./CLAUDE.local.md`（加入 `.gitignore`）
:::

## 10.3 一键生成：/init

在项目根目录运行：

```
/init
```

Claude 会分析整个项目，自动生成一个起点 CLAUDE.md，包含：
- 检测到的构建命令（`npm run build`、`make` 等）
- 测试指令
- 项目目录结构说明
- 检测到的编码约定

**多阶段初始化**：设置环境变量 `CLAUDE_CODE_NEW_INIT=1` 后，`/init` 会额外引导你：
- 生成初始 Skills
- 生成初始 Hooks
- 生成个人记忆文件

## 10.4 怎么写有效的 CLAUDE.md

核心原则：**越具体越好**。对每一行问自己：「如果删掉它，Claude 会犯错吗？」如果不会，就删掉。

### ✅ 应该写的内容

- Claude 猜不到的 Bash 命令（如 `./scripts/dev-start.sh` 而不是标准的 `npm start`）
- 与语言默认惯例不同的编码风格
- 测试指令和首选测试工具
- 仓库提交规范（分支命名、commit 格式、PR 规范）
- 项目特有的架构决策（「所有数据库操作必须通过 Repository 层」）
- 开发环境需要的环境变量
- 非显而易见的常见陷阱

### ❌ 不要写的内容

- Claude 看代码就能知道的信息
- 编程语言的标准惯例
- 详细 API 文档（放链接就行）
- 经常变化的内容
- 「写干净的代码」这类废话
- 长篇教程和解释

### 示例：一个好的 CLAUDE.md

```markdown
# 代码风格
- 用 ES modules (import/export)，不要用 CommonJS
- 能解构导入就解构（如 import { foo } from 'bar'）
- 不要在代码里写注释，除非原因非常不显而易见

# 工作流
- 改完代码后必须跑 `npm run typecheck`
- 优先跑单个测试文件，不要每次都跑整个测试套件（太慢）
- 新 API 端点必须加输入验证（用 zod）

# 项目结构
- API handlers 放在 src/api/handlers/
- 共享类型放在 packages/types/
- 不要在 src/utils/ 下建新文件，统一放对应模块目录

# 常见坑
- Redis 连接需要 REDIS_URL 环境变量，本地用 redis://localhost:6379
- 不要直接用 Date.now()，必须用 src/utils/time.ts 里的 getCurrentTime()
```

::: warning 大小控制
单个 CLAUDE.md 建议 **小于 200 行**。过长会导致 Claude 忽略其中部分规则。把大段参考资料移入 [Skills](/advanced/skills)，按需加载。
:::

## 10.5 导入其他文件

在 CLAUDE.md 里可以用 `@` 引用其他文件，Claude 会按需读取：

```markdown
查看 @README.md 了解项目概况，查看 @package.json 了解所有脚本命令。

# 额外说明
- Git 工作流: @docs/git-workflow.md
- 个人偏好覆盖: @~/.claude/my-overrides.md
```

## 10.6 路径范围规则（Path-scoped Rules）

对于大型项目，可以在 `.claude/rules/` 目录下组织规则文件，**只有当 Claude 处理匹配路径的文件时才会加载**，不浪费上下文：

```bash
.claude/
  rules/
    api.md          # 只在处理 src/api/** 时加载
    frontend.md     # 只在处理 src/components/** 时加载
    database.md     # 只在处理 src/db/** 时加载
```

规则文件格式：

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "src/routes/**/*.ts"
---

# API 开发规则
- 所有端点必须包含输入验证（用 zod schema）
- 错误响应必须使用标准格式：`{ error: string, code: string }`
- 包含 OpenAPI JSDoc 注释
- 不要在 handler 里直接操作数据库，通过 Repository 层
```

## 10.7 Auto Memory（自动记忆）

Claude Code 在工作中会自己把学到的东西写到记忆文件里。当你看到 `Writing memory` 或 `Recalled memory` 的提示，就是它在读写这个目录。

**默认存储位置**：`~/.claude/projects/<project-hash>/memory/`

**管理命令**：
```
/memory          查看和编辑记忆文件
/memory off      关闭 auto memory
/memory on       开启 auto memory
```

**完全禁用**（在 `~/.claude/settings.json` 或 `.claude/settings.json` 中）：

```json
{
  "autoMemoryEnabled": false
}
```

::: info 需要的版本
Auto Memory 需要 Claude Code v2.1.59 或更高版本。默认开启。
:::

---

下一步：[权限与模式](/advanced/permissions)
