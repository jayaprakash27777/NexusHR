package com.nexushr.chat.repository;

import com.nexushr.chat.model.ChatMessageDeletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ChatMessageDeletionRepository extends JpaRepository<ChatMessageDeletion, UUID> {
}
