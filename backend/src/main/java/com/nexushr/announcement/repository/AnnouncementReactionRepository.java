package com.nexushr.announcement.repository;

import com.nexushr.announcement.model.AnnouncementReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface AnnouncementReactionRepository extends JpaRepository<AnnouncementReaction, UUID> {
    Optional<AnnouncementReaction> findByAnnouncementIdAndUserIdAndType(UUID announcementId, UUID userId, String type);
    List<AnnouncementReaction> findByAnnouncementId(UUID announcementId);
}
