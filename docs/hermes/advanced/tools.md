# 18. 40+ 内置工具一览

::: info 本章你将学到
- Hermes 出厂 40+ 工具按 8 类的完整清单
- 每个工具干啥、什么场景用
- Toolset 分组管理
- 启用 / 禁用 / 自查清单
- Tool vs Skill vs MCP 三者区别
:::

::: tip 不用记每一个
**当工具书看**——需要时 Ctrl+F 搜。
本章核心：理解 Hermes 工具的**分类**和**启用方式**，具体哪个工具用到时再细查。
:::

## 18.1 总览：40+ 工具按 8 类

```
core (核心，约 11 个)
├── read_file
├── write_file
├── list_dir
├── glob
├── grep
├── shell_exec
├── run_python
├── web_search
├── fetch_url
├── download
└── env_get

code (代码相关，约 9 个)
├── code_search
├── analyze_repo
├── git_status
├── git_log
├── git_diff
├── git_clone
├── lint
├── format
└── run_tests

data (数据格式，约 6 个)
├── parse_csv
├── read_pdf
├── read_docx
├── read_xlsx
├── read_json
└── jsonl_iterate

browser (浏览器自动化，约 4 个)
├── browser_use (Browser Use 集成)
├── screenshot
├── extract_text
└── fill_form

media (多媒体，约 5 个)
├── analyze_image
├── generate_image (调外部 API)
├── transcribe (语音转文字)
├── extract_audio
└── ocr

deep-research (深度研究，约 7 个)
├── multi_search
├── crawl_site
├── compare_sources
├── extract_citations
├── academic_search (arxiv/semanticscholar)
├── news_aggregate
└── trends_analyze

system (系统级，约 3 个)
├── ssh_exec
├── docker_run
└── cron_schedule

custom (你自己加的)
└── ...
```

## 18.2 Toolset 分组管理

不能 40+ 全开（context 会爆 + LLM 决策混乱）。Hermes 用 **toolset 分组**。

### 看当前启用的

```bash
hermes tools list
```

输出：
```
ENABLED TOOLSETS
✓ core           (11 tools)
✓ code           (9 tools)

DISABLED TOOLSETS
☐ data           (6 tools)
☐ browser        (4 tools)
☐ media          (5 tools)
☐ deep-research  (7 tools)
☐ system         (3 tools)
```

### 启用 / 禁用

```bash
hermes tools enable browser
hermes tools disable code
```

或交互式：
```bash
hermes tools
```

### 配置文件

```yaml
# ~/.hermes/config.yaml
toolsets:
  enabled:
    - core
    - code
    - data
  disabled:
    - browser           # 不需要时禁，省 context
    - media
```

## 18.3 核心工具详解（core toolset）

### 文件操作

```bash
read_file(path, lines=None)
# 读文件。lines 可指定行范围（如 "10-50"）

write_file(path, content, mode="overwrite")
# 写文件。mode: overwrite / append / create_only

list_dir(path, recursive=False, pattern="*")
# 列目录。recursive=True 递归。pattern 用 glob

glob(pattern)
# 通配符找文件，如 "**/*.py"

grep(pattern, path, case_sensitive=True)
# 正则搜内容（用 ripgrep 实现，超快）
```

### 终端

```bash
shell_exec(command, cwd=None, timeout=30)
# 跑 shell 命令。默认 30s 超时
# ⚠️ 默认 require_confirm

run_python(code, isolated=True)
# 跑 Python 代码。isolated=True 在独立 venv
```

### 网络

```bash
web_search(query, top_n=10)
# 网搜，返回标题 + URL + 摘要

fetch_url(url)
# 拉网页内容（清理 HTML 转 markdown）

download(url, path)
# 下文件到本地
```

## 18.4 代码工具（code toolset）

```bash
code_search(query, language=None, path=None)
# 在代码库里搜符号 / 函数 / 类（语法感知）

analyze_repo(path)
# 分析仓库整体: 语言占比 / 关键模块 / 入口

git_status / git_log / git_diff (path=None)
git_clone(url, path)
# Git 标准操作

lint(path, fixer=None)
# 调 ruff / eslint / prettier 等

run_tests(path, framework="auto")
# pytest / jest / mocha 等
```

## 18.5 数据工具（data toolset）

```bash
parse_csv(path, delimiter=",")
read_pdf(path, pages=None)
read_docx(path)
read_xlsx(path, sheet=None)
read_json(path)
jsonl_iterate(path)
```

读完返回结构化数据给 LLM 处理。

## 18.6 浏览器工具（browser toolset，要单独装）

```bash
browser_use(task, headless=True)
# Browser Use 集成（v0.8+）。LLM 控制浏览器完成任务
# 例: browser_use("打开 amazon.com 搜 'mechanical keyboard', 列出 top 5 销量")

screenshot(url)
# 截图

extract_text(url)
# 抽页面纯文字（不带 HTML）

fill_form(url, fields)
# 自动填表（小心使用）
```

::: warning Browser 工具高危
能控制浏览器 = 能用你的身份登录 / 付款。
**只在隔离环境（docker / sandbox backend）开 browser**。
:::

