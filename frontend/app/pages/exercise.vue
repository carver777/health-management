<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import type { DateValue } from '@internationalized/date'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const toast = useToast()
const exerciseList = ref<ExerciseRecord[]>([])
const todayExerciseList = ref<ExerciseRecord[]>([])
const loading = ref(false)
const showDialog = ref(false)
const editingItem = ref<ExerciseRecord | null>(null)

const pageInfo = reactive({
  current: 1,
  size: 10,
  total: 0
})

const filterExerciseType = ref<string>('all')
const dateRange = shallowRef<{ start: DateValue; end: DateValue } | null>(null)

const exerciseTypeOptions = [
  { label: '全部', value: 'all', icon: 'mdi:human' },
  { label: '跑步', value: '跑步', icon: 'mdi:run' },
  { label: '游泳', value: '游泳', icon: 'mdi:swim' },
  { label: '骑行', value: '骑行', icon: 'mdi:bike' },
  { label: '徒步', value: '徒步', icon: 'mdi:walk' },
  { label: '爬山', value: '爬山', icon: 'mdi:image-filter-hdr' },
  { label: '跳绳', value: '跳绳', icon: 'mdi:jump-rope' },
  { label: '篮球', value: '篮球', icon: 'mdi:basketball' },
  { label: '足球', value: '足球', icon: 'mdi:soccer' },
  { label: '羽毛球', value: '羽毛球', icon: 'mdi:badminton' },
  { label: '乒乓球', value: '乒乓球', icon: 'mdi:table-tennis' },
  { label: '网球', value: '网球', icon: 'mdi:tennis' },
  { label: '健身房训练', value: '健身房训练', icon: 'mdi:dumbbell' },
  { label: '瑜伽', value: '瑜伽', icon: 'mdi:yoga' },
  { label: '普拉提', value: '普拉提', icon: 'mdi:meditation' },
  { label: '力量训练', value: '力量训练', icon: 'mdi:weight-lifter' }
]

const todayStats = computed(() => ({
  calories: todayExerciseList.value.reduce((sum, e) => sum + (e.estimatedCaloriesBurned || 0), 0),
  duration: todayExerciseList.value.reduce((sum, e) => sum + (e.durationMinutes || 0), 0),
  count: todayExerciseList.value.length
}))

const healthGoals = reactive({ dailyCaloriesBurn: null as number | null })

const loadHealthGoals = () => {
  if (!import.meta.client) return
  const saved = localStorage.getItem('healthGoals')
  if (saved) healthGoals.dailyCaloriesBurn = JSON.parse(saved).dailyCaloriesBurn
}

const getIntensityLevel = (
  caloriesBurned: number | null,
  duration: number | null
): { text: string; color: 'success' | 'warning' | 'error' } => {
  if (!caloriesBurned || !duration) return { text: '未知', color: 'success' }
  const intensity = caloriesBurned / duration
  if (intensity < 5) return { text: '轻度', color: 'success' }
  if (intensity < 10) return { text: '中度', color: 'warning' }
  return { text: '高强度', color: 'error' }
}

const columns: ColumnDef<ExerciseRecord>[] = [
  {
    accessorKey: 'recordDate',
    header: '记录日期',
    cell: ({ row }) => {
      return h('span', { class: 'text-sm' }, formatDisplayDate(row.original.recordDate))
    }
  },
  {
    accessorKey: 'exerciseType',
    header: '运动类型',
    cell: ({ row }) => {
      return h('span', { class: 'text-sm font-medium' }, row.original.exerciseType)
    }
  },
  {
    accessorKey: 'durationMinutes',
    header: '运动时长',
    cell: ({ row }) => {
      return h('span', { class: 'font-medium' }, `${row.original.durationMinutes} 分钟`)
    }
  },
  {
    accessorKey: 'estimatedCaloriesBurned',
    header: '消耗热量',
    cell: ({ row }) => {
      const calories = row.original.estimatedCaloriesBurned ?? 0
      const level = getIntensityLevel(calories, row.original.durationMinutes)
      const levelColorClasses: Record<string, string> = {
        success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      }
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'font-bold text-orange-600' }, `${calories} kcal`),
        h(
          'span',
          {
            class: `rounded-md px-2 py-0.5 text-xs font-medium ${levelColorClasses[level.color]}`
          },
          level.text
        )
      ])
    }
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => {
      return h('div', { class: 'flex gap-2' }, [
        h(
          'button',
          {
            class: 'text-primary-600 hover:text-primary-700 text-sm font-medium',
            onClick: () => openEditDialog(row.original)
          },
          '编辑'
        ),
        h(
          'button',
          {
            class: 'text-red-600 hover:text-red-700 text-sm font-medium',
            onClick: () => deleteItem(row.original.exerciseItemID!)
          },
          '删除'
        )
      ])
    }
  }
]

