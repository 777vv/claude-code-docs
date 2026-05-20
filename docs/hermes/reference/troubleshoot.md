# 38. 故障排除大全

::: info 怎么用本章
按你的症状从 5 类速查表里找。每个问题有：
- 症状描述
- 最常见原因
- 修复步骤

Ctrl+F 搜关键词（如 `EACCES` / `command not found`）。
:::

::: tip 首要原则
**任何问题先跑 `hermes doctor`**——80% 问题它能直接告诉你原因 + 修复命令。
:::

## 38.1 装不上类

### Q：`curl ... | bash` 装到一半 SSL_ERROR
**修复**：
```bash
# 用 ghfast.top 代理
curl -fsSL https://ghfast.top/https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### Q：装完 `hermes: command not found`
```bash
# 1. 重载 shell
source ~/.bashrc       # 或 ~/.zshrc

# 2. 还不行手动加 PATH
echo 'export PATH="$HOME/.hermes/agent/venv/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 3. 极端情况重装
~/.hermes/agent/scripts/install.sh
```

### Q：装报 `uv: command not found`
**原因**：脚本装 uv 失败（网络）。
**修复**：手动装 uv：
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc
# 重跑 Hermes 安装
```

### Q：装报 `Python 3.11 not available`
**修复**：
```bash
uv python install 3.11
# 重跑 Hermes
```

### Q：Windows 装好但 PowerShell 找不到 hermes
**原因**：你在 PowerShell，而 Hermes 在 WSL2 里装。
**修复**：开 Ubuntu 终端（WSL2），不在 PowerShell。**所有命令都在 WSL2 里跑**。

### Q：磁盘空间不够
**原因**：Hermes + Python + Node + 工具加起来约 1.5 GB。
**修复**：腾出 5GB 以上空间。

## 38.2 启不动类

### Q：`hermes` 启动报 `No LLM provider configured`
**修复**：
```bash
hermes setup
# 配 LLM
```

### Q：`hermes gateway start` 报 `Port already in use`
```bash
# 找谁占了
lsof -ti:18789

# 干掉
lsof -ti:18789 | xargs kill -9

# 重启
hermes gateway start
```

或换端口：
```bash
hermes gateway --port 18790
```

### Q：`Workspace ~/.hermes/config.yaml not found`
**修复**：
```bash
hermes setup
```

### Q：`Permission denied: ~/.hermes`
```bash
sudo chown -R $(whoami) ~/.hermes
```

### Q：Hermes 启动卡住不动
看详细输出：
```bash
hermes gateway --verbose
```

按报错对症。常见：网络问题 / API Key 错。

## 38.3 连不上类

### Q：Telegram channel 一直 `ETIMEDOUT`
**原因**：网络不通 Telegram。
**修复**：
```bash
# 给 Hermes 配代理
export HTTPS_PROXY=http://127.0.0.1:7890
hermes gateway restart
```

