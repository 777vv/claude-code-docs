<template>
  <transition name="cr-fade">
    <a
      v-if="last"
      :href="last.path"
      class="continue-reading"
      :title="tool ? `继续阅读 ${tool.label}：${last.title}` : `继续阅读：${last.title}`"
    >
      <span class="cr-icon" aria-hidden="true">📖</span>
      <span class="cr-text">
        <span class="cr-label">
          上次看到
          <span v-if="tool" class="cr-tool" :data-tool="tool.slug">{{ tool.label }}</span>
        </span>
        <span class="cr-title">{{ last.title }}</span>
      </span>
      <span class="cr-arrow" aria-hidden="true">→</span>
    </a>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { progress, getToolFromPath } from '../composables/readingProgress'

const last = computed(() => progress.value.lastVisit)
const tool = computed(() => (last.value ? getToolFromPath(last.value.path) : null))
</script>

<style scoped>
.continue-reading {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px 10px 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: border-color 0.18s, transform 0.15s, box-shadow 0.18s;
  max-width: 560px;
}
.continue-reading:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(217, 119, 87, 0.12);
}
.cr-icon {
  font-size: 18px;
  flex-shrink: 0;
}
.cr-text {
  display: inline-flex;
  flex-direction: column;
  line-height: 1.35;
  min-width: 0;
  text-align: left;
  gap: 3px;
}
.cr-label {
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.cr-tool {
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
.cr-tool[data-tool="claude-code"] { background: #c6613f; }
.cr-tool[data-tool="codex"]       { background: #10A37F; }
.cr-tool[data-tool="openclaw"]    { background: #d97757; }
.cr-tool[data-tool="hermes"]      { background: #b88332; }
.cr-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 380px;
}
.cr-arrow {
  color: var(--vp-c-brand-1);
  font-weight: 700;
  flex-shrink: 0;
  font-size: 16px;
}

.cr-fade-enter-active, .cr-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.cr-fade-enter-from, .cr-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 480px) {
  .continue-reading { max-width: 100%; }
  .cr-title { max-width: 200px; }
}
</style>
