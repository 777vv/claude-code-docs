# 30. 案例 6：浏览器自动化

::: info 这个案例你将做
让 Hermes 真的**开浏览器**操作：
- 自动登录某网站
- 自动填表
- 抓页面动态数据
- 监控价格 / 库存 / 状态
- 截图归档

用的是 v0.8+ 集成的 **Browser Use** 工具。

::: warning 高危场景
浏览器自动化 = AI 能用你的身份登录、付款、发消息。
**严格按本章安全清单执行**。
:::

## 30.1 装 Browser Use

```bash
hermes tools enable browser
```

会自动装 Playwright + 必要的浏览器二进制（约 300MB）。

验证：
```bash
hermes tools info browser_use
```

```
TOOL: browser_use
TOOLSET: browser
DESCRIPTION: AI-driven browser automation via Browser Use
REQUIRES: Playwright Chromium

PARAMETERS:
  task: string (required) - 自然语言任务描述
  headless: bool (default: true) - 无头模式
  start_url: string (optional) - 起始 URL
  timeout: int (default: 60) - 秒

RETURNS:
  steps: array - 实际执行的步骤
  screenshots: array - 关键节点截图
  result: any - 任务输出

REQUIRE_CONFIRM: true
```

## 30.2 第一个例子：抓商品价格

```
你: 用 browser_use 去 amazon.cn 搜 "thinkpad x1 carbon"，
   抓前 5 个搜索结果的价格和评分

Hermes:
🛠️ browser_use:
   task: "去 amazon.cn 搜 thinkpad x1 carbon, 抓前 5 结果价格和评分"
   confirm? [Y/n]

你: Y

[Playwright 启动 Chromium...]
[步骤 1: 打开 amazon.cn]
[步骤 2: 在搜索框输入 "thinkpad x1 carbon"]
[步骤 3: 点击搜索]
[步骤 4: 等待结果加载]
[步骤 5: 抽取前 5 项]
[步骤 6: 截图归档]

📊 结果:
1. ThinkPad X1 Carbon 12th Gen / ¥12999 / ⭐ 4.5
2. ThinkPad X1 Carbon 11th Gen / ¥9999  / ⭐ 4.6
3. ThinkPad X1 Carbon 13th Gen / ¥15999 / ⭐ 4.4
4. ...

截图: ~/.hermes/screenshots/amazon-search-2026-05-19.png
耗时: 45s, 成本: $0.05
```

## 30.3 监控价格（每天跑一次）

```
你: 帮我建一个 skill 叫 "monitor-thinkpad-price"，
   每天早 9 点去 amazon.cn 抓 thinkpad x1 carbon 13th gen 的价格，
   如果比上次便宜 ≥5% 就 Telegram 推送给我

Hermes:
✓ Created skill ~/.hermes/skills/monitor-thinkpad-price/
  - SKILL.md
  - handler.py (调 browser_use 抓价格)
  - state.json (存历史价格)

✓ Scheduled: 0 9 * * * (每天 9 点)
✓ Notification: telegram → 你
```

跑几天后某天你 Telegram 弹：
```
💰 价格提醒

ThinkPad X1 Carbon 13th Gen
旧价: ¥15999
新价: ¥13999 (-12.5%)

链接: amazon.cn/...
监控时间: 2026-05-25 09:01
```

## 30.4 自动登录后台

更高阶——让 Hermes 登录某个后台抓数据。

::: danger 极高风险场景
密码会被 Hermes 看到。**只在以下条件用**：
- 跑在隔离 backend（docker / modal）
- 用专用账号（不是主账号）
- 二步验证 / 手机验证开着（多一道防线）
- 操作只读
:::

```yaml
# ~/.hermes/credentials/internal-dashboard.yaml
url: https://internal.company.com
username: ${INTERNAL_DASHBOARD_USER}
password: ${INTERNAL_DASHBOARD_PASS}
mfa_secret: ${INTERNAL_DASHBOARD_MFA}      # TOTP secret
```

```
你: 登录 internal.company.com，
   导出"销售月报"页面的数据

Hermes:
🛠️ browser_use (backend: docker):
   task: 登录 + 导出销售月报
   credentials: from ~/.hermes/credentials/internal-dashboard.yaml

   confirm? [Y/n]

你: Y

[Docker 启动]
[Playwright 在容器内]
[访问 url, 填用户名 / 密码, 填 TOTP]
[导航到"销售月报", 点导出 CSV]
[CSV 复制到主机 ~/Downloads/]

✓ 已下载 月报-2026-05.csv
```

