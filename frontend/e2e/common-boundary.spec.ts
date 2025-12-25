import { test, expect } from '@playwright/test'

test.describe('通用功能与边界测试', () => {
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
  })

  test('数据导出功能验证 (CSV 格式与内容)', async ({ page }) => {
    // 导航到身体数据页面
    await page.goto('/body-data')

    // Mock 导出接口
    await page.route('**/body-metrics/export*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: `Date,Weight,Height,BMI\n${new Date().toISOString().split('T')[0]},70.5,175,23.0`,
        headers: {
          'Content-Disposition': 'attachment; filename="body-metrics.csv"'
        }
      })
    })

    // 等待下载事件
    const downloadPromise = page.waitForEvent('download')

    // 点击导出按钮
    await page.getByRole('button', { name: '导出 CSV' }).click()

    const download = await downloadPromise

    // 验证文件名
    expect(download.suggestedFilename()).toContain('.csv')
  })

  test('列表空状态展示 (Empty State)', async ({ page }) => {
    // Mock 空数据响应
    await page.route(/.*\/api\/body-metrics.*/, async (route) => {
      // 排除 export 接口
      if (route.request().url().includes('export')) {
        return route.continue()
      }

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
    })

    await page.goto('/body-data')

    // 验证显示空状态提示
    await expect(page.getByText('没有数据')).toBeVisible()
  })

  test('网络错误与异常处理提示', async ({ page }) => {
    await page.goto('/body-data')

    // Mock 500 错误
    await page.route('**/api/body-metrics', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 500,
            message: 'Internal Server Error'
          })
        })
      } else {
        await route.continue()
      }
    })

    // 尝试添加记录
    await page.getByRole('button', { name: '添加记录' }).click()
    // 填写表单
    await page.getByLabel('体重', { exact: true }).fill('70')
    await page.getByLabel('身高', { exact: true }).fill('175')
    // 提交
    await page.getByRole('button', { name: '确认记录' }).click()

    // 验证错误提示
    await expect(page.getByText('Internal Server Error').first()).toBeVisible()
  })

  test('表单非法输入验证反馈', async ({ page }) => {
    await page.goto('/body-data')
    await page.getByRole('button', { name: '添加记录' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // 输入非法数据 (例如负数体重)
    const weightInput = page.getByLabel('体重', { exact: true })
    await weightInput.clear()
    await weightInput.fill('-50')

    // 触发验证
    await weightInput.blur()

    // 尝试提交
    await page.getByRole('button', { name: '确认记录' }).click()

    // 验证错误提示
    await expect(page.getByText('体重应在 30-300 kg 之间')).toBeVisible({ timeout: 5000 })

    // 验证对话框仍然可见
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})
