# 38. 故障排除大全

::: info 怎么用这一章
按你的现象，从 5 类速查表里找到对应章节。每个问题有：
- 症状描述
- 最常见原因
- 修复步骤
- 还没好？下一步

需要时 Ctrl+F 搜关键词（如 `EADDRINUSE` / `401`）。
:::

## 38.1 装不上类

### 38.1.1 `npm install -g openclaw` 报 EACCES

**症状**：
```
npm ERR! code EACCES
npm ERR! syscall mkdir
npm ERR! path /usr/local/lib/node_modules/openclaw
```

**原因**：没用 nvm 装 Node，全局目录是 root 拥有。

**修复**：装 nvm 重装 Node（[5 章](/openclaw/intro/nodejs)）。

不想动 Node：
```bash
sudo chown -R $(whoami) ~/.npm /usr/local/lib/node_modules
```

### 38.1.2 `openclaw: command not found`

**症状**：装完 `openclaw --version` 提示找不到。

**原因**：npm 全局 bin 不在 PATH。

**修复**：
```bash
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 38.1.3 Windows `wsl --install` 报 0x80370102

**原因**：BIOS 没开 CPU 虚拟化。

**修复**：进 BIOS（开机按 Del/F2），找 `VT-x`（Intel）或 `SVM`（AMD），enable，保存重启。

### 38.1.4 `Cannot find module 'xxx'` 装包后

**原因**：装包不完整或缓存损坏。

**修复**：
```bash
npm cache clean --force
npm install -g openclaw@latest --force
```

### 38.1.5 Node 版本不够

**症状**：`openclaw` 启动报 `requires Node.js >= 22.19, got 20.x`。

**修复**：
```bash
nvm install 24
nvm use 24
nvm alias default 24
```

---

## 38.2 启不动类

### 38.2.1 `EADDRINUSE port 18789`

**原因**：之前的 Gateway 没关，或别的服务占了 18789。

**修复**：
```bash
# 查谁占了
lsof -ti:18789

# 干掉
lsof -ti:18789 | xargs kill -9

# 重启
openclaw gateway start
```

或者换端口：`openclaw gateway --port 18790`

### 38.2.2 Workspace not found

**症状**：`Workspace directory ~/.openclaw/workspace not found`

**原因**：onboard 没跑完。

**修复**：
```bash
openclaw onboard --install-daemon
```

### 38.2.3 Permission denied 写 ~/.openclaw

**原因**：之前用 sudo 跑过 openclaw，目录权限错。

**修复**：
```bash
sudo chown -R $(whoami) ~/.openclaw
```

### 38.2.4 启动后立刻 Crash

**修复**：用 verbose 看错原因：
```bash
openclaw gateway --port 18789 --verbose
```

按报错对照解决。常见：
- API Key 缺失/错（前 50 行有提示）
- skill 解析失败（看是哪个 skill）
- yaml 语法错

---

## 38.3 连不上类

### 38.3.1 Channel `401 Unauthorized`

**原因**：token / api key 错。

**修复**：
- Telegram: 去 @BotFather 用 `/token` 重新看
- 飞书: 「凭证与基础信息」核对
- 钉钉: 同上

更新 `.env` 后 `openclaw gateway restart`。

### 38.3.2 Channel `ETIMEDOUT`

**原因**：网络打不通 channel 服务器。

**修复**：
- Telegram / Slack / Discord: 配 HTTPS_PROXY
  ```bash
  export HTTPS_PROXY=http://127.0.0.1:7890
  openclaw gateway restart
  ```
- 飞书 / 钉钉 / 企微: 检查防火墙、是否走了代理（应该不走）

### 38.3.3 飞书 `99991663 invalid app credentials`

**原因**：App ID 或 Secret 错。

**修复**：飞书开发者后台 → 「凭证与基础信息」复制最新的，覆盖 `.env`。

### 38.3.4 群里 @ bot 不响应

**原因**清单：
1. bot 没加入群（拉一下）
2. 没开 group 权限（飞书 → `im.message.group_at_msg`）
3. group_mode 配错（要 `mention_only` 或 `all_messages`）
4. @ 时用了错误名字（要 @ bot 的英文 username）

### 38.3.5 私聊有反应，群里没反应

**原因**：Telegram Privacy 模式开着，bot 看不到群消息。

**修复**：去 @BotFather → `/setprivacy` → DISABLE。

---

## 38.4 跑不通类

### 38.4.1 Agent 报 `Provider 'xxx' not found`

**原因**：`agent.yaml` 引用的 provider id 在 `providers.yaml` 里没定义。

**修复**：拼写核对，或加上对应 provider。

### 38.4.2 LLM 报 `429 Too Many Requests`

**原因**：调用频率超 LLM 服务商限速。

**修复**：
- 等几秒（OpenClaw 自动 retry）
- 升级账户层级
- 改 deepseek-chat 这种限速宽松的

### 38.4.3 LLM 报 `Insufficient Balance`

**原因**：账户余额不够。

**修复**：去服务商充值。

### 38.4.4 Skill 装了但 LLM 不用

**症状**：你问"看一下邮箱"，agent 直接说"我没法看邮箱"。

**原因**清单：
1. skill 没 enable（`openclaw skill enable gmail --agent xiaozhao`）
2. agent.yaml 里 `skills:` 没列
3. SKILL.md 的 `When to use` 写得不够清楚

**修复**：
```bash
openclaw skills list --agent xiaozhao
# 确认 ENABLED 列 ✓
# 不行就 reload
openclaw agents reload xiaozhao
```

### 38.4.5 Memory 不持久

**症状**：每次对话 agent 都忘了昨天说的。

**原因**清单：
1. 没装 `core/memory` skill
2. `memory.md` 文件被删 / 权限错
3. Memory 检索阈值太高（相关性 < threshold 都不命中）

**修复**：
```yaml
# agent.yaml
memory:
  retrieval:
    similarity_threshold: 0.3   # 降低门槛
