package com.nexushr.notification.service;

import com.nexushr.auth.repository.UserRepository;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.notification.dto.NotificationCreateRequest;
import com.nexushr.notification.dto.NotificationResponse;
import com.nexushr.notification.model.Notification;
import com.nexushr.notification.model.NotificationType;
import com.nexushr.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public ApiResponse<List<NotificationResponse>> sendNotification(NotificationCreateRequest request) {
        List<Notification> notifications = new ArrayList<>();

        for (UUID recipientId : request.getRecipientIds()) {
            Notification notification = Notification.builder()
                    .recipientId(recipientId)
                    .senderId(request.getSenderId())
                    .type(request.getType())
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .referenceId(request.getReferenceId())
                    .referenceType(request.getReferenceType())
                    .createdAt(LocalDateTime.now())
                    .build();

            notifications.add(notificationRepository.save(notification));
        }

        // Push via WebSocket to each recipient
        for (Notification n : notifications) {
            NotificationResponse response = mapToResponse(n);
            try {
                messagingTemplate.convertAndSendToUser(
                        n.getRecipientId().toString(),
                        "/queue/notifications",
                        response);
                log.debug("WebSocket push sent to user {}", n.getRecipientId());
            } catch (Exception e) {
                log.warn("Failed to push WebSocket notification to {}: {}", n.getRecipientId(), e.getMessage());
            }
        }

        List<NotificationResponse> responses = notifications.stream()
                .map(this::mapToResponse).collect(Collectors.toList());

        log.info("Sent {} notifications of type {}", notifications.size(), request.getType());
        return ApiResponse.success("Notifications sent", responses);
    }

    @Override
    @Transactional
    public void sendQuickNotification(UUID recipientId, UUID senderId, NotificationType type,
                                      String title, String message, UUID referenceId, String referenceType) {
        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .senderId(senderId)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .createdAt(LocalDateTime.now())
                .build();

        notification = notificationRepository.save(notification);

        // Push via WebSocket
        try {
            messagingTemplate.convertAndSendToUser(
                    recipientId.toString(),
                    "/queue/notifications",
                    mapToResponse(notification));
        } catch (Exception e) {
            log.warn("WebSocket push failed for {}: {}", recipientId, e.getMessage());
        }

        log.debug("Quick notification sent: {} -> {}", type, recipientId);
    }

    @Override
    @Transactional
    public void broadcastAnnouncement(String title, String message) {
        // Get all active users
        userRepository.findAll().forEach(user -> {
            Notification notification = Notification.builder()
                    .recipientId(user.getId())
                    .type(NotificationType.ANNOUNCEMENT)
                    .title(title)
                    .message(message)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(notification);
        });

        // Broadcast via WebSocket topic
        NotificationResponse broadcast = NotificationResponse.builder()
                .type(NotificationType.ANNOUNCEMENT)
                .title(title)
                .message(message)
                .createdAt(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/announcements", broadcast);
        log.info("Broadcast announcement: {}", title);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getNotifications(UUID recipientId, int page, int size) {
        Page<Notification> notifPage = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(recipientId, PageRequest.of(page, size));

        List<NotificationResponse> content = notifPage.getContent().stream()
                .map(this::mapToResponse).collect(Collectors.toList());

        return PagedResponse.<NotificationResponse>builder()
                .content(content)
                .page(notifPage.getNumber())
                .size(notifPage.getSize())
                .totalElements(notifPage.getTotalElements())
                .totalPages(notifPage.getTotalPages())
                .last(notifPage.isLast())
                .first(notifPage.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<NotificationResponse>> getUnreadNotifications(UUID recipientId) {
        List<NotificationResponse> unread = notificationRepository
                .findByRecipientIdAndReadFalseOrderByCreatedAtDesc(recipientId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
        return ApiResponse.success(unread);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Long> getUnreadCount(UUID recipientId) {
        long count = notificationRepository.countByRecipientIdAndReadFalse(recipientId);
        return ApiResponse.success(count);
    }

    @Override
    @Transactional
    public ApiResponse<NotificationResponse> markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        Notification saved = notificationRepository.save(notification);

        return ApiResponse.success("Notification marked as read", mapToResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<Integer> markAllAsRead(UUID recipientId) {
        int updated = notificationRepository.markAllAsRead(recipientId);
        return ApiResponse.success(updated + " notifications marked as read", updated);
    }

    @Override
    @Transactional
    public ApiResponse<Integer> deleteReadNotifications(UUID recipientId) {
        int deleted = notificationRepository.deleteReadNotifications(recipientId);
        return ApiResponse.success(deleted + " read notifications deleted", deleted);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .recipientId(n.getRecipientId())
                .senderId(n.getSenderId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .referenceId(n.getReferenceId())
                .referenceType(n.getReferenceType())
                .read(n.isRead())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
