package com.nexushr.enterprise.release.dto;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ReleaseNoteResponse {
    private String id;
    private String version;
    private String title;
    private String releaseType;
    private String description;
    private String changes;
    private boolean published;
    private OffsetDateTime publishedAt;
    private UUID authorId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
