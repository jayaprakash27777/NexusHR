package com.nexushr.chat.service;

import com.nexushr.auth.model.User;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.chat.dto.ChatMessageDto;
import com.nexushr.chat.dto.ConversationDto;
import com.nexushr.chat.dto.ConversationParticipantDto;
import com.nexushr.chat.dto.CreateConversationRequest;
import com.nexushr.chat.model.ChatMessage;
import com.nexushr.chat.model.Conversation;
import com.nexushr.chat.model.ConversationParticipant;
import com.nexushr.chat.model.ChatMessageReaction;
import java.util.Map;
import java.util.ArrayList;
import com.nexushr.chat.model.enums.ConversationType;
import com.nexushr.chat.repository.ChatMessageRepository;
import com.nexushr.chat.repository.ConversationRepository;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.tenant.TenantContextHolder;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public ConversationDto createPrivateConversation(UUID userA, UUID userB) {
        if (userA.equals(userB)) {
            throw new IllegalArgumentException("Cannot create a private conversation with yourself.");
        }

        Optional<Conversation> existingOpt = conversationRepository.findPrivateConversation(userA, userB);
        if (existingOpt.isPresent()) {
            return mapToDto(existingOpt.get());
        }

        User u1 = userRepository.findById(userA).orElseThrow(() -> new EntityNotFoundException("User not found: " + userA));
        User u2 = userRepository.findById(userB).orElseThrow(() -> new EntityNotFoundException("User not found: " + userB));

        Conversation conversation = new Conversation();
        conversation.setType(ConversationType.PRIVATE);
        conversation.setTenantId(TenantContextHolder.getTenantId());

        ConversationParticipant p1 = new ConversationParticipant();
        p1.setConversation(conversation);
        p1.setUser(u1);

        ConversationParticipant p2 = new ConversationParticipant();
        p2.setConversation(conversation);
        p2.setUser(u2);

        conversation.setParticipants(Set.of(p1, p2));

        conversation = conversationRepository.save(conversation);
        return mapToDto(conversation);
    }

    @Override
    @Transactional
    public ConversationDto createTeamConversation(CreateConversationRequest request) {
        if (request.getType() != ConversationType.PUBLIC_CHANNEL && request.getType() != ConversationType.PRIVATE_CHANNEL) {
            throw new IllegalArgumentException("Must be a PUBLIC_CHANNEL or PRIVATE_CHANNEL conversation.");
        }

        Conversation conversation = new Conversation();
        conversation.setType(request.getType());
        conversation.setName(request.getName());
        conversation.setTenantId(TenantContextHolder.getTenantId());
        
        final Conversation finalConversation = conversation;

        Set<ConversationParticipant> participants = request.getParticipantIds().stream()
                .map(id -> {
                    User u = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
                    ConversationParticipant p = new ConversationParticipant();
                    p.setConversation(finalConversation);
                    p.setUser(u);
                    return p;
                }).collect(Collectors.toSet());

        conversation.setParticipants(participants);
        conversation = conversationRepository.save(conversation);

        return mapToDto(conversation);
    }

    @Override
    @Transactional
    public ConversationDto createDepartmentConversation(UUID departmentId, String name) {
        Conversation conversation = new Conversation();
        conversation.setType(ConversationType.DEPARTMENT_CHANNEL);
        conversation.setName(name);
        conversation.setTenantId(TenantContextHolder.getTenantId());
        
        final Conversation finalConversation = conversation;

        List<Employee> employees = employeeRepository.findByDepartmentId(departmentId);
        
        Set<ConversationParticipant> participants = employees.stream()
                .filter(e -> e.getUser() != null)
                .map(e -> {
                    ConversationParticipant p = new ConversationParticipant();
                    p.setConversation(finalConversation);
                    p.setUser(e.getUser());
                    return p;
                }).collect(Collectors.toSet());

        conversation.setParticipants(participants);
        conversation = conversationRepository.save(conversation);

        return mapToDto(conversation);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ConversationDto> getUserConversations(UUID userId, Pageable pageable) {
        Page<Conversation> page = conversationRepository.findConversationsByUserId(userId, pageable);
        List<ConversationDto> content = page.getContent().stream().map(this::mapToDto).collect(Collectors.toList());
        return PagedResponse.<ConversationDto>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "chatHistory", key = "#conversationId + '-' + #pageable.pageNumber")
    public PagedResponse<ChatMessageDto> getConversationHistory(UUID conversationId, Pageable pageable) {
        Page<ChatMessage> page = chatMessageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);
        List<ChatMessageDto> content = page.getContent().stream().map(this::mapMessageToDto).collect(Collectors.toList());
        return PagedResponse.<ChatMessageDto>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ChatMessageDto getLastMessage(UUID conversationId) {
        return chatMessageRepository.findTopByConversationIdOrderByCreatedAtDesc(conversationId)
                .map(this::mapMessageToDto)
                .orElse(null);
    }

    private ConversationDto mapToDto(Conversation conversation) {
        return ConversationDto.builder()
                .id(conversation.getId())
                .name(conversation.getName())
                .type(conversation.getType())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .participants(conversation.getParticipants().stream().map(this::mapParticipantToDto).collect(Collectors.toList()))
                .lastMessage(getLastMessage(conversation.getId()))
                .build();
    }

    private ConversationParticipantDto mapParticipantToDto(ConversationParticipant participant) {
        return ConversationParticipantDto.builder()
                .id(participant.getId())
                .userId(participant.getUser().getId())
                .userName(participant.getUser().getFullName())
                .avatarUrl(participant.getUser().getAvatarUrl())
                .joinedAt(participant.getJoinedAt())
                .build();
    }

    private ChatMessageDto mapMessageToDto(ChatMessage message) {
        Map<String, List<String>> reactionsMap = new java.util.HashMap<>();
        if (message.getReactions() != null) {
            for (ChatMessageReaction reaction : message.getReactions()) {
                reactionsMap.computeIfAbsent(reaction.getReaction(), k -> new ArrayList<>())
                        .add(reaction.getUser().getFullName());
            }
        }

        return ChatMessageDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .status(message.getStatus())
                .deliveredCount(message.getDeliveredCount())
                .readCount(message.getReadCount())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .fileType(message.getFileType())
                .isEdited(message.isEdited())
                .editedAt(message.getEditedAt())
                .isDeleted(message.isDeleted())
                .deletedAt(message.getDeletedAt())
                .reactions(reactionsMap)
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }
}
