<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { CalendarDateTime } from '@internationalized/date'
import { z } from 'zod'

interface Props {
  open: boolean
  editItem?: SleepRecord | null
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

const bedTime = shallowRef<CalendarDateTime | null>(null)
const wakeTime = shallowRef<CalendarDateTime | null>(null)

const schema = z
  .object({
    bedTime: z.string().min(1, '请填写入睡时间'),
    wakeTime: z.string().min(1, '请填写起床时间')
  })
  .refine(
    (data) => {
      // 验证起床时间必须晚于入睡时间
      return calculateMinutesBetween(data.bedTime, data.wakeTime) > 0
    },
    {
      message: '起床时间必须晚于入睡时间',
      path: ['wakeTime']
    }
  )

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  bedTime: '',
  wakeTime: ''
})

const submitting = ref(false)

// 同步 CalendarDateTime 到表单状态
watch([bedTime, wakeTime], () => {
  state.bedTime = calendarDateTimeToISOString(bedTime.value) || ''
  state.wakeTime = calendarDateTimeToISOString(wakeTime.value) || ''
})

const isEditMode = computed(() => !!props.editItem)
const dialogTitle = computed(() => (isEditMode.value ? '编辑睡眠记录' : '快速记录睡眠'))

// 获取认证信息
const getAuthHeaders = () => {
  const token = useCookie('token')
  const userID = useCookie('userID')
  if (!token.value || !userID.value) return null
  return { token: token.value, userID: userID.value }
}

watch(isOpen, (val) => {
  if (!val) return
  if (props.editItem) {
    bedTime.value = parseISOToCalendarDateTime(props.editItem.bedTime)
    wakeTime.value = parseISOToCalendarDateTime(props.editItem.wakeTime)
  } else {
    // 新建时，默认为空，由用户选择
    bedTime.value = null
    wakeTime.value = null
  }
})

const sleepDurationPreview = computed(() => {
  if (!state.bedTime || !state.wakeTime) return '--'
  const minutes = calculateMinutesBetween(state.bedTime, state.wakeTime)
  return formatDurationMinutes(minutes)
})

// 统一处理新增与编辑请求，成功后回调刷新列表
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  submitting.value = true

  try {
    const auth = getAuthHeaders()
    if (!auth) {
      toast.add({ title: '请先登录', color: 'error' })
      return
    }

    // 使用起床日期作为记录日期
    const recordDate = dateValueToString(wakeTime.value!)

    const body: SleepRequest = {
      userID: auth.userID,
      recordDate,
      bedTime: event.data.bedTime,
      wakeTime: event.data.wakeTime
    }

    const url =
      isEditMode.value && props.editItem?.sleepItemID
        ? `/api/sleep-items/${props.editItem.sleepItemID}`
        : '/api/sleep-items'
    const method = isEditMode.value ? 'PUT' : 'POST'
    const headers = { Authorization: `Bearer ${auth.token}` }

    const response = await $fetch<{ code: number; msg?: string }>(url, {
      method,
      headers,
      body
    })

    if (response.code === 1) {
      toast.add({
        title: isEditMode.value ? '睡眠记录更新成功' : '睡眠记录已添加',
        color: 'success'
      })
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
    description="记录入睡与起床时间，方便追踪睡眠情况"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body="{ close }">
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="入睡时间" name="bedTime">
          <UInputDate v-model="bedTime" granularity="minute" :hour-cycle="24" class="w-full">
            <template #leading>
              <UIcon name="heroicons:moon" />
            </template>
          </UInputDate>
        </UFormField>

        <UFormField label="起床时间" name="wakeTime">
          <UInputDate v-model="wakeTime" granularity="minute" :hour-cycle="24" class="w-full">
            <template #leading>
              <UIcon name="heroicons:sun" />
            </template>
          </UInputDate>
        </UFormField>

        <UCard v-if="state.bedTime && state.wakeTime">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-2 text-sm font-semibold">
              <UIcon name="mdi:sleep" />
              预估睡眠时长
            </span>
            <UBadge color="primary" variant="soft">{{ sleepDurationPreview }}</UBadge>
          </div>
        </UCard>

        <UAlert
          v-if="!bedTime || !wakeTime"
          icon="heroicons:exclamation-triangle"
          color="warning"
          variant="soft"
          title="提示"
          description="请同时填写入睡时间和起床时间"
        />

        <div class="flex justify-end gap-2 pt-4">
          <UButton color="neutral" variant="outline" @click="close"> 取消 </UButton>
          <UButton type="submit" color="primary" :loading="submitting">
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
