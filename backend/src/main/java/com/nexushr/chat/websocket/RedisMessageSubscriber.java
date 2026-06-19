package com.nexushr.chat.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexushr.chat.dto.ChatMessageDto;
import com.nexushr.chat.dto.PresenceUpdateDto;
import com.nexushr.chat.dto.TypingBroadcastDto;
import com.nexushr.chat.dto.MessageReceiptUpdateDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisMessageSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String payload = new String(message.getBody(), StandardCharsets.UTF_8);
            String topic = new String(message.getChannel(), StandardCharsets.UTF_8);

            if (RedisConfig.CHAT_TOPIC.equals(topic)) {
                ChatMessageDto chatMessage = objectMapper.readValue(payload, ChatMessageDto.class);
                String destination = "/topic/conversations." + chatMessage.getConversationId();
                messagingTemplate.convertAndSend(destination, chatMessage);
                log.debug("Redis subscriber relayed message to WebSocket destination: {}", destination);
            } else if (RedisConfig.PRESENCE_TOPIC.equals(topic)) {
                PresenceUpdateDto presenceUpdate = objectMapper.readValue(payload, PresenceUpdateDto.class);
                messagingTemplate.convertAndSend("/topic/presence", presenceUpdate);
                log.debug("Redis subscriber relayed presence to WebSocket destination: /topic/presence");
            } else if (RedisConfig.TYPING_TOPIC.equals(topic)) {
                TypingBroadcastDto typingUpdate = objectMapper.readValue(payload, TypingBroadcastDto.class);
                String destination = "/topic/conversations." + typingUpdate.getConversationId() + ".typing";
                messagingTemplate.convertAndSend(destination, typingUpdate);
            } else if (RedisConfig.RECEIPT_TOPIC.equals(topic)) {
                MessageReceiptUpdateDto receiptUpdate = objectMapper.readValue(payload, MessageReceiptUpdateDto.class);
                String destination = "/topic/conversations." + receiptUpdate.getConversationId() + ".receipts";
                messagingTemplate.convertAndSend(destination, receiptUpdate);
            }
        } catch (Exception e) {
            log.error("Failed to process message from Redis Pub/Sub", e);
        }
    }
}
