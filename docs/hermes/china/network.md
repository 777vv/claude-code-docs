# 23. 网络与镜像加速

::: info 本章你将学到
- Hermes 安装时国内 GitHub 加速方法
- uv / PyPI 清华源配置
- HTTPS_PROXY 给 Hermes 进程
- Docker 拉镜像加速
- 部署在国内 VPS 的优化清单
- 内网穿透：让外网访问家里的 Hermes
:::

## 23.1 国内访问速度速查

| 服务 | 国内速度 | 解决方案 |
|---|---|---|
| **GitHub raw**（装 Hermes） | 🔴 慢 / 不稳 | 用 ghfast.top 代理 |
| **PyPI**（uv 装包） | 🔴 慢 | 换清华镜像 |
| **Docker Hub** | 🔴 慢 / 失败 | 国内 mirror |
| **DeepSeek / 通义 / Kimi** | 🟢 直连 | 无需 |
| **Anthropic / OpenAI** | 🔴 不通 | 翻墙 |
| **Telegram / Discord** | 🔴 不通 | 翻墙 |
| **agentskills.io** | 🟡 慢 | 用代理或装本地 |

## 23.2 装 Hermes 时的 GitHub 加速

[第 6 章](/hermes/intro/install) 已经讲过。本节扩展几个备选。

### 方法 1：ghfast.top（推荐）

```bash
curl -fsSL https://ghfast.top/https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### 方法 2：ghproxy.com

```bash
curl -fsSL https://ghproxy.com/https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### 方法 3：自建 cloudflare worker

```js
// worker.js
addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  const upstream = `https://raw.githubusercontent.com${url.pathname}`
  e.respondWith(fetch(upstream))
})
```

部署到 cloudflare workers（免费 100K 请求/天）。

### 升级也用代理

```bash
# 默认 hermes update 直接拉 github，国内慢
hermes update --github-mirror ghfast.top
```

或配置：
```yaml
# ~/.hermes/config.yaml
update:
  github_mirror: https://ghfast.top
```

## 23.3 uv / PyPI 加速

Hermes 用 uv 装 Python 包。配清华源：

```bash
mkdir -p ~/.config/uv
cat > ~/.config/uv/uv.toml <<'EOF'
[[index]]
name = "tsinghua"
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true
EOF
```

或临时：
```bash
uv pip install xxx --index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

### 备选镜像

| 镜像 | URL |
|---|---|
| 清华 | https://pypi.tuna.tsinghua.edu.cn/simple |
| 阿里云 | https://mirrors.aliyun.com/pypi/simple |
| 腾讯云 | https://mirrors.cloud.tencent.com/pypi/simple |
| 中科大 | https://pypi.mirrors.ustc.edu.cn/simple |
| 豆瓣（老牌） | https://pypi.douban.com/simple |

清华最稳，其他备用。

## 23.4 HTTPS_PROXY 给 Hermes 进程

Hermes 调 LLM API / channel 时如果要走代理：

```bash
# bash / zsh
export HTTPS_PROXY=http://127.0.0.1:7890
export HTTP_PROXY=http://127.0.0.1:7890
export NO_PROXY=localhost,127.0.0.1,api.deepseek.com,dashscope.aliyuncs.com,api.moonshot.cn

hermes gateway restart
```

`NO_PROXY` 把国内服务排除（不走代理直连更快）。

### 让代理跟随启动

```bash
# 加到 ~/.zshrc
if pgrep -f "ClashX\|v2ray" > /dev/null; then
  export HTTPS_PROXY=http://127.0.0.1:7890
  export HTTP_PROXY=http://127.0.0.1:7890
  export NO_PROXY=localhost,127.0.0.1,*.deepseek.com,*.aliyuncs.com,*.moonshot.cn,*.minimaxi.com,*.bigmodel.cn
fi
```

### 只给某个 backend / platform 配代理

```yaml
# config.yaml
backend:
  modal:
    proxy: http://127.0.0.1:7890       # Modal 调用走代理

platforms:
  telegram:
    proxy: http://127.0.0.1:7890       # 飞 Telegram 走代理
  feishu:
    proxy: null                         # 飞书直连
```

## 23.5 Docker 镜像加速

如果用 Docker 跑 Hermes（[36 章](/hermes/deploy/docker)）：

### Docker Desktop（macOS / Windows）

设置 → Docker Engine → 加：
```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
```

Apply & Restart。

### Linux

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 阿里云专属（最快）

