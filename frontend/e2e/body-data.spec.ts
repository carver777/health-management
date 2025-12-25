import { test, expect } from '@playwright/test'

test.describe('身体数据页面测试', () => {
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

    // Mock 身体数据列表接口
    await page.route('**/api/body-metrics*', async (route) => {
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
                  id: 1,
                  recordDate: '2025-12-20',
                  weightKG: 70.0,
                  heightCM: 175,
                  bmi: 22.9
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

    await page.goto('/body-data')
  })

  test('应该显示身体指标列表', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '数据记录' })).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()

    // 验证数据是否加载成功
    await expect(page.getByText(/2025.*12.*20/)).toBeVisible()
    await expect(page.getByText('70.0 kg')).toBeVisible()
    await expect(page.getByText('175 cm')).toBeVisible()

    // 检查表头
    const table = page.getByRole('table')
    await expect(table.getByText('记录日期')).toBeVisible()
    await expect(table.getByText('体重 (kg)')).toBeVisible()
    await expect(table.getByText('身高 (cm)')).toBeVisible()
    await expect(table.getByText('BMI')).toBeVisible()
  })

  test('应该能够新增身体指标记录', async ({ page }) => {
    await page.getByRole('button', { name: '添加记录' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // 填写表单
    await page.getByLabel('体重').fill('70.5')
    await page.getByLabel('身高').fill('175')
    await page.getByRole('button', { name: '确认记录' }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('应该能够编辑记录', async ({ page }) => {
    const editButton = page.getByRole('button', { name: '编辑' }).first()
    if (await editButton.isVisible()) {
      await editButton.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.getByLabel('体重').fill('71.0')
      await page.getByRole('button', { name: '确认更新' }).click()
      await expect(page.getByRole('dialog')).not.toBeVisible()
    }
  })

  test('应该能够删除记录', async ({ page }) => {
    const deleteButton = page.getByRole('button', { name: '删除' }).first()
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
    }
  })
})
