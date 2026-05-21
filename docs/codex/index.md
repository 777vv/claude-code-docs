---
layout: home

hero:
  name: "Codex"
  text: "Open AI 编程助手"
  tagline: OpenAI Codex CLI 完整中文教程 · 覆盖安装、配置、国内模型对接保姆级指南
  image:
    src: /codex-logo.svg
    alt: Codex
  actions:
    - theme: brand
      text: 新手从这里开始 →
      link: /codex/guide/what-is-codex
    - theme: alt
      text: 国内模型对接
      link: /codex/china-models/overview

features:
  - icon: 🖥️
    title: 纯终端操作
    details: 无需 IDE 插件，直接在命令行中与 AI 协作读文件、改代码、执行命令，工作流极简。
  - icon: 🔒
    title: 三级权限控制
    details: Auto / 只读 / 完全访问三种安全模式，精确控制 AI 能做什么，所有操作可 git 回滚。
  - icon: 🇨🇳
    title: 国内模型支持
    details: 完整对接 DeepSeek、通义千问、Kimi、Ollama 本地模型，无需魔法即可使用。
  - icon: 🧩
    title: MCP 扩展协议
    details: 支持 Model Context Protocol，可接入 Figma、浏览器、数据库等第三方工具。
  - icon: 📋
    title: AGENTS.md 指令系统
    details: 通过 AGENTS.md 文件为每个项目配置专属 AI 行为规则和上下文信息。
  - icon: 🔓
    title: 完全开源
    details: 代码在 GitHub 公开，社区活跃，超 75,000 星。欢迎贡献与定制。
---

<div style="max-width:960px;margin:0 auto;padding:48px 24px 0">

## 支持的国内模型

以下模型均已验证可与 Codex 配合使用，点击对应名称查看保姆级接入教程：

<div class="model-grid">
  <a href="/codex/china-models/deepseek" class="model-card" style="text-decoration:none">
    <span style="font-size:2rem">🔍</span>
    <span class="name">DeepSeek</span>
  </a>
  <a href="/codex/china-models/qwen" class="model-card" style="text-decoration:none">
    <span style="font-size:2rem">☁️</span>
    <span class="name">通义千问</span>
  </a>
  <a href="/codex/china-models/kimi" class="model-card" style="text-decoration:none">
    <span style="font-size:2rem">🌙</span>
    <span class="name">Kimi</span>
  </a>
  <a href="/codex/china-models/ollama-local" class="model-card" style="text-decoration:none">
    <span style="font-size:2rem">🦙</span>
    <span class="name">Ollama 离线</span>
  </a>
  <a href="/codex/china-models/others" class="model-card" style="text-decoration:none">
    <span style="font-size:2rem">🤖</span>
    <span class="name">更多模型</span>
  </a>
</div>

## 快速安装

```bash
# 安装 Codex CLI（需要 Node.js 18+）
npm install -g @openai/codex

# 验证安装
codex --version

# 启动（首次运行会引导你完成认证）
codex
```

> **新手提示：** 如果你在国内使用，建议先看 [国内模型对接总览](/codex/china-models/overview)，可以跳过购买 OpenAI API 的步骤。

## 学习与交流

遇到 Codex 使用问题想和大家交流？两个入口任选——群码可能 7 天过期，更推荐加作者微信（注明"AI 学习站"），**长期有效**。


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
