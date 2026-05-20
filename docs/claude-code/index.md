---
layout: home

hero:
  name: "Claude Code"
  text: "Anthropic 官方 AI 编程助手"
  tagline: 不只是聊天——能自主探索代码库、修改多文件、执行命令、规划并验证 · 小白友好 · 持续更新
  image:
    src: /logo.png
    alt: Claude Code
  actions:
    - theme: brand
      text: 新手从这里开始 →
      link: /claude-code/guide/intro
    - theme: alt
      text: 直接装上跑起来
      link: /claude-code/guide/install
    - theme: alt
      text: 国内模型接入
      link: /claude-code/china/models

features:
  - icon: 🤖
    title: 代理式编码
    details: 不只是回答问题——Claude Code 能自主探索代码库、修改多个文件、执行命令、规划并验证，像一个真正的高级同事。
  - icon: 🌏
    title: 国内友好
    details: 完整的国内模型接入指南（硅基流动、通义千问、智谱 AI、OpenRouter），无需翻墙也能流畅使用。
  - icon: 🛡️
    title: 安全可控
    details: 细粒度权限系统，5 种权限模式，Hooks 强制规则，沙盒隔离——你始终掌控 Claude 能做什么。
  - icon: 🔌
    title: 无限扩展
    details: MCP 协议接入 GitHub、数据库、Slack 等外部服务；Skills 封装工作流；Plugins 一键安装社区能力。
  - icon: ⚡
    title: 自动化加速
    details: 并行处理大量文件，Git Worktree 多任务并行，GitHub Actions 集成，定时任务托管。
  - icon: 📖
    title: 新手友好
    details: 每章都有「本章你将学到」概览，命令均附中文注释，完整实战案例，从安装到高级用法全覆盖。
---

<div style="margin-top:64px">

## 它和别的工具有什么不一样

| | Claude Code | Codex | OpenClaw | Hermes |
|---|---|---|---|---|
| **定位** | **AI 编程助手** | AI 编程助手 | 个人 AI 代理 | 自进化 Agent |
| **运行位置** | **终端 / IDE** | 终端 | 后台常驻 | 后台常驻 |
| **杀手特性** | **代理式 + IDE 深度集成** | 国内模型友好 | 多 IM 接入 | 自动产 skill |
| **适合谁** | **改代码的开发者** | 国内开发者 | IM 重度用户 | 研究 / 进阶玩家 |

简单说：**Claude Code 是给开发者改代码用的最强工具**——能力深、上下文长、IDE 体验最好。

## 你能用它做什么

- 🐛 **改 Bug 不翻文档**：自然语言描述现象，AI 自主探索代码库定位修复
- 🏗️ **大型重构**：先列方案 → 分步执行 → 测试覆盖兜底
- 📝 **PR 描述自动生成**：看 diff 自动写清晰描述
- 🔧 **跨文件改动**：不用手动复制粘贴上下文
- 🌐 **接入 MCP**：让 AI 能查 GitHub / 数据库 / Slack

完整 [27 章中文教程 →](/claude-code/guide/intro)

## 5 分钟跑通第一步

```bash
# 安装
npm install -g @anthropic-ai/claude-code

# 启动
claude

# 在项目目录里跟它说话
"帮我看一下 src/auth/login.ts 这个文件有什么潜在 bug"
```

> **国内提示**：不能稳定翻墙？看 [国内模型接入](/claude-code/china/models)，用硅基流动 / OpenRouter 中转。

## 学习与交流

两个入口任选——群码可能 7 天过期，更推荐加作者微信（注明"AI 学习站"），**长期有效**。


<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin:32px auto 8px;max-width:600px;justify-items:center">

  <div style="text-align:center">
    <div style="font-weight:600;margin-bottom:10px;color:var(--vp-c-text-1)">🦞 学习交流群</div>
    <img src="/qun.png" alt="学习交流群二维码" style="width:300px;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.12)"/>
    <div style="font-size:18px;color:var(--vp-c-text-3);margin-top:8px">扫码入群（群失效时请加作者微信）</div>
  </div>

  <div style="text-align:center">
    <div style="font-weight:600;margin-bottom:10px;color:var(--vp-c-text-1)">👤 作者微信</div>
    <img src="/author-wx.png" alt="作者微信二维码" style="width:350px;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.12)"/>
    <div style="font-size:18px;color:var(--vp-c-text-3);margin-top:8px">微信号：<code>yuxi250428</code></div>
  </div>

</div>

</div>
