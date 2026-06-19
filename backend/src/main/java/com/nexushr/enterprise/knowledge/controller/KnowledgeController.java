package com.nexushr.enterprise.knowledge.controller;

import com.nexushr.auth.model.User;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.enterprise.knowledge.dto.KnowledgeArticleRequest;
import com.nexushr.enterprise.knowledge.dto.KnowledgeArticleResponse;
import com.nexushr.enterprise.knowledge.service.KnowledgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/knowledge/articles")
@RequiredArgsConstructor
@Tag(name = "Knowledge Base", description = "Knowledge articles management")
public class KnowledgeController {

    private final KnowledgeService service;

    @GetMapping
    @Operation(summary = "List all knowledge articles with optional search and filter")
    public ResponseEntity<ApiResponse<PagedResponse<KnowledgeArticleResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.getAll(search, category, page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single article by ID")
    public ResponseEntity<ApiResponse<KnowledgeArticleResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get a single article by Slug")
    public ResponseEntity<ApiResponse<KnowledgeArticleResponse>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(service.getBySlug(slug)));
    }

    @PostMapping
    @Operation(summary = "Create a new article")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<KnowledgeArticleResponse>> create(
            @Valid @RequestBody KnowledgeArticleRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Article created", service.create(request, user.getId())));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an article")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<KnowledgeArticleResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody KnowledgeArticleRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Article updated", service.update(id, request)));
    }

    @PostMapping("/{id}/helpful")
    @Operation(summary = "Mark article as helpful or unhelpful")
    public ResponseEntity<ApiResponse<KnowledgeArticleResponse>> markHelpful(
            @PathVariable UUID id,
            @RequestParam boolean isHelpful
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.markHelpful(id, isHelpful)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an article")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Article deleted"));
    }
}
