<script setup lang="ts">
// 首页不需要认证中间件，因为它是预渲染的公开页面
// 在客户端检查是否已登录并重定向
onMounted(() => {
  const token = useCookie('token')
  if (token.value) {
    navigateTo('/dashboard', { replace: true })
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Hero Section -->
    <div class="flex flex-1 items-center justify-center px-4 py-32">
      <div class="max-w-4xl text-center">
        <h1 class="mb-6 text-5xl font-bold tracking-tight md:text-6xl">健康生活管理系统</h1>
        <p class="mb-8 text-xl text-gray-600 dark:text-gray-400">
          用科学的方法管理您的健康，让生活更美好
        </p>
        <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <UButton to="/login" size="lg">立即登录</UButton>
          <UButton to="/login?mode=register" variant="outline" size="lg">免费注册</UButton>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="border-t px-4 py-24 dark:border-gray-800">
      <div class="mx-auto max-w-6xl">
        <h2 class="mb-16 text-center text-3xl font-bold">核心功能</h2>
        <div class="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <div class="flex flex-col items-center text-center">
            <UIcon name="mdi:chart-line" class="mb-4 text-4xl" />
            <h3 class="mb-2 text-lg font-semibold">数据可视化</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">直观的图表展示您的健康数据趋势</p>
          </div>

          <div class="flex flex-col items-center text-center">
            <UIcon name="mdi:food-apple" class="mb-4 text-4xl" />
            <h3 class="mb-2 text-lg font-semibold">饮食管理</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">记录每日饮食，追踪卡路里摄入</p>
          </div>

          <div class="flex flex-col items-center text-center">
            <UIcon name="mdi:run-fast" class="mb-4 text-4xl" />
            <h3 class="mb-2 text-lg font-semibold">运动跟踪</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">记录运动数据，计算卡路里消耗</p>
          </div>

          <div class="flex flex-col items-center text-center">
            <UIcon name="mdi:scale-bathroom" class="mb-4 text-4xl" />
            <h3 class="mb-2 text-lg font-semibold">体重监测</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">记录体重变化，科学管理体重</p>
          </div>

          <div class="flex flex-col items-center text-center">
            <UIcon name="heroicons:sparkles" class="mb-4 text-4xl" />
            <h3 class="mb-2 text-lg font-semibold">AI 健康助手</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">智能分析，提供个性化健康建议</p>
          </div>

          <div class="flex flex-col items-center text-center">
            <UIcon name="mdi:heart-pulse" class="mb-4 text-4xl" />
            <h3 class="mb-2 text-lg font-semibold">健康目标</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">设定目标，系统帮您追踪进度</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="border-t px-4 py-24 text-center dark:border-gray-800">
      <div class="mx-auto max-w-2xl">
        <h2 class="mb-4 text-3xl font-bold">立即开始您的健康之旅</h2>
        <p class="mb-8 text-gray-600 dark:text-gray-400">加入我们，让科技助力健康生活</p>
        <UButton to="/login" size="lg">免费开始使用</UButton>
      </div>
    </div>

    <!-- Footer -->
    <footer class="border-t px-4 py-8 text-center text-sm dark:border-gray-800">
      <p class="text-gray-600 dark:text-gray-400">© 2025 健康生活管理系统. All rights reserved.</p>
    </footer>
  </div>
</template>
