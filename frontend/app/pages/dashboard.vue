<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const toast = useToast()

// 获取用户 ID（从 cookie 中获取，与 useAuth 保持一致）
const userIDCookie = useCookie<string | null>('userID')
const tokenCookie = useCookie<string | null>('token')

// 对话框状态
const showBodyDataDialog = ref(false)
const showDietDialog = ref(false)
const showExerciseDialog = ref(false)
const showAIChatPalette = ref(false)

// 图表时间段
const caloriesTimePeriod = ref<string>('7d')
const weightTimePeriod = ref<string>('7d')

// 数据
const weightData = ref<{ date: string; weight: number }[]>([])
const caloriesData = ref<{ date: string; intake: number; burn: number; net: number }[]>([])

// 统计数据
const statistics = reactive({
  totalCaloriesConsumed: 0,
  totalCaloriesBurned: 0,
  averageWeight: 0
})

// 健康目标数据
const healthGoals = reactive({
  targetWeight: null as number | null,
  dailyCaloriesIntake: null as number | null,
  dailyCaloriesBurn: null as number | null
})

const loadWeightData = async () => {
  if (!import.meta.client) return
  try {
    const userID = userIDCookie.value

    if (!userID) {
      return
    }

    const days = parseInt(weightTimePeriod.value.replace('d', ''))
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days + 1)

    const params = {
      userID,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      page: 1,
      pageSize: days
    }

    const response = await $fetch<{
      code: number
      data: {
        total: number
        rows: Array<{
          bodyMetricID: number
          userID: string
          recordDate: string
          weightKG: number
          heightCM: number
          bmi?: number
        }>
      }
    }>('/api/body-metrics', {
      params,
      headers: tokenCookie.value
        ? {
            Authorization: `Bearer ${tokenCookie.value}`
          }
        : undefined
    })

    if (response.code === 1 && response.data?.rows) {
      weightData.value = response.data.rows.map((item) => {
        const weight =
          typeof item.weightKG === 'number' && !Number.isNaN(item.weightKG) ? item.weightKG : 0
        return {
          date: item.recordDate,
          weight
        }
      })
    } else {
      weightData.value = []
    }
  } catch {
    toast.add({ title: '加载体重数据失败', color: 'error' })
    weightData.value = []
  }
}

const loadCaloriesData = async () => {
  if (!import.meta.client) return
  try {
    const userID = userIDCookie.value

    if (!userID) {
      return
    }

    const days = parseInt(caloriesTimePeriod.value.replace('d', ''))
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days + 1)

    const params = {
      userID,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      page: 1,
      pageSize: 1000
    }

    const [dietResponse, exerciseResponse] = await Promise.all([
      $fetch<{
        code: number
        data: {
          total: number
          rows: Array<{
            recordDate: string
            estimatedCalories: number
          }>
        }
      }>('/api/diet-items', {
        params,
        headers: tokenCookie.value
          ? {
              Authorization: `Bearer ${tokenCookie.value}`
            }
          : undefined
      }),
      $fetch<{
        code: number
        data: {
          total: number
          rows: Array<{
            recordDate: string
            estimatedCaloriesBurned: number
          }>
        }
      }>('/api/exercise-items', {
        params,
        headers: tokenCookie.value
          ? {
              Authorization: `Bearer ${tokenCookie.value}`
            }
          : undefined
      })
    ])

    const dateMap = new Map<string, { intake: number; burn: number }>()

    if (dietResponse.code === 1 && dietResponse.data?.rows) {
      dietResponse.data.rows.forEach((item) => {
        const date = item.recordDate
        const existing = dateMap.get(date) || { intake: 0, burn: 0 }
        existing.intake += item.estimatedCalories || 0
        dateMap.set(date, existing)
      })
    }

    if (exerciseResponse.code === 1 && exerciseResponse.data?.rows) {
      exerciseResponse.data.rows.forEach((item) => {
        const date = item.recordDate
        const existing = dateMap.get(date) || { intake: 0, burn: 0 }
        existing.burn += item.estimatedCaloriesBurned || 0
        dateMap.set(date, existing)
      })
    }

    const result: { date: string; intake: number; burn: number; net: number }[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      if (dateStr) {
        const data = dateMap.get(dateStr) || { intake: 0, burn: 0 }
        result.push({
          date: dateStr,
          intake: data.intake,
          burn: data.burn,
          net: data.intake - data.burn
        })
      }
    }

    caloriesData.value = result
  } catch {
    toast.add({ title: '加载卡路里数据失败', color: 'error' })
    caloriesData.value = []
  }
}

const loadHealthGoals = () => {
  if (!import.meta.client) return
  try {
    const savedGoals = localStorage.getItem('healthGoals')
    if (savedGoals) {
      const parsed = JSON.parse(savedGoals)
      healthGoals.targetWeight = parsed.targetWeight
      healthGoals.dailyCaloriesIntake = parsed.dailyCaloriesIntake || parsed.dailyCalories
      healthGoals.dailyCaloriesBurn = parsed.dailyCaloriesBurn
    }
  } catch {
    // 忽略加载错误
  }
}

