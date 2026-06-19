package com.nexushr.chat.dto;

import com.nexushr.auth.model.enums.PresenceStatus;
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
public class PresenceUpdateDto {
    private UUID userId;
    private PresenceStatus status;
    private LocalDateTime lastSeenAt;
}
