# 33. 案例 9：自媒体一稿多发

::: info 这个案例你将搭出什么
你写一遍原稿 → OpenClaw 自动：
- 改写成公众号风格（长文 + 重点加粗）
- 改写成小红书风格（开头钩子 + emoji + 短句）
- 改写成知乎风格（论证 + 数据 + 长尾关键词）
- 调浏览器自动化登录各平台发布
- 收集数据：哪个标题最吸引人

预计搭建：90 分钟。
:::

::: warning 平台条款
各平台对"程序化批量发布"有限制。本案例**适合个人内容创作者节省时间**（写一遍，懒得手动复制）。**不要做批量营销号 / SEO 黑产**。
:::

## 33.1 用到的能力

- LLM 风格转换 (核心)
- playwright 浏览器自动化
- 多平台账号管理
- 失败重试 / 截图归档

## 33.2 装 skill

```bash
openclaw skill install playwright           # 浏览器自动化
openclaw skill install image-process        # 处理配图
openclaw skill install style-rewriter       # 社区现成的风格改写 skill
```

## 33.3 创建 content-distributor agent

`agent.yaml`:
```yaml
id: content-distributor
name: 内容分发助理
model:
  provider: deepseek
  model: deepseek-chat
soul: ./soul.md
skills:
  - core/memory
  - style-rewriter
  - playwright
  - image-process
channels:
  - feishu
behavior:
  auto_confirm_threshold: high     # 发布前必看
```

`soul.md`:
```markdown
# 你是谁
内容分发助理。把主人的一篇原稿改写成多平台风格 + 自动发布。

# 工作流
1. 收原稿 (markdown 文件 / 飞书文档链接)
2. 提取核心信息
3. 按 3 个平台风格改写:
   - 公众号 (长文 + 排版)
   - 小红书 (短 + 钩子 + emoji)
   - 知乎 (论证 + 数据)
4. 给主人 review，确认后发布
5. 24 小时后回收数据 (阅读/点赞/评论)

# 风格规范

## 公众号
- 标题: 8-15 字，悬念或反差
- 字数: 1000-2500
- 结构: 引子 - 1 - 2 - 3 - 结论
- 排版: 加粗 / 引号 / 短段落
- 配图: 文中 2-3 张

## 小红书
- 标题: 14 字内，emoji + 钩子
- 字数: 200-500
- 结构: 钩子 - 痛点 - 解决 - 总结
- 大量 emoji 和换行
- 文末 # 标签 5-10 个

## 知乎
- 标题: 问题式 / 干货式
- 字数: 1500-4000
- 结构: 现象 - 分析 - 论证 - 案例 - 结论
- 多 markdown 标题
- 列出数据 / 引用

# 边界
- 不偏离原稿核心观点
- 不编造数据
- 发布前 100% 等用户确认
- 公司机密 / 敏感话题拒绝处理
```

## 33.4 风格改写示范

输入原稿：
```markdown
# 我用 OpenClaw 自动化办公一个月的体验

最近用 OpenClaw 把日常重复工作交给了 AI...
... (原稿 800 字)
```

agent 改写后：

### 公众号版（1800 字）
```
🔥 我让 AI 接管了我的工作流，一个月后我后悔了……

是的你没看错，"后悔" — 但不是负面的那种。

一个月前我还是一个邮件焦虑症患者......

(精修排版，重点加粗，引号金句)

## 一、为什么开始

我的痛点很普通...

## 二、OpenClaw 是什么

...
```

### 小红书版（350 字）
```
🤖 用 AI 接管工作流，每天多出 2h 摸鱼时间 ✨

姐妹们我真的发现宝藏了！

之前每天早上要花 1h 看邮件 + 整理日程
现在直接打开飞书 → 看 AI 给我准备的早报 ☕

❓ 怎么做到的
是一个叫 OpenClaw 的开源工具
不是订阅制，自己跑在家里电脑上

📌 我的常用功能：
1. 每天 8 点自动早报
2. 邮件 AI 分类
3. 周五自动写周报

最大感受: 真的从"被工作追着跑"变成"工作来等我处理"

# AI工具 # 效率神器 # 远程办公 # OpenClaw # 数字游民
```

### 知乎版（2800 字）
```
为什么说 OpenClaw 会改变白领工作方式？我用了一个月。

## 一、问题：白领每天浪费多少时间在重复劳动

根据 McKinsey 2023 报告，知识工作者...

## 二、传统自动化为何失败

Zapier、IFTTT 已经存在十多年...

## 三、OpenClaw 的本质突破

OpenClaw 不是"另一个自动化工具"...

(完整论证 + 数据 + 个人体验 + 4 个案例)

## 总结

...
```

## 33.5 发布流程

agent 改完三版 → 群里发：
```
✅ 改写完成

📄 公众号: 1820 字 [完整预览]
📄 小红书: 348 字 [完整预览]
📄 知乎: 2840 字 [完整预览]

要发布到哪几个平台?
- 全部
- 仅公众号
- 仅小红书
- 仅知乎
- 取消
```

你回："全部"

