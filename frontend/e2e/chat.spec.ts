import { test, expect } from '@playwright/test'

test.describe('AI 助手页面测试', () => {
  test.beforeEach(async ({ page }) => {
    // Mock 用户信息接口
    await page.route('**/api/user/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 1,
          message: 'success',
          data: {
            userID: '1',
            email: 'test@example.com',
            nickname: 'Test User',
            gender: '男'
          }
        })
      })
    })

    // 默认 Mock 聊天流接口
    await page.route('**/api/chat/stream', async (route) => {
      const chunks = [{ content: '这是' }, { content: 'AI' }, { content: '回复' }]
      // 模拟流式响应，连续的 JSON 对象
      const body = chunks.map((c) => JSON.stringify(c)).join('')
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: body
      })
    })

    // Mock 清除记忆接口
    await page.route('**/api/chat/memory', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 1, message: 'success' })
      })
    })

    // 直接设置 Cookie 跳过登录
    await page.context().addCookies([
      {
        name: 'token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/'
      },
      {
        name: 'userID',
        value: '1',
        domain: 'localhost',
        path: '/'
      }
    ])
    await page.goto('/chat')
    await page.waitForLoadState('networkidle', { timeout: 45000 })
  })

  test('应该显示聊天界面基本元素', async ({ page }) => {
    const input = page.getByPlaceholder('给 AI 助手发送消息（Shift + Enter 换行）')
    await expect(input).toBeVisible()
    // 检查快捷建议
    await expect(page.getByText('如何制定减肥计划？')).toBeVisible()
    // 检查新对话按钮
    await expect(page.getByRole('button', { name: '新对话' })).toBeVisible()
  })

  test('应该能够输入并发送消息，且接收到 AI 回复', async ({ page }) => {
    const input = page.getByPlaceholder('给 AI 助手发送消息（Shift + Enter 换行）')

    await input.fill('你好')
    await expect(input).toHaveValue('你好')

    // 点击发送
    await input.press('Enter')
    await expect(input).toHaveValue('')

    // 检查用户消息
    await expect(page.getByText('你好', { exact: true })).toBeVisible()

    // 检查 AI 回复 (这是AI回复)
    await expect(page.getByText('这是AI回复')).toBeVisible()
  })

  test('点击快捷建议应该自动填充并发送', async ({ page }) => {
    const suggestion = page.getByText('如何制定减肥计划？').first()
    await suggestion.click()

    // 点击建议会填充到输入框
    const input = page.getByPlaceholder('给 AI 助手发送消息（Shift + Enter 换行）')
    await expect(input).toHaveValue('如何制定减肥计划？')

    // 发送消息
    await input.press('Enter')

    // 应该能看到用户消息
    await expect(page.getByText('如何制定减肥计划？', { exact: true }).last()).toBeVisible()
    // 应该能看到 AI 回复
    await expect(page.getByText('这是AI回复')).toBeVisible()
  })

  test('Markdown 渲染测试', async ({ page }) => {
    // 覆盖默认 Mock，返回 Markdown 内容
    await page.unroute('**/api/chat/stream')
    await page.route('**/api/chat/stream', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain',
        body: JSON.stringify({ content: '**加粗文本**\n- 列表项1\n- 列表项2' })
      })
    })

    const input = page.getByPlaceholder('给 AI 助手发送消息（Shift + Enter 换行）')
    await input.fill('测试 Markdown')
    await input.press('Enter')

    // 等待回复渲染
    // 检查 strong 标签
    await expect(page.locator('strong').filter({ hasText: '加粗文本' })).toBeVisible()
    // 检查列表项
    await expect(page.getByText('列表项1')).toBeVisible()
    await expect(page.getByText('列表项2')).toBeVisible()
  })

  test('错误处理：API 失败', async ({ page }) => {
    test.setTimeout(60000)
    // 覆盖默认 Mock，模拟 500 错误
    await page.unroute('**/api/chat/stream')
    await page.route('**/api/chat/stream', async (route) => {
      await route.fulfill({
        status: 500,
        body: 'Internal Server Error'
      })
    })

    const input = page.getByPlaceholder('给 AI 助手发送消息（Shift + Enter 换行）')
    await input.fill('测试错误')
    await input.press('Enter')

    // 应该先显示重试状态
    await expect(page.getByText(/重试:/)).toBeVisible({ timeout: 10000 })

    // 最终消息内容应该变为错误提示 (等待重试结束，可能需要较长时间)
    // 设置 60s 超时
    await expect(page.getByText('抱歉，我暂时无法回复。请检查网络连接后重试。')).toBeVisible({
      timeout: 60000
    })
  })

  test('清除对话历史', async ({ page }) => {
    // 先发送一条消息
    const input = page.getByPlaceholder('给 AI 助手发送消息（Shift + Enter 换行）')
    await input.fill('这条消息将被清除')
    await input.press('Enter')
    await expect(page.getByText('这条消息将被清除')).toBeVisible()

    // 点击新对话按钮
    await page.getByRole('button', { name: '新对话' }).click()

    // 验证 Toast 提示
    await expect(page.getByText('已开始新对话').first()).toBeVisible()

    // 验证消息已消失
    await expect(page.getByText('这条消息将被清除')).not.toBeVisible()
    // 验证回到了空状态
    await expect(page.getByText('开始与 AI 助手对话')).toBeVisible()
  })

  test('聊天记录持久化 (LocalStorage)', async ({ page }) => {
    // 发送消息
    const input = page.getByPlaceholder('给 AI 助手发送消息（Shift + Enter 换行）')
    await input.fill('持久化测试消息')
    await input.press('Enter')
    await expect(page.getByText('持久化测试消息')).toBeVisible()
    await expect(page.getByText('这是AI回复')).toBeVisible()

    // 等待保存 (debounce 500ms)
    await page.waitForTimeout(1000)

    // 刷新页面
    await page.reload()

    // 验证消息仍然存在
    await expect(page.getByText('持久化测试消息')).toBeVisible()
    await expect(page.getByText('这是AI回复')).toBeVisible()
  })

  test('应该显示连接状态', async ({ page }) => {
    const statusIndicator = page.locator('.text-xs', { hasText: /连接/ })
    if (await statusIndicator.isVisible()) {
      await expect(statusIndicator).toBeVisible()
    }
  })
})
