# 26. 案例 2：多 backend 实战

::: info 这个案例你将做出来
同一个任务用 4 种不同 backend 跑：
- **local**：本机直接跑（隐私 + 速度）
- **docker**：隔离容器（安全）
- **ssh**：远程服务器（笔记本关机也能跑）
- **modal**：云函数（临时大算力，按秒付费）

看完你会理解 Hermes 7 种 backend **各自适合什么场景**。

**这是 Hermes 独有的能力——其他 AI 工具固定跑一个地方。**
:::

## 26.1 配置 4 种 backend

`~/.hermes/config.yaml`:
```yaml
backend:
  default: local

  backends:
    local:
      type: local
      sandbox_root: /tmp/hermes-local

    docker:
      type: docker
      image: python:3.11-slim
      volumes:
        - /tmp/hermes-docker:/work
      cap_drop: [ALL]

    ssh:
      type: ssh
      host: my-server.example.com
      user: hermes
      key: ~/.ssh/hermes_only
      cwd: /home/hermes/work

    modal:
      type: modal
      app: hermes-tasks
      cpu: 4
      memory_mb: 8192
      timeout: 300s
```

需要装：
```bash
# Docker
brew install docker

# SSH 准备（生成专用 key）
ssh-keygen -t ed25519 -f ~/.ssh/hermes_only
ssh-copy-id -i ~/.ssh/hermes_only.pub hermes@my-server.com

# Modal
pip install modal
modal token new
```

## 26.2 实验：跑同一任务

任务：分析一个 1GB 的 CSV，统计列的分布。

### 用 local

```bash
hermes --backend local "分析 ~/data/big.csv 每一列的分布"
```

```
🛠️ run_python: 加载 csv (RAM 占用 ~3GB)
[20 秒]
🛠️ run_python: 计算分布
[30 秒]

📊 完成 (50s, $0)
```

**缺点**：占满本地内存，电脑变卡。

### 用 docker

```bash
hermes --backend docker "分析 /work/big.csv 每一列的分布"
```

（前提：你把 big.csv 放到 /tmp/hermes-docker/）

```
🐳 启动 Docker 容器 python:3.11-slim
🛠️ run_python: ...
[60 秒，比 local 慢一点]

📊 完成 (60s, $0)
```

**好处**：容器内存爆炸不影响主机。

### 用 ssh

```bash
hermes --backend ssh "scp 本地 big.csv 上来分析"
```

```
🔌 连接 my-server.example.com
🛠️ scp ~/data/big.csv hermes@server:/work/  [上传 1GB, 30s]
🛠️ run_python: 分析
[20s 在服务器]

📊 完成 (50s + 上传 30s = 80s, $0)
```

**好处**：你笔记本可以关机 / 干别的，服务器继续跑。

### 用 modal

```bash
hermes --backend modal "上传 big.csv 到 modal 临时空间分析"
```

```
☁️  上传 csv 到 modal volume [上传 1GB, 20s]
☁️  启动 modal 容器 (4 CPU / 8GB)
🛠️ run_python: ...
[10s 在云上]
☁️  下载结果

📊 完成 (20+10+5 = 35s, $0.02)
```

**好处**：临时大算力，跑完即销毁，本机无压力。

## 26.3 backend 性能 / 成本对比

| Backend | 这个任务耗时 | 这个任务成本 | 适合 |
|---|---|---|---|
| **local** | 50s | $0 | 数据私密 + 单次性 |
| **docker** | 60s | $0 | 隔离 + 单次 |
| **ssh** | 80s（含上传）| $0（用自家服务器）| 长跑 + 笔记本能关 |
| **modal** | 35s | $0.02 | 一次性大算力 |
| **daytona** | - | $0.05/小时 | 标准化开发沙箱 |
| **singularity** | - | $0（学术集群）| HPC 科研 |
| **vercel-sandbox** | - | $0.01/次 | 网页前端测试 |

::: tip 经验法则
- **小数据 / 隐私敏感**：local
- **跑代码 / 测试**：docker
- **长任务 / 后台**：ssh
- **临时大算力**：modal
- **跨设备同步开发**：daytona
- **学术计算**：singularity
- **前端预览**：vercel-sandbox
:::

## 26.4 让 Hermes 自动选 backend

按任务自动路由：

```yaml
backend:
  default: local

  routing:
    rules:
      - match: { task_type: "data_analysis", size_gt: "100MB" }
        backend: modal             # 大数据上云

      - match: { task_type: "test", language: "python" }
        backend: docker            # 测试用容器隔离

      - match: { task_type: "deploy" }
        backend: ssh
        host: prod.server.com      # 部署到生产服务器

      - match: { tags: ["sensitive"] }
        backend: local             # 敏感数据强制本地

      - match: { task_type: "frontend_preview" }
        backend: vercel-sandbox
```

