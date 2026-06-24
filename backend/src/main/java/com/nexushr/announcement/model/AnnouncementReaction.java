package com.nexushr.announcement.model;

import com.nexushr.auth.model.User;
import com.nexushr.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "announcement_reactions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"announcement_id", "user_id", "type"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementReaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id", nullable = false)
    private Announcement announcement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String type; // e.g., "LIKE", "ACKNOWLEDGE"
}
