<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarDate } from '@internationalized/date'
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

definePageMeta({ layout: 'blank' })

const { login, register, resetPassword: resetPasswordApi } = useAuth()
const route = useRoute()
const isRegister = ref(route.query.mode === 'register')
const isReset = ref(route.query.mode === 'reset')

const passwordSchema = z.string().min(6, '密码长度至少 6 个字符')

const loginSchema = z.object({
  email: z.email('请输入正确的邮箱格式'),
  password: passwordSchema
})

const registerSchema = z
  .object({
    nickname: z.string().min(2, '昵称长度至少 2 个字符').max(20, '昵称长度最多 20 个字符'),
    email: z.email('请输入正确的邮箱格式'),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    gender: z.enum(['男', '女'], { message: '请选择性别' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword']
  })

const resetSchema = z
  .object({
    nickname: z.string().min(2, '昵称长度至少 2 个字符').max(20, '昵称长度最多 20 个字符'),
    email: z.email('请输入正确的邮箱格式'),
    newPassword: passwordSchema,
    confirmPassword: passwordSchema
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword']
  })

type LoginSchema = z.output<typeof loginSchema>
type RegisterSchema = z.output<typeof registerSchema>
type ResetSchema = z.output<typeof resetSchema>

const loginState = reactive<LoginSchema>({ email: '', password: '' })
const registerState = reactive<RegisterSchema>({
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  gender: '男'
})
const resetState = reactive<ResetSchema>({
  nickname: '',
  email: '',
  newPassword: '',
  confirmPassword: ''
})

const calendarValue = shallowRef<DateValue>(getTodayDateValue())
const dateOfBirthError = ref('')
const showPassword = reactive({
  login: false,
  register: false,
  confirm: false,
  reset: false,
  resetConfirm: false
})

const resetForm = () => {
  loginState.email = ''
  loginState.password = ''
  registerState.nickname = ''
  registerState.email = ''
  registerState.password = ''
  registerState.confirmPassword = ''
  registerState.gender = '男'
  resetState.nickname = ''
  resetState.email = ''
  resetState.newPassword = ''
  resetState.confirmPassword = ''
  calendarValue.value = getTodayDateValue()
  dateOfBirthError.value = ''
  showPassword.login = false
  showPassword.register = false
  showPassword.confirm = false
  showPassword.reset = false
  showPassword.resetConfirm = false
}

async function onLoginSubmit(event: FormSubmitEvent<LoginSchema>) {
  const success = await login(event.data)
  if (success) {
    await nextTick()
    await navigateTo('/dashboard', { replace: true })
  }
}

async function onRegisterSubmit(event: FormSubmitEvent<RegisterSchema>) {
  if (!calendarValue.value) {
    dateOfBirthError.value = '请选择出生日期'
    return
  }

  const success = await register({
    ...event.data,
    dateOfBirth: dateValueToString(calendarValue.value)
  })

  if (success) {
    switchToLogin()
  }
}

async function onResetSubmit(event: FormSubmitEvent<ResetSchema>) {
  const success = await resetPasswordApi(event.data)
  if (success) switchToLogin()
}

function switchToRegister() {
  isRegister.value = true
  isReset.value = false
  resetForm()
}

function switchToLogin() {
  isRegister.value = false
  isReset.value = false
  resetForm()
}

function switchToReset() {
  isRegister.value = false
  isReset.value = true
  resetForm()
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-6">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h2 class="text-center text-2xl font-bold">
          {{ isRegister ? '注册' : '登录' }}健康生活管理系统
        </h2>
      </template>

      <!-- 登录表单 -->
      <UForm
        v-if="!isRegister && !isReset"
        :schema="loginSchema"
        :state="loginState"
        class="space-y-4"
        @submit="onLoginSubmit"
      >
        <UFormField label="邮箱" name="email">
          <UInput
            v-model="loginState.email"
            type="email"
            placeholder="请输入邮箱"
            size="lg"
            class="w-full"
          >
            <template #leading>
              <UIcon name="heroicons:envelope" />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="密码" name="password">
          <UInput
            v-model="loginState.password"
            :type="showPassword.login ? 'text' : 'password'"
            placeholder="请输入密码"
            size="lg"
            class="w-full"
          >
            <template #leading>
              <UIcon name="heroicons:lock-closed" />
            </template>
            <template #trailing>
              <UIcon
                :name="showPassword.login ? 'heroicons:eye-slash' : 'heroicons:eye'"
                class="cursor-pointer"
                @click="showPassword.login = !showPassword.login"
              />
            </template>
          </UInput>
        </UFormField>

        <UButton type="submit" block size="lg" color="primary" class="mt-2"> 立即登录 </UButton>

        <UButton variant="ghost" block color="neutral" @click="switchToRegister">
          没有账户？点击注册
        </UButton>
        <UButton variant="ghost" block color="neutral" @click="switchToReset">
          忘记密码？点击重置
        </UButton>
      </UForm>

      <!-- 注册表单 -->
      <UForm
        v-else-if="isRegister"
        :schema="registerSchema"
        :state="registerState"
        class="space-y-4"
        @submit="onRegisterSubmit"
      >
        <UFormField label="昵称" name="nickname">
          <UInput
            v-model="registerState.nickname"
            placeholder="请输入昵称"
            size="lg"
            class="w-full"
          >
            <template #leading>
              <UIcon name="heroicons:user" />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="邮箱" name="email">
          <UInput
            v-model="registerState.email"
            type="email"
            placeholder="请输入邮箱"
            size="lg"
            class="w-full"
          >
            <template #leading>
              <UIcon name="heroicons:envelope" />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="密码" name="password">
          <UInput
            v-model="registerState.password"
            :type="showPassword.register ? 'text' : 'password'"
            placeholder="请输入密码"
            size="lg"
            class="w-full"
          >
            <template #leading>
              <UIcon name="heroicons:lock-closed" />
            </template>
            <template #trailing>
              <UIcon
                :name="showPassword.register ? 'heroicons:eye-slash' : 'heroicons:eye'"
                class="cursor-pointer"
                @click="showPassword.register = !showPassword.register"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="确认密码" name="confirmPassword">
          <UInput
            v-model="registerState.confirmPassword"
            :type="showPassword.confirm ? 'text' : 'password'"
            placeholder="请再次输入密码"
            size="lg"
            class="w-full"
          >
            <template #leading>
              <UIcon name="heroicons:lock-closed" />
            </template>
            <template #trailing>
              <UIcon
                :name="showPassword.confirm ? 'heroicons:eye-slash' : 'heroicons:eye'"
                class="cursor-pointer"
                @click="showPassword.confirm = !showPassword.confirm"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="性别" name="gender">
          <div class="flex gap-4">
            <label class="flex cursor-pointer items-center gap-2">
              <input
                v-model="registerState.gender"
                type="radio"
                name="gender"
                value="男"
                class="h-4 w-4"
              />
              <span class="text-sm">男</span>
            </label>
            <label class="flex cursor-pointer items-center gap-2">
              <input
                v-model="registerState.gender"
                type="radio"
                name="gender"
                value="女"
                class="h-4 w-4"
              />
              <span class="text-sm">女</span>
            </label>
          </div>
        </UFormField>

        <UFormField label="出生日期" :error="dateOfBirthError">
          <DatePicker
            v-model="calendarValue"
            block
            size="lg"
            placeholder="请选择出生日期"
            :min-value="new CalendarDate(1900, 1, 1)"
            :max-value="new CalendarDate(2050, 12, 31)"
          />
        </UFormField>

        <UButton type="submit" block size="lg" color="primary" class="mt-2"> 注册账户 </UButton>

        <UButton variant="ghost" block color="neutral" @click="switchToLogin">
          已有账户？点击登录
        </UButton>
      </UForm>

      <!-- 重置密码表单 -->
      <UForm
        v-else
        :schema="resetSchema"
        :state="resetState"
        class="space-y-4"
        @submit="onResetSubmit"
      >
        <UFormField label="昵称" name="nickname">
          <UInput
            v-model="resetState.nickname"
            placeholder="请输入注册时的昵称"
            size="lg"
            class="w-full"
          >
            <template #leading>
              <UIcon name="heroicons:user" />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="邮箱" name="email">
          <UInput
            v-model="resetState.email"
            type="email"
            placeholder="请输入邮箱"
            size="lg"
            class="w-full"
          >
            <template #leading>
              <UIcon name="heroicons:envelope" />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="新密码" name="newPassword">
          <UInput
            v-model="resetState.newPassword"
            :type="showPassword.reset ? 'text' : 'password'"
            placeholder="请输入新密码"
            size="lg"
            class="w-full"
          >
            <template #leading>
              <UIcon name="heroicons:lock-closed" />
            </template>
            <template #trailing>
              <UIcon
                :name="showPassword.reset ? 'heroicons:eye-slash' : 'heroicons:eye'"
                class="cursor-pointer"
                @click="showPassword.reset = !showPassword.reset"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="确认新密码" name="confirmPassword">
          <UInput
            v-model="resetState.confirmPassword"
            :type="showPassword.resetConfirm ? 'text' : 'password'"
            placeholder="请再次输入新密码"
            size="lg"
            class="w-full"
          >
            <template #leading>
              <UIcon name="heroicons:lock-closed" />
            </template>
            <template #trailing>
              <UIcon
                :name="showPassword.resetConfirm ? 'heroicons:eye-slash' : 'heroicons:eye'"
                class="cursor-pointer"
                @click="showPassword.resetConfirm = !showPassword.resetConfirm"
              />
            </template>
          </UInput>
        </UFormField>

        <p class="text-xs text-gray-500">请输入注册时设置的昵称与邮箱，若两者匹配则允许重置密码</p>

        <UButton type="submit" block size="lg" color="primary" class="mt-2"> 重置密码 </UButton>

        <UButton variant="ghost" block color="neutral" @click="switchToLogin"> 返回登录 </UButton>
      </UForm>
    </UCard>
  </div>
</template>
