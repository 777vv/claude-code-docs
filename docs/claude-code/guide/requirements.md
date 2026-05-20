# 2. 系统要求

::: info 本章你将学到
- 支持的操作系统和硬件要求
- 需要什么账号才能使用
- 国内用户的特殊注意事项
:::

## 2.1 支持平台

| 操作系统 | 最低版本 |
|---------|---------|
| macOS | 13.0 (Ventura) 及以上 |
| Windows | 10 版本 1809+ 或 Server 2019+ |
| Ubuntu | 20.04 LTS 及以上 |
| Debian | 10 (Buster) 及以上 |
| Alpine Linux | 3.19 及以上 |

::: warning Windows 用户注意
Windows 原生安装需要先安装 [Git for Windows](https://git-scm.com/downloads/win)，因为 Claude Code 内部使用 Git Bash 执行命令。如果你使用 WSL（Windows Subsystem for Linux），则按 Linux 方式处理，不需要额外安装。
:::

## 2.2 硬件要求

| 项目 | 要求 |
|------|------|
| 内存 | 4 GB 以上（建议 8 GB） |
| 处理器 | x64 或 ARM64 |
| 磁盘空间 | 约 500 MB（程序本体 + 缓存） |
| 网络 | 需要互联网连接访问 API |

## 2.3 账号要求

Claude Code **不支持**免费的 claude.ai 账号，必须是以下之一：

| 账号类型 | 说明 | 适合 |
|---------|------|------|
| **Claude Pro** | 个人订阅，$20/月 | 个人开发者 |
| **Claude Max** | 个人高用量，$100/月 | 重度用户 |
| **Claude Team** | 团队版，$25/人/月 | 小团队 |
| **Claude Enterprise** | 企业版，定制价格 | 大型组织 |
| **Anthropic Console** | 按量付费 API | 开发者/API 接入 |
| **Amazon Bedrock** | AWS 托管 | AWS 用户 |
| **Google Vertex AI** | GCP 托管 | GCP 用户 |

::: tip 推荐方案
- **个人开发者**：Claude Pro（$20/月）是性价比最高的起点
- **国内用户**：可以通过 [硅基流动](/claude-code/china/models) 等服务商使用国内镜像，无需订阅官方
- **企业用户**：考虑 Team/Enterprise 或 Bedrock/Vertex 以满足合规要求
:::

## 2.4 网络要求

| 场景 | 要求 |
|------|------|
| 官方 Claude 账号 | 需能访问 `api.anthropic.com`（部分地区需代理） |
| 国内服务商 | 可直连，无需代理（如硅基流动、通义千问） |
| 代码库分析 | 仅本地，不上传代码到 Anthropic（工具调用在本机执行）|

::: info 代码隐私说明
Claude Code 在本地运行工具（读文件、执行命令等），只有**你选择发送给模型的内容**才会通过网络传输。Anthropic 的 [隐私政策](https://www.anthropic.com/privacy) 适用。
:::

## 2.5 地区支持

Claude Code 官方支持的国家和地区见 [Anthropic 支持地区列表](https://www.anthropic.com/supported-countries)。

**国内用户**：可以通过配置国内服务商（硅基流动等）绕过访问限制，详见 [国内模型接入](/claude-code/china/models)。

---

下一步：[安装 Claude Code](/claude-code/guide/install)
