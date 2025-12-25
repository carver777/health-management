import { test, expect } from '@playwright/test'

// sleep 测试
test.describe('睡眠数据页面测试', () => {
  const mockDate = '2025-12-25'
  const mockBedTime = '2025-12-24T23:00:00'
  const mockWakeTime = '2025-12-25T07:00:00'

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

    // Mock 睡眠记录列表接口
    await page.route(
      (url) => url.href.includes('/api/sleep-items'),
      async (route) => {
        const method = route.request().method()
        if (method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 1,
              message: 'success',
              data: {
                rows: [
                  {
                    sleepItemID: 1,
                    recordDate: mockDate,
                    bedTime: mockBedTime,
                    wakeTime: mockWakeTime
                  }
                ],
                total: 1
              }
            })
          })
        } else if (method === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 1,
              message: 'success',
              data: null
            })
          })
        } else if (method === 'PUT') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 1,
              message: 'success',
              data: null
            })
          })
        } else if (method === 'DELETE') {
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
      }
    )

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

    await page.goto('/sleep')
  })

  test('应该显示睡眠记录列表和统计信息', async ({ page }) => {
    await expect(page.getByRole('heading').filter({ hasText: '睡眠记录' })).toBeVisible()

    // 验证表格列头
    await expect(page.getByRole('columnheader', { name: '记录日期' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '入睡时间' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '起床时间' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '睡眠时长' })).toBeVisible()

    // 验证列表数据
    await expect(page.getByRole('cell', { name: /2025.*12.*25/ })).toBeVisible()
  })

  test('应该能够新增睡眠记录', async ({ page }) => {
    await page.getByRole('button', { name: '添加记录' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const spinbuttons = page.getByRole('spinbutton')

    // 入睡时间: 2025-12-25 22:00
    await spinbuttons.nth(0).click()
    await page.keyboard.type('2025')
    await spinbuttons.nth(1).click()
    await page.keyboard.type('12')
    await spinbuttons.nth(2).click()
    await page.keyboard.type('25')
    await spinbuttons.nth(3).click()
    await page.keyboard.type('22')
    await spinbuttons.nth(4).click()
    await page.keyboard.type('00')

    // 起床时间: 2025-12-26 07:00
    await spinbuttons.nth(5).click()
    await page.keyboard.type('2025')
    await spinbuttons.nth(6).click()
    await page.keyboard.type('12')
    await spinbuttons.nth(7).click()
    await page.keyboard.type('26')
    await spinbuttons.nth(8).click()
    await page.keyboard.type('07')
    await spinbuttons.nth(9).click()
    await page.keyboard.type('00')

    // 监听 POST 请求
    const createPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/sleep-items') && response.request().method() === 'POST'
    )

    await page.getByRole('button', { name: '确认记录' }).click()

    // 等待请求完成
    await createPromise

    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('新增记录时应该验证时间顺序', async ({ page }) => {
    await page.getByRole('button', { name: '添加记录' }).click()

    const spinbuttons = page.getByRole('spinbutton')

    // 入睡时间: 2025-12-25 22:00
    await spinbuttons.nth(0).click()
    await page.keyboard.type('2025')
    await spinbuttons.nth(1).click()
    await page.keyboard.type('12')
    await spinbuttons.nth(2).click()
    await page.keyboard.type('25')
    await spinbuttons.nth(3).click()
    await page.keyboard.type('22')
    await spinbuttons.nth(4).click()
    await page.keyboard.type('00')

    // 起床时间: 2025-12-25 21:00 (早于入睡时间)
    await spinbuttons.nth(5).click()
    await page.keyboard.type('2025')
    await spinbuttons.nth(6).click()
    await page.keyboard.type('12')
    await spinbuttons.nth(7).click()
    await page.keyboard.type('25')
    await spinbuttons.nth(8).click()
    await page.keyboard.type('21')
    await spinbuttons.nth(9).click()
    await page.keyboard.type('00')

    // 尝试提交
    await page.getByRole('button', { name: '确认记录' }).click()

    // 验证错误提示
    await expect(page.getByText('起床时间必须晚于入睡时间')).toBeVisible()
  })

  test('应该能够编辑睡眠记录', async ({ page }) => {
    // 等待列表加载
    await expect(page.getByRole('cell', { name: /2025.*12.*25/ })).toBeVisible()

    const editButton = page.getByRole('button', { name: '编辑' }).first()
    await editButton.click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // 监听 PUT 请求
    const updatePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/sleep-items') && response.request().method() === 'PUT'
    )

    await page.getByRole('button', { name: '确认更新' }).click()

    // 等待请求完成
    await updatePromise

    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('应该能够删除睡眠记录', async ({ page }) => {
    // 等待列表加载
    await expect(page.getByRole('cell', { name: /2025.*12.*25/ })).toBeVisible()

    const deleteButton = page.getByRole('button', { name: '删除' }).first()

    // 设置 dialog handler 处理确认框
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    // 监听 DELETE 请求
    const deletePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/sleep-items') && response.request().method() === 'DELETE'
    )

    await deleteButton.click()

    // 等待请求完成
    const response = await deletePromise
    expect(response.status()).toBe(200)
  })

  test('当没有数据时应该显示空状态', async ({ page }) => {
    // Mock 空数据
    await page.route(
      (url) => url.href.includes('/api/sleep-items') && url.searchParams.get('page') === '1',
      async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 1,
              message: 'success',
              data: {
                rows: [],
                total: 0
              }
            })
          })
        } else {
          await route.continue()
        }
      }
    )

    // 重新加载页面以触发新的 API 调用
    await page.reload()

    // 验证表格中显示无数据
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('cell', { name: /2025.*12.*25/ })).not.toBeVisible()
  })
})
