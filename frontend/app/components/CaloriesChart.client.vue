<script setup lang="ts">
interface Props {
  data: { date: string; intake: number; burn: number; net: number }[]
  timePeriod: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:timePeriod': [value: string] }>()

const { initChart, disposeChart } = useECharts()

const chartRef = ref<HTMLDivElement>()
let chart: ReturnType<typeof initChart> | null = null

const releaseChart = () => {
  if (chart) {
    disposeChart(chart)
    chart = null
  }
}

const timePeriodButtons = [
  { label: '7 天', value: '7d' },
  { label: '30 天', value: '30d' },
  { label: '90 天', value: '90d' }
]

const calculateAverage = (key: 'intake' | 'burn' | 'net') => {
  if (props.data.length === 0) return 0
  const total = props.data.reduce((sum, item) => sum + item[key], 0)
  return Math.round(total / props.data.length)
}

const averageIntake = computed(() => calculateAverage('intake'))
const averageBurn = computed(() => calculateAverage('burn'))
const averageNet = computed(() => calculateAverage('net'))

const seriesConfig = [
  { name: '摄入', key: 'intake' as const, color: '#10b981' },
  { name: '消耗', key: 'burn' as const, color: '#ef4444' },
  { name: '净摄入', key: 'net' as const, color: '#f59e0b' }
]

const init = () => {
  if (!chartRef.value) return

  // 检查容器是否有宽度和高度，避免初始化失败
  if (chartRef.value.clientWidth === 0 || chartRef.value.clientHeight === 0) {
    setTimeout(init, 100)
    return
  }

  releaseChart()
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
      textStyle: { color: '#333' },
      formatter: (params: unknown) => {
        if (!Array.isArray(params) || params.length === 0) return ''
        const date = params[0].axisValueLabel as string
        const items = params
          .map(
            (item: { color: string; seriesName: string; value: number }) =>
              `<div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; background: ${item.color}; border-radius: 50%;"></span>
                <span>${item.seriesName}: ${item.value} kcal</span>
              </div>`
          )
          .join('')
        return `<div style="padding: 8px;"><div style="font-weight: 600; margin-bottom: 4px;">${date}</div>${items}</div>`
      }
    },
    legend: {
      show: hasData,
      data: seriesConfig.map((s) => s.name),
      top: 0,
      textStyle: { color: '#64748b' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', show: hasData },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.data.map((item) => item.date),
      show: hasData,
      axisLine: { lineStyle: { color: '#e0e6ed' } },
      axisLabel: { color: '#64748b', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      show: hasData,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 12, formatter: '{value} kcal' },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }
    },
    series: hasData
      ? seriesConfig.map((config) => ({
          name: config.name,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 3, color: config.color },
          itemStyle: { color: config.color, borderColor: '#fff', borderWidth: 2 },
          data: props.data.map((item) => item[config.key])
        }))
      : []
  }

  chart.setOption(option)
}

let resizeObserver: ResizeObserver | null = null

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  init()
  window.addEventListener('resize', handleResize)

  // 监听容器大小变化
  if (chartRef.value) {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  releaseChart()
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
