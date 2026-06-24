package com.nexushr.announcement.dto;

import com.nexushr.announcement.model.AnnouncementType;
import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Data
@Builder
public class AnnouncementDto {
    private UUID id;
    private String title;
    private String content;
    private AnnouncementType type;
    private UUID authorId;
    private String authorName;
    private String authorAvatar;
    private OffsetDateTime createdAt;
    private int reactionCount;
    private boolean userReacted;
}
