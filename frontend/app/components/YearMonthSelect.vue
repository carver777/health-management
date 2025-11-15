<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarDate, isSameMonth, isSameYear } from '@internationalized/date'
import { createDecade, createYear, isAfter, isBefore, toDate } from 'reka-ui/date'
import { useDateFormatter } from 'reka-ui'

const placeholder = defineModel<DateValue>('placeholder', { required: true })
const minValue = defineModel<DateValue>('minValue', { default: new CalendarDate(1, 1, 1) })
const maxValue = defineModel<DateValue>('maxValue')
const isOpen = toRef(false)

const { formatYear, formatMonth } = useCustomFormatter(placeholder)
const { selectedMode, toggleSelectMode } = useSelectMode()
const {
  displayedYear,
  resetDisplayedYear,
  changeDisplayedYear,
  isActiveYear,
  canIncreaseDisplayedYear,
  canDecreaseDisplayedYear
} = useDisplayedYear(placeholder)
const {
  displayedYearRange,
  resetDisplayedYearRange,
  changeDisplayedYearRange,
  canIncreaseDisplayedYearRange,
  canDecreaseDisplayedYearRange
} = useDisplayedYearRange(displayedYear, minValue, maxValue)
const { selectMonth, isActiveMonth, canSelectMonth } = useMonthSelect(
  placeholder,
  minValue,
  maxValue
)
const { selectYear, canSelectYear } = useYearSelect(displayedYear, minValue, maxValue)

function handlePopoverOpen(value: boolean) {
  /**
   * reset displayed year when popover opens
   * changing the value while the popover closes will be noticible
   */
  if (value) {
    resetDisplayedYear()
    toggleSelectMode('month')
  }
}

watch(selectedMode, (newValue: 'month' | 'year') => {
  // reset the displayed year range when the mode is changed
  if (newValue === 'year') {
    resetDisplayedYearRange()
  }
})

/**
 * Custom formatters for month and year
 */
function useCustomFormatter(placeholder: Ref<DateValue>, locale?: string) {
  const formatter = useDateFormatter(locale ?? 'en')

  const defaultFormatterOptions = computed(() => {
    return {
      calendar: placeholder.value.calendar.identifier
    }
  })

  function formatYear(date: DateValue) {
    return formatter.fullYear(toDate(date), {
      ...defaultFormatterOptions,
      era:
        placeholder.value.calendar.identifier === 'gregory' && date.era === 'BC'
          ? 'short'
          : undefined
    })
  }

  function formatMonth(date: DateValue) {
    return formatter.custom(toDate(date), { ...defaultFormatterOptions, month: 'short' })
  }

  return {
    formatter,
    defaultFormatterOptions,
    formatYear,
    formatMonth
  }
}

/**
 * Selection mode (month or year)
 */
function useSelectMode() {
  type SelectMode = 'year' | 'month'

  const selectedMode = ref<SelectMode>('month')

  function toggleSelectMode(value?: SelectMode) {
    selectedMode.value = value ?? (selectedMode.value === 'month' ? 'year' : 'month')
  }

  return { selectedMode, toggleSelectMode }
}

/**
 * Handle month select
 */
function useMonthSelect(
  placeholder: Ref<DateValue>,
  minValue: Ref<DateValue | undefined>,
  maxValue: Ref<DateValue | undefined>
) {
  function selectMonth(date: DateValue) {
    placeholder.value = placeholder.value.set(date)
  }

  function isActiveMonth(date: DateValue) {
    return isSameMonth(placeholder.value, date)
  }

  function canSelectMonth(date: DateValue) {
    if (!minValue.value && !maxValue.value) return true

    if (minValue.value && maxValue.value) {
      return (
        (isAfter(date, minValue.value) || isSameMonth(date, minValue.value)) &&
        (isBefore(date, maxValue.value) || isSameMonth(date, maxValue.value))
      )
    }

    if (minValue.value) {
      return isAfter(date, minValue.value) || isSameMonth(date, minValue.value)
    }

    return false
  }

  return { selectMonth, isActiveMonth, canSelectMonth }
}

/**
 * Handle year select
 */
function useYearSelect(
  displayedYear: Ref<DateValue>,
  minValue: Ref<DateValue | undefined>,
  maxValue: Ref<DateValue | undefined>
) {
  function selectYear(date: DateValue) {
    displayedYear.value = displayedYear.value.set({ year: date.year, era: date.era })
    toggleSelectMode('month')
  }

  function canSelectYear(date: DateValue) {
    if (!minValue.value && !maxValue.value) return true

    if (minValue.value && maxValue.value) {
      return (
        (isAfter(date, minValue.value) || isSameYear(date, minValue.value)) &&
        (isBefore(date, maxValue.value) || isSameYear(date, maxValue.value))
      )
    }

    if (minValue.value) {
      return isAfter(date, minValue.value) || isSameYear(date, minValue.value)
    }

    return false
  }

  return {
    selectYear,
    canSelectYear
  }
}

/**
 * Popover year value
 */
