# 20. MCP 协议接入

::: info 本章你将学到
- MCP 在 Hermes 里和在 OpenClaw 里**用法一致**
- Hermes 装 MCP server 的命令
- 10 个推荐 MCP server 的快速接入
- 写自己的 MCP server 给 Hermes + 其他 AI 工具复用
:::

::: tip 已经在 OpenClaw 看过 MCP 的同学
**协议相同，章节结构高度重叠**。本章重点讲 **Hermes 特有的差异**：
- 用 Python SDK 而非 Node.js
- 和 Honcho / Subagents 配合
- 配置位置不同
:::

## 20.1 MCP 是什么（快速回顾）

**MCP** = Model Context Protocol，Anthropic 推出的开放协议。

**简单理解**：MCP 是 AI 工具的"USB 接口标准"。

- 一份 MCP server（如 GitHub）写好后，**Hermes / Claude Code / Codex / OpenClaw 都能直接用**
- 加新 AI 工具时不用单独重做适配

完整原理见 [OpenClaw 第 20 章](/openclaw/advanced/mcp)。

## 20.2 Hermes 对 MCP 的支持

Hermes 出厂自带 MCP 桥接，**接任何标准 MCP server**。

```bash
# 装 MCP server
hermes mcp install @modelcontextprotocol/server-github

# 列出已装
hermes mcp list

# 看某个 server 提供的工具
hermes mcp info github

# 卸载
hermes mcp uninstall github
```

## 20.3 配置

`~/.hermes/config.yaml`:

```yaml
mcp:
  servers:
    - id: github
      package: "@modelcontextprotocol/server-github"
      env:
        GITHUB_PERSONAL_ACCESS_TOKEN: ${GITHUB_PAT}
      enabled: true

    - id: postgres
      package: "@modelcontextprotocol/server-postgres"
      env:
        POSTGRES_URL: ${DB_URL}
      enabled: true

    - id: filesystem
      package: "@modelcontextprotocol/server-filesystem"
      env:
        ALLOWED_DIRS: "/home/user/projects"
      enabled: false           # 暂时禁用
```

## 20.4 推荐的 10 个 MCP server

| MCP server | 干嘛 | 配置难度 |
|---|---|---|
| `@modelcontextprotocol/server-github` | GitHub 完整集成 | ⭐⭐（PAT） |
| `@modelcontextprotocol/server-gitlab` | GitLab | ⭐⭐ |
| `@modelcontextprotocol/server-postgres` | PostgreSQL | ⭐ |
| `@modelcontextprotocol/server-sqlite` | SQLite | ⭐ |
| `@modelcontextprotocol/server-puppeteer` | 浏览器自动化 | ⭐ |
| `@modelcontextprotocol/server-filesystem` | 文件系统沙箱 | ⭐ |
| `@modelcontextprotocol/server-fetch` | HTTP 抓取 | ⭐ |
| `@modelcontextprotocol/server-slack` | Slack | ⭐⭐ |
| `mcp-server-notion` | Notion | ⭐⭐ |
| `mcp-server-arxiv` | arxiv 学术 | ⭐ |

## 20.5 实战：接入 GitHub MCP

### 准备 PAT

[github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)

最小权限：
- Contents: read
- Issues: read/write
- Pull requests: read/write

### 装 + 配

```bash
hermes mcp install @modelcontextprotocol/server-github
```

`.env`：
```bash
GITHUB_PAT=github_pat_xxxxxxxxxx
```

`config.yaml`：
```yaml
mcp:
  servers:
    - id: github
      package: "@modelcontextprotocol/server-github"
      env:
        GITHUB_PERSONAL_ACCESS_TOKEN: ${GITHUB_PAT}
```

### 验证

```bash
hermes mcp test github
```

输出：
```
✓ Server started
✓ 12 tools exposed:
  - list_repositories
  - get_repository
  - list_issues
  - create_issue
  - list_pull_requests
  - ...
```

### 用它

```bash
hermes "看 my-org/my-repo 这周的 open issue，按 label 分类"
```

Hermes 自动调 GitHub MCP 完成。

## 20.6 PostgreSQL MCP（只读模式）

```yaml
mcp:
  servers:
    - id: company-db
      package: "@modelcontextprotocol/server-postgres"
      env:
        POSTGRES_URL: "postgresql://readonly_user:${DB_PWD}@db.company.com:5432/main"
```

::: warning 数据库 MCP 务必用只读账号
不要让 LLM 有 DELETE / DROP 权限。即使开 confirm 仍可能误操作。
:::

实战：
```bash
hermes "查 users 表本周新增用户按城市分组"
```

Hermes 自动生成 SQL → 执行 → 整理结果。

