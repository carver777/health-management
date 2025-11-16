<script setup lang="ts">
import type { DateValue } from '@internationalized/date'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const toast = useToast()
const showAIChatPalette = ref(false)

// 获取 token（用于 API 请求）
const tokenCookie = useCookie<string | null>('token')

// Loading 状态
const loading = ref(true)

// 日历状态
const calendarValue = shallowRef<DateValue>(getTodayDateValue())

// 用户信息
const userInfo = reactive({
  userID: '',
  email: 'user@example.com',
  nickname: '健康达人',
  gender: '男',
  dateOfBirth: '1990-01-15',
  avatarUrl: ''
})

// 头像文件
const avatarFile = ref<File | null>(null)

// 使用全局共享的头像 URL 状态
const sharedAvatarUrl = useState<string>('sharedAvatarUrl', () => {
  if (import.meta.client) {
    const timestamp = localStorage.getItem('avatarTimestamp')
    if (timestamp && tokenCookie.value) {
      return `/api/user/avatar?t=${timestamp}`
    }
  }
  return ''
})

// 健康统计
const healthStats = reactive({
  totalRecords: {
    diet: 0,
    exercise: 0,
    body: 0
  },
  registrationDays: 0
})

// 健康目标
const goals = reactive({
  targetWeight: null as number | null,
  dailyCaloriesIntake: null as number | null,
  dailyCaloriesBurn: null as number | null
})

// 当前数据
const currentWeight = ref<number | null>(null)
const todayCalories = ref(0)
const todayCaloriesBurned = ref(0)

// 对话框状态
const showEditDialog = ref(false)
const showGoalsDialog = ref(false)

// 编辑表单
const editForm = reactive({
  nickname: '',
  gender: '',
  dateOfBirth: ''
})

// 目标表单
const goalsForm = reactive({
  targetWeight: null as number | null,
  dailyCaloriesIntake: null as number | null,
  dailyCaloriesBurn: null as number | null
})

// 创建头像 URL
const avatarUrl = computed(() => {
  // 如果选择了新文件，显示预览
  if (avatarFile.value) {
    return URL.createObjectURL(avatarFile.value)
  }
  // 否则使用共享的头像 URL
  return sharedAvatarUrl.value
})

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 上传头像
const uploadAvatar = async () => {
  if (!avatarFile.value) {
    toast.add({
      title: '请选择头像图片',
      color: 'error'
    })
    return
  }

  try {
    const formData = new FormData()
    formData.append('avatar', avatarFile.value)
    const response = await $fetch<{ code: number; msg: string }>('/api/user/avatar', {
      method: 'POST',
      body: formData,
      headers: tokenCookie.value
        ? {
            token: tokenCookie.value
          }
        : undefined
    })

    if (response.code === 1) {
      // 上传成功后更新时间戳并更新共享状态
      const newTimestamp = Date.now().toString()
      if (import.meta.client) {
        localStorage.setItem('avatarTimestamp', newTimestamp)
      }

      sharedAvatarUrl.value = `/api/user/avatar?t=${newTimestamp}`
      avatarFile.value = null

      toast.add({
        title: '头像上传成功',
        color: 'success'
      })
    } else {
      toast.add({
        title: response.msg || '上传头像失败',
        color: 'error'
      })
    }
  } catch (error: unknown) {
    const errorMsg =
      error &&
      typeof error === 'object' &&
      'data' in error &&
      error.data &&
      typeof error.data === 'object' &&
      'msg' in error.data
        ? String(error.data.msg)
        : '上传头像失败'
    toast.add({
      title: errorMsg,
      color: 'error'
    })
  }
}

// 加载用户数据
const loadUserData = async () => {
  loading.value = true
  try {
    const response = await $fetch<{
      code: number
      data: {
        userID: string
        email: string
        nickname: string
        gender: string
        dateOfBirth: string
        registrationDate?: string
      }
    }>('/api/user/profile', {
      headers: tokenCookie.value
        ? {
            Authorization: `Bearer ${tokenCookie.value}`
          }
        : undefined
    })

    if (response.code === 1 && response.data) {
      Object.assign(userInfo, response.data)

      // 计算注册天数
      if (response.data.registrationDate) {
        const registrationDate = new Date(response.data.registrationDate)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - registrationDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        healthStats.registrationDays = diffDays
      }

      // 加载健康统计数据
      await loadHealthStats()
    }
  } catch {
    toast.add({ title: '加载数据失败', color: 'error' })
  } finally {
    loading.value = false
  }
}

