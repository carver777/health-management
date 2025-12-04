<script setup lang="ts">
import { marked } from 'marked'
import DOMPurify from 'dompurify'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isStreaming?: boolean
}

const route = useRoute()
const input = ref('')
const isLoading = ref(false)
const messages = reactive<Message[]>([])
const messagesContainer = ref<HTMLElement>()
const abortController = ref<AbortController | null>(null)

const CHAT_HISTORY_KEY = 'health_chat_history'
const SUGGESTIONS = [
  '如何制定减肥计划？',
  '适合我的运动方案',
  '健康饮食建议',
  '如何改善睡眠质量？',
  '每天需要多少热量？',
  '推荐的锻炼频率'
] as const

const toast = useToast()
const { getAvatarUrl } = useAvatar()
const avatarUrl = computed(() => getAvatarUrl())

marked.setOptions({
  gfm: true,
  breaks: true
})

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'code',
  'pre',
  'a',
  'ul',
  'ol',
  'li',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'del',
  'ins'
]
const ALLOWED_ATTR = ['href', 'title', 'target', 'class', 'rel']

const sanitizeHtml = (content: string) => {
  if (!content?.trim()) return ''

  try {
    const cleanHtml = DOMPurify.sanitize(marked.parse(content) as string, {
      ALLOWED_TAGS,
      ALLOWED_ATTR
    })

    if (!import.meta.client) return cleanHtml

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = cleanHtml
    tempDiv.querySelectorAll('a').forEach((link) => {
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener noreferrer')
    })
    return tempDiv.innerHTML
  } catch {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i'],
      ALLOWED_ATTR: []
    })
  }
}

const loadChatHistory = () => {
  if (!import.meta.client) return

  try {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY)
    if (!saved) return

    const historyData = JSON.parse(saved)
    messages.splice(
      0,
      messages.length,
      ...historyData.map((msg: Message) => ({
        ...msg,
        isStreaming: false
      }))
    )
  } catch {
    localStorage.removeItem(CHAT_HISTORY_KEY)
  }
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null

const saveChatHistory = () => {
  if (!import.meta.client) return
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-100)))
  } catch {
    toast.add({ title: '聊天历史保存失败', color: 'warning' })
  }
}

const debouncedSave = () => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(saveChatHistory, 500)
}

