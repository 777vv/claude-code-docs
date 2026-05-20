# 24. 网络与镜像加速

::: info 本章你将学到
- npm / pnpm / Docker 国内镜像配置
- HTTPS_PROXY 怎么传给 OpenClaw 进程
- 哪些服务必须翻墙、哪些有国内镜像
- 国内云服务器部署优选清单
- 局域网 / 内网穿透方案（让外网访问家里的 OpenClaw）
:::

## 24.1 国内访问速度速查

| 服务 | 国内速度 | 解决方案 |
|---|---|---|
| **npm 官方** | 🟡 慢 | 换淘宝镜像 |
| **Docker Hub** | 🔴 慢 / 拉不下 | 换国内镜像 |
| **GitHub** | 🟡 慢 | 用 gitee 镜像 / 加速器 |
| **DeepSeek / 通义 / Kimi** | 🟢 直连 | 无需 |
| **OpenAI / Anthropic** | 🔴 不通 | 翻墙或聚合中转 |
| **Telegram / Slack / Discord** | 🔴 不通 | 翻墙 |
| **飞书 / 钉钉 / 企微** | 🟢 直连 | 无需 |
| **ClawHub** | 🟡 慢 | 用代理或 mirror |

## 24.2 npm 镜像配置

### 一行设置

```bash
npm config set registry https://registry.npmmirror.com
```

国内 npm 包下载从平均 10 KB/s → 1 MB/s+。

### 验证

```bash
npm config get registry
# 应输出: https://registry.npmmirror.com
```

### 切回官方

```bash
npm config set registry https://registry.npmjs.org
```

### 临时用官方
单条命令用：
```bash
npm install xxx --registry https://registry.npmjs.org
```

## 24.3 pnpm / bun 镜像

```bash
# pnpm
pnpm config set registry https://registry.npmmirror.com

# bun
bun pm config set registry https://registry.npmmirror.com
```

## 24.4 Docker 镜像加速

如果你用 Docker 跑 OpenClaw（详见 [36 章](/openclaw/deploy/docker)）：

### macOS / Windows Docker Desktop

设置 → Docker Engine → 加：
```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
```

Apply & Restart。

### Linux

编辑 `/etc/docker/daemon.json`：
```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 国内最稳的几个 Docker 镜像

- 中科大：`https://docker.mirrors.ustc.edu.cn`
- 网易：`https://hub-mirror.c.163.com`
- 阿里云：`https://<你的id>.mirror.aliyuncs.com`（要在阿里云控制台申请）
- 腾讯云：`https://mirror.ccs.tencentyun.com`

## 24.5 HTTPS_PROXY 给 OpenClaw 用

如果你装了 Clash / V2Ray / Shadowsocks，让 OpenClaw 走代理：

```bash
# bash / zsh
export HTTPS_PROXY=http://127.0.0.1:7890
export HTTP_PROXY=http://127.0.0.1:7890
export NO_PROXY=localhost,127.0.0.1,api.deepseek.com,dashscope.aliyuncs.com,open.feishu.cn
openclaw gateway restart
```

`NO_PROXY` 把国内服务排除（不走代理，直连更快）。

### 让代理在系统级常驻

加到 `~/.zshrc` 或 `~/.bashrc`：
```bash
# 加在文件末尾
if pgrep -f "ClashX" > /dev/null; then
  export HTTPS_PROXY=http://127.0.0.1:7890
  export HTTP_PROXY=http://127.0.0.1:7890
  export NO_PROXY=localhost,127.0.0.1,api.deepseek.com,dashscope.aliyuncs.com,open.feishu.cn,api.moonshot.cn
fi
```

下次开终端自动生效。

### Docker 容器走代理

`docker run` 加：
```bash
-e HTTPS_PROXY=http://host.docker.internal:7890 \
-e NO_PROXY=...
```

## 24.6 GitHub 加速

### 法 1：gitee 镜像

很多项目 gitee 上有镜像。OpenClaw 自己就有 [gitee.com/vv777/...]。

### 法 2：fastgit / ghproxy

替换 GitHub URL 前缀：
```bash
# 原: git clone https://github.com/openclaw/openclaw
# 改: git clone https://ghproxy.com/https://github.com/openclaw/openclaw
```

### 法 3：CDN 代理

CloudFlare / aliyun / 七牛 的 CDN 反代 GitHub，速度起飞。社区好用的：
- `gh.api.99988866.xyz`
- `ghps.cc`

::: warning 第三方镜像有风险
不要从未知镜像装可执行文件。**官方源** + **代理加速**比"第三方镜像"安全。
:::

## 24.7 国内云服务器部署清单

不想跑在自己电脑上 7×24？买台便宜云服务器：

| 服务商 | 推荐配置 | 月价 | 备注 |
|---|---|---|---|
| **阿里云轻量** | 2C2G 50G | ¥30-50 | 入门首选 |
| **腾讯云轻量** | 2C2G 50G | ¥35-50 | 学生免费一年 |
| **华为云耀云** | 2C2G 40G | ¥30-50 | 优惠多 |
| **DMIT / RackNerd**（海外） | 1C1G | $20-30/年 | OpenAI/Claude 直连 |

