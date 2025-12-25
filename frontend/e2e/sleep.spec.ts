import { test, expect } from '@playwright/test'

// sleep 测试
test.describe('睡眠数据页面测试', () => {
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
                    sleepItemID: 1,
                    recordDate: '2025-12-21',
                    bedTime: '2025-12-20T22:00:00',
                    wakeTime: '2025-12-21T07:00:00'
                  }
                ],
                total: 1
              }
            })
          })
        } else if (route.request().method() === 'POST') {
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

  test('应该显示睡眠记录列表', async ({ page }) => {
    await expect(page.getByRole('heading').filter({ hasText: '睡眠记录' })).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '记录日期' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '入睡时间' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '起床时间' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '睡眠时长' })).toBeVisible()
  })

  test('应该能够新增睡眠记录', async ({ page }) => {
    await page.getByRole('button', { name: '添加记录' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await expect(page.getByRole('spinbutton').first()).toBeVisible()

    const spinbuttons = page.getByRole('spinbutton')

    // 入睡时间
    await spinbuttons.nth(0).click()
    await page.keyboard.type('2025')
    await spinbuttons.nth(1).click()
    await page.keyboard.type('12')
    await spinbuttons.nth(2).click()
    await page.keyboard.type('20')
    await spinbuttons.nth(3).click()
    await page.keyboard.type('22')
    await spinbuttons.nth(4).click()
    await page.keyboard.type('00')

    // 起床时间
    await spinbuttons.nth(5).click()
    await page.keyboard.type('2025')
    await spinbuttons.nth(6).click()
    await page.keyboard.type('12')
    await spinbuttons.nth(7).click()
    await page.keyboard.type('21')
    await spinbuttons.nth(8).click()
    await page.keyboard.type('07')
    await spinbuttons.nth(9).click()
    await page.keyboard.type('00')

    // 检查是否有验证错误
    await expect(page.getByText('请同时填写入睡时间和起床时间')).not.toBeVisible()

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

  test('应该能够编辑睡眠记录', async ({ page }) => {
    // 等待列表加载
    await expect(page.getByRole('cell', { name: /2025.*12.*21/ })).toBeVisible()

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

    // 检查是否有错误提示
    await expect(page.getByText('更新失败')).not.toBeVisible()
    await expect(page.getByText('请先登录')).not.toBeVisible()

    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('应该能够删除睡眠记录', async ({ page }) => {
    // 等待列表加载
    await expect(page.getByRole('cell', { name: /2025.*12.*21/ })).toBeVisible()

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

    // 检查是否有错误提示
    await expect(page.getByText('删除失败')).not.toBeVisible()
  })
})
