<script setup lang="ts">
import type { DateValue } from '@internationalized/date'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const toast = useToast()
const { getAvatarUrl, markAvatarUpdated } = useAvatar()
const {
  user,
  fetchUserProfile,
  updateProfile: updateProfileApi,
  resetPassword: resetPasswordApi
} = useAuth()
const tokenCookie = useCookie<string | null>('token')

// 基础状态
const loading = ref(true)
const calendarValue = shallowRef<DateValue>(getTodayDateValue())
const avatarFile = ref<File | null>(null)
const showEditDialog = ref(false)
const showGoalsDialog = ref(false)
const showAIChatPalette = ref(false)

// 用户信息
const defaultUser: User & { registrationDate?: string } = {
  userID: '',
  email: '',
  nickname: '张三',
  gender: '男',
  dateOfBirth: '2000-01-01',
  avatarUrl: '',
  registrationDate: undefined
}
const userInfo = computed<User & { registrationDate?: string }>(
  () => (user.value as User & { registrationDate?: string }) ?? defaultUser
)
const avatarUrl = computed(() =>
  avatarFile.value ? URL.createObjectURL(avatarFile.value) : getAvatarUrl()
)

// 健康数据
const healthStats = reactive({
  totalRecords: { diet: 0, exercise: 0, body: 0 },
  registrationDays: 0
})
const goals = reactive({
  targetWeight: null as number | null,
  dailyCaloriesIntake: null as number | null,
  dailyCaloriesBurn: null as number | null
})
const currentWeight = ref<number | null>(null)
const todayCalories = ref(0)
const todayCaloriesBurned = ref(0)

// 表单状态
const editForm = reactive({ nickname: '', gender: '', dateOfBirth: '' })
const passwordForm = reactive({ newPassword: '', confirmPassword: '' })
const goalsForm = reactive({
  targetWeight: null as number | null,
  dailyCaloriesIntake: null as number | null,
  dailyCaloriesBurn: null as number | null
})
const basicInfoSubmitting = ref(false)
const passwordSubmitting = ref(false)

// 统计数据配置
const HEALTH_ENDPOINTS = [
  { key: 'diet' as const, url: '/api/diet-items', label: '饮食记录' },
  { key: 'exercise' as const, url: '/api/exercise-items', label: '运动记录' },
  { key: 'body' as const, url: '/api/body-metrics', label: '体重记录' }
] as const

// 性别选项
const GENDER_OPTIONS = [
  { label: '男', value: '男' },
  { label: '女', value: '女' }
]

