<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import type { DateValue } from '@internationalized/date'

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

const sleepList = ref<SleepRecord[]>([])
const todaySleepList = ref<SleepRecord[]>([])
const loading = ref(false)
const showDialog = ref(false)
const editingItem = ref<SleepRecord | null>(null)

const pageInfo = reactive<PageInfo>({
  current: 1,
  size: 10,
  total: 0
})

const startDateCalendar = shallowRef<DateValue | null>(null)
const endDateCalendar = shallowRef<DateValue | null>(null)

const healthGoals = reactive({ dailySleepHours: null as number | null })

const loadHealthGoals = () => {
  if (!import.meta.client) return
  const saved = localStorage.getItem('healthGoals')
  if (!saved) return
  try {
    const parsed = JSON.parse(saved)
    healthGoals.dailySleepHours = parsed.dailySleepHours ?? null
  } catch {
    healthGoals.dailySleepHours = null
  }
}

// 计算单条记录的分钟数，用于多处统计
const getSleepDurationMinutes = (record: SleepRecord): number => {
  if (!record.bedTime || !record.wakeTime) return 0
  const bed = new Date(record.bedTime)
  const wake = new Date(record.wakeTime)
  if (Number.isNaN(bed.getTime()) || Number.isNaN(wake.getTime())) return 0
  return Math.max(0, Math.round((wake.getTime() - bed.getTime()) / 60000))
}

