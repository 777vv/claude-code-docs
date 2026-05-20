# 💼 产品 / 运营 / PM 的 AI 提效路径

> **核心承诺**：学完每周省 **8-15 小时**——从"被会议邮件淹没"变成"AI 帮你处理 70% 重复事务"。

::: info 本页给你什么
- 产品/运营/PM 最高频的 8 个痛点 + 对应解决方案
- 推荐工具（不用学编程那一类，OpenClaw 是你的主战场）
- 一条按周排的学习路径（不用懂代码）
- 真实案例：早上 8 点收什么、下班前自动出什么
:::

---

## 你日常被哪些事消耗精力？

| 痛点 | 现状 | AI 帮你怎么干 | 直达教程 |
|---|---|---|---|
| **✉️ 邮箱每天几十封看不完** | 一封一封点，看完一上午 | AI 自动分桶（紧急/工作/通知/垃圾），重要的才 ping 你 | [个人办公助理 →](/openclaw/cases/office-helper) |
| **📅 周五才想起写周报** | 翻 GitHub / Notion / 飞书凑数据 | 周五 16:30 自动拉数据生成草稿，你只用改改 | [办公助理周报 →](/openclaw/cases/office-helper) |
| **🎙 会议录音 2 小时整理** | 听一遍写一遍 | 上传录音 → AI 转文字 + 提炼行动项 + 自动 @ 各 owner | [会议纪要自动整理 →](/openclaw/cases/meeting-notes) |
| **❓ 团队总问"流程怎么走"** | 同样问题答 5 遍 | 飞书 @ AI 机器人 → 自动检索公司文档 → 准确回答 | [飞书问答机器人 →](/openclaw/cases/feishu-qa-bot) |
| **🚨 客户反馈散落各处** | 邮件 / 微信 / 工单都没整合 | AI 多源聚合 + 分类 + 优先级排序，每天早上一份 brief | [资讯晨报模式 →](/openclaw/cases/daily-news) |
| **📊 数据分析等开发排期** | 等 1 周才能看到一份报表 | AI 直接查数据库（SQL 它自己写）+ 出图 | [Hermes 数据分析 →](/hermes/cases/knowledge-base) |
| **🗓 跨时区协调会议** | 来回邮件确认 | AI 看大家日历自动选时间 + 发邀请 | [office-helper →](/openclaw/cases/office-helper) |
| **📝 反复改 PRD / 方案文档** | 5 版改下来已经晚上 | AI 帮你改 + 保留你思考路径 | [Claude Code 写文档 →](/claude-code/guide/quickstart) |

---

## 推荐工具组合（按学习顺序）

### 🥇 主力工具：OpenClaw

**学完能干**：邮件 / 日程 / 周报 / 会议 / 团队问答 / 信息聚合——产品运营所有重复事务。

特点：
- ✅ **接飞书 / 钉钉 / 企业微信** — 国内 PM 必选
- ✅ **不用学编程** — 配置都是 yaml 和自然语言
- ✅ **自动化常驻** — 设好后它自己跑

[OpenClaw 完整 40 章 →](/openclaw/)

### 🥈 辅助：Claude Code（轻量学）

不是让你写代码，是让你**用 AI 改文档**：
- PRD / 方案 / 周报草稿
- 复杂数据透视的 SQL（让 AI 写你 review）
- 帮你看明白技术方案文档

只看最基础的：[Claude Code 快速开始 →](/claude-code/guide/quickstart)

### 🥉 可选：Hermes（进阶 / 想用 trajectory 做用户分析）

研究型工具，**不必须学**——你已经有 OpenClaw 基本够了。

---

## 4 周学习路径（每周 1-2 小时，**不用懂代码**）

### Week 1：装好 + 看到第一个 AI 自动化
- [ ] [OpenClaw 是什么](/openclaw/intro/what-is) — 15 分钟搞懂概念
- [ ] [核心概念图解](/openclaw/intro/concepts) — 配几张图
- [ ] [装好 OpenClaw](/openclaw/intro/install) — 跟着做，如果不懂找 IT 同事帮 30 分钟
- [ ] [配第一个 LLM API Key](/openclaw/setup/api-key) — 推荐 DeepSeek（国内、便宜）

