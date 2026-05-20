# 20. MCP 协议接入

::: info 本章你将学到
- 什么是 MCP（Model Context Protocol）、和 Skill 区别
- 怎么把现成 MCP 服务器接入 OpenClaw
- 推荐的 10 个 MCP 服务器
- 用 MCP 接 GitHub / 数据库 / 浏览器 的完整示例
- MCP 和 Skill 何时选哪个
:::

## 20.1 MCP 是什么

**MCP** = Model Context Protocol，Anthropic 2024 年推出的开放协议。

简单理解：**MCP 是 AI 工具的"USB 接口标准"**。

之前的问题：
- Claude Code 要接 GitHub？得给 Claude Code 单独写适配
- ChatGPT 要接 GitHub？得给 ChatGPT 单独写适配
- OpenClaw 要接 GitHub？又得单独写

MCP 之后：
- 写**一份** GitHub MCP server
- Claude Code、ChatGPT、Cursor、OpenClaw 都能直接用
- 加新的 LLM 工具时不用重做适配

::: tip 一句话总结
**Skill** 是 OpenClaw 专属的能力包
**MCP** 是跨工具通用的"插件"标准
:::

## 20.2 MCP 和 Skill 区别

| | Skill | MCP |
|---|---|---|
| 标准 | OpenClaw 专属 | 跨工具通用 |
| 写法 | SKILL.md + handler.js | 标准 MCP server |
| 来源 | ClawHub | 任何 MCP 实现 |
| 数量 | 3000+（ClawHub） | 增长中（社区+官方） |
| 复用 | OpenClaw 内 | Claude Code/Cursor/Codex 都能用 |

**实战建议**：
- 简单功能、OpenClaw 专属：写 **Skill**
- 想给多个 AI 工具用、或想接现成的开源工具：用 **MCP**

## 20.3 OpenClaw 接 MCP 的两种方式

### 方式 1：直接装 MCP server（推荐）

OpenClaw 内置了"MCP 桥"，能直接接任何标准 MCP server。

```bash
# 装一个 MCP server（npm 包形式）
openclaw mcp install @modelcontextprotocol/server-github

# 看已装的
openclaw mcp list
```

### 方式 2：用 mcp-skill（在 ClawHub 上）

如果某 MCP server 已经被 ClawHub 用 skill 包了一层：

```bash
openclaw skill install mcp-github
```

通常 skill 包装版本配置更简单，但灵活度低一点。**新手建议先用 skill 包装版**。

## 20.4 推荐的 10 个 MCP server

新手装这 10 个能力覆盖很广：

| MCP server | 干嘛用 | 配置难度 |
|---|---|---|
| `@modelcontextprotocol/server-github` | GitHub 完整集成（PR/issue/file） | ⭐⭐（要 PAT） |
| `@modelcontextprotocol/server-gitlab` | GitLab 集成 | ⭐⭐ |
| `@modelcontextprotocol/server-postgres` | PostgreSQL 查询 | ⭐ |
| `@modelcontextprotocol/server-sqlite` | SQLite 查询 | ⭐ |
| `@modelcontextprotocol/server-puppeteer` | 浏览器自动化 | ⭐ |
| `@modelcontextprotocol/server-filesystem` | 本地文件读写 | ⭐ |
| `@modelcontextprotocol/server-google-drive` | Google Drive | ⭐⭐⭐ |
| `@modelcontextprotocol/server-slack` | Slack 集成 | ⭐⭐ |
| `mcp-server-notion` | Notion 数据库 | ⭐⭐ |
| `mcp-server-fetch` | 通用 HTTP 抓取 | ⭐ |

## 20.5 实战：接入 GitHub MCP

让你的 agent 能 list issue / 创建 PR / 看代码。

### 步骤 1：申请 GitHub Personal Access Token (PAT)

1. github.com 右上头像 → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Generate new token
3. 权限勾选：
   - `Contents: read`
   - `Issues: read/write`
   - `Pull requests: read/write`
4. 生成后**马上复制**（关页面就看不到）

### 步骤 2：装 MCP server

```bash
openclaw mcp install @modelcontextprotocol/server-github
```

### 步骤 3：配置

`~/.openclaw/workspace/mcp.yaml`:
```yaml
servers:
  - id: github
    package: "@modelcontextprotocol/server-github"
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: ${GITHUB_PAT}
```

`.env` 加：
```bash
GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxx
```

### 步骤 4：让 agent 用上

```yaml
# agent.yaml
mcp:
  - github
```

### 步骤 5：测试

```bash
openclaw agent --id xiaozhao -m "列出 my-org/my-repo 仓库的 open issue"
```

