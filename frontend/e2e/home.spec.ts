import { test, expect } from '@playwright/test'

test.describe('首页功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('页面应该有正确的标题', async ({ page }) => {
    await expect(page).toHaveTitle(/健康生活管理系统/)
  })

  test('应该显示主标题', async ({ page }) => {
    const heading = page.getByRole('heading', {
      name: '健康生活管理系统',
      level: 1
    })
    await expect(heading).toBeVisible()
  })

  test('应该显示描述文字', async ({ page }) => {
    const description = page.getByText('用科学的方法管理您的健康')
    await expect(description).toBeVisible()
  })

  test('应该显示登录和注册按钮', async ({ page }) => {
    const loginButton = page.getByRole('link', { name: '立即登录' })
    const registerButton = page.getByRole('link', { name: '免费注册' })

    await expect(loginButton).toBeVisible()
    await expect(registerButton).toBeVisible()
  })

  test('应该显示核心功能列表', async ({ page }) => {
    const featuresHeading = page.getByRole('heading', { name: '核心功能' })
    await expect(featuresHeading).toBeVisible()

    const features = ['数据可视化', '饮食管理', '运动跟踪', '睡眠管理', '体重监测', 'AI 健康助手']
    for (const feature of features) {
      const featureHeading = page.getByRole('heading', { name: feature, level: 3 })
      await expect(featureHeading).toBeVisible()
    }
  })

  test('点击登录按钮应该导航到登录页面', async ({ page }) => {
    const loginButton = page.getByRole('link', { name: '立即登录' })
    await loginButton.click()
    await page.waitForURL('**/login')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('点击注册按钮应该导航到注册页面', async ({ page }) => {
    const registerButton = page.getByRole('link', { name: '免费注册' })
    await registerButton.click()
    await page.waitForURL('**/login?mode=register')
    await expect(page).toHaveURL(/\/login\?mode=register/)
  })

  test('应该显示页脚版权信息', async ({ page }) => {
    const footer = page.getByText(/© \d{4} 健康生活管理系统/)
    await expect(footer).toBeVisible()
  })
})
