<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { DateValue } from '@internationalized/date'
import { z } from 'zod'

interface Props {
  open: boolean
  editItem?: BodyData | null
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
  heightCM: z
    .number({ message: '请输入身高' })
    .min(100, '身高应在 100-250 cm 之间')
    .max(250, '身高应在 100-250 cm 之间'),
  weightKG: z
    .number({ message: '请输入体重' })
    .min(30, '体重应在 30-300 kg 之间')
    .max(300, '体重应在 30-300 kg 之间')
})

type Schema = z.output<typeof schema>

// 表单状态
const state = reactive<Schema>({
  heightCM: 170,
  weightKG: 65
})

const submitting = ref(false)

const isEditMode = computed(() => !!props.editItem)
const dialogTitle = '快速记录身体数据'

// 获取认证信息
const getAuthHeaders = () => {
  const token = useCookie('token')
  const userID = useCookie('userID')
  if (!token.value || !userID.value) return null
  return { token: token.value, userID: userID.value }
}

// 加载用户最新的身体数据或编辑数据
const loadLatestData = async () => {
  // 如果是编辑模式，填充现有数据
  if (props.editItem) {
    state.heightCM = props.editItem.heightCM || 170
    state.weightKG = props.editItem.weightKG || 65
    calendarValue.value = stringToDateValue(props.editItem.recordDate)
    return
  }

  // 新增模式，加载最新数据
  try {
    const auth = getAuthHeaders()
    if (!auth) {
      resetFormWithDefaults()
      return
    }

    const response = await $fetch<ApiResponse<{ rows: BodyData[] }>>('/api/body-metrics', {
      method: 'GET',
      headers: { Authorization: `Bearer ${auth.token}` },
      query: { page: 1, pageSize: 1, userID: auth.userID }
    })

    const latestRecord = response?.data?.rows?.[0]
    if (latestRecord) {
      state.heightCM = latestRecord.heightCM || 170
      state.weightKG = latestRecord.weightKG || 65
      calendarValue.value = getTodayDateValue()
    } else {
      resetFormWithDefaults()
    }
  } catch {
    resetFormWithDefaults()
  }
}

const resetFormWithDefaults = () => {
  state.heightCM = 170
  state.weightKG = 65
  calendarValue.value = getTodayDateValue()
}

watch(isOpen, (val) => {
  if (val) {
    loadLatestData()
  }
})

const bmiValue = computed(() => calcBMI({ heightCM: state.heightCM, weightKG: state.weightKG }))
const bmiStatus = computed(() =>
  bmiValue.value === null ? { status: '', color: '' } : getBMIStatus(bmiValue.value)
)

const healthTips: Record<string, string> = {
  low: '您的 BMI 偏低，建议您适当增加营养摄入，进行力量训练',
  high: '您的 BMI 偏高，建议您控制饮食，增加有氧运动',
  veryHigh: '您的 BMI 过高，建议您制定减重计划，必要时咨询专业医生'
}

const healthTip = computed(() => {
  if (bmiValue.value === null) return ''
  if (bmiValue.value < 18.5) return healthTips.low
  if (bmiValue.value >= 24 && bmiValue.value < 28) return healthTips.high
  if (bmiValue.value >= 28) return healthTips.veryHigh
  return ''
})

// 提交表单
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  submitting.value = true

  try {
    const auth = getAuthHeaders()
    if (!auth) {
      toast.add({ title: '请先登录', color: 'error' })
      return
    }

    const recordDate = dateValueToString(calendarValue.value)
    const formData: BodyDataRequest = {
      userID: auth.userID,
      heightCM: event.data.heightCM,
      weightKG: event.data.weightKG,
      recordDate
    }

    const headers = { Authorization: `Bearer ${auth.token}` }

    if (isEditMode.value && props.editItem?.bodyMetricID) {
      // 编辑模式：直接更新
      const response = await $fetch<{ code: number; msg?: string }>(
        `/api/body-metrics/${props.editItem.bodyMetricID}`,
        { method: 'PUT', headers, body: formData }
      )

      if (response.code === 1) {
        toast.add({ title: '更新成功', color: 'success' })
        emit('success')
        isOpen.value = false
      } else {
        toast.add({ title: response.msg || '更新失败', color: 'error' })
      }
    } else {
      // 新增模式：检查当天是否已有记录
      const todayRecords = await $fetch<{ code: number; data: { rows: BodyData[] } }>(
        '/api/body-metrics',
        {
          method: 'GET',
          headers,
          params: {
            page: 1,
            pageSize: 10,
            userID: auth.userID,
            startDate: recordDate,
            endDate: recordDate
          }
        }
      )

      const existingRecord = todayRecords?.data?.rows?.[0]
      const url = existingRecord?.bodyMetricID
        ? `/api/body-metrics/${existingRecord.bodyMetricID}`
        : '/api/body-metrics'
      const method = existingRecord?.bodyMetricID ? 'PUT' : 'POST'

      const response = await $fetch<{ code: number; msg?: string }>(url, {
        method,
        headers,
        body: formData
      })

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
    description="记录您的体重和身高数据，系统将自动计算 BMI 指数"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body="{ close }">
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="身高" name="heightCM">
            <UInput
              v-model.number="state.heightCM"
              type="number"
              placeholder="请输入身高"
              :min="100"
              :max="250"
              :step="0.5"
              class="w-full"
            >
              <template #trailing>
                <span class="text-xs">cm</span>
              </template>
            </UInput>
          </UFormField>

          <UFormField label="体重" name="weightKG">
            <UInput
              v-model.number="state.weightKG"
              type="number"
              placeholder="请输入体重"
              :min="30"
              :max="300"
              :step="0.1"
              class="w-full"
            >
              <template #trailing>
                <span class="text-xs">kg</span>
              </template>
            </UInput>
          </UFormField>
        </div>

        <UFormField label="记录日期" name="recordDate">
          <DatePicker v-model="calendarValue" class="w-full" />
        </UFormField>

        <UCard v-if="bmiValue !== null">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-sm font-semibold">
                <UIcon name="mdi:chart-bar" />
                BMI 指数
              </span>
              <UBadge :color="bmiStatus.color as any" variant="soft" size="lg">
                {{ bmiValue.toFixed(1) }}
              </UBadge>
            </div>
            <div class="flex items-center justify-between text-sm">
              <UBadge :color="bmiStatus.color as any" variant="outline">
                {{ bmiStatus.status }}
              </UBadge>
              <span class="text-xs">
                {{
                  bmiValue < 18.5 || bmiValue >= 24 ? '正常范围: 18.5-23.9' : '您的 BMI 很健康！'
                }}
              </span>
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
          <UButton type="submit" :loading="submitting">
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
