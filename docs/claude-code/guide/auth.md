# 4. 登录认证

::: info 本章你将学到
- 支持哪些账号类型
- 如何完成首次登录
- 如何切换账号和管理认证状态
:::

## 4.1 支持的账号类型

| 账号类型 | 登录方式 | 适合 |
|---------|---------|------|
| Claude Pro/Max/Team/Enterprise | OAuth 浏览器授权 | 个人/团队订阅用户 |
| Anthropic Console | API Key | 开发者按量付费 |
| Amazon Bedrock | AWS 凭证 | AWS 托管用户 |
| Google Vertex AI | GCP 凭证 | GCP 托管用户 |
| 国内服务商（硅基流动等）| API Key | 国内用户，见[国内适配](/china/models) |

## 4.2 首次登录

安装后首次运行 `claude`，会自动引导登录流程：

```bash
claude
```

也可以手动触发：

```bash
# 标准 OAuth 登录（Claude 订阅账号）
claude auth login

# 使用 API Key 登录（Anthropic Console）
claude auth login --console
```

**OAuth 流程**：
1. 终端显示一个 URL 和验证码
2. 浏览器自动打开（或手动访问该 URL）
3. 在浏览器中完成登录并授权
4. 终端自动收到授权，登录完成

**API Key 流程**：
1. 登录 [console.anthropic.com](https://console.anthropic.com) 获取 API Key
2. 运行 `claude auth login --console`
3. 粘贴 API Key

## 4.3 认证管理命令

```bash
# 查看当前登录状态
claude auth status

# 切换账号（重新登录）
claude auth login

# 退出登录
claude auth logout
```

在会话中也可以用斜杠命令：

```
/login      切换账号
/logout     退出登录
/status     查看账号和连接状态
```

## 4.4 第三方云服务认证

### Amazon Bedrock

```bash
# 方式一：环境变量（推荐 CI/CD 场景）
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
export ANTHROPIC_BEDROCK_BASE_URL="https://bedrock-runtime.us-east-1.amazonaws.com"

# 方式二：AWS CLI 配置文件
aws configure
claude auth login --bedrock
```

### Google Vertex AI

```bash
# 先用 gcloud 认证
gcloud auth application-default login

# 设置项目和区域
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-east5"
export ANTHROPIC_VERTEX_BASE_URL="https://us-east5-aiplatform.googleapis.com"

claude auth login --vertex
```

## 4.5 CI/CD 无头认证

在自动化环境中（GitHub Actions、Jenkins 等），不能使用交互式登录：

```bash
# 生成长效 Token（需先在本地完成交互式登录）
claude setup-token

# CI 中使用环境变量
export ANTHROPIC_API_KEY="sk-ant-..."
claude -p "运行测试并报告结果" --output-format json
```

::: tip 安全提示
- 不要把 API Key 直接写入代码或配置文件
- 使用环境变量或 CI 平台的 Secrets 管理
- 定期轮换 API Key
:::

## 4.6 多账号管理

如果你有多个账号（比如个人和工作），可以：

```bash
# 登录时选择或切换账号
claude auth login

# 查看所有已登录账号
claude auth status

# 用不同配置文件隔离
# 在项目的 .claude/settings.json 中指定 apiKey
```

---

下一步：[5 分钟快速上手](/guide/quickstart)