const refreshRegistrationDays = () => {
  const registrationDate = userInfo.value.registrationDate
  if (!registrationDate) {
    healthStats.registrationDays = 0
    return
  }
  const diffTime = Math.abs(Date.now() - new Date(registrationDate).getTime())
  healthStats.registrationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 上传头像
const uploadAvatar = async () => {
  if (!avatarFile.value) {
    toast.add({ title: '请选择头像图片', color: 'error' })
    return
  }

  try {
    const formData = new FormData()
    formData.append('avatar', avatarFile.value)
    const response = await $fetch<{ code: number; msg: string }>('/api/user/avatar', {
      method: 'POST',
      body: formData,
      headers: tokenCookie.value ? { token: tokenCookie.value } : undefined
    })

    if (response.code === 1) {
      markAvatarUpdated()
      avatarFile.value = null
      toast.add({ title: '头像上传成功', color: 'success' })
    } else {
      toast.add({ title: response.msg || '上传头像失败', color: 'error' })
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
    toast.add({ title: errorMsg, color: 'error' })
  }
}

// 加载用户数据
const loadUserData = async () => {
  loading.value = true
  try {
    const success = await fetchUserProfile()
    if (!success) {
      throw new Error('fetch failed')
    }
    refreshRegistrationDays()
    await loadHealthStats()
  } catch {
    toast.add({ title: '加载数据失败', color: 'error' })
  } finally {
    loading.value = false
  }
}

// 加载健康统计数据
const loadHealthStats = async () => {
  if (!userInfo.value.userID || !tokenCookie.value) return

  const headers = { Authorization: `Bearer ${tokenCookie.value}` }
  const fetchTotal = (url: string) =>
    $fetch<{ code: number; data: { total: number } }>(url, {
      method: 'GET',
      headers,
      params: { userID: userInfo.value.userID, page: 1, pageSize: 1 }
    }).catch(() => ({ code: 0, data: { total: 0 } }))

  try {
    const responses = await Promise.all(HEALTH_ENDPOINTS.map(({ url }) => fetchTotal(url)))
    HEALTH_ENDPOINTS.forEach((endpoint, index) => {
      const res = responses[index]
      if (res) healthStats.totalRecords[endpoint.key] = res.code === 1 ? res.data.total || 0 : 0
    })
  } catch (error) {
    console.error('Failed to load health stats:', error)
  }
}

// 编辑基本信息
const editBasicInfo = () => {
  Object.assign(editForm, {
    nickname: userInfo.value.nickname || '',
    gender: userInfo.value.gender || '',
    dateOfBirth: userInfo.value.dateOfBirth || ''
  })
  Object.assign(passwordForm, { newPassword: '', confirmPassword: '' })

  if (userInfo.value.dateOfBirth) {
    try {
      const [year, month, day] = userInfo.value.dateOfBirth.split('-').map(Number)
      if (year && month && day) calendarValue.value = createCalendarDate(year, month, day)
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
  if (basicInfoSubmitting.value) return
  if (!editForm.nickname?.trim()) {
    toast.add({ title: '请输入昵称', color: 'error' })
    return
  }
  if (!editForm.gender) {
    toast.add({ title: '请选择性别', color: 'error' })
    return
  }

  basicInfoSubmitting.value = true
  try {
    const success = await updateProfileApi({
      nickname: editForm.nickname,
      gender: editForm.gender,
      dateOfBirth: dateValueToString(calendarValue.value)
    })

    if (success) {
      await fetchUserProfile(true)
      refreshRegistrationDays()
      showEditDialog.value = false
      toast.add({ title: '保存成功', description: '基本信息已更新', color: 'success' })
    }
  } catch {
    toast.add({ title: '保存失败', color: 'error' })
  } finally {
    basicInfoSubmitting.value = false
  }
}

// 更新密码
const updatePassword = async () => {
  if (passwordSubmitting.value) return
  if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
    toast.add({ title: '请填写至少 6 位的新密码', color: 'error' })
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.add({ title: '两次输入的密码不一致', color: 'error' })
    return
  }
  if (!userInfo.value.nickname || !userInfo.value.email) {
    toast.add({ title: '缺少昵称或邮箱，无法修改密码', color: 'error' })
    return
  }

  passwordSubmitting.value = true
  try {
    const success = await resetPasswordApi({
      nickname: userInfo.value.nickname!,
      email: userInfo.value.email!,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    })

    if (success) Object.assign(passwordForm, { newPassword: '', confirmPassword: '' })
  } finally {
    passwordSubmitting.value = false
  }
}

// 保存健康目标
const saveGoals = async () => {
  const validations = [
    { value: goalsForm.targetWeight, min: 30, max: 200, msg: '目标体重应在 30-200 kg 之间' },
    {
      value: goalsForm.dailyCaloriesIntake,
      min: 800,
      max: 5000,
      msg: '每日卡路里摄入目标应在 800-5000 kcal 之间'
    },
    {
      value: goalsForm.dailyCaloriesBurn,
      min: 200,
      max: 3000,
      msg: '每日卡路里消耗目标应在 200-3000 kcal 之间'
    }
  ]

  for (const { value, min, max, msg } of validations) {
    if (value !== null && (value < min || value > max)) {
      toast.add({ title: msg, color: 'error' })
      return
    }
  }

  try {
    Object.assign(goals, goalsForm)
    if (import.meta.client) {
      localStorage.setItem('healthGoals', JSON.stringify(goals))
    }
    showGoalsDialog.value = false
    toast.add({ title: '设置成功', description: '健康目标已更新', color: 'success' })
  } catch {
    toast.add({ title: '保存失败', color: 'error' })
  }
}

const calculateProgress = (current: number, target: number | null) =>
  target ? Math.min(100, (current / target) * 100) : 0

const caloriesIntakeProgress = computed(() =>
  calculateProgress(todayCalories.value, goals.dailyCaloriesIntake)
)
const caloriesBurnProgress = computed(() =>
  calculateProgress(todayCaloriesBurned.value, goals.dailyCaloriesBurn)
)

const getProgressColor = (percentage: number) => {
  if (percentage >= 85) return 'success'
  if (percentage >= 60) return 'warning'
  return 'error'
}

const getWeightColor = () => {
  if (!currentWeight.value || !goals.targetWeight) return 'text-gray-900'
  const errorPercentage =
    (Math.abs(currentWeight.value - goals.targetWeight) / goals.targetWeight) * 100
  if (errorPercentage <= 5) return 'text-green-600'
  if (errorPercentage <= 40) return 'text-yellow-600'
  return 'text-red-600'
}

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
    <UPageHeader title="个人资料" description="管理您的个人信息" class="pt-2! sm:pt-3!" />

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
                  v-bind="avatarUrl ? { src: avatarUrl } : {}"
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
                <div
                  v-for="item in [
                    { label: '邮箱', value: userInfo.email },
                    { label: '昵称', value: userInfo.nickname },
                    { label: '性别', value: userInfo.gender },
                    { label: '出生日期', value: formatDate(userInfo.dateOfBirth) }
                  ]"
                  :key="item.label"
                  class="flex items-center justify-between"
                >
                  <span class="text-sm font-medium">{{ item.label }}</span>
                  <span class="text-sm">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </UCard>

          <!-- 健康统计卡片 -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">健康统计</h3>
            </template>

            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="item in [
                  { value: healthStats.totalRecords.body, label: '体重记录' },
                  { value: healthStats.registrationDays, label: '注册天数' },
                  { value: healthStats.totalRecords.diet, label: '饮食记录' },
                  { value: healthStats.totalRecords.exercise, label: '运动记录' }
                ]"
                :key="item.label"
                class="rounded-lg p-4"
              >
                <div class="text-2xl font-bold">{{ item.value }}</div>
                <div class="text-xs">{{ item.label }}</div>
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
                :model-value="caloriesIntakeProgress"
                :color="getProgressColor(caloriesIntakeProgress)"
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
                :model-value="caloriesBurnProgress"
                :color="getProgressColor(caloriesBurnProgress)"
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
    <UModal v-model:open="showEditDialog" :ui="{ wrapper: 'sm:max-w-2xl' }">
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900"
          >
            <UIcon name="heroicons:user-circle" class="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">编辑基本信息</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">修改您的个人基本信息</p>
          </div>
        </div>
      </template>

      <template #body>
        <div class="space-y-8 p-1">
          <!-- 基本信息部分 -->
          <div class="space-y-5">
            <div class="flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-700">
              <UIcon name="heroicons:identification" class="h-5 w-5 text-primary-500" />
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">个人信息</h4>
            </div>

            <div class="grid gap-6 sm:grid-cols-2">
              <!-- 昵称 -->
              <div class="group space-y-2">
                <label for="edit-nickname" class="flex items-center gap-2 text-sm font-medium">
                  <span>昵称</span>
                  <span class="text-red-500">*</span>
                </label>
                <UInput
                  id="edit-nickname"
                  v-model="editForm.nickname"
                  placeholder="请输入昵称"
                  size="lg"
                >
                  <template #trailing>
                    <UIcon
                      v-if="editForm.nickname"
                      name="heroicons:check-circle"
                      class="h-5 w-5 text-green-500"
                    />
                  </template>
                </UInput>
              </div>

              <!-- 性别 -->
              <div class="space-y-2">
                <label for="edit-gender" class="flex items-center gap-2 text-sm font-medium">
                  <span>性别</span>
                  <span class="text-red-500">*</span>
                </label>
                <USelect
                  id="edit-gender"
                  v-model="editForm.gender"
                  :items="GENDER_OPTIONS"
                  placeholder="请选择性别"
                  size="lg"
                />
              </div>

              <!-- 出生日期 -->
              <div class="space-y-2 sm:col-span-2">
                <label for="edit-birth-date" class="flex items-center gap-2 text-sm font-medium">
                  <span>出生日期</span>
                </label>
                <DatePicker id="edit-birth-date" v-model="calendarValue" block size="lg" />
              </div>
            </div>
          </div>

          <!-- 密码修改部分 -->
          <div class="space-y-5">
            <div class="flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-700">
              <UIcon name="heroicons:lock-closed" class="h-5 w-5 text-amber-500" />
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">修改密码</h4>
              <UBadge color="warning" variant="subtle" size="xs">选填</UBadge>
            </div>

            <div class="grid gap-6 sm:grid-cols-2">
              <!-- 新密码 -->
              <div class="space-y-2">
                <label for="edit-new-password" class="flex items-center gap-2 text-sm font-medium">
                  <span>新密码</span>
                </label>
                <UInput
                  id="edit-new-password"
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  size="lg"
                >
                  <template #trailing>
                    <UIcon
                      v-if="passwordForm.newPassword && passwordForm.newPassword.length >= 6"
                      name="heroicons:check-circle"
                      class="h-5 w-5 text-green-500"
                    />
                    <UIcon
                      v-else-if="passwordForm.newPassword"
                      name="heroicons:exclamation-circle"
                      class="h-5 w-5 text-amber-500"
                    />
                  </template>
                </UInput>
                <p v-if="passwordForm.newPassword" class="flex items-center gap-1 text-xs">
                  <UIcon
                    :name="
                      passwordForm.newPassword.length >= 6
                        ? 'heroicons:check-circle'
                        : 'heroicons:x-circle'
                    "
                    :class="
                      passwordForm.newPassword.length >= 6
                        ? 'text-green-500'
                        : 'text-gray-400 dark:text-gray-500'
                    "
                    class="h-3.5 w-3.5"
                  />
                  <span :class="passwordForm.newPassword.length >= 6 ? 'text-green-600' : ''">
                    至少 6 个字符
                  </span>
                </p>
              </div>

              <!-- 确认密码 -->
              <div class="space-y-2">
                <label
                  for="edit-confirm-password"
                  class="flex items-center gap-2 text-sm font-medium"
                >
                  <span>确认新密码</span>
                </label>
                <UInput
                  id="edit-confirm-password"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  size="lg"
                >
                  <template #trailing>
                    <UIcon
                      v-if="
                        passwordForm.confirmPassword &&
                        passwordForm.newPassword === passwordForm.confirmPassword
                      "
                      name="heroicons:check-circle"
                      class="h-5 w-5 text-green-500"
                    />
                    <UIcon
                      v-else-if="passwordForm.confirmPassword"
                      name="heroicons:x-circle"
                      class="h-5 w-5 text-red-500"
                    />
                  </template>
                </UInput>
                <p
                  v-if="passwordForm.confirmPassword"
                  class="flex items-center gap-1 text-xs"
                  :class="
                    passwordForm.newPassword === passwordForm.confirmPassword
                      ? 'text-green-600'
                      : 'text-red-600'
                  "
                >
                  <UIcon
                    :name="
                      passwordForm.newPassword === passwordForm.confirmPassword
                        ? 'heroicons:check-circle'
                        : 'heroicons:x-circle'
                    "
                    :class="
                      passwordForm.newPassword === passwordForm.confirmPassword
                        ? 'text-green-500'
                        : 'text-red-500'
                    "
                    class="h-3.5 w-3.5"
                  />
                  <span>
                    {{
                      passwordForm.newPassword === passwordForm.confirmPassword
                        ? '密码匹配'
                        : '密码不匹配'
                    }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer="{ close }">
        <div class="flex flex-wrap items-center justify-end gap-3">
          <UButton color="neutral" variant="ghost" size="lg" icon="heroicons:x-mark" @click="close">
            取消
          </UButton>
          <UButton
            color="primary"
            variant="solid"
            size="lg"
            icon="heroicons:check"
            :loading="basicInfoSubmitting"
            @click="saveBasicInfo"
          >
            保存基本信息
          </UButton>
          <UButton
            v-if="passwordForm.newPassword || passwordForm.confirmPassword"
            color="warning"
            variant="solid"
            size="lg"
            icon="heroicons:key"
            :loading="passwordSubmitting"
            @click="updatePassword"
          >
            更新密码
          </UButton>
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
