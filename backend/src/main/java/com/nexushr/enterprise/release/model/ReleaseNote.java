package com.nexushr.enterprise.release.model;

import com.nexushr.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "release_notes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReleaseNote extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String version;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "release_type", nullable = false, length = 20)
    private String releaseType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "jsonb")
    private String changes;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(name = "is_published")
    private boolean published = false;

    @Column(name = "author_id")
    private UUID authorId;
}
