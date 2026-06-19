package com.nexushr.chat.controller;

import com.nexushr.auth.model.User;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.chat.dto.ConversationDto;
import com.nexushr.chat.model.Conversation;
import com.nexushr.chat.model.ConversationParticipant;
import com.nexushr.chat.model.enums.ConversationRole;
import com.nexushr.chat.model.enums.ConversationType;
import com.nexushr.chat.repository.ConversationParticipantRepository;
import com.nexushr.chat.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/chat/channels")
@RequiredArgsConstructor
public class ChannelController {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final UserRepository userRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<ConversationDto> createChannel(
            @RequestParam String name,
            @RequestParam ConversationType type,
            Principal principal) {
        
        User creator = userRepository.findByEmail(principal.getName()).orElseThrow();
        
        Conversation conversation = new Conversation();
        conversation.setName(name);
        conversation.setType(type);
        conversation = conversationRepository.save(conversation);
        
        ConversationParticipant participant = new ConversationParticipant();
        participant.setConversation(conversation);
        participant.setUser(creator);
        participant.setRole(ConversationRole.ADMIN);
        participantRepository.save(participant);
        
        return ResponseEntity.ok(ConversationDto.builder()
                .id(conversation.getId())
                .name(conversation.getName())
                .type(conversation.getType())
                .build());
    }

    @PostMapping("/{id}/join")
    @Transactional
    public ResponseEntity<Void> joinChannel(@PathVariable UUID id, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Conversation conversation = conversationRepository.findById(id).orElseThrow();
        
        if (conversation.getType() == ConversationType.PRIVATE_CHANNEL) {
            return ResponseEntity.status(403).build();
        }
        
        if (participantRepository.findByConversationIdAndUserId(id, user.getId()).isPresent()) {
            return ResponseEntity.ok().build(); // Already joined
        }
        
        ConversationParticipant participant = new ConversationParticipant();
        participant.setConversation(conversation);
        participant.setUser(user);
        participant.setRole(ConversationRole.MEMBER);
        participantRepository.save(participant);
        
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/leave")
    @Transactional
    public ResponseEntity<Void> leaveChannel(@PathVariable UUID id, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        ConversationParticipant participant = participantRepository.findByConversationIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Not a member"));
        
        participantRepository.delete(participant);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/invite")
    @Transactional
    public ResponseEntity<Void> inviteUser(
            @PathVariable UUID id, 
            @RequestParam UUID targetUserId, 
            Principal principal) {
            
        User inviter = userRepository.findByEmail(principal.getName()).orElseThrow();
        Conversation conversation = conversationRepository.findById(id).orElseThrow();
        
        ConversationParticipant inviterParticipant = participantRepository.findByConversationIdAndUserId(id, inviter.getId())
                .orElseThrow(() -> new IllegalArgumentException("You are not a member"));
                
        if (conversation.getType() == ConversationType.PRIVATE_CHANNEL && inviterParticipant.getRole() != ConversationRole.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        
        User targetUser = userRepository.findById(targetUserId).orElseThrow();
        
        if (participantRepository.findByConversationIdAndUserId(id, targetUserId).isEmpty()) {
            ConversationParticipant newParticipant = new ConversationParticipant();
            newParticipant.setConversation(conversation);
            newParticipant.setUser(targetUser);
            newParticipant.setRole(ConversationRole.MEMBER);
            participantRepository.save(newParticipant);
        }
        
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/members/{userId}")
    @Transactional
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID id, 
            @PathVariable UUID userId, 
            Principal principal) {
            
        User admin = userRepository.findByEmail(principal.getName()).orElseThrow();
        
        ConversationParticipant adminParticipant = participantRepository.findByConversationIdAndUserId(id, admin.getId())
                .orElseThrow();
                
        if (adminParticipant.getRole() != ConversationRole.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        
        ConversationParticipant targetParticipant = participantRepository.findByConversationIdAndUserId(id, userId)
                .orElseThrow();
                
        participantRepository.delete(targetParticipant);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/members/{userId}/role")
    @Transactional
    public ResponseEntity<Void> updateRole(
            @PathVariable UUID id, 
            @PathVariable UUID userId, 
            @RequestParam ConversationRole role,
            Principal principal) {
            
        User admin = userRepository.findByEmail(principal.getName()).orElseThrow();
        
        ConversationParticipant adminParticipant = participantRepository.findByConversationIdAndUserId(id, admin.getId())
                .orElseThrow();
                
        if (adminParticipant.getRole() != ConversationRole.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        
        ConversationParticipant targetParticipant = participantRepository.findByConversationIdAndUserId(id, userId)
                .orElseThrow();
                
        targetParticipant.setRole(role);
        participantRepository.save(targetParticipant);
        return ResponseEntity.ok().build();
    }
}
