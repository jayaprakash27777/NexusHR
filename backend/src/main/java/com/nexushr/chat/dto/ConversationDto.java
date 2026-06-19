package com.nexushr.chat.dto;

import com.nexushr.chat.model.enums.ConversationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {
    private UUID id;
    private String name;
    private ConversationType type;
    private List<ConversationParticipantDto> participants;
    private ChatMessageDto lastMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
