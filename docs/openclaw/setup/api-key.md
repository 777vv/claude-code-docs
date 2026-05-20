# 7. 申请你的第一个 LLM API Key

::: info 本章你将学到
- 什么是 API Key、为什么 OpenClaw 必须要
- 国内国外用户分别选哪家最划算
- DeepSeek / OpenAI / Anthropic / Ollama 四种主流方案的逐步申请教程
- 怎么把 Key 安全地填到 OpenClaw 里
:::

## 7.1 API Key 是什么、为什么要

OpenClaw 自己**没有智能**——它只是一个调度框架。真正"思考、回答、决策"的是背后的 LLM（大语言模型）。

LLM 通常跑在云端服务器上，要使用就得：
1. 在服务商网站**注册账号**
2. **充值**（按使用量扣费，一般几块到几十块就够新手玩很久）
3. 生成一串 **API Key**（一串 `sk-xxxxxxxx` 字符串）
4. 把这串 Key **填进 OpenClaw 的配置**

这一章就是手把手带你走这四步。

::: tip 一句话比喻
- **没有 API Key 的 OpenClaw** = 一辆没油的车
- **API Key** = 加油卡，刷一次扣点钱
- **充值的钱** = 你的油钱
:::

## 7.2 选哪家？四个候选对比

|  | 价格 | 速度 | 质量 | 国内能直连 | 新手友好 |
|---|---|---|---|---|---|
| **DeepSeek** | 🟢 极便宜 | 🟢 快 | 🟡 中等偏上 | ✅ | ⭐⭐⭐⭐⭐ |
| **通义千问 (DashScope)** | 🟢 便宜 | 🟢 快 | 🟢 不错 | ✅ | ⭐⭐⭐⭐ |
| **OpenAI (GPT-4/5)** | 🟡 中 | 🟢 快 | 🟢 顶级 | ❌ 要代理 | ⭐⭐⭐ |
| **Anthropic (Claude)** | 🔴 偏贵 | 🟢 快 | 🟢 顶级 | ❌ 要代理 | ⭐⭐⭐ |
| **Ollama（本地）** | 🟢 完全免费 | 🟡 看硬件 | 🟡 看模型 | ✅ | ⭐⭐（要好显卡） |

**新手推荐**：
- 🇨🇳 **国内用户、想最便宜** → **DeepSeek**
- 🇨🇳 **国内、要更好质量** → **通义千问**
- 🌍 **能翻墙、追求质量** → **Anthropic Claude**
- 💻 **有 16GB 显存的好显卡，追求隐私** → **Ollama**

下面四个方案各给保姆级教程，挑你要用的看就行。

---

## 7.3 方案 A：申请 DeepSeek（国内首选）

### 优势
- 1 块钱能用很久（API 单价比 OpenAI 便宜 90%+）
- 不用翻墙
- 中文能力很强
- 注册超简单

### 步骤 1：注册账号

