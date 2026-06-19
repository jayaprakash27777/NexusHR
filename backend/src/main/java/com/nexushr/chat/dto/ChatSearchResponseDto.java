package com.nexushr.chat.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatSearchResponseDto {
    private Page<UserSearchResult> users;
    private Page<ConversationDto> channels;
    private Page<ChatMessageDto> files;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSearchResult {
        private UUID id;
        private String fullName;
        private String email;
        private String role;
        private String department;
        private String manager;
        private String presenceStatus;
    }
}
