package com.nexushr.chat.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexushr.chat.dto.ChatMessageDto;
import com.nexushr.chat.dto.PresenceUpdateDto;
import com.nexushr.chat.dto.TypingBroadcastDto;
import com.nexushr.chat.dto.MessageReceiptUpdateDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisPubSubService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public void broadcastMessage(ChatMessageDto message) {
        try {
            String payload = objectMapper.writeValueAsString(message);
            redisTemplate.convertAndSend(RedisConfig.CHAT_TOPIC, payload);
            log.debug("Message published to Redis: {}", message.getId());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize message for Redis Pub/Sub", e);
        }
    }

    public void broadcastPresence(PresenceUpdateDto update) {
        try {
            String payload = objectMapper.writeValueAsString(update);
            redisTemplate.convertAndSend(RedisConfig.PRESENCE_TOPIC, payload);
            log.debug("Presence published to Redis for user: {}", update.getUserId());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize presence update for Redis Pub/Sub", e);
        }
    }

    public void broadcastTypingEvent(TypingBroadcastDto update) {
        try {
            String payload = objectMapper.writeValueAsString(update);
            redisTemplate.convertAndSend(RedisConfig.TYPING_TOPIC, payload);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize typing update for Redis Pub/Sub", e);
        }
    }

    public void broadcastReceiptUpdate(MessageReceiptUpdateDto update) {
        try {
            String payload = objectMapper.writeValueAsString(update);
            redisTemplate.convertAndSend(RedisConfig.RECEIPT_TOPIC, payload);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize receipt update for Redis Pub/Sub", e);
        }
    }
}
