import { describe, it, expect } from 'vitest'

describe('metricUtils', () => {
  describe('calcBMI', () => {
    it('应该正确计算 BMI', () => {
      // BMI = 70 / (1.75 * 1.75) ≈ 22.86
      const result = calcBMI({ weightKG: 70, heightCM: 175 })
      expect(result).toBeCloseTo(22.86, 1)
    })

    it('体重或身高为空时应返回 null', () => {
      expect(calcBMI({ weightKG: null as unknown as number, heightCM: 175 })).toBeNull()
      expect(calcBMI({ weightKG: 70, heightCM: null as unknown as number })).toBeNull()
    })

    it('身高为 0 时应返回 null', () => {
      expect(calcBMI({ weightKG: 70, heightCM: 0 })).toBeNull()
    })

    it('应该处理边界值', () => {
      // 极端体重
      const result = calcBMI({ weightKG: 40, heightCM: 150 })
      expect(result).toBeCloseTo(17.78, 1)
    })
  })

  describe('formatBMI', () => {
    it('应该返回格式化的 BMI 字符串', () => {
      const result = formatBMI({ weightKG: 70, heightCM: 175 })
      expect(result).toBe('22.9')
    })

    it('无法计算时应返回 "--"', () => {
      expect(formatBMI({ weightKG: null as unknown as number, heightCM: 175 })).toBe('--')
    })
  })

  describe('getBMIStatus', () => {
    it('BMI 为 null 时应返回未知状态', () => {
      const status = getBMIStatus(null)
      expect(status.status).toBe('未知')
      expect(status.color).toBe('text-gray-500')
    })

    it('BMI < 18.5 应返回偏瘦', () => {
      const status = getBMIStatus(17)
      expect(status.status).toBe('偏瘦')
      expect(status.color).toBe('text-blue-600')
    })

    it('BMI 18.5-24 应返回正常', () => {
      const status = getBMIStatus(22)
      expect(status.status).toBe('正常')
      expect(status.color).toBe('text-green-600')
    })

    it('BMI 24-28 应返回偏胖', () => {
      const status = getBMIStatus(26)
      expect(status.status).toBe('偏胖')
      expect(status.color).toBe('text-yellow-600')
    })

    it('BMI >= 28 应返回肥胖', () => {
      const status = getBMIStatus(30)
      expect(status.status).toBe('肥胖')
      expect(status.color).toBe('text-red-600')
    })

    it('应该处理边界值 18.5', () => {
      const status = getBMIStatus(18.5)
      expect(status.status).toBe('正常')
    })

    it('应该处理边界值 24', () => {
      const status = getBMIStatus(24)
      expect(status.status).toBe('偏胖')
    })

    it('应该处理边界值 28', () => {
      const status = getBMIStatus(28)
      expect(status.status).toBe('肥胖')
    })
  })
})
