/**
 * 用户认证状态管理
 */

export const useAuth = () => {
  const isInsecure = useRuntimeConfig().public.INSECURE_COOKIE === 'true'
  const cookieSecure = import.meta.env.PROD && !isInsecure

  const user = useState<User | null>('user', () => null)
  const token = useCookie<string | null>('token', {
    maxAge: 60 * 60 * 24 * 7, // 7 天
    path: '/',
    sameSite: 'lax',
    secure: cookieSecure,
    default: () => null
  })

  const userID = useCookie<string | null>('userID', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
    secure: cookieSecure,
    default: () => null
  })

  const isLoggedIn = computed(() => !!token.value)
  const toast = import.meta.client ? useToast() : { add: () => {} }

  // 解析 JWT token 获取 userID
  const parseJwt = (tokenStr: string) => {
    try {
      const base64Url = tokenStr.split('.')[1]
      if (!base64Url) return null
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(base64))
      return payload
    } catch {
      return null
    }
  }

  // 登录
  const login = async (loginData: LoginRequest) => {
    try {
      const response = await $fetch<{ code: number; data?: string; msg?: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: loginData
        }
      )

      // 适配后端返回格式：code: 1 表示成功，code: 0 表示失败
      if (response.code === 1 && response.data) {
        token.value = response.data

        const payload = parseJwt(response.data)
        if (payload) {
          const userIDFromToken =
            payload.userId || payload.userID || payload.sub || payload.id || payload.user_id
          if (userIDFromToken) {
            userID.value = userIDFromToken
          }
        }

        toast.add({
          title: '登录成功',
          color: 'success'
        })

        await fetchUserProfile()

        return true
      } else {
        // 后端返回失败信息
        throw new Error(response.msg || '登录失败')
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      toast.add({
        title: '登录失败',
        description: apiError.message || apiError.response?.data?.message || '请稍后重试',
        color: 'error'
      })
      return false
    }
  }

  // 注册
  const register = async (registerData: RegisterRequest) => {
    try {
      const response = await $fetch<{ code: number; msg?: string }>('/api/auth/register', {
        method: 'POST',
        body: registerData
      })

      // 适配后端返回格式：code: 1 表示成功，code: 0 表示失败
      if (response.code === 1) {
        toast.add({
          title: '注册成功',
          description: '请登录',
          color: 'success'
        })
        return true
      } else {
        throw new Error(response.msg || '注册失败')
      }
    } catch (error: unknown) {
      const apiError = error as ApiError

      toast.add({
        title: '注册失败',
        description: apiError.message || apiError.response?.data?.message || '请稍后重试',
        color: 'error'
      })
      return false
    }
  }

  // 重置密码
  const resetPassword = async (payload: PasswordResetRequest) => {
    try {
      const response = await $fetch<{ code: number; msg?: string }>('/api/auth/password/reset', {
        method: 'POST',
        body: payload
      })

      if (response.code === 1) {
        toast.add({
          title: '密码已更新',
          description: '请使用新密码登录',
          color: 'success'
        })
        return true
      } else {
        throw new Error(response.msg || '重置密码失败')
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      toast.add({
        title: '重置密码失败',
        description: apiError.message || apiError.response?.data?.message || '请稍后重试',
        color: 'error'
      })
      return false
    }
  }

  // 获取用户信息
  const fetchUserProfile = async (silent = false) => {
    if (!token.value) {
      return false
    }

    try {
      const response = await $fetch<{ code: number; data: User; msg?: string }>(
        '/api/user/profile',
        {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        }
      )

      if (response.code === 1 && response.data) {
        user.value = response.data

        // 缓存用户信息到 localStorage
        if (import.meta.client) {
          try {
            localStorage.setItem('user_cache', JSON.stringify(response.data))
            localStorage.setItem('user_cache_timestamp', Date.now().toString())
          } catch {
            // 忽略存储错误
          }
        }

        return true
      } else {
        throw new Error(response.msg || '获取用户信息失败')
      }
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
        return false
      }

      return false
    }
  }

  // 更新用户信息
  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const response = await $fetch<{ code: number; msg?: string }>('/api/user/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: profileData
      })

      if (response.code === 1) {
        toast.add({
          title: '更新成功',
          color: 'success'
        })
        return true
      } else {
        throw new Error(response.msg || '更新失败')
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      toast.add({
        title: '更新失败',
        description: apiError.message || apiError.response?.data?.message || '请稍后重试',
        color: 'error'
      })
      return false
    }
  }

  // 退出登录
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
