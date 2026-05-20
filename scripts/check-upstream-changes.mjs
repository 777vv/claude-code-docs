#!/usr/bin/env node
// 轻量上游变化检测器（不调 LLM，只看 hash）
//
// 每个工具固定几个"权威源 URL"，记录上次 hash。
// 这次抓再算 hash，对比有变化 → 提示用户跑 /update 做完整审计。
//
// 用法:
//   node scripts/check-upstream-changes.mjs         # 检查全部
//   node scripts/check-upstream-changes.mjs hermes  # 只检查某工具
//
// 输出:
//   - 退出码 0: 无变化或仅小变化（hash 改了但 size 差不多）
//   - 退出码 1: 有显著变化，建议跑 npm run audit:full
//   - 退出码 2: 上游访问失败（网络问题等）

import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_FILE = join(__dirname, '..', 'audit-reports', 'upstream-snapshots.json');

// 上游源清单 - 每个 url 只抓 head + meta，不全文存
const SOURCES = {
  'claude-code': [
    { name: 'anthropic-docs', url: 'https://docs.anthropic.com/en/docs/claude-code/overview' },
    { name: 'github-readme', url: 'https://raw.githubusercontent.com/anthropics/claude-code/main/README.md' },
    { name: 'changelog', url: 'https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md' },
  ],
  'codex': [
    { name: 'github-readme', url: 'https://raw.githubusercontent.com/openai/codex/main/README.md' },
    { name: 'releases', url: 'https://api.github.com/repos/openai/codex/releases/latest' },
  ],
  'openclaw': [
    { name: 'github-readme', url: 'https://raw.githubusercontent.com/openclaw/openclaw/main/README.md' },
    { name: 'releases', url: 'https://api.github.com/repos/openclaw/openclaw/releases/latest' },
  ],
  'hermes': [
    { name: 'github-readme', url: 'https://raw.githubusercontent.com/NousResearch/hermes-agent/main/README.md' },
    { name: 'releases', url: 'https://api.github.com/repos/NousResearch/hermes-agent/releases/latest' },
  ],
  'shared-llm': [
    { name: 'deepseek-pricing', url: 'https://platform.deepseek.com/api-docs/pricing' },
    { name: 'anthropic-pricing', url: 'https://docs.anthropic.com/en/docs/about-claude/pricing' },
  ],
};

const SIGNIFICANT_DIFF_THRESHOLD = 0.10; // 10% size 差异认为是"显著"

const argScope = process.argv[2]; // 可选: 工具名
const scopes = argScope ? [argScope] : Object.keys(SOURCES);

const sha256 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

async function fetchOne(url, name) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'ai-learning-docs-audit/1.0' },
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const text = await res.text();
    return {
      ok: true,
      hash: sha256(text),
      size: text.length,
      fetched_at: new Date().toISOString(),
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function loadSnapshots() {
  if (!existsSync(SNAPSHOT_FILE)) return {};
  try {
    return JSON.parse(await readFile(SNAPSHOT_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

async function saveSnapshots(snap) {
  await mkdir(dirname(SNAPSHOT_FILE), { recursive: true });
  await writeFile(SNAPSHOT_FILE, JSON.stringify(snap, null, 2));
}

function classify(prev, cur) {
  if (!prev) return { level: 'new', desc: '首次记录' };
  if (prev.hash === cur.hash) return { level: 'ok', desc: '无变化' };
  if (!prev.size || !cur.size) return { level: 'changed', desc: '内容变化（无法量化）' };
  const ratio = Math.abs(cur.size - prev.size) / prev.size;
  if (ratio > SIGNIFICANT_DIFF_THRESHOLD) {
    return { level: 'significant', desc: `显著变化（size ${ratio > 0 ? '+' : ''}${(ratio * 100).toFixed(1)}%）` };
  }
  return { level: 'minor', desc: `小变化（size ±${(ratio * 100).toFixed(1)}%）` };
}

async function main() {
  console.log('🔍 上游源变化检测\n');
  const snapshots = await loadSnapshots();
  const newSnap = { ...snapshots };
  const findings = [];
  let networkFail = 0;

  for (const scope of scopes) {
    const list = SOURCES[scope];
    if (!list) {
      console.error(`未知工具: ${scope}`);
      process.exit(2);
    }
    console.log(`### ${scope}`);
    for (const src of list) {
      const key = `${scope}/${src.name}`;
      const prev = snapshots[key];
      const cur = await fetchOne(src.url, src.name);
      if (!cur.ok) {
        console.log(`  ⚠ ${src.name}: ${cur.error}`);
        networkFail++;
        continue;
      }
      const { level, desc } = classify(prev, cur);
      const icon = { ok: '✓', new: '🆕', minor: '🟡', significant: '🔴', changed: '🟠' }[level];
      console.log(`  ${icon} ${src.name}: ${desc}`);
      if (level === 'significant' || level === 'changed') {
        findings.push({ scope, source: src.name, url: src.url, level, desc });
      }
      newSnap[key] = cur;
    }
    console.log('');
  }

  await saveSnapshots(newSnap);

  console.log('═'.repeat(50));
  if (findings.length === 0 && networkFail === 0) {
    console.log('✓ 全部 OK，无显著变化');
    process.exit(0);
  }
  if (networkFail > 0 && findings.length === 0) {
    console.log(`⚠ ${networkFail} 个源访问失败，但其他无变化`);
    process.exit(2);
  }
  console.log(`🔴 发现 ${findings.length} 个显著变化:`);
  findings.forEach((f) => {
    console.log(`  - ${f.scope} / ${f.source}: ${f.desc}`);
    console.log(`    ${f.url}`);
  });
  console.log('\n💡 建议: 跑 `npm run audit:full` 让 Claude 做完整审计');
  process.exit(1);
}

main().catch((err) => {
  console.error('脚本异常:', err);
  process.exit(2);
});
