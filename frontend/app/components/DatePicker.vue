<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarDate } from '@internationalized/date'

interface Props {
  modelValue?: DateValue | null
  minValue?: DateValue
  maxValue?: DateValue
  placeholder?: string
  block?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  id?: string
  name?: string
}

interface Emits {
  (e: 'update:modelValue', value: DateValue | null): void
}

const props = withDefaults(defineProps<Props>(), {
  minValue: () => new CalendarDate(1900, 1, 1),
  maxValue: () => new CalendarDate(2099, 12, 31),
  placeholder: '请选择日期',
  block: false,
  size: 'md'
})

const emit = defineEmits<Emits>()

const showDatePicker = ref(false)
const calendarPlaceholder = shallowRef<DateValue>(props.modelValue || getTodayDateValue())

const internalValue = computed({
  get: () => props.modelValue || getTodayDateValue(),
  set: (value: DateValue) => emit('update:modelValue', value)
})

const displayValue = computed(() => {
  if (!internalValue.value) return props.placeholder
  return dateValueToString(internalValue.value)
})

const handleDateSelect = (
  value: DateValue | DateValue[] | Record<string, unknown> | null | undefined
) => {
  // 只处理单个日期值
  if (value && typeof value === 'object' && !Array.isArray(value) && 'year' in value) {
    internalValue.value = value as DateValue
  }
  showDatePicker.value = false
}
</script>

<template>
  <UPopover v-model:open="showDatePicker">
    <UButton
      :id="id"
      :name="name"
      :block="block"
      variant="outline"
      color="neutral"
      :size="size"
      class="justify-start"
    >
      <template #leading>
        <UIcon name="heroicons:calendar" />
      </template>
      {{ displayValue }}
    </UButton>

    <template #content>
      <UCalendar
        v-model="internalValue"
        v-model:placeholder="calendarPlaceholder"
        :min-value="minValue"
        :max-value="maxValue"
        locale="zh-CN"
        @update:model-value="handleDateSelect"
      >
        <template #heading="{ value }">
          <YearMonthSelect
            v-model:placeholder="calendarPlaceholder"
            :min-value="minValue"
            :max-value="maxValue"
          >
            {{ value }}
          </YearMonthSelect>
        </template>
      </UCalendar>
    </template>
  </UPopover>
</template>
