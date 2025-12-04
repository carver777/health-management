import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const waitForClientReady = async (page: Page) => {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(150)
}

test.describe('登录页面测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('应该显示登录表单', async ({ page }) => {
    const heading = page.getByRole('heading', { name: '登录健康生活管理系统' })
    await expect(heading).toBeVisible()

    await expect(page.getByPlaceholder('请输入邮箱')).toBeVisible()
    await expect(page.getByPlaceholder('请输入密码')).toBeVisible()
    await expect(page.getByRole('button', { name: '立即登录' })).toBeVisible()
  })

  test('应该能够输入邮箱和密码', async ({ page }) => {
    const emailInput = page.getByPlaceholder('请输入邮箱')
    const passwordInput = page.getByPlaceholder('请输入密码')

    await emailInput.fill('test@example.com')
    await passwordInput.fill('password123')

    await expect(emailInput).toHaveValue('test@example.com')
    await expect(passwordInput).toHaveValue('password123')
  })

  test('应该能够切换到注册表单', async ({ page }) => {
    const loginHeading = page.getByRole('heading', { name: '登录健康生活管理系统' })
    await expect(loginHeading).toBeVisible()

    await page.goto('/login?mode=register')

    const registerHeading = page.getByRole('heading', { name: '注册健康生活管理系统' })
    await expect(registerHeading).toBeVisible()
    await expect(page.getByPlaceholder('请输入昵称')).toBeVisible()
    await expect(page.getByPlaceholder('请再次输入密码')).toBeVisible()
  })

  test('点击注册按钮应该切换到注册表单', async ({ page }) => {
    await waitForClientReady(page)
    await page.getByRole('button', { name: '没有账户？点击注册' }).click()
    const registerHeading = page.getByRole('heading', { name: '注册健康生活管理系统' })
    await expect(registerHeading).toBeVisible()
    await expect(page.getByPlaceholder('请输入昵称')).toBeVisible()
  })

  test('通过 URL 参数访问应该直接显示注册表单', async ({ page }) => {
    await page.goto('/login?mode=register')
    const heading = page.getByRole('heading', { name: '注册健康生活管理系统' })
    await expect(heading).toBeVisible()
  })

  test('应该能够从注册页面切换回登录页面', async ({ page }) => {
    await page.goto('/login?mode=register')
    await expect(page.getByRole('heading', { name: '注册健康生活管理系统' })).toBeVisible()

    await page.goto('/login')

    await expect(page.getByRole('heading', { name: '登录健康生活管理系统' })).toBeVisible()
    await expect(page.getByPlaceholder('请输入昵称')).not.toBeVisible()
  })

  test('点击忘记密码按钮应该显示重置表单', async ({ page }) => {
    await waitForClientReady(page)
    await page.getByRole('button', { name: '忘记密码？点击重置' }).click()

    await expect(page.getByPlaceholder('请输入注册时的昵称')).toBeVisible()
    await expect(page.getByPlaceholder('请输入邮箱')).toBeVisible()
    await expect(page.getByPlaceholder('请输入新密码')).toBeVisible()
    await expect(page.getByPlaceholder('请再次输入新密码')).toBeVisible()
    await expect(page.getByRole('button', { name: '重置密码' })).toBeVisible()
    await expect(page.getByRole('button', { name: '返回登录' })).toBeVisible()
  })

  test('密码重置表单应该能够填写并返回登录页', async ({ page }) => {
    await waitForClientReady(page)
    await page.getByRole('button', { name: '忘记密码？点击重置' }).click()

    await page.getByPlaceholder('请输入注册时的昵称').fill('测试用户')
    await page.getByPlaceholder('请输入邮箱').fill('reset@example.com')
    await page.getByPlaceholder('请输入新密码').fill('password123')
    await page.getByPlaceholder('请再次输入新密码').fill('password123')

    await expect(page.getByPlaceholder('请输入注册时的昵称')).toHaveValue('测试用户')
    await expect(page.getByPlaceholder('请输入邮箱')).toHaveValue('reset@example.com')
    await expect(page.getByPlaceholder('请输入新密码')).toHaveValue('password123')
    await expect(page.getByPlaceholder('请再次输入新密码')).toHaveValue('password123')

    await page.getByRole('button', { name: '返回登录' }).click()

    await expect(page.getByRole('heading', { name: '登录健康生活管理系统' })).toBeVisible()
    await expect(page.getByPlaceholder('请输入注册时的昵称')).not.toBeVisible()
  })
})

test.describe('注册页面测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login?mode=register')
    await expect(page.getByRole('heading', { name: '注册健康生活管理系统' })).toBeVisible()
  })

  test('应该显示所有注册字段', async ({ page }) => {
    await expect(page.getByPlaceholder('请输入昵称')).toBeVisible()
    await expect(page.getByPlaceholder('请输入邮箱')).toBeVisible()
    await expect(page.getByPlaceholder('请输入密码')).toBeVisible()
    await expect(page.getByPlaceholder('请再次输入密码')).toBeVisible()
    await expect(page.getByRole('radio', { name: '男' })).toBeVisible()
    await expect(page.getByRole('radio', { name: '女' })).toBeVisible()
    // DatePicker 渲染为按钮，显示日期格式 YYYY-MM-DD
    await expect(page.getByRole('button', { name: /\d{4}-\d{2}-\d{2}/ })).toBeVisible()
    await expect(page.getByRole('button', { name: '注册账户' })).toBeVisible()
  })

  test('应该能够选择性别', async ({ page }) => {
    const maleRadio = page.locator('input[type="radio"][name="gender"][value="男"]')
    const femaleRadio = page.locator('input[type="radio"][name="gender"][value="女"]')

    await expect(maleRadio).toBeChecked()
    await expect(femaleRadio).not.toBeChecked()

    await femaleRadio.check()

    await expect(femaleRadio).toBeChecked()
    await expect(maleRadio).not.toBeChecked()
  })

  test('应该能够填写注册表单', async ({ page }) => {
    await page.getByPlaceholder('请输入昵称').fill('测试用户')
    await page.getByPlaceholder('请输入邮箱').fill('test@example.com')
    await page.getByPlaceholder('请输入密码').fill('password123')
    await page.getByPlaceholder('请再次输入密码').fill('password123')

    await expect(page.getByPlaceholder('请输入昵称')).toHaveValue('测试用户')
    await expect(page.getByPlaceholder('请输入邮箱')).toHaveValue('test@example.com')
    await expect(page.getByPlaceholder('请输入密码')).toHaveValue('password123')
    await expect(page.getByPlaceholder('请再次输入密码')).toHaveValue('password123')
  })
})