// 加载健康统计数据
const loadHealthStats = async () => {
  if (!userInfo.userID || !tokenCookie.value) return

  try {
    const headers = {
      Authorization: `Bearer ${tokenCookie.value}`
    }

    // 并行查询三个接口获取记录总数
    const [dietResponse, exerciseResponse, bodyResponse] = await Promise.all([
      // 查询饮食记录总数
      $fetch<{ code: number; data: { rows: unknown[]; total: number } }>('/api/diet-items', {
        method: 'GET',
        headers,
        params: {
          userID: userInfo.userID,
          page: 1,
          pageSize: 1
        }
      }).catch(() => ({ code: 0, data: { rows: [], total: 0 } })),

      // 查询运动记录总数
      $fetch<{ code: number; data: { rows: unknown[]; total: number } }>('/api/exercise-items', {
        method: 'GET',
        headers,
        params: {
          userID: userInfo.userID,
          page: 1,
          pageSize: 1
        }
      }).catch(() => ({ code: 0, data: { rows: [], total: 0 } })),

      // 查询体重记录总数
      $fetch<{ code: number; data: { rows: unknown[]; total: number } }>('/api/body-metrics', {
        method: 'GET',
        headers,
        params: {
          userID: userInfo.userID,
          page: 1,
          pageSize: 1
        }
      }).catch(() => ({ code: 0, data: { rows: [], total: 0 } }))
    ])

    // 更新统计数据
    if (dietResponse.code === 1 && dietResponse.data) {
      healthStats.totalRecords.diet = dietResponse.data.total || 0
    }

    if (exerciseResponse.code === 1 && exerciseResponse.data) {
      healthStats.totalRecords.exercise = exerciseResponse.data.total || 0
    }

    if (bodyResponse.code === 1 && bodyResponse.data) {
      healthStats.totalRecords.body = bodyResponse.data.total || 0
    }
  } catch (error) {
    console.error('Failed to load health stats:', error)
  }
}

// 编辑基本信息
const editBasicInfo = () => {
  // 初始化表单数据
  editForm.nickname = userInfo.nickname
  editForm.gender = userInfo.gender
  editForm.dateOfBirth = userInfo.dateOfBirth

  // 将字符串日期转换为 DateValue
  if (userInfo.dateOfBirth) {
    try {
      const [year, month, day] = userInfo.dateOfBirth.split('-').map(Number)
      if (year && month && day) {
        calendarValue.value = createCalendarDate(year, month, day)
      }
    } catch {
      calendarValue.value = getTodayDateValue()
    }
  } else {
    calendarValue.value = getTodayDateValue()
  }

  showEditDialog.value = true
}

// 保存基本信息
const saveBasicInfo = async () => {
  if (!editForm.nickname?.trim()) {
    toast.add({
      title: '请输入昵称',
      color: 'error'
    })
    return
  }

  if (!editForm.gender) {
    toast.add({
      title: '请选择性别',
      color: 'error'
    })
    return
  }

  try {
    const dateStr = dateValueToString(calendarValue.value)

    const response = await $fetch<{ code: number }>('/api/user/profile', {
      method: 'PUT',
      body: {
        nickname: editForm.nickname,
        gender: editForm.gender,
        dateOfBirth: dateStr
      },
      headers: tokenCookie.value
        ? {
            Authorization: `Bearer ${tokenCookie.value}`
          }
        : undefined
    })

    if (response.code === 1) {
      userInfo.nickname = editForm.nickname
      userInfo.gender = editForm.gender
      userInfo.dateOfBirth = dateStr

      showEditDialog.value = false
      toast.add({
        title: '保存成功',
        description: '基本信息已更新',
        color: 'success'
      })
    }
  } catch {
    toast.add({
      title: '保存失败',
      color: 'error'
    })
  }
}