```

### 38.4.6 Cron workflow 不触发

**原因**清单：
1. workflow 没 enable（`openclaw workflow enable <name>`）
2. Gateway 没在跑（cron 是 Gateway 内部触发）
3. 时区不对（设 `timezone: Asia/Shanghai`）
4. cron 语法错（用 [crontab.guru](https://crontab.guru) 验证）

---

## 38.5 性能差类

### 38.5.1 Agent 回复非常慢（>10s）

**诊断**：
```bash
openclaw agent -m "测试" --debug
```

看每步耗时。优化：
- soul.md > 2000 字 → 精简
- skill 调用慢 → 看具体哪个，优化它
- LLM 慢 → 换更快的模型（deepseek-chat 比 reasoner 快）

### 38.5.2 账单暴涨

**诊断**：
```bash
openclaw stats cost --period 24h --by-agent
```

找出最烧的 agent。常见：
- skill 死循环
- soul 太长每次重新塞
- agent 被群里滥用（设 allowed_users）

### 38.5.3 内存占用高

```bash
docker stats openclaw       # Docker
# 或
ps aux | grep openclaw      # 直接装的
```

正常 200-500 MB。> 2 GB 异常，可能：
- 历史日志没归档
- memory.md 几万条
- skill 内存泄漏

修复：
```bash
openclaw logs archive --before 30d
```

### 38.5.4 Channel 处理消息越来越慢

**原因**：channel 队列堆积。

**修复**：调高并发：
```yaml
# channel.yaml
concurrent_handlers: 10
```

或 throttle 上游：
```yaml
rate_limit:
  per_user_per_minute: 5
```

---

## 38.6 安全类

### 38.6.1 怀疑 API Key 泄露

**应急流程**：
1. 立刻去服务商后台 revoke 旧 Key
2. 生成新 Key 填 `.env`，restart Gateway
3. 看历史账单，异常使用申诉
4. 排查泄露源：git / 截图 / 日志

### 38.6.2 Channel 收到陌生人骚扰

**修复**：
```yaml
# channel.yaml
allowed_users:
  - 123456789       # 只允许你自己
```

### 38.6.3 Dashboard 暴露公网了

**应急**：
1. `openclaw gateway stop` 立刻停
2. 改 `bind_host: 127.0.0.1`
3. 启动，走 SSH 隧道访问
4. 修改 LLM Key（万一被人改过）
5. 看日志确认没人改过配置

### 38.6.4 Skill 行为可疑

**应急**：
```bash
openclaw skill disable <name> --all-agents
# 看源码
cat ~/.openclaw/workspace/skills/<name>/handler.js
# 如果可疑就删
openclaw skill uninstall <name>
```

---

## 38.7 万能复位

按破坏性从低到高，依次尝试：

```bash
# Level 1: 重启 Gateway
openclaw gateway restart

# Level 2: 重启 channel
openclaw channels restart --all

# Level 3: Reload 所有 agent
for id in $(openclaw agents list --json | jq -r '.[].id'); do
  openclaw agents reload $id
done

# Level 4: 软重置（保留 workspace）
openclaw onboard --reset-soft

# Level 5: 核选项 - 完全重装（备份再来）
tar -czf ~/openclaw-bak.tar.gz ~/.openclaw
openclaw uninstall-daemon
rm -rf ~/.openclaw
npm uninstall -g openclaw
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

---

## 38.8 报 Bug 的正确姿势

提交前：
1. 升到最新版 `npm i -g openclaw@latest`
2. 搜 [GitHub Issues](https://github.com/openclaw/openclaw/issues) 看是不是已知

报 bug 包含：
- 环境（OS / Node / OpenClaw 版本）
- 复现步骤
- 期望 vs 实际
- 关键日志（脱敏 Key）
- 关键配置（脱敏）

提到：[github.com/openclaw/openclaw/issues](https://github.com/openclaw/openclaw/issues)

---

**下一步**：[39. 术语表 →](/openclaw/reference/glossary)

中英对照所有"行话"，方便你跟社区沟通。
