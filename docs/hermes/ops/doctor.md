# 14. hermes doctor 与排查

::: info 本章你将学到
- `hermes doctor` 一条命令的完整自检能力
- 它检测的 30+ 项内容
- 自动修复 + 手动修复对照
- 看懂日志：5 级日志、关键事件
- 6 大常见症状的排查流程
:::

::: tip 经验之谈
**任何 Hermes 问题，第一反应跑 `hermes doctor`**。80% 的问题它能直接告诉你原因 + 修复命令。
:::

## 14.1 `hermes doctor` 都查什么

跑一次：

```bash
hermes doctor
```

输出 8 大块：

```
🔍 Hermes Doctor

[1/8] Environment
  ✓ OS: macOS 14.5 (arm64)
  ✓ Python: 3.11.7 (managed by uv)
  ✓ uv: 0.5.2
  ✓ Node.js: v22.1.0
  ✓ git: 2.43.0
  ✓ ripgrep: 14.1.0
  ✓ ffmpeg: 6.1.1
  ✓ curl, wget, jq

[2/8] Hermes Installation
  ✓ Version: 0.8.3 (latest)
  ✓ Source: ~/.hermes/agent
  ✓ venv: ~/.hermes/agent/venv
  ✓ Last update check: 2h ago

[3/8] Workspace
  ✓ ~/.hermes exists
  ✓ Permissions OK
  ✓ Disk space: 47 GB free
  ⚠ Logs size: 1.2 GB (consider rotation)

[4/8] Config
  ✓ ~/.hermes/config.yaml: valid
  ✓ ~/.hermes/.env: exists
  ✓ No syntax errors

[5/8] LLM Providers
  ✓ deepseek: configured, reachable, balance ¥45
  ⚠ openrouter: configured, API call failed (401)
  ✓ ollama: not configured (skipped)

[6/8] Memory
  ✓ Honcho: initialized
  ✓ FTS5: 1234 sessions indexed (45 MB)
  ✓ memory.md: 23 entries
  ✓ user.md: 12 traits learned

[7/8] Backends
  ✓ local: ready
  ⚠ docker: not installed (optional)
  ✗ ssh: misconfigured - missing private key

[8/8] Platforms (Channels)
  ✓ telegram: connected (bot: @my_hermes_bot)
  ⚠ discord: token invalid (401)

──────────────────────────────────────────
Summary: 3 warnings, 1 critical issue

Critical: openrouter API returned 401
  Fix: Update your OpenRouter API key
       hermes config set llm.providers.openrouter.api_key <new_key>

Warnings:
  - SSH backend misconfigured (optional)
  - Discord token invalid
  - Logs size > 1 GB (run 'hermes logs rotate')
```

**绿色 ✓** = OK；**黄色 ⚠** = 警告但能跑；**红色 ✗** = 故障必须修。

## 14.2 doctor --fix 自动修复

```bash
hermes doctor --fix
```

它会尝试自动修复：
- 创建缺失目录
- 修文件权限
- 重新链接 PATH
- 清理大日志
- 重启卡住的 gateway
- 重新下载缺失依赖

修不了的（如 API Key 错）会清楚告诉你怎么手动改。

## 14.3 看日志

### 实时跟踪

```bash
hermes gateway --verbose      # 启动 + 详细日志
# 或
hermes logs tail              # 跟踪已有 daemon
```

### 看历史日志

```bash
hermes logs show --since 1h
hermes logs show --since "2026-05-18 09:00"
hermes logs search "error" --since 24h
```

### 日志文件位置

```
~/.hermes/logs/
├── gateway.log              # gateway 主日志
├── agent-<name>.log         # 每个 agent 一份
├── platform-<id>.log        # 每个 platform 一份
└── archive/                 # 自动归档
```

### 日志级别

| 级别 | 颜色 | 含义 |
|---|---|---|
| `ERROR` | 🔴 | 出错了，影响功能 |
| `WARN` | 🟡 | 不正常但还能跑 |
| `INFO` | 🟢 | 正常事件流 |
| `DEBUG` | 🔵 | 默认不输出，`--verbose` 启用 |
| `TRACE` | ⚪ | 包含 prompt 完整内容，`--log-level trace` |

### 调整级别

```bash
# 临时
hermes gateway --log-level debug

# 永久
hermes config set log.level debug
```

## 14.4 6 大常见症状速查

### ❌ 症状 1：装完 `hermes: command not found`

```bash
# 1. 重新加载 shell
source ~/.bashrc

# 2. 还不行：手动加 PATH
echo 'export PATH="$HOME/.hermes/agent/venv/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 3. 还不行：重装
~/.hermes/agent/scripts/install.sh
```

### ❌ 症状 2：跑对话报 `No LLM provider configured`

```bash
hermes doctor    # 看 [5/8] LLM Providers
# 没配 → hermes setup
# 配了但 401 → 改 API Key
hermes config set llm.providers.deepseek.api_key <new>
```

### ❌ 症状 3：Channel 收消息没反应

