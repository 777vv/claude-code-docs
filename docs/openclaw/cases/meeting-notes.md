# 30. 案例 6：会议纪要自动整理

::: info 这个案例你将搭出什么
- 飞书会议 / Zoom 录音上传 OpenClaw
- 自动转文字（Whisper API / 国内方案）
- AI 提炼：核心议题 / 关键决策 / 行动项（谁做、deadline）
- 按发言人切分（diarization）
- 自动按"参会人 → 分发个性化 todo"
- 飞书文档归档 + 群里同步

预计搭建：60-90 分钟。
:::

## 30.1 用到的能力

- 音频转文字（whisper-api / aliyun-asr / openai-whisper 本地）
- 长文档摘要
- 自定义"会议解析" prompt
- 多人 todo 拆分 + 推送

## 30.2 装 skill

```bash
openclaw skill install whisper-api          # 调 OpenAI Whisper（或本地 whisper.cpp）
openclaw skill install file-upload          # 接 IM 上传文件
openclaw skill install feishu-docs          # 写飞书云文档
```

如果国内不方便用 OpenAI：用阿里云语音识别 (asr) skill，效果接近。

## 30.3 创建 meeting-secretary agent

`agent.yaml`:
```yaml
id: meeting-secretary
name: 会议秘书
model:
  provider: deepseek
  model: deepseek-chat
soul: ./soul.md
skills:
  - whisper-api
  - file-upload
  - feishu-docs
channels:
  - feishu
```

`soul.md`:
```markdown
# 你是谁
会议秘书。专门整理会议纪要。

# 触发
主人在飞书发送音频文件 + 说"整理一下" → 开始工作

# 工作流
1. 收到音频 → 调 whisper-api 转文字（带说话人切分）
2. 解析全文，提炼:
   - 核心议题（3-5 个）
   - 关键决策（谁拍板的什么）
   - 行动项（谁 + 做什么 + 截止）
   - 风险 / 争议（如果有）
3. 生成 Markdown 纪要
4. 写到飞书云文档（指定空间）
5. 拆分行动项，逐个推给负责人

# 输出规范
- 纪要顶部: 时间 / 时长 / 参会人 / 摘要 1 段
- 议题按重要性排
- 行动项格式: @负责人 - 做什么 - YYYY-MM-DD 前

# 边界
- 不评论参会人态度
- 不揣测未说出的意图
- 隐私敏感发言（薪资、人事）摘要中标 "[已脱敏]"
- 转录有不确定的地方标 "[听不清]"
```

## 30.4 完整工作流

### 主流程：用户上传录音

不需要 workflow yaml，由 agent 自然处理。流程：

```
张三在飞书发送 meeting_2026-05-19.mp3 + "整理一下今天上午的产品评审"
   ↓
meeting-secretary 收到文件 + 命令
   ↓
1. 提示: "收到，正在转文字..." (~30 秒预估)
   ↓
2. 调 whisper-api.transcribe(file)
   返回 { text, speakers, segments }
   ↓
3. LLM 解析全文，生成结构化纪要
   ↓
4. 调 feishu-docs.create(纪要 markdown, 空间="会议归档")
   返回文档 url
   ↓
5. 群里回复:
   ✅ 纪要已生成
   📄 飞书文档: ...
   🎯 行动项 (5 项):
      - @李四 完成 PRD 修订 - 2026-05-22
      - @王五 准备 demo 视频 - 2026-05-23
      - ...
   ↓
6. 私聊推送行动项给每个 owner:
   私聊李四: "5/19 评审会上你认领的:
              - 完成 PRD 修订 - 2026-05-22
              💡 详情见 [纪要链接]"
```

## 30.5 实际效果示例

会议录音 60 分钟，30 秒后用户收到：

