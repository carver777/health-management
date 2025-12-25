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
    // 增加超时时间，确保页面渲染完成
    await expect(page.getByText('没有数据')).toBeVisible({ timeout: 10000 })
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

    // 验证错误提示 (可能是 Toast 消息)
    // Nuxt UI Toast 通常在 DOM 中，但可能需要时间出现
    await expect(page.getByText('Internal Server Error').first()).toBeVisible()
  })

  test('表单非法输入验证反馈 (负数)', async ({ page }) => {
    await page.goto('/body-data')
    await page.getByRole('button', { name: '添加记录' }).click()

    // 输入非法数据 (例如负数体重)
    const weightInput = page.getByLabel('体重', { exact: true })
    await weightInput.fill('-50')

    // 触发验证
    await weightInput.blur()

    // 尝试提交
    await page.getByRole('button', { name: '确认记录' }).click()

    // 验证错误提示
    await expect(page.getByText('体重应在 30-300 kg 之间').first()).toBeVisible()

    // 验证对话框仍然可见
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('表单非法输入验证反馈 (超大数值)', async ({ page }) => {
    await page.goto('/body-data')
    await page.getByRole('button', { name: '添加记录' }).click()

    const weightInput = page.getByLabel('体重', { exact: true })
    // 输入超过最大值的数值
    await weightInput.fill('301')
    await weightInput.blur()

    await page.getByRole('button', { name: '确认记录' }).click()

    // 验证错误提示
    await expect(page.getByText('体重应在 30-300 kg 之间').first()).toBeVisible()
  })

  test('会话过期自动跳转 (401 Handling)', async ({ page }) => {
    // 覆盖之前的 mock，模拟 401
    await page.route('**/api/body-metrics*', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 401,
          message: 'Unauthorized'
        })
      })
    })

    await page.route('**/api/user/profile', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 401,
          message: 'Unauthorized'
        })
      })
    })

    await page.goto('/body-data')

    // 验证是否跳转到登录页
    await expect(page).toHaveURL(/\/login/)
  })

  test('特殊字符与 XSS 防护验证', async ({ page }) => {
    // Mock 饮食数据
    await page.route('**/api/diet-items*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 1,
            message: 'success',
            data: { rows: [], total: 0 }
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
      }
    })

    await page.goto('/diet')
    await page.getByRole('button', { name: '添加记录' }).click()

    // 输入包含特殊字符的内容
    const xssContent = '<script>alert("xss")</script>'
    await page.getByPlaceholder('请输入食物名称').fill(xssContent)
    await page.getByLabel('估计热量').fill('100')

    // 提交
    await page.getByRole('button', { name: '确认记录' }).click()

    // 重新 mock 列表返回包含 XSS 的数据
    await page.route('**/api/diet-items*', async (route) => {
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
                  dietItemID: 1,
                  recordDate: new Date().toISOString().split('T')[0],
                  mealType: '早餐',
                  foodName: xssContent,
                  estimatedCalories: 100
                }
              ],
              total: 1
            }
          })
        })
      }
    })

    // 刷新页面查看列表
    await page.reload()

    // 验证内容被作为文本显示，而不是执行脚本
    await expect(page.getByText(xssContent)).toBeVisible()
  })
})
