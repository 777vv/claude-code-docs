---
layout: home

hero:
  name: "Hermes"
  text: "会自我进化的 AI Agent"
  tagline: Nous Research 出品 · The agent that grows with you · 40 章节 · 小白友好 · 持续更新
  image:
    src: /hermes-helmet.svg
    alt: Hermes Agent
  actions:
    - theme: brand
      text: 新手从这里开始 →
      link: /hermes/intro/what-is
    - theme: alt
      text: 直接装上跑起来
      link: /hermes/intro/install
    - theme: alt
      text: 从 OpenClaw 迁移过来
      link: /hermes/cases/migrate-from-openclaw

features:
  - icon: 🧬
    title: 自我进化的 Skills
    details: 完成复杂任务后 agent 自己写 markdown skill 总结经验。用得越久越聪明，符合 agentskills.io 开放标准，可分享可继承。
  - icon: 🧠
    title: 跨会话深度记忆
    details: Honcho 用户建模 + FTS5 会话搜索 + 双压缩 prompt 缓存。它不仅记得你说过什么，还能"理解你是个怎样的人"。
  - icon: 🔌
    title: 7 种执行环境随便切
    details: local / Docker / SSH / Modal / Daytona / Singularity / Vercel Sandbox——同一个 agent 可以跑在任何地方。
  - icon: 🧰
    title: 40+ 内置工具开箱
    details: 文件操作、终端命令、网搜、代码分析、浏览器（Browser Use）、Subagents 并行……不用一一装 skill。
  - icon: 🌍
    title: 200+ 模型自由切换
    details: Nous Portal / OpenRouter / Kimi / 通义 / GLM / MiniMax / Anthropic / OpenAI / Ollama，一行 `hermes model` 切换。
  - icon: 🦞
    title: 兼容 OpenClaw
    details: 内置 `hermes claw migrate` 命令，从 OpenClaw 一键迁移配置、记忆、skills，无缝跳船。
---

<div style="margin-top:64px">

## 它和 Claude Code / Codex / OpenClaw 有什么不一样？

| | Claude Code | Codex | OpenClaw | **Hermes** |
|---|---|---|---|---|
| **类别** | 编程助手 | 编程助手 | 个人 AI 助手 | **自进化 AI Agent** |
| **语言** | TypeScript | TypeScript | Node.js | **Python (uv)** |
| **杀手特性** | IDE 深度集成 | 终端原生 | 50+ channel | **自我学习 + 训练数据生成** |
| **Channel 数** | IDE / CLI | CLI | 50+ | 6-7（IM）+ CLI |
| **执行后端** | 本地 | 本地 | 本地 / Docker | **7 种环境（含云沙箱）** |
| **记忆系统** | CLAUDE.md | AGENTS.md | Memory + skills | **Honcho 用户建模 + 自动 skill** |
| **适合谁** | 改代码的开发者 | 终端党 | 重 IM 用户 / 多人 | **技术控 / 研究员 / 玩家** |

简单说：**Hermes 是把"会思考、会学习"做到最深的开源 agent**——你用得越久它越懂你，并把经验沉淀成可分享的 skill。

## 你能用它做什么

- 🧬 **看着 agent 进化**：用一周后翻它自己生成的 skill，能看出"它今天又学会了什么"
- 🌐 **跨平台对话连续**：Telegram 起话 → Signal 续 → CLI 收尾，全程同一个记忆
- 🔄 **多 backend 跑同一任务**：本地试通了直接推到 Modal 云端跑
- 🌙 **夜班 cron**：电脑关机也能跑（SSH backend）
- 🧪 **训练自己的微调数据**：trajectory generation 批量造数据集
- 🤖 **并行调研**：subagents 同时跑 5 路研究

完整 [10 个实战案例 →](/hermes/cases/self-evolve)

## 5 分钟跑通第一步

```bash
# 一行装好（Linux / macOS / WSL2）
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 国内访问慢用代理
curl -fsSL https://ghfast.top/https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

source ~/.bashrc

# 配模型（交互式向导）
hermes setup

# 启动对话
hermes
```

> **来自 OpenClaw 的同学**：直接 `hermes claw migrate` 把 OpenClaw 配置/记忆/skill 一键迁过来。详见 [案例 34 →](/hermes/cases/migrate-from-openclaw)

## 学习与交流

Hermes 使用问题想随时问？两个入口任选——群码可能 7 天过期，更推荐加作者微信（注明"AI 学习站"），**长期有效**。

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
