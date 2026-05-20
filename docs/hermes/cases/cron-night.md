# 29. 案例 5：定时夜班任务

::: info 这个案例你将搭出
让 Hermes 在你睡觉时（凌晨 1-6 点）：
- 用 SSH backend 跑在远程服务器
- 自动跑长任务（数据处理 / 备份 / 巡检）
- 早上 8 点给你 Telegram 推总结

你笔记本可以关机，事情照常做完。

**Hermes 独家场景**：multi-backend + cron + agent loop 协同。
:::

## 29.1 整体设计

```
你的笔记本（白天用）            ← 默认 local backend
        ↓
凌晨 1 点 cron 触发
        ↓
Hermes 切到 ssh backend (my-server)
        ↓
跑长任务（如数据处理 6 小时）
        ↓
任务完成
        ↓
早 8 点推 Telegram 总结给你
        ↓
你笔记本继续白天工作（local）
```

## 29.2 准备 SSH backend

```bash
# 你的笔记本
ssh-keygen -t ed25519 -f ~/.ssh/hermes_only -N ""
ssh-copy-id -i ~/.ssh/hermes_only.pub user@my-server.com

# 测试登录
ssh -i ~/.ssh/hermes_only user@my-server.com
```

配 `~/.hermes/config.yaml`:
```yaml
backend:
  backends:
    night-server:
      type: ssh
      host: my-server.com
      user: hermes
      key: ~/.ssh/hermes_only
      cwd: /home/hermes/work
      env:
        DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
```

## 29.3 定义"夜班 agent"

```bash
hermes agent create night-runner
```

`~/.hermes/agents/night-runner/soul.md`:
```markdown
# 我是夜班 Hermes
专门夜里跑长任务（凌晨 1-6 点），日间不工作。

# 工作流
1. 接到任务清单（来自 cron 或主 agent 提交）
2. 用 night-server (SSH) backend 跑
3. 跑完写进 ~/.hermes/night-reports/
4. 早 8 点把所有结果发 Telegram 给主人

# 任务类型
- 数据处理（CSV / DB query）
- 仓库巡检（多个 git 仓库的状态）
- 备份验证
- 大文件压缩
- 训练任务（用 modal backend 委托）

# 边界
- 不接近 9-22 点的"白天时间"
- 不修改主 agent 的 memory
- 不发邮件 / IM（除了 8 点早报）
- 失败可重试 ≤ 3 次
```

`agent.yaml`:
```yaml
id: night-runner
soul: ./soul.md
model:
  provider: deepseek
  model: deepseek-chat
backend:
  default: night-server
tools_allow:
  - shell_exec
  - read_file
  - write_file
  - run_python
require_confirm:
  []                       # 夜里没人确认，全允许
budget:
  per_run_usd: 2
  per_night_usd: 5
```

::: warning 夜班 agent 取消 confirm
没人在你电脑前确认 → 必须 `require_confirm: []`。
**这意味着权限更大，所以**：
- 用专用 SSH key（限制能跑的命令）
- backend 限制 cwd
- 设 budget 上限
:::

## 29.4 任务清单文件

`~/.hermes/night-queue.yaml`:
```yaml
tasks:
  - name: backup-validate
    schedule: "0 1 * * *"     # 1 点
    task: "验证 ~/backups/ 最新备份完整性"

  - name: github-repos-status
    schedule: "0 2 * * *"     # 2 点
    task: |
      巡检以下 GitHub 仓库本周的:
      - ai-learning-docs
      - some-app
      统计 commits / open issues / PR 状态

  - name: data-process-weekly
    schedule: "0 3 * * 0"     # 周日 3 点
    task: "处理 ~/data/raw 下本周新增 CSV，写入 ~/data/processed/"

  - name: dependency-check
    schedule: "0 4 * * 1"     # 周一 4 点
    task: "检查所有项目 package.json / pyproject.toml 依赖更新，列出 minor+"
```

## 29.5 早 8 点推送

`~/.hermes/agents/night-runner/skills/morning-digest.md`:
```markdown
---
name: morning-digest
schedule: "0 8 * * *"
---

# 早 8 点把昨晚任务结果汇总推送

## 步骤
1. 读 ~/.hermes/night-reports/<昨晚日期>/
2. 整理成 markdown:
   - ✅ 完成的任务
   - ❌ 失败的任务（含原因）
   - ⚠️ 警告 / 异常发现
3. 发 Telegram 给主人
```

