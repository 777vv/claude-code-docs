# 常见问题

常见问题按场景分类，快速找到你的答案。

---

## 安装问题

### Q：安装 `@openai/codex` 报权限错误

**macOS/Linux：**
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
npm install -g @openai/codex
```

**或者使用 sudo（不推荐）：**
```bash
sudo npm install -g @openai/codex
```

### Q：安装成功但 `codex` 命令找不到

检查 npm 全局 bin 目录是否在 PATH 中：
```bash
npm bin -g       # 查看全局 bin 目录
echo $PATH       # 查看当前 PATH
```

### Q：Windows 上安装失败

推荐使用 WSL2 环境，详见 [Windows + WSL2 完整配置](/codex/advanced/windows-setup)。

---

## 认证问题

### Q：报错 `401 Unauthorized`

- 检查 API Key 是否正确（有无多余空格）
- 检查 API Key 是否已过期或被撤销
- 重新生成 API Key 后再试

### Q：报错 `429 Too Many Requests`

超出频率限制，等待几秒后重试。如果频繁出现，考虑：
- 充值升级到付费层（限制更高）
- 切换到不同的模型提供商

### Q：国内无法访问 `api.openai.com`

使用国内模型替代：
- [DeepSeek 接入教程](/codex/china-models/deepseek)（推荐）
- [通义千问 接入教程](/codex/china-models/qwen)
- [Ollama 本地方案](/codex/china-models/ollama-local)（完全离线）

---

## 使用问题

### Q：Codex 修改了不该改的文件怎么办

```bash
# 查看改了什么
git diff HEAD~1

# 撤销最近一次操作
git revert HEAD

# 撤销最近 N 次操作
git reset --hard HEAD~N
```

### Q：Codex 不理解我的指令

尝试以下方法：
1. **提供更多上下文**：说明你的技术栈、框架版本
2. **分解任务**：把复杂任务拆成多个小步骤
3. **创建 AGENTS.md**：让 Codex 了解你的项目规范

### Q：Codex 每次操作都要确认，太烦了

切换到更宽松的权限模式，或在配置文件中设置默认模式：
```toml
[agent]
approval_mode = "auto"
```

### Q：如何让 Codex 只读，不修改文件

启动时使用只读模式：
```bash
codex --approval-mode read-only
```

---

## 模型问题

### Q：如何知道现在使用的是哪个模型

在 Codex 对话中询问：
```
你是哪个模型？版本是多少？
```

### Q：国内模型效果差很多吗

DeepSeek V3 在代码任务上与 GPT-4o 相近，日常使用体验差距不明显。对于要求最高的场景（如复杂架构设计），OpenAI 旗舰模型可能略好。

### Q：可以同时配置多个模型并快速切换吗

可以，参考 [自定义模型接入](/codex/models/custom-providers)，配置多个提供商后用 `--provider` 参数切换。

---

## 国内模型问题

### Q：DeepSeek 免费额度用完了怎么办

前往 [platform.deepseek.com](https://platform.deepseek.com) 充值（最低 10 元），价格非常便宜，10 元通常可以用很久。

### Q：Ollama 运行很慢

- 使用更小的量化版本（如 `qwen2.5-coder:7b-q4_0`）
- 如果有独立显卡，安装 CUDA 后 Ollama 会自动使用 GPU（速度提升 10 倍以上）
- 普通 CPU 跑 7B 模型每秒约 10-20 tokens，相对较慢但可用

### Q：Ollama 报 `Connection refused`

Ollama 服务未启动，执行：
```bash
ollama serve
```

---

## 其他问题

### Q：Codex 和 Claude Code 有什么区别

| 项目 | Codex CLI | Claude Code |
|------|-----------|-------------|
| 出品方 | OpenAI | Anthropic |
| 底层模型 | GPT 系列 / 可自定义 | Claude 系列 / 可自定义 |
| 开源 | ✅ 完全开源 | ✅ 完全开源 |
| 国内模型支持 | ✅ 支持 | ✅ 支持 |

两者定位相似，可以根据个人喜好选择。

### Q：在哪里提交 Bug 或建议

- Codex 官方 GitHub：[github.com/openai/codex/issues](https://github.com/openai/codex/issues)
- 本文档问题：[提交 Issue](https://github.com/openai/codex/issues/new)
