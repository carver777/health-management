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

// 监听对话框打开，重置或填充表单
watch(isOpen, (val) => {
  if (val) {
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

// 运动类型选项
const exerciseTypeOptions = [
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

// 强度选项
const intensityOptions = [
  { label: '低强度', value: '低强度', icon: 'mdi:leaf' },
  { label: '中等强度', value: '中等强度', icon: 'mdi:speedometer-medium' },
  { label: '高强度', value: '高强度', icon: 'mdi:fire' }
]

// 运动类型与热量系数的映射
const exerciseCalorieMap: Record<string, number> = {
  跑步: 12,
  游泳: 14,
  骑行: 8,
  篮球: 10,
  足球: 11,
  羽毛球: 9,
  乒乓球: 7,
  网球: 9,
  健身房训练: 10,
  瑜伽: 4,
  普拉提: 5,
  爬山: 13,
  徒步: 6,
  跳绳: 15,
  力量训练: 8
}

// 强度系数
const intensityMultiplier: Record<string, number> = {
  低强度: 0.8,
  中等强度: 1.0,
  高强度: 1.3
}

// 智能计算热量消耗
const calculateCalories = () => {
  if (state.durationMinutes && state.exerciseType && state.intensity) {
    const baseCalorie = exerciseCalorieMap[state.exerciseType] || 8
    const multiplier = intensityMultiplier[state.intensity] || 1.0
    state.estimatedCaloriesBurned = Math.round(baseCalorie * state.durationMinutes * multiplier)
  }
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
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="记录日期" name="recordDate">
            <DatePicker v-model="calendarValue" block />
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

        <UFormField label="运动类型" name="exerciseType">
          <UInputMenu
            v-model="state.exerciseType"
            :items="exerciseTypeOptions"
            value-key="value"
            placeholder="选择运动类型"
            auto-open
          >
            <template #leading="{ modelValue }">
              <UIcon
                v-if="modelValue"
                :name="
                  exerciseTypeOptions.find((o) => o.value === modelValue)?.icon ||
                  'mdi:lightning-bolt'
                "
              />
            </template>
            <template #item="{ item }">
              <div class="flex items-center gap-2">
                <UIcon :name="item.icon" />
                <span>{{ item.label }}</span>
              </div>
            </template>
          </UInputMenu>
        </UFormField>

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
