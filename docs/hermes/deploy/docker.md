# 36. Docker 完整部署

::: info 本章你将学到
- 为什么用 Docker 跑 Hermes
- 一行命令快速启动
- docker-compose 完整生产配置
- 数据持久化 / 网络 / 日志方案
- 升级 / 回滚 / 备份
- 群晖 NAS / 树莓派部署
:::

## 36.1 为什么用 Docker

直接 `curl ... | bash` 装 Hermes 的问题：
- 环境污染（Python / Node 版本冲突）
- 难迁移到新机器
- 难限制资源
- 升级失败难回滚

Docker 解决：
- 一行命令搞定环境
- 数据 / 配置分离
- 多机器一致
- 资源隔离 + cgroup 限制
- 容器删了再启不丢数据

## 36.2 装 Docker

按系统：
- **macOS / Windows**：[Docker Desktop](https://docker.com/products/docker-desktop)
- **Linux**：
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo systemctl enable docker
  sudo usermod -aG docker $USER
  ```

国内 mirror 必配，见 [23. 网络与镜像加速](/hermes/china/network#_23-5-docker-镜像加速)。

## 36.3 一行命令启动

```bash
docker run -d \
  --name hermes \
  --restart unless-stopped \
  -v ~/hermes-data:/root/.hermes \
  -e DEEPSEEK_API_KEY=sk-xxxxx \
  -p 8443:8443 \
  nousresearch/hermes-agent:latest
```

说明：
- `-d` 后台跑
- `--restart unless-stopped` 挂了自动重启
- `-v ~/hermes-data:/root/.hermes` 数据持久化
- `-p 8443:8443` 暴露 webhook 端口（可选）
- 环境变量传 API Key

### 进容器用 CLI

```bash
# 进容器跑 hermes 命令
docker exec -it hermes hermes "你好"

# 或交互式
docker exec -it hermes hermes
```

## 36.4 docker-compose（推荐生产）

`docker-compose.yml`:
```yaml
version: '3.9'

services:
  hermes:
    image: nousresearch/hermes-agent:latest
    container_name: hermes
    restart: unless-stopped
    ports:
      - "8443:8443"               # webhook port
    volumes:
      - ./data:/root/.hermes      # 持久化
      - ./logs:/var/log/hermes
    environment:
      # LLM Keys
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      # Channels
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - DISCORD_BOT_TOKEN=${DISCORD_BOT_TOKEN}
      # Timezone
      - TZ=Asia/Shanghai
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
    healthcheck:
      test: ["CMD", "hermes", "doctor", "--quiet"]
      interval: 60s
      timeout: 10s
      retries: 3

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
          memory: 12G               # 跑 7B 至少 8G
```

`.env`:
```bash
DEEPSEEK_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
TELEGRAM_BOT_TOKEN=...
DISCORD_BOT_TOKEN=...
```

启动：
```bash
docker compose up -d
docker compose ps
docker compose logs -f hermes
```

## 36.5 数据持久化

```
./data/                # 容器内 /root/.hermes
├── config.yaml
├── .env
├── memory.md
├── user.md
├── skills/
├── agents/
├── data/
│   ├── sessions.db
│   └── honcho.db
└── logs/

./ollama-data/         # 容器内 /root/.ollama
└── models/
```

**容器删了重建数据不丢**。

### 备份

```bash
#!/bin/bash
# backup-hermes.sh
DATE=$(date +%F)
tar -czf ~/hermes-backups/hermes-${DATE}.tar.gz \
  ./data ./logs .env docker-compose.yml

# 保留 30 天
find ~/hermes-backups -name "hermes-*.tar.gz" -mtime +30 -delete
```

crontab：
```bash
0 3 * * * bash ~/backup-hermes.sh
```

## 36.6 升级 / 回滚

### 升级到最新

```bash
docker compose pull hermes
docker compose up -d hermes
```

数据保留，只换容器版本。

### 回滚

如果新版本有问题，回退指定版本：

```yaml
services:
  hermes:
    image: nousresearch/hermes-agent:0.7.5     # 指定旧版本号
```

```bash
docker compose up -d hermes
```

## 36.7 多 Hermes 实例

例如：dev + prod 双跑

```yaml
services:
  hermes-dev:
    image: nousresearch/hermes-agent:latest
    container_name: hermes-dev
    ports:
      - "8443:8443"
    volumes:
      - ./data-dev:/root/.hermes
    environment:
      - HERMES_PROFILE=dev

  hermes-prod:
    image: nousresearch/hermes-agent:0.8.3     # prod 用固定版本
    container_name: hermes-prod
    ports:
      - "8444:8443"                            # 不同对外端口
    volumes:
      - ./data-prod:/root/.hermes
    environment:
      - HERMES_PROFILE=prod
```

两套互不干扰。dev 跑最新版玩，prod 跑稳定版长跑。

## 36.8 群晖 NAS / QNAP

### Container Manager UI

1. 套件中心装 Container Manager
2. 注册表搜 `nousresearch/hermes-agent` → 下载 latest
3. 启动配置：
   - 网络: Bridge
   - 端口: 8443 → 8443
   - 卷: `/docker/hermes` → `/root/.hermes`
   - 环境变量: 加 Keys

### 或 SSH + docker-compose

```bash
ssh admin@nas
cd /volume1/docker
mkdir hermes && cd hermes
# 上传 docker-compose.yml + .env
docker compose up -d
```

NAS 优势：**24/7 在线 + 自带 RAID + 不动主力机**。

## 36.9 树莓派部署

树莓派 5（4GB / 8GB）完全够。

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker pi

# ARM 镜像（Hermes 官方支持 arm64）
docker pull nousresearch/hermes-agent:latest
docker compose up -d
```

注意：
- 别同时跑 Ollama（树莓派内存不够）
- 用国内 LLM API（CPU 几乎 0 负载）
- 大数据存 USB SSD，不要 SD 卡

## 36.10 健康检查 + 自愈

```yaml
healthcheck:
  test: ["CMD", "hermes", "doctor", "--quiet"]
  interval: 60s
  timeout: 10s
  retries: 3
  start_period: 60s
```

Docker 自动重启不健康的容器。配合 `--restart unless-stopped`，几乎零维护。

## 36.11 监控

```bash
# 实时资源
docker stats hermes

# 看日志
docker logs --tail 100 hermes
docker logs -f hermes

# 容器详情
docker inspect hermes
```

进阶接 Grafana + cAdvisor 看长期趋势。

## 36.12 自定义镜像（高阶）

官方镜像不够用？自己 build：

`Dockerfile`:
```dockerfile
FROM nousresearch/hermes-agent:latest

# 加你自己的依赖
RUN pip install --no-cache-dir my-custom-skill-deps

# 加自定义工具
COPY my-skills/ /root/.hermes/skills/
COPY my-tools/ /opt/hermes/custom-tools/

# 装额外的 mcp servers
RUN npm install -g @modelcontextprotocol/server-github
```

build:
```bash
docker build -t my-hermes:latest .
```

用：
```yaml
services:
  hermes:
    image: my-hermes:latest
    ...
```

## 36.13 网络配置

### 让 Hermes 能调宿主机服务

```yaml
hermes:
  extra_hosts:
    - "host.docker.internal:host-gateway"
```

容器内访问 `http://host.docker.internal:11434` 等于访问宿主机 Ollama。

### 国内代理透传

```yaml
hermes:
  environment:
    - HTTPS_PROXY=http://host.docker.internal:7890
    - NO_PROXY=localhost,*.deepseek.com,*.aliyuncs.com
```

容器内的请求按规则走代理。

### Bridge vs Host network

```yaml
hermes:
  network_mode: bridge          # 默认，隔离
  # 或
  network_mode: host            # 不隔离，性能略好但不安全
```

**强烈用 bridge**，host 模式失去 Docker 一半价值。

## 36.14 常见报错

### Q：容器一直 restarting
```bash
docker logs hermes
```
常见原因：
- 端口冲突（8443 被占）
- volume 权限错（容器内 user 没法写）
- API Key 错（日志会抱怨）

### Q：连不上 docker socket
```bash
sudo usermod -aG docker $USER
# 重新登录
```

### Q：升级后旧 data 不兼容
回滚到老版本（36.6 节）+ 先备份再升。

### Q：Apple Silicon 跑 amd64 镜像很慢
Hermes 官方镜像有 arm64 版，应自动选。强制指定：
```bash
docker pull --platform linux/arm64 nousresearch/hermes-agent
```

---

## 看完这一章你应该知道

✅ 一行 `docker run` 或 docker-compose 部署
✅ 数据通过 volume 持久化，容器换不丢数据
✅ 升级 = `compose pull && up`，回滚 = 指定老版本
✅ 群晖 / 树莓派 / 云服务器一致体验
✅ 健康检查 + 自动重启 = 几乎零维护

---

**下一步**：[37. 云端 / VPS 部署 →](/hermes/deploy/cloud)

最后一篇部署：跑在公网服务器 / 国内云 / 海外 VPS。
