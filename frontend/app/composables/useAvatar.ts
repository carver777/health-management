/**
 * 头像管理 - 避免重复的 404 请求
 */

// 全局 Promise 缓存，防止重复检查
let checkingPromise: Promise<boolean> | null = null

export const useAvatar = () => {
  const avatarExists = useState<boolean | null>('avatar_exists', () => null)
  const avatarTimestamp = useState<number>('avatar_timestamp', () => Date.now())

  /**
   * 检查头像是否存在
   */
  const checkAvatarExists = async () => {
    if (!import.meta.client) return false

    // 如果正在检查，返回已有的 Promise，否则直接返回结果
    if (checkingPromise) return checkingPromise

    if (avatarExists.value !== null) {
      return avatarExists.value
    }

    checkingPromise = (async () => {
      try {
        await $fetch('/api/user/avatar', { method: 'HEAD' })
        avatarExists.value = true
        return true
      } catch {
        avatarExists.value = false
        return false
      } finally {
        checkingPromise = null
      }
    })()

    return checkingPromise
  }

  /**
   * 获取头像 URL
   * 如果头像不存在，返回空字符串，避免 404 请求
   */
  const getAvatarUrl = () => {
    // 如果还没检查过且不在检查中，触发检查
    if (avatarExists.value === null && !checkingPromise && import.meta.client) {
      checkAvatarExists()
    }

    // 检查中或未检查完，返回空
    if (avatarExists.value === null) {
      return ''
    }

    // 如果确认不存在，返回空
    if (avatarExists.value === false) {
      return ''
    }

    // 头像存在，返回 URL
    return `/api/user/avatar?t=${avatarTimestamp.value}`
  }

  /**
   * 头像上传后调用，标记头像存在并刷新时间戳
   */
  const markAvatarUpdated = () => {
    avatarExists.value = true
    avatarTimestamp.value = Date.now()
  }

  /**
   * 重置状态
   */
  const resetAvatar = () => {
    avatarExists.value = null
    avatarTimestamp.value = Date.now()
  }

  return {
    avatarExists: readonly(avatarExists),
    getAvatarUrl,
    checkAvatarExists,
    markAvatarUpdated,
    resetAvatar
  }
}
