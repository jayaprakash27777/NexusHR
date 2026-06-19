package com.nexushr.enterprise.knowledge.model;

import com.nexushr.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Array;

import java.util.UUID;

@Entity
@Table(name = "knowledge_articles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KnowledgeArticle extends BaseEntity {

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, unique = true, length = 500)
    private String slug;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(columnDefinition = "text[]")
    @Array(length = 20)
    private String[] tags;

    @Column(name = "author_id")
    private UUID authorId;

    @Column(length = 20)
    private String status = "PUBLISHED";

    private Integer views = 0;

    @Column(name = "helpful_count")
    private Integer helpfulCount = 0;

    @Column(name = "unhelpful_count")
    private Integer unhelpfulCount = 0;
}