## 20.7 Puppeteer 浏览器 MCP

让 Hermes 控制浏览器（区别于内置 browser_use）。

```yaml
mcp:
  servers:
    - id: browser-mcp
      package: "@modelcontextprotocol/server-puppeteer"
```

::: warning Browser MCP 高危
能控制浏览器 = 能用你登录账户做事。**只在隔离 backend 跑**（docker / modal）。
:::

## 20.8 自己写 MCP server（Python）

OpenClaw 章节讲的是 Node.js MCP。Hermes 玩家用 Python 更顺手。

### 用 Python MCP SDK

```bash
pip install mcp
```

```python
# my_mcp_server.py
from mcp.server import Server
from mcp.types import Tool, TextContent

server = Server("my-internal-api")

@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="check_attendance",
            description="查公司今天谁在办公室",
            inputSchema={
                "type": "object",
                "properties": {
                    "date": {"type": "string", "default": "today"}
                }
            }
        ),
        Tool(
            name="get_attendance_history",
            description="查某人本月出勤",
            inputSchema={...}
        )
    ]

@server.call_tool()
async def call_tool(name, arguments):
    if name == "check_attendance":
        # 调你公司内部 API
        result = await fetch_internal_api(arguments["date"])
        return [TextContent(type="text", text=str(result))]
    elif name == "get_attendance_history":
        ...

if __name__ == "__main__":
    server.run()
```

### 接到 Hermes

```yaml
mcp:
  servers:
    - id: company-attendance
      command: python /path/to/my_mcp_server.py
      enabled: true
```

`hermes mcp list` 应该看到它。

### 发布

```bash
pip install build twine
python -m build
twine upload dist/*
```

PyPI 上发布后，全公司任何 AI 工具都能 `pip install your-mcp-server` 用。

## 20.9 MCP server 管理

```bash
hermes mcp list                    # 看全部
hermes mcp info github             # 看详情 + 暴露的工具
hermes mcp restart github          # 重启某个
hermes mcp logs github             # 看日志
hermes mcp enable / disable github
hermes mcp uninstall github
```

## 20.10 Hermes + Honcho + MCP 联动

Hermes 特有玩法：**Honcho 知道你在意什么 + MCP 接入对应数据源**。

例子：你过去一周跟 Hermes 多次聊 "GitHub PR review"。Honcho 推断"用户高频用 GitHub"。

下次你说"看一下我的 PR 状态"——Hermes：
1. Honcho 提示："这是 GitHub 重度用户的常问"
2. 自动调 `github` MCP 拉所有你的 open PR
3. 按你过去偏好的格式输出（看 user.md）

整套流程**完全自动**，越用越顺。

## 20.11 vs OpenClaw 的 MCP

| | OpenClaw | Hermes |
|---|---|---|
| SDK | TypeScript / Node.js | Python（也支持 Node.js MCP） |
| 安装 | `openclaw mcp install` | `hermes mcp install` |
| 配置 | `mcp.yaml` | `config.yaml mcp:` |
| 集成 | 和 OpenClaw skill 互通 | 和 Hermes tools / skills 互通 |
| 同协议吗 | 是 | 是 |

**同一个 MCP server 两边都能用** —— 这是 MCP 的意义。

## 20.12 常见报错

### Q：MCP server 启不起来
```bash
hermes mcp logs <id>
```
看具体原因。常见：
- npm 包没装好：`hermes mcp install --force <pkg>`
- 缺环境变量：`env:` 漏配
- Node.js / Python 版本

### Q：LLM 不调用 MCP 工具
- 检查 `mcp.servers.X.enabled: true`
- `hermes mcp info <id>` 看工具是否暴露
- 在 prompt 里更明确（"用 github MCP 查 my-repo 的 issue"）

### Q：调用 MCP 超时
```yaml
mcp:
  servers:
    - id: slow-one
      timeout: 120s              # 默认 30，长任务调大
```

## 20.13 资源

- 官方：[modelcontextprotocol.io](https://modelcontextprotocol.io)
- Server 集合：[github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
- 中文聚合：[mcp.so](https://mcp.so)

---

## 看完这一章你应该知道

✅ MCP 协议 Hermes / OpenClaw / Claude Code 通用
✅ `hermes mcp install <package>` 一键接 MCP server
✅ 推荐 10 个 server 装完能力覆盖广
✅ 用 Python MCP SDK 写自己的 server
✅ Honcho + MCP 联动让 Hermes 更懂你 + 能力更多

---

**下一步**：[21. Subagents + Worktree →](/hermes/advanced/subagents)

进阶最后一章——多 agent 并行调研，Hermes 的研究型大招。
