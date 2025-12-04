<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const toast = useToast()
const userIDCookie = useCookie<string | null>('userID')
const tokenCookie = useCookie<string | null>('token')

const authHeaders = computed(() =>
  tokenCookie.value ? { Authorization: `Bearer ${tokenCookie.value}` } : undefined
)

// 对话框状态
const showBodyDataDialog = ref(false)
const showDietDialog = ref(false)
const showExerciseDialog = ref(false)

// 图表时间段
const caloriesTimePeriod = ref<string>('7d')
const weightTimePeriod = ref<string>('7d')

const weightData = ref<{ date: string; weight: number }[]>([])
const caloriesData = ref<{ date: string; intake: number; burn: number; net: number }[]>([])

const statistics = reactive({
  totalCaloriesConsumed: 0,
  totalCaloriesBurned: 0,
  averageWeight: 0,
  totalSleepHours: 0
})

// 健康目标数据
const healthGoals = reactive({
  targetWeight: null as number | null,
  dailyCaloriesIntake: null as number | null,
  dailyCaloriesBurn: null as number | null,
  dailySleepHours: null as number | null
})

const loadWeightData = async () => {
  if (!import.meta.client || !userIDCookie.value) return

  try {
    const days = parseDaysFromPeriod(weightTimePeriod.value)
    const { startDate, endDate } = getDateRangeByDays(days)

    const response = await $fetch<{
      code: number
      data: { rows: Array<{ recordDate: string; weightKG: number }> }
    }>('/api/body-metrics', {
      params: { userID: userIDCookie.value, startDate, endDate, page: 1, pageSize: days },
      headers: authHeaders.value
    })

    weightData.value =
      response.data?.rows?.map((item) => ({
        date: item.recordDate,
        weight: item.weightKG || 0
      })) || []
  } catch {
    toast.add({ title: '加载体重数据失败', color: 'error' })
    weightData.value = []
  }
}

const loadCaloriesData = async () => {
  if (!import.meta.client || !userIDCookie.value) return

  try {
    const days = parseDaysFromPeriod(caloriesTimePeriod.value)
    const { startDate, endDate } = getDateRangeByDays(days)
    const params = { userID: userIDCookie.value, startDate, endDate, page: 1, pageSize: 1000 }

    const [dietResponse, exerciseResponse] = await Promise.all([
      $fetch<{
        code: number
        data: { rows: Array<{ recordDate: string; estimatedCalories: number }> }
      }>('/api/diet-items', { params, headers: authHeaders.value }),
      $fetch<{
        code: number
        data: { rows: Array<{ recordDate: string; estimatedCaloriesBurned: number }> }
      }>('/api/exercise-items', { params, headers: authHeaders.value })
    ])

    const dateMap = new Map<string, { intake: number; burn: number }>()

    dietResponse.data?.rows?.forEach((item) => {
      const existing = dateMap.get(item.recordDate) || { intake: 0, burn: 0 }
      existing.intake += item.estimatedCalories || 0
      dateMap.set(item.recordDate, existing)
    })

    exerciseResponse.data?.rows?.forEach((item) => {
      const existing = dateMap.get(item.recordDate) || { intake: 0, burn: 0 }
      existing.burn += item.estimatedCaloriesBurned || 0
      dateMap.set(item.recordDate, existing)
    })

    caloriesData.value = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]!
      const data = dateMap.get(dateStr) || { intake: 0, burn: 0 }
      return {
        date: dateStr,
        intake: data.intake,
        burn: data.burn,
        net: data.intake - data.burn
      }
    })
  } catch {
    toast.add({ title: '加载卡路里数据失败', color: 'error' })
    caloriesData.value = []
  }
}

const loadHealthGoals = () => {
  if (!import.meta.client) return
  try {
    const saved = localStorage.getItem('healthGoals')
    if (!saved) return

    const parsed = JSON.parse(saved)
    healthGoals.targetWeight = parsed.targetWeight
    healthGoals.dailyCaloriesIntake = parsed.dailyCaloriesIntake || parsed.dailyCalories
    healthGoals.dailyCaloriesBurn = parsed.dailyCaloriesBurn
    healthGoals.dailySleepHours = parsed.dailySleepHours
  } catch {
    // 忽略加载错误
  }
}

const refreshData = async () => {
  if (!import.meta.client || !userIDCookie.value) return

  try {
    const today = new Date().toISOString().split('T')[0]
    const userID = userIDCookie.value
    const todayParams = { userID, startDate: today, endDate: today, page: 1, pageSize: 1000 }

    const [bodyResponse, dietResponse, exerciseResponse, sleepResponse] = await Promise.all([
      $fetch<{ code: number; data: { rows: Array<{ weightKG: number }> } }>('/api/body-metrics', {
        params: { userID, page: 1, pageSize: 1 },
        headers: authHeaders.value
      }),
      $fetch<{ code: number; data: { rows: Array<{ estimatedCalories: number }> } }>(
        '/api/diet-items',
        { params: todayParams, headers: authHeaders.value }
      ),
      $fetch<{ code: number; data: { rows: Array<{ estimatedCaloriesBurned: number }> } }>(
        '/api/exercise-items',
        { params: todayParams, headers: authHeaders.value }
      ),
      $fetch<{
        code: number
        data: { rows: Array<{ bedTime?: string | null; wakeTime?: string | null }> }
      }>('/api/sleep-items', { params: todayParams, headers: authHeaders.value })
    ])

    statistics.averageWeight = bodyResponse.data?.rows?.[0]?.weightKG || 0
    statistics.totalCaloriesConsumed =
      dietResponse.data?.rows?.reduce((sum, item) => sum + (item.estimatedCalories || 0), 0) || 0
    statistics.totalCaloriesBurned =
      exerciseResponse.data?.rows?.reduce(
        (sum, item) => sum + (item.estimatedCaloriesBurned || 0),
        0
      ) || 0

    const sleepMinutes =
      sleepResponse.data?.rows?.reduce((sum, item) => {
        if (!item.bedTime || !item.wakeTime) return sum
        const diff = new Date(item.wakeTime).getTime() - new Date(item.bedTime).getTime()
        return sum + (diff > 0 ? diff / 60000 : 0)
      }, 0) || 0
    statistics.totalSleepHours = sleepMinutes / 60

    await Promise.all([loadWeightData(), loadCaloriesData()])
  } catch {
    toast.add({ title: '加载数据失败', color: 'error' })
  }
}

onMounted(async () => {
  loadHealthGoals()
  await refreshData()
})

watch(weightTimePeriod, loadWeightData)
watch(caloriesTimePeriod, loadCaloriesData)

const handleDialogSuccess = () => {
  refreshData()
}
</script>

<template>
  <UPage>
    <UPageHeader
      title="数据概览"
      description="全面了解您的健康状况，追踪每日进展"
      class="pt-2! sm:pt-3!"
    >
      <template #icon>
        <UIcon name="mdi:view-dashboard" />
      </template>
    </UPageHeader>

    <UPageBody>
      <!-- 统计卡片 -->
      <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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

        <UCard>
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg">
              <UIcon name="mdi:sleep" class="text-2xl" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-2xl font-bold">
                {{ statistics.totalSleepHours.toFixed(1) }}
              </div>
              <div class="mt-1 text-sm">今日睡眠（小时）</div>
              <div class="mt-1 text-xs">
                目标: {{ healthGoals.dailySleepHours || '未设置'
                }}{{ healthGoals.dailySleepHours ? ' 小时' : '' }}
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- 数据趋势图表 -->
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

    <!-- 快速记录对话框 -->
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
  </UPage>
</template>
