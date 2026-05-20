# audit-reports/

文档审计产物目录。

## 文件类型

| 文件 | 进 git | 说明 |
|---|---|---|
| `upstream-snapshots.json` | ✅ | 上游源 hash 快照，下次跑对比 |
| `update-report-YYYY-MM-DD.md` | ❌ | LLM 审计报告，本地查看用 |
| `README.md` | ✅ | 本文件 |

## 怎么用

### 本地手动跑

```bash
# 快速扫（5-10 分钟）
npm run audit

# 完整 LLM 扫（60-90 分钟）
npm run audit:full

# 单工具
npm run audit:tool hermes

# 只看上游有没有变（不调 LLM，30 秒）
npm run audit:check

# 死链检查（5 分钟，看网速）
npm run audit:links
```

### 自动跑

GitHub Action `.github/workflows/monthly-audit.yml` 每月 1 号自动跑：

1. **上游 hash 对比** → 发现变化提 issue
2. **死链检查** → 有死链提 issue
3. **VitePress build** → 站内死链提 issue

人工跑完整 LLM 审计：`npm run audit:full`（成本可控的本地操作）。

## 命名规范

- `upstream-snapshots.json` 固定名
- `update-report-2026-05-20.md` 日期格式 YYYY-MM-DD
- `.tmp` 后缀文件是中间产物，跑完会清理

## 历史

| 日期 | 文件 | 备注 |
|---|---|---|
| 2026-05-20 | upstream-snapshots.json | 首次快照 |
