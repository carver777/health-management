/**
 * 认证插件 - 在客户端初始化时验证 token 有效性
 */
export default defineNuxtPlugin(async () => {
  const { fetchUserProfile, logout } = useAuth()
  const token = useCookie('token')
  const router = useRouter()

  // 如果有 token，验证其有效性
  if (token.value) {
    const isValid = await fetchUserProfile(true)

    // token 无效，清除登录状态
    if (!isValid) {
      logout(true)

      // 如果当前不在公开路由，跳转到登录页
      const publicRoutes = ['/login', '/register', '/']
      const currentPath = router.currentRoute.value.path
      if (!publicRoutes.includes(currentPath)) {
        await navigateTo('/login')
      }
    }
  }
})