阿里云用户去 [cr.console.aliyun.com](https://cr.console.aliyun.com) 申请专属镜像：
`https://<你的id>.mirror.aliyuncs.com`

## 23.6 国内 VPS 部署优化

如果你想跑在国内 VPS（详见 [37 章](/hermes/deploy/cloud)）：

### VPS 选型

| 服务商 | 入门配置 | 月价 | 备注 |
|---|---|---|---|
| **阿里云轻量** | 2C2G 50G | ¥30-50 | 稳定生态全 |
| **腾讯云轻量** | 2C2G 50G | ¥35-50 | 学生免费 1 年 |
| **华为云耀云** | 2C2G | ¥30-50 | 优惠多 |
| **搬瓦工** | 1C1G | $20/年 | 海外，慢但便宜 |

### 部署流程（国内云）

```bash
ssh root@VPS_IP

# 1. 装基础工具
apt update && apt install -y git curl build-essential

# 2. 用国内代理装 Hermes
curl -fsSL https://ghfast.top/https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

source ~/.bashrc

# 3. 配 PyPI 镜像（如果 uv 还没自动配）
mkdir -p ~/.config/uv
cat > ~/.config/uv/uv.toml <<'EOF'
[[index]]
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true
EOF

# 4. 配 LLM (国内 DeepSeek)
hermes setup
# → 选 DeepSeek → 粘 Key

# 5. 启动 daemon
hermes gateway --daemon
```

### 网络注意

- 国内 VPS **基本不能直连** Telegram / Discord / Anthropic / OpenAI
- 但**能直连** DeepSeek / 通义 / Kimi / MiniMax / GLM
- 适合纯国内场景部署

## 23.7 内网穿透（让外网访问家里 Hermes）

家里部署 Hermes + 想从公司 / 手机访问？

### 方案 A：Tailscale（最推荐）

```bash
# 家里服务器装
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# 手机 / 电脑装 Tailscale 客户端，登同一账号
# 自动有 100.x.x.x 内网 IP
# 任何设备直接访问 http://100.x.x.x:18789
```

✅ 优势：免费、零配置、跨设备
⚠️ 缺点：国内连接节点速度不稳（建议加 derp 中继）

### 方案 B：frp（自建）

需要一台公网 VPS 作中转。详见 [OpenClaw 24.8 节](/openclaw/china/network#_24-8-内网穿透-让外网访问家里的-openclaw)。

### 方案 C：Cloudflare Tunnel（免费 + HTTPS）

```bash
# 家里
brew install cloudflared
cloudflared tunnel login
cloudflared tunnel create hermes
cloudflared tunnel route dns hermes hermes.你的域名.com

# config:
cat > ~/.cloudflared/config.yml <<EOF
tunnel: hermes
ingress:
  - hostname: hermes.你的域名.com
    service: http://localhost:18789
  - service: http_status:404
EOF

cloudflared tunnel run hermes
```

之后 `https://hermes.你的域名.com` 直达家里 Hermes，免费 HTTPS。

::: warning 公网暴露 Hermes Dashboard 必须加鉴权
- Cloudflare Access（推荐）
- Hermes 内置 Basic Auth
- IP 白名单

否则任何人猜到地址就能用你的 Hermes 烧 token。
:::

## 23.8 流量监控

```bash
hermes stats traffic --period 24h
```

```
24h Traffic:
  Inbound: 12 MB
  Outbound: 45 MB
  LLM API: 234 calls, ¥1.20
  PyPI: 23 MB
  GitHub: 4 MB
```

异常流量（如某 channel 突然 100x）→ 查 logs 看滥用。

## 23.9 国内 LLM 限速对策

国内 LLM API 普遍限速：
- DeepSeek: ~60 req/min（按账户层级）
- Kimi: ~30 req/min
- 通义: ~120 req/min

Hermes 默认 retry。但跑并发 subagent 容易超：

```yaml
llm:
  providers:
    deepseek:
      rate_limit:
        requests_per_minute: 50      # 限主动节流
      retry:
        max_attempts: 5
        backoff: exponential
```

## 23.10 常见报错

### Q：`uv` 装 Python 卡住
**原因**：uv 默认从 GitHub 拉 Python 二进制。
**修复**：换 uv 内部镜像（uv 0.5+ 支持）：
```bash
uv python install 3.11 --mirror python-build-standalone
```

### Q：装 Hermes 卡在 `Cloning hermes-agent...`
**修复**：用 GitHub 代理（见 23.2）

### Q：channel telegram 一直 ETIMEDOUT
**修复**：配 HTTPS_PROXY（见 23.4）

### Q：Cloudflare Tunnel 经常掉
**修复**：换更稳的内网穿透方案（Tailscale）或部署到国内 VPS

---

## 看完这一章你应该知道

✅ GitHub raw 用 ghfast.top 代理装 Hermes
✅ PyPI 清华源加速 uv
✅ HTTPS_PROXY 给 Hermes，NO_PROXY 排除国内服务
✅ Docker 国内镜像 mirror
✅ 国内 VPS 部署用 DeepSeek + 国产 LLM
✅ Tailscale / Cloudflare Tunnel 内网穿透

---

**下一步**：[24. 国内 channel 现实 →](/hermes/china/channels)

最后一篇国内适配——Hermes 在国内 IM 的真实情况 + 桥接方案。
