<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { DateValue } from '@internationalized/date'
import { z } from 'zod'

interface Props {
  open: boolean
  editItem?: DietRecord | null
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
  mealType: z.string().min(1, '请选择餐次'),
  foodName: z.string().min(1, '请输入食物名称'),
  estimatedCalories: z.number({ message: '请输入估计热量' }).min(1, '热量必须大于 0')
})

type Schema = z.output<typeof schema>

// 根据当前时间智能推荐餐次
const getDefaultMealType = () => {
  const currentHour = new Date().getHours()
  if (currentHour >= 6 && currentHour < 10) return '早餐'
  if (currentHour >= 11 && currentHour < 14) return '午餐'
  if (currentHour >= 17 && currentHour < 21) return '晚餐'
  return '加餐'
}

// 表单状态
const state = reactive<Schema>({
  mealType: getDefaultMealType(),
  foodName: '',
  estimatedCalories: 0
})

const submitting = ref(false)

// 是否为编辑模式
const isEditMode = computed(() => !!props.editItem)

// 对话框标题
const dialogTitle = computed(() => (isEditMode.value ? '编辑饮食记录' : '快速记录饮食'))

// 监听对话框打开，重置或填充表单
watch(isOpen, (val) => {
  if (val) {
    if (props.editItem) {
      // 编辑模式：填充现有数据
      state.mealType = props.editItem.mealType
      state.foodName = props.editItem.foodName
      state.estimatedCalories = props.editItem.estimatedCalories || 0
      calendarValue.value = stringToDateValue(props.editItem.recordDate)
    } else {
      // 新增模式：重置表单
      state.mealType = getDefaultMealType()
      state.foodName = ''
      state.estimatedCalories = 0
      calendarValue.value = getTodayDateValue()
    }
  }
})

// 餐次选项
const mealTypeOptions = [
  { label: '早餐', value: '早餐' },
  { label: '午餐', value: '午餐' },
  { label: '晚餐', value: '晚餐' },
  { label: '加餐', value: '加餐' }
]

// 热量等级计算
const calorieLevel = computed(() => {
  if (state.estimatedCalories < 200) return { label: '低热量', color: 'success' }
  if (state.estimatedCalories < 500) return { label: '中热量', color: 'warning' }
  return { label: '高热量', color: 'error' }
})

// 健康提示
const healthTip = computed(() => {
  if (!state.estimatedCalories) return ''

  if (state.estimatedCalories < 200) {
    return '适量摄入，注意营养均衡'
  } else if (state.estimatedCalories >= 200 && state.estimatedCalories < 500) {
    return '合理的热量摄入，保持良好饮食习惯'
  } else {
    return '热量较高，建议适量食用并增加运动'
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

    const formData: DietRequest = {
      userID: userID.value,
      recordDate,
      foodName: event.data.foodName,
      mealType: event.data.mealType,
      estimatedCalories: event.data.estimatedCalories
    }

    if (isEditMode.value && props.editItem?.dietItemID) {
      // 编辑模式
      const response = await $fetch<{ code: number; msg?: string }>(
        `/api/diet-items/${props.editItem.dietItemID}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token.value}`
          },
          body: formData
        }
      )

      if (response.code === 1) {
        toast.add({ title: '更新成功', color: 'success' })
        emit('success')
        isOpen.value = false
      } else {
        toast.add({ title: response.msg || '更新失败', color: 'error' })
      }
    } else {
      // 新增模式
      const response = await $fetch<{ code: number; msg?: string; data?: number }>(
        '/api/diet-items',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`
          },
          body: formData
        }
      )

      if (response.code === 1) {
        toast.add({ title: '记录成功', color: 'success' })
        emit('success')
        isOpen.value = false
      } else {
        toast.add({ title: response.msg || '记录失败', color: 'error' })
      }
    }
  } catch (error) {
    const err = error as { data?: { message?: string }; message?: string }
    toast.add({
      title: err.data?.message || err.message || (isEditMode.value ? '更新失败' : '记录失败'),
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
    description="记录您的每日饮食摄入，包括食物名称和热量"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body="{ close }">
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="记录日期" name="recordDate">
            <DatePicker v-model="calendarValue" block />
          </UFormField>

          <UFormField label="餐次" name="mealType">
            <USelect v-model="state.mealType" :items="mealTypeOptions" placeholder="选择餐次" />
          </UFormField>
        </div>

        <UFormField label="食物名称" name="foodName">
          <UInput v-model="state.foodName" placeholder="请输入食物名称">
            <template #leading>
              <UIcon name="mdi:food-apple" />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="估计热量" name="estimatedCalories">
          <UInput
            v-model.number="state.estimatedCalories"
            type="number"
            placeholder="热量值"
            :min="0"
          >
            <template #trailing>
              <span class="text-xs">kcal</span>
            </template>
          </UInput>
        </UFormField>

        <!-- 营养摄入预览 -->
        <UCard v-if="state.foodName && state.estimatedCalories">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-sm font-semibold">
                <UIcon name="mdi:chart-bar" />
                营养摄入预览
              </span>
              <UBadge :color="calorieLevel.color as any" variant="soft">
                {{ calorieLevel.label }}
              </UBadge>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <UIcon name="mdi:silverware-fork-knife" />
                  食物
                </span>
                <UBadge color="neutral" variant="soft">{{ state.foodName }}</UBadge>
              </div>
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <UIcon name="mdi:fire" />
                  热量
                </span>
                <UBadge color="error" variant="soft">{{ state.estimatedCalories }} kcal</UBadge>
              </div>
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <UIcon name="mdi:clock-outline" />
                  餐次
                </span>
                <UBadge color="success" variant="soft">{{ state.mealType }}</UBadge>
              </div>
            </div>
          </div>
        </UCard>

        <!-- 健康提示 -->
        <UAlert
          v-if="healthTip"
          icon="heroicons:information-circle"
          color="primary"
          variant="soft"
          :title="healthTip"
        />

        <div class="flex justify-end gap-2 pt-4">
          <UButton color="neutral" variant="outline" @click="close"> 取消 </UButton>
          <UButton type="submit" color="success" :loading="submitting">
            <template #leading>
              <UIcon name="heroicons:check" />
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
