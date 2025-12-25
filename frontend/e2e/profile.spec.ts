import { test, expect } from '@playwright/test'

test.describe('个人资料页面测试', () => {
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

    // Mock 用户信息接口 (GET and PUT)
    await page.route('**/api/user/profile', async (route) => {
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
              gender: '男',
              dateOfBirth: '1990-01-01',
              registrationDate: '2023-01-01'
            }
          })
        })
      }
    })

    // Mock 头像上传接口
    await page.route('**/api/user/avatar', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 1,
          msg: 'success',
          data: 'new-avatar-url'
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
            total: 5 // 假设有5条记录
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
              total: 8
            }
          })
        })
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
    })

    // Mock 饮食记录接口
    await page.route('**/api/diet-items*', async (route) => {
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
                itemName: '苹果',
                calories: 50,
                estimatedCalories: 50
              }
            ],
            total: 12
          }
        })
      })
    })

    // Mock 睡眠记录接口
    await page.route('**/api/sleep-items*', async (route) => {
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
                bedTime: new Date(new Date().setHours(22, 0, 0, 0)).toISOString(),
                wakeTime: new Date(new Date().setHours(6, 0, 0, 0)).toISOString()
              }
            ],
            total: 3
          }
        })
      })
    })

    // Mock 修改密码接口
    await page.route('**/api/auth/password/reset', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 1,
          message: 'success',
          data: null
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

    await page.goto('/profile')
  })

  test('应该显示个人基本信息和健康统计', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '个人资料' })).toBeVisible()
    await expect(page.getByText('基本信息')).toBeVisible()

    // 验证基本信息
    await expect(page.getByText('test@example.com')).toBeVisible()
    await expect(page.getByText('Test User')).toBeVisible()
    await expect(page.getByText('男')).toBeVisible()

    // 验证健康统计数据
    // 体重记录: 5
    await expect(page.getByText('5', { exact: true })).toBeVisible()
    await expect(page.getByText('体重记录')).toBeVisible()

    // 饮食记录: 12
    await expect(page.getByText('12', { exact: true })).toBeVisible()
    await expect(page.getByText('饮食记录')).toBeVisible()

    // 运动记录: 8
    await expect(page.getByText('8', { exact: true })).toBeVisible()
    await expect(page.getByText('运动记录')).toBeVisible()
  })

  test('应该能够上传头像', async ({ page }) => {
    // 模拟文件选择
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: '上传头像' }).click()
    const fileChooser = await fileChooserPromise

    // 创建一个伪造的图片文件
    await fileChooser.setFiles({
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-content')
    })

    // 点击保存
    await page.getByRole('button', { name: '保存', exact: true }).click()

    // 验证成功提示
    await expect(page.getByText('头像上传成功').first()).toBeVisible()
  })

  test('应该能够编辑个人信息并进行验证', async ({ page }) => {
    await page.getByRole('button', { name: '编辑', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // 验证必填项
    await page.getByLabel('昵称').fill('')
    await page.getByRole('button', { name: '保存基本信息' }).click()
    await expect(page.getByText('表单验证失败').first()).toBeVisible()
    await expect(page.getByText('请输入昵称').first()).toBeVisible()

    // 输入有效信息并保存
    await page.getByLabel('昵称').fill('Updated User')
    await page.getByRole('button', { name: '保存基本信息' }).click()

    // 验证保存成功
    await expect(page.getByText('保存成功').first()).toBeVisible()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('应该能够修改密码并进行验证', async ({ page }) => {
    await page.getByRole('button', { name: '编辑', exact: true }).click()

    // 验证密码不一致
    await page.getByPlaceholder('请输入新密码').fill('password123')
    await page.getByPlaceholder('请再次输入新密码').fill('password456')
    await page.getByRole('button', { name: '更新密码' }).click()
    await expect(page.getByText('密码验证失败').first()).toBeVisible()
    await expect(page.getByText('两次输入的密码不一致').first()).toBeVisible()

    // 验证密码长度
    await page.getByPlaceholder('请输入新密码').fill('123')
    await page.getByPlaceholder('请再次输入新密码').fill('123')
    await page.getByRole('button', { name: '更新密码' }).click()
    await expect(page.getByText('密码验证失败').first()).toBeVisible()
    await expect(page.getByText('密码至少 6 个字符').first()).toBeVisible()

    // 输入有效密码
    await page.getByPlaceholder('请输入新密码').fill('newpassword123')
    await page.getByPlaceholder('请再次输入新密码').fill('newpassword123')
    await page.getByRole('button', { name: '更新密码' }).click()

    // 验证成功提示
    await expect(page.getByText('密码已更新').first()).toBeVisible()
  })

  test('应该能够设置健康目标并进行验证', async ({ page }) => {
    await page.getByRole('button', { name: '设置目标' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // 验证无效输入
    await page.getByLabel('目标体重（kg）').fill('20') // 低于最小值 30
    await page.getByRole('button', { name: '保存目标' }).click()
    await expect(page.getByText('目标体重应在 30-200 kg 之间').first()).toBeVisible()

    // 输入有效目标
    await page.getByLabel('目标体重（kg）').fill('65')
    await page.getByLabel('每日卡路里摄入目标（kcal）').fill('2200')
    await page.getByRole('button', { name: '保存目标' }).click()

    // 验证保存成功
    await expect(page.getByText('设置成功').first()).toBeVisible()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // 验证页面上显示了新目标
    await expect(page.getByText('65.0 kg').first()).toBeVisible()
    await expect(page.getByText('2200 kcal').first()).toBeVisible()
  })

  test('退出登录流程', async ({ page }) => {
    await page.locator('button[aria-haspopup="menu"]').last().click()
    await expect(page.getByRole('menuitem', { name: '退出登录' })).toBeVisible()
    await page.getByRole('menuitem', { name: '退出登录' }).click()

    await expect(page).toHaveURL('/login')
  })
})

test.describe('个人资料页面错误处理', () => {
  test('加载失败时应该显示错误提示并允许重试', async ({ page }) => {
    // Mock 失败的接口 (第一次成功通过路由守卫，第二次失败触发页面错误)
    let profileRequestCount = 0
    await page.route('**/api/user/profile*', async (route) => {
      profileRequestCount++
      if (profileRequestCount === 1) {
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
              gender: '男',
              dateOfBirth: '1990-01-01',
              registrationDate: '2023-01-01'
            }
          })
        })
      } else {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 0,
            message: 'Internal Server Error',
            data: null
          })
        })
      }
    })

    // Mock 其他接口，防止 hang
    await page.route('**/api/body-metrics*', async (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ code: 1, data: { rows: [], total: 0 } })
      })
    )
    await page.route('**/api/diet-items*', async (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ code: 1, data: { rows: [], total: 0 } })
      })
    )
    await page.route('**/api/exercise-items*', async (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ code: 1, data: { rows: [], total: 0 } })
      })
    )
    await page.route('**/api/sleep-items*', async (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ code: 1, data: { rows: [], total: 0 } })
      })
    )

    // 设置 Cookie
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

    await page.goto('/profile')

    // Check if page header is visible
    await expect(page.getByRole('heading', { name: '个人资料' })).toBeVisible()

    // 验证错误提示
    await expect(page.getByText('基本信息')).not.toBeVisible()
    await expect(page.getByRole('button', { name: '重新加载' })).toBeVisible()

    // Mock 恢复正常的接口
    await page.route('**/api/user/profile*', async (route) => {
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
            gender: '男',
            dateOfBirth: '1990-01-01',
            registrationDate: '2023-01-01'
          }
        })
      })
    })

    // 还需要 Mock 其他依赖接口，因为 loadUserData 会并行调用
    await page.route('**/api/body-metrics*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ code: 1, data: { rows: [], total: 0 } })
      })
    })
    await page.route('**/api/diet-items*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ code: 1, data: { rows: [], total: 0 } })
      })
    })
    await page.route('**/api/exercise-items*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ code: 1, data: { rows: [], total: 0 } })
      })
    })
    await page.route('**/api/sleep-items*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ code: 1, data: { rows: [], total: 0 } })
      })
    })

    // 点击重试
    await page.getByRole('button', { name: '重新加载' }).click()

    // 验证加载成功
    await expect(page.getByText('基本信息')).toBeVisible()
  })
})
