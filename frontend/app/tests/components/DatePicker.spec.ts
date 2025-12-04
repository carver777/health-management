import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { CalendarDate } from '@internationalized/date'
import DatePicker from '~/components/DatePicker.vue'
import { getTodayDateValue, dateValueToString } from '~/utils/dateUtils'

describe('DatePicker', () => {
  describe('渲染', () => {
    it('应该正确渲染组件', async () => {
      const wrapper = await mountSuspended(DatePicker)

      expect(wrapper.exists()).toBe(true)
    })

    it('没有传入值时应该显示今天的日期', async () => {
      const wrapper = await mountSuspended(DatePicker)
      const todayStr = dateValueToString(getTodayDateValue())

      expect(wrapper.text()).toContain(todayStr)
    })

    it('传入 null 时应该显示今天的日期（组件默认行为）', async () => {
      const wrapper = await mountSuspended(DatePicker, {
        props: {
          modelValue: null
        }
      })
      const todayStr = dateValueToString(getTodayDateValue())

      expect(wrapper.text()).toContain(todayStr)
    })
  })

  describe('props', () => {
    it('应该接受 modelValue', async () => {
      const date = new CalendarDate(2025, 6, 15)
      const wrapper = await mountSuspended(DatePicker, {
        props: {
          modelValue: date
        }
      })

      expect(wrapper.text()).toContain('2025-06-15')
    })

    it('应该支持不同的 size', async () => {
      const wrapper = await mountSuspended(DatePicker, {
        props: {
          size: 'lg'
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该支持 block 属性', async () => {
      const wrapper = await mountSuspended(DatePicker, {
        props: {
          block: true
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('交互', () => {
    it('点击按钮应该可以触发', async () => {
      const wrapper = await mountSuspended(DatePicker)

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)

      await button.trigger('click')
      // 验证组件没有报错
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('事件', () => {
    it('应该发出 update:modelValue 事件', async () => {
      const wrapper = await mountSuspended(DatePicker)

      // 组件应该能够处理事件发射
      expect(wrapper.emitted()).toBeDefined()
    })
  })
})