打开 [https://platform.deepseek.com](https://platform.deepseek.com)，右上角"登录/注册"。

支持手机号、微信、邮箱注册。**推荐用手机号**——以后方便找回。

### 步骤 2：实名认证（必须）

国内 LLM 服务商按规定必须实名。在「个人中心」上传身份证完成实名。一般 5 分钟审核完。

### 步骤 3：充值

进 **「充值」** 页面，最少充 ¥10（新人有时有赠送额度，不用立刻充）。

::: tip 1 块钱能用多少？
DeepSeek Chat 输入约 ¥0.001/千 tokens，输出约 ¥0.002/千 tokens。
1 块钱大概能跟 AI 来回聊 **几百轮对话**。新手 ¥10 起步够玩一个月。
:::

### 步骤 4：创建 API Key

进 **「API Keys」** 页面，点 **"创建 API Key"**。

- **Name**：随便取，比如 `openclaw-test`
- 创建后会显示一串 `sk-xxxxxxxxxxxxxxxx`
- **马上复制！** 关页面就再也看不到了，只能重新建一个

把这串复制到一个安全的地方先存着，下面要用。

### 步骤 5：填进 OpenClaw

OpenClaw 配置文件位置：
- macOS / Linux：`~/.openclaw/workspace/.env`
- Windows WSL2：`~/.openclaw/workspace/.env`（在 WSL 里）

用文本编辑器打开，加：
```bash
# DeepSeek
DEEPSEEK_API_KEY=sk-你刚才复制的那串
```

保存后重启 Gateway：
```bash
openclaw gateway restart
```

跳到 7.7 节验证。

---

## 7.4 方案 B：申请通义千问（国内备选）

适合**对质量要求略高于 DeepSeek**的国内用户。

### 步骤 1：开通阿里云账号

[阿里云首页](https://www.aliyun.com/) → 注册（已有阿里/淘宝账号可直接登）。

### 步骤 2：开通 DashScope

进 [DashScope 控制台](https://dashscope.console.aliyun.com/)，按提示开通。**新用户有免费额度，能用挺久**。

### 步骤 3：拿 API Key

控制台 → API-KEY 管理 → 创建新 KEY。复制 `sk-xxxxxx`。

### 步骤 4：填进 `.env`

```bash
DASHSCOPE_API_KEY=sk-你的key
```

---

## 7.5 方案 C：申请 OpenAI / Anthropic（国外）

::: warning 国内限制
OpenAI 和 Anthropic 的官方注册都需要：
- 海外手机号
- 海外信用卡（部分支持 PayPal）
- 稳定能访问的网络（建议翻墙）

不满足上面任一条，建议先用 DeepSeek 或通义。
:::

### 申请 OpenAI

1. 注册 [platform.openai.com](https://platform.openai.com)
2. 绑信用卡、充值（最少 $5）
3. API Keys 页面创建 Key，复制 `sk-proj-xxxxx`
4. 填进 `.env`：
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxx
   ```

### 申请 Anthropic Claude

1. 注册 [console.anthropic.com](https://console.anthropic.com)
2. 绑信用卡、充值
3. API Keys 页面创建
4. 填进 `.env`：
   ```bash
   ANTHROPIC_API_KEY=sk-ant-xxxxx
   ```

::: tip 中转服务：能用人民币付且国内能直连
不想折腾国际信用卡？可以用 **OpenRouter** 或 **硅基流动** 这类聚合服务：
- 一个 Key 能调多家模型
- 支持微信/支付宝充值
- 国内能直连

但价格通常比官方贵 5-20%。**新手如果只是学习用，建议先用 DeepSeek**。
:::

---

## 7.6 方案 D：本地跑 Ollama（完全免费）

适合**追求隐私 / 完全离线 / 有好显卡**的玩家。

### 优势 vs 劣势

**优势**
- 完全免费、不要 API Key
- 数据全在本地、不出网
- 离线也能用

**劣势**
- 需要 8GB+ 显存（7B 模型）或 16GB+（13B 模型）
- 跑得比云端慢（除非你有 RTX 4090 级显卡）
- 模型质量比 GPT-4/Claude 弱一档

### 步骤 1：装 Ollama

macOS / Linux：
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Windows：去 [ollama.com](https://ollama.com) 下载安装包。

### 步骤 2：下载模型

推荐新手：
```bash
ollama pull qwen2.5:7b      # 通义千问 7B，中文好
# 或
ollama pull deepseek-r1:8b  # DeepSeek R1 8B，推理能力强
```

### 步骤 3：测试模型能跑

```bash
ollama run qwen2.5:7b
# 进入交互对话，输入"你好"试试
```

### 步骤 4：在 OpenClaw 里用

Ollama 默认监听 `http://localhost:11434`。OpenClaw 通过"OpenAI 兼容"接口连：

`.env` 配置：
```bash
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_API_KEY=ollama   # 占位用，Ollama 不验证
```

详细配置见下一章 [8. 配置模型供应商](/openclaw/setup/model-provider)。

---

## 7.7 验证 Key 可用

填好 Key 重启 Gateway 后：

```bash
openclaw agent --message "你好，请用一句话介绍自己" --thinking low
```

如果输出类似：
```
我是你的 OpenClaw AI 助理，能帮你执行各种任务。
```

✅ Key 配好了，Agent 能正常对话。

如果报错：
- `401 Unauthorized` → Key 错了或被撤销，重新生成一个
- `429 Too Many Requests` → 调用频率太高，等几秒
- `Insufficient balance` → 账户余额不够，去服务商充值

## 7.8 ⚠️ API Key 安全提醒

### 5 条铁律

1. **永远不要**把 `.env` 文件上传到 GitHub 公开仓库（账号会被秒盗刷）
2. 配置 `.gitignore` 把 `.env` 排除掉
3. 在不同项目/不同设备上用**不同的 Key**，方便单独撤销
4. Key 失效或泄露立刻去控制台 **撤销旧 Key + 生成新 Key**
5. 定期看账单——异常使用是被盗最早的信号

### 万一泄露怎么办（应急流程）

1. 立刻登 LLM 服务商后台 → 撤销该 Key
2. 生成新 Key 填进 `.env`，重启 Gateway
3. 看历史账单确认没有异常消费（有就联系客服申诉退款）
4. 排查泄露源：是不是 push 到了公开仓库？是不是截图发出去了？

::: tip 用环境变量而不是写在 .env
进阶玩家可以用 shell 的环境变量管理（如 `direnv`、`pass`、`1password-cli`）替代 `.env`，安全级别更高。新手用 `.env` + `.gitignore` 已足够。
:::

---

## 看完这一章你应该知道

✅ API Key 是 OpenClaw 调用 LLM 的"加油卡"
✅ 国内首选 DeepSeek（便宜+不用翻墙）
✅ 国外首选 Anthropic Claude（质量顶级）
✅ 极致免费选 Ollama（要好显卡）
✅ 5 条铁律保住 Key 不被盗刷

---

**下一步**：[8. 配置模型供应商 →](/openclaw/setup/model-provider)

Key 有了，下一章教你在 OpenClaw 里正确配 provider，并演示多模型切换。
