# 37. 云端 / VPS 部署

::: info 本章你将学到
- 选 VPS：阿里 / 腾讯 / 海外 RackNerd / Modal 对比
- 完整部署 SOP（含国内加速）
- 公网安全 5 件套
- 跨地域 latency 优化
- 几个真实部署成本案例
:::

## 37.1 选 VPS

### 国内 VPS

| 服务商 | 入门 | 月价 | 适合 |
|---|---|---|---|
| **阿里云轻量** | 2C2G 50G | ¥35-50 | 稳定，生态全，推荐 |
| **腾讯云轻量** | 2C2G 50G | ¥30-50 | 学生免费 1 年 |
| **华为云耀云** | 2C2G | ¥30-50 | 节假日优惠多 |
| **京东云** | 2C2G | ¥35-60 | 较新 |

::: tip 国内 VPS 适合
- 用国产 LLM（DeepSeek / 通义 / Kimi / MiniMax）
- 不需要 Telegram / Discord（这些国内 VPS 通常不通）
- 主要靠 CLI / Email
:::

### 海外 VPS

| 服务商 | 入门 | 月价 | 适合 |
|---|---|---|---|
| **RackNerd** | 1C1G | $20-30/年 | 极便宜，跑 Hermes 够 |
| **DigitalOcean** | 1C1G | $4-6/月 | 优质，新户 $200 额度 |
| **Vultr** | 1C1G | $3.5/月 | 多区域 |
| **Linode** | 1C1G | $5/月 | 稳定老牌 |
| **AWS Lightsail** | 1C1G | $3.5/月 | 5GB 转账有限 |

::: tip 海外 VPS 适合
- 用 OpenAI / Claude（直连不要翻墙）
- 接 Telegram / Discord / Slack
- 全球用户访问
:::

### 不要选

- 国内大厂的"按量付费"实例（容易超预算）
- 完全免费的 VPS（没有可靠的）
- 共享虚拟主机（不能跑 daemon）

## 37.2 国内 VPS 部署完整 SOP

```bash
# 1. SSH 到 VPS
ssh root@xxx.xxx.xxx.xxx

# 2. 创建非 root 用户
adduser hermes
usermod -aG sudo hermes
su - hermes

# 3. 装基础工具
sudo apt update && sudo apt install -y git curl build-essential

# 4. 用国内代理装 Hermes
curl -fsSL https://ghfast.top/https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc

# 5. 配 PyPI 镜像
mkdir -p ~/.config/uv
cat > ~/.config/uv/uv.toml <<'EOF'
[[index]]
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true
EOF

# 6. 跑 setup 配 DeepSeek
hermes setup

# 7. 注册成 systemd 服务
hermes gateway --install-daemon
sudo systemctl enable hermes-gateway
sudo systemctl start hermes-gateway

# 8. 验证
hermes doctor
sudo systemctl status hermes-gateway
```

完成。

## 37.3 海外 VPS 部署

类似但用 OpenAI / Claude：

```bash
# 1-3 步同上

# 4. 海外 VPS 直接装
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc

# 5. 不用换 PyPI（海外直连）

# 6. 配 Claude / OpenAI
hermes setup
# → 选 Anthropic 或 OpenAI

# 7-8 同上
```

## 37.4 公网安全 5 件套

VPS 暴露在公网，**必做**：

### ① 改 SSH 端口 + 禁用密码登录

```bash
# /etc/ssh/sshd_config
Port 22389                    # 改成非 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers hermes
```

```bash
sudo systemctl restart sshd
```

### ② 装防火墙

```bash
sudo ufw allow 22389/tcp      # SSH
sudo ufw allow 8443/tcp       # 如果开 webhook
sudo ufw enable
sudo ufw status
```

### ③ Fail2Ban 防爆破

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

默认配置就够拦截 99% 攻击。

### ④ Hermes Gateway 别裸暴露

```yaml
# ~/.hermes/config.yaml
gateway:
  bind_host: 127.0.0.1          # 只听本地
  # 远程访问走 SSH 隧道，不 0.0.0.0
```

### ⑤ 自动安全更新

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

定期补漏洞。

## 37.5 远程访问 Hermes Dashboard

VPS 上的 Hermes，本地怎么访问？

### 方法 A：SSH 隧道（推荐）

本地：
```bash
ssh -p 22389 -L 18789:127.0.0.1:18789 hermes@vps.com
```

然后浏览器开 `http://localhost:18789`，请求自动转发到 VPS。**无需任何额外配置**。

### 方法 B：Tailscale

VPS + 你的设备都装 Tailscale。
VPS 拿到 `100.x.x.x` 内网 IP。
浏览器直接 `http://100.x.x.x:18789`。

### 方法 C：Cloudflare Tunnel + Access

```bash
# VPS
cloudflared tunnel create hermes
cloudflared tunnel route dns hermes hermes.你的域名.com
cloudflared tunnel run hermes
```

