/**
 * 全局头像状态管理
 */

// 全局 Promise 缓存，防止重复检查
let checkingPromise: Promise<boolean> | null = null

export const useAvatar = () => {
  const avatarExists = useState<boolean | null>('avatar_exists', () => null)
  const avatarTimestamp = useState<number>('avatar_timestamp', () => Date.now())

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

  const getAvatarUrl = () => {
    if (avatarExists.value === null && !checkingPromise && import.meta.client) {
      checkAvatarExists()
    }

    if (avatarExists.value === null || avatarExists.value === false) {
      return ''
    }

    return `/api/user/avatar?t=${avatarTimestamp.value}`
  }

  /**
   * 头像上传后刷新头像状态和时间戳
   */
  const markAvatarUpdated = () => {
    avatarExists.value = true
    avatarTimestamp.value = Date.now()
  }

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
