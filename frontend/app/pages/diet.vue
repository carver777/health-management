<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import type { DateValue } from '@internationalized/date'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const toast = useToast()
const dietList = ref<DietRecord[]>([])
const todayDietList = ref<DietRecord[]>([])
const loading = ref(false)
const showDialog = ref(false)
const editingItem = ref<DietRecord | null>(null)

const pageInfo = reactive({
  current: 1,
  size: 10,
  total: 0
})

const filterMealType = ref<string>('all')
const dateRange = shallowRef<{ start: DateValue; end: DateValue } | null>(null)

const mealTypeOptions = [
  { label: '全部', value: 'all', icon: 'mdi:silverware' },
  { label: '早餐', value: '早餐', icon: 'mdi:bread-slice' },
  { label: '午餐', value: '午餐', icon: 'mdi:rice' },
  { label: '晚餐', value: '晚餐', icon: 'mdi:noodles' },
  { label: '加餐', value: '加餐', icon: 'mdi:food-apple' }
]

const todayStats = computed(() => {
  const meals = {
    breakfast: todayDietList.value.filter((d) => d.mealType === '早餐').length,
    lunch: todayDietList.value.filter((d) => d.mealType === '午餐').length,
    dinner: todayDietList.value.filter((d) => d.mealType === '晚餐').length,
    snack: todayDietList.value.filter((d) => d.mealType === '加餐').length
  }
  return {
    calories: todayDietList.value.reduce((sum, d) => sum + (d.estimatedCalories || 0), 0),
    ...meals,
    total: meals.breakfast + meals.lunch + meals.dinner
  }
})

const healthGoals = reactive({ dailyCaloriesIntake: null as number | null })

const loadHealthGoals = () => {
  if (!import.meta.client) return
  const saved = localStorage.getItem('healthGoals')
  if (saved) healthGoals.dailyCaloriesIntake = JSON.parse(saved).dailyCaloriesIntake
}

const getCalorieLevel = (
  calories: number
): { text: string; color: 'success' | 'warning' | 'error' } => {
  if (calories < 200) return { text: '低热量', color: 'success' }
  if (calories < 500) return { text: '中热量', color: 'warning' }
  return { text: '高热量', color: 'error' }
}

const columns: ColumnDef<DietRecord>[] = [
  {
    accessorKey: 'recordDate',
    header: '记录日期',
    cell: ({ row }) => {
      return h('span', { class: 'text-sm' }, formatDisplayDate(row.original.recordDate))
    }
  },
  {
    accessorKey: 'mealType',
    header: '用餐类型',
    cell: ({ row }) => {
      return h('span', { class: 'text-sm font-medium' }, row.original.mealType)
    }
  },
  {
    accessorKey: 'foodName',
    header: '食物名称',
    cell: ({ row }) => {
      return h('span', { class: 'text-sm' }, row.original.foodName)
    }
  },
  {
    accessorKey: 'estimatedCalories',
    header: '摄入热量 (kcal)',
    cell: ({ row }) => {
      const calories = row.original.estimatedCalories ?? 0
      const level = getCalorieLevel(calories)
      const levelColorClasses: Record<string, string> = {
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700'
      }
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'font-bold text-red-500' }, `${calories} kcal`),
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
            onClick: () => deleteItem(row.original)
          },
          '删除'
        )
      ])
    }
  }
]

// 加载今日数据（不受分页影响）
const loadTodayData = async () => {
  try {
    const userID = useCookie('userID')
    const token = useCookie('token')

    if (!userID.value || !token.value) {
      todayDietList.value = []
      return
    }

    const todayLocal = dateValueToString(getTodayDateValue())

    const response = await $fetch<{
      code: number
      data: { rows: DietRecord[]; total: number }
    }>('/api/diet-items', {
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
    })

    if (response.code === 1 && response.data) {
      todayDietList.value = response.data.rows || []
    }
  } catch {
    todayDietList.value = []
  }
}

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

    if (filterMealType.value && filterMealType.value !== 'all') {
      params.mealType = filterMealType.value
    }

    const response = await $fetch<{
      code: number
      data: { rows: DietRecord[]; total: number }
    }>('/api/diet-items', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      params
    })

    if (response.code === 1 && response.data) {
      dietList.value = response.data.rows
      pageInfo.total = response.data.total
    } else {
      throw new Error('数据格式错误')
    }
  } catch {
    toast.add({ title: '加载数据失败', color: 'error' })
    dietList.value = []
    pageInfo.total = 0
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  editingItem.value = null
  showDialog.value = true
}