应该返回真实的 issue 列表。

### 步骤 6：实战玩法

```
@xiaozhao 看一下 ai-learning-docs 这个 PR #42 改了啥，给我总结

@xiaozhao 在 my-repo 建个 issue：标题"修复登录 bug"，描述如下...

@xiaozhao 我刚提的 PR 跑过 CI 了吗
```

agent 会自动调 GitHub MCP 去做。

## 20.6 实战：接入 PostgreSQL MCP

让 agent 直接查公司数据库（**只读权限**，安全第一）。

### 步骤 1：装

```bash
openclaw mcp install @modelcontextprotocol/server-postgres
```

### 步骤 2：配置（只读账号）

```yaml
# mcp.yaml
servers:
  - id: company-db
    package: "@modelcontextprotocol/server-postgres"
    env:
      POSTGRES_URL: "postgresql://readonly_user:${DB_PASSWORD}@db.company.com:5432/main"
```

::: warning 数据库 MCP 一定用只读账号
不要让 LLM 有 DELETE/DROP 权限。即使开 confirm 还是会出事。
:::

### 步骤 3：实战

```
@xiaozhao 查一下 users 表，看上周新注册多少人
```

agent 会生成 SQL → 执行 → 拿结果 → 整理回复你。

## 20.7 实战：接入 Puppeteer 浏览器 MCP

让 agent 能开浏览器、点按钮、填表单、抓数据。

```bash
openclaw mcp install @modelcontextprotocol/server-puppeteer
```

```yaml
# mcp.yaml
servers:
  - id: browser
    package: "@modelcontextprotocol/server-puppeteer"
```

实战：
```
@xiaozhao 帮我打开携程，搜本周末北京到上海的机票，列出最便宜的 3 班
```

agent 会：
1. 打开浏览器
2. 导航到携程
3. 填日期、出发地、目的地
4. 等加载
5. 提取结果
6. 排序回复

::: warning 浏览器 MCP 高危
能控制浏览器 = 能用你的身份做事（登录、付款、发消息）。
**只在隔离环境里跑**，给 agent 装这个 skill 前必看 [15. 安全清单](/openclaw/ops/security-checklist)。
:::

## 20.8 自己写 MCP server（高阶）

如果你想给公司内部系统做集成，写个 MCP server 让所有 AI 工具都能用：

```bash
npm create @modelcontextprotocol/server my-internal-api
```

会生成模板，按指引填 list_tools / call_tool 接口即可。

详见 [Model Context Protocol 官方文档](https://modelcontextprotocol.io)。

写完发 npm 包，全公司任何 LLM 工具都能 `mcp install` 用。

## 20.9 MCP 服务管理

```bash
# 看已装
openclaw mcp list

# 看某个 MCP 服务的能力（它 expose 了哪些 tool）
openclaw mcp info github

# 重启某 MCP server
openclaw mcp restart github

# 卸载
openclaw mcp uninstall github
```

## 20.10 故障排查

### MCP 连接不上 / `MCP server failed to start`
```bash
openclaw mcp logs github
```
看输出。常见：
- npm 包没装好：`openclaw mcp install --force <pkg>`
- 缺环境变量：`env` 里漏配
- node 版本不够：升级 Node.js

### MCP 调用超时
- 默认 30s。复杂操作（如浏览器自动化）调高：
  ```yaml
  servers:
    - id: browser
      timeout: 120s
  ```

### LLM 不知道用 MCP 工具
- 检查 agent.yaml 里 `mcp:` 列表有这个 server id
- agent reload
- 看 logs：LLM 是不是收到了 MCP tool 列表

## 20.11 MCP 生态资源

- 官方：[modelcontextprotocol.io](https://modelcontextprotocol.io)
- Server 列表：[github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
- 中文社区聚合：[mcp.so](https://mcp.so)（按分类找 MCP server）

---

## 看完这一章你应该知道

✅ MCP 是跨 AI 工具通用的"插件"标准
✅ Skill 是 OpenClaw 专属，MCP 是通用——两者可共存
✅ `openclaw mcp install <package>` 一键接 MCP server
✅ 推荐的 10 个 MCP server 装完，能力覆盖广
✅ 浏览器 / 数据库 MCP 高危，必须隔离环境
✅ 公司内部系统适合自写 MCP server，全公司复用

---

**下一步**：[21. 联动 Codex / Claude Code →](/openclaw/advanced/with-coding-tools)

进阶最后一章——让 OpenClaw 调用本站学过的 Codex / Claude Code，组成"全能 AI 工作流"。