```
开始发布 (用浏览器自动化):

📡 公众号 (mp.weixin.qq.com)
  - 登录账号 [已用 cookies, 无需扫码]
  - 进入素材库
  - 创建图文消息
  - 粘贴标题 / 正文
  - 添加封面图 [用原稿自带的]
  - 设为 "保存"  状态（不直接群发，等你最后确认）
  ✅ 完成: https://mp.weixin.qq.com/...

📡 小红书 (creator.xiaohongshu.com)
  ⚠️ 需要手动扫码 (cookies 已过期)
  请打开飞书查看 [二维码]
  ...
  ✅ 完成

📡 知乎 (zhuanlan.zhihu.com)
  - ...
  ✅ 完成: https://zhuanlan.zhihu.com/p/...

总结:
✅ 3 个平台全部发布成功
预计审核时间: 公众号 30 分钟 / 小红书即时 / 知乎即时

24h 后我会汇报数据。
```

## 33.6 浏览器自动化的实现

OpenClaw 用 playwright skill 控制浏览器：

```javascript
// skill 里
import { chromium } from 'playwright';

export async function publish_xiaohongshu({ title, content, images }) {
  const browser = await chromium.launch({ headless: false });   // 调试时 headed
  const ctx = await browser.newContext({
    storageState: '~/.openclaw/cookies/xiaohongshu.json',       // 复用登录态
  });
  const page = await ctx.newPage();

  await page.goto('https://creator.xiaohongshu.com/publish/publish');

  // 等扫码登录（首次）或自动恢复
  if (await page.locator('.qrcode').isVisible({ timeout: 2000 }).catch(()=>false)) {
    // 截图二维码发飞书让用户扫
    const buf = await page.locator('.qrcode').screenshot();
    await ctx.notifyFeishu({ image: buf, message: '请扫码登录小红书' });
    await page.waitForURL('**/publish**', { timeout: 120000 });
    await ctx.storageState({ path: '~/.openclaw/cookies/xiaohongshu.json' });
  }

  // 填内容
  await page.fill('[placeholder*="标题"]', title);
  await page.fill('[placeholder*="正文"]', content);

  for (const img of images) {
    await page.setInputFiles('input[type=file]', img);
  }

  await page.click('button:has-text("发布")');
  await page.waitForSelector('text=发布成功');

  await browser.close();
  return { ok: true };
}
```

## 33.7 数据回收

第二天 workflow:
```yaml
trigger:
  cron: "0 18 * * *"      # 每天 18 点
steps:
  - id: collect
    agent: content-distributor
    task: |
      去三个平台后台抓昨天发布的稿子数据:
      - 公众号: 阅读量 / 在看
      - 小红书: 阅读 / 点赞 / 收藏 / 评论
      - 知乎: 阅读 / 赞同 / 评论 / 收藏
  - id: report
    channel: feishu
    target: ${MY_OPEN_ID}
    message: ${collect}
```

收到：
```
📊 昨日内容数据 (2026-05-19)

主题: "我用 OpenClaw 自动化办公一个月"

📡 公众号: 阅读 2,847 / 在看 89 / 转发 23
📡 小红书: 阅读 12,340 / 点赞 458 / 收藏 234 / 评论 87
📡 知乎: 阅读 1,820 / 赞同 156 / 评论 34 / 收藏 89

📈 表现最好: 小红书 (点赞率 3.7%)
💡 建议: 下次写"AI 工具"相关多投小红书
```

## 33.8 风险 / 注意

### 平台风控
- 浏览器自动化被检测会限流甚至封号
- **不要每天发多篇**（个人创作者一周 2-3 篇正常）
- **不要重复内容批量铺**（明显的营销号特征）

### 账号安全
- cookies 文件加密存
- 不要在多人共用机器上跑
- 二次密码 / 二步验证不能完全绕过

### 合规
- 不发涉政 / 涉黄 / 医疗诊疗类
- 商业广告标"广告"
- 二创内容标来源

## 33.9 进阶玩法

### 选题助手
让 agent 每天扫热点：
```
"今天 xhs 热门词" → "可以写这 3 个话题"
```

### A/B 测试标题
```
让 LLM 生成 5 个标题候选 → 选 2 个 → 各发 50% 流量 → 看哪个 CTR 高
```

### 多账号矩阵
```
3 个小红书账号 (不同人设) → 内容微调风格 → 错峰发布
```

## 33.10 成本

按每月 10 篇原稿 × 3 平台：
- 风格改写: 10 × 3 × ¥0.10 = ¥3
- 浏览器自动化: 0 (本地跑)
- 数据收集: ¥0.5/天 × 30 = ¥15
- 月度: ¥20-30

替代手动复制粘贴节省的时间，价值 N 倍。

---

## 看完这个案例你应该会

✅ LLM 风格改写
✅ 浏览器自动化发布（playwright）
✅ Cookie / 登录态管理
✅ 数据回收 + 复盘
✅ 多平台账号矩阵（高阶）

---

**下一步**：[34. 案例 10：家庭管家 →](/openclaw/cases/family-manager)

最后一个案例：让 AI 帮你管家庭购物清单、家务、提醒。
