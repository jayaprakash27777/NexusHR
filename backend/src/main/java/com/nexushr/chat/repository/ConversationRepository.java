package com.nexushr.chat.repository;

import com.nexushr.chat.model.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("SELECT DISTINCT c FROM Conversation c JOIN c.participants p WHERE p.user.id = :userId")
    Page<Conversation> findConversationsByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT c FROM Conversation c JOIN c.participants p1 JOIN c.participants p2 " +
           "WHERE c.type = 'PRIVATE' AND p1.user.id = :userA AND p2.user.id = :userB")
    Optional<Conversation> findPrivateConversation(@Param("userA") UUID userA, @Param("userB") UUID userB);

    Page<Conversation> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
