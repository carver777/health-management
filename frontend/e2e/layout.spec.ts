import { test, expect } from '@playwright/test'

test.describe('全局布局与导航测试', () => {
  test.beforeEach(async ({ page }) => {
    // Mock 登录接口
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 1,
          message: 'success',
          data: 'mock-token'
        })
      })
    })

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

    // Mock 身体数据接口 (用于获取体重)
    await page.route('**/api/body-metrics*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 1,
          message: 'success',
          data: {
            rows: [{ weightKG: 70 }],
            total: 1
          }
        })
      })
    })

    // Mock 运动记录列表接口
    await page.route('**/api/exercise-items*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 1,
            message: 'success',
            data: {
              rows: [
                {
                  exerciseItemID: 1,
                  recordDate: new Date().toISOString().split('T')[0],
                  exerciseType: '跑步',
                  durationMinutes: 30,
                  estimatedCaloriesBurned: 200
                }
              ],
              total: 1
            }
          })
        })
      } else if (route.request().method() === 'POST') {
        // Mock 新增
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 1,
            message: 'success',
            data: null
          })
        })
      } else if (route.request().method() === 'PUT') {
        // Mock 更新
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 1,
            message: 'success',
            data: null
          })
        })
      } else if (route.request().method() === 'DELETE') {
        // Mock 删除
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 1,
            message: 'success',
            data: null
          })
        })
      } else {
        await route.continue()
      }
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

    await page.goto('/dashboard')
    await page.waitForURL('/dashboard')
  })

  test('侧边栏导航跳转正确性', async ({ page }) => {
    // 验证各个导航链接
    const links = [
      { name: '数据概览', url: '/dashboard' },
      { name: '身体数据', url: '/body-data' },
      { name: '饮食管理', url: '/diet' },
      { name: '运动管理', url: '/exercise' },
      { name: '睡眠管理', url: '/sleep' },
      { name: '健康咨询', url: '/chat' }
    ]

    for (const link of links) {
      await page.getByRole('link', { name: link.name }).click()
      await expect(page).toHaveURL(link.url)
    }
  })

  test('用户下拉菜单功能', async ({ page }) => {
    // 打开下拉菜单
    await page.getByRole('button').filter({ hasText: '账户操作' }).click()

    // 验证菜单项存在
    await expect(page.getByRole('menuitem', { name: '个人资料' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: '退出登录' })).toBeVisible()

    // 测试跳转个人资料
    await page.getByRole('menuitem', { name: '个人资料' }).click()
    await expect(page).toHaveURL('/profile')
  })

  test('退出登录功能', async ({ page }) => {
    // 打开下拉菜单
    await page.getByRole('button').filter({ hasText: '账户操作' }).click()

    // 点击退出登录
    await page.getByRole('menuitem', { name: '退出登录' }).click()

    // 验证跳转到登录页
    await expect(page).toHaveURL('/login')
  })

  test('AI助手悬浮按钮功能', async ({ page }) => {
    // 验证按钮存在 (通过 class 定位)
    const aiBtn = page.locator('button.fixed.right-6.bottom-6')
    await expect(aiBtn).toBeVisible()

    // 点击跳转
    await aiBtn.click()
    await expect(page).toHaveURL('/chat')

    // 在 chat 页面应该不可见
    await expect(aiBtn).not.toBeVisible()
  })

  test('移动端侧边栏响应式', async ({ page }) => {
    // 设置为移动端尺寸
    await page.setViewportSize({ width: 375, height: 812 })

    // 验证汉堡菜单可见
    const menuBtn = page.locator('button.lg\\:hidden')
    await expect(menuBtn).toBeVisible()

    // 验证侧边栏链接默认不可见
    const dashboardLink = page.getByRole('link', { name: '数据概览' })
    await expect(dashboardLink).not.toBeVisible()

    // 点击打开侧边栏
    await menuBtn.click()

    // 验证侧边栏链接可见
    await expect(dashboardLink).toBeVisible()
  })

  test('登录页使用空白布局', async ({ page, context }) => {
    // 清除 Cookie 以模拟未登录状态
    await context.clearCookies()

    await page.goto('/login')
    await page.waitForURL('/login')

    // 验证侧边栏不存在
    await expect(page.getByRole('link', { name: '数据概览' })).not.toBeVisible()

    // 验证 AI 按钮不存在
    await expect(page.locator('button.fixed.right-6.bottom-6')).not.toBeVisible()
  })
})
