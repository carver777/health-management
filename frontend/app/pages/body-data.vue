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

const bodyDataList = ref<BodyData[]>([])
const loading = ref(false)
const showDialog = ref(false)
const editingItem = ref<BodyData | null>(null)

const pageInfo = reactive<PageInfo>({
  current: 1,
  size: 10,
  total: 0
})

// 日期配置
const startDateCalendar = shallowRef<DateValue | null>(null)
const endDateCalendar = shallowRef<DateValue | null>(null)

const latestBodyData = computed(() => {
  return bodyDataList.value.length > 0 ? bodyDataList.value[0] : null
})

const latestWeight = computed(() => {
  return latestBodyData.value?.weightKG?.toFixed(1) || '--'
})

const latestHeight = computed(() => {
  return latestBodyData.value?.heightCM?.toFixed(0) || '--'
})

const latestBMI = computed(() => {
  const bmi = calcBMI({
    weightKG: latestBodyData.value?.weightKG ?? 0,
    heightCM: latestBodyData.value?.heightCM ?? 0
  })
  return bmi == null ? '--' : bmi.toFixed(1)
})

const _latestBMIValue = computed(() =>
  calcBMI({
    weightKG: latestBodyData.value?.weightKG ?? 0,
    heightCM: latestBodyData.value?.heightCM ?? 0
  })
)

const bmiStatus = computed(() => getBMIStatus(_latestBMIValue.value).status)
const bmiStatusColor = computed(() => getBMIStatus(_latestBMIValue.value).color)

const healthGoals = reactive({ targetWeight: null as number | null })

const loadHealthGoals = () => {
  if (!import.meta.client) return
  const savedGoals = localStorage.getItem('healthGoals')
  if (savedGoals) {
    const parsed = JSON.parse(savedGoals)
    healthGoals.targetWeight = parsed.targetWeight
  }
}

const columns: TableColumn<BodyData>[] = [
  {
    accessorKey: 'recordDate',
    header: '记录日期'
  },
  {
    accessorKey: 'weightKG',
    header: '体重 (kg)',
    cell: ({ row }) => {
      return `${row.getValue<number>('weightKG').toFixed(1)} kg`
    }
  },
  {
    accessorKey: 'heightCM',
    header: '身高 (cm)',
    cell: ({ row }) => {
      return `${row.getValue<number>('heightCM').toFixed(0)} cm`
    }
  },
  {
    id: 'bmi',
    header: 'BMI',
    cell: ({ row }) => {
      return formatBMI(row.original)
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

    const response = await $fetch<{
      code: number
      data: { rows: BodyData[]; total: number }
    }>('/api/body-metrics', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      params
    })

    if (response.code === 1 && response.data) {
      bodyDataList.value = response.data.rows
      pageInfo.total = response.data.total
    } else {
      throw new Error('数据格式错误')
    }
  } catch {
    toast.add({ title: '加载数据失败', color: 'error' })
    bodyDataList.value = []
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
const openEditDialog = (item: BodyData) => {
  editingItem.value = item
  showDialog.value = true
}

// 对话框成功回调
const handleDialogSuccess = () => {
  loadData()
}

const deleteItem = async (item: BodyData) => {
  try {
    const token = useCookie('token')
    if (!token.value) {
      toast.add({ title: '请先登录', color: 'error' })
      return
    }

    const response = await $fetch<{ code: number }>(`/api/body-metrics/${item.bodyMetricID}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.code === 1) {
      toast.add({ title: '删除成功', color: 'success' })
      await loadData()
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
})
</script>

<template>
  <UPage>
    <!-- 页面标题 -->
    <UPageHeader title="身体数据管理" description="记录和管理您的身体数据">
      <template #icon>
        <UIcon name="mdi:clipboard-text" />
      </template>
    </UPageHeader>

    <UPageBody>
      <!-- 统计卡片 -->
      <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <!-- 体重卡片 -->
        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3">
              <UIcon name="mdi:scale-bathroom" class="text-3xl" />
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold">{{ latestWeight }}</div>
              <div class="text-sm">当前体重（kg）</div>
              <div v-if="healthGoals.targetWeight" class="text-xs">
                目标: {{ healthGoals.targetWeight }} kg
              </div>
              <div v-else class="text-xs">目标: 未设置</div>
            </div>
          </div>
        </UCard>

        <!-- 身高卡片 -->
        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3">
              <UIcon name="mdi:human-male-height" class="text-3xl" />
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold">{{ latestHeight }}</div>
              <div class="text-sm">当前身高（cm）</div>
            </div>
          </div>
        </UCard>

        <!-- BMI 卡片 -->
        <UCard>
          <div class="flex items-center gap-4">
            <div class="p-3">
              <UIcon name="mdi:chart-bar" class="text-3xl" />
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold">{{ latestBMI }}</div>
              <div class="text-sm">BMI 指数</div>
              <div :class="['text-sm font-medium', bmiStatusColor]">{{ bmiStatus }}</div>
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
            <label for="body-filter-start-date" class="mb-2 block text-sm font-medium"
              >开始日期</label
            >
            <DatePicker
              id="body-filter-start-date"
              v-model="startDateCalendar"
              block
              :placeholder="formatDate(startDateCalendar, '选择开始日期')"
              @update:model-value="loadData"
            />
          </div>

          <!-- 结束日期 -->
          <div class="min-w-[200px] flex-1">
            <label for="body-filter-end-date" class="mb-2 block text-sm font-medium"
              >结束日期</label
            >
            <DatePicker
              id="body-filter-end-date"
              v-model="endDateCalendar"
              block
              :placeholder="formatDate(endDateCalendar, '选择结束日期')"
              @update:model-value="loadData"
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
              数据记录
            </h3>
            <UButton color="primary" @click="openAddDialog">
              <template #leading>
                <UIcon name="heroicons:plus" />
              </template>
              添加记录
            </UButton>
          </div>
        </template>

        <UTable :columns="columns" :data="bodyDataList" :loading="loading">
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

      <!-- 身体数据记录对话框 -->
      <QuickBodyDataDialog
        v-model:open="showDialog"
        :edit-item="editingItem"
        @success="handleDialogSuccess"
      />

      <!-- AI 聊天面板 -->
      <AIChatPalette v-model:open="showAIChatPalette" />
    </UPageBody>
  </UPage>
</template>
