import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Claude Code 学习站',
  description: '从零开始掌握 Anthropic 官方 AI 编码助手，覆盖安装、基础使用、进阶技巧、国内适配与实战案例',

  head: [
    ['meta', { name: 'theme-color', content: '#c6613f' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Claude Code 学习站' }],
    ['meta', { property: 'og:description', content: '从零开始掌握 Anthropic 官方 AI 编码助手' }],
  ],

  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'Claude Code 学习站',

    nav: [
      { text: '入门', link: '/guide/intro' },
      { text: '基础', link: '/basics/usage' },
      { text: '进阶', link: '/advanced/memory' },
      {
        text: '更多',
        items: [
          { text: '国内适配', link: '/china/models' },
          { text: '集成与自动化', link: '/integration/github-actions' },
          { text: '实战案例', link: '/cases/' },
          { text: '技巧与参考', link: '/tips/best-practices' },
        ]
      },
    ],

    sidebar: [
      {
        text: '入门',
        collapsed: false,
        items: [
          { text: '1. 什么是 Claude Code', link: '/guide/intro' },
          { text: '2. 系统要求', link: '/guide/requirements' },
          { text: '3. 安装', link: '/guide/install' },
          { text: '4. 登录认证', link: '/guide/auth' },
          { text: '5. 快速开始', link: '/guide/quickstart' },
        ]
      },
      {
        text: '基础',
        collapsed: false,
        items: [
          { text: '6. 基础使用', link: '/basics/usage' },
          { text: '7. CLI 命令参考', link: '/basics/cli' },
          { text: '8. 斜杠命令', link: '/basics/slash-commands' },
          { text: '9. 键盘快捷键', link: '/basics/shortcuts' },
        ]
      },
      {
        text: '进阶',
        collapsed: false,
        items: [
          { text: '10. CLAUDE.md 与记忆', link: '/advanced/memory' },
          { text: '11. 权限与模式', link: '/advanced/permissions' },
          { text: '12. 计划模式', link: '/advanced/plan-mode' },
          { text: '13. 技能（Skills）', link: '/advanced/skills' },
          { text: '14. 子代理（Subagents）', link: '/advanced/subagents' },
          { text: '15. 钩子（Hooks）', link: '/advanced/hooks' },
          { text: '16. MCP 协议', link: '/advanced/mcp' },
          { text: '17. 配置文件详解', link: '/advanced/config' },
          { text: '18. 插件（Plugins）', link: '/advanced/plugins' },
        ]
      },
      {
        text: '国内适配',
        collapsed: false,
        items: [
          { text: '19. 国内模型接入', link: '/china/models' },
          { text: '20. 代理与网络配置', link: '/china/proxy' },
        ]
      },
      {
        text: '集成与自动化',
        collapsed: false,
        items: [
          { text: 'GitHub Actions 集成', link: '/integration/github-actions' },
          { text: 'Agents SDK 开发指南', link: '/integration/agents-sdk' },
        ]
      },
      {
        text: '实战案例',
        collapsed: false,
        items: [
          { text: '案例总览', link: '/cases/' },
          { text: '案例1：从零搭建全栈项目', link: '/cases/fullstack' },
          { text: '案例2：遗留代码重构', link: '/cases/refactor' },
          { text: '案例3：复杂 Bug 调试', link: '/cases/debug' },
        ]
      },
      {
        text: '技巧与参考',
        collapsed: false,
        items: [
          { text: '21. 最佳实践', link: '/tips/best-practices' },
          { text: '22. 常见工作流', link: '/tips/workflows' },
          { text: '23. 并行与自动化', link: '/tips/parallel' },
          { text: '24. IDE 集成', link: '/tips/ide' },
          { text: '25. 故障排除', link: '/tips/troubleshoot' },
          { text: '26. 术语表', link: '/tips/glossary' },
          { text: '27. 资源链接', link: '/tips/resources' },
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/anthropics/claude-code' }
    ],

    footer: {
      message: '基于官方文档整理，持续更新',
      copyright: '内容遵循 Anthropic 官方授权 · 2026'
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
              }
            }
          }
        }
      }
    },

    editLink: {
      pattern: 'https://github.com/anthropics/claude-code/issues',
      text: '在 GitHub 上反馈问题'
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: { dateStyle: 'short' }
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '本页目录',
      level: [2, 3]
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },

  markdown: {
    lineNumbers: true,
    theme: {
      light: 'one-dark-pro',
      dark: 'one-dark-pro'
    }
  }
})
