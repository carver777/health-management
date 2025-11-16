<script setup lang="ts">
interface Props {
  data: { date: string; intake: number; burn: number; net: number }[]
  timePeriod: string
}

interface Emits {
  (e: 'update:timePeriod', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { initChart, disposeChart } = useECharts()

const chartRef = ref<HTMLDivElement>()
let chart: ReturnType<typeof initChart> | null = null

const timePeriodButtons = [
  { label: '7 天', value: '7d' },
  { label: '30 天', value: '30d' },
  { label: '90 天', value: '90d' }
]

// 计算平均值
const averageIntake = computed(() => {
  if (props.data.length === 0) return 0
  const total = props.data.reduce((sum, item) => sum + item.intake, 0)
  return Math.round(total / props.data.length)
})

const averageBurn = computed(() => {
  if (props.data.length === 0) return 0
  const total = props.data.reduce((sum, item) => sum + item.burn, 0)
  return Math.round(total / props.data.length)
})

const averageNet = computed(() => {
  if (props.data.length === 0) return 0
  const total = props.data.reduce((sum, item) => sum + item.net, 0)
  return Math.round(total / props.data.length)
})

const init = () => {
  if (!chartRef.value) return

  disposeChart(chart)
  chart = initChart(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return

  const hasData = props.data.length > 0

  const option = {
    title: {
      show: !hasData,
      text: '暂无卡路里数据',
      textStyle: {
        color: '#999',
        fontSize: 16,
        fontWeight: 'normal'
      },
      left: 'center',
      top: 'middle'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#667eea',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      formatter: (params: unknown) => {
        const paramsArray = Array.isArray(params) ? params : [params]
        const firstItem = paramsArray[0] as Record<string, unknown>
        if (!firstItem) return ''
        const date = firstItem.axisValueLabel || ''
        let html = `<div style="padding: 8px;"><div style="font-weight: 600; margin-bottom: 4px;">${date}</div>`
        paramsArray.forEach((item: Record<string, unknown>) => {
          html += `
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: ${item.color || '#667eea'}; border-radius: 50%;"></span>
              <span>${item.seriesName || ''}: ${item.value || 0} kcal</span>
            </div>
          `
        })
        html += '</div>'
        return html
      }
    },
    legend: {
      show: hasData,
      data: ['摄入', '消耗', '净摄入'],
      top: 0,
      textStyle: {
        color: '#64748b'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '12%',
      show: hasData
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.data.map((item) => item.date),
      show: hasData,
      axisLine: {
        lineStyle: {
          color: '#e0e6ed'
        }
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      show: hasData,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 12,
        formatter: '{value} kcal'
      },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9',
          type: 'dashed'
        }
      }
    },
    series: hasData
      ? [
          {
            name: '摄入',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: '#10b981'
            },
            itemStyle: {
              color: '#10b981',
              borderColor: '#fff',
              borderWidth: 2
            },
            data: props.data.map((item) => item.intake)
          },
          {
            name: '消耗',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: '#ef4444'
            },
            itemStyle: {
              color: '#ef4444',
              borderColor: '#fff',
              borderWidth: 2
            },
            data: props.data.map((item) => item.burn)
          },
          {
            name: '净摄入',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: '#f59e0b'
            },
            itemStyle: {
              color: '#f59e0b',
              borderColor: '#fff',
              borderWidth: 2
            },
            data: props.data.map((item) => item.net)
          }
        ]
      : []
  }

  chart.setOption(option)
}

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  init()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  disposeChart(chart)
})

watch(
  () => props.data,
  () => {
    if (chart) {
      updateChart()
    } else {
      init()
    }
  },
  { deep: true }
)
</script>

<template>
  <UCard>
    <template #header>
      <div class="space-y-3">
        <div class="flex items-center gap-2 text-lg font-semibold">
          <UIcon name="mdi:chart-bar" />
          <h3>卡路里趋势</h3>
        </div>
        <div class="flex flex-wrap gap-3 text-sm">
          <div class="flex items-center gap-2">
            <span>平均摄入:</span>
            <span class="font-semibold">{{ averageIntake }} kcal</span>
          </div>
          <div class="flex items-center gap-2">
            <span>平均消耗:</span>
            <span class="font-semibold">{{ averageBurn }} kcal</span>
          </div>
          <div class="flex items-center gap-2">
            <span>平均净摄入:</span>
            <span class="font-semibold">{{ averageNet }} kcal</span>
          </div>
        </div>
        <div class="flex gap-1">
          <UButton
            v-for="btn in timePeriodButtons"
            :key="btn.value"
            size="sm"
            :color="timePeriod === btn.value ? 'primary' : 'neutral'"
            @click="emit('update:timePeriod', btn.value)"
          >
            {{ btn.label }}
          </UButton>
        </div>
      </div>
    </template>
    <div ref="chartRef" class="h-[350px] w-full" />
  </UCard>
</template>
