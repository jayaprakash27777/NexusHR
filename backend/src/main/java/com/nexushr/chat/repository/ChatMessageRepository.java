package com.nexushr.chat.repository;

import com.nexushr.chat.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    Page<ChatMessage> findByConversationIdOrderByCreatedAtDesc(UUID conversationId, Pageable pageable);
    
    Optional<ChatMessage> findTopByConversationIdOrderByCreatedAtDesc(UUID conversationId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.status = 'DELIVERED' WHERE m.id = :id AND m.status = 'SENT'")
    int updateStatusToDeliveredIfSent(@Param("id") UUID id);
    
    @Modifying
    @Query("UPDATE ChatMessage m SET m.status = 'READ' WHERE m.id = :id AND (m.status = 'SENT' OR m.status = 'DELIVERED')")
    int updateStatusToReadIfNotRead(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.deliveredCount = m.deliveredCount + 1 WHERE m.id = :id")
    int incrementDeliveredCount(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.readCount = m.readCount + 1 WHERE m.id = :id")
    int incrementReadCount(@Param("id") UUID id);

    @Query("SELECT m FROM ChatMessage m WHERE m.messageType IN ('FILE', 'IMAGE') AND m.fileName ILIKE %:fileName%")
    Page<ChatMessage> findByFileNameContainingIgnoreCase(@Param("fileName") String fileName, Pageable pageable);
}
