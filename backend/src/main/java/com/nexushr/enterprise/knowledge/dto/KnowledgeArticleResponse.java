package com.nexushr.enterprise.knowledge.dto;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class KnowledgeArticleResponse {
    private String id;
    private String title;
    private String slug;
    private String content;
    private String category;
    private String[] tags;
    private UUID authorId;
    private String status;
    private Integer views;
    private Integer helpfulCount;
    private Integer unhelpfulCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
