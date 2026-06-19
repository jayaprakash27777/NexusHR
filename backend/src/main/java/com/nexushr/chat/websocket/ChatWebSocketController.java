package com.nexushr.chat.websocket;

import com.nexushr.auth.model.User;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.chat.dto.ChatMessageDto;
import com.nexushr.chat.dto.PresenceUpdateDto;
import com.nexushr.chat.dto.TypingBroadcastDto;
import com.nexushr.chat.model.ChatMessage;
import com.nexushr.chat.model.Conversation;
import com.nexushr.chat.model.enums.MessageStatus;
import com.nexushr.chat.model.enums.MessageType;
import com.nexushr.chat.repository.ChatMessageRepository;
import com.nexushr.chat.repository.ConversationRepository;
import com.nexushr.chat.repository.ChatMessageEditRepository;
import com.nexushr.chat.model.ChatMessageEdit;
import com.nexushr.chat.repository.ChatMessageDeletionRepository;
import com.nexushr.chat.model.ChatMessageDeletion;
import com.nexushr.chat.repository.ChatMessageReactionRepository;
import com.nexushr.chat.model.ChatMessageReaction;
import com.nexushr.chat.dto.MessageReceiptUpdateDto;
import java.util.Optional;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import com.nexushr.notification.service.NotificationService;
import com.nexushr.notification.model.NotificationType;
import com.nexushr.chat.model.ConversationParticipant;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.Set;
import java.util.HashSet;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatMessageRepository chatMessageRepository;
    private final ConversationRepository conversationRepository;
    private final ChatMessageEditRepository chatMessageEditRepository;
    private final ChatMessageDeletionRepository chatMessageDeletionRepository;
    private final ChatMessageReactionRepository chatMessageReactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final RedisPubSubService redisPubSubService;
    private final StringRedisTemplate redisTemplate;

    @MessageMapping("/chat.sendMessage")
    @Transactional
    public void sendMessage(@Payload ChatMessageRequest request, Principal principal) {
        if (principal == null) {
            log.warn("Unauthenticated WebSocket message rejected");
            return;
        }

        String email = principal.getName();
        User sender = userRepository.findByEmail(email).orElseThrow();
        Conversation conversation = conversationRepository.findById(request.getConversationId()).orElseThrow();

        // 1. Save to PostgreSQL
        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(request.getContent());
        message.setMessageType(MessageType.TEXT);
        
        message = chatMessageRepository.save(message);
        
        // Update conversation updated_at for sorting
        conversation.setUpdatedAt(message.getCreatedAt());
        conversationRepository.save(conversation);

        // 2. Map to Dto
        ChatMessageDto dto = ChatMessageDto.builder()
                .id(message.getId())
                .conversationId(conversation.getId())
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .status(message.getStatus())
                .deliveredCount(message.getDeliveredCount())
                .readCount(message.getReadCount())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .fileType(message.getFileType())
                .isEdited(message.isEdited())
                .editedAt(message.getEditedAt())
                .isDeleted(message.isDeleted())
                .deletedAt(message.getDeletedAt())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();

        // 3. Publish to Redis (will be picked up by RedisMessageSubscriber on ALL nodes)
        redisPubSubService.broadcastMessage(dto);

        // Clear Cache
        clearConversationCache(conversation.getId());

        // 4. Send Notifications
        sendChatNotifications(message, sender, conversation);
    }

    private void sendChatNotifications(ChatMessage message, User sender, Conversation conversation) {
        Set<UUID> mentionedUserIds = new HashSet<>();
        
        // Parse mentions (@FirstName LastName)
        Pattern mentionPattern = Pattern.compile("@([A-Za-z]+ [A-Za-z]+)");
        Matcher matcher = mentionPattern.matcher(message.getContent() != null ? message.getContent() : "");
        
        while (matcher.find()) {
            String fullName = matcher.group(1);
            userRepository.findByFirstNameAndLastName(
                    fullName.split(" ")[0], 
                    fullName.substring(fullName.indexOf(" ") + 1)
            ).ifPresent(mentionedUser -> {
                if (!mentionedUser.getId().equals(sender.getId())) {
                    mentionedUserIds.add(mentionedUser.getId());
                    notificationService.sendQuickNotification(
                            mentionedUser.getId(),
                            sender.getId(),
                            NotificationType.CHAT_MENTION,
                            "Mentioned by " + sender.getFullName(),
                            message.getContent() != null && message.getContent().length() > 50 
                                    ? message.getContent().substring(0, 47) + "..." 
                                    : message.getContent(),
                            message.getId(),
                            "CHAT_MESSAGE"
                    );
                }
            });
        }

        if (conversation.getType().name().equals("PRIVATE")) {
            // Find the other participant
            for (ConversationParticipant p : conversation.getParticipants()) {
                if (!p.getUser().getId().equals(sender.getId())) {
                    notificationService.sendQuickNotification(
                            p.getUser().getId(),
                            sender.getId(),
                            NotificationType.CHAT_DIRECT_MESSAGE,
                            "New message from " + sender.getFullName(),
                            message.getContent() != null && message.getContent().length() > 50 
                                    ? message.getContent().substring(0, 47) + "..." 
                                    : message.getContent(),
                            message.getId(),
                            "CHAT_MESSAGE"
                    );
                }
            }
        } else {
            // Team/Department channel
            for (ConversationParticipant p : conversation.getParticipants()) {
                if (!p.getUser().getId().equals(sender.getId()) && !mentionedUserIds.contains(p.getUser().getId())) {
                    notificationService.sendQuickNotification(
                            p.getUser().getId(),
                            sender.getId(),
                            NotificationType.CHAT_TEAM_MESSAGE,
                            "New message in " + conversation.getName(),
                            sender.getFullName() + ": " + (message.getContent() != null && message.getContent().length() > 30 
                                    ? message.getContent().substring(0, 27) + "..." 
                                    : message.getContent()),
                            message.getId(),
                            "CHAT_MESSAGE"
                    );
                }
            }
        }
    }

    @MessageMapping("/chat.editMessage")
    @Transactional
    public void editMessage(@Payload EditMessageRequest request, Principal principal) {
        if (principal == null) return;

        User sender = userRepository.findByEmail(principal.getName()).orElseThrow();
        ChatMessage message = chatMessageRepository.findById(request.getMessageId()).orElseThrow();

        if (!message.getSender().getId().equals(sender.getId())) {
            log.warn("User {} attempted to edit message {} which they do not own", sender.getId(), message.getId());
            return;
        }

        // Save edit history
        ChatMessageEdit edit = new ChatMessageEdit();
        edit.setMessage(message);
        edit.setOldContent(message.getContent());
        edit.setNewContent(request.getNewContent());
        chatMessageEditRepository.save(edit);

        // Update message
        message.setContent(request.getNewContent());
        message.setEdited(true);
        message.setEditedAt(edit.getEditedAt());
        message = chatMessageRepository.save(message);

        // Broadcast updated message
        ChatMessageDto dto = ChatMessageDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .status(message.getStatus())
                .deliveredCount(message.getDeliveredCount())
                .readCount(message.getReadCount())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .fileType(message.getFileType())
                .isEdited(message.isEdited())
                .editedAt(message.getEditedAt())
                .isDeleted(message.isDeleted())
                .deletedAt(message.getDeletedAt())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();

        redisPubSubService.broadcastMessage(dto);
        clearConversationCache(message.getConversation().getId());
    }

    @MessageMapping("/chat.deleteMessage")
    @Transactional
    public void deleteMessage(@Payload DeleteMessageRequest request, Principal principal) {
        if (principal == null) return;

        User sender = userRepository.findByEmail(principal.getName()).orElseThrow();
        ChatMessage message = chatMessageRepository.findById(request.getMessageId()).orElseThrow();

        if (!message.getSender().getId().equals(sender.getId())) {
            log.warn("User {} attempted to delete message {} which they do not own", sender.getId(), message.getId());
            return;
        }

        // Save deletion history
        ChatMessageDeletion deletion = new ChatMessageDeletion();
        deletion.setMessage(message);
        deletion.setDeletedBy(sender);
        chatMessageDeletionRepository.save(deletion);

        // Update message (soft delete)
        message.setDeleted(true);
        message.setDeletedAt(deletion.getDeletedAt());
        message = chatMessageRepository.save(message);

        // Broadcast updated message
        ChatMessageDto dto = ChatMessageDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .status(message.getStatus())
                .deliveredCount(message.getDeliveredCount())
                .readCount(message.getReadCount())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .fileType(message.getFileType())
                .isEdited(message.isEdited())
                .editedAt(message.getEditedAt())
                .isDeleted(message.isDeleted())
                .deletedAt(message.getDeletedAt())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();

        redisPubSubService.broadcastMessage(dto);
        clearConversationCache(message.getConversation().getId());
    }

    @MessageMapping("/chat.react")
    @Transactional
    public void toggleReaction(@Payload MessageReactionRequest request, Principal principal) {
        if (principal == null) return;

        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        ChatMessage message = chatMessageRepository.findById(request.getMessageId()).orElseThrow();

        Optional<ChatMessageReaction> existing = chatMessageReactionRepository.findByMessageIdAndUserIdAndReaction(
                message.getId(), user.getId(), request.getReaction()
        );

        if (existing.isPresent()) {
            chatMessageReactionRepository.delete(existing.get());
            message.getReactions().remove(existing.get());
        } else {
            ChatMessageReaction newReaction = new ChatMessageReaction();
            newReaction.setMessage(message);
            newReaction.setUser(user);
            newReaction.setReaction(request.getReaction());
            chatMessageReactionRepository.save(newReaction);
            message.getReactions().add(newReaction);
        }
        
        // Save to ensure relation is updated immediately
        message = chatMessageRepository.save(message);

        Map<String, List<String>> reactionsMap = new java.util.HashMap<>();
        if (message.getReactions() != null) {
            for (ChatMessageReaction r : message.getReactions()) {
                reactionsMap.computeIfAbsent(r.getReaction(), k -> new ArrayList<>())
                        .add(r.getUser().getFullName());
            }
        }

        ChatMessageDto dto = ChatMessageDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .status(message.getStatus())
                .deliveredCount(message.getDeliveredCount())
                .readCount(message.getReadCount())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .fileType(message.getFileType())
                .isEdited(message.isEdited())
                .editedAt(message.getEditedAt())
                .isDeleted(message.isDeleted())
                .deletedAt(message.getDeletedAt())
                .reactions(reactionsMap)
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();

        redisPubSubService.broadcastMessage(dto);
        clearConversationCache(message.getConversation().getId());
    }

    private void clearConversationCache(UUID conversationId) {
        Set<String> keys = redisTemplate.keys("chatHistory::" + conversationId + "-*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @MessageMapping("/chat.acknowledge")
    @Transactional
    public void acknowledgeMessage(@Payload ChatAcknowledgeRequest request, Principal principal) {
        if (principal == null) {
            return;
        }

        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return;

        ChatMessage message = chatMessageRepository.findById(request.getMessageId()).orElse(null);
        if (message == null) return;

        // Idempotency check with Redis
        String redisKey = "message:" + request.getMessageId() + ":acks:" + request.getStatus();
        Long added = redisTemplate.opsForSet().add(redisKey, user.getId().toString());
        
        if (added != null && added == 1) {
            // It's a new ACK for this user + status
            int updatedRows = 0;
            if (request.getStatus() == MessageStatus.DELIVERED) {
                updatedRows = chatMessageRepository.incrementDeliveredCount(request.getMessageId());
                if (message.getConversation().getType() == com.nexushr.chat.model.enums.ConversationType.PRIVATE) {
                    chatMessageRepository.updateStatusToDeliveredIfSent(request.getMessageId());
                }
            } else if (request.getStatus() == MessageStatus.READ) {
                updatedRows = chatMessageRepository.incrementReadCount(request.getMessageId());
                if (message.getConversation().getType() == com.nexushr.chat.model.enums.ConversationType.PRIVATE) {
                    chatMessageRepository.updateStatusToReadIfNotRead(request.getMessageId());
                }
            }

            if (updatedRows > 0) {
                // Fetch the latest state
                ChatMessage latestMessage = chatMessageRepository.findById(request.getMessageId()).orElse(null);
                if (latestMessage != null) {
                    MessageReceiptUpdateDto dto = MessageReceiptUpdateDto.builder()
                            .conversationId(latestMessage.getConversation().getId())
                            .messageId(latestMessage.getId())
                            .status(latestMessage.getStatus())
                            .deliveredCount(latestMessage.getDeliveredCount())
                            .readCount(latestMessage.getReadCount())
                            .build();

                    redisPubSubService.broadcastReceiptUpdate(dto);
                }
            }
        }
    }

    @MessageMapping("/presence")
    @Transactional
    public void updatePresence(@Payload PresenceUpdateRequest request, Principal principal) {
        if (principal == null) return;
        
        String email = principal.getName();
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setPresenceStatus(request.getStatus());
            if (request.getStatus() == com.nexushr.auth.model.enums.PresenceStatus.OFFLINE) {
                user.setLastSeenAt(java.time.LocalDateTime.now());
            }
            userRepository.save(user);

            PresenceUpdateDto dto = PresenceUpdateDto.builder()
                    .userId(user.getId())
                    .status(user.getPresenceStatus())
                    .lastSeenAt(user.getLastSeenAt())
                    .build();
            redisPubSubService.broadcastPresence(dto);
        });
    }

    @MessageMapping("/chat.typing")
    public void broadcastTyping(@Payload TypingEventRequest request, Principal principal) {
        if (principal == null) return;
        String email = principal.getName();
        userRepository.findByEmail(email).ifPresent(user -> {
            TypingBroadcastDto dto = TypingBroadcastDto.builder()
                    .conversationId(request.getConversationId())
                    .userId(user.getId())
                    .userName(user.getFullName())
                    .isTyping(request.isTyping())
                    .build();
            redisPubSubService.broadcastTypingEvent(dto);
        });
    }

    @Data
    public static class ChatMessageRequest {
        private UUID conversationId;
        private String content;
    }

    @Data
    public static class ChatAcknowledgeRequest {
        private UUID messageId;
        private MessageStatus status;
    }

    @Data
    public static class PresenceUpdateRequest {
        private com.nexushr.auth.model.enums.PresenceStatus status;
    }

    @Data
    public static class TypingEventRequest {
        private UUID conversationId;
        private boolean isTyping;
    }
}
