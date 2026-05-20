# 35. 7 种 backend 选型

::: info 本章你将学到
- Hermes 7 种 backend 完整对比
- 每种 backend 的适用场景、成本、安全级别
- 配置完整 yaml 示例
- 实战决策矩阵
:::

::: tip 这是 Hermes 独家章节
其他 AI 工具最多有 1-2 种执行环境。Hermes 给你 **7 种**——让你的 AI 跑在任何地方。
:::

## 35.1 7 种 backend 总览

| Backend | 类别 | 跑在哪 | 成本 | 安全 | 速度 |
|---|---|---|---|---|---|
| **local** | 本机 | 你的电脑 | $0 | ⭐ | ⭐⭐⭐⭐⭐ |
| **docker** | 容器 | 你的电脑（容器内）| $0 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **ssh** | 远程 | 远程服务器 | 看 VPS | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **modal** | 云函数 | Modal 云 | 按秒计费 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **daytona** | 云开发环境 | Daytona | 订阅 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **singularity** | HPC 容器 | 学术集群 | $0（如有）| ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **vercel-sandbox** | 边缘沙箱 | Vercel | 按调用 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 35.2 backend 详解

### 1. local

```yaml
backend:
  backends:
    local:
      type: local
      sandbox_root: /tmp/hermes-sandbox       # 限定工作目录
      max_memory_mb: 4096
```

**适合**：
- 日常开发
- 单次性任务
- 隐私 / 离线
- 速度优先

**风险**：直接动主机文件系统。

### 2. docker

```yaml
backend:
  backends:
    docker:
      type: docker
      image: python:3.11-slim                 # 或 hermes-runtime:custom
      volumes:
        - /tmp/hermes-docker:/work
        - ~/.hermes/skills:/skills:ro          # 只读挂入 skills
      network: bridged
      cap_drop: [ALL]
      cap_add: [CHOWN]
      memory_limit: 2g
      cpu_limit: 2
      read_only_root: true
```

**适合**：
- 隔离 / 安全
- 跑别人写的不信任 skill
- 一次性任务

**前提**：装 Docker。

### 3. ssh

```yaml
backend:
  backends:
    night-server:
      type: ssh
      host: my-server.com
      user: hermes
      key: ~/.ssh/hermes_only
      cwd: /home/hermes/work
      port: 22
      timeout: 30s
      keepalive: 60s
```

**适合**：
- 笔记本要关机但任务要继续
- 用家里 / 公司 NAS
- 凌晨长跑任务
- 在国内 VPS 跑（国内 LLM 加速）

**前提**：服务器能 SSH 通，有专用账号。

### 4. modal

```yaml
backend:
  backends:
    modal:
      type: modal
      app: hermes-tasks
      cpu: 4
      memory_mb: 8192
      gpu: optional             # 或 T4 / A100 等
      timeout: 300s
      keep_warm: 60s            # 容器保活时间
      secrets:                  # 从 modal secrets 注入
        - openai-key
        - github-pat
```

**适合**：
- 临时需要大算力
- 训练 / 推理 GPU 任务
- 跑完即销毁（隐私好）
- 按秒付费，不用包月

