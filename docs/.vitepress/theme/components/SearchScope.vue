<template>
  <div class="search-scope" :class="{ open }">
    <button
      class="scope-chip"
      :title="`搜索范围：${current.label}（点击切换）`"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click.stop="toggleOpen"
    >
      <span class="scope-dot" :data-scope="current.value" aria-hidden="true"></span>
      <span class="scope-text">{{ current.short }}</span>
      <svg class="scope-arrow" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
        <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <transition name="scope-fade">
      <div v-if="open" class="scope-menu" role="menu" @click.stop>
        <div class="scope-menu-title">搜索范围</div>
        <button
          v-for="opt in SCOPE_OPTIONS"
          :key="opt.value"
          class="scope-menu-item"
          :class="{ active: opt.value === scope }"
          role="menuitemradio"
          :aria-checked="opt.value === scope"
          @click="pick(opt.value)"
        >
          <span class="scope-dot" :data-scope="opt.value" aria-hidden="true"></span>
          <span class="scope-menu-label">{{ opt.label }}</span>
          <span v-if="opt.value === scope" class="scope-check" aria-hidden="true">✓</span>
        </button>
        <div class="scope-menu-hint">在结果里只显示选中范围的文档</div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { searchScope, SCOPE_OPTIONS, type Scope } from '../composables/searchScope'

const open = ref(false)
const scope = computed(() => searchScope.value)
const current = computed(() =>
  SCOPE_OPTIONS.find(o => o.value === scope.value) ?? SCOPE_OPTIONS[0]
)

function toggleOpen() { open.value = !open.value }

function pick(v: Scope) {
  searchScope.value = v
  open.value = false
}

function onDocClick() { open.value = false }
function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onEsc)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onEsc)
})
</script>

<style scoped>
.search-scope {
  position: relative;
  display: inline-flex;
  align-items: center;
  /* 与左侧站点标题拉开距离，紧贴搜索框左侧 */
  margin-left: 32px;
  margin-right: 6px;
}

.scope-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  white-space: nowrap;
}

.scope-chip:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
}

.search-scope.open .scope-chip {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.scope-arrow {
  transition: transform 0.2s;
  color: var(--vp-c-text-2);
}
.search-scope.open .scope-arrow {
  transform: rotate(180deg);
  color: var(--vp-c-brand-1);
}

.scope-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  padding: 6px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
  z-index: 100;
}

.scope-menu-title {
  padding: 6px 10px 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.scope-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--vp-c-text-1);
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s, color 0.12s;
}

.scope-menu-item:hover {
  background: var(--vp-c-bg-soft);
}

.scope-menu-item.active {
  color: var(--vp-c-brand-1);
  font-weight: 700;
  background: var(--vp-c-brand-soft);
}

.scope-menu-label { flex: 1; }
.scope-check { color: var(--vp-c-brand-1); font-weight: 800; }

.scope-menu-hint {
  margin-top: 4px;
  padding: 8px 10px 4px;
  font-size: 11px;
  color: var(--vp-c-text-3);
  border-top: 1px solid var(--vp-c-divider);
  line-height: 1.5;
}

.scope-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--vp-c-text-3);
}
.scope-dot[data-scope="all"]         { background: linear-gradient(135deg, #c6613f, #d97757 50%, #e8906d); }
.scope-dot[data-scope="claude-code"] { background: #c6613f; }
.scope-dot[data-scope="codex"]       { background: #10A37F; }
.scope-dot[data-scope="openclaw"]    { background: #d97757; }
.scope-dot[data-scope="hermes"]      { background: #f0b454; }

.scope-fade-enter-active, .scope-fade-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.scope-fade-enter-from, .scope-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 中等屏幕：把文字隐掉，只剩圆点 + 箭头 */
@media (max-width: 960px) {
  .scope-chip { padding: 5px 8px; }
  .scope-text { display: none; }
}

/* 移动端隐藏整个 chip（侧边栏汉堡菜单优先） */
@media (max-width: 767px) {
  .search-scope { display: none; }
}
</style>
