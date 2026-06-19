package com.nexushr.chat.controller;


import com.nexushr.auth.model.User;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.chat.dto.ChatMessageDto;
import com.nexushr.chat.dto.ChatSearchResponseDto;
import com.nexushr.chat.dto.ConversationDto;
import com.nexushr.chat.model.ChatMessage;
import com.nexushr.chat.model.Conversation;
import com.nexushr.chat.repository.ChatMessageRepository;
import com.nexushr.chat.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat/search")
@RequiredArgsConstructor
public class ChatSearchController {

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    @GetMapping
    public ResponseEntity<ChatSearchResponseDto> searchChat(
            @RequestParam("q") String query,
            @RequestParam(value = "filter", defaultValue = "ALL") String filter,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        ChatSearchResponseDto.ChatSearchResponseDtoBuilder responseBuilder = ChatSearchResponseDto.builder();

        if ("ALL".equalsIgnoreCase(filter) || "USERS".equalsIgnoreCase(filter)) {
            Page<User> users = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, pageable);
            responseBuilder.users(users.map(u -> ChatSearchResponseDto.UserSearchResult.builder()
                    .id(u.getId())
                    .fullName(u.getFullName())
                    .email(u.getEmail())
                    .role(u.getUserRoles().isEmpty() ? null : u.getUserRoles().iterator().next().getRole().getName())
                    .presenceStatus(u.getPresenceStatus() != null ? u.getPresenceStatus().name() : null)
                    .build()
            ));
        }

        if ("ALL".equalsIgnoreCase(filter) || "CHANNELS".equalsIgnoreCase(filter)) {
            Page<Conversation> channels = conversationRepository.findByNameContainingIgnoreCase(query, pageable);
            responseBuilder.channels(channels.map(c -> ConversationDto.builder()
                    .id(c.getId())
                    .name(c.getName())
                    .type(c.getType())
                    .build()
            ));
        }

        if ("ALL".equalsIgnoreCase(filter) || "FILES".equalsIgnoreCase(filter)) {
            Page<ChatMessage> files = chatMessageRepository.findByFileNameContainingIgnoreCase(query, pageable);
            responseBuilder.files(files.map(m -> ChatMessageDto.builder()
                    .id(m.getId())
                    .conversationId(m.getConversation().getId())
                    .senderId(m.getSender().getId())
                    .senderName(m.getSender().getFullName())
                    .content(m.getContent())
                    .messageType(m.getMessageType())
                    .status(m.getStatus())
                    .deliveredCount(m.getDeliveredCount())
                    .readCount(m.getReadCount())
                    .fileUrl(m.getFileUrl())
                    .fileName(m.getFileName())
                    .fileSize(m.getFileSize())
                    .fileType(m.getFileType())
                    .createdAt(m.getCreatedAt())
                    .updatedAt(m.getUpdatedAt())
                    .build()
            ));
        }

        return ResponseEntity.ok(responseBuilder.build());
    }
}
