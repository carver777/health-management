import { describe, it, expect } from 'vitest'
import { CalendarDate } from '@internationalized/date'
import {
  getTodayDateValue,
  dateValueToString,
  stringToDateValue,
  formatDisplayDate,
  formatDateTimeDisplay,
  formatDurationMinutes,
  getDateRangeByDays,
  parseDaysFromPeriod,
  calculateMinutesBetween
} from '~/utils/dateUtils'

describe('dateUtils', () => {
  describe('dateValueToString', () => {
    it('应该将 DateValue 转换为 YYYY-MM-DD 格式字符串', () => {
      const date = new CalendarDate(2025, 1, 15)
      expect(dateValueToString(date)).toBe('2025-01-15')
    })

    it('应该正确补零', () => {
      const date = new CalendarDate(2025, 3, 5)
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

  describe('formatDisplayDate', () => {
    it('应该格式化 DateValue 为中文日期', () => {
      const date = new CalendarDate(2025, 1, 1)
      expect(formatDisplayDate(date)).toBe('2025 年 1 月 1 日')
    })

    it('应该格式化字符串日期', () => {
      const result = formatDisplayDate('2025-01-15')
      expect(result).toContain('2025')
    })
  })

  describe('formatDateTimeDisplay', () => {
    it('应该格式化日期时间为 HH:MM 格式', () => {
      const result = formatDateTimeDisplay('2025-01-15T14:30:00')
      expect(result).toMatch(/\d{2}:\d{2}/)
    })

    it('应该处理空值', () => {
      expect(formatDateTimeDisplay(null)).toBe('--')
      expect(formatDateTimeDisplay(undefined)).toBe('--')
    })
  })

  describe('formatDurationMinutes', () => {
    it('应该格式化分钟为小时+分钟', () => {
      expect(formatDurationMinutes(125)).toBe('2 小时 5 分')
      expect(formatDurationMinutes(60)).toBe('1 小时 0 分')
      expect(formatDurationMinutes(45)).toBe('0 小时 45 分')
    })

    it('应该处理 0 值', () => {
      expect(formatDurationMinutes(0)).toBe('--')
    })
  })

  describe('getDateRangeByDays', () => {
    it('应该返回指定天数的日期范围', () => {
      const { startDate, endDate } = getDateRangeByDays(7)
      expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(startDate <= endDate).toBe(true)
    })
  })

  describe('parseDaysFromPeriod', () => {
    it('应该从时间段字符串提取天数', () => {
      expect(parseDaysFromPeriod('7d')).toBe(7)
      expect(parseDaysFromPeriod('30d')).toBe(30)
      expect(parseDaysFromPeriod('90d')).toBe(90)
    })
  })

  describe('calculateMinutesBetween', () => {
    it('应该计算两个时间之间的分钟数', () => {
      const start = '2025-01-15T22:00:00'
      const end = '2025-01-16T06:00:00'
      expect(calculateMinutesBetween(start, end)).toBe(480) // 8 小时
    })

    it('应该处理无效时间', () => {
      expect(calculateMinutesBetween('invalid', '2025-01-15T06:00:00')).toBe(0)
    })
  })

  describe('getTodayDateValue', () => {
    it('应该返回今天的 DateValue', () => {
      const today = getTodayDateValue()
      expect(today.year).toBeGreaterThan(2020)
      expect(today.month).toBeGreaterThanOrEqual(1)
      expect(today.month).toBeLessThanOrEqual(12)
      expect(today.day).toBeGreaterThanOrEqual(1)
      expect(today.day).toBeLessThanOrEqual(31)
    })
  })
})
