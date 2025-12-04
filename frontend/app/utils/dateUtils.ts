/**
 * 日期计算与格式化工具
 */

import type { DateValue } from '@internationalized/date'
import { CalendarDate, CalendarDateTime, today, getLocalTimeZone } from '@internationalized/date'

/**
 * 补齐数字前导零
 */
function pad(num: number): string {
  return String(num).padStart(2, '0')
}

/**
 * 获取今日日期，使用所在地时区
 */
export function getTodayDateValue(): DateValue {
  return today(getLocalTimeZone())
}

/**
 * 将 DateValue 转换为 YYYY-MM-DD 格式字符串
 */
export function dateValueToString(date: DateValue): string {
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`
}

/**
 * 将 YYYY-MM-DD 格式字符串转换为 DateValue
 */
export function stringToDateValue(dateString: string): DateValue {
  const [year, month, day] = dateString.split('-').map(Number)
  return new CalendarDate(year!, month!, day!)
}

/**
 * 将 CalendarDateTime 转换为 ISO 字符串
 */
export function calendarDateTimeToISOString(dt: CalendarDateTime | null): string | null {
  if (!dt) return null
  const year = String(dt.year).padStart(4, '0')
  return `${year}-${pad(dt.month)}-${pad(dt.day)}T${pad(dt.hour)}:${pad(dt.minute)}:${pad(dt.second)}`
}

/**
 * 从 ISO 字符串解析为 CalendarDateTime
 */
export function parseISOToCalendarDateTime(iso?: string | null): CalendarDateTime | null {
  if (!iso) return null
  try {
    const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
    if (!match) return null
    const [, year, month, day, hour, minute, second] = match
    if (!year || !month || !day || !hour || !minute || !second) return null
    return new CalendarDateTime(
      parseInt(year, 10),
      parseInt(month, 10),
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10),
      parseInt(second, 10)
    )
  } catch {
    return null
  }
}

/**
 * 格式化显示日期（中文格式：2024 年 1 月 1 日）
 * 支持 DateValue 和字符串
 */
export function formatDisplayDate(date: DateValue | string): string {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString('zh-CN')
  }
  return `${date.year} 年 ${date.month} 月 ${date.day} 日`
}

/**
 * 格式化日期时间显示（HH:MM 格式）
 */
export function formatDateTimeDisplay(value?: string | null): string {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

/**
 * 计算两个时间戳之间的分钟数
 */
export function calculateMinutesBetween(startTime: string, endTime: string): number {
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0
  }

  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
}

/**
 * 将分钟数格式化为“小时+分”的显示格式
 * 例如：125 分钟 -> "2 小时 5 分"
 */
export function formatDurationMinutes(minutes: number): string {
  if (!minutes) return '--'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours} 小时 ${mins} 分`
}

/**
 * 获取指定天数前的日期范围（开始日期和结束日期）
 * @param days - 天数，例如 7 表示最近 7 天
 * @returns { startDate: string, endDate: string } - YYYY-MM-DD 格式
 */
export function getDateRangeByDays(days: number): { startDate: string; endDate: string } {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - days + 1)

  return {
    startDate: startDate.toISOString().split('T')[0]!,
    endDate: endDate.toISOString().split('T')[0]!
  }
}

/**
 * 从时间段字符串（如 '7d'）中提取天数
 */
export function parseDaysFromPeriod(period: string): number {
  return parseInt(period.replace('d', ''), 10)
}
