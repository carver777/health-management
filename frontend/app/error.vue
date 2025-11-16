<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-2xl text-center">
      <!-- 错误代码显示 -->
      <div class="mb-8">
        <span class="text-8xl font-bold text-primary md:text-9xl">
          {{ error.statusCode || '404' }}
        </span>
      </div>

      <!-- 错误信息 -->
      <div class="mb-8">
        <h1 class="mb-4 text-3xl font-bold text-gray-900">
          {{ getErrorTitle() }}
        </h1>
        <p class="mb-2 text-lg text-gray-700">
          {{ getErrorDescription() }}
        </p>
        <p class="text-sm text-gray-500">请检查 URL 是否正确，或返回首页继续您的健康管理之旅</p>
      </div>

      <!-- 操作按钮 -->
      <div class="mb-8 flex flex-wrap justify-center gap-4">
        <UButton icon="heroicons:home" size="lg" color="primary" @click="handleError">
          返回首页
        </UButton>
        <UButton icon="heroicons:arrow-left" size="lg" variant="outline" @click="goBack">
          返回上页
        </UButton>
      </div>

      <!-- 快速导航 -->
      <div>
        <h3 class="mb-4 text-sm font-semibold text-gray-600">快速导航</h3>
        <div class="flex flex-wrap justify-center gap-3">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="flex flex-col items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            <UIcon :name="link.icon" class="text-xl" />
            <span class="text-xs font-medium">{{ link.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  error: {
    statusCode?: number
    message?: string
    stack?: string
  }
}

const props = defineProps<Props>()

// 快速导航链接
const quickLinks = [
  {
    to: '/dashboard',
    icon: 'mdi:view-dashboard',
    label: '数据概览'
  },
  {
    to: '/body-data',
    icon: 'mdi:clipboard-text',
    label: '身体数据'
  },
  {
    to: '/diet',
    icon: 'mdi:food-apple',
    label: '饮食管理'
  },
  {
    to: '/exercise',
    icon: 'mdi:run-fast',
    label: '运动管理'
  },
  {
    to: '/chat',
    icon: 'heroicons:chat-bubble-left-right',
    label: '健康咨询'
  }
]

// 获取错误标题
const getErrorTitle = () => {
  const statusCode = props.error.statusCode
  switch (statusCode) {
    case 404:
      return '页面走丢了'
    case 403:
      return '访问被拒绝'
    case 500:
      return '服务器错误'
    default:
      return '出错了'
  }
}

// 获取错误描述
const getErrorDescription = () => {
  const statusCode = props.error.statusCode
  switch (statusCode) {
    case 404:
      return '抱歉，您访问的页面不存在或已被移动到其他位置'
    case 403:
      return '您没有权限访问此页面，请先登录'
    case 500:
      return '服务器遇到了一些问题，我们正在努力修复'
    default:
      return props.error.message || '发生了一个未知错误'
  }
}

// 清除错误并返回首页
const handleError = () => {
  clearError({ redirect: '/dashboard' })
}

// 返回上一页
const goBack = () => {
  if (import.meta.client) {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      clearError({ redirect: '/dashboard' })
    }
  } else {
    clearError({ redirect: '/dashboard' })
  }
}
</script>
