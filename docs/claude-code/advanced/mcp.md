# 16. MCP（Model Context Protocol）

::: info 本章你将学到
- MCP 是什么，解决什么问题
- 如何添加和管理 MCP 服务器
- 项目级 .mcp.json 配置详解
- 热门 MCP 服务器介绍
:::

## 16.1 MCP 是什么

**MCP（Model Context Protocol）** 是 Anthropic 主导的开放标准，让 AI 模型能够连接到外部数据源和工具。

通过 MCP，Claude Code 可以：

- 读取 Google Drive 里的设计文档
- 更新 Jira / Linear 里的工单
- 从 Slack 拉取讨论记录
- 直接查询你的数据库
- 集成 Figma 设计稿
- 调用任何你自己开发的工具

**工作原理**：Claude Code ↔ MCP Server ↔ 外部服务

## 16.2 添加 MCP 服务器

```bash
# 添加服务器（交互式）
claude mcp add <name> <command>

# 示例：添加 GitHub MCP 服务器
claude mcp add github npx -y @modelcontextprotocol/server-github

# 添加文件系统服务器
claude mcp add filesystem npx -y @modelcontextprotocol/server-filesystem /workspace

# 列出已配置的服务器
claude mcp list

# 查看某个服务器详情
claude mcp get github

# 移除服务器
claude mcp remove github
```

**作用范围选项**：

```bash
# 只对当前项目（写入 .claude/settings.json）
claude mcp add my-db --scope project -- node ./mcp-server.js

# 对当前用户所有项目（写入 ~/.claude/settings.json）
claude mcp add my-db --scope user -- node ./mcp-server.js
```

## 16.3 项目级 .mcp.json 配置

在项目根目录创建 `.mcp.json`，可以提交到 git 与团队共享：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
      }
    }
  }
}
```

::: tip 使用环境变量引用密钥
用 `${ENV_VAR_NAME}` 语法引用环境变量，避免把 API Key 直接写入配置文件。
:::

### HTTP 类型 MCP 服务器

```json
{
  "mcpServers": {
    "my-api": {
      "type": "http",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_TOKEN}",
        "Content-Type": "application/json"
      }
    }
  }
}
```

## 16.4 在会话中管理 MCP

```
/mcp                    查看所有 MCP 服务器的连接状态
/mcp                    也可以在这里完成 OAuth 授权（如 Google Drive）
```

## 16.5 热门 MCP 服务器

| 服务器 | 安装命令 | 功能 |
|--------|---------|------|
| **GitHub** | `npx @modelcontextprotocol/server-github` | issue、PR、仓库操作 |
| **Filesystem** | `npx @modelcontextprotocol/server-filesystem` | 扩展文件访问权限 |
| **PostgreSQL** | `npx @modelcontextprotocol/server-postgres` | 数据库查询 |
| **SQLite** | `npx @modelcontextprotocol/server-sqlite` | SQLite 操作 |
| **Slack** | `npx @modelcontextprotocol/server-slack` | 发送/读取消息 |
| **Puppeteer** | `npx @modelcontextprotocol/server-puppeteer` | 浏览器自动化 |
| **Google Drive** | `npx @modelcontextprotocol/server-gdrive` | 文档读取 |
| **Notion** | 社区提供 | 页面读写 |
| **Linear** | 社区提供 | 工单管理 |
| **Figma** | 社区提供 | 设计稿读取 |

官方 MCP 服务器注册表：`https://github.com/modelcontextprotocol/servers`

## 16.6 开发自己的 MCP 服务器

MCP 服务器本质上是一个接受特定 JSON 格式输入、输出特定格式结果的进程。用任何语言实现都可以：

```javascript
// Node.js 示例（简化版）
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

const server = new Server(
  { name: 'my-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

// 定义工具
server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'get_data',
    description: '从我们的内部 API 获取数据',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '数据 ID' }
      },
      required: ['id']
    }
  }]
}))

// 实现工具
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'get_data') {
    const data = await fetchFromInternalAPI(request.params.arguments.id)
    return { content: [{ type: 'text', text: JSON.stringify(data) }] }
  }
})

// 启动
const transport = new StdioServerTransport()
await server.connect(transport)
```

完整的 MCP 开发文档：[modelcontextprotocol.io](https://modelcontextprotocol.io)

---

下一步：[配置文件详解](/claude-code/advanced/config)
