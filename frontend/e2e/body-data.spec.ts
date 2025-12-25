import { test, expect } from '@playwright/test'

test.describe('身体数据页面测试', () => {
  const mockBodyDataList = {
    code: 1,
    message: 'success',
    data: {
      rows: [
        {
          bodyMetricID: 1,
          recordDate: '2025-12-24',
          weightKG: 70.5,
          heightCM: 175,
          bmi: 23.0
        },
        {
          bodyMetricID: 2,
          recordDate: '2025-12-23',
          weightKG: 71.0,
          heightCM: 175,
          bmi: 23.2
        }
      ],
      total: 20
    }
  }

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

    // Mock 身体数据列表接口 (GET)
    await page.route('**/api/body-metrics?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBodyDataList)
      })
    })

    // Mock 新增接口 (POST)
    await page.route('**/api/body-metrics', async (route) => {
      if (route.request().method() === 'POST') {
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

    // Mock 更新接口 (PUT)
    await page.route('**/api/body-metrics/*', async (route) => {
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
    })

    // Mock 导出接口
    await page.route('**/api/body-metrics/export*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        headers: {
          'Content-Disposition': 'attachment; filename=body-metrics.csv'
        },
        body: 'Date,Weight,Height\n2025-12-24,70.5,175'
      })
    })

    // 设置 Cookie 跳过登录
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
    await page.waitForLoadState('networkidle')
  })

  test('页面加载与统计卡片显示', async ({ page }) => {
    // 验证页面标题
    await expect(page.locator('body')).toContainText('身体数据管理')

    // 验证统计卡片 (基于 mock 数据的第一条)
    await expect(page.getByText('当前体重（kg）')).toBeVisible()
    await expect(page.getByText('70.5', { exact: true })).toBeVisible() // 最新体重

    await expect(page.getByText('当前身高（cm）')).toBeVisible()
    await expect(page.getByText('175', { exact: true })).toBeVisible() // 最新身高

    await expect(page.getByText('BMI 指数')).toBeVisible()
    // BMI 计算: 70.5 / (1.75 * 1.75) ≈ 23.02
    await expect(page.getByText('23.0').first()).toBeVisible()
  })

  test('数据表格显示与分页', async ({ page }) => {
    // 验证表格头
    await expect(page.locator('body')).toContainText('记录日期')
    await expect(page.locator('body')).toContainText('体重 (kg)')
    await expect(page.locator('body')).toContainText('身高 (cm)')
    await expect(page.locator('body')).toContainText('BMI')
    await expect(page.locator('body')).toContainText('操作')

    // 验证数据行
    await expect(page.getByRole('cell', { name: /2025.*12.*24/ })).toBeVisible()
    await expect(page.getByText('70.5 kg')).toBeVisible()
    await expect(page.getByRole('cell', { name: /2025.*12.*23/ })).toBeVisible()
    await expect(page.getByText('71.0 kg')).toBeVisible()

    // 验证分页控件
    const pagination = page.getByRole('navigation').last()
    await expect(pagination).toBeVisible()
    // 验证包含页码 1
    await expect(pagination.getByText('1', { exact: true })).toBeVisible()
  })

  test('筛选功能', async ({ page }) => {
    let filterRequestMade = false
    page.on('request', (request) => {
      if (request.url().includes('/api/body-metrics') && request.method() === 'GET') {
        filterRequestMade = true
      }
    })

    await page.getByRole('button', { name: '查询' }).click()
    // 验证重新加载了数据
    expect(filterRequestMade).toBeTruthy()

    // 测试重置
    await page.getByRole('button', { name: '重置筛选' }).click()
    // 验证重置后重新加载
  })

  test('新增身体指标记录', async ({ page }) => {
    // Override mock for the existence check to return empty data
    await page.route('**/api/body-metrics?*startDate=*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 1,
          message: 'success',
          data: { rows: [], total: 0 }
        })
      })
    })

    await page.getByRole('button', { name: '添加记录' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('快速记录身体数据')).toBeVisible()

    // 填写表单
    // 使用 click + fill 确保焦点
    await page.getByPlaceholder('请输入体重').click()
    await page.getByPlaceholder('请输入体重').fill('72')

    await page.getByPlaceholder('请输入身高').click()
    await page.getByPlaceholder('请输入身高').fill('176')

    // 确保按钮可点击
    const submitButton = page.getByRole('button', { name: '确认记录' })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()

    // 拦截 POST 请求验证参数
    const createRequestPromise = page.waitForRequest(
      (request) => request.url().includes('/api/body-metrics') && request.method() === 'POST'
    )

    await submitButton.click()

    const request = await createRequestPromise
    const createRequestData = request.postDataJSON()

    // 验证请求发送
    expect(createRequestData).not.toBeNull()
    expect(createRequestData.weightKG).toBe(72.0)
    expect(createRequestData.heightCM).toBe(176)

    // 验证对话框关闭
    await expect(dialog).not.toBeVisible()
    // 验证成功提示 (Toast)
    await expect(page.getByText('记录成功').first()).toBeVisible()
  })

  test('表单验证', async ({ page }) => {
    await page.getByRole('button', { name: '添加记录' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // 清空输入框并尝试提交
    await page.getByPlaceholder('请输入体重').click()
    await page.getByPlaceholder('请输入体重').fill('')
    await page.getByPlaceholder('请输入身高').click()
    await page.getByPlaceholder('请输入身高').fill('')

    // 提交
    await page.getByRole('button', { name: '确认记录' }).click()

    // 尝试输入无效值
    await page.getByPlaceholder('请输入体重').fill('20') // < 30
    await page.getByRole('button', { name: '确认记录' }).click()
    await expect(page.getByText('体重应在 30-300 kg 之间')).toBeVisible()

    await page.getByPlaceholder('请输入体重').fill('70') // Valid
    await page.getByPlaceholder('请输入身高').fill('50') // < 100
    await page.getByRole('button', { name: '确认记录' }).click()
    await expect(page.getByText('身高应在 100-250 cm 之间')).toBeVisible()

    // 关闭对话框
    await page.keyboard.press('Escape')
  })

  test('编辑身体指标记录', async ({ page }) => {
    // 点击第一行的编辑按钮
    await page.getByRole('button', { name: '编辑' }).first().click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // 验证表单回显
    await expect(page.getByPlaceholder('请输入体重')).toHaveValue('70.5')
    await expect(page.getByPlaceholder('请输入身高')).toHaveValue('175')

    // 修改数据
    await page.getByPlaceholder('请输入体重').fill('69.5')

    // 拦截 PUT 请求
    const updateRequestPromise = page.waitForRequest(
      (request) => request.url().includes('/api/body-metrics/') && request.method() === 'PUT'
    )

    await page.getByRole('button', { name: '确认更新' }).click()

    const request = await updateRequestPromise
    const updateRequestData = request.postDataJSON()

    // 验证请求
    expect(updateRequestData).not.toBeNull()
    expect(updateRequestData.weightKG).toBe(69.5)

    await expect(dialog).not.toBeVisible()
    await expect(page.getByText('更新成功').first()).toBeVisible()
  })

  test('删除身体指标记录', async ({ page }) => {
    // 拦截 DELETE 请求
    const deleteRequestPromise = page.waitForRequest(
      (request) => request.url().includes('/api/body-metrics/') && request.method() === 'DELETE'
    )

    // 点击删除按钮
    await page.getByRole('button', { name: '删除' }).first().click()

    const request = await deleteRequestPromise

    // 验证请求发送
    expect(request.url()).toContain('/api/body-metrics/1')

    // 验证成功提示
    await expect(page.getByText('删除成功').first()).toBeVisible()
  })

  test('导出功能', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')

    // 修改 mock 导出接口以触发下载行为 (Content-Disposition)
    await page.route('**/api/body-metrics/export*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        headers: {
          'Content-Disposition': 'attachment; filename=body-metrics.csv'
        },
        body: 'Date,Weight,Height\n2025-12-24,70.5,175'
      })
    })

    await page.getByRole('button', { name: '导出 CSV' }).click()

    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('body-metrics.csv')
  })

  test('API 错误处理', async ({ page }) => {
    // 模拟加载失败
    await page.route('**/api/body-metrics?*', async (route) => {
      await route.abort('failed')
    })

    // 重新加载页面或触发加载
    await page.reload()

    // 验证错误提示
    await expect(page.getByText('加载数据失败').first()).toBeVisible({ timeout: 10000 })
  })

  test('空数据状态', async ({ page }) => {
    // Mock 空数据
    await page.route('**/api/body-metrics?*', async (route) => {
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

    await page.reload()

    // 验证表格显示无数据
    await expect(page.getByText('没有数据')).toBeVisible({ timeout: 10000 })

    // 验证统计卡片显示默认值
    await expect(page.getByText('当前体重（kg）')).toBeVisible()
    await expect(page.getByText('--', { exact: true }).first()).toBeVisible()
  })
})
