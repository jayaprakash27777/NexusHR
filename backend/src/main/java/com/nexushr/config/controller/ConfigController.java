package com.nexushr.config.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.config.model.SystemConfiguration;
import com.nexushr.config.repository.SystemConfigurationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
@Tag(name = "Platform Config API", description = "Endpoints for platform configuration modules")
public class ConfigController {

    private final SystemConfigurationRepository systemConfigurationRepository;

    @GetMapping("/modules")
    @Operation(summary = "Get Config Modules", description = "Retrieves active platform configuration modules")
    public ResponseEntity<ApiResponse<List<SystemConfigurationDto>>> getModules() {
        List<SystemConfigurationDto> modules = systemConfigurationRepository.findByIsActiveTrue().stream()
                .map(entity -> new SystemConfigurationDto(
                        entity.getModuleId(),
                        entity.getModuleName(),
                        entity.getIconName(),
                        entity.getDescription(),
                        entity.getColorClass()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(modules));
    }

    public record SystemConfigurationDto(
        String id,
        String name,
        String icon,
        String description,
        String color
    ) {}
}
