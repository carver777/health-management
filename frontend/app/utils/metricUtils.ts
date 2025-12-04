/**
 * BMI 计算与状态判断工具
 */

/**
 * 计算 BMI（不格式化），如果无法计算则返回 null
 */
export function calcBMI(item: Pick<BodyData, 'weightKG' | 'heightCM'>): number | null {
  const { weightKG: weight, heightCM: height } = item
  if (!weight || !height) return null

  const heightM = height / 100
  if (heightM <= 0) return null
  return weight / (heightM * heightM)
}

/**
 * 返回格式化后的 BMI 字符串，如“23.4”
 */
export function formatBMI(item: Pick<BodyData, 'weightKG' | 'heightCM'>): string {
  const bmi = calcBMI(item)
  return bmi == null ? '--' : bmi.toFixed(1)
}

/**
 * BMI 状态分类，根据 WHO 标准
 */
export interface BMIStatus {
  status: string
  color: string
}

export function getBMIStatus(bmi: number | null): BMIStatus {
  if (bmi == null) return { status: '未知', color: 'text-gray-500' }
  if (bmi < 18.5) return { status: '偏瘦', color: 'text-blue-600' }
  if (bmi < 24) return { status: '正常', color: 'text-green-600' }
  if (bmi < 28) return { status: '偏胖', color: 'text-yellow-600' }
  return { status: '肥胖', color: 'text-red-600' }
}