const openEditDialog = (item: DietRecord) => {
  editingItem.value = item
  showDialog.value = true
}

const handleDialogSuccess = () => {
  loadData()
  loadTodayData()
}

const deleteItem = async (item: DietRecord) => {
  try {
    const token = useCookie('token')
    if (!token.value) {
      toast.add({ title: '请先登录', color: 'error' })
      return
    }

    const response = await $fetch<{ code: number }>(`/api/diet-items/${item.dietItemID}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.code === 1) {
      toast.add({ title: '删除成功', color: 'success' })
      await loadData()
      await loadTodayData()
    } else {
      throw new Error('删除失败')
    }
  } catch {
    toast.add({ title: '删除失败', color: 'error' })
  }
}

const resetFilter = () => {
  dateRange.value = null
  filterMealType.value = 'all'
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
    <!-- 页面标题 -->
    <UPageHeader title="饮食管理" description="记录和管理您的日常饮食" class="pt-2! sm:pt-3!">
      <template #icon>
        <UIcon name="mdi:food-apple" />
      </template>
    </UPageHeader>

    <UPageBody>
      <!-- 统计卡片 -->
      <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <!-- 今日摄入卡路里 -->
        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3">
              <UIcon name="mdi:fire" class="text-3xl" />
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold">{{ todayStats.calories }}</div>
              <div class="text-sm">今日摄入卡路里（kcal）</div>
              <div v-if="healthGoals.dailyCaloriesIntake" class="text-xs">
                目标: {{ healthGoals.dailyCaloriesIntake }} kcal
              </div>
              <div v-else class="text-xs">目标: 未设置</div>
            </div>
          </div>
        </UCard>

        <!-- 今日三餐 -->
        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3">
              <UIcon name="mdi:silverware-fork-knife" class="text-3xl" />
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold">{{ todayStats.total }}</div>
              <div class="text-sm">今日三餐</div>
              <div class="text-xs">
                早餐 {{ todayStats.breakfast }} | 午餐 {{ todayStats.lunch }} | 晚餐
                {{ todayStats.dinner }}
              </div>
            </div>
          </div>
        </UCard>

        <!-- 今日加餐 -->
        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3">
              <UIcon name="mdi:food-variant" class="text-3xl" />
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold">{{ todayStats.snack }}</div>
              <div class="text-sm">今日加餐</div>
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
            <label for="diet-filter-date-range" class="mb-2 block text-sm font-medium"
              >日期范围</label
            >
            <UInputDate
              id="diet-filter-date-range"
              v-model="dateRange"
              range
              icon="heroicons:calendar"
              class="w-full"
              @update:model-value="loadData"
            />
          </div>

          <!-- 用餐类型 -->
          <div class="min-w-[200px] flex-1">
            <label for="diet-filter-meal-type" class="mb-2 block text-sm font-medium"
              >用餐类型</label
            >
            <USelect
              id="diet-filter-meal-type"
              v-model="filterMealType"
              :items="mealTypeOptions"
              value-key="value"
              class="w-full"
              @update:model-value="loadData"
            >
              <template #leading>
                <UIcon
                  :name="
                    mealTypeOptions.find((opt) => opt.value === filterMealType)?.icon ||
                    'mdi:silverware'
                  "
                  class="h-5 w-5"
                />
              </template>
            </USelect>
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
              饮食记录
            </h3>
            <UButton color="primary" @click="openAddDialog">
              <template #leading>
                <UIcon name="heroicons:plus" />
              </template>
              添加记录
            </UButton>
          </div>
        </template>

        <UTable :columns="columns" :data="dietList" :loading="loading">
          <template #empty>
            <div class="py-12 text-center">没有数据</div>
          </template>
        </UTable>

        <!-- 分页 -->
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

      <!-- 饮食记录对话框 -->
      <QuickDietDialog
        v-model:open="showDialog"
        :edit-item="editingItem"
        @success="handleDialogSuccess"
      />
    </UPageBody>
  </UPage>
</template>
