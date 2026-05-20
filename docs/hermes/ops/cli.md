# 12. CLI 命令手册

::: info 本章你将学到
- Hermes 全部核心命令一览
- 按"对话 / 配置 / 平台 / 工具 / 数据 / 维护"分组
- 每个命令的常用参数 + 真实例子
- 速查表（Ctrl+F 搜命令名）
:::

::: tip 当工具书用
**不需要从头读**。需要时 Ctrl+F 搜 `gateway` / `setup` / `doctor` 等关键词。
:::

## 12.1 总览

```
hermes
├── --version          看版本
├── --help             帮助
├── (无参数)            进交互式 CLI
├── "提示词"            单次对话
├── setup              首次配置向导
├── doctor             环境体检
├── update             升级到最新
├── model              管理 LLM 提供商
├── tools              管理工具集
├── platform           管理消息平台
│   ├── add
│   ├── list
│   ├── remove
│   └── config
├── gateway            后台进程管理
│   ├── start
│   ├── stop
│   ├── restart
│   ├── status
│   └── --daemon
├── message            主动发消息
│   └── send
├── memory             记忆管理
│   ├── list
│   ├── search
│   └── clear
├── skills             skill 管理
│   ├── list
│   ├── view
│   └── publish
├── stats              统计
├── export             导出 trajectory
├── claw migrate       从 OpenClaw 迁移
├── config             配置管理
└── uninstall          卸载
```

## 12.2 对话相关（最常用）

### 单次对话

```bash
hermes "总结这个 PDF"        # 单次问答
hermes -m "..."             # 简写
```

### 进入交互式 CLI

```bash
hermes                       # 进入对话界面
```

界面里：
- 输入消息 + 回车
- `/` 触发斜杠命令菜单
- `Ctrl+D` / `/exit` 退出

### 指定 model

```bash
hermes --model anthropic/claude-sonnet-4-6 "..."
hermes --model kimi/moonshot-v1-128k "..."
```

### 指定 backend

```bash
hermes --backend docker "..."
hermes --backend modal "..."
```

### 指定 agent

```bash
hermes --agent research "调研 X"
hermes --agent codegen "写一个 Python 脚本"
```

## 12.3 配置相关

### 初始向导

```bash
hermes setup           # 完整向导（9 章详解）
hermes setup --reset   # 完全重置（备份后）
```

### 配置查看 / 修改

```bash
hermes config show              # 看当前所有配置
hermes config get backend       # 查单值
hermes config set backend docker # 改单值
hermes config edit              # 打开编辑器改 yaml
```

### 模型管理

```bash
hermes model                    # 交互菜单
hermes model list               # 列出已配 model
hermes model test deepseek      # 测连通
hermes model set deepseek/deepseek-chat   # 改默认
```

### 工具集管理

```bash
hermes tools           # 交互式开关 toolset
hermes tools list      # 看所有可用
hermes tools enable code
hermes tools disable browser
```

## 12.4 平台 (Channel) 管理

### 添加平台

```bash
hermes platform add telegram
hermes platform add discord
hermes platform add slack
hermes platform add email
```

### 看已配

```bash
hermes platform list
```

### 改 / 删

```bash
hermes platform config telegram   # 修改
hermes platform remove discord    # 删除
```

## 12.5 Gateway 管理

```bash
hermes gateway              # 前台启动（看实时输出）
hermes gateway --daemon     # 注册系统服务，开机自启
hermes gateway start        # 启动已注册的 daemon
hermes gateway stop         # 停止
hermes gateway restart      # 重启
hermes gateway status       # 看状态
hermes gateway --verbose    # 详细日志
hermes gateway logs         # 看 daemon 日志
```

## 12.6 主动发消息

```bash
hermes message send \
  --platform telegram \
  --to 123456789 \
  --text "下午 4 点开会提醒"
```

可放 crontab 实现定时推送。

## 12.7 Memory & Skills 管理

### Memory

```bash
hermes memory list                       # 看所有记忆
hermes memory search "用户偏好"            # 搜
hermes memory add "用户对花生过敏"          # 手动加
hermes memory clear --confirm            # 清空（危险）
```

