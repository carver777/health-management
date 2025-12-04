/**
 * 用户认证状态管理
 */

export const useAuth = () => {
  const isInsecure = useRuntimeConfig().public.INSECURE_COOKIE === 'true'
  const cookieSecure = import.meta.env.PROD && !isInsecure

  // 通用配置
  const cookieOptions = {
    maxAge: 60 * 60 * 24 * 7, // 7 天
    path: '/',
    sameSite: 'lax' as const,
    secure: cookieSecure,
    default: () => null
  }

  const user = useState<User | null>('user', () => null)
  const token = useCookie<string | null>('token', cookieOptions)
  const userID = useCookie<string | null>('userID', cookieOptions)
  const isLoggedIn = computed(() => !!token.value)
  const toast = import.meta.client ? useToast() : { add: () => {} }

  const handleError = (title: string, error: unknown) => {
    const apiError = error as ApiError
    toast.add({
      title,
      description: apiError.message || apiError.response?.data?.message || '请稍后重试',
      color: 'error'
    })
  }

  // 解析 JWT token 获取 userID
  const parseJwt = (tokenStr: string) => {
    try {
      const base64Url = tokenStr.split('.')[1]
      if (!base64Url) return null
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      return JSON.parse(atob(base64))
    } catch {
      return null
    }
  }

  const login = async (loginData: LoginRequest) => {
    try {
      const response = await $fetch<{ code: number; data?: string; msg?: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: loginData
        }
      )

      if (response.code !== 1 || !response.data) {
        throw new Error(response.msg || '登录失败')
      }

      token.value = response.data

      // 从 JWT 中提取 userID
      const payload = parseJwt(response.data)
      if (payload) {
        userID.value =
          payload.userId || payload.userID || payload.sub || payload.id || payload.user_id
      }

      toast.add({
        title: '登录成功',
        color: 'success'
      })

      await fetchUserProfile()
      return true
    } catch (error) {
      handleError('登录失败', error)
      return false
    }
  }

  const register = async (registerData: RegisterRequest) => {
    try {
      const response = await $fetch<{ code: number; msg?: string }>('/api/auth/register', {
        method: 'POST',
        body: registerData
      })

      if (response.code !== 1) {
        throw new Error(response.msg || '注册失败')
      }

      toast.add({
        title: '注册成功',
        description: '请登录',
        color: 'success'
      })
      return true
    } catch (error) {
      handleError('注册失败', error)
      return false
    }
  }

  const resetPassword = async (payload: PasswordResetRequest) => {
    try {
      const response = await $fetch<{ code: number; msg?: string }>('/api/auth/password/reset', {
        method: 'POST',
        body: payload
      })

      if (response.code !== 1) {
        throw new Error(response.msg || '重置密码失败')
      }

      toast.add({
        title: '密码已更新',
        description: '请使用新密码登录',
        color: 'success'
      })
      return true
    } catch (error) {
      handleError('重置密码失败', error)
      return false
    }
  }

  const fetchUserProfile = async (silent = false) => {
    if (!token.value) return false

    try {
      const response = await $fetch<{ code: number; data: User; msg?: string }>(
        '/api/user/profile',
        {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        }
      )

      if (response.code !== 1 || !response.data) {
        throw new Error(response.msg || '获取用户信息失败')
      }

      user.value = response.data

      // 缓存用户信息到 localStorage
      if (import.meta.client) {
        try {
          localStorage.setItem('user_cache', JSON.stringify(response.data))
          localStorage.setItem('user_cache_timestamp', Date.now().toString())
        } catch {
          // 忽略错误
        }
      }

      return true
    } catch (error: unknown) {
      const apiError = error as ApiError

      if (apiError.response?.status === 401) {
        logout(silent)
        if (!silent) {
          toast.add({
            title: '登录已过期',
            description: '请重新登录',
            color: 'warning'
          })
        }
      }

      return false
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const response = await $fetch<{ code: number; msg?: string }>('/api/user/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: profileData
      })

      if (response.code !== 1) {
        throw new Error(response.msg || '更新失败')
      }

      toast.add({
        title: '更新成功',
        color: 'success'
      })
      return true
    } catch (error) {
      handleError('更新失败', error)
      return false
    }
  }

  const logout = (silent = false) => {
    user.value = null
    token.value = null
    userID.value = null

    if (import.meta.client) {
      localStorage.removeItem('user_cache')
      localStorage.removeItem('user_cache_timestamp')

      // 重置头像状态
      const avatarExists = useState<boolean | null>('avatar_exists')
      const avatarTimestamp = useState<number>('avatar_timestamp')
      avatarExists.value = null
      avatarTimestamp.value = Date.now()
    }

    if (!silent) {
      toast.add({
        title: '已退出登录',
        color: 'neutral'
      })
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isLoggedIn,
    login,
    register,
    resetPassword,
    fetchUserProfile,
    updateProfile,
    logout
  }
}
