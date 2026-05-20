# 文件编辑与 git 回滚

> **本文你将学会：** Codex 如何读写文件、改动如何被 git 追踪、以及如何回滚不想要的操作。

## Codex 的文件操作机制

Codex 在编辑文件时遵循以下流程：

```
读取文件内容 → 生成修改方案 → 展示 diff → (等待确认 / 自动执行) → 写入文件 → git 追踪
```

所有改动都通过 git 跟踪，这意味着：
- 你能看到每一处修改
- 随时可以撤销任意操作
- 不同操作之间有清晰的历史记录

---

## 查看 Codex 做了哪些改动

### 操作中实时查看

Codex 的 UI 中会展示每次文件修改的 diff，颜色含义：
- 🟢 绿色：新增的行
- 🔴 红色：删除的行

### 操作后查看历史

```bash
# 查看 Codex 的操作日志（每次操作一个 commit）
git log --oneline

# 查看某次具体改动
git show <commit-hash>

# 查看最近一次操作的改动
git diff HEAD~1

# 查看当前未提交的改动
git diff
```

---

## 回滚操作

### 回滚最后一次操作

```bash
git revert HEAD
```

### 回滚最近 N 次操作

```bash
# 查看历史，找到想回滚到的位置
git log --oneline

# 回滚到 3 次操作之前的状态（不删除 commit 历史）
git revert HEAD~3..HEAD

# 硬回滚（删除 commit 历史，谨慎使用）
git reset --hard HEAD~3
```

### 只回滚某个文件

```bash
# 将 src/app.ts 恢复到 2 次操作之前的版本
git checkout HEAD~2 -- src/app.ts
```

---

## 文件编辑的默认范围

在 **Auto 模式**下，Codex 默认只能编辑**当前工作目录及其子目录**内的文件。

```bash
# 在项目根目录启动
cd ~/my-project
codex
# → Codex 只能操作 ~/my-project/ 下的文件
```

如果 Codex 需要访问其他目录的文件，会明确询问你的许可。

---

## 多文件同时编辑

Codex 可以在一次对话中同时修改多个文件：

```
重构用户认证模块：
- 将 auth.js 拆分为 auth-login.js 和 auth-register.js
- 更新 routes/index.js 中的引用
- 在每个新文件顶部添加 JSDoc 注释
```

Codex 会按顺序处理每个文件，你可以在 UI 中看到每一步的进度。

---

## 实用工作流：与 git 配合使用

::: tip 推荐工作流
```bash
# 1. 开始工作前确保工作区干净
git status  # 应该输出 "nothing to commit"

# 2. 启动 Codex 完成任务
codex

# 3. 查看 Codex 做的所有改动
git log --oneline  # 查看 commit 历史
git diff HEAD~N    # 查看最近 N 次提交的改动

# 4. 如果满意，将 Codex 的 commit 整理合并
git rebase -i HEAD~N  # 交互式 rebase 整理 commit

# 5. 如果不满意，全部回滚
git reset --hard HEAD~N
```
:::

---

## 注意事项

::: warning 未初始化 git 的目录
如果当前目录没有 git 仓库，Codex 仍然可以编辑文件，但**没有回滚能力**。强烈建议先执行 `git init`。
:::

::: info 大文件处理
Codex 对单个文件大小有上下文限制。对于超长文件（如 5000+ 行），建议拆分任务或指定具体的修改范围：
```
只修改 utils.js 中 150-200 行的 parseDate 函数，其他部分不要动
```
:::
