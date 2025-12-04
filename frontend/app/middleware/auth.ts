export default defineNuxtRouteMiddleware((to) => {
  // 仅在客户端执行认证检查
  if (import.meta.server) return

  const token = useCookie('token')
  const userID = useCookie('userID')
  const isAuthenticated = !!(token.value && userID.value)

  // 已登录访问公开路由 → dashboard，未登录访问受保护路由 → login
  if (isAuthenticated === ['/', '/login', '/register'].includes(to.path)) {
    return navigateTo(isAuthenticated ? '/dashboard' : '/login', { replace: true })
  }

  // token 有效性验证由 auth.client.ts 插件的路由守卫处理
})
