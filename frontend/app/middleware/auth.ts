export default defineNuxtRouteMiddleware((to) => {
  // 仅在客户端执行认证检查
  if (import.meta.server) return

  const config = useRuntimeConfig().public
  if (config.SKIP_AUTH === 'true') return

  const token = useCookie('token')
  const publicRoutes = ['/login', '/register', '/']

  // 如果是公开路由，直接放行
  if (publicRoutes.includes(to.path)) {
    return
  }

  // 如果没有 token，跳转到登录页
  if (!token.value) {
    return navigateTo('/login')
  }

  // token 验证改为由 auth.client.ts 插件在应用初始化时处理
})