### Q：Discord bot 显示在线但收不到消息
**原因**：**MESSAGE CONTENT INTENT 没开**（80% 的 Discord 坑）。
**修复**：去 [Discord Developer Portal](https://discord.com/developers/applications) → Bot → 开 **MESSAGE CONTENT INTENT**。

### Q：LLM 调用 `401 Unauthorized`
**修复**：API Key 错了。
```bash
# 改 .env
vim ~/.hermes/.env
# 重启
hermes gateway restart
```

### Q：LLM 调用 `429 Too Many Requests`
**原因**：超限速。
**修复**：
- 等几秒（Hermes 自动 retry）
- 升级 LLM 账户层级
- 改 model 到限速宽松的

### Q：阿里 DashScope `403 Forbidden`
**修复**：base_url 写错。**对**：`https://dashscope.aliyuncs.com/compatible-mode/v1`

### Q：Ollama `ECONNREFUSED`
**修复**：Ollama 服务没启。
```bash
ollama serve
# 或 macOS 打开 Ollama 应用
```

## 38.4 跑不通类

### Q：Agent 不调任何工具，只聊天
**原因**：toolset 没启用。
```bash
hermes tools enable core
```

### Q：Skill 装了但不被触发
**修复**：
```bash
hermes skills test <name> --query "your test phrase"
```
看 match score。如果 < 0.65：
- triggers 词加更多变体
- description 改更准确

### Q：Subagent 派了但没结果
**修复**：
```bash
hermes subagent list --live
# 看哪些卡住
hermes subagent logs <id>
```

常见：
- 超时（调高 timeout）
- LLM 限速（subagent 在 retry）
- backend 问题（如 modal token 过期）

### Q：Memory 没记住事
**修复**：
```bash
hermes memory list
# 没记 → 手动 add
hermes memory add "重要事实"
```

调低 retrieval threshold：
```yaml
memory:
  retrieval:
    similarity_threshold: 0.3
```

### Q：cron 不触发
**清单**：
1. `hermes workflow list` 看是否 enabled
2. Gateway 在跑？（cron 是 Gateway 内部触发）
3. 时区对吗？`timezone: Asia/Shanghai`
4. cron 语法对吗？用 [crontab.guru](https://crontab.guru) 验证

### Q：Honcho 一直说 "training"
**原因**：刚装，数据不够。
**修复**：用够 2 周自然成熟。或：
```bash
hermes memory honcho --seed-from sessions
```
用历史 session 加速 seeding。

## 38.5 性能差 / 烧钱类

### Q：回复非常慢（> 10s）
```bash
hermes --debug "test"
```
看每步耗时找瓶颈。优化：
- soul 太长 → 精简
- LLM 慢 → 换更快的 model
- skill 调用慢 → 看 trajectory 找

### Q：账单暴涨
```bash
hermes stats --period 24h --by-model --by-agent
```
找出谁烧得多。常见：
- subagent 失控 → 设并发上限
- skill 死循环 → 看 trajectory
- 没开 prompt cache（Anthropic）→ 配上

### Q：内存涨到 4 GB+
**原因**：可能 FTS5 / 日志没清理。
```bash
hermes logs rotate
hermes memory compact
```

或检查 skill 是否泄漏：
```bash
docker stats hermes
```

## 38.6 安全 / 数据类

### Q：怀疑 API Key 泄露
1. 服务商后台 revoke 旧 Key
2. 生成新填 `.env`
3. `hermes gateway restart`
4. 看历史账单异常用量

### Q：Trajectory 不小心传到了公开仓库
1. 立刻删（GitHub 还会有缓存，最好把仓库 transfer 到 private 再清）
2. revoke 该 trajectory 涉及的所有 Key
3. 看 trajectory 内容评估损失

### Q：Memory 想全删
```bash
# 备份
tar -czf mem-bak.tar.gz ~/.hermes

# 清
hermes memory clear --confirm
```

### Q：误删了 workspace
**修复**：从备份恢复（[15 章 备份策略](/hermes/ops/security-checklist#_15-8-🟢-备份策略)）

## 38.7 OpenClaw 迁移类

### Q：`hermes claw migrate` 报"OpenClaw 未检测到"
**修复**：
```bash
hermes claw migrate --src /path/to/your/openclaw/workspace
```

### Q：迁完 skill 不工作
**原因**：OpenClaw 和 Hermes skill 格式略不同。
**修复**：看 `~/.hermes/migration-suggestions/` 里的建议。手动调整有问题的 skill。

### Q：迁完 feishu channel 没用
**预期**：Hermes 不原生支持飞书。建议用 [33 章桥接](/hermes/cases/with-other-tools)。

## 38.8 调试技巧

### 看 trajectory

```bash
hermes trajectory last
# 看刚才的任务每一步
```

### Dry-run

```bash
hermes --dry-run "..."
# 模拟跑，不真执行
```

### TRACE 日志（含完整 prompt）

```bash
hermes --log-level trace "..."
```

⚠️ TRACE 日志含敏感信息，不要分享。

### 单独测 backend / platform

```bash
hermes backend test docker
hermes platform test telegram
hermes mcp test github
```

## 38.9 报 Bug

提交前：
1. 升到最新版 `hermes update`
2. 跑 `hermes doctor` 看是否已知
3. 搜 [GitHub Issues](https://github.com/NousResearch/hermes-agent/issues)

报 bug 包含（脱敏！）：

```markdown
**环境**
- OS:
- Hermes:
- LLM provider:

**复现**
1.
2.
3.

**期望 vs 实际**

**日志关键**（脱敏 Key）
\`\`\`
...
\`\`\`

**配置**（脱敏 Key）
\`\`\`yaml
...
\`\`\`
```

提到：[github.com/NousResearch/hermes-agent/issues](https://github.com/NousResearch/hermes-agent/issues)

## 38.10 万能复位

按破坏性从低到高：

```bash
# Level 1: 重启
hermes gateway restart

# Level 2: 重启 platform
hermes platform restart telegram

# Level 3: doctor --fix
hermes doctor --fix

# Level 4: 软重置（保留 workspace）
hermes setup --reset

# Level 5: 完全重装（备份再来！）
tar -czf hermes-bak.tar.gz ~/.hermes
~/.hermes/agent/scripts/uninstall.sh
rm -rf ~/.hermes
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
hermes setup
```

---

**下一步**：[39. 术语表 →](/hermes/reference/glossary)

中英对照所有 Hermes 行话。
