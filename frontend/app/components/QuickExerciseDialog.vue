<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { DateValue } from '@internationalized/date'
import { z } from 'zod'

interface Props {
  open: boolean
  editItem?: ExerciseRecord | null
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toast = useToast()
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

// 日历状态
const calendarValue = shallowRef<DateValue>(getTodayDateValue())

// 用户体重（从最新身体数据获取）
const userWeight = ref<number | null>(null)
const loadingWeight = ref(false)

// 获取用户最新体重
const fetchUserWeight = async () => {
  const token = useCookie('token')
  const userID = useCookie('userID')

  if (!token.value || !userID.value) {
    return
  }

  loadingWeight.value = true
  try {
    const response = await $fetch<{ code: number; data?: { rows?: BodyData[] } }>(
      '/api/body-metrics',
      {
        headers: { Authorization: `Bearer ${token.value}` },
        params: { page: 1, pageSize: 1, userID: userID.value }
      }
    )

    if (response.code === 1 && response.data?.rows?.length) {
      const firstRow = response.data.rows[0]
      if (firstRow) {
        userWeight.value = firstRow.weightKG
      }
    }
  } catch {
    // 静默失败，使用默认值
  } finally {
    loadingWeight.value = false
  }
}

// 表单验证 Schema
const schema = z.object({
  exerciseType: z.string().min(1, '请选择或输入运动类型'),
  durationMinutes: z
    .number({ message: '请输入运动时长' })
    .min(1, '运动时长应在 1-600 min 之间')
    .max(600, '运动时长应在 1-600 min 之间'),
  estimatedCaloriesBurned: z.number({ message: '请输入估计消耗热量' }).min(1, '消耗热量必须大于 0'),
  intensity: z.string().optional()
})

type Schema = z.output<typeof schema>

// 表单状态
const state = reactive<Schema>({
  exerciseType: '',
  durationMinutes: 0,
  estimatedCaloriesBurned: 0,
  intensity: '中等强度'
})

const submitting = ref(false)

// 是否为编辑模式
const isEditMode = computed(() => !!props.editItem)

// 对话框标题
const dialogTitle = computed(() => (isEditMode.value ? '编辑运动记录' : '快速记录运动'))

// 监听对话框打开，重置或填充表单，并获取用户体重
watch(isOpen, async (val) => {
  if (val) {
    // 获取用户最新体重
    await fetchUserWeight()

    if (props.editItem) {
      // 编辑模式：填充现有数据
      state.exerciseType = props.editItem.exerciseType
      calendarValue.value = stringToDateValue(props.editItem.recordDate)
      state.durationMinutes = props.editItem.durationMinutes
      state.estimatedCaloriesBurned = props.editItem.estimatedCaloriesBurned || 0
      state.intensity = '中等强度' // 默认强度
    } else {
      // 新增模式：重置表单
      state.exerciseType = ''
      calendarValue.value = getTodayDateValue()
      state.durationMinutes = 0
      state.estimatedCaloriesBurned = 0
      state.intensity = '中等强度'
    }
  }
})

// 运动类型选项（包含 MET 值）
const exerciseTypeOptions = [
  { label: '跑步', value: '跑步', icon: 'mdi:run', met: { low: 6, medium: 9.8, high: 11.5 } },
  { label: '游泳', value: '游泳', icon: 'mdi:swim', met: { low: 5.8, medium: 8, high: 10 } },
  { label: '骑行', value: '骑行', icon: 'mdi:bike', met: { low: 4, medium: 6.8, high: 10 } },
  { label: '徒步', value: '徒步', icon: 'mdi:walk', met: { low: 2.5, medium: 3.5, high: 5 } },
  {
    label: '爬山',
    value: '爬山',
    icon: 'mdi:image-filter-hdr',
    met: { low: 5, medium: 7, high: 9 }
  },
  { label: '跳绳', value: '跳绳', icon: 'mdi:jump-rope', met: { low: 8, medium: 11, high: 12.3 } },
  { label: '篮球', value: '篮球', icon: 'mdi:basketball', met: { low: 4.5, medium: 6.5, high: 8 } },
  { label: '足球', value: '足球', icon: 'mdi:soccer', met: { low: 5, medium: 7, high: 10 } },
  {
    label: '羽毛球',
    value: '羽毛球',
    icon: 'mdi:badminton',
    met: { low: 4.5, medium: 5.5, high: 7 }
  },
  {
    label: '乒乓球',
    value: '乒乓球',
    icon: 'mdi:table-tennis',
    met: { low: 3, medium: 4, high: 5 }
  },
  { label: '网球', value: '网球', icon: 'mdi:tennis', met: { low: 5, medium: 7, high: 8 } },
  {
    label: '健身房训练',
    value: '健身房训练',
    icon: 'mdi:dumbbell',
    met: { low: 3.5, medium: 5, high: 6 }
  },
  { label: '瑜伽', value: '瑜伽', icon: 'mdi:yoga', met: { low: 2, medium: 3, high: 4 } },
  { label: '普拉提', value: '普拉提', icon: 'mdi:meditation', met: { low: 3, medium: 4, high: 5 } },
  {
    label: '力量训练',
    value: '力量训练',
    icon: 'mdi:weight-lifter',
    met: { low: 3.5, medium: 5, high: 6 }
  }
]

// 强度选项
const intensityOptions = [
  { label: '低强度', value: '低强度', icon: 'mdi:leaf', key: 'low' as const },
  { label: '中等强度', value: '中等强度', icon: 'mdi:speedometer-medium', key: 'medium' as const },
  { label: '高强度', value: '高强度', icon: 'mdi:fire', key: 'high' as const }
]

// 获取强度对应的 key
const getIntensityKey = (intensity: string): 'low' | 'medium' | 'high' => {
  const option = intensityOptions.find((o) => o.value === intensity)
  return option?.key || 'medium'
}

/**
 * 科学计算热量消耗
 * 公式: 热量 (kcal) = MET × 体重 (kg) × 时间 (小时)
 * MET (Metabolic Equivalent of Task) 代谢当量
 */
const calculateCalories = () => {
  if (!state.durationMinutes || !state.exerciseType || !state.intensity) {
    return
  }

  // 获取运动类型的 MET 值
  const exercise = exerciseTypeOptions.find((o) => o.value === state.exerciseType)
  if (!exercise) {
    return
  }

  const intensityKey = getIntensityKey(state.intensity)
  const met = exercise.met[intensityKey]

  // 使用用户体重，如果没有则使用默认值 65kg
  const weight = userWeight.value || 65
  const hours = state.durationMinutes / 60

  // 公式: MET × 体重 (kg) × 时间 (小时)
  state.estimatedCaloriesBurned = Math.round(met * weight * hours)
}

// 监听运动类型、时长、强度变化，自动计算热量
watch([() => state.exerciseType, () => state.durationMinutes, () => state.intensity], () => {
  calculateCalories()
})

// 热量消耗率
const calorieRate = computed(() => {
  if (state.durationMinutes && state.estimatedCaloriesBurned) {
    return (state.estimatedCaloriesBurned / state.durationMinutes).toFixed(1)
  }
  return '0'
})

// 健康指数
const healthScore = computed(() => {
  if (state.durationMinutes && state.estimatedCaloriesBurned) {
    const score = (state.estimatedCaloriesBurned / state.durationMinutes) * 10
    return Math.min(Math.round(score), 100)
  }
  return 0
})

// 进度条颜色
const progressColor = computed(() => {
  if (healthScore.value >= 80) return 'success'
  if (healthScore.value >= 50) return 'warning'
  return 'error'
})

// 强度标签颜色
const intensityColor = computed(() => {
  if (state.intensity === '低强度') return 'success'
  if (state.intensity === '中等强度') return 'warning'
  if (state.intensity === '高强度') return 'error'
  return 'neutral'
})

// 健康提示
const healthTip = computed(() => {
  if (!state.durationMinutes || !state.estimatedCaloriesBurned) return ''

  const rate = state.estimatedCaloriesBurned / state.durationMinutes
  if (rate > 12) {
    return '高强度运动，注意适量，避免过度疲劳'
  } else if (rate < 5) {
    return '轻度运动，建议适当增加运动强度以获得更好效果'
  } else {
    return '运动强度适中，继续保持！'
  }
})

// 提交表单
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  submitting.value = true

