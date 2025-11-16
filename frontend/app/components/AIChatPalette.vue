<script setup lang="ts">
const isOpen = defineModel<boolean>('open', { default: false })

const searchTerm = ref('')
const router = useRouter()

const handleAskAI = () => {
  isOpen.value = false

  if (searchTerm.value.trim()) {
    router.push({
      path: '/chat',
      query: { message: searchTerm.value.trim() }
    })
  } else {
    router.push('/chat')
  }

  searchTerm.value = ''
}

const handleClose = () => {
  isOpen.value = false
  searchTerm.value = ''
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="AI 健康助手"
    description="与 AI 助手对话，获取健康建议和问题解答"
    :ui="{ content: 'sm:h-[28rem]' }"
  >
    <template #content>
      <div class="flex h-full flex-col">
        <!-- 标题栏 -->
        <div class="flex items-center justify-between border-b border-default px-4 py-3">
          <div class="flex items-center gap-2">
            <UIcon name="heroicons:sparkles" class="text-lg" />
            <h3 class="font-semibold">AI 助手</h3>
          </div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="heroicons:x-mark"
            size="xs"
            @click="handleClose"
          />
        </div>

        <!-- 内容区域 -->
        <div class="flex flex-1 flex-col justify-center px-6 py-8">
          <div class="text-center">
            <UIcon name="heroicons:chat-bubble-left-right" class="mx-auto mb-4 text-6xl" />
            <h4 class="mb-2 text-lg font-semibold">向 AI 助手提问</h4>
            <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
              输入您的问题，AI 助手将为您提供健康管理建议
            </p>

            <!-- 搜索框 -->
            <div class="mx-auto max-w-md">
              <UInput
                v-model="searchTerm"
                placeholder="请输入您的问题..."
                icon="heroicons:magnifying-glass"
                size="lg"
                autofocus
                @keydown.enter="handleAskAI"
              />
            </div>

            <!-- 快捷操作按钮 -->
            <div class="mt-6 flex justify-center gap-2">
              <UButton color="primary" size="lg" @click="handleAskAI">
                <template #leading>
                  <UIcon name="heroicons:paper-airplane" />
                </template>
                {{ searchTerm.trim() ? '发送问题' : '打开 AI 助手' }}
              </UButton>
            </div>

            <!-- 示例问题 -->
            <div class="mt-8">
              <p class="mb-3 text-xs font-medium text-gray-500">快速开始：</p>
              <div class="flex flex-wrap justify-center gap-2">
                <UButton
                  v-for="example in [
                    '如何制定减肥计划？',
                    '适合我的运动方案',
                    '健康饮食建议',
                    '如何改善睡眠？'
                  ]"
                  :key="example"
                  variant="soft"
                  color="neutral"
                  size="xs"
                  @click="
                    () => {
                      searchTerm = example
                      handleAskAI()
                    }
                  "
                >
                  {{ example }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
