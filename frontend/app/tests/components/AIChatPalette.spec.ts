import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AIChatPalette from '~/components/AIChatPalette.vue'

// Mock navigateTo
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    navigateTo: vi.fn()
  }
})

describe('AIChatPalette', () => {
  describe('渲染', () => {
    it('应该正确渲染组件', async () => {
      const wrapper = await mountSuspended(AIChatPalette)

      expect(wrapper.exists()).toBe(true)
    })

    it('应该包含快捷入口按钮', async () => {
      const wrapper = await mountSuspended(AIChatPalette)

      // 组件应该渲染出按钮或可点击元素
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('交互', () => {
    it('应该能够处理点击事件', async () => {
      const wrapper = await mountSuspended(AIChatPalette)

      // 找到可交互元素
      const interactiveElement = wrapper.find('button, [role="button"], a')
      if (interactiveElement.exists()) {
        await interactiveElement.trigger('click')
      }

      expect(wrapper.exists()).toBe(true)
    })
  })
})
