package com.nexushr.chat.repository;

import com.nexushr.chat.model.ChatMessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatMessageReactionRepository extends JpaRepository<ChatMessageReaction, UUID> {
    Optional<ChatMessageReaction> findByMessageIdAndUserIdAndReaction(UUID messageId, UUID userId, String reaction);
    List<ChatMessageReaction> findByMessageId(UUID messageId);
}
