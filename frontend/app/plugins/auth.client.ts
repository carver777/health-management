/**
 * 认证插件 - 在客户端初始化时验证 token 有效性
 */
export default defineNuxtPlugin(async () => {
  const { init } = useAuth()

  // 初始化用户认证状态
  await init()
})
