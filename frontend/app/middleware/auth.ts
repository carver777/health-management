export default defineNuxtRouteMiddleware(async (to) => {
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

  try {
    const { isLoggedIn, fetchUserProfile } = useAuth()

    // 如果已登录且有用户信息，直接放行
    if (isLoggedIn.value) {
      const hasProfile = await fetchUserProfile()
      if (!hasProfile) {
        // token 无效，清除并跳转到登录页
        return navigateTo('/login')
      }
    }
  } catch {
    return navigateTo('/login')
  }
})
