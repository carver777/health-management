package com.stringtinyst.healthlife.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;

@Slf4j
@Component
public class UserChatSessionManager {

    private final Map<String, ChatMemory> userSessions = new ConcurrentHashMap<>();

    @Autowired
    private ChatMemory chatMemory;

    public void clearChatMemory(String sessionId) {
        userSessions.remove(sessionId);
    }

    public ChatMemory getChatMemory(String sessionId) {
        return userSessions.computeIfAbsent(sessionId, k -> new InMemoryChatMemory());
    }
}
