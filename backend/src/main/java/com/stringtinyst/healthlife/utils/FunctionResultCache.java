package com.stringtinyst.healthlife.utils;

import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.Supplier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** 轻量级函数结果缓存，减少同一轮对话内的重复函数调用 */
@Component
public class FunctionResultCache {

  private static final class CacheEntry {
    private final String value;
    private final long timestamp;

    CacheEntry(String value, long timestamp) {
      this.value = value;
      this.timestamp = timestamp;
    }
  }

  private final ConcurrentMap<String, CacheEntry> cache = new ConcurrentHashMap<>();
  private final long ttlMillis;

  public FunctionResultCache(@Value("${ai.function.cache.ttl-seconds:10}") long ttlSeconds) {
    if (ttlSeconds <= 0) {
      ttlSeconds = 10;
    }
    this.ttlMillis = Duration.ofSeconds(ttlSeconds).toMillis();
  }

  /** 返回缓存结果或重新计算；TTL 过期后自动刷新 */
  public String getOrCompute(String key, Supplier<String> supplier) {
    Objects.requireNonNull(key, "key must not be null");
    Objects.requireNonNull(supplier, "supplier must not be null");

    long now = System.currentTimeMillis();
    CacheEntry hit = cache.get(key);
    if (hit != null && now - hit.timestamp <= ttlMillis) {
      return hit.value;
    }

    String value = supplier.get();
    cache.put(key, new CacheEntry(value, now));
    return value;
  }

  /** 根据前缀清理缓存，用于写操作后快速失效相关查询 */
  public void evictByPrefix(String prefix) {
    if (prefix == null || prefix.isEmpty()) {
      return;
    }
    cache.keySet().removeIf(key -> key.startsWith(prefix));
  }
}
