<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import type { DateValue } from '@internationalized/date'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const toast = useToast()
const bodyDataList = ref<BodyData[]>([])
const loading = ref(false)
const showDialog = ref(false)
const editingItem = ref<BodyData | null>(null)

const pageInfo = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 日期配置
const dateRange = shallowRef<{ start: DateValue; end: DateValue } | null>(null)

const latestBodyData = computed(() => bodyDataList.value[0] || null)

const latestWeight = computed(() => latestBodyData.value?.weightKG?.toFixed(1) || '--')
const latestHeight = computed(() => latestBodyData.value?.heightCM?.toFixed(0) || '--')

const bmiInfo = computed(() => {
  const bmi = calcBMI({
    weightKG: latestBodyData.value?.weightKG ?? 0,
    heightCM: latestBodyData.value?.heightCM ?? 0
  })
  const status = getBMIStatus(bmi)
  return {
    value: bmi == null ? '--' : bmi.toFixed(1),
    status: status.status,
    color: status.color
  }
})

const healthGoals = reactive({ targetWeight: null as number | null })

const loadHealthGoals = () => {
  if (!import.meta.client) return
  const saved = localStorage.getItem('healthGoals')
  if (saved) healthGoals.targetWeight = JSON.parse(saved).targetWeight
}

const columns: ColumnDef<BodyData>[] = [
  {
    accessorKey: 'recordDate',
    header: '记录日期',
    cell: ({ row }) => {
      return h('span', { class: 'text-sm' }, formatDisplayDate(row.original.recordDate))
    }
  },
  {
    accessorKey: 'weightKG',
    header: '体重 (kg)',
    cell: ({ row }) => {
      return h('span', { class: 'text-sm' }, `${row.getValue<number>('weightKG').toFixed(1)} kg`)
    }
  },
  {
    accessorKey: 'heightCM',
    header: '身高 (cm)',
    cell: ({ row }) => {
      return h('span', { class: 'text-sm' }, `${row.getValue<number>('heightCM').toFixed(0)} cm`)
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

const openAddDialog = () => {
  editingItem.value = null
  showDialog.value = true
}

const openEditDialog = (item: BodyData) => {
  editingItem.value = item
  showDialog.value = true
}

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

const resetFilter = () => {
  dateRange.value = null
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
})
</script>

<template>
  <UPage>
    <!-- 页面标题 -->
    <UPageHeader title="身体数据管理" description="记录和管理您的身体数据" class="pt-2! sm:pt-3!">
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
              <div class="text-3xl font-bold">{{ bmiInfo.value }}</div>
              <div class="text-sm">BMI 指数</div>
              <div :class="['text-sm font-medium', bmiInfo.color]">{{ bmiInfo.status }}</div>
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
            <label for="body-filter-date-range" class="mb-2 block text-sm font-medium"
              >日期范围</label
            >
            <UInputDate
              id="body-filter-date-range"
              v-model="dateRange"
              range
              class="w-full"
              icon="heroicons:calendar"
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
    </UPageBody>
  </UPage>
</template>
