package com.nexushr.chat.controller;

import com.nexushr.chat.dto.ChatMessageDto;
import com.nexushr.chat.dto.ConversationDto;
import com.nexushr.chat.dto.CreateConversationRequest;
import com.nexushr.chat.service.ConversationService;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.security.SecurityContextService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import com.nexushr.auth.repository.UserRepository;
import com.nexushr.auth.model.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@RestController
@RequestMapping("/api/v1/chat/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;
    private final UserRepository userRepository;

    private UUID getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @PostMapping("/private")
    public ResponseEntity<ConversationDto> createPrivateConversation(@RequestParam UUID targetUserId) {
        UUID currentUserId = getCurrentUserId();
        return ResponseEntity.ok(conversationService.createPrivateConversation(currentUserId, targetUserId));
    }

    @PostMapping("/team")
    public ResponseEntity<ConversationDto> createTeamConversation(@Valid @RequestBody CreateConversationRequest request) {
        return ResponseEntity.ok(conversationService.createTeamConversation(request));
    }

    @PostMapping("/department/{departmentId}")
    public ResponseEntity<ConversationDto> createDepartmentConversation(
            @PathVariable UUID departmentId,
            @RequestParam String name) {
        return ResponseEntity.ok(conversationService.createDepartmentConversation(departmentId, name));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<ConversationDto>> getUserConversations(Pageable pageable) {
        UUID currentUserId = getCurrentUserId();
        return ResponseEntity.ok(conversationService.getUserConversations(currentUserId, pageable));
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<PagedResponse<ChatMessageDto>> getConversationHistory(
            @PathVariable UUID conversationId,
            Pageable pageable) {
        // NOTE: A production ready app should check if the currentUser is a participant of conversationId here.
        // Left simplified for the scope of this phase.
        return ResponseEntity.ok(conversationService.getConversationHistory(conversationId, pageable));
    }
}
