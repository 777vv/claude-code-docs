# 12. CLI 命令手册

::: info 本章你将学到
- OpenClaw 全部核心命令一览（30+ 命令）
- 按"管 Gateway / 管 Agent / 管 Channel / 管 Skill / 看数据"分组
- 每个命令的常用参数 + 真实例子
- 速查表（收藏本页 / `Ctrl+F` 搜索）
:::

::: tip 本章不需要从头读
**当工具书用**。需要时 Ctrl+F 搜命令名（如 `gateway start`）跳到对应章节。
:::

## 12.1 总览：命令树

```
openclaw
├── --version              查版本
├── --help                 看帮助
├── onboard                首次配置向导
├── gateway                Gateway 管理
│   ├── start
│   ├── stop
│   ├── restart
│   ├── status
│   └── --port
├── agent                  Agent 对话/管理
│   ├── (直接调用)
│   ├── reload <id>
│   └── list
├── agents                 多 agent 操作
│   ├── list
│   └── reload <id>
├── channels               Channel 管理
│   ├── list
│   ├── start <id>
│   ├── stop <id>
│   └── restart <id>
├── skill                  单个 Skill 操作
│   ├── install
│   ├── uninstall
│   ├── enable
│   └── disable
├── skills                 Skill 列表
│   └── list
├── providers              LLM Provider 管理
│   ├── list
│   └── test
├── message                主动发消息
│   └── send
├── memory                 记忆管理
│   ├── list
│   ├── add
│   └── clear
├── stats                  数据统计
│   ├── usage
│   └── cost
├── logs                   日志
│   ├── tail
│   └── grep
└── uninstall-daemon       卸载服务
```

## 12.2 Gateway 管理（最常用）

### `openclaw gateway start`
启动 Gateway。如果已经在跑，会提示。

### `openclaw gateway stop`
停止 Gateway。

### `openclaw gateway restart`
重启（改了配置后必跑）。

### `openclaw gateway status`
查看运行状态。
```
● openclaw-gateway
   Status: running
   PID: 12345
   Uptime: 2h 13m
   Port: 18789
   Memory: 245MB
   Active agents: 2
   Active channels: 3
```

### `openclaw gateway --port 18789`
前台启动（看实时输出，调试时用）。

### `openclaw gateway --verbose`
详细日志模式。

## 12.3 Agent 对话与管理

### 直接对话

```bash
openclaw agent --message "你好"
# 或
openclaw agent -m "你好"
```

### 指定 agent

```bash
openclaw agent --id xiaozhao --message "你好"
```

### 单次换模型

```bash
openclaw agent -m "复杂任务" --provider anthropic --model claude-opus-4-7
```

### 设思考强度

```bash
openclaw agent -m "随便聊" --thinking low      # 不深思，快
openclaw agent -m "重要决策" --thinking high   # 深思，慢，质量好
```

### 列出所有 agent

```bash
openclaw agents list
```

输出：
```
ID         NAME       MODEL                          STATUS   CHANNELS
xiaozhao   小爪       deepseek/deepseek-chat         ✓ ready  telegram, feishu
code-bot   代码助手   anthropic/claude-sonnet-4-6    ✓ ready  feishu
```

### 重新加载一个 agent（改 soul.md 后）

```bash
openclaw agents reload xiaozhao
```

## 12.4 Channel 管理

### 列出所有 channel

```bash
openclaw channels list
```

### 停 / 启 / 重启某个 channel

```bash
openclaw channels stop telegram
openclaw channels start telegram
openclaw channels restart feishu
```

::: tip 单独重启 channel
比 `gateway restart` 影响小，不会断 agent 对话状态。
:::

## 12.5 Skill 管理

### 看已装的 skill

```bash
openclaw skills list
```

输出：
```
NAME              SOURCE      ENABLED   AGENTS
memory            bundled     ✓         all
gmail             clawhub     ✓         xiaozhao
weather           clawhub     ✗         (none)
my-custom         workspace   ✓         code-bot
```

### 装一个 skill

从 ClawHub 装：
```bash
openclaw skill install gmail
```

装本地 skill：
```bash
openclaw skill install ./my-custom-skill
```

指定 agent：
```bash
openclaw skill install weather --agent xiaozhao
```

### 卸载

```bash
openclaw skill uninstall weather
```

### 启用 / 禁用

```bash
openclaw skill disable weather --agent xiaozhao
openclaw skill enable weather --agent xiaozhao
```

### 看 skill 详情

```bash
openclaw skill info gmail
```

## 12.6 Provider 管理

### 列出已配的 provider

```bash
openclaw providers list
```

### 测试某个 provider 是否能用

```bash
openclaw providers test deepseek
```

输出：
```
Testing deepseek...
✓ API endpoint reachable
✓ API key valid
✓ Model 'deepseek-chat' available
Latency: 320ms
```

## 12.7 主动发消息

### 命令格式

```bash
openclaw message send \
  --channel <channel_id> \
  --target <user_or_group_id> \
  --message "内容"
```

### 例子：给 Telegram 用户

