# MCP 扩展协议

> **本文你将学会：** 什么是 MCP、如何为 Codex 添加第三方工具（浏览器、数据库、Figma 等）。

## 什么是 MCP？

**MCP（Model Context Protocol）** 是一个开放协议，让 AI 模型能够调用外部工具和服务。

把 Codex 想象成一个人，MCP 就是给这个人配备额外工具的方式：
- 浏览器工具 → 让 Codex 能打开网页、抓取内容
- 数据库工具 → 让 Codex 能查询 / 修改数据库
- Figma 工具 → 让 Codex 能读取设计稿，按设计图写代码
- 搜索工具 → 让 Codex 能实时搜索文档

---

## 在 config.toml 中配置 MCP

MCP 服务器在 `~/.codex/config.toml` 中配置：

```toml
# ~/.codex/config.toml

# STDIO 类型（本地运行的 MCP 服务）
[[mcp_servers]]
name = "filesystem"
transport = "stdio"
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/workspace"]

# HTTP 类型（远程 MCP 服务）
[[mcp_servers]]
name = "my-remote-tool"
transport = "http"
url = "https://my-mcp-server.example.com/mcp"
headers = { Authorization = "Bearer your-token" }
```

---

## 常用 MCP 工具推荐

### 浏览器控制（Playwright）

让 Codex 能操作浏览器，适合前端调试、截图、爬取内容：

```bash
# 安装
npm install -g @playwright/mcp
```

```toml
[[mcp_servers]]
name = "browser"
transport = "stdio"
command = "npx"
args = ["@playwright/mcp"]
```

使用示例：
```
打开 localhost:3000，截图给我看看，
然后点击登录按钮，填写用户名 test@test.com 密码 123456，
告诉我登录后跳转到哪个页面
```

---

### Figma 读取

让 Codex 读取 Figma 设计文件，按设计稿写组件：

```bash
npm install -g figma-mcp
```

```toml
[[mcp_servers]]
name = "figma"
transport = "stdio"
command = "npx"
args = ["figma-mcp"]
env = { FIGMA_TOKEN = "your-figma-token" }
```

---

### 官方文档查询（Context7）

让 Codex 实时查询最新 API 文档：

```toml
[[mcp_servers]]
name = "context7"
transport = "http"
url = "https://mcp.context7.com/mcp"
```

---

### 本地数据库

```toml
# SQLite
[[mcp_servers]]
name = "sqlite"
transport = "stdio"
command = "npx"
args = ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "./mydb.sqlite"]
```

---

## 验证 MCP 连接

启动 Codex 后，输入以下命令测试 MCP 工具是否加载成功：

```
列出当前可用的所有 MCP 工具
```

Codex 会显示所有已注册的 MCP 服务器和可用功能。

---

## 更多 MCP 工具资源

- [官方 MCP 服务器列表](https://github.com/modelcontextprotocol/servers)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)
- [MCP 协议官方文档](https://modelcontextprotocol.io)
