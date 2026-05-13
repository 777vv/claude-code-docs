# 20. 代理与网络配置

::: info 本章你将学到
- 如何为 Claude Code 配置代理
- 常见代理软件的端口配置
- 网络诊断方法
- 白名单域名列表
:::

## 20.1 代理配置方式

Claude Code 遵循标准 HTTP 代理环境变量：

::: code-group

```bash [Linux / macOS]
# 临时（当前终端）
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 永久（加入 ~/.bashrc 或 ~/.zshrc）
echo 'export HTTP_PROXY=http://127.0.0.1:7890' >> ~/.bashrc
echo 'export HTTPS_PROXY=http://127.0.0.1:7890' >> ~/.bashrc
source ~/.bashrc
```

```powershell [Windows PowerShell]
# 临时
$env:HTTP_PROXY = "http://127.0.0.1:7890"
$env:HTTPS_PROXY = "http://127.0.0.1:7890"

# 永久
[Environment]::SetEnvironmentVariable("HTTP_PROXY", "http://127.0.0.1:7890", "User")
[Environment]::SetEnvironmentVariable("HTTPS_PROXY", "http://127.0.0.1:7890", "User")
```

:::

也可以写入 `~/.claude/settings.json`：

```json
{
  "env": {
    "HTTP_PROXY": "http://127.0.0.1:7890",
    "HTTPS_PROXY": "http://127.0.0.1:7890"
  }
}
```

## 20.2 常见代理软件端口

| 软件 | 默认 HTTP 端口 | 默认 SOCKS5 端口 |
|------|--------------|----------------|
| **Clash / Clash Verge** | 7890 | 7891 |
| **V2Ray / V2RayN** | 10809 | 10808 |
| **Xray** | 10809 | 10808 |
| **Shadowsocks** | 1087 | 1086 |
| **Trojan** | 1087 | — |
| **Surge** | 6152 | 6153 |

```bash
# HTTP 代理格式
export HTTPS_PROXY=http://127.0.0.1:7890

# SOCKS5 代理格式
export HTTPS_PROXY=socks5://127.0.0.1:7891
```

## 20.3 配置 API 端点代理

如果你有企业级 API 中转服务：

```json
{
  "apiBase": "https://your-proxy.example.com/anthropic",
  "apiKey": "${ANTHROPIC_API_KEY}"
}
```

或通过环境变量：

```bash
export ANTHROPIC_API_BASE="https://your-proxy.example.com/anthropic"
```

## 20.4 域名白名单参考

如果你的代理软件支持分流（只对特定域名走代理），可参考以下配置：

```
# 需要走代理的域名（访问 Anthropic 官方）
api.anthropic.com
console.anthropic.com
claude.ai

# 不需要走代理（直连的国内服务）
api.siliconflow.cn
open.bigmodel.cn
dashscope.aliyuncs.com
api.deepseek.com
openrouter.ai
```

## 20.5 网络诊断

```bash
# 测试能否访问 Anthropic API
curl -I https://api.anthropic.com

# 测试走代理时能否访问
curl -I --proxy http://127.0.0.1:7890 https://api.anthropic.com

# Claude Code 内置诊断
claude doctor

# 详细网络日志
claude --debug "api"

# 把调试日志写到文件分析
claude --debug-file /tmp/claude-net-debug.log --debug "api"
```

正常时 `curl -I https://api.anthropic.com` 应该返回 `HTTP/2 200` 或 `HTTP/2 404`（404 也代表网络通了）。

## 20.6 常见网络问题

### 超时错误

```bash
# 增大 HTTP 超时（毫秒）
export ANTHROPIC_HTTP_TIMEOUT=120000
```

### SSL 证书错误

如果使用了中间代理导致 SSL 证书问题：

```bash
# 临时跳过证书验证（不推荐用于生产）
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

### 代理不生效

确认：
1. 代理软件是否开启了「系统代理」模式
2. 端口号是否正确（用代理软件界面确认）
3. 环境变量是否在当前 shell 中生效（运行 `echo $HTTPS_PROXY` 验证）

---

下一步：[GitHub Actions 集成](/integration/github-actions)
