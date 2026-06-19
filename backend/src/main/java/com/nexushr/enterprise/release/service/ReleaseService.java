package com.nexushr.enterprise.release.service;

import com.nexushr.common.audit.AuditService;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.BadRequestException;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.enterprise.release.dto.ReleaseNoteRequest;
import com.nexushr.enterprise.release.dto.ReleaseNoteResponse;
import com.nexushr.enterprise.release.model.ReleaseNote;
import com.nexushr.enterprise.release.repository.ReleaseNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReleaseService {

    private final ReleaseNoteRepository repository;
    private final AuditService auditService;

    public PagedResponse<ReleaseNoteResponse> getAll(String search, Boolean published, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReleaseNote> notes = repository.searchReleases(search, published, pageable);
        return PagedResponse.<ReleaseNoteResponse>builder()
                .content(notes.getContent().stream().map(this::toResponse).toList())
                .page(notes.getNumber())
                .size(notes.getSize())
                .totalElements(notes.getTotalElements())
                .totalPages(notes.getTotalPages())
                .first(notes.isFirst())
                .last(notes.isLast())
                .build();
    }

    public ReleaseNoteResponse getById(UUID id) {
        return toResponse(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReleaseNote", "id", id)));
    }

    public ReleaseNoteResponse getByVersion(String version) {
        return toResponse(repository.findByVersion(version)
                .orElseThrow(() -> new ResourceNotFoundException("ReleaseNote", "version", version)));
    }

    @Transactional
    public ReleaseNoteResponse create(ReleaseNoteRequest request, UUID authorId) {
        if (repository.existsByVersion(request.getVersion())) {
            throw new BadRequestException("Release version already exists: " + request.getVersion());
        }

        ReleaseNote note = ReleaseNote.builder()
                .version(request.getVersion())
                .title(request.getTitle())
                .releaseType(request.getReleaseType())
                .description(request.getDescription())
                .changes(request.getChanges())
                .published(request.isPublished())
                .publishedAt(request.isPublished() ? OffsetDateTime.now() : null)
                .authorId(authorId)
                .build();

        ReleaseNote saved = repository.save(note);
        auditService.log(authorId, "RELEASE_NOTE_CREATED", "ReleaseNote", saved.getId().toString(),
                "version=" + saved.getVersion());
        return toResponse(saved);
    }

    @Transactional
    public ReleaseNoteResponse update(UUID id, ReleaseNoteRequest request) {
        ReleaseNote note = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReleaseNote", "id", id));

        boolean wasPublished = note.isPublished();

        note.setVersion(request.getVersion());
        note.setTitle(request.getTitle());
        note.setReleaseType(request.getReleaseType());
        note.setDescription(request.getDescription());
        note.setChanges(request.getChanges());
        
        if (!wasPublished && request.isPublished()) {
            note.setPublished(true);
            note.setPublishedAt(OffsetDateTime.now());
        } else if (wasPublished && !request.isPublished()) {
            note.setPublished(false);
            note.setPublishedAt(null);
        }

        ReleaseNote saved = repository.save(note);
        auditService.log("RELEASE_NOTE_UPDATED", "ReleaseNote", id.toString(),
                "version=" + saved.getVersion());
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        ReleaseNote note = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReleaseNote", "id", id));
        repository.delete(note);
        auditService.log("RELEASE_NOTE_DELETED", "ReleaseNote", id.toString(),
                "version=" + note.getVersion());
    }

    private ReleaseNoteResponse toResponse(ReleaseNote note) {
        ReleaseNoteResponse dto = new ReleaseNoteResponse();
        dto.setId(note.getId().toString());
        dto.setVersion(note.getVersion());
        dto.setTitle(note.getTitle());
        dto.setReleaseType(note.getReleaseType());
        dto.setDescription(note.getDescription());
        dto.setChanges(note.getChanges());
        dto.setPublished(note.isPublished());
        dto.setPublishedAt(note.getPublishedAt());
        dto.setAuthorId(note.getAuthorId());
        dto.setCreatedAt(note.getCreatedAt() != null ? OffsetDateTime.of(note.getCreatedAt(), ZoneOffset.UTC) : null);
        dto.setUpdatedAt(note.getUpdatedAt() != null ? OffsetDateTime.of(note.getUpdatedAt(), ZoneOffset.UTC) : null);
        return dto;
    }
}
