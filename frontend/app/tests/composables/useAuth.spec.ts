import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// Mock $fetch
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock useToast
const mockToastAdd = vi.fn()
mockNuxtImport('useToast', () => {
  return () => ({
    add: mockToastAdd
  })
})

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('初始状态', () => {
    it('应该有默认的初始状态', () => {
      const { user, isLoggedIn } = useAuth()

      expect(user.value).toBeNull()
      expect(isLoggedIn.value).toBe(false)
    })
  })

  describe('login', () => {
    it('登录成功时应该设置 token 并返回 true', async () => {
      mockFetch.mockResolvedValueOnce({
        code: 1,
        data: 'mock-jwt-token.eyJ1c2VySWQiOiIxMjMifQ.signature'
      })

      // Mock fetchUserProfile
      mockFetch.mockResolvedValueOnce({
        code: 1,
        data: { id: '123', email: 'test@example.com' }
      })

      // Mock HEAD request for avatar check
      mockFetch.mockResolvedValueOnce({})

      const { login } = useAuth()

      const result = await login({ email: 'test@example.com', password: '123456' })

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: '123456' }
      })
    })

    it('登录失败时应该返回 false 并显示错误提示', async () => {
      mockFetch.mockResolvedValueOnce({
        code: 0,
        msg: '邮箱或密码错误'
      })

      const { login } = useAuth()

      const result = await login({ email: 'test@example.com', password: 'wrong' })

      expect(result).toBe(false)
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '登录失败',
          color: 'error'
        })
      )
    })
  })

  describe('register', () => {
    it('注册成功时应该返回 true', async () => {
      mockFetch.mockResolvedValueOnce({
        code: 1,
        msg: '注册成功'
      })

      const { register } = useAuth()

      const result = await register({
        email: 'newuser@example.com',
        password: '123456',
        nickname: 'newuser'
      })

      expect(result).toBe(true)
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '注册成功',
          color: 'success'
        })
      )
    })

    it('注册失败时应该返回 false', async () => {
      mockFetch.mockResolvedValueOnce({
        code: 0,
        msg: '邮箱已存在'
      })

      const { register } = useAuth()

      const result = await register({
        email: 'existing@example.com',
        password: '123456'
      })

      expect(result).toBe(false)
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '注册失败',
          color: 'error'
        })
      )
    })
  })

  describe('logout', () => {
    it('退出登录时应该清除状态', () => {
      const { logout, user, isLoggedIn } = useAuth()

      logout()

      expect(user.value).toBeNull()
      expect(isLoggedIn.value).toBe(false)
    })

    it('静默退出时不应该显示提示', () => {
      const { logout } = useAuth()

      logout(true)

      expect(mockToastAdd).not.toHaveBeenCalled()
    })

    it('非静默退出时应该显示提示', () => {
      const { logout } = useAuth()

      logout(false)

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '已退出登录',
          color: 'neutral'
        })
      )
    })
  })
})
