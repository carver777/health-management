/**
 * 认证插件 - 非阻塞式加载，避免首屏加载被阻塞
 */
export default defineNuxtPlugin(() => {
  const { fetchUserProfile, logout } = useAuth()
  const token = useCookie('token')
  const router = useRouter()

  const userState = useState<User | null>('user', () => null)

  // 尝试从 localStorage 恢复用户信息缓存
  if (import.meta.client && token.value && !userState.value) {
    try {
      const cachedUser = localStorage.getItem('user_cache')
      const cacheTimestamp = localStorage.getItem('user_cache_timestamp')

      if (cachedUser && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp)
        // 缓存有效期 5 分钟
        if (cacheAge < 5 * 60 * 1000) {
          const parsedUser = JSON.parse(cachedUser)
          userState.value = parsedUser
        }
      }
    } catch {
      // 忽略加载错误
    }
  }

  // 路由守卫：只在访问受保护页面时才验证 token
  router.beforeEach(async (to) => {
    const publicRoutes = ['/login', '/register', '/']

    if (publicRoutes.includes(to.path)) {
      return
    }

    // 有 token 但没有用户信息，后台验证（不阻塞导航）
    if (token.value && !userState.value) {
      fetchUserProfile(true).then((isValid) => {
        if (!isValid) {
          logout(true)
          router.push('/login')
        }
      })
    }
  })
})