```bash
# 1. gateway 在跑？
hermes gateway status
# 没在跑 → hermes gateway start

# 2. platform 状态？
hermes platform list
# 看到 ⚠ 或 ✗ → 修复

# 3. 看实时日志找原因
hermes logs tail --platform telegram
```

常见原因：
- Telegram bot privacy 没禁（群里看不到消息）
- Discord MESSAGE CONTENT intent 没开
- 网络代理问题

### ❌ 症状 4：Agent 回答慢（>10 秒）

```bash
hermes --debug "测试一下"
```

看 debug 输出每步耗时：
```
[DEBUG] Loaded context: 1234 tokens (12ms)
[DEBUG] Honcho query: (89ms)
[DEBUG] FTS5 search: (45ms)
[DEBUG] LLM call: deepseek (2340ms)   ← 这步慢
[DEBUG] Tool: web_search (1890ms)     ← 或这步
```

优化方向：
- LLM 慢 → 换更快的（deepseek-chat 比 reasoner 快）
- 工具慢 → 看具体哪个，针对性优化
- 上下文太大 → 开 dual_compression（[8 章](/hermes/setup/model-provider#_8-7-anthropic-prompt-caching-独家优化)）

### ❌ 症状 5：账单暴涨

```bash
hermes stats --period 24h --by-model
hermes stats --period 24h --by-agent
```

找出谁烧得多。常见：
- 死循环 agent loop（看 trajectory 是否反复重复工具调用）
- 长 prompt 没缓存（开 Anthropic prompt caching）
- subagent 失控（设并发上限）

### ❌ 症状 6：FTS5 / Honcho / Memory 坏了

```bash
# 重建 FTS5 索引
hermes memory rebuild-index

# 重置 Honcho
hermes memory honcho --reset

# 完全清空记忆（**会丢历史**）
hermes memory clear --confirm
```

清空前**先备份**：`tar -czf mem-bak.tar.gz ~/.hermes/data ~/.local/share/hermes`

## 14.5 调试技巧

### 看 LLM 实际收到的 prompt

```bash
hermes --log-level trace "..."
```

会输出完整 prompt 内容。**注意 trace 会暴露你的 system prompt + memory，不要分享日志给陌生人**。

### 看 trajectory（任务执行轨迹）

```bash
hermes trajectory last
```

输出上一次任务的完整步骤：
```
Trajectory: 2026-05-19_14-32-15
Steps: 8
Tokens: 12K in, 4K out
Cost: ¥0.15

Step 1: User → "整理 ~/Documents 里的 PDF"
Step 2: Tool: list_dir → 47 PDFs
Step 3: LLM reasoning: "需要按内容分类"
Step 4: Tool: read_pdf (3 文件抽样)
...
Step 8: Final response → "完成"
```

trajectory 也能导出训练用：
```bash
hermes export trajectory --last 10 --output ./trajs.jsonl
```

### Dry-run

```bash
hermes --dry-run "改一下 README"
```

模拟跑：显示**要做什么 + 调哪些工具**，但**不真的执行**。安全测试用。

## 14.6 报 Bug 的格式

提交前：
1. 跑 `hermes update` 升到最新
2. 跑 `hermes doctor` 看是否已知
3. 搜 [GitHub Issues](https://github.com/NousResearch/hermes-agent/issues)

报 bug 必含：

```markdown
**环境** (从 hermes doctor 复制)
- OS:
- Hermes:
- Python:
- LLM provider:

**重现步骤**
1.
2.
3.

**期望**
...

**实际**
...

**日志关键部分** (脱敏)
\`\`\`
(从 hermes logs search <error> 截 20 行)
\`\`\`

**配置** (脱敏)
\`\`\`yaml
(贴关键 yaml，把 Key 替换 sk-***)
\`\`\`
```

提到：[github.com/NousResearch/hermes-agent/issues](https://github.com/NousResearch/hermes-agent/issues)

## 14.7 万能复位

按破坏性从低到高：

```bash
# Level 1: 重启
hermes gateway restart

# Level 2: 重启 platform
hermes platform restart telegram

# Level 3: 重载 memory
hermes memory reload

# Level 4: 完全 doctor --fix
hermes doctor --fix

# Level 5: 软重置（保留 workspace）
hermes setup --reset

# Level 6: 核选项 - 完全重装
tar -czf hermes-bak.tar.gz ~/.hermes      # 备份！
~/.hermes/agent/scripts/uninstall.sh
rm -rf ~/.hermes
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
hermes setup
```

---

## 看完这一章你应该知道

✅ `hermes doctor` 30+ 项自检 + 自动建议
✅ `hermes doctor --fix` 能修一半问题
✅ 5 级日志，trace 含完整 prompt
✅ 6 大常见症状的排查路径
✅ `hermes trajectory` 看任务执行轨迹
✅ 重置 6 级，先备份再上核选项

---

**下一步**：[15. 安全清单（必读）→](/hermes/ops/security-checklist)

会用会查了，下一章看更重要的：**怎么避免从一开始就出事**。
