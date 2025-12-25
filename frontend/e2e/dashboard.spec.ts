import { test, expect } from '@playwright/test'

test.describe('仪表板页面测试', () => {
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
                  recordDate: new Date().toISOString().split('T')[0],
                  weightKG: 70.0,
                  heightCM: 175,
                  bmi: 22.9
                }
              ],
              total: 1
            }
          })
        })
      } else {
        // Mock POST/PUT/DELETE
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

    // Mock 饮食记录接口
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
                  id: 1,
                  recordDate: new Date().toISOString().split('T')[0],
                  mealType: 'Breakfast',
                  foodName: 'Apple',
                  estimatedCalories: 100
                }
              ],
              total: 1
            }
          })
        })
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify({ code: 1, message: 'success' }) })
      }
    })

    // Mock 运动记录接口
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
                  id: 1,
                  recordDate: new Date().toISOString().split('T')[0],
                  exerciseType: 'Running',
                  durationMinutes: 30,
                  estimatedCaloriesBurned: 300
                }
              ],
              total: 1
            }
          })
        })
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify({ code: 1, message: 'success' }) })
      }
    })

    // Mock 睡眠记录接口
    await page.route('**/api/sleep-items*', async (route) => {
      if (route.request().method() === 'GET') {
        const today = new Date().toISOString().split('T')[0]
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
                  recordDate: today,
                  bedTime: `${today}T00:00:00`,
                  wakeTime: `${today}T08:00:00`,
                  quality: 'Good'
                }
              ],
              total: 1
            }
          })
        })
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify({ code: 1, message: 'success' }) })
      }
    })

    // 直接设置 Cookie 跳过登录
    await page.context().addCookies([
      {
        name: 'token',
        value: 'mock-token',
        url: 'http://localhost:3000'
      },
      {
        name: 'userID',
        value: '1',
        url: 'http://localhost:3000'
      }
    ])

    await page.goto('/dashboard')
    await page.waitForURL('/dashboard')

    // 确认页面加载完成
    // 增加超时时间，防止首次加载慢
    await expect(page.getByRole('heading', { name: '数据概览' })).toBeVisible({ timeout: 30000 })

    // 等待侧边栏加载
    await expect(page.getByText('身体数据')).toBeVisible({ timeout: 30000 })
  })

  test('应该显示健康数据概览卡片', async ({ page }) => {
    await expect(page.getByText('当前体重')).toBeVisible()
    await expect(page.getByText('今日摄入')).toBeVisible()
    await expect(page.getByText('今日消耗')).toBeVisible()
    await expect(page.getByText('今日睡眠')).toBeVisible()
  })

  test('应该显示正确的统计数据', async ({ page }) => {
    // Weight: 70.0
    await expect(page.locator('.text-2xl.font-bold').nth(0)).toHaveText('70.0')
    // Intake: 100
    await expect(page.locator('.text-2xl.font-bold').nth(1)).toHaveText('100')
    // Burned: 300
    await expect(page.locator('.text-2xl.font-bold').nth(2)).toHaveText('300')
    // Sleep: 8.0 (22:00 to 06:00 is 8 hours)
    await expect(page.locator('.text-2xl.font-bold').nth(3)).toHaveText('8.0')
  })

  test('应该能够打开快速记录对话框', async ({ page }) => {
    await expect(page.getByText('DEBUG MARKER')).toBeVisible()
    await page.getByText('Fallback 记录体重').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: '快速记录身体数据' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    await page.getByRole('button', { name: '记录饮食' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: '快速记录饮食' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()

    await page.getByRole('button', { name: '记录运动' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: '快速记录运动' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('应该能够提交身体数据', async ({ page }) => {
    await page.getByText('Fallback 记录体重').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByPlaceholder('请输入身高').fill('180')
    await page.getByPlaceholder('请输入体重').fill('75')

    const requestPromise = page.waitForRequest(
      (request) => request.url().includes('/api/body-metrics') && request.method() === 'POST'
    )

    await page.getByRole('button', { name: '确认记录' }).click()

    const request = await requestPromise
    const postData = request.postDataJSON()
    expect(postData).toMatchObject({
      heightCM: 180,
      weightKG: 75
    })

    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('应该能够提交饮食数据', async ({ page }) => {
    await page.getByRole('button', { name: '记录饮食' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByPlaceholder('请输入食物名称').fill('Banana')
    await page.getByPlaceholder('热量值').fill('150')

    const requestPromise = page.waitForRequest(
      (request) => request.url().includes('/api/diet-items') && request.method() === 'POST'
    )

    await page.getByRole('button', { name: '确认记录' }).click()

    const request = await requestPromise
    const postData = request.postDataJSON()
    expect(postData).toMatchObject({
      foodName: 'Banana',
      estimatedCalories: 150
    })

    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('应该能够提交运动数据', async ({ page }) => {
    await page.getByRole('button', { name: '记录运动' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // 选择运动类型 - USelectMenu 触发器
    // 使用更宽容的选择器，查找包含占位符文本的按钮或元素
    const selectTrigger = page.locator('button').filter({ hasText: '选择运动类型' }).first()
    // 如果找不到按钮，尝试直接找文本
    if ((await selectTrigger.count()) === 0) {
      await page.getByText('选择运动类型').click()
    } else {
      await selectTrigger.click()
    }

    // 等待选项出现
    // 尝试在搜索框中输入并回车
    const searchInput = page.getByPlaceholder('输入运动类型')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('跑步')
    await page.keyboard.press('Enter')

    // 验证是否选中
    await expect(page.locator('button').filter({ hasText: '跑步' })).toBeVisible()

    const inputs = page.locator('input[type="number"]')

    // 强制设置值
    await inputs.nth(0).evaluate((el: HTMLInputElement) => {
      el.value = '45'
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    })

    await inputs.nth(1).evaluate((el: HTMLInputElement) => {
      el.value = '400'
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    })

    const requestPromise = page.waitForRequest(
      (request) => request.url().includes('/api/exercise-items') && request.method() === 'POST'
    )

    await page.getByRole('button', { name: '确认记录' }).click()

    const request = await requestPromise
    const postData = request.postDataJSON()
    expect(postData).toMatchObject({
      durationMinutes: 45,
      estimatedCaloriesBurned: 400
    })

    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('应该渲染体重和卡路里图表', async ({ page }) => {
    await expect(page.locator('canvas').first()).toBeVisible()
    await expect(page.locator('canvas').nth(1)).toBeVisible()
  })

  test('应该能够切换图表时间段', async ({ page }) => {
    // 切换卡路里图表到 30 天
    // 注意：loadCaloriesData 中 pageSize 固定为 1000，通过 startDate 控制范围
    const caloriesRequestPromise = page.waitForRequest((request) =>
      request.url().includes('/api/diet-items')
    )

    const caloriesCard = page.locator('.space-y-3', { hasText: '卡路里趋势' })
    await caloriesCard.getByRole('button', { name: '30 天' }).click({ force: true })

    await caloriesRequestPromise

    // 切换体重图表到 90 天
    const weightRequestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/api/body-metrics') && request.url().includes('pageSize=90')
    )

    const weightCard = page.locator('.space-y-3', { hasText: '体重趋势' })
    await weightCard.getByRole('button', { name: '90 天' }).click({ force: true })

    await weightRequestPromise
  })

  test('应该能够导航到各个功能页面', async ({ page }) => {
    await page.getByRole('link', { name: '身体数据' }).click()
    await expect(page).toHaveURL('/body-data')
    await page.goto('/dashboard')

    await page.getByRole('link', { name: '饮食管理' }).click()
    await expect(page).toHaveURL('/diet')
    await page.goto('/dashboard')

    await page.getByRole('link', { name: '运动管理' }).click()
    await expect(page).toHaveURL('/exercise')
    await page.goto('/dashboard')

    await page.getByRole('link', { name: '睡眠管理' }).click()
    await expect(page).toHaveURL('/sleep')
  })

  test('应该显示健康目标', async ({ page }) => {
    // 设置健康目标 Cookie
    await page.context().addCookies([
      {
        name: 'healthGoals',
        value: JSON.stringify({
          targetWeight: 65,
          dailyCaloriesIntake: 1800,
          dailyCaloriesBurn: 500,
          dailySleepHours: 7.5
        }),
        url: 'http://localhost:3000'
      }
    ])

    await page.reload()
    // 等待页面加载
    await expect(page.getByRole('link', { name: '身体数据' })).toBeVisible()

    await expect(page.getByText('目标: 65 kg')).toBeVisible()
    await expect(page.getByText('目标: 1800 kcal')).toBeVisible()
    await expect(page.getByText('目标: 500 kcal')).toBeVisible()
    await expect(page.getByText('目标: 7.5 小时')).toBeVisible()
  })

  test('应该处理API错误', async ({ page }) => {
    // Mock API 失败
    await page.route('**/api/body-metrics*', async (route) => {
      await route.fulfill({ status: 500 })
    })

    await page.reload()
    // 验证错误提示
    await expect(page.getByText('加载数据失败').first()).toBeVisible()
  })

  test('应该正确处理空数据', async ({ page }) => {
    const emptyResponse = {
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 1,
        message: 'success',
        data: { rows: [], total: 0 }
      })
    }

    // 覆盖所有数据接口返回空
    await page.route('**/api/body-metrics*', async (route) => route.fulfill(emptyResponse))
    await page.route('**/api/diet-items*', async (route) => route.fulfill(emptyResponse))
    await page.route('**/api/exercise-items*', async (route) => route.fulfill(emptyResponse))
    await page.route('**/api/sleep-items*', async (route) => route.fulfill(emptyResponse))

    await page.reload()
    await expect(page.getByRole('link', { name: '身体数据' })).toBeVisible()

    // 检查统计数据是否为 0
    // Weight: 0.0
    await expect(page.locator('.text-2xl.font-bold').nth(0)).toHaveText('0.0')
    // Intake: 0
    await expect(page.locator('.text-2xl.font-bold').nth(1)).toHaveText('0')
    // Burned: 0
    await expect(page.locator('.text-2xl.font-bold').nth(2)).toHaveText('0')
    // Sleep: 0.0
    await expect(page.locator('.text-2xl.font-bold').nth(3)).toHaveText('0.0')
  })

  test('提交数据后应该刷新统计', async ({ page }) => {
    // 初始状态：体重 70
    // 我们需要拦截 GET 请求，第一次返回 70，第二次返回 75
    // 注意：页面加载时会请求一次，提交后刷新会请求一次
    let getCount = 0
    await page.route('**/api/body-metrics*', async (route) => {
      const url = route.request().url()
      if (route.request().method() === 'GET') {
        // 区分是获取统计数据(pageSize=1)还是图表数据(pageSize=7/30/90)
        // 这里我们只关心统计数据的刷新
        if (url.includes('pageSize=1') && !url.includes('pageSize=1000')) {
          // pageSize=1 is for stats
          getCount++
          const weight = getCount > 1 ? 75.0 : 70.0
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
                    recordDate: new Date().toISOString().split('T')[0],
                    weightKG: weight,
                    heightCM: 175,
                    bmi: 22.9
                  }
                ],
                total: 1
              }
            })
          })
          return
        }

        // 其他 GET 请求 (图表数据等) 返回默认值
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
                  recordDate: new Date().toISOString().split('T')[0],
                  weightKG: 70.0,
                  heightCM: 175,
                  bmi: 22.9
                }
              ],
              total: 1
            }
          })
        })
      } else {
        // POST request
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ code: 1, message: 'success', data: null })
        })
      }
    })

    await page.reload()
    await expect(page.locator('.text-2xl.font-bold').nth(0)).toHaveText('70.0')

    // 打开对话框并提交
    await page.getByText('Fallback 记录体重').click()
    await page.getByPlaceholder('请输入身高').fill('175')
    await page.getByPlaceholder('请输入体重').fill('75')
    await page.getByRole('button', { name: '确认记录' }).click()

    // 等待对话框关闭
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // 验证数据更新
    await expect(page.locator('.text-2xl.font-bold').nth(0)).toHaveText('75.0')
  })
})
