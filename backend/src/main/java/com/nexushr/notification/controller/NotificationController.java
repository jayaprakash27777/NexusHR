package com.nexushr.notification.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.notification.dto.NotificationCreateRequest;
import com.nexushr.notification.dto.NotificationResponse;
import com.nexushr.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management and real-time alerts")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Send notification", description = "Send notification to one or more users (Admin)")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> send(
            @Valid @RequestBody NotificationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.sendNotification(request));
    }

    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Broadcast announcement", description = "Send announcement to all users (Admin)")
    public ResponseEntity<ApiResponse<Void>> broadcast(
            @RequestParam String title,
            @RequestParam String message) {
        notificationService.broadcastAnnouncement(title, message);
        return ResponseEntity.ok(ApiResponse.success("Announcement broadcast to all users"));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get notifications", description = "Get paginated notifications for a user")
    public ResponseEntity<PagedResponse<NotificationResponse>> getNotifications(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(notificationService.getNotifications(userId, page, size));
    }

    @GetMapping("/user/{userId}/unread")
    @Operation(summary = "Get unread notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnread(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread-count")
    @Operation(summary = "Unread count", description = "Get the number of unread notifications")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PatchMapping("/{notificationId}/read")
    @Operation(summary = "Mark as read", description = "Mark a single notification as read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable UUID notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }

    @PatchMapping("/user/{userId}/read-all")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read for a user")
    public ResponseEntity<ApiResponse<Integer>> markAllAsRead(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(notificationService.markAllAsRead(userId));
    }

    @DeleteMapping("/user/{userId}/clear-read")
    @Operation(summary = "Clear read notifications", description = "Delete all read notifications for a user")
    public ResponseEntity<ApiResponse<Integer>> clearRead(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(notificationService.deleteReadNotifications(userId));
    }
}