// 保存健康目标
const saveGoals = async () => {
  if (
    goalsForm.targetWeight !== null &&
    (goalsForm.targetWeight < 30 || goalsForm.targetWeight > 200)
  ) {
    toast.add({
      title: '目标体重应在 30-200 kg 之间',
      color: 'error'
    })
    return
  }

  if (
    goalsForm.dailyCaloriesIntake !== null &&
    (goalsForm.dailyCaloriesIntake < 800 || goalsForm.dailyCaloriesIntake > 5000)
  ) {
    toast.add({
      title: '每日卡路里摄入目标应在 800-5000 kcal 之间',
      color: 'error'
    })
    return
  }

  if (
    goalsForm.dailyCaloriesBurn !== null &&
    (goalsForm.dailyCaloriesBurn < 200 || goalsForm.dailyCaloriesBurn > 3000)
  ) {
    toast.add({
      title: '每日卡路里消耗目标应在 200-3000 kcal 之间',
      color: 'error'
    })
    return
  }

  try {
    // 更新本地数据
    if (goalsForm.targetWeight !== null) goals.targetWeight = goalsForm.targetWeight
    if (goalsForm.dailyCaloriesIntake !== null)
      goals.dailyCaloriesIntake = goalsForm.dailyCaloriesIntake
    if (goalsForm.dailyCaloriesBurn !== null) goals.dailyCaloriesBurn = goalsForm.dailyCaloriesBurn

    if (import.meta.client) {
      localStorage.setItem(
        'healthGoals',
        JSON.stringify({
          targetWeight: goals.targetWeight,
          dailyCaloriesIntake: goals.dailyCaloriesIntake,
          dailyCaloriesBurn: goals.dailyCaloriesBurn
        })
      )
    }

    showGoalsDialog.value = false
    toast.add({
      title: '设置成功',
      description: '健康目标已更新',
      color: 'success'
    })
  } catch {
    toast.add({
      title: '保存失败',
      color: 'error'
    })
  }
}

const calculateCaloriesIntakeProgress = () => {
  if (!goals.dailyCaloriesIntake) return 0
  return Math.min(100, (todayCalories.value / goals.dailyCaloriesIntake) * 100)
}

const calculateCaloriesBurnProgress = () => {
  if (!goals.dailyCaloriesBurn) return 0
  return Math.min(100, (todayCaloriesBurned.value / goals.dailyCaloriesBurn) * 100)
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 85) return 'success'
  if (percentage >= 60) return 'warning'
  return 'error'
}

// 获取体重颜色
const getWeightColor = () => {
  if (!currentWeight.value || !goals.targetWeight) return 'text-gray-900'
  const difference = Math.abs(currentWeight.value - goals.targetWeight)
  const errorPercentage = (difference / goals.targetWeight) * 100
  if (errorPercentage <= 5) return 'text-green-600'
  if (errorPercentage <= 40) return 'text-yellow-600'
  return 'text-red-600'
}

// 生命周期
onMounted(() => {
  loadUserData()

  if (import.meta.client) {
    try {
      const savedGoals = localStorage.getItem('healthGoals')
      if (savedGoals) {
        const parsed = JSON.parse(savedGoals)
        if (parsed.targetWeight !== null) goals.targetWeight = parsed.targetWeight
        if (parsed.dailyCaloriesIntake !== null)
          goals.dailyCaloriesIntake = parsed.dailyCaloriesIntake
        if (parsed.dailyCaloriesBurn !== null) goals.dailyCaloriesBurn = parsed.dailyCaloriesBurn
      }
    } catch {
      // 忽略加载错误
    }
  }
})
</script>

