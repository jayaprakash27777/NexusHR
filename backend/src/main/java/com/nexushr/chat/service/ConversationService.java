package com.nexushr.chat.service;

import com.nexushr.chat.dto.ChatMessageDto;
import com.nexushr.chat.dto.ConversationDto;
import com.nexushr.chat.dto.CreateConversationRequest;
import com.nexushr.common.dto.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ConversationService {

    ConversationDto createPrivateConversation(UUID userA, UUID userB);
    
    ConversationDto createTeamConversation(CreateConversationRequest request);
    
    ConversationDto createDepartmentConversation(UUID departmentId, String name);

    PagedResponse<ConversationDto> getUserConversations(UUID userId, Pageable pageable);

    PagedResponse<ChatMessageDto> getConversationHistory(UUID conversationId, Pageable pageable);

    ChatMessageDto getLastMessage(UUID conversationId);
}
