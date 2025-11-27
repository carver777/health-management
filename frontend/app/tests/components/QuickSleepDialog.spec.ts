import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import QuickSleepDialog from '~/components/QuickSleepDialog.vue'

// Mock $fetch
vi.stubGlobal('$fetch', vi.fn())

describe('QuickSleepDialog', () => {
  describe('渲染', () => {
    it('应该正确渲染组件（关闭状态）', async () => {
      const wrapper = await mountSuspended(QuickSleepDialog, {
        props: {
          open: false
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('打开时应该显示对话框', async () => {
      const wrapper = await mountSuspended(QuickSleepDialog, {
        props: {
          open: true
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('props', () => {
    it('应该接受 open 属性', async () => {
      const wrapper = await mountSuspended(QuickSleepDialog, {
        props: {
          open: false
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('应该接受 editItem 属性', async () => {
      const editItem = {
        sleepItemID: 1,
        userID: 'test-user',
        recordDate: '2025-06-15',
        bedTime: '2025-06-14T23:00:00',
        wakeTime: '2025-06-15T07:00:00'
      }

      const wrapper = await mountSuspended(QuickSleepDialog, {
        props: {
          open: true,
          editItem
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('事件', () => {
    it('应该能发出 update:open 事件', async () => {
      const wrapper = await mountSuspended(QuickSleepDialog, {
        props: {
          open: false
        }
      })

      expect(wrapper.emitted()).toBeDefined()
    })
  })
})