**前提**：注册 [Modal](https://modal.com)（有免费额度）。

### 5. daytona

```yaml
backend:
  backends:
    daytona:
      type: daytona
      workspace: dev-env-1
      sync_dir: ~/projects
```

**适合**：
- 标准化开发环境
- 跨设备同步（笔记本+台式机 用同一个 Daytona 工作空间）
- 团队共享配置

**前提**：[Daytona](https://daytona.io) 账号 + workspace 配好。

### 6. singularity

```yaml
backend:
  backends:
    hpc:
      type: singularity
      image: /shared/images/hermes.sif
      cluster_login: cluster.uni.edu
      partition: gpu
      slurm_job_template: |
        #SBATCH --time=4:00:00
        #SBATCH --gres=gpu:1
```

**适合**：
- 学术 / 科研
- 已有 HPC 集群访问权
- 训练大模型

**前提**：学校 / 单位有 HPC 集群且支持 Singularity。

### 7. vercel-sandbox

```yaml
backend:
  backends:
    vercel-sandbox:
      type: vercel-sandbox
      project_id: prj_xxx
      region: hkg1                # 香港区域，国内近
      timeout: 60s                # vercel sandbox 短任务为主
```

**适合**：
- 前端预览
- 临时短任务
- 试运行不信任代码

**前提**：Vercel 账号 + 项目 ID。

## 35.3 决策矩阵

### 按任务类型

| 任务 | 推荐 backend |
|---|---|
| 改本地代码 | local |
| 跑测试 | docker（隔离） |
| 备份 / 长跑 | ssh |
| GPU 训练 | modal（GPU）/ singularity（学术）|
| 前端 build / 预览 | vercel-sandbox |
| 跑不信任脚本 | docker / vercel-sandbox |
| 处理大数据 | modal（云算力）/ ssh（自家大服务器）|
| 团队共享开发 | daytona |

### 按用户类型

| 你是 | 推荐 |
|---|---|
| 个人玩家 / 单机 | local + docker |
| 有自家服务器 | local + ssh |
| 数据科学家 | local + modal |
| 学术研究者 | local + singularity |
| 重隐私用户 | local 或 docker |
| 跨设备开发 | daytona |
| 完全云 native | modal + vercel-sandbox |

## 35.4 多 backend 协同

不是非此即彼——可以**同时配多种**：

```yaml
backend:
  default: local

  backends:
    local: {...}
    docker: {...}
    ssh-home: {...}
    modal: {...}

  routing:
    rules:
      - match: { task: "data_processing", size_gt_mb: 500 }
        backend: modal           # 大数据上云

      - match: { task: "test", language: "python" }
        backend: docker          # 测试容器

      - match: { cron_triggered: true, time_window: "01:00-06:00" }
        backend: ssh-home        # 夜班用服务器

      - match: { task: "code_edit" }
        backend: local           # 改代码本地

  fallback:
    - docker
    - local
```

Hermes 按 routing 自动选。

## 35.5 backend 切换演示

实测一个任务跑 4 种 backend：

```bash
# 同一任务（解析 100MB CSV 统计列分布）
hermes --backend local "解析 ~/data.csv"        # 50s, ¥0
hermes --backend docker "解析 ~/data.csv"       # 60s, ¥0 (加 docker 启动)
hermes --backend ssh-home "解析 ~/data.csv"     # 80s（含上传）, ¥0
hermes --backend modal "解析 ~/data.csv"        # 35s, ¥0.15
```

如何选？看你**优先级**：
- 速度: local
- 成本: local 或 自家 ssh
- 隔离: docker / modal
- 算力: modal

## 35.6 backend 健康检查

```bash
hermes backend status
```

```
BACKEND          STATUS         LAST_USE    USAGE_TODAY   COST_TODAY
local            ready          5m ago      23 tasks      $0
docker           ready          1h ago      5 tasks       $0
ssh-home         ready          2h ago      3 tasks       $0
modal            ready          30m ago     1 task        $0.15
daytona          not configured -           -             -
singularity      not configured -           -             -
vercel-sandbox   ready          4h ago      0 tasks       $0
```

定期跑确认所有可用 backend 都健康。

## 35.7 backend 切换的成本

| 切换 | 启动开销 |
|---|---|
| 切到 local | 0 |
| 切到 docker | ~1s（容器启动）|
| 切到 ssh | ~500ms（连接）|
| 切到 modal | ~3-5s（容器调度+启动）|
| 切到 daytona | ~10s（workspace 唤醒）|
| 切到 singularity | ~30s+（job queue + image load）|
| 切到 vercel-sandbox | ~2s |

`keep_warm` 配置能减少 modal / vercel 重启开销。

## 35.8 配置安全

每种 backend 安全配置不同。**通用规则**：

```yaml
backend:
  global:
    require_confirm: [shell_exec, write_file, delete_file]
    forbid:                                    # 任何 backend 都不能干
      - rm_rf_root
      - chown_recursive
    log_all_commands: true                     # 审计留痕

  backends:
    local:
      sandbox_root: /tmp/hermes-sandbox        # 限定工作区

    docker:
      cap_drop: [ALL]                          # 容器最小权限
      read_only_root: true

    ssh:
      authorized_commands_only: true           # 远端限定可执行
      allowed_commands: [bash, python3, pytest]

    modal:
      timeout: 300s                            # 单次最长
      budget_per_run_usd: 1                    # 单次预算
```

详见 [15 章 backend 安全](/hermes/ops/security-checklist#_15-7-🟡-backend-安全-独家章节)。

## 35.9 我应该装哪几个 backend？

按渐进路径：

**第 1 周**：只用 `local`，熟悉 Hermes

**第 2-3 周**：加 `docker`，跑不信任的 skill 用容器

**第 4 周+**（看需求）：
- 有家庭 NAS / 公司服务器 → `ssh`
- 跑过大算力任务 → `modal`
- 学术用户 → `singularity`
- 跨设备开发 → `daytona`
- 前端开发 → `vercel-sandbox`

**不必一开始全配**——按需加。

## 35.10 成本预估

按月度使用：

| 配置 | 月度成本 |
|---|---|
| 仅 local + docker | ¥0 |
| local + 自家小 VPS (ssh) | ¥35（VPS） |
| local + modal（偶尔大算力）| $5-30 |
| local + daytona（订阅）| $20+ |
| local + singularity（学术）| ¥0（如学校提供）|

---

## 看完这一章你应该知道

✅ Hermes 7 种 backend 各自适用场景
✅ 多 backend routing 让任务自动派对应环境
✅ 按用户 / 任务类型选 backend
✅ 安全配置每种都要做
✅ 渐进添加，不必一开始全配

---

**下一步**：[36. Docker 完整部署 →](/hermes/deploy/docker)

下一篇：用 Docker 跑整套 Hermes，便于隔离 + 迁移。
