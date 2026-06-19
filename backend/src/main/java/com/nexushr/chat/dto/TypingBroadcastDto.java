package com.nexushr.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingBroadcastDto {
    private UUID conversationId;
    private UUID userId;
    private String userName;
    private boolean isTyping;
}
