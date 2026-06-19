package com.nexushr.notification.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.notification.dto.NotificationCreateRequest;
import com.nexushr.notification.dto.NotificationResponse;
import com.nexushr.notification.model.NotificationType;

import java.util.List;
import java.util.UUID;

public interface NotificationService {

    /**
     * Send a notification to one or more recipients (persists + pushes via WebSocket).
     */
    ApiResponse<List<NotificationResponse>> sendNotification(NotificationCreateRequest request);

    /**
     * Quick helper to send a single notification.
     */
    void sendQuickNotification(UUID recipientId, UUID senderId, NotificationType type,
                               String title, String message, UUID referenceId, String referenceType);

    /**
     * Broadcast to all users (e.g. announcements).
     */
    void broadcastAnnouncement(String title, String message);

    PagedResponse<NotificationResponse> getNotifications(UUID recipientId, int page, int size);

    ApiResponse<List<NotificationResponse>> getUnreadNotifications(UUID recipientId);

    ApiResponse<Long> getUnreadCount(UUID recipientId);

    ApiResponse<NotificationResponse> markAsRead(UUID notificationId);

    ApiResponse<Integer> markAllAsRead(UUID recipientId);

    ApiResponse<Integer> deleteReadNotifications(UUID recipientId);
}
