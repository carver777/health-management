import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock useCookie
vi.mock('#app', () => ({
  useCookie: vi.fn(() => ({ value: 'mock-token' }))
}))

describe('sse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('ssePost', () => {
    it('应该能处理正常的 SSE 响应流', async () => {
      // 模拟一个返回 SSE 数据的响应
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"message": "hello"}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"message": "world"}\n\n'))
          controller.enqueue(new TextEncoder().encode('event: close\n\n'))
          controller.close()
        }
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream
      })

      const { ssePost } = await import('~/utils/sse')
      const controller = new AbortController()

      const generator = await ssePost<{ message: string }>('/api/test', {
        params: { test: 'value' },
        signal: controller.signal
      })

      const results: { message: string }[] = []
      for await (const item of generator) {
        results.push(item)
      }

      expect(results).toHaveLength(2)
      expect(results[0]?.message).toBe('hello')
      expect(results[1]?.message).toBe('world')
    })

    it('应该在请求失败时抛出错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server Error')
      })

      const { ssePost } = await import('~/utils/sse')
      const controller = new AbortController()

      await expect(
        ssePost('/api/test', {
          params: {},
          signal: controller.signal
        })
      ).rejects.toThrow('Server Error')
    })

    it('应该在响应体为空时抛出错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: null
      })

      const { ssePost } = await import('~/utils/sse')
      const controller = new AbortController()

      const generator = await ssePost('/api/test', {
        params: {},
        signal: controller.signal
      })

      // 应该在迭代时抛出错误
      await expect(async () => {
        for await (const _ of generator) {
          // 迭代
        }
      }).rejects.toThrow('No response body')
    })

    it('应该使用 POST 方法发送请求', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('event: close\n\n'))
          controller.close()
        }
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream
      })

      const { ssePost } = await import('~/utils/sse')
      const controller = new AbortController()

      await ssePost('/api/test', {
        params: { key: 'value' },
        signal: controller.signal
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ key: 'value' })
        })
      )
    })

    it('应该设置 Content-Type 请求头', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('event: close\n\n'))
          controller.close()
        }
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream
      })

      const { ssePost } = await import('~/utils/sse')
      const controller = new AbortController()

      await ssePost('/api/test', {
        params: {},
        signal: controller.signal
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })
  })
})