## 29.6 启动 daemon

```bash
hermes gateway --daemon
```

Gateway 后台跑，cron 会按时触发夜班 agent。

## 29.7 看一次完整夜班

凌晨 1:00 自动跑：
```
[01:00] night-runner agent 启动
[01:00] backend: ssh -> my-server.com
[01:01] 任务 backup-validate
        → 验证 ~/backups/2026-05-19/...
        ✓ OK (1m 23s, $0.02)
[02:00] 任务 github-repos-status
        → 调 github MCP 拉两个仓库数据
        ✓ ai-learning-docs: 12 commits, 3 PRs
        ✓ some-app: 5 commits, 1 PR
        (4m 56s, ¥0.15)
[02:05] 写报告 ~/.hermes/night-reports/2026-05-20/report.md
[02:05] night-runner 进入 idle，等下个 cron

[03:00] 任务 data-process-weekly (周日才触发，跳过)
[04:00] 任务 dependency-check (周一才触发，跳过)
```

早 8:00 你 Telegram 收到：
```
🌙 昨晚夜班报告 2026-05-20

✅ 完成 (2 个)
- backup-validate: OK
- github-repos-status:
  - ai-learning-docs: 12 commits
  - some-app: 5 commits
  详见: hermes-server:~/night-reports/2026-05-20/

⚠️ 提醒:
- some-app 有个 PR 卡了 3 天没 review
- ai-learning-docs 的 build CI 昨天失败过一次（已自动 retry 成功）

💰 昨晚成本: $0.02 + ¥0.15 = ¥0.30
```

你刷牙时看完，胸有成竹去公司。

## 29.8 失败处理

任务失败时：

```markdown
❌ 失败 (1 个)
- data-process-weekly:
  错误: ~/data/raw 文件 user_logs_2026-05-19.csv 损坏
  已尝试 3 次重试
  日志: hermes-server:~/night-reports/2026-05-20/failed/data-process.log
  建议: 检查 raw 文件
```

明确告诉你哪里错了，下一步做什么。

## 29.9 紧急中断

中途想取消某任务：

```bash
# 笔记本上（远程操作 daemon）
hermes night cancel data-process-weekly

# 或全局停夜班
hermes agent disable night-runner
```

## 29.10 跨多服务器调度

不止一台服务器？多 backend 并行：

```yaml
backend:
  backends:
    server-a:
      type: ssh
      host: a.example.com
    server-b:
      type: ssh
      host: b.example.com
    server-c:
      type: ssh
      host: c.example.com

night-queue:
  tasks:
    - name: scan-a
      backend: server-a
      task: "扫 /var/log 找异常"
    - name: scan-b
      backend: server-b
      task: "扫 /var/log 找异常"
    - name: scan-c
      backend: server-c
      task: "扫 /var/log 找异常"
```

3 个并行，30 分钟搞定 3 台 server 的事。

## 29.11 安全清单

- [ ] SSH key 用专用 + 强密钥（ed25519）
- [ ] 远端用户限定 `cwd`，不要 root
- [ ] 用 `~/.ssh/config` 配 `command="..."` 限定可执行命令
- [ ] 设 budget 上限
- [ ] 不让夜班 agent 改主 agent 配置
- [ ] 定期看 trajectory 看夜班干了啥

## 29.12 成本

按上述配置：
- 每晚跑 2-4 个任务: ¥0.20-0.60
- 月度: ¥6-20
- 自家 VPS（按月固定）: 已有就 0

**ROI**：节省的睡眠时间 + 早上从容感 = 无价。

---

## 看完这个案例你应该会

✅ SSH backend 配置
✅ 夜班专用 agent + cron 调度
✅ 任务清单 yaml
✅ 早班推送总结
✅ 失败重试 + 紧急中断
✅ 多服务器并行夜班

---

**下一步**：[30. 案例 6：浏览器自动化 →](/hermes/cases/browser-automation)

下一个：Browser Use 集成，让 Hermes 真的开浏览器干活。
