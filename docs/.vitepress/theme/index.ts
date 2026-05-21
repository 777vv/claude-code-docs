import DefaultTheme from 'vitepress/theme'
import { h, watch } from 'vue'
import type { EnhanceAppContext } from 'vitepress'
import SearchScope from './components/SearchScope.vue'
import ContinueReading from './components/ContinueReading.vue'
import HomeStatusBar from './components/HomeStatusBar.vue'
import { recordVisit, markRead, normalizePath, isChapterPath, progress } from './composables/readingProgress'
import './custom.css'

/** 当前页面的滚动监听句柄（每次路由变化前需移除） */
let currentScrollHandler: ((this: Window, ev: Event) => any) | null = null

function attachPageTracker(rawPath: string) {
  if (typeof window === 'undefined') return
  const path = normalizePath(rawPath)

  // 拆掉上一页留下的监听
  if (currentScrollHandler) {
    window.removeEventListener('scroll', currentScrollHandler)
    currentScrollHandler = null
  }

  // 只对真正的"章节"页面（/工具/xxx）做记录与滚动跟踪
  if (!isChapterPath(path)) return

  // 等 VitePress 完成 DOM 切换，再抓 h1 作为标题
  requestAnimationFrame(() => {
    setTimeout(() => {
      // 复制 H1 并把 VitePress 的锚点链接拆掉，再读取干净文本
      const h1 = document.querySelector('.VPDoc h1, .vp-doc h1')
      let title = ''
      if (h1) {
        const clone = h1.cloneNode(true) as HTMLElement
        clone.querySelectorAll('.header-anchor, a').forEach((n) => n.remove())
        // 去掉零宽字符（U+200B / U+200C / U+200D / U+FEFF）和末尾 #
        title = (clone.textContent || '')
          .replace(/[​-‍﻿]/g, '')
          .replace(/#+\s*$/, '')
          .replace(/\s+/g, ' ')
          .trim()
      }
      if (!title) {
        title = document.title.replace(/\s*[|·]\s*.+$/, '').trim()
      }
      if (title) recordVisit(path, title)

      // 滚动到 80% 自动标记已读
      let marked = false
      const handler = () => {
        if (marked) return
        const doc = document.documentElement
        const scrolled = doc.scrollTop + window.innerHeight
        const total = doc.scrollHeight
        if (total > 0 && scrolled / total >= 0.8) {
          markRead(path)
          marked = true
          if (currentScrollHandler === handler) {
            window.removeEventListener('scroll', currentScrollHandler)
            currentScrollHandler = null
          }
        }
      }
      currentScrollHandler = handler
      window.addEventListener('scroll', handler, { passive: true })
      // 短文也要能立刻标记（不需要滚动）
      handler()
    }, 80)
  })
}

/** 给侧边栏已读项加 .is-read 类（由 CSS 把它渲染成 ✓ + 灰） */
function refreshSidebarTicks() {
  if (typeof document === 'undefined') return
  const links = document.querySelectorAll<HTMLAnchorElement>('.VPSidebar a[href]')
  links.forEach((a) => {
    const href = a.getAttribute('href') || ''
    if (!href || href.startsWith('http')) return
    const norm = normalizePath(href)
    if (progress.value.read[norm]) a.classList.add('is-read')
    else a.classList.remove('is-read')
  })
}

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'nav-bar-content-before': () => h(SearchScope),
    }),
  enhanceApp({ app, router }: EnhanceAppContext) {
    // 注册全局组件，docs/index.md 里能直接 <ContinueReading /> / <HomeStatusBar />
    app.component('ContinueReading', ContinueReading)
    app.component('HomeStatusBar', HomeStatusBar)

    if (typeof window === 'undefined') return

    // 路由变化：记录访问 + 重新挂滚动监听 + 刷新侧边栏勾
    const prevHook = router.onAfterRouteChanged
    router.onAfterRouteChanged = (to: string) => {
      if (typeof prevHook === 'function') prevHook.call(router, to)
      attachPageTracker(to)
      // 等侧边栏渲染好
      setTimeout(refreshSidebarTicks, 120)
    }

    // 首次进站
    setTimeout(() => {
      attachPageTracker(window.location.pathname)
      refreshSidebarTicks()
    }, 100)

    // 用户在某一页读到 80%，对应的 progress.read 更新；侧边栏勾要同步
    watch(
      () => progress.value.read,
      () => refreshSidebarTicks(),
      { deep: true },
    )
  },
}
