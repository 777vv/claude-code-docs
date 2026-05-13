---
layout: home

hero:
  name: "Claude Code"
  text: "中文学习站"
  tagline: 从零开始掌握 Anthropic 官方 AI 编码助手 · 27 章节 · 新手友好 · 持续更新
  actions:
    - theme: brand
      text: 快速开始 →
      link: /guide/quickstart
    - theme: alt
      text: 从头学起
      link: /guide/intro

features:
  - icon: 🤖
    title: 代理式编码
    details: 不只是聊天——Claude Code 能自主探索代码库、修改多个文件、执行命令、规划并验证，像一个真正的高级同事。
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
    details: /batch 并行处理大量文件，Git Worktree 多任务并行，GitHub Actions 集成，定时任务托管。
  - icon: 📖
    title: 新手友好
    details: 每章都有「本章你将学到」概览，命令均附中文注释，3 个完整实战案例，从安装到高级用法全覆盖。
---

<div style="max-width:900px;margin:48px auto 0;padding:0 24px">

## 我是新手，从哪里开始？

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:20px">

<a href="/guide/intro" style="display:block;padding:20px;border:1px solid var(--vp-c-divider);border-radius:12px;text-decoration:none;transition:border-color .2s,transform .2s" onmouseover="this.style.borderColor='var(--vp-c-brand-1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--vp-c-divider)';this.style.transform=''">
  <div style="font-size:1.5rem;margin-bottom:8px">🚀</div>
  <div style="font-weight:600;color:var(--vp-c-text-1);margin-bottom:4px">完全新手</div>
  <div style="font-size:14px;color:var(--vp-c-text-2)">先读「简介」了解 Claude Code 是什么，再按顺序读入门5章，约 30 分钟上手。</div>
</a>

<a href="/guide/quickstart" style="display:block;padding:20px;border:1px solid var(--vp-c-divider);border-radius:12px;text-decoration:none;transition:border-color .2s,transform .2s" onmouseover="this.style.borderColor='var(--vp-c-brand-1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--vp-c-divider)';this.style.transform=''">
  <div style="font-size:1.5rem;margin-bottom:8px">⚡</div>
  <div style="font-weight:600;color:var(--vp-c-text-1);margin-bottom:4px">已安装，想速成</div>
  <div style="font-size:14px;color:var(--vp-c-text-2)">直接跳到「快速开始」，5 分钟内完成第一次体验，再按需查阅其他章节。</div>
</a>

<a href="/china/models" style="display:block;padding:20px;border:1px solid var(--vp-c-divider);border-radius:12px;text-decoration:none;transition:border-color .2s,transform .2s" onmouseover="this.style.borderColor='var(--vp-c-brand-1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--vp-c-divider)';this.style.transform=''">
  <div style="font-size:1.5rem;margin-bottom:8px">🌏</div>
  <div style="font-weight:600;color:var(--vp-c-text-1);margin-bottom:4px">国内用户</div>
  <div style="font-size:14px;color:var(--vp-c-text-2)">先看「国内模型接入」，用硅基流动等服务商配置好环境，再继续学习。</div>
</a>

<a href="/advanced/memory" style="display:block;padding:20px;border:1px solid var(--vp-c-divider);border-radius:12px;text-decoration:none;transition:border-color .2s,transform .2s" onmouseover="this.style.borderColor='var(--vp-c-brand-1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--vp-c-divider)';this.style.transform=''">
  <div style="font-size:1.5rem;margin-bottom:8px">🧠</div>
  <div style="font-weight:600;color:var(--vp-c-text-1);margin-bottom:4px">已在用，想提升</div>
  <div style="font-size:14px;color:var(--vp-c-text-2)">进阶章节：CLAUDE.md 记忆系统、计划模式、Hooks、MCP，解锁 Claude Code 全部潜力。</div>
</a>

</div>

## 内容速览

| 章节 | 涵盖内容 |
|------|---------|
| **入门**（1-5）| 简介、系统要求、安装（5种方式）、登录认证、5分钟快速上手 |
| **基础**（6-9）| 三种运行模式、管道输入、50+ 斜杠命令速查、键盘快捷键 |
| **进阶**（10-18）| CLAUDE.md 记忆、权限模式、计划模式、Skills、子代理、Hooks、MCP、配置文件、插件 |
| **国内适配**（19-20）| 硅基流动/通义/智谱/OpenRouter 接入、代理配置 |
| **集成与自动化** | GitHub Actions、Agents SDK 开发 |
| **实战案例** | 全栈项目搭建、遗留代码重构、复杂 Bug 调试 |
| **技巧与参考**（21-27）| 最佳实践、常见工作流、并行自动化、IDE 集成、故障排除、术语表 |

</div>