const startNewChat = async () => {
  if (!import.meta.client) return

  try {
    isLoading.value = true
    const token = useCookie('token').value

    await $fetch('/api/chat/memory', {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

    localStorage.removeItem(CHAT_HISTORY_KEY)
    messages.splice(0, messages.length)
    toast.add({ title: '已开始新对话', color: 'success' })
  } catch {
    toast.add({ title: '操作失败', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()

  if (!input.value.trim() || isLoading.value) return

  const userMessage = input.value.trim()
  const messageId = Date.now().toString()

  // 添加用户消息
  messages.push({
    id: `user-${messageId}`,
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString()
  })

  input.value = ''
  isLoading.value = true

  await scrollToBottom()

  // 创建 AI 回复消息
  const aiMessageIndex = messages.length
  messages.push({
    id: `assistant-${messageId}`,
    role: 'assistant',
    content: '',
    timestamp: new Date().toISOString(),
    isStreaming: true
  })

  await scrollToBottom()

  try {
    abortController.value = new AbortController()

    const stream = await ssePost<{ content: string; partial?: boolean }>('/api/chat/stream', {
      signal: abortController.value.signal,
      params: {
        query: userMessage,
        history: messages.slice(0, -1).map((m) => ({
          role: m.role,
          content: m.content
        }))
      }
    })

    for await (const chunk of stream) {
      if (messages[aiMessageIndex]) {
        messages[aiMessageIndex].content += chunk.content
        await scrollToBottom()
      }
    }

    if (messages[aiMessageIndex]) {
      messages[aiMessageIndex].isStreaming = false
      saveChatHistory()
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      if (messages[aiMessageIndex]) {
        messages[aiMessageIndex].isStreaming = false
        saveChatHistory()
      }
      return
    }

    toast.add({ title: '发送消息失败，请稍后重试', color: 'error' })

    if (messages[aiMessageIndex]) {
      messages[aiMessageIndex].content = '抱歉，我暂时无法回复，请稍后重试。'
      messages[aiMessageIndex].isStreaming = false
      saveChatHistory()
    }
  } finally {
    isLoading.value = false
    abortController.value = null
    await scrollToBottom()
  }
}

const handleStop = () => {
  if (abortController.value) {
    abortController.value.abort()
  }
}

watch(
  messages,
  () => {
    if (messages.length > 0) debouncedSave()
  },
  { deep: true, flush: 'post' }
)

onMounted(() => {
  loadChatHistory()
  if (messages.length > 0) nextTick(scrollToBottom)

  const message = (route.query.message as string)?.trim()
  if (message) {
    input.value = message
    nextTick(() => handleSubmit(new Event('submit')))
  }
})

onUnmounted(() => {
  if (saveTimeout) clearTimeout(saveTimeout)
  if (abortController.value) {
    abortController.value.abort()
  }
})
</script>

<template>
  <UPage>
    <UPageHeader
      title="健康咨询"
      description="与 AI 助手交流，获取健康管理建议"
      class="pt-2! sm:pt-3!"
    />

    <UPageBody class="flex h-[calc(100vh-80px)] flex-col p-0!">
      <!-- 聊天记录区域 - 固定高度，可滚动 -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <!-- 空状态 -->
        <div
          v-if="messages.length === 0"
          class="flex h-full flex-col items-center justify-center text-center"
        >
          <UIcon name="heroicons:chat-bubble-left-right" class="mb-4 text-6xl" />
          <h3 class="text-lg font-semibold">开始与 AI 助手对话</h3>
          <p class="mt-2 text-sm">你可以询问关于健康管理、饮食建议、运动计划等问题</p>
        </div>

        <!-- 消息列表 -->
        <div v-else class="space-y-4">
          <div
            v-for="message in messages"
            :key="message.id"
            :class="['flex gap-3', message.role === 'user' ? 'flex-row-reverse' : '']"
          >
            <!-- 头像 -->
            <div :class="['shrink-0']">
              <UAvatar
                v-if="message.role === 'user'"
                v-bind="avatarUrl ? { src: avatarUrl } : {}"
                alt="用户头像"
                size="md"
                icon="heroicons:user"
              />
              <div
                v-else
                class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900"
              >
                <UIcon
                  name="heroicons:sparkles"
                  class="text-lg text-primary-600 dark:text-primary-400"
                />
              </div>
            </div>

            <!-- 消息内容 -->
            <div
              :class="[
                'flex max-w-[70%] flex-col',
                message.role === 'user' ? 'items-end' : 'items-start'
              ]"
            >
              <div :class="['rounded-2xl px-4 py-3']">
                <!-- 流式输入指示器 -->
                <div
                  v-if="message.isStreaming && (!message.content || message.content.trim() === '')"
                  class="flex gap-1.5 py-2"
                >
                  <span class="h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
                  <span class="h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
                  <span class="h-2 w-2 animate-bounce rounded-full" />
                </div>
                <!-- 已使用 DOMPurify 清理 -->
                <div
                  v-else-if="message.content"
                  class="prose prose-sm dark:prose-invert max-w-none"
                  v-html="/* eslint-disable-line vue/no-v-html */ sanitizeHtml(message.content)"
                />
              </div>
              <div class="mt-1 text-xs">
                {{ formatDateTimeDisplay(message.timestamp) }}
                <span v-if="message.isStreaming" class="ml-2">正在输入...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 聊天输入框 - 固定在底部 -->
      <div class="shrink-0 border-t border-default px-4 py-4 sm:px-6">
        <!-- 快捷提示（仅在输入为空时显示） -->
        <div v-if="!input.trim() && !isLoading" class="mb-3">
          <p class="mb-2 text-xs font-medium opacity-60">向我问点什么...</p>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="suggestion in SUGGESTIONS"
              :key="suggestion"
              variant="soft"
              color="neutral"
              size="xs"
              @click="input = suggestion"
            >
              {{ suggestion }}
            </UButton>
          </div>
        </div>

        <UChatPrompt
          v-model="input"
          :disabled="isLoading"
          placeholder="给 AI 助手发送消息（Shift + Enter 换行）"
          @submit="handleSubmit"
        >
          <UChatPromptSubmit
            :status="isLoading ? 'streaming' : 'ready'"
            :disabled="!input.trim() && !isLoading"
            @stop="handleStop"
          />
          <template #footer>
            <div class="flex gap-2">
              <UButton
                color="primary"
                variant="soft"
                icon="heroicons:plus"
                size="xs"
                :disabled="isLoading"
                @click="startNewChat"
              >
                新对话
              </UButton>
            </div>
          </template>
        </UChatPrompt>
      </div>
    </UPageBody>
  </UPage>
</template>

<style scoped>
/* Markdown 内容样式 */
.prose :deep(p) {
  margin: 0 0 0.5rem;
}

.prose :deep(p:last-child) {
  margin-bottom: 0;
}

.prose :deep(strong),
.prose :deep(b) {
  font-weight: 600;
}

.prose :deep(code) {
  padding: 0.125rem 0.375rem;
  background: rgb(0 0 0 / 0.05);
  border-radius: 0.25rem;
  font-family: ui-monospace, monospace;
  font-size: 0.875em;
}

.prose :deep(pre) {
  margin: 0.5rem 0;
  padding: 0.75rem;
  overflow-x: auto;
  background: rgb(0 0 0 / 0.05);
  border-radius: 0.5rem;
  font-family: ui-monospace, monospace;
  font-size: 0.875em;
  line-height: 1.5;
}

.prose :deep(pre code) {
  padding: 0;
  background: transparent;
  border-radius: 0;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.25rem;
}

.prose :deep(li) {
  margin: 0.25rem 0;
}

.prose :deep(blockquote) {
  margin: 0.5rem 0;
  padding-left: 0.75rem;
  border-left: 0.25rem solid rgb(0 0 0 / 0.2);
  font-style: italic;
  opacity: 0.9;
}

.prose :deep(a) {
  text-decoration: underline;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.prose :deep(a:hover) {
  opacity: 1;
}

.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3),
.prose :deep(h4),
.prose :deep(h5),
.prose :deep(h6) {
  margin: 0.75rem 0 0.5rem;
  font-weight: 600;
}

.prose :deep(h1) {
  font-size: 1.25em;
}

.prose :deep(h2) {
  font-size: 1.15em;
}

.prose :deep(h3) {
  font-size: 1.1em;
}

.prose :deep(table) {
  width: 100%;
  margin: 0.75rem 0;
  overflow: hidden;
  background: rgb(255 255 255 / 0.5);
  border-collapse: collapse;
  border-radius: 0.375rem;
}

.prose :deep(th),
.prose :deep(td) {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgb(0 0 0 / 0.1);
  text-align: left;
}

.prose :deep(th) {
  background: rgb(0 0 0 / 0.05);
  font-weight: 600;
}

.prose :deep(tr:last-child td) {
  border-bottom: none;
}

.prose :deep(hr) {
  height: 1px;
  margin: 1rem 0;
  background: rgb(0 0 0 / 0.1);
  border: none;
}
</style>
