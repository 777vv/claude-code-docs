#!/usr/bin/env node
// 死链检查 - 覆盖站内 + 站内引用的外部 URL
//
// VitePress build 已经检查站内死链（除非加了 ignoreDeadLinks）。
// 本脚本补检：md 文件里的外部 https URL，检测是否 404 / 域名失效。
//
// 用法:
//   node scripts/check-dead-links.mjs [--external-only] [--include hermes,codex]
//
// 退出码:
//   0: 全 OK
//   1: 有死链
//   2: 脚本异常

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = join(__dirname, '..', 'docs');
const TIMEOUT = 10000;
const CONCURRENCY = 10;

// 忽略的 URL 模式（不检查）
const SKIP_PATTERNS = [
  /localhost/,
  /127\.0\.0\.1/,
  /example\.com/,
  /your-?(domain|server)/,
  /yourdomain/,
  /\.local/,
  /\$\{/, // 模板变量
  /your-?key/i,
  /xxxx/,
];

async function walk(dir, out = []) {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['node_modules', '.vitepress', 'public'].includes(ent.name)) continue;
      await walk(full, out);
    } else if (ent.isFile() && ent.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

// 从 markdown 抽 URL（[text](url) / 裸 URL / <url>）
function extractUrls(text) {
  const urls = new Set();
  // [text](url)
  const mdLink = /\]\(\s*(https?:\/\/[^\s)]+)\s*\)/g;
  let m;
  while ((m = mdLink.exec(text)) !== null) urls.add(m[1]);
  // <url>
  const angleLink = /<(https?:\/\/[^>]+)>/g;
  while ((m = angleLink.exec(text)) !== null) urls.add(m[1]);
  // 裸 URL（行内）
  const bareUrl = /(?<![("<])(https?:\/\/[^\s"'<>)]+)/g;
  while ((m = bareUrl.exec(text)) !== null) urls.add(m[1]);
  return [...urls];
}

function shouldSkip(url) {
  return SKIP_PATTERNS.some((p) => p.test(url));
}

async function head(url) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'ai-learning-docs-linkcheck/1.0' },
    });
    clearTimeout(timer);
    // HEAD 不支持时降级 GET
    if (res.status === 405 || res.status === 501) {
      return await get(url);
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  }
}

async function get(url) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    const res = await fetch(url, {
      method: 'GET',
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'ai-learning-docs-linkcheck/1.0' },
    });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  }
}

// 并发池
async function parallel(items, fn, n = CONCURRENCY) {
  const results = [];
  let idx = 0;
  const workers = Array.from({ length: n }, async () => {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log('🔍 死链检查\n');

  const files = await walk(DOCS_ROOT);
  console.log(`扫描 ${files.length} 个 md 文件...`);

  const urlToFiles = new Map(); // url -> [files]
  for (const f of files) {
    const content = await readFile(f, 'utf-8');
    for (const url of extractUrls(content)) {
      if (shouldSkip(url)) continue;
      if (!urlToFiles.has(url)) urlToFiles.set(url, []);
      urlToFiles.get(url).push(relative(DOCS_ROOT, f));
    }
  }

  const urls = [...urlToFiles.keys()];
  console.log(`提取 ${urls.length} 个唯一外部 URL\n`);

  const results = await parallel(urls, async (url) => {
    const r = await head(url);
    return { url, ...r };
  });

  const dead = results.filter((r) => !r.ok);
  console.log(`完成: ${urls.length - dead.length} OK / ${dead.length} 死/异常\n`);

  if (dead.length === 0) {
    console.log('✓ 全部链接活着');
    process.exit(0);
  }

  console.log('═'.repeat(60));
  console.log('🔴 死链清单:\n');
  // 按域名分组
  const byDomain = new Map();
  for (const d of dead) {
    let domain;
    try { domain = new URL(d.url).hostname; } catch { domain = 'invalid-url'; }
    if (!byDomain.has(domain)) byDomain.set(domain, []);
    byDomain.get(domain).push(d);
  }
  for (const [domain, list] of [...byDomain.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n${domain} (${list.length} 个):`);
    for (const d of list) {
      console.log(`  - ${d.url}`);
      console.log(`    Status: ${d.status} ${d.error ? `(${d.error})` : ''}`);
      const files = urlToFiles.get(d.url).slice(0, 3);
      console.log(`    出现在: ${files.join(', ')}${urlToFiles.get(d.url).length > 3 ? '...' : ''}`);
    }
  }

  console.log('\n💡 提示:');
  console.log('  - 域名失效（DNS 错）→ 可能要换权威源，跑 npm run audit:full');
  console.log('  - 单页 404 → 多半是上游页面改路径了');
  console.log('  - 5xx → 上游服务问题，过一阵再测');
  process.exit(1);
}

main().catch((err) => {
  console.error('脚本异常:', err);
  process.exit(2);
});
