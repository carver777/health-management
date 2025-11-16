<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

definePageMeta({ layout: 'blank' })

const { login, register } = useAuth()
const isRegister = ref(useRoute().query.mode === 'register')

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

type LoginSchema = z.output<typeof loginSchema>
type RegisterSchema = z.output<typeof registerSchema>

const loginState = reactive<LoginSchema>({ email: '', password: '' })
const registerState = reactive<RegisterSchema>({
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  gender: '男'
})

const calendarValue = shallowRef<DateValue>(getTodayDateValue())
const dateOfBirthError = ref('')
const showPassword = reactive({ login: false, register: false, confirm: false })

const resetForm = () => {
  Object.assign(loginState, { email: '', password: '' })
  Object.assign(registerState, {
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '男'
  })
  calendarValue.value = getTodayDateValue()
  dateOfBirthError.value = ''
  Object.assign(showPassword, { login: false, register: false, confirm: false })
}

async function onLoginSubmit(event: FormSubmitEvent<LoginSchema>) {
  if (await login(event.data)) await navigateTo('/dashboard')
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
    isRegister.value = false
    resetForm()
  }
}

function switchToRegister() {
  isRegister.value = true
  resetForm()
}

function switchToLogin() {
  isRegister.value = false
  resetForm()
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-6">
    <UCard class="w-full max-w-md">
      <template #header>
        <h2 class="text-center text-2xl font-bold">
          {{ isRegister ? '注册' : '登录' }}健康生活管理系统
        </h2>
      </template>

      <!-- 登录表单 -->
      <UForm
        v-if="!isRegister"
        :schema="loginSchema"
        :state="loginState"
        class="space-y-4"
        @submit="onLoginSubmit"
      >
        <UFormField label="邮箱" name="email">
          <UInput v-model="loginState.email" type="email" placeholder="请输入邮箱" size="lg">
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
      </UForm>

      <!-- 注册表单 -->
      <UForm
        v-else
        :schema="registerSchema"
        :state="registerState"
        class="space-y-4"
        @submit="onRegisterSubmit"
      >
        <UFormField label="昵称" name="nickname">
          <UInput v-model="registerState.nickname" placeholder="请输入昵称" size="lg">
            <template #leading>
              <UIcon name="heroicons:user" />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="邮箱" name="email">
          <UInput v-model="registerState.email" type="email" placeholder="请输入邮箱" size="lg">
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
              <input v-model="registerState.gender" type="radio" value="男" class="h-4 w-4" />
              <span class="text-sm">男</span>
            </label>
            <label class="flex cursor-pointer items-center gap-2">
              <input v-model="registerState.gender" type="radio" value="女" class="h-4 w-4" />
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
            :min-value="createCalendarDate(1900, 1, 1)"
            :max-value="createCalendarDate(2050, 12, 31)"
          />
        </UFormField>

        <UButton type="submit" block size="lg" color="primary" class="mt-2"> 注册账户 </UButton>

        <UButton variant="ghost" block color="neutral" @click="switchToLogin">
          已有账户？点击登录
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
