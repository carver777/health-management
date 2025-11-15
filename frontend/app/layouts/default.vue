<template>
  <UDashboardGroup>
    <UDashboardSidebar
      v-model:collapsed="isCollapsed"
      collapsible
      resizable
      :default-size="20"
      :min-size="15"
      :max-size="30"
      :collapsed-size="5"
      :ui="{
        root: 'transition-all duration-300 ease-in-out'
      }"
    >
      <template #header="{ collapsed }">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-chart-bar" class="text-2xl text-primary" />
          <Transition
            enter-active-class="transition-opacity duration-300 delay-150 ease-out"
            leave-active-class="transition-opacity duration-150 ease-in"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
            mode="out-in"
          >
            <h1 v-if="!collapsed" class="overflow-hidden text-lg font-bold whitespace-nowrap">
              健康管理系统
            </h1>
          </Transition>
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex flex-1 flex-col overflow-hidden">
          <UNavigationMenu :collapsed="collapsed" :items="menuItems" orientation="vertical" />

          <div class="mt-auto border-t border-gray-200 pt-4 dark:border-gray-800">
            <UDashboardSidebarCollapse
              :icon="collapsed ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'"
            />
          </div>
        </div>
      </template>

      <template #footer="{ collapsed }">
        <ClientOnly>
          <UDropdownMenu
            :items="accountMenuItems"
            :content="{ align: 'end', side: 'top', sideOffset: 8 }"
          >
            <UButton
              :label="collapsed ? undefined : '账户操作'"
              color="neutral"
              variant="ghost"
              block
              trailing-icon="i-heroicons-chevron-up"
            >
              <template #leading>
                <UAvatar
                  :src="userStore.avatarUrl || undefined"
                  :alt="userStore.user.nickname"
                  size="xs"
                  icon="i-heroicons-user"
                />
              </template>
            </UButton>
          </UDropdownMenu>
        </ClientOnly>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <template #body>
        <slot />
      </template>
    </UDashboardPanel>

    <!-- AI 助手悬浮按钮 (除了 chat 页面) -->
    <UTooltip v-if="route.path !== '/chat'" text="AI 助手" :ui="{ content: 'z-[100]' }">
      <UButton
        icon="i-heroicons-sparkles"
        color="primary"
        size="xl"
        class="fixed right-6 bottom-6 z-50 rounded-full shadow-lg"
        @click="router.push('/chat')"
      />
    </UTooltip>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'

const router = useRouter()
const route = useRoute()
const { user, logout } = useAuth()
const tokenCookie = useCookie('token')

const isCollapsed = ref(false)

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

const userStore = computed(() => ({
  user: user.value || { nickname: '用户' },
  avatarUrl: sharedAvatarUrl.value
}))

const menuItems = computed<NavigationMenuItem[]>(() => [
  {
    label: '数据概览',
    icon: 'i-heroicons-chart-bar',
    to: '/dashboard',
    active: route.path === '/dashboard'
  },
  {
    label: '身体数据',
    icon: 'i-heroicons-chart-pie',
    to: '/body-data',
    active: route.path === '/body-data'
  },
  {
    label: '饮食管理',
    icon: 'i-heroicons-cake',
    to: '/diet',
    active: route.path === '/diet'
  },
  {
    label: '运动管理',
    icon: 'i-heroicons-fire',
    to: '/exercise',
    active: route.path === '/exercise'
  },
  {
    label: '健康咨询',
    icon: 'i-heroicons-chat-bubble-left-right',
    to: '/chat',
    active: route.path === '/chat'
  }
])

const handleLogout = async () => {
  try {
    logout()
    await navigateTo('/login', { replace: true })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'message' in err && 'stack' in err) {
      throw err
    }
  }
}

const accountMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: '个人资料',
      icon: 'i-heroicons-user',
      to: '/profile'
    }
  ],
  [
    {
      label: '退出登录',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      color: 'error',
      onSelect: handleLogout
    }
  ]
])
</script>
