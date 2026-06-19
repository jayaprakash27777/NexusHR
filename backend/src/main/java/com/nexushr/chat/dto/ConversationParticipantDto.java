package com.nexushr.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationParticipantDto {
    private UUID id;
    private UUID userId;
    private String userName;
    private String avatarUrl;
    private LocalDateTime joinedAt;
}