const refreshData = async () => {
  if (!import.meta.client) return

  try {
    const userID = userIDCookie.value

    if (!userID) {
      return
    }

    const today = new Date().toISOString().split('T')[0]

    const headers = tokenCookie.value
      ? {
          Authorization: `Bearer ${tokenCookie.value}`
        }
      : undefined

    const [bodyResponse, dietResponse, exerciseResponse] = await Promise.all([
      $fetch<{
        code: number
        data: {
          total: number
          rows: Array<{ weightKG: number }>
        }
      }>('/api/body-metrics', {
        params: { userID, page: 1, pageSize: 1 },
        headers
      }),
      $fetch<{
        code: number
        data: {
          total: number
          rows: Array<{ estimatedCalories: number }>
        }
      }>('/api/diet-items', {
        params: { userID, startDate: today, endDate: today, page: 1, pageSize: 1000 },
        headers
      }),
      $fetch<{
        code: number
        data: {
          total: number
          rows: Array<{ estimatedCaloriesBurned: number }>
        }
      }>('/api/exercise-items', {
        params: { userID, startDate: today, endDate: today, page: 1, pageSize: 1000 },
        headers
      })
    ])

    if (bodyResponse.code === 1 && bodyResponse.data?.rows?.length > 0) {
      const weight = bodyResponse.data.rows[0]?.weightKG
      statistics.averageWeight = typeof weight === 'number' && !Number.isNaN(weight) ? weight : 0
    } else {
      statistics.averageWeight = 0
    }

    if (dietResponse.code === 1 && dietResponse.data?.rows) {
      statistics.totalCaloriesConsumed = dietResponse.data.rows.reduce((sum, item) => {
        const calories = item.estimatedCalories || 0
        return sum + (typeof calories === 'number' && !Number.isNaN(calories) ? calories : 0)
      }, 0)
    } else {
      statistics.totalCaloriesConsumed = 0
    }

    if (exerciseResponse.code === 1 && exerciseResponse.data?.rows) {
      statistics.totalCaloriesBurned = exerciseResponse.data.rows.reduce((sum, item) => {
        const burned = item.estimatedCaloriesBurned || 0
        return sum + (typeof burned === 'number' && !Number.isNaN(burned) ? burned : 0)
      }, 0)
    } else {
      statistics.totalCaloriesBurned = 0
    }

    await Promise.all([loadWeightData(), loadCaloriesData()])
  } catch {
    toast.add({ title: '加载数据失败', color: 'error' })
  }
}

onMounted(async () => {
  loadHealthGoals()
  await refreshData()
})

watch(weightTimePeriod, () => {
  loadWeightData()
})

watch(caloriesTimePeriod, () => {
  loadCaloriesData()
})

const handleDialogSuccess = () => {
  refreshData()
}
</script>

<template>
  <UPage>
    <UPageHeader title="数据概览" description="全面了解您的健康状况，追踪每日进展">
      <template #icon>
        <UIcon name="mdi:view-dashboard" />
      </template>
    </UPageHeader>

    <UPageBody>
      <!-- 统计卡片 -->
      <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <UCard>
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg">
              <UIcon name="mdi:scale-bathroom" class="text-2xl" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-2xl font-bold">
                {{ statistics.averageWeight.toFixed(1) }}
              </div>
              <div class="mt-1 text-sm">当前体重（kg）</div>
              <div class="mt-1 text-xs">
                目标: {{ healthGoals.targetWeight || '未设置'
                }}{{ healthGoals.targetWeight ? ' kg' : '' }}
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg">
              <UIcon name="mdi:food-apple" class="text-2xl" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-2xl font-bold">
                {{ statistics.totalCaloriesConsumed }}
              </div>
              <div class="mt-1 text-sm">今日摄入（kcal）</div>
              <div class="mt-1 text-xs">
                目标: {{ healthGoals.dailyCaloriesIntake || '未设置'
                }}{{ healthGoals.dailyCaloriesIntake ? ' kcal' : '' }}
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg">
              <UIcon name="mdi:fire" class="text-2xl" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-2xl font-bold">
                {{ statistics.totalCaloriesBurned }}
              </div>
              <div class="mt-1 text-sm">今日消耗（kcal）</div>
              <div class="mt-1 text-xs">
                目标: {{ healthGoals.dailyCaloriesBurn || '未设置'
                }}{{ healthGoals.dailyCaloriesBurn ? ' kcal' : '' }}
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- 数据趋势图表 - 使用懒加载 + 延迟水合 -->
      <div class="grid grid-cols-1 gap-6">
        <LazyCaloriesChart
          v-model:time-period="caloriesTimePeriod"
          :data="caloriesData"
          hydrate-on-visible
        />

        <LazyWeightChart
          v-model:time-period="weightTimePeriod"
          :data="weightData"
          hydrate-on-visible
        />
      </div>
    </UPageBody>

    <!-- 快速记录对话框 - 懒加载，用户交互时才加载 -->
    <LazyQuickBodyDataDialog
      v-if="showBodyDataDialog"
      v-model:open="showBodyDataDialog"
      @success="handleDialogSuccess"
    />
    <LazyQuickDietDialog
      v-if="showDietDialog"
      v-model:open="showDietDialog"
      @success="handleDialogSuccess"
    />

    <LazyQuickExerciseDialog
      v-if="showExerciseDialog"
      v-model:open="showExerciseDialog"
      @success="handleDialogSuccess"
    />

    <!-- AI 聊天面板 -->
    <AIChatPalette v-model:open="showAIChatPalette" />
  </UPage>
</template>