```
✅ 会议纪要已生成

📄 文档: https://feishu.cn/docs/abc123

📋 摘要
2026-05-19 10:00-11:00, 产品评审 (5 人)
讨论 v3.2 新增 3 个功能模块，决策上线 2 个推迟 1 个。
确认了 demo 时间和分工。

🎯 核心议题
1. 自定义模板功能 → 通过，5/30 上线
2. 数据导出功能 → 通过，5/30 上线
3. AI 推荐功能 → 推迟到 v3.3（资源不足）

⚖️ 关键决策
- @张总 拍板: AI 推荐推迟，先做模板和导出
- @李四 决定: 模板功能改用 ABC 方案

🎯 行动项
@李四 完成 PRD 修订 - 2026-05-22
@王五 准备 demo 视频 - 2026-05-23
@赵六 设计稿 review - 2026-05-24
@张总 跟客户确认 - 2026-05-25
@周一 编写测试用例 - 2026-05-27

⚠️ 风险
- 自定义模板涉及多租户隔离，开发风险高
- 客户对推迟 AI 推荐有疑虑，需要张总沟通

私聊已推送给每个 owner ✉️
```

## 30.6 配置音频提供商

### 用 OpenAI Whisper（需 OpenAI key）

```bash
# .env
OPENAI_API_KEY=sk-...

# 配 whisper-api skill
```

### 用阿里云语音（国内推荐）

```bash
# .env
ALIYUN_NLS_AKID=xxx
ALIYUN_NLS_AKSECRET=xxx
ALIYUN_NLS_APPKEY=xxx
```

```bash
openclaw skill install aliyun-asr
```

价格：约 ¥2/小时音频，比 Whisper 便宜。

### 用本地 whisper.cpp（免费 + 隐私）

```bash
brew install whisper-cpp           # macOS
# 下模型
whisper-cpp -m large-v3 input.mp3
```

skill `whisper-local` 调用本地命令。性能取决于电脑。

## 30.7 切分说话人（diarization）

Whisper 默认不区分发言人。补一个 diarization 模块：

- 国外: pyannote.audio（本地跑，开源）
- 国内: 阿里云 / 讯飞 自带说话人分离

`whisper-api` 配置：
```yaml
whisper:
  diarization: true
  max_speakers: 8
```

输出会带：
```
[10:00:12] 张总: 我觉得这个模板功能必须上...
[10:00:25] 李四: 但客户那边可能不接受...
```

提炼时能正确归因到人。

## 30.8 隐私 / 敏感处理

会议常涉及私密信息。soul 加：

```markdown
# 隐私处理
检测到以下内容，纪要中替换为 [已脱敏]:
- 薪资数字 / 个人收入
- 客户机密报价
- 员工绩效评估细节
- 人事讨论（裁员、调岗）

如果整场会议都是高敏感（如绩效评审），询问主人:
"这是涉密会议，需要我:
  A. 完整纪要发个人邮箱（不进飞书）
  B. 只生成行动项不留原文
  C. 取消"
```

## 30.9 自动归档与检索

纪要存到飞书云文档"会议归档"空间，按月分文件夹。

进阶：构建会议向量库，未来可以问：
```
"上次 v3 评审会上 AI 推荐功能为啥推迟了？"
→ qa-bot agent 检索旧纪要 → 给答案
```

形成"组织记忆"。

## 30.10 成本

按月 8 场 1 小时会议：
- 转录: ¥16（阿里云）/ ¥30+（OpenAI）/ 0（本地）
- LLM 摘要: ¥10-20
- 总计: ¥20-50/月

替代专职会议秘书价值巨大。

## 30.11 限制 / 注意事项

- 转录准确率：嘈杂环境 / 方言 / 专业术语会下降
- 长音频（>1h）：分段转录拼接
- 不要直接采购转录服务给客户用（涉及多方录音同意权）
- 重要会议**仍建议人工 review 纪要**

---

## 看完这个案例你应该会

✅ 接音频文件输入 + 转文字
✅ 长文摘要拆分行动项
✅ 飞书文档归档 + 私聊分发
✅ 说话人切分（diarization）
✅ 敏感会议安全处理

---

**下一步**：[31. 案例 7：项目 24h 守夜人 →](/openclaw/cases/project-watchdog)

下一个：GitHub CI / PR / Sentry 24h 监控，分级告警推 IM。