<template>
  <UPage>
    <UPageHeader title="个人资料" description="管理您的个人信息" />

    <UPageBody>
      <!-- Loading 状态 -->
      <div v-if="loading">
        <div class="space-y-6">
          <!-- Loading 进度条 -->
          <div class="flex flex-col items-center justify-center py-12">
            <UProgress animation="carousel" class="mb-4 w-64" />
            <p class="text-sm">加载中...</p>
          </div>

          <!-- 骨架屏 -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <UCard>
              <USkeleton class="mb-4 h-6 w-32" />
              <div class="space-y-3">
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-4 w-3/4" />
              </div>
            </UCard>
            <UCard>
              <USkeleton class="mb-4 h-6 w-32" />
              <div class="grid grid-cols-2 gap-4">
                <USkeleton class="h-20 w-full" />
                <USkeleton class="h-20 w-full" />
                <USkeleton class="h-20 w-full" />
                <USkeleton class="h-20 w-full" />
              </div>
            </UCard>
          </div>

          <UCard>
            <USkeleton class="mb-4 h-6 w-32" />
            <div class="space-y-6">
              <USkeleton class="h-8 w-full" />
              <USkeleton class="h-8 w-full" />
              <USkeleton class="h-8 w-full" />
            </div>
          </UCard>
        </div>
      </div>

      <!-- 实际内容 -->
      <div v-else>
        <!-- 基本信息和健康统计 -->
        <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- 基本信息卡片 -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">基本信息</h3>
                <UButton
                  size="xs"
                  color="primary"
                  variant="soft"
                  icon="heroicons:pencil"
                  @click="editBasicInfo"
                >
                  编辑
                </UButton>
              </div>
            </template>

            <div class="flex flex-col gap-6 md:flex-row">
              <!-- 头像上传区域 -->
              <div class="flex flex-col items-center gap-3 md:w-1/3">
                <UAvatar
                  :src="avatarUrl"
                  :alt="userInfo.nickname"
                  size="3xl"
                  icon="heroicons:user"
                  class="ring-2 ring-gray-200 dark:ring-gray-700"
                />

                <div class="flex w-full flex-col gap-2">
                  <UFileUpload v-slot="{ open, removeFile }" v-model="avatarFile" accept="image/*">
                    <div class="flex flex-col gap-2">
                      <UButton
                        size="xs"
                        :label="avatarFile ? '更换头像' : '上传头像'"
                        color="primary"
                        variant="outline"
                        icon="heroicons:arrow-up-tray"
                        block
                        @click="open()"
                      />

                      <div v-if="avatarFile" class="flex gap-2">
                        <UButton
                          size="xs"
                          label="保存"
                          color="success"
                          class="flex-1"
                          @click="uploadAvatar"
                        />

                        <UButton
                          size="xs"
                          label="取消"
                          color="neutral"
                          variant="ghost"
                          class="flex-1"
                          @click="removeFile()"
                        />
                      </div>
                    </div>

                    <p v-if="avatarFile" class="mt-1 text-center text-xs">{{ avatarFile.name }}</p>
                  </UFileUpload>

                  <p class="text-center text-xs">JPG、PNG、GIF</p>
                  <p class="text-center text-xs">最大 2MB</p>
                </div>
              </div>

              <!-- 基本信息列表 (占 2/3) -->
              <div class="flex-1 space-y-4 md:w-2/3 md:border-l md:pl-6">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">邮箱</span>
                  <span class="text-sm">{{ userInfo.email }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">昵称</span>
                  <span class="text-sm">{{ userInfo.nickname }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">性别</span>
                  <span class="text-sm">{{ userInfo.gender }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">出生日期</span>
                  <span class="text-sm">{{ formatDate(userInfo.dateOfBirth) }}</span>
                </div>
              </div>
            </div>
          </UCard>

          <!-- 健康统计卡片 -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">健康统计</h3>
              </div>
            </template>

            <div class="grid grid-cols-2 gap-4">
              <div class="rounded-lg p-4">
                <div class="text-2xl font-bold">
                  {{ healthStats.totalRecords.body }}
                </div>
                <div class="text-xs">体重记录</div>
              </div>
              <div class="rounded-lg p-4">
                <div class="text-2xl font-bold">{{ healthStats.registrationDays }}</div>
                <div class="text-xs">注册天数</div>
              </div>
              <div class="rounded-lg p-4">
                <div class="text-2xl font-bold">
                  {{ healthStats.totalRecords.diet }}
                </div>
                <div class="text-xs">饮食记录</div>
              </div>
              <div class="rounded-lg p-4">
                <div class="text-2xl font-bold">
                  {{ healthStats.totalRecords.exercise }}
                </div>
                <div class="text-xs">运动记录</div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- 健康目标 -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">健康目标</h3>
              <UButton
                size="xs"
                color="success"
                variant="soft"
                icon="heroicons:cog-6-tooth"
                @click="
                  () => {
                    goalsForm.targetWeight = goals.targetWeight
                    goalsForm.dailyCaloriesIntake = goals.dailyCaloriesIntake
                    goalsForm.dailyCaloriesBurn = goals.dailyCaloriesBurn
                    showGoalsDialog = true
                  }
                "
              >
                设置目标
              </UButton>
            </div>
          </template>

          <div class="space-y-6">
            <!-- 卡路里摄入目标 -->
            <div>
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm font-medium">每日卡路里摄入目标</span>
                <span class="text-sm font-bold"> {{ goals.dailyCaloriesIntake }} kcal </span>
              </div>
              <UProgress
                :model-value="calculateCaloriesIntakeProgress()"
                :color="getProgressColor(calculateCaloriesIntakeProgress())"
                size="md"
              />
            </div>

            <!-- 卡路里消耗目标 -->
            <div>
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm font-medium">每日卡路里消耗目标</span>
                <span class="text-sm font-bold"> {{ goals.dailyCaloriesBurn }} kcal </span>
              </div>
              <UProgress
                :model-value="calculateCaloriesBurnProgress()"
                :color="getProgressColor(calculateCaloriesBurnProgress())"
                size="md"
              />
            </div>

            <!-- 目标体重 -->
            <div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">目标体重</span>
                <div class="flex items-baseline gap-2">
                  <span class="text-lg font-bold" :class="getWeightColor()">
                    {{ currentWeight?.toFixed(1) }}
                  </span>
                  <span>/</span>
                  <span class="text-lg font-bold"> {{ goals.targetWeight?.toFixed(1) }} kg </span>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </UPageBody>

    <!-- 编辑基本信息对话框 -->
    <UModal v-model:open="showEditDialog" title="编辑基本信息" description="修改您的个人基本信息">
      <template #body="{ close }">
        <div class="space-y-4">
          <div>
            <label for="edit-nickname" class="mb-2 block text-sm font-medium">昵称</label>
            <UInput id="edit-nickname" v-model="editForm.nickname" placeholder="请输入昵称" />
          </div>
          <div>
            <label for="edit-gender" class="mb-2 block text-sm font-medium">性别</label>
            <USelect
              id="edit-gender"
              v-model="editForm.gender"
              :items="[
                { label: '男', value: '男' },
                { label: '女', value: '女' }
              ]"
              placeholder="请选择性别"
            />
          </div>
          <div>
            <label for="edit-birth-date" class="mb-2 block text-sm font-medium">出生日期</label>
            <DatePicker id="edit-birth-date" v-model="calendarValue" block />
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="outline" @click="close"> 取消 </UButton>
            <UButton color="primary" @click="saveBasicInfo"> 保存 </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- 设置健康目标对话框 -->
    <UModal v-model:open="showGoalsDialog" title="设置健康目标" description="设置您的每日健康目标">
      <template #body="{ close }">
        <div class="space-y-4">
          <div>
            <label for="goal-calories-intake" class="mb-2 block text-sm font-medium"
              >每日卡路里摄入目标 (kcal)</label
            >
            <UInput
              id="goal-calories-intake"
              v-model.number="goalsForm.dailyCaloriesIntake"
              type="number"
              placeholder="请输入目标值"
            />
          </div>
          <div>
            <label for="goal-calories-burn" class="mb-2 block text-sm font-medium"
              >每日卡路里消耗目标 (kcal)</label
            >
            <UInput
              id="goal-calories-burn"
              v-model.number="goalsForm.dailyCaloriesBurn"
              type="number"
              placeholder="请输入目标值"
            />
          </div>
          <div>
            <label for="goal-weight" class="mb-2 block text-sm font-medium">目标体重 (kg)</label>
            <UInput
              id="goal-weight"
              v-model.number="goalsForm.targetWeight"
              type="number"
              step="0.1"
              placeholder="请输入目标体重"
            />
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="outline" @click="close"> 取消 </UButton>
            <UButton color="success" @click="saveGoals"> 保存目标 </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- AI 聊天面板 -->
    <AIChatPalette v-model:open="showAIChatPalette" />
  </UPage>
</template>
