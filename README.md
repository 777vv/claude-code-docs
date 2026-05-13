# Claude Code 学习站

一份面向中文用户的 Claude Code 系统学习文档，基于 [VitePress](https://vitepress.dev/) 构建，覆盖从安装入门到生产实战的完整知识体系。

## 内容概览

| 章节 | 涵盖内容 |
|------|----------|
| 入门 | 是什么 / 系统要求 / 安装 / 登录 / 快速开始 |
| 基础 | 基础使用 / CLI 命令 / 斜杠命令 / 键盘快捷键 |
| 进阶 | CLAUDE.md / 权限模式 / 计划模式 / Skills / Subagents / Hooks / MCP / 配置 / Plugins |
| 国内适配 | 国内模型接入（硅基流动 / OpenRouter / 通义 / 智谱 / DeepSeek）/ 代理与网络 |
| 集成与自动化 | GitHub Actions CI/CD / Agents SDK 开发指南 |
| 实战案例 | 从零搭建全栈项目 / 遗留代码重构 / 复杂 Bug 调试 |
| 技巧与参考 | 最佳实践 / 常见工作流 / 并行自动化 / IDE 集成 / 故障排除 / 术语表 / 资源链接 |

## 技术栈

- [VitePress](https://vitepress.dev/) — 静态站点生成器
- 品牌配色：橙棕 `#c6613f`，暖白背景 `#fafaf7`，支持亮色 / 暗色双模式
- 本地全文搜索（无需外部服务）
- 中文界面标签全覆盖

## 本地开发

**环境要求**：Node.js ≥ 18

```bash
# 克隆项目
git clone https://github.com/777vv/claude-code-docs.git
cd claude-code-docs

# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

## 构建与预览

```bash
# 构建静态文件（输出到 docs/.vitepress/dist/）
npm run build

# 本地预览构建产物
npm run preview
```

## 目录结构

```
.
├── docs/
│   ├── index.md                  # 首页
│   ├── .vitepress/
│   │   ├── config.ts             # 站点配置（导航、侧边栏等）
│   │   └── theme/
│   │       ├── index.ts          # 主题入口
│   │       └── custom.css        # 品牌色 & 样式定制
│   ├── guide/                    # 入门（5 篇）
│   ├── basics/                   # 基础（4 篇）
│   ├── advanced/                 # 进阶（9 篇）
│   ├── china/                    # 国内适配（2 篇）
│   ├── integration/              # 集成与自动化（2 篇）
│   ├── cases/                    # 实战案例（4 篇）
│   └── tips/                     # 技巧与参考（7 篇）
├── package.json
└── .gitignore
```

## 部署

构建后将 `docs/.vitepress/dist/` 目录部署到任意静态托管服务即可：

- **GitHub Pages**：参考站内 `集成与自动化 → GitHub Actions 集成` 章节，内含完整 workflow 配置
- **Vercel / Netlify**：构建命令 `npm run build`，发布目录 `docs/.vitepress/dist`
- **自有服务器**：将 `dist/` 目录内容放到 Nginx / Caddy 静态目录

## 学习交流群

欢迎扫码加入学习交流群，一起探讨 Claude Code 使用技巧：

<img src="docs/public/qun.png" alt="学习交流群二维码" width="200"/>

## 贡献 & 反馈

文档内容如有错误或过期信息，欢迎提 Issue 或 PR。

## License

文档内容基于 Anthropic 官方公开资料整理，仅供学习参考。
