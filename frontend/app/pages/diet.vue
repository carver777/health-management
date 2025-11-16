<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import type { DateValue } from '@internationalized/date'

// TableColumn 类型别名
type TableColumn<T> = ColumnDef<T>

interface PageInfo {
  current: number
  size: number
  total: number
}

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const toast = useToast()
const showAIChatPalette = ref(false)

const dietList = ref<DietRecord[]>([])
const todayDietList = ref<DietRecord[]>([])
const loading = ref(false)
const showDialog = ref(false)
const editingItem = ref<DietRecord | null>(null)

const pageInfo = reactive<PageInfo>({
  current: 1,
  size: 10,
  total: 0
})

// 筛选器状态
const filterMealType = ref<string>('all')

// 日期配置
const startDateCalendar = shallowRef<DateValue | null>(null)
const endDateCalendar = shallowRef<DateValue | null>(null)

// 用餐类型选项
const mealTypeOptions = [
  { label: '全部', value: 'all' },
  { label: '早餐', value: '早餐' },
  { label: '午餐', value: '午餐' },
  { label: '晚餐', value: '晚餐' },
  { label: '加餐', value: '加餐' }
]

// 今日统计计算属性
const todayCalories = computed(() => {
  return todayDietList.value.reduce((sum, diet) => sum + (diet.estimatedCalories || 0), 0)
})

const todayBreakfast = computed(() => {
  return todayDietList.value.filter((diet) => diet.mealType === '早餐').length
})

const todayLunch = computed(() => {
  return todayDietList.value.filter((diet) => diet.mealType === '午餐').length
})

const todayDinner = computed(() => {
  return todayDietList.value.filter((diet) => diet.mealType === '晚餐').length
})

const todaySnack = computed(() => {
  return todayDietList.value.filter((diet) => diet.mealType === '加餐').length
})

const todayMealsTotal = computed(() => {
  return todayBreakfast.value + todayLunch.value + todayDinner.value
})

// 健康目标
const healthGoals = reactive({ dailyCaloriesIntake: null as number | null })

const loadHealthGoals = () => {
  if (!import.meta.client) return
  const savedGoals = localStorage.getItem('healthGoals')
  if (savedGoals) {
    const parsed = JSON.parse(savedGoals)
    healthGoals.dailyCaloriesIntake = parsed.dailyCaloriesIntake
  }
}

// 获取用餐类型的颜色和图标
const getMealTypeColor = (type: string): 'success' | 'primary' | 'warning' | 'neutral' => {
  const colorMap: Record<string, 'success' | 'primary' | 'warning' | 'neutral'> = {
    早餐: 'success',
    午餐: 'primary',
    晚餐: 'warning',
    加餐: 'neutral'
  }
  return colorMap[type] || 'neutral'
}

const getMealTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    早餐: 'mdi:weather-sunny',
    午餐: 'mdi:silverware-fork-knife',
    晚餐: 'mdi:weather-night',
    加餐: 'mdi:food-apple'
  }
  return iconMap[type] || 'mdi:food-apple'
}

// 热量等级计算
const getCalorieLevel = (
  calories: number
): { text: string; color: 'success' | 'warning' | 'error' } => {
  if (calories < 200) return { text: '低热量', color: 'success' }
  if (calories < 500) return { text: '中热量', color: 'warning' }
  return { text: '高热量', color: 'error' }
}

// 表格列定义
const columns: TableColumn<DietRecord>[] = [
  {
    accessorKey: 'recordDate',
    header: '记录日期',
    cell: ({ row }) => {
      return h(
        'span',
        {
          class:
            'rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        },
        formatDisplayDate(row.original.recordDate)
      )
    }
  },
  {
    accessorKey: 'mealType',
    header: '用餐类型',
    cell: ({ row }) => {
      const color = getMealTypeColor(row.original.mealType)
      const icon = getMealTypeIcon(row.original.mealType)
      const colorClasses: Record<string, string> = {
        success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        warning: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
        neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      }
      return h(
        'span',
        {
          class: `inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${colorClasses[color]}`
        },
        [h('i', { class: `${icon} text-sm` }), row.original.mealType]
      )
    }
  },
  {
    accessorKey: 'foodName',
    header: '食物名称',
    cell: ({ row }) => {
      return h(
        'span',
        { class: 'font-medium text-gray-900 dark:text-gray-100' },
        row.original.foodName
      )
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

const formatDate = (date: DateValue | null, placeholder: string): string => {
  return date ? dateValueToString(date) : placeholder
}

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

// 加载列表数据
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
    if (startDateCalendar.value || endDateCalendar.value) {
      const startStr = startDateCalendar.value ? dateValueToString(startDateCalendar.value) : null
      const endStr = endDateCalendar.value
        ? dateValueToString(endDateCalendar.value)
        : dateValueToString(getTodayDateValue())

      // 如果只选了开始日期，使用默认结束日期（今天）
      if (startStr && endStr) {
        // 验证日期范围：开始日期不能晚于结束日期
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

// 打开添加对话框
const openAddDialog = () => {
  editingItem.value = null
  showDialog.value = true
}

// 打开编辑对话框
const openEditDialog = (item: DietRecord) => {
  editingItem.value = item
  showDialog.value = true
}

// 对话框成功回调
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

// 重置筛选器
const resetFilter = () => {
  startDateCalendar.value = null
  endDateCalendar.value = null
  filterMealType.value = 'all'
  pageInfo.current = 1
  loadData()
}

const handlePageChange = (page: number) => {
  pageInfo.current = page
  loadData()
}

// 生命周期
onMounted(() => {
  loadHealthGoals()
  loadData()
  loadTodayData()
})
</script>

<template>
  <UPage>
    <!-- 页面标题 -->
    <UPageHeader title="饮食管理" description="记录和管理您的日常饮食">
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
              <div class="text-3xl font-bold">{{ todayCalories }}</div>
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
              <div class="text-3xl font-bold">{{ todayMealsTotal }}</div>
              <div class="text-sm">今日三餐</div>
              <div class="text-xs">
                早餐 {{ todayBreakfast }} | 午餐 {{ todayLunch }} | 晚餐 {{ todayDinner }}
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
              <div class="text-3xl font-bold">{{ todaySnack }}</div>
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
          <!-- 开始日期 -->
          <div class="min-w-[200px] flex-1">
            <label for="diet-filter-start-date" class="mb-2 block text-sm font-medium"
              >开始日期</label
            >
            <DatePicker
              id="diet-filter-start-date"
              v-model="startDateCalendar"
              block
              :placeholder="formatDate(startDateCalendar, '选择开始日期')"
              @update:model-value="loadData"
            />
          </div>

          <!-- 结束日期 -->
          <div class="min-w-[200px] flex-1">
            <label for="diet-filter-end-date" class="mb-2 block text-sm font-medium"
              >结束日期</label
            >
            <DatePicker
              id="diet-filter-end-date"
              v-model="endDateCalendar"
              block
              :placeholder="formatDate(endDateCalendar, '选择结束日期')"
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
              value-key="value"
              :items="mealTypeOptions"
              placeholder="全部"
              class="w-full"
              @change="loadData"
            />
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

      <!-- AI 聊天面板 -->
      <AIChatPalette v-model:open="showAIChatPalette" />
    </UPageBody>
  </UPage>
</template>