```bash
openclaw message send \
  --channel telegram \
  --target 123456789 \
  --message "下午 4 点开会提醒"
```

### 例子：给飞书群

```bash
openclaw message send \
  --channel feishu \
  --target oc_xxxxxxxxxx \
  --message "🚨 项目 CI 失败了"
```

### 例子：通过 agent 推（带智能）

```bash
openclaw agent --id xiaozhao --message "给老婆发条消息说我下班了" --send-to feishu
```

## 12.8 Memory 管理

### 看一个 agent 记住了什么

```bash
openclaw memory list --agent xiaozhao
```

### 手动添加一条记忆

```bash
openclaw memory add --agent xiaozhao --content "主人对花生过敏"
```

### 清空一个 agent 的所有记忆

```bash
openclaw memory clear --agent xiaozhao --confirm
```

::: warning 不可恢复
`clear` 直接删 memory.md。建议先备份：
```bash
cp ~/.openclaw/workspace/agents/xiaozhao/memory.md memory.md.bak
```
:::

## 12.9 数据统计

### 查 token 使用

```bash
openclaw stats usage --period 7d
openclaw stats usage --period 30d
openclaw stats usage --period today
```

### 查花了多少钱

```bash
openclaw stats cost --period 30d
```

### 按 agent 拆分

```bash
openclaw stats cost --period 7d --by-agent
```

输出：
```
AGENT       INPUT       OUTPUT      COST
xiaozhao    1,234,567   234,567     ¥1.70
code-bot    345,678     67,890      ¥0.50
news-bot    234,567     12,345      ¥0.30

TOTAL                               ¥2.50
```

## 12.10 日志

### 实时跟踪（最常用）

```bash
openclaw logs tail
# 类似 tail -f
```

### 只看某 agent

```bash
openclaw logs tail --agent xiaozhao
```

### 只看某 channel

```bash
openclaw logs tail --channel feishu
```

### 搜索历史日志

```bash
openclaw logs grep "error"
openclaw logs grep "401" --since 1h
```

### 看一段时间的所有日志

```bash
openclaw logs show --since 10m
openclaw logs show --since "2026-05-18 09:00"
```

## 12.11 备份与导出

### 备份整个 workspace

```bash
tar -czf openclaw-backup-$(date +%F).tar.gz ~/.openclaw/workspace
```

### 导出对话历史

```bash
openclaw export --agent xiaozhao --format json --output history.json
```

### 导出 agent 配置（迁移到新机器）

```bash
openclaw export --agent xiaozhao --include-config --output xiaozhao.bundle
```

新机器导入：
```bash
openclaw import xiaozhao.bundle
```

## 12.12 卸载

### 卸载 daemon 注册

```bash
openclaw uninstall-daemon
```

### 删除 npm 包

```bash
npm uninstall -g openclaw
```

### 删除所有数据（不可恢复）

```bash
rm -rf ~/.openclaw
```

## 12.13 速查表（按场景）

| 我想做 | 命令 |
|---|---|
| 装好 OpenClaw 后第一步 | `openclaw onboard --install-daemon` |
| 改了 yaml 怎么生效 | `openclaw gateway restart` |
| 改了 soul.md 怎么生效 | `openclaw agents reload <id>` |
| 服务好像挂了 | `openclaw gateway status` → `start` |
| 实时看发生了什么 | `openclaw logs tail` |
| 查一下钱花在哪了 | `openclaw stats cost --period 7d --by-agent` |
| 一次性测试 agent | `openclaw agent -m "测试"` |
| 装个新 skill | `openclaw skill install <name>` |
| 看 agent 记住了啥 | `openclaw memory list --agent <id>` |
| 给某人主动发消息 | `openclaw message send --channel <c> --target <id> --message "..."` |
| 备份所有 | `tar -czf bak.tar.gz ~/.openclaw/workspace` |
| 完全卸载 | `openclaw uninstall-daemon && npm uninstall -g openclaw && rm -rf ~/.openclaw` |

## 12.14 全局参数

每个命令都支持：

| 参数 | 作用 |
|---|---|
| `-h, --help` | 看这个命令的详细帮助 |
| `--debug` | 输出 debug 级日志 |
| `--quiet` | 只输出错误 |
| `--json` | 输出 JSON 格式（脚本里用） |
| `--workspace <path>` | 用指定 workspace（不是默认 `~/.openclaw/workspace`） |

### 例子

```bash
# 我自己改了 workspace 位置
openclaw gateway start --workspace /opt/openclaw-prod

# 脚本里用 JSON 输出
openclaw agents list --json | jq '.[].id'
```

---

## 看完这一章你应该知道

✅ Gateway 5 个核心命令：start / stop / restart / status / --port
✅ Agent / Channel / Skill 都有对应的 list / reload / install
✅ `openclaw logs tail` 是排错神器
✅ `openclaw stats cost` 看每天烧多少钱
✅ 收藏本页，需要时 Ctrl+F 搜命令

---

**下一步**：[13. Dashboard 控制台 →](/openclaw/ops/dashboard)

CLI 是高效的，但有时候你想"看一眼整体状态"——下一章带你逛 Dashboard 浏览器界面。
