// https://nuxt.com/docs/api/configuration/nuxt-config

// @ts-expect-error process is available in Node.js environment
const apiBaseUrl = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui'],

  components: [
    {
      path: '~/components',
      pathPrefix: false // 不使用文件夹名作为组件名前缀
    }
  ],

  imports: {
    dirs: [
      // 默认已包含: composables/**, utils/**
      'types'
    ]
  },

  devtools: {
    enabled: true
  },

  app: {
    head: {
      title: '健康生活管理系统',
      htmlAttrs: {
        lang: 'zh-CN'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '健康生活管理系统 - 您的健康小助手' }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' }]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: apiBaseUrl
    }
  },

  routeRules: {
    // 公开页面 - 预渲染（SEO + 性能）
    '/': { prerender: true },
    '/login': { prerender: true },

    // 管理后台页面 - 客户端渲染（交互优先）
    '/dashboard': { ssr: false },
    '/chat': { ssr: false },
    '/body-data': { ssr: false },
    '/diet': { ssr: false },
    '/exercise': { ssr: false },
    '/profile': { ssr: false },

    // API 代理 - 将 /api 请求代理到后端服务器
    '/api/**': { proxy: { to: apiBaseUrl + '/**' } }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