### Skills

```bash
hermes skills list                       # 看 ~/.hermes/skills/
hermes skills view summarize-paper       # 看某 skill 详情
hermes skills create my-skill            # 模板生成
hermes skills publish my-skill           # 发布到 agentskills.io
hermes skills install <agentskills-url>  # 装别人写的
```

## 12.8 数据 & 统计

### 用量统计

```bash
hermes stats                             # 今天
hermes stats --period 7d
hermes stats --period 30d --by-model
hermes stats --period 30d --by-agent
```

### 导出 Trajectory（训练数据）

```bash
hermes export trajectory \
  --since 2026-04-01 \
  --format jsonl \
  --output trajectories.jsonl
```

详见 [31 章训练数据生成](/hermes/cases/trajectory-data)。

### 导出对话

```bash
hermes export conversations --output history.json
```

## 12.9 OpenClaw 迁移（独家）

```bash
hermes claw migrate                  # 交互式向导
hermes claw migrate --src ~/.openclaw --dry-run    # 预览不执行
hermes claw migrate --include skills,memory
```

详见 [34 章 从 OpenClaw 迁移](/hermes/cases/migrate-from-openclaw)。

## 12.10 维护

```bash
hermes update              # 升级到最新版
hermes update --rollback   # 回滚上一版

hermes doctor              # 环境体检
hermes doctor --fix        # 尝试自动修复常见问题

hermes uninstall           # 卸载
hermes uninstall --keep-data    # 卸载但保留 workspace
```

## 12.11 全局参数

每个命令都支持：

| 参数 | 作用 |
|---|---|
| `-h, --help` | 看具体帮助 |
| `--debug` | DEBUG 级日志 |
| `--quiet` | 只输出错误 |
| `--json` | JSON 输出（脚本用） |
| `--workspace <path>` | 用指定 workspace（默认 `~/.hermes`） |
| `--no-color` | 关彩色输出 |
| `--profile <name>` | 用某个 profile（[8 章](/hermes/setup/model-provider) 多场景） |

## 12.12 速查表

| 我想做 | 命令 |
|---|---|
| 第一次装完 | `hermes setup --install-daemon` |
| 改了 yaml 怎么生效 | `hermes gateway restart` |
| 体检 | `hermes doctor` |
| 跑一次对话 | `hermes "..."` |
| 后台常驻 | `hermes gateway --daemon` |
| 看实时日志 | `hermes gateway --verbose` |
| 看花了多少钱 | `hermes stats --period 7d` |
| 切默认 model | `hermes model set <provider>/<model>` |
| 加新 IM | `hermes platform add <name>` |
| 备份 | `tar -czf bak.tar.gz ~/.hermes` |
| 从 OpenClaw 来 | `hermes claw migrate` |
| 升级 | `hermes update` |
| 完全卸载 | `hermes uninstall` |

## 12.13 Bash 补全

让 hermes 命令支持 Tab 补全：

```bash
# bash
hermes completions bash > ~/.hermes-completions.bash
echo 'source ~/.hermes-completions.bash' >> ~/.bashrc

# zsh
hermes completions zsh > ~/.hermes-completions.zsh
echo 'source ~/.hermes-completions.zsh' >> ~/.zshrc

# fish
hermes completions fish > ~/.config/fish/completions/hermes.fish
```

之后 `hermes <Tab>` 自动补全所有子命令。

---

## 看完这一章你应该知道

✅ `hermes` 交互、`hermes "..."` 单次
✅ `gateway start/stop/restart/status` 4 件套
✅ `platform add/list/config/remove` 管 IM
✅ `model` / `tools` 交互菜单管理
✅ `doctor` 排错必跑
✅ `claw migrate` 从 OpenClaw 迁移
✅ Tab 补全 + JSON 输出 = 脚本化方便

---

**下一步**：[13. 终端 UI 玩法 →](/hermes/ops/terminal-ui)

CLI 命令熟了，下章看交互式 TUI 里有什么"老手才知道"的快捷玩法。
