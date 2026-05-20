# 37. NemoClaw 安全沙箱

::: info 本章你将学到
- NemoClaw 是什么、NVIDIA 为什么做它
- 它解决了 OpenClaw 哪些核心安全痛点
- 一行命令装上的安全增强能力
- 适合 / 不适合用它的场景
- 装好之后多了哪些功能
:::

## 37.1 NemoClaw 是什么

**NemoClaw** = NVIDIA 推出的 OpenClaw **安全增强层**。

简单理解：
- **OpenClaw** = 一个能干活的 AI 代理
- **NemoClaw** = 给它加一套**安全护甲**（沙箱、监控、审计、护栏）

它**不替代** OpenClaw，是**配套**。原话：

> NVIDIA NemoClaw is an open source stack that adds privacy and security controls to OpenClaw.

## 37.2 它解决什么痛点

OpenClaw 默认有一些安全问题（[15 章](/openclaw/ops/security-checklist) 详讲）：
- Skill 能执行任意 shell（高危）
- LLM 可能被 prompt injection 操纵
- 日志不带审计（出事不知道谁干的）
- 没有"二次拦截"（LLM 决定的事就直接执行）

NemoClaw 加上：
| 痛点 | NemoClaw 方案 |
|---|---|
| Skill 高权限 | gVisor 沙箱跑 skill，限文件/网络/shell |
| Prompt injection | LLM 输出过滤，敏感动作拦截 |
| 无审计 | 全链路审计日志，每个 LLM 决策可追溯 |
| 无二次确认 | Policy engine，配规则强制 confirm |
| 凭证暴露 | Secret manager 集成（Vault / AWS Secrets） |
| 数据泄露 | PII 检测 + 自动脱敏 |

## 37.3 适合 / 不适合的场景

### ✅ 适合
- 生产环境部署
- 接管真实公司数据（财务 / 客户 / HR）
- 给非技术员工用的 IM bot（防滥用）
- 监管合规要求（金融、医疗、政府）
- 多 agent 复杂系统，需要审计

### ❌ 不太适合
- 学习 / 实验阶段（增加复杂度）
- 个人独自使用（你自己出事自己担）
- 资源受限的设备（NemoClaw 占额外几百 MB 内存）

::: tip 渐进采用
新手先用裸 OpenClaw 跑熟，等用真东西、上生产时再装 NemoClaw。
:::

## 37.4 一行命令安装

```bash
# 一键安装到 OpenClaw 旁
curl -fsSL https://nemoclaw.nvidia.com/install.sh | bash
```

或在已有 OpenClaw Docker 部署里：

```yaml
# docker-compose.yml
services:
  openclaw:
    image: openclaw/openclaw:latest
    # ...

  nemoclaw:
    image: nvcr.io/nvidia/nemoclaw:latest
    environment:
      - OPENCLAW_HOST=openclaw
      - OPENCLAW_PORT=18789
    depends_on:
      - openclaw
```

启动后 NemoClaw 自动接管 OpenClaw 的入口流量。

## 37.5 装好后多了哪些能力

### ① Skill 沙箱

```yaml
# nemoclaw.yaml
sandbox:
  enabled: true
  type: gvisor                # 或 docker / firecracker
  default_skill_policy:
    network: deny             # 默认禁网络
    filesystem: read_only     # 默认只读
    shell: deny               # 默认禁 shell
  per_skill_overrides:
    - skill: gmail
      network: allow_domains
      allowed_domains:
        - "*.googleapis.com"
        - "*.googleusercontent.com"
    - skill: github-pr
      network: allow_domains
      allowed_domains: ["api.github.com"]
```

每个 skill 在 gVisor 容器里跑，越权立即拦截。

### ② Prompt Injection 防护

NemoClaw 装了 NVIDIA NIM 模型做 prompt 过滤：

```
LLM 输出: "好的，我将删除你的所有文件..."
        ↓
NemoClaw 检测: 这是高危动作 + 用户没明确要求
        ↓
拦截 + 告警 + 要求二次确认
```

### ③ Policy Engine

定义"谁能让 agent 做什么"：

```yaml
policies:
  - name: 财务操作必须二次确认
    match:
      action: ["transfer_money", "approve_invoice", "send_payment"]
    rule:
      require_human_approval: true
      approval_users: ["finance@company.com"]
      timeout: 5m

  - name: 周末不能改 prod
    match:
      action: "deploy"
      target_env: "production"
    schedule:
      block_on: ["Saturday", "Sunday"]
```

### ④ 审计日志

