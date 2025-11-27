// https://nuxt.com/docs/api/configuration/nuxt-config

const apiBaseUrl = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxt/ui'],

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
    // 公开页面 - 预渲染
    '/': { prerender: true },
    '/login': { prerender: true },

    // 管理后台页面 - 客户端渲染
    '/dashboard': { ssr: false },
    '/chat': { ssr: false },
    '/body-data': { ssr: false },
    '/diet': { ssr: false },
    '/exercise': { ssr: false },
    '/sleep': { ssr: false },
    '/profile': { ssr: false }
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    devProxy: {
      '/api': {
        target: apiBaseUrl,
        changeOrigin: true,
        secure: false
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    provider: 'iconify',
    serverBundle: 'auto',
    clientBundle: {
      scan: true,
      sizeLimitKb: 512
    }
  }
})
