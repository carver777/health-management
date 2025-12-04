<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { DateValue } from '@internationalized/date'
import { z } from 'zod'

interface Props {
  open: boolean
  editItem?: DietRecord | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const toast = useToast()
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

// 日历状态
const calendarValue = shallowRef<DateValue>(getTodayDateValue())

// 表单验证
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

const isEditMode = computed(() => !!props.editItem)
const dialogTitle = computed(() => (isEditMode.value ? '编辑饮食记录' : '快速记录饮食'))

// 获取认证信息
const getAuthHeaders = () => {
  const token = useCookie('token')
  const userID = useCookie('userID')
  if (!token.value || !userID.value) return null
  return { token: token.value, userID: userID.value }
}

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

const mealTypeOptions = [
  { label: '早餐', value: '早餐', icon: 'mdi:bread-slice' },
  { label: '午餐', value: '午餐', icon: 'mdi:rice' },
  { label: '晚餐', value: '晚餐', icon: 'mdi:noodles' },
  { label: '加餐', value: '加餐', icon: 'mdi:food-apple' }
]

const calorieLevels = [
  { threshold: 200, label: '低热量', color: 'success', tip: '适量摄入，注意营养均衡' },
  { threshold: 500, label: '中热量', color: 'warning', tip: '合理的热量摄入，保持良好饮食习惯' },
  { threshold: Infinity, label: '高热量', color: 'error', tip: '热量较高，建议适量食用并增加运动' }
]

const calorieLevel = computed(() => {
  const level = calorieLevels.find((l) => state.estimatedCalories < l.threshold)
  return level ?? calorieLevels[calorieLevels.length - 1]!
})

const healthTip = computed(() => (state.estimatedCalories ? calorieLevel.value.tip : ''))

// 提交表单
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  submitting.value = true

  try {
    const auth = getAuthHeaders()
    if (!auth) {
      toast.add({ title: '请先登录', color: 'error' })
      return
    }

    const formData: DietRequest = {
      userID: auth.userID,
      recordDate: dateValueToString(calendarValue.value),
      foodName: event.data.foodName,
      mealType: event.data.mealType,
      estimatedCalories: event.data.estimatedCalories
    }

    const url =
      isEditMode.value && props.editItem?.dietItemID
        ? `/api/diet-items/${props.editItem.dietItemID}`
        : '/api/diet-items'
    const method = isEditMode.value ? 'PUT' : 'POST'
    const headers = { Authorization: `Bearer ${auth.token}` }

    const response = await $fetch<{ code: number; msg?: string }>(url, {
      method,
      headers,
      body: formData
    })

    if (response.code === 1) {
      toast.add({ title: isEditMode.value ? '更新成功' : '记录成功', color: 'success' })
      emit('success')
      isOpen.value = false
    } else {
      toast.add({
        title: response.msg || (isEditMode.value ? '更新失败' : '记录失败'),
        color: 'error'
      })
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
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="记录日期" name="recordDate">
            <DatePicker v-model="calendarValue" class="w-full" />
          </UFormField>
          <UFormField label="餐次" name="mealType">
            <USelect
              v-model="state.mealType"
              :items="mealTypeOptions"
              placeholder="选择餐次"
              class="w-full"
            >
              <template #leading>
                <UIcon
                  :name="
                    mealTypeOptions.find((opt) => opt.value === state.mealType)?.icon ||
                    'mdi:silverware'
                  "
                />
              </template>
            </USelect>
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <UFormField label="食物名称" name="foodName">
            <UInput v-model="state.foodName" placeholder="请输入食物名称" class="w-full">
              <template #leading>
                <UIcon name="mdi:food" />
              </template>
            </UInput>
          </UFormField>
          <UFormField label="估计热量" name="estimatedCalories">
            <UInput
              v-model.number="state.estimatedCalories"
              type="number"
              placeholder="热量值"
              :min="0"
              class="w-full"
            >
              <template #trailing>
                <span class="text-xs">kcal</span>
              </template>
            </UInput>
          </UFormField>
        </div>

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
