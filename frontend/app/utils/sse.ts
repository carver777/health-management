/**
 * SSE 流式请求工具
 */

interface AsyncQueue<T> {
  generator: AsyncGenerator<T>
  pushValue: (value: T) => void
  close: () => void
  pushError: (err: unknown) => void
}

class AsyncQueueImpl<T> {
  private buffer: Array<T | null> = []
  private pendingResolve: ((value: T | null) => void) | null = null
  private pendingReject: ((reason?: unknown) => void) | null = null
  private storedError: unknown = null
  private finished = false

  private resolvePending(value: T | null) {
    if (this.pendingResolve) {
      this.pendingResolve(value)
      this.pendingResolve = null
      this.pendingReject = null
    }
  }

  private rejectPending(err: unknown) {
    if (this.pendingReject) {
      this.pendingReject(err)
      this.pendingResolve = null
      this.pendingReject = null
    }
  }

  private nextValue(): Promise<T | null> {
    if (this.buffer.length > 0) {
      return Promise.resolve(this.buffer.shift()!)
    }
    if (this.storedError) {
      const err = this.storedError
      this.storedError = null
      return Promise.reject(err)
    }
    if (this.finished) {
      return Promise.resolve(null)
    }
    return new Promise<T | null>((resolve, reject) => {
      this.pendingResolve = resolve
      this.pendingReject = reject
    })
  }

  pushValue(value: T) {
    if (this.finished) return

    if (this.pendingResolve) {
      this.resolvePending(value)
    } else {
      this.buffer.push(value)
    }
  }

  close() {
    if (this.finished) return

    this.finished = true
    if (this.pendingResolve) {
      this.resolvePending(null)
    } else {
      this.buffer.push(null)
    }
  }

  pushError(err: unknown) {
    if (this.finished) return

    this.finished = true
    if (this.pendingReject) {
      this.rejectPending(err)
    } else {
      this.storedError = err
    }
  }

  async *generate() {
    while (true) {
      const value = await this.nextValue()
      if (value === null) break
      yield value
    }
  }
}

const createAsyncQueue = <T>(): AsyncQueue<T> => {
  const queue = new AsyncQueueImpl<T>()
  return {
    generator: queue.generate(),
    pushValue: (value: T) => queue.pushValue(value),
    close: () => queue.close(),
    pushError: (err: unknown) => queue.pushError(err)
  }
}

export interface SSEPostOptions {
  params: Record<string, unknown>
  signal: AbortSignal
}

/**
 * 使用 fetch 发送 POST 请求处理 SSE 流
 */
export async function ssePost<T>(path: string, options: SSEPostOptions) {
  const { params, signal } = options

  return new Promise<AsyncGenerator<T>>((resolve, reject) => {
    const { generator, pushValue, close, pushError } = createAsyncQueue<T>()
    let hasResolved = false

    const token = useCookie('token').value

    fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(params),
      signal
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = (await res.text()) || res.statusText
          throw new Error(text)
        }
        hasResolved = true
        resolve(generator)
        return res.body
      })
      .then(async (body) => {
        if (!body) {
          throw new Error('No response body')
        }

        const decoder = new TextDecoder()
        const reader = body.getReader()
        let buffer = ''

        // 跳过空白字符
        const skipWhitespace = (str: string, start: number): number => {
          while (start < str.length && /\s/.test(str[start] ?? '')) {
            start++
          }
          return start
        }

        // 跳过 SSE data: 前缀
        const skipDataPrefix = (str: string, start: number): number => {
          if (!str.slice(start).startsWith('data:')) return start

          start += 5
          while (start < str.length && str[start] === ' ') {
            start++
          }
          return start
        }

        // 查找完整的 JSON 对象
        const findCompleteJson = (str: string, start: number): number => {
          let braceCount = 0
          let inString = false
          let escapeNext = false

          for (let i = start; i < str.length; i++) {
            const char = str[i]

            if (escapeNext) {
              escapeNext = false
              continue
            }

            if (char === '\\' && inString) {
              escapeNext = true
              continue
            }

            if (char === '"') {
              inString = !inString
              continue
            }

            if (!inString) {
              if (char === '{') {
                braceCount++
              } else if (char === '}') {
                braceCount--
                if (braceCount === 0) {
                  return i
                }
              }
            }
          }

          return -1
        }

        /**
         * 解析连续的 JSON 对象流
         * 支持格式: {"content":"a"}{"content":"b"} 或标准 SSE data: 格式
         */
        const processBuffer = async (flushAll = false): Promise<boolean> => {
          // 处理标准 SSE 格式的 close 事件
          if (buffer.includes('event: close') || buffer.includes('event:close')) {
            close()
            await reader.cancel()
            return true
          }

          // 尝试解析连续的 JSON 对象
          let searchStart = 0
          while (searchStart < buffer.length) {
            searchStart = skipWhitespace(buffer, searchStart)
            if (searchStart >= buffer.length) break

            searchStart = skipDataPrefix(buffer, searchStart)

            // 查找 JSON 对象的起始位置
            const jsonStart = buffer.indexOf('{', searchStart)
            if (jsonStart === -1) break

            // 尝试找到完整的 JSON 对象
            const jsonEnd = findCompleteJson(buffer, jsonStart)

            // 如果没有找到完整的 JSON，保留 buffer 等待更多数据
            if (jsonEnd === -1) {
              buffer = flushAll ? '' : buffer.slice(jsonStart)
              break
            }

            // 提取并解析 JSON
            const jsonStr = buffer.slice(jsonStart, jsonEnd + 1)
            try {
              const parsed = JSON.parse(jsonStr)
              pushValue(parsed)
            } catch {
              // JSON 解析失败，跳过这个对象
            }

            searchStart = jsonEnd + 1
          }

          if (searchStart > 0 && searchStart <= buffer.length) {
            buffer = buffer.slice(searchStart)
          }

          return false
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              const flushed = await processBuffer(true)
              if (!flushed) {
                close()
              }
              break
            }

            buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')
            const shouldStop = await processBuffer()
            if (shouldStop) {
              return
            }
          }
        } finally {
          reader.releaseLock()
        }
      })
      .catch((err) => {
        if (hasResolved) {
          pushError(err)
        } else {
          reject(err)
        }
      })
  })
}
