package com.nexushr.chat.dto;

import com.nexushr.chat.model.enums.MessageStatus;
import com.nexushr.chat.model.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private UUID id;
    private UUID conversationId;
    private UUID senderId;
    private String senderName;
    private String content;
    private MessageType messageType;
    private MessageStatus status;
    private Integer deliveredCount;
    private Integer readCount;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String fileType;
    private boolean isEdited;
    private LocalDateTime editedAt;
    private boolean isDeleted;
    private LocalDateTime deletedAt;
    private Map<String, List<String>> reactions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
