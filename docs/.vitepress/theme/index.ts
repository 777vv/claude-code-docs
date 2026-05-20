import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import SearchScope from './components/SearchScope.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'nav-bar-content-before': () => h(SearchScope),
    }),
}
