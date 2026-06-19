package com.nexushr.enterprise.featureflag.service;

import com.nexushr.common.audit.AuditService;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.BadRequestException;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.enterprise.featureflag.dto.FeatureFlagRequest;
import com.nexushr.enterprise.featureflag.dto.FeatureFlagResponse;
import com.nexushr.enterprise.featureflag.model.FeatureFlag;
import com.nexushr.enterprise.featureflag.repository.FeatureFlagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.util.List;
import java.util.UUID;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
public class FeatureFlagService {

    private final FeatureFlagRepository repository;
    private final AuditService auditService;

    public PagedResponse<FeatureFlagResponse> getAll(String search, String environment, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<FeatureFlag> flags = repository.searchFlags(search, environment, pageable);
        return PagedResponse.<FeatureFlagResponse>builder()
                .content(flags.getContent().stream().map(this::toResponse).toList())
                .page(flags.getNumber())
                .size(flags.getSize())
                .totalElements(flags.getTotalElements())
                .totalPages(flags.getTotalPages())
                .first(flags.isFirst())
                .last(flags.isLast())
                .build();
    }

    @Cacheable(value = "feature_flags", key = "#environment")
    public List<FeatureFlagResponse> getEnabledFlags(String environment) {
        return repository.findAllByEnvironmentAndEnabledTrue(environment)
                .stream().map(this::toResponse).toList();
    }

    public FeatureFlagResponse getByKey(String flagKey) {
        return toResponse(repository.findByFlagKey(flagKey)
                .orElseThrow(() -> new ResourceNotFoundException("FeatureFlag", "key", flagKey)));
    }

    @Transactional
    @CacheEvict(value = "feature_flags", allEntries = true)
    public FeatureFlagResponse create(FeatureFlagRequest request) {
        if (repository.existsByFlagKey(request.getFlagKey())) {
            throw new BadRequestException("Feature flag key already exists: " + request.getFlagKey());
        }
        FeatureFlag flag = FeatureFlag.builder()
                .flagKey(request.getFlagKey())
                .name(request.getName())
                .description(request.getDescription())
                .enabled(request.isEnabled())
                .rolloutPercentage(request.getRolloutPercentage())
                .environment(request.getEnvironment())
                .flagType(request.getFlagType())
                .allowedRoles(request.getAllowedRoles())
                .expiresAt(request.getExpiresAt())
                .build();
        FeatureFlag saved = repository.save(flag);
        auditService.log("FEATURE_FLAG_CREATED", "FeatureFlag", saved.getId().toString(),
                "key=" + saved.getFlagKey());
        return toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "feature_flags", allEntries = true)
    public FeatureFlagResponse update(UUID id, FeatureFlagRequest request) {
        FeatureFlag flag = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FeatureFlag", "id", id));

        String before = "enabled=" + flag.isEnabled() + ",rollout=" + flag.getRolloutPercentage();

        flag.setName(request.getName());
        flag.setDescription(request.getDescription());
        flag.setEnabled(request.isEnabled());
        flag.setRolloutPercentage(request.getRolloutPercentage());
        flag.setAllowedRoles(request.getAllowedRoles());
        flag.setExpiresAt(request.getExpiresAt());

        FeatureFlag saved = repository.save(flag);
        auditService.log("FEATURE_FLAG_UPDATED", "FeatureFlag", id.toString(),
                "before: [" + before + "], after: [enabled=" + saved.isEnabled() + ",rollout=" + saved.getRolloutPercentage() + "]");
        return toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "feature_flags", allEntries = true)
    public FeatureFlagResponse toggle(UUID id) {
        FeatureFlag flag = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FeatureFlag", "id", id));
        boolean before = flag.isEnabled();
        flag.setEnabled(!flag.isEnabled());
        FeatureFlag saved = repository.save(flag);
        auditService.log("FEATURE_FLAG_TOGGLED", "FeatureFlag", id.toString(),
                "before: [enabled=" + before + "], after: [enabled=" + saved.isEnabled() + "]");
        return toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "feature_flags", allEntries = true)
    public void delete(UUID id) {
        FeatureFlag flag = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FeatureFlag", "id", id));
        repository.delete(flag);
        auditService.log("FEATURE_FLAG_DELETED", "FeatureFlag", id.toString(),
                "key=" + flag.getFlagKey());
    }

    private FeatureFlagResponse toResponse(FeatureFlag flag) {
        FeatureFlagResponse dto = new FeatureFlagResponse();
        dto.setId(flag.getId().toString());
        dto.setFlagKey(flag.getFlagKey());
        dto.setName(flag.getName());
        dto.setDescription(flag.getDescription());
        dto.setEnabled(flag.isEnabled());
        dto.setRolloutPercentage(flag.getRolloutPercentage());
        dto.setEnvironment(flag.getEnvironment());
        dto.setFlagType(flag.getFlagType());
        dto.setAllowedRoles(flag.getAllowedRoles());
        dto.setExpiresAt(flag.getExpiresAt());
        dto.setCreatedAt(flag.getCreatedAt() != null ? OffsetDateTime.of(flag.getCreatedAt(), ZoneOffset.UTC) : null);
        dto.setUpdatedAt(flag.getUpdatedAt() != null ? OffsetDateTime.of(flag.getUpdatedAt(), ZoneOffset.UTC) : null);
        return dto;
    }
}