**配置建议**：
- 国内 LLM 用户：阿里 / 腾讯轻量
- 海外 LLM 用户：海外 VPS

### 部署流程

```bash
# SSH 到服务器
ssh root@xxx.xxx.xxx.xxx

# 装 Node.js（按 5 章方法）
curl -o- https://gitee.com/mirrors/nvm/raw/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 24

# 换 npm 镜像
npm config set registry https://registry.npmmirror.com

# 装 OpenClaw
npm install -g openclaw@latest

# 跑 onboard
openclaw onboard --install-daemon
```

完事，OpenClaw 在云上 7×24 跑。

详细部署见 [29. 本地 vs 云端](/openclaw/deploy/local-vs-cloud)。

## 24.8 内网穿透（让外网访问家里的 OpenClaw）

家里部署 OpenClaw + 外面想访问 Dashboard？三种方案：

### 方案 A：Tailscale（最推荐）

```bash
# 家里服务器装
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# 手机 / 电脑装 Tailscale 客户端，登录同一账号
# 自动有内网 IP，跨设备直接访问
```

✅ 优势：免费、零配置、自动加密、跨设备
❌ 缺点：国内连接节点速度有时不稳

### 方案 B：frp（自建）

需要一台公网服务器作中转。

```bash
# 云端: frps
./frps -c frps.ini
# frps.ini:
[common]
bind_port = 7000

# 家里: frpc
./frpc -c frpc.ini
# frpc.ini:
[common]
server_addr = 你的公网IP
server_port = 7000

[openclaw-dashboard]
type = tcp
local_ip = 127.0.0.1
local_port = 18789
remote_port = 8789
```

之后访问 `你的公网IP:8789` 等于访问家里的 18789。

### 方案 C：Cloudflare Tunnel（免费 + HTTPS）

零成本拿到 HTTPS 域名：

```bash
# 装 cloudflared
brew install cloudflared

# 登录
cloudflared tunnel login

# 创建 tunnel
cloudflared tunnel create my-openclaw

# 配
cat > ~/.cloudflared/config.yml <<EOF
tunnel: my-openclaw
credentials-file: ~/.cloudflared/xxxx.json
ingress:
  - hostname: openclaw.你的域名.com
    service: http://localhost:18789
  - service: http_status:404
EOF

# DNS
cloudflared tunnel route dns my-openclaw openclaw.你的域名.com

# 跑起来
cloudflared tunnel run my-openclaw
```

之后 `https://openclaw.你的域名.com` 直接访问家里的 OpenClaw，且免费 HTTPS。

::: warning 公网暴露 Dashboard 必须加鉴权
任何把 OpenClaw Dashboard 暴露公网的方案，**必须**：
- 开 Dashboard 鉴权（设密码）
- 或加 Cloudflare Access（推荐）
- 或 IP 白名单

否则任何人猜到地址就能用你的 OpenClaw。
:::

## 24.9 流量监控

OpenClaw 自带流量统计：

```bash
openclaw stats traffic
```

输出：
```
24h 流量:
- Inbound: 12 MB
- Outbound: 45 MB
- LLM API calls: 234, ¥1.20
- npm registry: 23 MB
```

如果发现流量异常（如某 channel 突然 100x），通常是被滥用——查 logs。

## 24.10 常见网络问题速查

### Q：`npm install openclaw` 超慢 / 报 ETIMEDOUT
- 换淘宝镜像：`npm config set registry https://registry.npmmirror.com`

### Q：拉 Docker 镜像超慢 / pull 失败
- 配 Docker registry mirror（24.4 节）

### Q：channel 一直 error
- DeepSeek / 飞书等国内服务：检查防火墙
- Telegram / Slack 等：配 HTTPS_PROXY

### Q：Tailscale 连接慢
- 跑 `tailscale netcheck` 看节点延迟
- 切到 derp（中继）模式或加 exit node

### Q：Cloudflare Tunnel 总掉线
- 服务器网络不稳。考虑迁到云服务器跑

---

## 看完这一章你应该知道

✅ npm 换淘宝镜像，提速 10 倍以上
✅ Docker 必须配国内 registry mirror
✅ HTTPS_PROXY 给 OpenClaw 进程，NO_PROXY 排除国内服务
✅ 云服务器：阿里 / 腾讯轻量起步性价比好
✅ Tailscale / frp / Cloudflare Tunnel 三种内网穿透方案
✅ 公网暴露 Dashboard 必须加鉴权

---

## 国内适配篇结束 🎉

到这里 OpenClaw 在国内的所有适配你都掌握了。
下一篇起进入 **10 个实战案例**——挑你感兴趣的看，每个都是端到端完整方案。

**下一步**：[25. 案例 1：每日资讯晨报 →](/openclaw/cases/daily-news)

第一个实战：让 AI 每天自动抓资讯、做摘要、推到 IM。
