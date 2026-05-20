# AGENTS.md 自定义指令

> **本文你将学会：** 如何用 AGENTS.md 文件为项目配置专属 AI 行为规则，让 Codex 更懂你的项目。

## 什么是 AGENTS.md？

`AGENTS.md` 是放在项目根目录的 Markdown 文件，专门用来告诉 Codex：

- 这个项目是做什么的
- 代码风格规范是什么
- 有哪些不能碰的文件
- 特定任务的处理方式

每次 Codex 在该目录启动时，都会自动读取这个文件，相当于给 AI 的"工作说明书"。

---

## 快速入门：创建你的第一个 AGENTS.md

在项目根目录创建文件：

```bash
touch AGENTS.md
```

写入基本内容：

```markdown
# 项目说明

这是一个使用 React + TypeScript + Tailwind CSS 的前端项目，后端 API 基于 Express。

## 技术栈
- 前端：React 18, TypeScript 5, Vite, Tailwind CSS
- 后端：Node.js, Express, Prisma ORM, PostgreSQL
- 测试：Vitest（单元测试），Playwright（E2E）

## 代码规范
- 使用 ESLint + Prettier 格式化，提交前必须通过 lint
- 组件文件使用 PascalCase 命名（如 UserCard.tsx）
- 工具函数文件使用 camelCase 命名
- 所有组件必须有 TypeScript 类型定义，禁止 `any`

## 重要规则
- 不要修改 `src/generated/` 目录（Prisma 自动生成）
- 不要直接修改 `.env` 文件，只能修改 `.env.example`
- 新功能必须同时编写单元测试

## 目录结构
- src/components/ — UI 组件
- src/hooks/ — 自定义 React Hooks
- src/utils/ — 工具函数
- src/api/ — API 请求层
- server/ — 后端代码
```

---

## AGENTS.md 的加载规则

Codex 会按以下顺序查找并合并 AGENTS.md 文件：

```
1. ~/.codex/instructions.md        ← 全局规则（对所有项目生效）
2. /path/to/project/AGENTS.md      ← 项目根目录
3. /path/to/project/src/AGENTS.md  ← 子目录（当你在子目录中工作时）
```

层级越深的规则，优先级越高。

---

## 全局指令文件

如果你有对所有项目都适用的规则，可以写在全局文件中：

```bash
# 编辑全局指令
nano ~/.codex/instructions.md
```

```markdown
# 全局规则

## 通用规范
- 代码注释用中文
- 函数和变量命名用英文
- 每次修改前先用 `git diff` 确认当前状态
- 提交信息格式：`类型(范围): 说明`，如 `feat(auth): 添加登录功能`

## 安全规则
- 不要在代码中硬编码任何密码、密钥、Token
- 发现敏感信息时立即提醒我
```

---

## 实用 AGENTS.md 模板

### Python 项目

```markdown
# Python 项目

## 环境
- Python 3.11+，使用 pyenv 管理版本
- 包管理：Poetry（不要用 pip install 直接安装）
- 测试：pytest

## 规范
- 类型注解：所有函数参数和返回值必须有类型注解
- 文档字符串：使用 Google 风格
- 格式化：black + isort（提交前运行 `make fmt`）

## 禁止操作
- 不要修改 `pyproject.toml` 中的依赖版本
- 不要创建 .pyc 文件（使用 __pycache__ 目录）
```

### Node.js API 项目

```markdown
# Node.js API 项目

## 约定
- 所有路由在 `routes/` 目录
- 业务逻辑在 `services/` 目录
- 数据库操作只允许通过 `repositories/` 目录
- 错误统一抛出 `AppError` 类（在 utils/errors.js 中定义）

## API 规范
- RESTful 风格
- 统一响应格式：`{ success, data, error }`
- 分页参数：`page` 和 `pageSize`

## 测试
- 每个 service 必须有对应的 .test.js 文件
- 运行测试：`npm test`
- 覆盖率要求 > 80%
```

---

## 效果对比

**没有 AGENTS.md：**
```
你：帮我添加一个用户查询接口
Codex：（可能在错误的目录创建文件，不知道你的错误处理规范）
```

**有 AGENTS.md：**
```
你：帮我添加一个用户查询接口
Codex：在 routes/ 创建路由，在 services/ 写业务逻辑，
       使用 AppError 处理错误，返回统一的 {success, data} 格式，
       同时创建对应的测试文件
```