加 Cloudflare Access 鉴权（免费 50 用户）。

之后 `https://hermes.你的域名.com` 全球访问，自动 HTTPS + 鉴权。

## 37.6 性能优化

### 国内 VPS 调 LLM 性能

测延迟：
```bash
hermes model test deepseek
```

输出：
```
deepseek/deepseek-chat:
  Endpoint reachable: ✓
  Authentication: ✓
  Round-trip latency: 234ms
  Tokens/s: 32
```

> 200ms 良好，> 500ms 看是否 VPS 网络问题。

### Honcho / FTS5 性能

```bash
# 看数据库性能
hermes memory benchmark
```

```
FTS5 search: 100 queries in 4.5s (45ms/q)
Honcho infer: 50 queries in 2.1s (42ms/q)
```

SSD 比 HDD 快 10 倍——**VPS 选 SSD 实例**。

### 内存监控

```bash
# 跑了几周看是不是内存涨
docker stats hermes        # 如果 docker 部署
free -h                    # 直接装的
```

Hermes 一般稳定在 300-800 MB。涨到 2GB+ 看 memory 是否需要清理。

## 37.7 跨地域 latency

如果你在国内 + Hermes 部署在海外：

| 链路 | 延迟 |
|---|---|
| 你 → 海外 VPS（SSH 直连）| 200-500ms |
| 你 → 海外 VPS（走 CN2 GIA）| 60-150ms |
| 你 → 国内 VPS | 20-50ms |

体验差很多。建议：
- 国内主用 → 国内 VPS + 国产 LLM
- 海外主用 → 海外 VPS + 国外 LLM
- 跨区域不可避免 → 选 CN2 GIA 线路 / Tailscale derp

## 37.8 多区域部署

如果你的 Hermes 要被全球访问：

```
[你 in 中国]                                [同事 in 美国]
        ↓                                          ↓
[国内 VPS - Hermes#1]   ←→   [海外 VPS - Hermes#2]
        ↓ 同步 memory                              ↓
   (FTS5 + Honcho)                          (FTS5 + Honcho)
```

通过 rclone / s3 同步 memory（**不是 active-active**，只是异步备份）。

太复杂，**99% 用户不需要**。

## 37.9 5 个真实部署案例（成本）

### 案例 A：个人 indie hacker
- 国内阿里轻量 2C2G (¥35/月)
- DeepSeek (¥20/月)
- CLI + Telegram（自己翻墙看）
- **总: ¥55/月**

### 案例 B：技术博主
- 海外 RackNerd 2C2G ($30/年)
- OpenAI + Claude ($20/月)
- Telegram + Discord
- **总: $22.5/月 (≈¥160)**

### 案例 C：小团队（5 人）
- 国内华为云 4C8G (¥120/月)
- DeepSeek + Kimi (¥80/月)
- 飞书 + OpenClaw 桥接
- **总: ¥200/月**

### 案例 D：研究者
- 自己电脑 + Modal 偶尔大算力
- DeepSeek + Modal ($30/月)
- 自动跑 trajectory generation
- **总: $30/月**

### 案例 E：纯本地（最便宜）
- 家里 NAS 或 24h 笔记本
- DeepSeek (¥10-30/月)
- CLI 为主
- **总: ¥30/月**

## 37.10 监控告警

VPS 跑长任务，挂了你要知道：

```bash
# 装 uptime-kuma 监控
docker run -d --name uptime-kuma \
  -p 3001:3001 \
  -v uptime-kuma:/app/data \
  louislam/uptime-kuma
```

Web UI 添加监控 `http://localhost:18789/health`。挂了发 Telegram / 邮件。

## 37.11 升级 VPS 资源

跑了一段时间发现内存 / CPU 不够？

| 服务商 | 升级方式 |
|---|---|
| 阿里轻量 | 后台一键升配，秒变 |
| RackNerd | 联系客服，可能要重装 |
| Vultr | 后台升配，几分钟 |

**建议**：开始小配置，发现真不够再升。**不要一开始买最贵的**。

---

## 看完这一章你应该知道

✅ 国内 VPS = 阿里 / 腾讯轻量，月 ¥35-50
✅ 海外 VPS = RackNerd $20-30/年（性价比之王）
✅ 公网部署 5 件套（SSH / 防火墙 / fail2ban / 绑本地 / 自动更新）
✅ 远程访问走 SSH 隧道 / Tailscale / Cloudflare
✅ 国内主用就国内 VPS + DeepSeek（不折腾翻墙）
✅ 个人成本可低至 ¥30-60/月

---

## 部署篇结束 🎉

至此 Hermes 部署相关全部讲完。下面 3 章是 **参考资料**。

**下一步**：[38. 故障排除大全 →](/hermes/reference/troubleshoot)

按"装不上 / 连不上 / 跑不通 / 性能差 / 安全" 5 类分组速查。
