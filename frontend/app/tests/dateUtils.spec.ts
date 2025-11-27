import { describe, it, expect } from 'vitest'

describe('dateUtils', () => {
  describe('dateValueToString', () => {
    it('应该将 DateValue 转换为 YYYY-MM-DD 格式字符串', () => {
      const date = createCalendarDate(2025, 1, 15)
      expect(dateValueToString(date)).toBe('2025-01-15')
    })

    it('应该正确补零', () => {
      const date = createCalendarDate(2025, 3, 5)
      expect(dateValueToString(date)).toBe('2025-03-05')
    })
  })

  describe('stringToDateValue', () => {
    it('应该将字符串转换为 DateValue', () => {
      const date = stringToDateValue('2025-06-20')
      expect(date.year).toBe(2025)
      expect(date.month).toBe(6)
      expect(date.day).toBe(20)
    })
  })

  describe('createCalendarDate', () => {
    it('应该创建正确的 CalendarDate 对象', () => {
      const date = createCalendarDate(2025, 12, 31)
      expect(date.year).toBe(2025)
      expect(date.month).toBe(12)
      expect(date.day).toBe(31)
    })
  })

  describe('formatDisplayDate', () => {
    it('应该格式化 DateValue 为中文日期', () => {
      const date = createCalendarDate(2025, 1, 1)
      expect(formatDisplayDate(date)).toBe('2025 年 1 月 1 日')
    })

    it('应该格式化字符串日期', () => {
      const result = formatDisplayDate('2025-01-15')
      expect(result).toContain('2025')
    })
  })

  describe('formatShortDate', () => {
    it('应该格式化 DateValue 为短日期', () => {
      const date = createCalendarDate(2025, 3, 15)
      expect(formatShortDate(date)).toBe('3/15')
    })
  })
})
