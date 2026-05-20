# 14. 日志与故障排查

::: info 本章你将学到
- 日志文件在哪、长什么样
- 5 级日志级别怎么读
- 6 大常见症状的排查路径（带流程图）
- 怎么开 debug 模式定位问题
- 怎么给社区/官方报 bug（提供有用信息）
:::

## 14.1 日志文件位置

```
~/.openclaw/workspace/logs/
├── gateway.log              ← Gateway 主日志
├── agent-xiaozhao.log       ← 每个 agent 一份
├── channel-telegram.log     ← 每个 channel 一份
└── archive/                 ← 自动归档老日志
```

不想自己 tail，用：
```bash
openclaw logs tail
```

更优雅。

## 14.2 日志级别

OpenClaw 用 5 级日志：

| 级别 | 颜色 | 含义 | 怎么处理 |
|---|---|---|---|
| `ERROR` | 🔴 红 | 出错了，影响功能 | 必须看 |
| `WARN` | 🟡 黄 | 不正常但不致命 | 留意 |
| `INFO` | 🟢 绿 | 正常事件流 | 一般跳过 |
| `DEBUG` | 🔵 蓝 | 详细调试信息 | 默认不输出 |
| `TRACE` | ⚪ 灰 | 极详细栈 | 排查复杂 bug 时开 |

### 默认输出哪些

- 控制台/Dashboard 默认 `INFO+`
- `gateway.log` 文件保存 `DEBUG+`
- `TRACE` 必须显式开

### 看 DEBUG / TRACE

```bash
openclaw gateway --verbose          # DEBUG 级
openclaw gateway --log-level trace  # TRACE 级（很吵）
```

## 14.3 日志格式

```
2026-05-18T10:23:45.678Z [INFO]  agent:xiaozhao  msg=received channel=feishu user=ou_xxxx tokens=120
                ↑              ↑      ↑              ↑      ↑              ↑               ↑
              时间戳         级别   组件:子组件      事件   字段...                       字段...
```

逐字段：
- **时间戳**：ISO 8601 带毫秒，UTC
- **级别**：5 级之一
- **组件**：哪个模块输出的（gateway / agent:xxx / channel:xxx / skill:xxx）
- **后面**是 `key=value` 形式的结构化字段

::: tip 结构化好处
日志可以直接 grep + jq 处理：
```bash
openclaw logs grep "error" --json | jq '.[] | select(.channel == "telegram")'
```
:::

## 14.4 6 大常见症状速查

### ❌ 症状 1：Gateway 启不起来

**先跑**：
```bash
openclaw gateway status
openclaw gateway --port 18789 --verbose
```

看前 20 行输出，按错误分类：

| 错误信息 | 原因 | 解决 |
|---|---|---|
| `EADDRINUSE port 18789` | 端口被占 | `lsof -ti:18789 \| xargs kill -9` |
| `Cannot find module xxx` | 装包不完整 | `npm install -g openclaw@latest --force` |
| `Permission denied .openclaw` | 文件权限错 | `sudo chown -R $(whoami) ~/.openclaw` |
| `Workspace not found` | onboard 没跑 | `openclaw onboard --install-daemon` |

### ❌ 症状 2：Channel 接不上 / `status: error`

```bash
openclaw channels list
openclaw logs tail --channel <channel-id>
```

| 错误 | 原因 | 解决 |
|---|---|---|
| `401 Unauthorized` | token / app_secret 错 | 重新生成贴进 .env，restart |
| `ETIMEDOUT` | 网络不通（Telegram/Slack 常见） | 配代理 `export HTTPS_PROXY=...` |
| `ENOTFOUND` | DNS 解析失败 | 看 DNS 设置 / 防火墙 |
| `invalid app credentials` | 飞书 app_id 或 secret 错 | 回开发者后台核对 |
| `webhook verify failed` | 飞书/钉钉的验签 token 错 | 配置里更新 verification_token |

### ❌ 症状 3：消息收到了但 agent 不响应

**典型现象**：日志显示 `msg=received`，但没有后续 `agent reply`。

排查：
1. **agent 是否在跑**：`openclaw agents list`，状态必须 `✓ ready`
2. **channel 是否路由到 agent**：channel.yaml 的 `default_agent` 写对了？
3. **是否被 `mention_only` 拦截**：群里要 @ 机器人
4. **是否被 `allowed_users` 拦截**：你的 user_id 在白名单里？
5. **LLM provider 是否可用**：`openclaw providers test <id>`

```bash
# 一次性看完整链路
openclaw logs tail --agent <agent-id>
```

### ❌ 症状 4：Agent 回复很慢（>10 秒）

**通常是**：
- LLM 自身慢（换更快的 model 试，如 `deepseek-chat` 比 `deepseek-reasoner` 快）
- soul.md 太长（>2000 字开始有影响，>5000 字明显慢）
- skill 调用慢（看哪个 skill 在拖）

