# 35. 本地 vs 云端

::: info 本章你将学到
- 6 种 OpenClaw 部署位置对比（本地电脑 / NAS / 树莓派 / 云服务器 / VPS / 容器平台）
- 5 个维度评分（成本 / 性能 / 隐私 / 可用性 / 维护）
- 不同场景推荐方案
- 迁移：从本地到云端、从家用到生产
:::

## 35.1 6 种部署位置对比

| 位置 | 成本 | 性能 | 隐私 | 可用性 | 维护 | 适合 |
|---|---|---|---|---|---|---|
| **本地主力电脑** | 🟢 0 | 🟢 强 | 🟢 高 | 🔴 关机就停 | 🟢 简 | 测试 / 学习 |
| **专用旧笔记本/迷你机** | 🟢 0 | 🟡 中 | 🟢 高 | 🟢 7×24 | 🟢 简 | 个人长期 |
| **群晖 NAS / 黑群晖** | 🟢 0 | 🟡 中 | 🟢 高 | 🟢 7×24 | 🟡 中 | 已有 NAS |
| **树莓派 4/5** | 🟢 ¥500 一次 | 🟡 弱 | 🟢 高 | 🟢 7×24 | 🟡 中 | 极致低成本 |
| **国内云轻量服务器** | 🟡 ¥30-50/月 | 🟢 中 | 🟡 中 | 🟢 7×24 | 🟢 简 | 中国用户首选 |
| **海外 VPS** | 🟡 $20-30/年 | 🟢 中 | 🟡 中 | 🟢 7×24 | 🟢 简 | 用 OpenAI/Claude |

## 35.2 5 个维度评分详解

### 💰 成本

| 方案 | 一次性 | 月度 |
|---|---|---|
| 本地主力机 | ¥0 | ¥0（电费忽略） |
| 旧笔记本/小主机 | ¥500-1500 | ¥10（电费） |
| NAS | ¥1500-5000 | ¥15 |
| 树莓派 5 | ¥500-800 | ¥3 |
| 国内云轻量 2C2G | ¥0 | ¥35 |
| 海外 VPS 1C1G | ¥0 | $2-3 |

### 🚀 性能

OpenClaw Gateway 本身只占 200-400 MB 内存，**性能要求很低**。
重头戏是 LLM——所以"性能"主要看：
- 网络延迟（影响 LLM API 调用速度）
- 同时跑多少 agent（每个 agent 独立 LLM session）
- 是否要跑本地 Ollama（要好 GPU）

|  | 国内 LLM 延迟 | 国外 LLM 延迟 |
|---|---|---|
| 国内云 | < 200ms | 慢 / 不通 |
| 海外 VPS | 慢 | < 200ms |
| 本地 + 国内 LLM | < 200ms | 慢 / 不通 |
| 本地 + 国外 LLM (翻墙) | 慢 | 不稳定 |

::: tip 选 LLM 决定选位置
**用 DeepSeek / 通义 / Kimi** → 选 国内云 / 本地（国内网络）
**用 Claude / GPT** → 选 海外 VPS / 本地（带稳定代理）
:::

### 🔒 隐私

| 方案 | 数据存在哪 | 谁能看到 |
|---|---|---|
| 本地 | 你的硬盘 | 只有你 |
| NAS / 树莓派 | 家里设备 | 家里 |
| 云服务器 | 云厂商机房 | 理论上云厂商能看到（但合同约定不看） |

**最高隐私**：本地 + Ollama（数据 0 出网）
**够用隐私**：国内云 + DeepSeek（合规、有 SLA）

### 🟢 可用性

可用性 = OpenClaw 能在你需要时回应你。

主力机的致命问题：**关机 / 睡眠 = 服务停**。

- 你晚上 11 点睡了关电脑 → 凌晨 3 点的 cron 不会跑
- 笔记本合盖 → Agent 罢工
- 出差带电脑 → 家里的智能家居 agent 失联

所以**严肃使用必须用 7×24 设备**。

### 🛠 维护

| 方案 | 维护点 |
|---|---|
| 主力机 | 跟你电脑同步 |
| 旧笔记本 | 偶尔重启 |
| NAS / 树莓派 | 偶尔重启 + 系统升级 |
| 云服务器 | 监控费用 + 安全补丁 |

云服务器额外注意：
- 防火墙规则
- 自动续费（断了停机）
- 备份策略（实例挂了能恢复）

## 35.3 场景推荐

### 场景 A：纯学习 / 体验
**主力机**就行。装好玩两周，决定要不要长期用。

### 场景 B：个人长期使用（不想花钱）
- **树莓派 5** + 国内 LLM API：一次 ¥500 - 800，月度成本 < ¥10
- 或：家里有旧笔记本/Mac mini → 改成 Linux 永久跑

