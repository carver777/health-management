package com.stringtinyst.healthlife.utils;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.stereotype.Component;

@Component
public class UserChatSessionManager {

  private final Map<String, ChatMemory> userSessions = new ConcurrentHashMap<>();

  public void clearChatMemory(String sessionId) {
    userSessions.remove(sessionId);
  }

  public ChatMemory getChatMemory(String sessionId) {
    return userSessions.computeIfAbsent(sessionId, k -> new InMemoryChatMemory());
  }
}