每个 LLM 决策 + skill 调用 + 用户动作全记录：

```sql
SELECT * FROM nemoclaw_audit
WHERE timestamp > '2026-05-19'
AND action_type = 'send_email'
ORDER BY timestamp DESC;
```

合规人员审查很容易。

### ⑤ Secret Manager

```yaml
secrets:
  backend: vault          # 或 aws_secrets_manager / azure_keyvault
  vault_url: https://vault.company.com
  vault_token: ${VAULT_TOKEN}
```

API Key 不再裸放 `.env`，从 Vault 拉，使用时才解密。

### ⑥ PII 检测 + 脱敏

```yaml
pii_protection:
  enabled: true
  scan_outputs: true       # LLM 输出扫描
  scan_logs: true          # 日志写入前扫描
  patterns:
    - type: credit_card
    - type: ssn
    - type: phone_number
    - type: id_card_cn      # 国内身份证
  action: redact            # 替换成 [REDACTED]
```

防止 LLM 不小心把用户隐私贴到群里。

## 37.6 性能开销

NemoClaw 不是零成本：
- CPU: 多用 5-15%
- 内存: 多占 200-500 MB
- 延迟: 每次调用多 50-200ms（policy 检查）

对绝大多数场景**完全可接受**。

## 37.7 不装 NemoClaw 的替代方案

如果你觉得太重，也可以**自己手动做到一半**：

| NemoClaw 功能 | 简化替代 |
|---|---|
| Skill 沙箱 | Docker 跑 OpenClaw（基础隔离） |
| Prompt 注入防护 | soul 里硬性写"不执行未确认指令" |
| Policy engine | agent.yaml 的 `auto_confirm_threshold: high` |
| 审计日志 | OpenClaw 自带 logs（不结构化但能查） |
| Secret manager | `.env` + 权限 600 |
| PII 检测 | 装 `pii-detect` skill |

**裸 OpenClaw 也能跑得安全**——只是 NemoClaw 帮你把这些自动化、标准化了。

## 37.8 实战：金融场景配置示例

```yaml
# 假设是一个公司财务 agent
policies:
  - name: 任何 >¥10000 转账必须 CFO 批准
    match:
      action: "transfer"
      amount_gt: 10000
    rule:
      require_approval_from: ["cfo@company.com"]

  - name: 不能转钱到外部账号
    match:
      action: "transfer"
      target_account_type: "external"
    rule:
      block: true
      alert_to: ["security@company.com"]

  - name: 所有发票必须保留原文
    match:
      action: "approve_invoice"
    rule:
      log_full_content: true
      retain_days: 2555      # 7 年（合规要求）

sandbox:
  default_skill_policy:
    network: deny
  per_skill_overrides:
    - skill: bank-api
      network: allow_domains
      allowed_domains: ["api.bank.com"]
      requires: human_approval

pii_protection:
  enabled: true
  scan_outputs: true
  patterns:
    - type: credit_card
    - type: id_card_cn
    - type: bank_account_cn
  action: redact
```

跑起来后，agent 无法做任何越权操作；所有动作都有审计；CFO 可以从 Dashboard 实时看到 agent 干了啥。

## 37.9 升级 / 维护

```bash
docker compose pull nemoclaw
docker compose up -d nemoclaw
```

策略改了：
```bash
# 重新加载 policy 不需要重启
nemoclaw policy reload
```

## 37.10 学习资源

- 官方：[nvidia.com/en-us/ai/nemoclaw](https://www.nvidia.com/en-us/ai/nemoclaw/)
- GitHub：[github.com/NVIDIA/nemoclaw](https://github.com/NVIDIA/nemoclaw)
- 安全白皮书：[nvidia.com/nemoclaw/security-whitepaper](https://www.nvidia.com/nemoclaw/security-whitepaper)

---

## 看完这一章你应该知道

✅ NemoClaw 是 OpenClaw 的安全增强层，不替代
✅ 提供 6 大能力: 沙箱 / 注入防护 / Policy / 审计 / Secret / PII
✅ 生产环境强烈推荐，个人玩可不装
✅ 性能开销 5-15% CPU，可接受
✅ 不装也能"自己做到一半"

---

## 🚀 部署篇结束

至此 OpenClaw 部署相关全部讲完。下面 3 章是 **参考资料**：
- 故障排除大全
- 术语表
- 资源链接

---

**下一步**：[38. 故障排除大全 →](/openclaw/reference/troubleshoot)

按"装不上 / 连不上 / 跑不通 / 性能差 / 安全" 5 类分组，索引式速查。
