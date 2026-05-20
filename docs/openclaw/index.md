---
layout: home

hero:
  name: "OpenClaw"
  text: "能干活的个人 AI 助手"
  tagline: 不只是聊天 · 能自己执行任务的开源 AI Agent · 40 章节 · 小白友好 · 持续更新
  image:
    src: /openclaw-mascot.svg
    alt: OpenClaw
  actions:
    - theme: brand
      text: 新手从这里开始 →
      link: /openclaw/intro/what-is
    - theme: alt
      text: 直接装上跑起来
      link: /openclaw/intro/install
    - theme: alt
      text: 国内模型接入
      link: /openclaw/china/models

features:
  - icon: 🦞
    title: 本地优先 · 隐私可控
    details: 跑在你自己的电脑或服务器上，对话、记忆、技能全部本地，不必把数据交给云厂商。
  - icon: 💬
    title: 接入你已在用的聊天工具
    details: 飞书 / 钉钉 / 企业微信 / QQ / 微信 / Telegram / Slack / Discord 全支持，不必学新 UI。
  - icon: 🧠
    title: 长记忆 + 多 Agent
    details: 跨会话记住偏好和上下文。一个 Gateway 可托管多个 agent，权限隔离、各管一摊。
  - icon: 🧩
    title: Skills 技能系统
    details: ClawHub 上百个开源 skill 即装即用，也能自己写 Markdown 包扩展能力。
  - icon: 🌐
    title: 真能做事
    details: 浏览器自动化、Shell 命令、文件读写、定时任务、Webhook 触发，不是只会聊天的玩具。
  - icon: 🇨🇳
    title: 国内适配完整
    details: DeepSeek / 通义千问 / Kimi / 智谱 / Ollama 全覆盖，飞书钉钉企微保姆级教程。
---

<div style="margin-top:64px">

## 它和 Claude Code / Codex 有什么不一样？

| | Claude Code | Codex | **OpenClaw** |
|---|---|---|---|
| **定位** | AI 编程助手 | AI 编程助手 | **能干活的个人助手** |
| **跑在哪** | 终端 / IDE | 终端 | **本地后台常驻 (Gateway)** |
| **用户界面** | 命令行交互 | 命令行交互 | **你已用的聊天工具** |
| **主要场景** | 改代码 | 改代码 | **自动化办公 / 信息整理 / 协作 / 也能改代码** |
| **能力扩展** | Skills / MCP | Skills / MCP | **Skills + Channels + Agents 三维扩展** |

简单说：**Claude Code 和 Codex 是给开发者改代码用的；OpenClaw 是给所有人用 AI 处理日常事务的**，编程只是它众多能力之一。

## 你能用它做什么

- 📰 **早上自动收资讯**：抓 RSS / V2EX / Hacker News → AI 总结 → 8 点推到飞书
- ✉️ **邮件自动分类**：进 Gmail 的邮件按重要性分桶，重要的 ping 你
- 🤖 **团队问答机器人**：飞书里 @ 机器人问公司知识库，立刻回答
- 🚨 **项目守夜人**：GitHub CI 失败 / Sentry 报错 24 小时监控
- ✍️ **一稿多平台**：写一遍，自动适配公众号 / 小红书 / 知乎风格分发
- 👨‍💻 **AI 写代码**：在飞书里一句话让它去 clone 仓库改代码并提 PR

完整 [10 个实战案例 →](/openclaw/cases/daily-news)

## 5 分钟跑通第一步

```bash
# 装好 Node.js 22.19+ 之后，一条命令安装
npm install -g openclaw@latest

# 引导配置（自动注册成后台服务）
openclaw onboard --install-daemon

# 启动 Gateway
openclaw gateway --port 18789
```

> **新手提示：** 强烈建议先看 [核心概念图解](/openclaw/intro/concepts)，搞懂 Gateway / Agent / Skill / Channel 这几个词再开始装，少走 90% 弯路。

## 学习与交流

OpenClaw 使用问题想随时问？两个入口任选——群码可能 7 天过期，更推荐加作者微信（注明"AI 学习站"），**长期有效**。


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