function useDisplayedYear(placeholder: Ref<DateValue>) {
  const displayedYear = shallowRef(placeholder.value)

  /**
   * Increase or decrease the displayed year
   */
  function changeDisplayedYear(direction: 'next' | 'prev') {
    if (direction === 'next') {
      displayedYear.value = displayedYear.value.add({ years: 1 })
    } else {
      if (!isSameYear(displayedYear.value, minValue.value)) {
        displayedYear.value = displayedYear.value.subtract({ years: 1 })
      }
    }
  }

  /**
   * Reset the year that is displayed in the popover
   */
  function resetDisplayedYear() {
    displayedYear.value = placeholder.value
  }

  const canDecreaseDisplayedYear = computed(() => {
    if (!minValue.value) return true

    const prevValue = displayedYear.value.subtract({ years: 1 }).set({ month: 99, day: 99 })
    return !isBefore(prevValue, minValue.value)
  })

  const canIncreaseDisplayedYear = computed(() => {
    if (!maxValue.value) return true

    const nextValue = displayedYear.value.add({ years: 1 }).set({ month: 99, day: 99 })
    return !isAfter(nextValue, maxValue.value)
  })

  function isActiveYear(date: DateValue) {
    return isSameYear(displayedYear.value, date)
  }

  return {
    displayedYear,
    changeDisplayedYear,
    resetDisplayedYear,
    isActiveYear,
    canDecreaseDisplayedYear,
    canIncreaseDisplayedYear
  }
}

/**
 * Popover year-range value
 */
function useDisplayedYearRange(
  displayedYear: Ref<DateValue>,
  minValue: Ref<DateValue | undefined>,
  maxValue: Ref<DateValue | undefined>
) {
  const yearRangeValue = shallowRef(placeholder.value)

  const displayedYearRange = computed(() => {
    const firstYear = yearRangeValue.value.subtract({ years: yearRangeValue.value.year % 12 })
    const lastYear = firstYear.add({ years: 11 })

    return { firstYear, lastYear }
  })

  function resetDisplayedYearRange() {
    yearRangeValue.value = displayedYear.value
  }

  /**
   * Increase or decrease the displayed year range
   */
  function changeDisplayedYearRange(direction: 'next' | 'prev') {
    yearRangeValue.value =
      direction === 'next'
        ? displayedYearRange.value.lastYear.add({ years: 1 })
        : displayedYearRange.value.firstYear.subtract({ years: 1 })
  }

  const canDecreaseDisplayedYearRange = computed(() => {
    if (!minValue.value) return true

    const prevValue = displayedYearRange.value.firstYear
      .subtract({ years: 1 })
      .set({ month: 99, day: 99 })
    return !isBefore(prevValue, minValue.value)
  })

  const canIncreaseDisplayedYearRange = computed(() => {
    if (!maxValue.value) return true

    const nextValue = displayedYearRange.value.lastYear
      .add({ years: 1 })
      .set({ month: 99, day: 99 })
    return !isAfter(nextValue, maxValue.value)
  })

  return {
    displayedYearRange,
    resetDisplayedYearRange,
    changeDisplayedYearRange,
    canDecreaseDisplayedYearRange,
    canIncreaseDisplayedYearRange
  }
}
</script>

<template>
  <UPopover
    v-model:open="isOpen"
    :ui="{ content: 'w-fit p-1' }"
    arrow
    @update:open="handlePopoverOpen"
  >
    <UButton color="neutral" variant="ghost">
      <slot />
    </UButton>
    <template #content>
      <template v-if="selectedMode === 'month'">
        <!-- Month Selection -->
        <div class="flex items-center justify-between gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-chevron-left"
            square
            :disabled="!canDecreaseDisplayedYear"
            @click="changeDisplayedYear('prev')"
          />
          <UPopover :ui="{ content: 'w-fit space-y-2' }">
            <UButton color="neutral" variant="ghost" @click="toggleSelectMode()">
              {{ formatYear(displayedYear) }}
            </UButton>
          </UPopover>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-chevron-right"
            square
            :disabled="!canIncreaseDisplayedYear"
            @click="changeDisplayedYear('next')"
          />
        </div>
        <div class="grid grid-cols-4 gap-1 pt-2">
          <UButton
            v-for="date in createYear({ dateObj: displayedYear, pagedNavigation: true })"
            :key="date.toString()"
            color="neutral"
            active-color="primary"
            variant="ghost"
            active-variant="link"
            block
            :active="isActiveMonth(date)"
            :disabled="!canSelectMonth(date)"
            @click="
              () => {
                selectMonth(date)
                isOpen = !isOpen
              }
            "
          >
            {{ formatMonth(date) }}
          </UButton>
        </div>
      </template>
      <template v-else>
        <!-- Year Selection -->
        <div class="flex items-center justify-between gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-chevron-left"
            square
            :disabled="!canDecreaseDisplayedYearRange"
            @click="changeDisplayedYearRange('prev')"
          />
          <UPopover :ui="{ content: 'w-fit space-y-2' }">
            <UButton color="neutral" variant="ghost" @click="toggleSelectMode()">
              {{
                `${formatYear(displayedYearRange.firstYear)} - ${formatYear(displayedYearRange.lastYear)}`
              }}
            </UButton>
          </UPopover>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-chevron-right"
            square
            :disabled="!canIncreaseDisplayedYearRange"
            @click="changeDisplayedYearRange('next')"
          />
        </div>
        <div class="grid grid-cols-4 gap-1 pt-2">
          <UButton
            v-for="date in createDecade({ dateObj: displayedYearRange.lastYear, endIndex: 12 })"
            :key="date.toString()"
            color="neutral"
            active-color="primary"
            variant="ghost"
            active-variant="link"
            block
            :active="isActiveYear(date)"
            :disabled="!canSelectYear(date)"
            @click="selectYear(date)"
          >
            {{ formatYear(date) }}
          </UButton>
        </div>
      </template>
    </template>
  </UPopover>
</template>