const loadData = async () => {
  loading.value = true
  try {
    const userID = useCookie('userID')
    const token = useCookie('token')

    if (!userID.value || !token.value) {
      throw new Error('用户未登录')
    }

    const params: Record<string, string | number> = {
      page: pageInfo.current,
      pageSize: pageInfo.size,
      userID: userID.value
    }

    // 处理日期筛选
    if (dateRange.value && (dateRange.value.start || dateRange.value.end)) {
      if (!dateRange.value.start || !dateRange.value.end) {
        toast.add({
          title: '日期范围不完整',
          description: '请填写完整的日期范围',
          color: 'error'
        })
        loading.value = false
        return
      }
      const startStr = dateValueToString(dateRange.value.start)
      const endStr = dateValueToString(dateRange.value.end)
      if (startStr > endStr) {
        toast.add({
          title: '日期范围错误',
          description: '开始日期不能晚于结束日期',
          color: 'error'
        })
        loading.value = false
        return
      }
      params.startDate = startStr
      params.endDate = endStr
    }

    if (filterExerciseType.value && filterExerciseType.value !== 'all') {
      params.exerciseType = filterExerciseType.value
    }

    const response = await $fetch<{
      code: number
      data: { rows: ExerciseRecord[]; total: number }
    }>('/api/exercise-items', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      params
    })

    if (response.code === 1 && response.data) {
      exerciseList.value = response.data.rows || []
      pageInfo.total = response.data.total || 0
    } else {
      throw new Error('数据格式错误')
    }
  } catch {
    toast.add({ title: '加载运动数据失败', color: 'error' })
    exerciseList.value = []
    pageInfo.total = 0
  } finally {
    loading.value = false
  }
}

const loadTodayData = async () => {
  try {
    const userID = useCookie('userID')
    const token = useCookie('token')

    if (!userID.value || !token.value) {
      todayExerciseList.value = []
      return
    }

    const todayLocal = dateValueToString(getTodayDateValue())

    const response = await $fetch<{ code: number; data: { rows: ExerciseRecord[] } }>(
      '/api/exercise-items',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        params: {
          userID: userID.value,
          startDate: todayLocal,
          endDate: todayLocal,
          page: 1,
          pageSize: 1000
        }
      }
    )

    if (response.code === 1 && response.data) {
      todayExerciseList.value = response.data.rows || []
    }
  } catch {
    todayExerciseList.value = []
  }
}

const openAddDialog = () => {
  editingItem.value = null
  showDialog.value = true
}

const openEditDialog = (item: ExerciseRecord) => {
  editingItem.value = item
  showDialog.value = true
}

const handleDialogSuccess = () => {
  loadData()
  loadTodayData()
}

