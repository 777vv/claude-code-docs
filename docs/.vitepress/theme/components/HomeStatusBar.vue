<template>
  <div class="home-status">
    <span class="hs-section hs-fresh">
      <span class="hs-icon" aria-hidden="true">📅</span>
      <span class="hs-fresh-text">每月自动校对官方文档，过时内容当月修</span>
    </span>

    <template v-if="last">
      <span class="hs-divider" aria-hidden="true"></span>
      <a
        class="hs-section hs-continue"
        :href="last.path"
        :title="tool ? `继续阅读 ${tool.label}：${last.title}` : `继续阅读：${last.title}`"
      >
        <span class="hs-icon" aria-hidden="true">📖</span>
        <span class="hs-label">上次看到</span>
        <span v-if="tool" class="hs-tool" :data-tool="tool.slug">{{ tool.label }}</span>
        <span class="hs-title">{{ last.title }}</span>
        <span class="hs-arrow" aria-hidden="true">→</span>
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { progress, getToolFromPath } from '../composables/readingProgress'

const last = computed(() => progress.value.lastVisit)
const tool = computed(() => (last.value ? getToolFromPath(last.value.path) : null))
</script>

<style scoped>
.home-status {
  display: inline-flex;
  align-items: center;
  padding: 9px 20px;
  background: var(--vp-c-brand-soft);
  border: 1px solid var(--vp-c-brand-2);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  max-width: 100%;
}

.hs-section {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.hs-fresh {
  color: var(--vp-c-brand-1);
}
.hs-fresh-text {
  font-size: 13px;
  font-weight: 600;
}

.hs-divider {
  display: inline-block;
  width: 1px;
  height: 18px;
  background: var(--vp-c-brand-2);
  opacity: 0.6;
  margin: 0 16px;
  flex-shrink: 0;
}

.hs-continue {
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: opacity 0.15s;
}
.hs-continue:hover {
  opacity: 0.78;
}
.hs-continue:hover .hs-title {
  text-decoration: underline;
}

.hs-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.hs-label {
  font-size: 10.5px;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 700;
}

.hs-tool {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
  text-transform: none;
  white-space: nowrap;
  line-height: 1.4;
}
.hs-tool[data-tool="claude-code"] { background: #c6613f; }
.hs-tool[data-tool="codex"]       { background: #10A37F; }
.hs-tool[data-tool="openclaw"]    { background: #d97757; }
.hs-tool[data-tool="hermes"]      { background: #b88332; }

.hs-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 240px;
}

.hs-arrow {
  color: var(--vp-c-brand-1);
  font-weight: 700;
  font-size: 14px;
}

/* 中小屏：自动换列 */
@media (max-width: 720px) {
  .home-status {
    flex-direction: column;
    border-radius: 14px;
    padding: 12px 18px;
    gap: 8px;
  }
  .hs-divider {
    width: 60%;
    height: 1px;
    margin: 2px 0;
  }
  .hs-title { max-width: 200px; }
}
</style>