  try {
    const userID = useCookie('userID')
    const token = useCookie('token')
    if (!token.value || !userID.value) {
      toast.add({ title: '请先登录', color: 'error' })
      return
    }

    const recordDate = dateValueToString(calendarValue.value)

    const formData: ExerciseRequest = {
      userID: userID.value,
      exerciseType: event.data.exerciseType,
      recordDate,
      durationMinutes: event.data.durationMinutes,
      estimatedCaloriesBurned: event.data.estimatedCaloriesBurned
      // intensity 字段仅用于前端计算和 UI 显示，不发送到后端
    }

    if (isEditMode.value && props.editItem?.exerciseItemID) {
      // 编辑模式
      const response = await $fetch<{ code: number; msg?: string }>(
        `/api/exercise-items/${props.editItem.exerciseItemID}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token.value}`
          },
          body: formData
        }
      )

      if (response.code === 1) {
        toast.add({ title: '运动记录更新成功！', color: 'success' })
        emit('success')
        isOpen.value = false
      } else {
        toast.add({ title: response.msg || '更新失败', color: 'error' })
      }
    } else {
      // 新增模式
      const response = await $fetch<{ code: number; msg?: string; data?: number }>(
        '/api/exercise-items',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`
          },
          body: formData
        }
      )

      if (response.code === 1) {
        toast.add({ title: '运动记录添加成功！', color: 'success' })
        emit('success')
        isOpen.value = false
      } else {
        toast.add({ title: response.msg || '记录失败', color: 'error' })
      }
    }
  } catch (error) {
    const err = error as { data?: { message?: string }; message?: string }
    toast.add({
      title:
        err.data?.message ||
        err.message ||
        (isEditMode.value ? '更新运动记录失败，请重试' : '添加运动记录失败，请重试'),
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="dialogTitle"
    description="记录您的运动活动，包括运动类型、时长和消耗热量"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body="{ close }">
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="记录日期" name="recordDate">
          <DatePicker v-model="calendarValue" />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="运动类型" name="exerciseType">
            <USelectMenu
              v-model="state.exerciseType"
              :items="exerciseTypeOptions"
              value-key="value"
              placeholder="选择运动类型"
              :search-input="{
                placeholder: '输入运动类型',
                icon: 'mdi:magnify'
              }"
            >
              <template #leading="{ modelValue }">
                <UIcon
                  :name="
                    (modelValue && exerciseTypeOptions.find((o) => o.value === modelValue)?.icon) ||
                    'mdi:human'
                  "
                  :class="!modelValue ? 'text-gray-400' : ''"
                />
              </template>
              <template #item="{ item }">
                <div class="flex items-center gap-2">
                  <UIcon :name="item.icon" />
                  <span>{{ item.label }}</span>
                </div>
              </template>
            </USelectMenu>
          </UFormField>

          <UFormField label="运动时长" name="durationMinutes">
            <UInput
              v-model.number="state.durationMinutes"
              type="number"
              placeholder="运动时长"
              :min="1"
              :max="600"
            >
              <template #trailing>
                <span class="text-xs">min</span>
              </template>
            </UInput>
          </UFormField>
        </div>

        <UFormField label="运动强度" name="intensity">
          <div class="flex w-full gap-2">
            <UButton
              v-for="option in intensityOptions"
              :key="option.value"
              :variant="state.intensity === option.value ? 'solid' : 'outline'"
              :color="state.intensity === option.value ? intensityColor : 'neutral'"
              class="flex-1"
              @click="state.intensity = option.value"
            >
              {{ option.label }}
            </UButton>
          </div>
        </UFormField>

        <UFormField label="消耗热量" name="estimatedCaloriesBurned">
          <UInput
            v-model.number="state.estimatedCaloriesBurned"
            type="number"
            placeholder="消耗热量"
            :min="0"
          >
            <template #trailing>
              <span class="text-xs">kcal</span>
            </template>
          </UInput>
          <template #hint>
            <span v-if="loadingWeight" class="text-xs opacity-60">
              <UIcon name="mdi:loading" class="animate-spin" /> 加载体重数据...
            </span>
            <span v-else-if="userWeight" class="text-xs opacity-60">
              基于体重 {{ userWeight }} kg 计算（MET × 体重 × 时间）
            </span>
            <span v-else class="text-xs text-warning-500">
              未找到体重数据，使用默认值 65 kg 计算
            </span>
          </template>
        </UFormField>

        <!-- 运动效果预览 -->
        <UCard v-if="state.exerciseType && state.durationMinutes && state.estimatedCaloriesBurned">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-sm font-semibold">
                <UIcon name="mdi:fire" />
                运动效果预览
              </span>
              <UBadge :color="intensityColor" variant="soft">
                {{ state.intensity }}
              </UBadge>
            </div>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="flex items-center gap-2">
                <span class="flex items-center gap-2">
                  <UIcon name="mdi:run" />
                  运动
                </span>
                <UBadge color="neutral" variant="soft" class="flex-1">
                  {{ state.exerciseType }}
                </UBadge>
              </div>
              <div class="flex items-center gap-2">
                <span class="flex items-center gap-2">
                  <UIcon name="mdi:clock-outline" />
                  时长
                </span>
                <UBadge color="neutral" variant="soft" class="flex-1">
                  {{ state.durationMinutes }} min
                </UBadge>
              </div>
              <div class="flex items-center gap-2">
                <span class="flex items-center gap-2">
                  <UIcon name="mdi:fire" />
                  热量
                </span>
                <UBadge color="error" variant="soft" class="flex-1">
                  {{ state.estimatedCaloriesBurned }} kcal
                </UBadge>
              </div>
              <div class="flex items-center gap-2">
                <span class="flex items-center gap-2">
                  <UIcon name="mdi:speedometer" />
                  强度
                </span>
                <UBadge :color="intensityColor as any" variant="soft" class="flex-1">
                  {{ state.intensity }}
                </UBadge>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-xs">
                <span>热量消耗率: {{ calorieRate }} kcal/min</span>
                <span>健康指数: {{ healthScore }}%</span>
              </div>
              <UProgress :value="healthScore" :color="progressColor" size="sm" />
            </div>
          </div>
        </UCard>

        <!-- 健康提示 -->
        <UAlert
          v-if="healthTip"
          icon="mdi:information"
          color="primary"
          variant="soft"
          :title="healthTip"
        />

        <div class="flex justify-end gap-2 pt-4">
          <UButton color="neutral" variant="outline" @click="close"> 取消 </UButton>
          <UButton type="submit" color="warning" :loading="submitting">
            <template #leading>
              <UIcon name="mdi:check" />
            </template>
            {{
              submitting
                ? isEditMode
                  ? '更新中...'
                  : '记录中...'
                : isEditMode
                  ? '确认更新'
                  : '确认记录'
            }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
