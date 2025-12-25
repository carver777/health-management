import { test, expect } from '@playwright/test'

test.describe('运动管理页面测试', () => {
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
      const url = new URL(route.request().url())
      const method = route.request().method()

      if (method === 'GET') {
        // 区分导出接口
        if (url.pathname.includes('/export')) {
          await route.fulfill({
            status: 200,
            contentType: 'text/csv',
            body: 'date,type,duration,calories\n2025-01-01,Run,30,300'
          })
          return
        }

        // 模拟分页和筛选
        const exerciseType = url.searchParams.get('exerciseType')

        let rows = [
          {
            exerciseItemID: 1,
            recordDate: new Date().toISOString().split('T')[0],
            exerciseType: '跑步',
            durationMinutes: 30,
            estimatedCaloriesBurned: 200
          },
          {
            exerciseItemID: 2,
            recordDate: '2023-01-01', // 旧数据
            exerciseType: '游泳',
            durationMinutes: 60,
            estimatedCaloriesBurned: 500
          }
        ]

        // 简单的筛选逻辑模拟
        if (exerciseType && exerciseType !== 'all') {
          rows = rows.filter((r) => r.exerciseType === exerciseType)
        }

        // 如果是请求今日数据 (startDate = endDate = today)
        const startDate = url.searchParams.get('startDate')
        const endDate = url.searchParams.get('endDate')
        const today = new Date().toISOString().split('T')[0]

        if (startDate === today && endDate === today) {
          rows = rows.filter((r) => r.recordDate === today)
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 1,
            message: 'success',
            data: {
              rows: rows,
              total: rows.length
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
        // 模拟删除失败的情况 (ID 为 999 时失败)
        if (url.pathname.endsWith('/999')) {
          await route.fulfill({ status: 500 })
        } else {
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
      } else {
        await route.fulfill({ status: 200 })
      }
    })

    // 直接设置 Cookie 跳过登录
    await page.context().addCookies([
      { name: 'token', value: 'mock-token', domain: 'localhost', path: '/' },
      { name: 'userID', value: '1', domain: 'localhost', path: '/' }
    ])

    await page.goto('/exercise')
  })

  test('应该显示运动记录列表和统计卡片', async ({ page }) => {
    // 验证统计卡片 - 使用更精确的选择器
    const caloriesCard = page.locator('.text-sm', { hasText: '今日消耗卡路里' }).locator('..')
    await expect(caloriesCard.locator('.text-3xl.font-bold')).toHaveText('200')

    const durationCard = page.locator('.text-sm', { hasText: '今日运动时长' }).locator('..')
    await expect(durationCard.locator('.text-3xl.font-bold')).toHaveText('30')

    const countCard = page.locator('.text-sm', { hasText: '今日运动次数' }).locator('..')
    await expect(countCard.locator('.text-3xl.font-bold')).toHaveText('1')

    // 验证表格
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('cell', { name: '跑步' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '游泳' })).toBeVisible()
  })

  test('应该能够筛选运动记录', async ({ page }) => {
    // 筛选运动类型
    await page.locator('#exercise-filter-type').click()
    await page.getByRole('option', { name: '跑步' }).click()
    await page.getByRole('button', { name: '查询' }).click()

    // 验证请求参数或结果
    await expect(page.getByRole('cell', { name: '跑步' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '游泳' })).not.toBeVisible()

    // 重置筛选
    await page.getByRole('button', { name: '重置筛选' }).click()
    await expect(page.getByRole('cell', { name: '游泳' })).toBeVisible()
  })

  test('应该能够导出运动记录', async ({ page }) => {
    const exportRequestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/api/exercise-items/export') && request.method() === 'GET'
    )

    await page.getByRole('button', { name: '导出 CSV' }).click()

    const request = await exportRequestPromise
    expect(request).toBeTruthy()
  })

  test('应该能够新增运动记录并验证表单逻辑', async ({ page }) => {
    await page.getByRole('button', { name: '添加记录' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // 验证必填 (尝试直接提交)
    await page.getByRole('button', { name: '确认记录' }).click()
    // 验证对话框仍然可见 (提交被阻止)
    await expect(page.getByRole('dialog')).toBeVisible()

    // 填写表单
    await page.getByText('选择运动类型').click()
    await page.getByRole('option', { name: '跑步' }).click()

    // 验证选择成功
    await expect(
      page.getByRole('dialog').locator('button').filter({ hasText: '跑步' })
    ).toBeVisible()

    // 验证体重加载 (等待体重加载完成)
    await expect(page.getByText(/基于体重.*kg 计算/)).toBeVisible()

    // 验证自动计算
    await page.waitForTimeout(500)
    await page.getByRole('spinbutton', { name: '运动时长' }).click()
    await page.getByRole('spinbutton', { name: '运动时长' }).fill('60')
    await page.getByRole('spinbutton', { name: '运动时长' }).blur()
    await expect(page.getByRole('spinbutton', { name: '运动时长' })).toHaveValue('60')

    // 确保计算完成 (非0)
    await expect(page.getByRole('spinbutton', { name: '消耗热量' })).not.toHaveValue('0')
    // 跑步(中等) MET ~9.8. Weight 70. 9.8 * 70 * 1 = 686.
    await expect(page.getByRole('spinbutton', { name: '消耗热量' })).toHaveValue('686')

    // 修改强度
    await page.getByRole('button', { name: '高强度' }).click()
    await expect(page.getByRole('spinbutton', { name: '消耗热量' })).toHaveValue('805')

    await page.getByRole('button', { name: '确认记录' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('应该能够编辑运动记录', async ({ page }) => {
    // 覆盖 PUT 请求 Mock
    await page.route('**/api/exercise-items/*', async (route) => {
      if (route.request().method() === 'PUT') {
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
        await route.fallback()
      }
    })

    // 针对第一条记录 "跑步"
    await page.getByRole('row', { name: '跑步' }).getByRole('button', { name: '编辑' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await expect(page.getByRole('spinbutton', { name: '运动时长' })).toHaveValue('30')
    await page.waitForTimeout(500)
    await page.getByRole('spinbutton', { name: '运动时长' }).click()
    await page.getByRole('spinbutton', { name: '运动时长' }).fill('45')
    await page.getByRole('spinbutton', { name: '运动时长' }).blur()
    await expect(page.getByRole('spinbutton', { name: '运动时长' })).toHaveValue('45')
    await expect(page.getByRole('spinbutton', { name: '消耗热量' })).not.toHaveValue('0')

    await expect(page.getByRole('button', { name: '确认更新' })).not.toBeDisabled()
    await page.getByRole('button', { name: '确认更新' }).click()
    await expect(page.getByText('运动记录更新成功！').first()).toBeVisible()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('应该能够删除运动记录', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept())
    await page.getByRole('row', { name: '跑步' }).getByRole('button', { name: '删除' }).click()
    // 验证成功提示
    await expect(page.getByText('删除成功').first()).toBeVisible()
  })

  test('应该处理删除失败的情况', async ({ page }) => {
    // 强制让删除接口失败
    await page.route('**/api/exercise-items/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 500 })
      } else {
        await route.continue()
      }
    })

    page.on('dialog', (dialog) => dialog.accept())
    await page.getByRole('row', { name: '跑步' }).getByRole('button', { name: '删除' }).click()
    await expect(page.getByText('删除失败').first()).toBeVisible()
  })
})