## 30.5 表单填写场景

```
你: 帮我去 cd.surveys.example.com 填一份调查问卷，
   回答按这份模板: ~/answers/feedback-template.md
```

Hermes 读 template → 用 browser_use 一项项填 → 提交。

## 30.6 进阶：cookies 保存避免重复登录

```yaml
browser:
  cookie_storage:
    enabled: true
    path: ~/.hermes/browser-cookies/
    encrypted: true
```

第一次登录后 cookies 加密保存。下次再用同一站点跳过登录。

## 30.7 反爬应对

很多网站有反爬。Hermes 默认：
- 用真实浏览器（不是 headless 也能切）
- 随机 user agent
- 自然延迟（不是机器人速度）
- 真实 viewport

仍可能被检测。手动加强：
```yaml
browser:
  stealth: true                # 反检测模式
  human_delay: true            # 模拟人类输入节奏
  rotate_user_agent: true
  proxy: ${RESIDENTIAL_PROXY}  # 用住宅 IP 代理
```

## 30.8 截图归档

每次 browser_use 自动截图（关键节点）：

```
~/.hermes/screenshots/
└── 2026-05-19/
    ├── amazon-search-090123.png
    ├── amazon-product-090125.png
    └── ...
```

帮你 debug "为什么 AI 这么做"——看截图就知道当时页面长啥样。

## 30.9 失败处理

页面变了 / 元素找不到 → 重试 / fallback：

```yaml
browser:
  retry_on_error: 3
  fallback_strategy: ai_fix_selector   # AI 自己找正确元素
```

完全失败：
```
❌ Task failed:
- Step 3: button "Add to Cart" not found
- Tried: CSS selector, XPath, AI vision
- Last screenshot: ~/.hermes/screenshots/.../fail.png

建议:
1. 看截图确认页面是否正常
2. 检查 amazon 是否改版
3. 可能是反爬：换 proxy
```

## 30.10 不该让 Hermes 做的事

❌ **不要**：
- 用主账号登录有金钱的服务（银行 / 支付）
- 自动完成有"我不是机器人"验证的注册（违反 ToS）
- 抓有版权保护的内容大规模复制
- 给恶意网站填表单（钓鱼）
- 在主机直接跑 + 留任何登录 cookies（必须沙箱）

✅ **可以**：
- 只读监控公开页面
- 用专用账号操作内部系统
- 在隔离容器跑高敏感任务
- 抓你自己有权访问的数据

## 30.11 监控 / 审计

```bash
hermes browser-use logs --since 7d
```

每次 browser_use 调用都有日志：
- 任务描述
- 访问的 URL 列表
- 用的 credentials
- 截图
- 结果

定期 review，确认 AI 没乱来。

## 30.12 安全清单

🔴 **必须**
- [ ] backend: docker 或 modal（绝不 local）
- [ ] credentials 加密存储（用 `hermes secrets`）
- [ ] 设白名单 URL（不是任何站都能访问）
- [ ] 截图保留 + 定期审计

🟡 **建议**
- [ ] 用专用账号 / 子账号
- [ ] 二步验证开
- [ ] residential proxy
- [ ] 速率限制（防反爬封号）

❌ **绝不**
- [ ] 跑在主力机 local backend
- [ ] credentials 写明文 .env
- [ ] 抓金融账户 / 支付页面
- [ ] 用主账号登录

## 30.13 成本

每次 browser_use：
- LLM 决策 token: ¥0.05-0.30（看页面复杂度）
- 浏览器资源（local backend = 免费 / cloud backend 看用量）

跑 1 小时浏览器自动化大致 ¥5-15。

---

## 看完这个案例你应该会

✅ 装并配置 Browser Use 工具
✅ 自然语言驱动浏览器
✅ 价格监控 / 数据抓取 / 后台登录场景
✅ Cookies / Credentials 安全存储
✅ 反爬应对 + 截图审计
✅ 严格的安全清单

---

**下一步**：[31. 案例 7：训练数据生成 →](/hermes/cases/trajectory-data)

下一个开发者向案例：用 Hermes trajectory 造微调数据集。
