<script setup lang="ts">
interface Props {
  data: { date: string; weight: number }[]
  timePeriod: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:timePeriod': [value: string] }>()

const { echarts, initChart, disposeChart } = useECharts()

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

const averageWeight = computed(() => {
  if (props.data.length === 0) return 0
  const total = props.data.reduce((sum, item) => sum + item.weight, 0)
  return (total / props.data.length).toFixed(1)
})

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
      text: '暂无体重数据',
      textStyle: { color: '#999', fontSize: 16, fontWeight: 'normal' },
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
        const data = params[0] as { axisValueLabel: string; value: number; color: string }
        return `<div style="padding: 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${data.axisValueLabel}</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; background: ${data.color}; border-radius: 50%;"></span>
            <span>体重: ${data.value} kg</span>
          </div>
        </div>`
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '5%', show: hasData },
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
      axisLabel: { color: '#64748b', fontSize: 12, formatter: '{value} kg' },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }
    },
    series: hasData
      ? [
          {
            name: '体重',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' }
              ])
            },
            itemStyle: {
              color: '#667eea',
              borderColor: '#fff',
              borderWidth: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
              ])
            },
            data: props.data.map((item) => item.weight)
          }
        ]
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
          <UIcon name="mdi:scale-bathroom" />
          <h3>体重趋势</h3>
        </div>
        <div class="flex flex-wrap gap-3 text-sm">
          <div class="flex items-center gap-2">
            <span>平均体重:</span>
            <span class="font-semibold">{{ averageWeight }} kg</span>
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