主 agent 看任务特征自动派对应 backend。

## 26.5 dialed-down vs scaled-up

### 缩小（dialed-down）
公司笔记本算力不够？让任务跑云端：

```bash
hermes --backend modal "训练一个小模型分类我的邮件"
```

笔记本只发指令，云上 GPU 训。

### 放大（scaled-up）
任务可以并行？派 subagents 分到多 backend：

```bash
hermes "
扫这 1000 个 PDF 找特定关键词。
派 10 个 subagent 各扫 100 个。
"
```

主 agent 派 10 subagent，**每个用 modal backend**（cloud 并行），10 倍快。

## 26.6 真实玩法

### 玩法 A：白天 local，晚上 ssh

```yaml
backend:
  schedules:
    - cron: "0 9 * * *"   # 9 点
      set_default: local
    - cron: "0 22 * * *"  # 22 点睡前
      set_default: ssh    # 切到服务器，让 Hermes 夜里跑
```

睡前给一个 8 小时任务：
```
你: 把 ~/projects 下所有 GitHub 仓库重新 clone 一遍最新版，
   每个跑 npm test，把失败的列给我

[Hermes 自动切到 ssh backend，让 my-server 跑]
[你笔记本可以盖上睡觉]

(明早起来邮件提醒)
```

### 玩法 B：项目混合

```yaml
agents:
  daily-helper:
    backend: local           # 日常用本机

  data-cruncher:
    backend: modal           # 数据分析用云

  long-task-runner:
    backend: ssh             # 长跑用服务器

  sensitive-handler:
    backend: local           # 敏感数据强制本机
```

不同 agent 默认不同 backend，按需用。

### 玩法 C：失败自动 fallback

```yaml
backend:
  default: local
  fallback:
    - modal                  # local 失败（如 OOM）→ 切 modal
    - docker
  fallback_triggers:
    - out_of_memory
    - disk_full
    - timeout
```

本机内存不够自动切云。

## 26.7 backend 切换日志

```bash
hermes logs search "backend switch" --since 7d
```

```
2026-05-12 09:23: Auto-switched to modal (task too large for local: 8GB > 4GB)
2026-05-13 22:01: Scheduled switch to ssh (cron: night mode)
2026-05-14 06:30: Switched back to local (cron: day mode)
2026-05-15 14:15: Switched to docker (matched rule: task_type=test)
```

帮你看清 Hermes 在哪儿干活。

## 26.8 backend 监控

```bash
hermes backend status
```

```
BACKEND          STATUS         IN_USE      USAGE_TODAY    COST_TODAY
local            ready          0           23 tasks       $0
docker           ready          1 (running) 5 tasks        $0
ssh:my-server    ready          2 (running) 8 tasks        $0
modal            ready          0           3 tasks        $0.15
daytona          not configured -           -              -
singularity      not configured -           -              -
vercel-sandbox   ready          0           1 task         $0.01
```

## 26.9 安全：每个 backend 的风险

| Backend | 主要风险 | 对策 |
|---|---|---|
| local | 直接动主机 | 设 sandbox_root 限定目录 |
| docker | 容器逃逸（极少）| 用最新 docker |
| ssh | key 泄露 | 用专用 key，限定可执行命令 |
| modal | 账单失控 | 设 timeout + budget |
| daytona | 凭据 | 启用 OAuth |
| singularity | 集群账户 | 走集群 SSO |
| vercel-sandbox | API Key | 不放 prod env |

详见 [15 章 安全清单](/hermes/ops/security-checklist#_15-7-🟡-backend-安全-独家章节)。

## 26.10 性价比：哪个 backend 最划算

按使用频次：

| 场景 | 推荐 | 月度成本（典型） |
|---|---|---|
| 个人日常 | local + docker | $0 |
| 加少量云跑大任务 | local + modal | $5-15 |
| 长跑 24h | local + ssh（自家 VPS） | ¥35/月 VPS |
| 团队共享 | ssh + daytona | 看团队规模 |
| 偶尔学术大算力 | local + singularity（免费） | $0 |

---

## 看完这个案例你应该会

✅ 配 4-7 种 backend
✅ 按任务自动路由
✅ Day / night 调度
✅ 失败自动 fallback
✅ 不同 agent 用不同 backend
✅ 各 backend 的风险 + 对策

---

**下一步**：[27. 案例 3：跨平台对话连续 →](/hermes/cases/cross-platform)

下一个案例：Telegram 起话 → Signal 续 → CLI 收尾，**全程同一个记忆**。
