package com.nexushr.enterprise.knowledge.service;

import com.nexushr.common.audit.AuditService;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.BadRequestException;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.enterprise.knowledge.dto.KnowledgeArticleRequest;
import com.nexushr.enterprise.knowledge.dto.KnowledgeArticleResponse;
import com.nexushr.enterprise.knowledge.model.KnowledgeArticle;
import com.nexushr.enterprise.knowledge.repository.KnowledgeArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class KnowledgeService {

    private final KnowledgeArticleRepository repository;
    private final AuditService auditService;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public PagedResponse<KnowledgeArticleResponse> getAll(String search, String category, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<KnowledgeArticle> articles = repository.searchArticles(search, category, pageable);
        return PagedResponse.<KnowledgeArticleResponse>builder()
                .content(articles.getContent().stream().map(this::toResponse).toList())
                .page(articles.getNumber())
                .size(articles.getSize())
                .totalElements(articles.getTotalElements())
                .totalPages(articles.getTotalPages())
                .first(articles.isFirst())
                .last(articles.isLast())
                .build();
    }

    @Transactional
    public KnowledgeArticleResponse getById(UUID id) {
        KnowledgeArticle article = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeArticle", "id", id));
        article.setViews(article.getViews() + 1);
        return toResponse(repository.save(article));
    }
    
    @Transactional
    public KnowledgeArticleResponse getBySlug(String slug) {
        KnowledgeArticle article = repository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeArticle", "slug", slug));
        article.setViews(article.getViews() + 1);
        return toResponse(repository.save(article));
    }

    @Transactional
    public KnowledgeArticleResponse create(KnowledgeArticleRequest request, UUID authorId) {
        String slug = generateSlug(request.getTitle());
        if (repository.existsBySlug(slug)) {
            // Append random string if slug exists
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 5);
        }

        KnowledgeArticle article = KnowledgeArticle.builder()
                .title(request.getTitle())
                .slug(slug)
                .content(request.getContent())
                .category(request.getCategory())
                .tags(request.getTags())
                .status(request.getStatus())
                .authorId(authorId)
                .views(0)
                .helpfulCount(0)
                .unhelpfulCount(0)
                .build();
        
        KnowledgeArticle saved = repository.save(article);
        auditService.log(authorId, "KNOWLEDGE_ARTICLE_CREATED", "KnowledgeArticle", saved.getId().toString(),
                "title=" + saved.getTitle());
        return toResponse(saved);
    }

    @Transactional
    public KnowledgeArticleResponse update(UUID id, KnowledgeArticleRequest request) {
        KnowledgeArticle article = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeArticle", "id", id));

        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setCategory(request.getCategory());
        article.setTags(request.getTags());
        article.setStatus(request.getStatus());

        KnowledgeArticle saved = repository.save(article);
        auditService.log("KNOWLEDGE_ARTICLE_UPDATED", "KnowledgeArticle", id.toString(),
                "title=" + saved.getTitle());
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        KnowledgeArticle article = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeArticle", "id", id));
        repository.delete(article);
        auditService.log("KNOWLEDGE_ARTICLE_DELETED", "KnowledgeArticle", id.toString(),
                "title=" + article.getTitle());
    }

    @Transactional
    public KnowledgeArticleResponse markHelpful(UUID id, boolean helpful) {
        KnowledgeArticle article = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeArticle", "id", id));
        
        if (helpful) {
            article.setHelpfulCount(article.getHelpfulCount() + 1);
        } else {
            article.setUnhelpfulCount(article.getUnhelpfulCount() + 1);
        }
        
        return toResponse(repository.save(article));
    }

    private KnowledgeArticleResponse toResponse(KnowledgeArticle article) {
        KnowledgeArticleResponse dto = new KnowledgeArticleResponse();
        dto.setId(article.getId().toString());
        dto.setTitle(article.getTitle());
        dto.setSlug(article.getSlug());
        dto.setContent(article.getContent());
        dto.setCategory(article.getCategory());
        dto.setTags(article.getTags());
        dto.setAuthorId(article.getAuthorId());
        dto.setStatus(article.getStatus());
        dto.setViews(article.getViews());
        dto.setHelpfulCount(article.getHelpfulCount());
        dto.setUnhelpfulCount(article.getUnhelpfulCount());
        dto.setCreatedAt(article.getCreatedAt() != null ? OffsetDateTime.of(article.getCreatedAt(), ZoneOffset.UTC) : null);
        dto.setUpdatedAt(article.getUpdatedAt() != null ? OffsetDateTime.of(article.getUpdatedAt(), ZoneOffset.UTC) : null);
        return dto;
    }
    
    private String generateSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
    }
}