**周末成就**：能跟 OpenClaw 在 CLI / WebChat 里对话了。

### Week 2：接飞书 / 钉钉
- [ ] [接入飞书](/openclaw/setup/feishu) 或钉钉 — 完整 30 分钟教程
- [ ] 配第一个 agent 让它在飞书里回你消息
- [ ] 试试让它**只读**收邮件给你总结

**周末成就**：飞书私聊 AI 助理已经可以用了。

### Week 3：实战案例（挑 2 个跟着做）
- [ ] [个人办公助理](/openclaw/cases/office-helper) — **最高 ROI，必做**
- [ ] [会议纪要自动整理](/openclaw/cases/meeting-notes)
- [ ] [飞书问答机器人](/openclaw/cases/feishu-qa-bot) — 团队场景
- [ ] [资讯晨报](/openclaw/cases/daily-news) — 信息聚合

**周末成就**：每天早上 8 点自动收到一份 brief。

### Week 4：优化 + 安全
- [ ] [安全清单（必读）](/openclaw/ops/security-checklist) — 邮件代发 / API Key 安全
- [ ] [国内适配](/openclaw/china/models) — 切便宜的模型省钱
- [ ] 写 2-3 个你专属流程的 skill

**周末成就**：核心工作流已经"半自动" — 你只做关键决策。

---

## 真实场景估算

按 PM / 运营典型一周（30+ 邮件 / 8 次会议 / 1 份周报）：

| 场景 | 周省时间 |
|---|---|
| 邮件 AI 分桶 + 摘要 | 3-5 小时 |
| 会议纪要自动整理（2 场 1 小时会议）| 2-4 小时 |
| 周报自动生成草稿 | 1-2 小时 |
| 团队问答机器人替你回答 | 1-3 小时 |
| 资讯聚合 + 早会 brief | 2-3 小时 |
| **周度总计** | **8-15 小时** |

::: tip 时间花在哪
这些**省下的时间**该用来：
- 跟客户 / 用户深入聊（AI 做不了）
- 看竞品 / 行业趋势（AI 整理初稿，你做判断）
- 写真正有思考的方案（AI 帮你改语言，思考你自己来）
- 早点下班（最重要）
:::

---

## 真实日常示意（接上 OpenClaw 后）

```
06:30  ☕ AI 早班开始
07:00  早班 OpenClaw 自动:
       ✉️ 扫昨晚邮件 → 紧急的标红
       📰 V2EX/行业资讯抓 → AI 摘要
       📅 看今日日程 + 准备会议材料

08:00  🌅 你起床看飞书
       收到一份 brief:
       • 紧急邮件: 3 封 (客户 X / 老板 / 财务)
       • 今日 3 个会议 + 准备材料链接
       • 行业关键事件 5 条

09:00  📞 进入"真正需要你判断"的工作
       ......

15:00  会议结束
       上传录音 → 5 分钟出纪要 + 行动项 @ 各 owner

17:00  AI 自动整理今日完成事项
       周五还会自动出周报草稿

19:00  下班
       明早 AI 又会准备好一切

🎯 你的真实工作时间: 8h → 5h (做更有价值的事)
🎯 加班时间: 2h → 0h
```

---

## 国内合规 / 安全

### 必读
- [国内 channel 接入](/openclaw/china/channels) — 飞书 / 钉钉 / 企业微信
- [安全清单](/openclaw/ops/security-checklist) — 特别是邮件代发风险

### 公司数据安全
::: warning 重要
处理公司数据前**必和 IT / 安全团队沟通**：
- LLM 调用是否合规（用国产 LLM 通常合规）
- 客户数据 / 敏感邮件是否能进 AI prompt
- API Key 怎么存（不要进 git）

推荐：先用**个人 OpenClaw + 自己邮箱**练手，再考虑接公司数据。
:::