// 将分钟值格式化成人类可读的小时+分钟
const formatDuration = (minutes: number): string => {
  if (!minutes) return '--'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours} 小时 ${mins} 分`
}

// 为列表提供统一的日期时间展示
const formatDateTimeDisplay = (value?: string | null): string => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// 今日指标
const todaySleepMinutes = computed(() => {
  return todaySleepList.value.reduce((sum, item) => sum + getSleepDurationMinutes(item), 0)
})

const todaySleepHoursDisplay = computed(() => (todaySleepMinutes.value / 60).toFixed(1))
const todaySleepSessions = computed(() => todaySleepList.value.length)

// 列表中的平均数用于卡片展示
const averageSleepMinutes = computed(() => {
  if (!sleepList.value.length) return 0
  const totalMinutes = sleepList.value.reduce((sum, item) => sum + getSleepDurationMinutes(item), 0)
  const validCount = sleepList.value.filter((item) => item.bedTime && item.wakeTime).length || 1
  return Math.round(totalMinutes / validCount)
})

const goalCompletion = computed(() => {
  if (!healthGoals.dailySleepHours || !todaySleepMinutes.value) return '--'
  const targetMinutes = healthGoals.dailySleepHours * 60
  if (!targetMinutes) return '--'
  const ratio = Math.min(100, Math.round((todaySleepMinutes.value / targetMinutes) * 100))
  return `${ratio}%`
})

// 表格列配置，尽量复用上面的格式化工具
const columns: TableColumn<SleepRecord>[] = [
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
    accessorKey: 'bedTime',
    header: '入睡时间',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-sm text-gray-700 dark:text-gray-200' },
        formatDateTimeDisplay(row.original.bedTime)
      )
  },
  {
    accessorKey: 'wakeTime',
    header: '起床时间',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-sm text-gray-700 dark:text-gray-200' },
        formatDateTimeDisplay(row.original.wakeTime)
      )
  },
  {
    id: 'duration',
    header: '睡眠时长',
    cell: ({ row }) => {
      const minutes = getSleepDurationMinutes(row.original)
      if (!minutes) {
        return h('span', { class: 'text-gray-400' }, '—')
      }
      const badge =
        minutes >= 480
          ? {
              text: '充足',
              classes: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            }
          : minutes >= 360
            ? {
                text: '正常',
                classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              }
            : {
                text: '不足',
                classes: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'font-semibold text-primary-600' }, formatDuration(minutes)),
        h(
          'span',
          { class: `rounded-md px-2 py-0.5 text-xs font-medium ${badge.classes}` },
          badge.text
        )
      ])
    }
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) =>
      h('div', { class: 'flex gap-2' }, [
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
]

const formatDate = (date: DateValue | null, placeholder: string): string => {
  return date ? dateValueToString(date) : placeholder
}

// 分页查询睡眠记录，并支持日期筛选
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

    if (startDateCalendar.value || endDateCalendar.value) {
      const startStr = startDateCalendar.value ? dateValueToString(startDateCalendar.value) : null
      const endStr = endDateCalendar.value
        ? dateValueToString(endDateCalendar.value)
        : dateValueToString(getTodayDateValue())

      if (startStr && endStr) {
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

    const response = await $fetch<{ code: number; data: { rows: SleepRecord[]; total: number } }>(
      '/api/sleep-items',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        params
      }
    )

    if (response.code === 1 && response.data) {
      sleepList.value = response.data.rows || []
      pageInfo.total = response.data.total || 0
    } else {
      throw new Error('数据格式错误')
    }
  } catch {
    toast.add({ title: '加载睡眠数据失败', color: 'error' })
    sleepList.value = []
    pageInfo.total = 0
  } finally {
    loading.value = false
  }
}

// 单独查询今日数据供统计卡片使用
const loadTodayData = async () => {
  try {
    const userID = useCookie('userID')
    const token = useCookie('token')

    if (!userID.value || !token.value) {
      todaySleepList.value = []
      return
    }

    const todayLocal = dateValueToString(getTodayDateValue())

    const response = await $fetch<{ code: number; data: { rows: SleepRecord[] } }>(
      '/api/sleep-items',
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
      todaySleepList.value = response.data.rows || []
    }
  } catch {
    todaySleepList.value = []
  }
}

const openAddDialog = () => {
  editingItem.value = null
  showDialog.value = true
}

const openEditDialog = (item: SleepRecord) => {
  editingItem.value = item
  showDialog.value = true
}

const handleDialogSuccess = () => {
  loadData()
  loadTodayData()
}

// 删除单条记录后刷新列表与今日统计
const deleteItem = async (item: SleepRecord) => {
  if (!item.sleepItemID) return

  if (!confirm('确认删除这条睡眠记录吗？')) return

  try {
    const token = useCookie('token')
    if (!token.value) {
      toast.add({ title: '请先登录', color: 'error' })
      return
    }

    const response = await $fetch<{ code: number }>(`/api/sleep-items/${item.sleepItemID}`, {
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
  startDateCalendar.value = null
  endDateCalendar.value = null
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
    <UPageHeader title="睡眠管理" description="记录与分析每日睡眠情况" class="pt-2! sm:pt-3!">
      <template #icon>
        <UIcon name="mdi:sleep" />
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3">
              <UIcon name="mdi:moon-waning-crescent" class="text-3xl" />
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold">{{ todaySleepHoursDisplay }}</div>
              <div class="text-sm">今日睡眠时长（小时）</div>
              <div class="text-xs">
                目标:
                {{ healthGoals.dailySleepHours ? `${healthGoals.dailySleepHours} 小时` : '未设置' }}
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3">
              <UIcon name="mdi:counter" class="text-3xl" />
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold">{{ todaySleepSessions }}</div>
              <div class="text-sm">今日睡眠记录次数</div>
              <div class="text-xs">记录完整的睡眠段越多，分析越准确</div>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3">
              <UIcon name="mdi:chart-areaspline" class="text-3xl" />
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold">{{ formatDuration(averageSleepMinutes) }}</div>
              <div class="text-sm">平均睡眠时长</div>
              <div class="text-xs">今日目标达成率: {{ goalCompletion }}</div>
            </div>
          </div>
        </UCard>
      </div>

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
          <div class="min-w-[200px] flex-1">
            <label for="sleep-filter-start-date" class="mb-2 block text-sm font-medium">
              开始日期
            </label>
            <DatePicker
              id="sleep-filter-start-date"
              v-model="startDateCalendar"
              block
              :placeholder="formatDate(startDateCalendar, '选择开始日期')"
              @update:model-value="loadData"
            />
          </div>

          <div class="min-w-[200px] flex-1">
            <label for="sleep-filter-end-date" class="mb-2 block text-sm font-medium">
              结束日期
            </label>
            <DatePicker
              id="sleep-filter-end-date"
              v-model="endDateCalendar"
              block
              :placeholder="formatDate(endDateCalendar, '选择结束日期')"
              @update:model-value="loadData"
            />
          </div>

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

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="flex items-center gap-2 text-lg font-semibold">
              <UIcon name="heroicons:list-bullet" />
              睡眠记录
            </h3>
            <UButton color="primary" @click="openAddDialog">
              <template #leading>
                <UIcon name="heroicons:plus" />
              </template>
              添加记录
            </UButton>
          </div>
        </template>

        <UTable :columns="columns" :data="sleepList" :loading="loading">
          <template #empty>
            <div class="py-12 text-center">暂无睡眠记录</div>
          </template>
        </UTable>

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

      <QuickSleepDialog
        v-model:open="showDialog"
        :edit-item="editingItem"
        @success="handleDialogSuccess"
      />

      <AIChatPalette v-model:open="showAIChatPalette" />
    </UPageBody>
  </UPage>
</template>
