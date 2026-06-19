package com.nexushr.chat.dto;

import com.nexushr.chat.model.enums.MessageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageReceiptUpdateDto {
    private UUID conversationId;
    private UUID messageId;
    private MessageStatus status;
    private Integer deliveredCount;
    private Integer readCount;
}