诊断：
```bash
openclaw agent --id xiaozhao -m "测试" --debug
```

输出会显示每一步耗时：
```
[DEBUG] Loaded soul: 1234 tokens (5ms)
[DEBUG] Loaded memory: 456 tokens (3ms)
[DEBUG] LLM call sent (2310ms)              ← 重点看这里
[DEBUG] Skill call: gmail.list (1890ms)     ← 或这里
```

### ❌ 症状 5：账单暴涨 / token 烧太快

```bash
openclaw stats usage --period 24h --by-agent
openclaw stats cost --period 24h
```

看哪个 agent 烧得多。可能原因：
- 某个 agent 被滥用（chat 白名单没设）
- skill 在死循环调用 LLM
- soul 写太长，每次对话都重新塞
- 没开 prompt 缓存（高级模型支持）

### ❌ 症状 6：Skill 装了不工作

```bash
openclaw skills list
# 看 ENABLED 列
```

不工作的常见原因：
- 没 enable（`openclaw skill enable <name>`）
- agent 没有这个 skill 的权限（看 `agent.yaml` 的 `skills:` 列表）
- skill 的依赖没装好（看 skill 目录 `package.json`）
- SKILL.md 写得不清楚 LLM 不知道怎么调（看 [17 章](/openclaw/advanced/write-skill)）

## 14.5 开 debug 模式深挖

3 种 debug 选项，从轻到重：

```bash
# 1. 单次命令 debug
openclaw agent -m "测试" --debug

# 2. Gateway verbose 启动
openclaw gateway --verbose

# 3. Gateway TRACE 级（极详细，几乎只用于报 bug）
openclaw gateway --log-level trace
```

TRACE 日志会**包含 prompt 完整内容**——非常长但能看到 LLM 收到的真实输入，调 prompt 利器。

## 14.6 给 OpenClaw 团队报 Bug

提交前先：
1. 升级到最新版（`npm install -g openclaw@latest`），看是否已修
2. 搜 [GitHub Issues](https://github.com/openclaw/openclaw/issues) 看是不是已知

### 报 bug 需要提供

```markdown
**环境**
- OS: macOS 14.5 / Ubuntu 22.04 / Windows 11 WSL2 Ubuntu 22.04
- Node.js: v24.1.0
- OpenClaw: v1.2.3
- Provider/Model: deepseek/deepseek-chat
- Channel: feishu

**重现步骤**
1. ...
2. ...
3. ...

**期望行为**
应该 X。

**实际行为**
报错 Y。

**日志（关键部分）**
\`\`\`
(从 `openclaw logs grep <error>` 截 5-20 行)
\`\`\`

**配置（脱敏）**
\`\`\`yaml
(贴关键 yaml，把 KEY 替换成 sk-***)
\`\`\`
```

提交位置：[github.com/openclaw/openclaw/issues/new](https://github.com/openclaw/openclaw/issues/new)

## 14.7 自查脚本

跑一遍这个脚本，能验证 90% 的环境问题：

```bash
#!/bin/bash
echo "=== OpenClaw 健康检查 ==="
echo
echo "Node.js: $(node --version)"
echo "OpenClaw: $(openclaw --version)"
echo
echo "Gateway:"
openclaw gateway status
echo
echo "Agents:"
openclaw agents list
echo
echo "Channels:"
openclaw channels list
echo
echo "Providers:"
openclaw providers list
echo
echo "Recent errors (last 1h):"
openclaw logs grep --since 1h "level=ERROR" | head -10
```

存为 `~/openclaw-doctor.sh`，遇事先跑一遍。

## 14.8 重置大法（当一切都不行时）

按破坏性从轻到重：

```bash
# Level 1: 重启
openclaw gateway restart

# Level 2: 重启 + 清 channel 缓存
openclaw channels restart --all

# Level 3: 重载所有 agent
for id in $(openclaw agents list --json | jq -r '.[].id'); do
  openclaw agents reload $id
done

# Level 4: 完全重新引导（保留 .env 和 workspace）
openclaw onboard --reset-soft

# Level 5: 核选项 - 完全重置（删全部数据！备份再做）
tar -czf ~/openclaw-bak.tar.gz ~/.openclaw    # 备份！
openclaw uninstall-daemon
rm -rf ~/.openclaw
npm uninstall -g openclaw
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

---

## 看完这一章你应该知道

✅ 日志在 `~/.openclaw/workspace/logs/`，用 `openclaw logs tail` 看
✅ 5 级日志：ERROR/WARN/INFO/DEBUG/TRACE
✅ 6 大症状的排查流程
✅ `--debug` 看单次命令详细栈
✅ 报 bug 必带：环境 + 重现 + 日志 + 脱敏配置
✅ "重置大法" 5 级递进

---

**下一步**：[15. 安全清单（必读）→](/openclaw/ops/security-checklist)

排查会了，下一章看更重要的：**怎么从一开始就避免出事**。
