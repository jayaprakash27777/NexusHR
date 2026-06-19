package com.nexushr.notification.dto;

import com.nexushr.notification.model.NotificationType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private UUID id;
    private UUID recipientId;
    private UUID senderId;
    private NotificationType type;
    private String title;
    private String message;
    private UUID referenceId;
    private String referenceType;
    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