const deleteItem = async (id: number) => {
  if (!confirm('确认删除这条记录吗？')) return

  try {
    const token = useCookie('token')
    if (!token.value) {
      toast.add({ title: '请先登录', color: 'error' })
      return
    }

    await $fetch(`/api/exercise-items/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    toast.add({ title: '删除成功', color: 'success' })
    loadData()
    loadTodayData()
  } catch {
    toast.add({ title: '删除失败', color: 'error' })
  }
}

const resetFilter = () => {
  dateRange.value = null
  filterExerciseType.value = 'all'
  pageInfo.current = 1
  loadData()
}

const handlePageChange = (page: number) => {
  pageInfo.current = page
  loadData()
}

onMounted(() => {
  loadHealthGoals()
  loadData()
  loadTodayData()
})
</script>

<template>
  <UPage>
    <UPageHeader title="运动管理" description="记录和管理您的运动数据" class="pt-2! sm:pt-3!">
      <template #icon>
        <UIcon name="mdi:run-fast" />
      </template>
    </UPageHeader>

    <UPageBody>
      <!-- 统计卡片 -->
      <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <!-- 今日消耗卡路里 -->
        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3">
              <UIcon name="mdi:fire" class="text-3xl" />
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold">{{ todayStats.calories }}</div>
              <div class="text-sm">今日消耗卡路里（kcal）</div>
              <div v-if="healthGoals.dailyCaloriesBurn" class="text-xs">
                目标: {{ healthGoals.dailyCaloriesBurn }} kcal
              </div>
              <div v-else class="text-xs">目标: 未设置</div>
            </div>
          </div>
        </UCard>

        <!-- 今日运动时长 -->
        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3">
              <UIcon name="mdi:clock-outline" class="text-3xl" />
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold">{{ todayStats.duration }}</div>
              <div class="text-sm">今日运动时长（min）</div>
            </div>
          </div>
        </UCard>

        <!-- 今日运动次数 -->
        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3">
              <UIcon name="mdi:trophy" class="text-3xl" />
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold">{{ todayStats.count }}</div>
              <div class="text-sm">今日运动次数</div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- 筛选器 -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="flex items-center gap-2 text-lg font-semibold">
              <UIcon name="heroicons:funnel" />
              数据筛选
            </h3>
          </div>
        </template>

        <div class="flex flex-wrap gap-4">
          <!-- 日期范围 -->
          <div class="min-w-[200px] flex-1">
            <label for="exercise-filter-date-range" class="mb-2 block text-sm font-medium"
              >日期范围</label
            >
            <UInputDate
              id="exercise-filter-date-range"
              v-model="dateRange"
              range
              icon="heroicons:calendar"
              class="w-full"
              @update:model-value="loadData"
            />
          </div>

          <!-- 运动类型 -->
          <div class="min-w-[200px] flex-1">
            <label for="exercise-filter-type" class="mb-2 block text-sm font-medium"
              >运动类型</label
            >
            <USelectMenu
              id="exercise-filter-type"
              v-model="filterExerciseType"
              :items="exerciseTypeOptions"
              value-key="value"
              :search-input="{
                placeholder: '输入运动类型',
                icon: 'mdi:magnify'
              }"
              class="w-full"
              @update:model-value="loadData"
            >
              <template #leading>
                <UIcon
                  :name="
                    exerciseTypeOptions.find((opt) => opt.value === filterExerciseType)?.icon ||
                    'mdi:human'
                  "
                  class="h-5 w-5"
                />
              </template>
            </USelectMenu>
          </div>

          <!-- 重置按钮 -->
          <div class="flex items-end">
            <UButton color="neutral" variant="outline" @click="resetFilter">
              <template #leading>
                <UIcon name="heroicons:arrow-path" />
              </template>
              重置筛选
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- 数据表格 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="flex items-center gap-2 text-lg font-semibold">
              <UIcon name="heroicons:list-bullet" />
              运动记录
            </h3>
            <UButton color="primary" @click="openAddDialog">
              <template #leading>
                <UIcon name="heroicons:plus" />
              </template>
              添加记录
            </UButton>
          </div>
        </template>

        <UTable :data="exerciseList" :columns="columns" :loading="loading" />

        <template #footer>
          <div class="flex items-center justify-center border-t pt-4">
            <UPagination
              v-model:page="pageInfo.current"
              :total="pageInfo.total"
              :items-per-page="pageInfo.size"
              @update:page="handlePageChange"
            />
          </div>
        </template>
      </UCard>

      <!-- 运动记录对话框 -->
      <QuickExerciseDialog
        v-model:open="showDialog"
        :edit-item="editingItem"
        @success="handleDialogSuccess"
      />
    </UPageBody>
  </UPage>
</template>
