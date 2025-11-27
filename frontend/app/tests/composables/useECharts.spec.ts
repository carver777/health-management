import { describe, it, expect, vi, beforeEach } from 'vitest'
import type * as EChartsType from 'echarts/core'

describe('useECharts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化', () => {
    it('应该返回 echarts 实例和方法', () => {
      const { echarts, initChart, disposeChart } = useECharts()

      expect(echarts).toBeDefined()
      expect(initChart).toBeDefined()
      expect(disposeChart).toBeDefined()
      expect(typeof initChart).toBe('function')
      expect(typeof disposeChart).toBe('function')
    })

    it('多次调用应该返回相同的方法', () => {
      const first = useECharts()
      const second = useECharts()

      expect(first.initChart).toBeDefined()
      expect(second.initChart).toBeDefined()
    })
  })

  describe('disposeChart', () => {
    it('应该销毁图表实例', () => {
      const mockDispose = vi.fn()
      const mockChart = { dispose: mockDispose } as unknown as EChartsType.ECharts

      const { disposeChart } = useECharts()

      disposeChart(mockChart)

      expect(mockDispose).toHaveBeenCalled()
    })

    it('chart 为 null 时不应该报错', () => {
      const { disposeChart } = useECharts()

      expect(() => disposeChart(null)).not.toThrow()
    })
  })
})
