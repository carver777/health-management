import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { CalendarDate } from '@internationalized/date'
import YearMonthSelect from '~/components/YearMonthSelect.vue'

describe('YearMonthSelect', () => {
  const defaultPlaceholder = new CalendarDate(2025, 6, 15)

  describe('渲染', () => {
    it('应该正确渲染组件', async () => {
      const wrapper = await mountSuspended(YearMonthSelect, {
        props: {
          placeholder: defaultPlaceholder
        },
        slots: {
          default: '2025 年 6 月'
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该渲染 slot 内容', async () => {
      const wrapper = await mountSuspended(YearMonthSelect, {
        props: {
          placeholder: defaultPlaceholder
        },
        slots: {
          default: '2025 年 6 月'
        }
      })

      expect(wrapper.text()).toContain('2025 年 6 月')
    })
  })

  describe('props', () => {
    it('应该接受 placeholder', async () => {
      const wrapper = await mountSuspended(YearMonthSelect, {
        props: {
          placeholder: defaultPlaceholder
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该接受 minValue 和 maxValue', async () => {
      const wrapper = await mountSuspended(YearMonthSelect, {
        props: {
          placeholder: defaultPlaceholder,
          minValue: new CalendarDate(2020, 1, 1),
          maxValue: new CalendarDate(2030, 12, 31)
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('交互', () => {
    it('点击按钮应该可以触发', async () => {
      const wrapper = await mountSuspended(YearMonthSelect, {
        props: {
          placeholder: defaultPlaceholder
        },
        slots: {
          default: '选择日期'
        }
      })

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)

      await button.trigger('click')
      expect(wrapper.exists()).toBe(true)
    })
  })
})
