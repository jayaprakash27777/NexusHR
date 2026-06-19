package com.nexushr.enterprise.knowledge.repository;

import com.nexushr.enterprise.knowledge.model.KnowledgeArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, UUID> {

    Optional<KnowledgeArticle> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT k FROM KnowledgeArticle k WHERE " +
           "(:category IS NULL OR k.category = :category) AND " +
           "(:search IS NULL OR LOWER(k.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(k.content) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<KnowledgeArticle> searchArticles(
            @Param("search") String search,
            @Param("category") String category,
            Pageable pageable
    );
}