## 18.7 多媒体（media toolset）

```bash
analyze_image(path)
# 视觉理解：用 GPT-4V / Claude 3.5 Sonnet vision

generate_image(prompt, model="dall-e-3")
# 调外部图像 API

transcribe(audio_path, language="zh")
# 调 Whisper / 阿里 ASR

extract_audio(video_path)
# 视频抽音轨

ocr(image_path)
# 图像文字识别
```

## 18.8 深度研究（deep-research toolset）

Hermes 独家强项之一。

```bash
multi_search(query, sources=["google", "bing", "duckduckgo"])
# 多源并行搜

crawl_site(url, max_pages=20)
# 抓整个网站结构化

compare_sources(query, num_sources=5)
# 找多个来源对比观点

extract_citations(pdf_path)
# 学术论文引用提取

academic_search(query)
# arxiv / semantic scholar / google scholar 三联

news_aggregate(topic, period="24h")
# 抓最近新闻按主题聚合

trends_analyze(keyword)
# 搜索趋势 / 词频分析
```

## 18.9 系统工具（system toolset）

```bash
ssh_exec(host, command, key=None)
# 远程 SSH 跑命令

docker_run(image, command, env={})
# 跑 Docker 容器

cron_schedule(name, schedule, command)
# 注册 cron 任务
```

## 18.10 看每个工具详细文档

```bash
hermes tools info shell_exec
```

输出：
```
TOOL: shell_exec
TOOLSET: core
DESCRIPTION: Execute shell command on the current backend

PARAMETERS:
  command: string (required) - The shell command
  cwd: string (optional) - Working directory
  timeout: int (default: 30) - Timeout seconds

RETURNS:
  stdout: string
  stderr: string
  exit_code: int

PERMISSIONS:
  require_confirm: true (default)
  sandbox: respects backend setting

EXAMPLES:
  shell_exec("ls -la")
  shell_exec("npm test", cwd="~/projects/my-app", timeout=120)

KNOWN LIMITATIONS:
  - No interactive prompts (use run_python for that)
  - 30s timeout default may be too short for builds
```

## 18.11 自定义工具（写你自己的）

如果内置 40+ 不够，你可以加 custom tool：

```python
# ~/.hermes/custom_tools/my_tool.py
from hermes_skill_sdk import tool

@tool(name="check_office_attendance",
      description="Check who's in office today via 飞书 API")
async def check_attendance(date: str = "today"):
    # 调你公司内部 API
    response = await fetch(f"https://internal-api/attendance?date={date}")
    return {"present": [...], "remote": [...]}
```

注册：
```bash
hermes tools register ~/.hermes/custom_tools/my_tool.py
```

Hermes 自动可用。

## 18.12 Tool vs Skill vs MCP 区别

| | Tool | Skill | MCP |
|---|---|---|---|
| **是什么** | 原子动作 | 流程沉淀 | 跨工具协议接的外部能力 |
| **大小** | 单函数 | 多步流程 | 一组工具的远程服务 |
| **谁写** | Hermes 内置或你扩展 | Hermes 自学或你写 | 任何兼容 MCP 的服务 |
| **场景** | "读这个文件" | "整理这种 PDF" | "接 GitHub 完整能力" |
| **位置** | hermes 内部 | `~/.hermes/skills/` | 任何 MCP server |

详见 [20. MCP 协议接入](/hermes/advanced/mcp)。

## 18.13 安全：哪些工具要 confirm

按风险默认行为：

| 工具 | 默认 confirm |
|---|---|
| `read_file` / `list_dir` / `web_search` | ❌ 不问 |
| `fetch_url` / `code_search` | ❌ 不问 |
| `write_file` / `shell_exec` | ✅ 必问 |
| `browser_use` / `download` | ✅ 必问 |
| `ssh_exec` / `docker_run` | ✅ 必问 |
| `delete_file` | ✅ **两次**确认 |

配置：

```yaml
tools:
  require_confirm:
    - shell_exec
    - write_file
    - delete_file
    - browser_use
    - ssh_exec
    - api_call_external      # 调付费 API
```

## 18.14 工具用量统计

```bash
hermes stats tools --period 7d
```

```
TOOL                  CALLS    SUCCESS    AVG_TIME
read_file             234      99%        12ms
web_search            45       98%        1.2s
shell_exec            23       91%        450ms
read_pdf              12       100%       3.4s
browser_use           3        67%        45s
...
```

调用频率低 + 成功率低的工具可能配置有问题。

---

## 看完这一章你应该知道

✅ Hermes 内置 40+ 工具按 8 类
✅ Toolset 分组按需启用，省 context
✅ 危险工具默认 require_confirm
✅ 自己写 custom_tool 注册即用
✅ Tool / Skill / MCP 三者职能不同
✅ `hermes tools info <name>` 看单个工具详情

---

**下一步**：[19. Honcho 记忆 + Memory →](/hermes/advanced/memory-honcho)

工具是动作，记忆是积累。下一章讲 Hermes 怎么把记忆做得比其他 agent 都深。