### 💰 月度成本（个人版）
- DeepSeek API：¥10-30/月
- 飞书企业版个人 plan：免费
- 服务器（如果要 7×24 跑）：¥30-50/月
- **总：¥50-100/月** vs 雇兼职 ¥3000+/月

---

## 常见疑问

**Q：我完全不会编程，能学吗？**
A：能。OpenClaw 配置都是 yaml + 自然语言对话，唯一稍 tricky 的是装 Node.js（30 分钟教程或求 IT 同事帮一下）。

**Q：会泄露公司数据吗？**
A：取决于配置——本站 [15 章安全清单](/openclaw/ops/security-checklist) 详讲。**敏感数据用 Ollama 本地模型**不出网，完全安全。

**Q：邮件代发会不会出错？**
A：[OpenClaw 默认重要操作必须二次确认](/openclaw/ops/security-checklist#_15-3-🔴-prompt-注入防御)——发邮件前会先给你看草稿。**永远开 confirm**。

**Q：我们公司用钉钉不用飞书，能用吗？**
A：能。OpenClaw 钉钉 / 企业微信支持都很完整，配置教程在 [23 章 国内 channel](/openclaw/china/channels)。

**Q：会议录音准确吗？**
A：用国内服务（阿里 ASR / 讯飞）准确率 95%+，普通话开会完全可用。详见 [30 章会议纪要](/openclaw/cases/meeting-notes)。

---

## 下一步去哪？

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:24px">

<a href="/openclaw/intro/what-is" style="display:block;padding:20px;border:1px solid var(--vp-c-divider);border-radius:12px;text-decoration:none;background:var(--vp-c-bg-elv);transition:border-color .2s" onmouseover="this.style.borderColor='var(--vp-c-brand-1)'" onmouseout="this.style.borderColor='var(--vp-c-divider)'">
  <div style="font-weight:600;color:var(--vp-c-text-1);margin-bottom:6px">🦞 OpenClaw 入门 →</div>
  <div style="font-size:13px;color:var(--vp-c-text-2)">主力工具 · 40 章节</div>
</a>

<a href="/openclaw/cases/office-helper" style="display:block;padding:20px;border:1px solid var(--vp-c-divider);border-radius:12px;text-decoration:none;background:var(--vp-c-bg-elv);transition:border-color .2s" onmouseover="this.style.borderColor='var(--vp-c-brand-1)'" onmouseout="this.style.borderColor='var(--vp-c-divider)'">
  <div style="font-weight:600;color:var(--vp-c-text-1);margin-bottom:6px">✉️ 办公助理实战 →</div>
  <div style="font-size:13px;color:var(--vp-c-text-2)">最高 ROI 案例，先看这个</div>
</a>

<a href="/openclaw/intro/what-is" style="display:block;padding:20px;border:1px solid var(--vp-c-divider);border-radius:12px;text-decoration:none;background:var(--vp-c-bg-elv);transition:border-color .2s" onmouseover="this.style.borderColor='var(--vp-c-brand-1)'" onmouseout="this.style.borderColor='var(--vp-c-divider)'">
  <div style="font-weight:600;color:var(--vp-c-text-1);margin-bottom:6px">🌱 我需要恶补基础 →</div>
  <div style="font-size:13px;color:var(--vp-c-text-2)">入门 6 件套，20 分钟</div>
</a>

<a href="/community" style="display:block;padding:20px;border:1px solid var(--vp-c-divider);border-radius:12px;text-decoration:none;background:var(--vp-c-bg-elv);transition:border-color .2s" onmouseover="this.style.borderColor='var(--vp-c-brand-1)'" onmouseout="this.style.borderColor='var(--vp-c-divider)'">
  <div style="font-weight:600;color:var(--vp-c-text-1);margin-bottom:6px">💬 进群提问 →</div>
  <div style="font-size:13px;color:var(--vp-c-text-2)">作者微信 / 群二维码</div>
</a>

</div>

---

## 切换到其他角色

- [💻 工程师 / 程序员 →](/for/engineer)
- [📚 创作者 / 研究员 →](/for/creator)
- [🏠 普通人 / 学生 →](/for/general)
