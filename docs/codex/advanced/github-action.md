# GitHub Action 集成

> **本文你将学会：** 在 GitHub CI/CD 中使用 Codex 自动执行代码审查、Bug 修复等任务。

## 使用场景

| 场景 | 触发时机 | 效果 |
|------|----------|------|
| 自动代码审查 | PR 创建时 | Codex 自动 Review 并留评论 |
| 自动修复 lint 错误 | Push 后 | Codex 自动修复并 commit |
| 自动生成变更日志 | 打 Tag 时 | Codex 自动写 CHANGELOG |

---

## 基础配置：自动代码审查

在项目 `.github/workflows/` 目录下创建工作流文件：

```yaml
# .github/workflows/codex-review.yml
name: Codex Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Codex
        run: npm install -g @openai/codex

      - name: Run Codex Review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          codex --approval-mode read-only \
            "审查这个 PR 的所有改动（git diff main...HEAD），
             检查 bug、安全问题和代码质量，
             用 Markdown 格式输出结果" > review.md

      - name: Post Review Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('review.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 Codex 代码审查\n\n${review}`
            });
```

---

## 配置 GitHub Secrets

1. 打开 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **"New repository secret"**
3. 名称：`OPENAI_API_KEY`，值填入你的 API Key

::: tip 使用国内模型
如果要在 CI 中使用国内模型（如 DeepSeek），配置对应的环境变量：
```yaml
env:
  OPENAI_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
  # 需要在 ~/.codex/config.toml 中提前配置好 base_url
  # 或通过环境变量覆盖
  OPENAI_BASE_URL: "https://api.deepseek.com/v1"
```
:::

---

## 进阶：自动修复并提交

```yaml
# .github/workflows/codex-fix.yml
name: Auto Fix Lint

on:
  push:
    branches: [main, develop]

jobs:
  auto-fix:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci
      - run: npm install -g @openai/codex

      - name: Auto Fix
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          codex --approval-mode auto \
            "运行 npm run lint，修复所有 lint 错误，
             然后运行 npm test 确保测试通过"

      - name: Commit fixes
        run: |
          git config --local user.email "codex-bot@github.com"
          git config --local user.name "Codex Bot"
          git add -A
          git diff --staged --quiet || git commit -m "fix: auto fix lint errors by Codex"
          git push
```

---

## 安全注意事项

::: warning 在 CI 中使用 Codex 的安全要点
1. **限制权限**：CI 中的 Codex 应使用 `--approval-mode read-only`，除非明确需要写入
2. **隔离环境**：使用专门的 CI 仓库 Token，权限最小化
3. **审查 AI 改动**：自动修复的 commit 建议创建 PR 而非直接推送 main
4. **费用控制**：设置 API Key 的用量上限，避免 CI 循环调用导致账单飙升
:::
