# 36. Docker 完整部署

::: info 本章你将学到
- 为什么用 Docker 部署 OpenClaw
- 一行命令快速启动
- docker-compose 完整生产配置
- 数据持久化、网络、日志方案
- 升级 / 回滚 / 备份完整流程
- 群晖 NAS 部署小贴士
:::

## 36.1 为什么用 Docker

直接 `npm install` 的痛点：
- 环境污染（不同项目 Node 版本冲突）
- 难迁移（换机器重装一切）
- 难回滚（升级出问题难复原）
- 难限制资源（占用所有 CPU/RAM）

Docker 的好处：
- 一行命令搞定环境
- 数据 / 配置分离
- 多机器一致
- 资源隔离
- 容器挂了 OS 安全

## 36.2 准备：装 Docker

按你的系统：
- **macOS / Windows**：[Docker Desktop](https://docker.com/products/docker-desktop)
- **Linux**：
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo systemctl enable docker
  sudo usermod -aG docker $USER     # 当前用户能用 docker，不用 sudo
  ```

验证：
```bash
docker --version
docker run hello-world
```

### 配镜像加速（国内必做）

按 [24 章](/openclaw/china/network#_24-4-docker-镜像加速) 配中科大 / 网易镜像。

## 36.3 一行命令启动 OpenClaw

```bash
docker run -d \
  --name openclaw \
  --restart unless-stopped \
  -p 18789:18789 \
  -p 18793:18793 \
  -v ~/openclaw-data:/data \
  -e WORKSPACE=/data \
  openclaw/openclaw:latest
```

参数解释：
- `-d` 后台跑
- `--name openclaw` 容器叫这个名字
- `--restart unless-stopped` 挂了自动重启
- `-p 18789:18789` Dashboard 端口
- `-p 18793:18793` Canvas 端口
- `-v ~/openclaw-data:/data` 数据持久化到本地
- `-e WORKSPACE=/data` workspace 在 /data

验证：
```bash
docker ps                           # 看容器在跑
curl -s http://localhost:18789      # Dashboard 应该回 HTML
docker logs -f openclaw             # 看日志
```

## 36.4 docker-compose 完整方案（推荐生产用）

新建 `docker-compose.yml`:

```yaml
version: '3.9'

services:
  openclaw:
    image: openclaw/openclaw:latest
    container_name: openclaw
    restart: unless-stopped
    ports:
      - "18789:18789"           # Dashboard / Gateway
      - "18793:18793"           # Canvas
    volumes:
      - ./workspace:/data       # workspace 持久化
      - ./logs:/var/log/openclaw
    environment:
      - WORKSPACE=/data
      - TZ=Asia/Shanghai
      # API Keys 通过 .env 注入
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - FEISHU_APP_ID=${FEISHU_APP_ID}
      - FEISHU_APP_SECRET=${FEISHU_APP_SECRET}
    # 资源限制
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  # （可选）跑本地 Ollama 一起
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ./ollama-data:/root/.ollama
    deploy:
      resources:
        limits:
          memory: 12G          # 跑 7B 模型至少 8G
```

`.env`:
```bash
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

启动：
```bash
docker compose up -d
docker compose ps
docker compose logs -f openclaw
```

## 36.5 数据持久化

关键目录映射：
- `./workspace` → 容器内 `/data` (所有 agent / skill / memory 配置)
- `./logs` → 容器内日志
- `./ollama-data` → Ollama 模型文件

**容器删了重建数据不丢**——这就是 Docker 的好处。

### 备份脚本

```bash
#!/bin/bash
# backup-openclaw.sh
DATE=$(date +%F)
tar -czf ~/openclaw-backups/openclaw-${DATE}.tar.gz \
  ./workspace ./logs .env docker-compose.yml
find ~/openclaw-backups -name "openclaw-*.tar.gz" -mtime +30 -delete
```

加 crontab:
```bash
0 3 * * * bash ~/backup-openclaw.sh
```

## 36.6 升级 / 回滚

### 升级到最新版

```bash
docker compose pull openclaw
docker compose up -d openclaw
```

数据保留，只是容器换新版。

### 回滚

如果升级后出问题，用上一个版本号：

```yaml
services:
  openclaw:
    image: openclaw/openclaw:1.2.3   # 指定老版本号
```

```bash
docker compose up -d openclaw
```

## 36.7 多 OpenClaw 实例

要跑多套（如 dev + prod）：

```yaml
services:
  openclaw-dev:
    image: openclaw/openclaw:latest
    container_name: openclaw-dev
    ports:
      - "18789:18789"
    volumes:
      - ./workspace-dev:/data

  openclaw-prod:
    image: openclaw/openclaw:latest
    container_name: openclaw-prod
    ports:
      - "18889:18789"          # 不同对外端口
    volumes:
      - ./workspace-prod:/data
```

两套互不干扰。

## 36.8 群晖 NAS 部署

群晖 DSM 7 自带 Container Manager（旧版是 Docker），直接装 OpenClaw。

### 方法 1: Container Manager UI

1. 套件中心装 Container Manager
2. 进 → 注册表搜 `openclaw/openclaw` → 下载 `latest`
3. → 映像 → 选 openclaw → 启动
4. 一般配置：
   - 网络模式: Bridge
   - 端口: 18789 (本机) → 18789 (容器)
   - 卷: `/docker/openclaw` → `/data`
   - 环境变量: 加 DEEPSEEK_API_KEY 等

### 方法 2: SSH + docker-compose

```bash
ssh admin@nas
cd /volume1/docker
mkdir openclaw && cd openclaw
# 上传 docker-compose.yml + .env
docker compose up -d
```

通过 NAS 的 DSM 反代或直接 IP 访问 Dashboard。

::: tip 群晖跑 OpenClaw 优势
- 7×24 在线（NAS 本身就是常开的）
- 数据备份方便（NAS 已有 RAID + 快照）
- 资源占用低（OpenClaw 不挤占别的服务）
:::

## 36.9 树莓派部署

树莓派 5 跑 OpenClaw 完全够。

```bash
# 装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker pi

# 拉镜像（ARM64）
docker pull openclaw/openclaw:latest

# 跑
docker compose up -d
```

注意：
- 树莓派内存有限（4G/8G），别再跑 Ollama
- 用国内 LLM API（DeepSeek 等），CPU 几乎 0 负载
- SD 卡可能成为瓶颈，重要数据用 USB SSD

## 36.10 健康检查 + 自愈

```yaml
services:
  openclaw:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:18789/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 60s
```

Docker 自动重启不健康的容器。配合 `--restart unless-stopped`，几乎不用人工干预。

## 36.11 监控容器

```bash
# 实时资源
docker stats openclaw

# 看日志最近 100 行
docker logs --tail 100 openclaw

# 看日志流
docker logs -f openclaw
```

进阶：接 Grafana + cAdvisor 看长期趋势。

## 36.12 常见报错

### Q：容器一直 restarting
```bash
docker logs openclaw       # 看具体原因
```
常见：
- 端口冲突（18789 被占用）
- volume 权限（容器内 user 不能写 mount 的目录）
- API Key 错（不会 crash 但 daemon 抱怨）

### Q：群晖 / NAS 上 channel 连不上飞书
A：可能 NAS 网络要走代理。在 docker-compose 加：
```yaml
environment:
  - HTTPS_PROXY=http://192.168.1.x:7890
```

### Q：升级后旧 workspace 不兼容
A：先备份再升级。如果遇到大版本（如 1.x → 2.x）必读 release notes。

### Q：Docker Desktop 占内存太多
A：调 Docker Desktop 资源限制（设置 → Resources），4GB 通常够 OpenClaw 用。

---

## 看完这一章你应该知道

✅ 一行 `docker run` 或 docker-compose 部署
✅ 数据通过 volume 持久化，容器换不丢数据
✅ 升级 = `docker compose pull && up`，回滚 = 指定老版本号
✅ 群晖 / 树莓派 / 云服务器一致体验
✅ 健康检查 + 自动重启 = 几乎零维护

---

**下一步**：[37. NemoClaw 安全沙箱 →](/openclaw/deploy/nemoclaw)

最后一篇部署：生产环境的"安全最后防线"——NVIDIA NemoClaw。