### 场景 C：个人 / 小团队，要稳定，不想折腾硬件
**国内云轻量 2C2G**（阿里/腾讯/华为）：¥30-50/月。
- 一开机就 7×24
- 网络稳定
- 升级方便

### 场景 D：用国外 LLM（Claude / GPT）
**海外 VPS**（Vultr / DigitalOcean / RackNerd）：¥150-300/年
- LLM API 直连
- 中国家里走 SSH 隧道访问

### 场景 E：企业 / 公司部署
- 自建机房 / Kubernetes
- 高可用（双节点 + 数据库主从）
- 见后面 36 章 Docker 部署

### 场景 F：极致隐私 / 离线
- 本地服务器 + Ollama
- 不连任何外部 LLM API
- 数据 100% 在内网

## 35.4 国内云服务商推荐

### 阿里云轻量
- [aliyun.com/product/swas](https://www.aliyun.com/product/swas)
- 2C2G 50G 30Mbps: ¥99/3 个月（约 ¥33/月）
- 镜像选 "Ubuntu 22.04"
- 优势：稳定、生态全、新用户优惠多

### 腾讯云轻量
- [cloud.tencent.com/product/lighthouse](https://cloud.tencent.com/product/lighthouse)
- 类似配置 ¥99/3 个月
- 优势：学生免费 1 年

### 华为云耀云
- 2C2G ¥30-50/月
- 优势：节假日活动多

### 不推荐
- 国外大厂（AWS / GCP / Azure）：贵且国内访问慢
- 小服务商：稳定性堪忧

## 35.5 部署到国内云完整步骤

```bash
# 1. 买好服务器，拿到 IP + root 密码

# 2. ssh 上去
ssh root@xxx.xxx.xxx.xxx

# 3. 装 Node.js 24（用 nvm）
curl -o- https://gitee.com/mirrors/nvm/raw/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 24
nvm use 24

# 4. 换 npm 镜像
npm config set registry https://registry.npmmirror.com

# 5. 装 OpenClaw
npm install -g openclaw@latest

# 6. 跑 onboard
openclaw onboard --install-daemon

# 7. 配 LLM Key、channel、agent 等
# 编辑 ~/.openclaw/workspace/*.yaml

# 8. 启动
openclaw gateway start
openclaw gateway status

# 9. 防火墙 / 安全组放开端口
# 阿里云安全组: 入方向 18789（仅自己 IP）
# 或不放开（用 SSH 隧道访问 Dashboard）

# 10. 配开机自启（onboard 已自动做）
systemctl status openclaw-gateway
```

## 35.6 远程访问云端 OpenClaw

**永远不要**裸暴露 Dashboard 公网。三选一：

### 法 1: SSH 隧道（最简单最安全）
```bash
# 本地电脑
ssh -L 18789:localhost:18789 root@your-server

# 然后本地浏览器: http://localhost:18789
```

### 法 2: Tailscale
服务器和你的设备都装 Tailscale → 自动内网。

### 法 3: Cloudflare Tunnel + Access
零成本拿 HTTPS 域名 + 鉴权。详见 [24. 网络章](/openclaw/china/network)。

## 35.7 迁移：本地 → 云

```bash
# 本地: 备份 workspace
tar -czf openclaw-bak.tar.gz ~/.openclaw

# 上传到云
scp openclaw-bak.tar.gz root@server:/root/

# 云端
ssh root@server
# 装 OpenClaw（按 35.5 步骤）
openclaw gateway stop
rm -rf ~/.openclaw
tar -xzf /root/openclaw-bak.tar.gz -C ~
openclaw gateway start
```

完事。所有 agent / memory / skill 全迁移。

## 35.8 维护清单

无论部署在哪：
- [ ] 每天自动备份 `~/.openclaw/workspace`（[15 章](/openclaw/ops/security-checklist) 有脚本）
- [ ] 每周 `npm update -g openclaw`
- [ ] 每月看一次成本报告 `openclaw stats cost --period 30d`
- [ ] 每季度 audit skill 列表，卸不用的
- [ ] 每半年轮换 API Key

云服务器额外：
- [ ] 设阿里云余额告警（防欠费）
- [ ] OS 安全补丁 `apt update && apt upgrade`
- [ ] 监控磁盘使用 `df -h`（log 别堆爆）

---

## 看完这一章你应该知道

✅ OpenClaw 部署位置 6 选 1，按 5 维度评估
✅ 国内用户 + DeepSeek → 国内云轻量
✅ 国外 LLM → 海外 VPS
✅ 极致隐私 → 本地 + Ollama
✅ 远程访问必走 SSH 隧道 / Tailscale
✅ 迁移就是 `tar` + `scp`

---

**下一步**：[36. Docker 完整部署 →](/openclaw/deploy/docker)

不想手动装一堆? Docker 一条命令搞定，便于隔离 + 迁移。
