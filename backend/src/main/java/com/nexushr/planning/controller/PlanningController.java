package com.nexushr.planning.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.planning.model.CareerRoleNode;
import com.nexushr.planning.repository.CareerRoleNodeRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/planning")
@RequiredArgsConstructor
@Tag(name = "Planning API", description = "Endpoints for career pathing and succession planning")
public class PlanningController {

    private final CareerRoleNodeRepository careerRoleNodeRepository;

    @GetMapping("/career-paths")
    @Operation(summary = "Get Career Paths", description = "Retrieves career tracks for IC and Management")
    public ResponseEntity<ApiResponse<Map<String, List<CareerRoleNodeDto>>>> getCareerPaths() {
        List<CareerRoleNode> allNodes = careerRoleNodeRepository.findAll();
        
        List<CareerRoleNodeDto> ic = allNodes.stream()
                .filter(n -> "ic".equalsIgnoreCase(n.getTrackType()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
                
        List<CareerRoleNodeDto> management = allNodes.stream()
                .filter(n -> "management".equalsIgnoreCase(n.getTrackType()))
                .map(this::mapToDto)
                .collect(Collectors.toList());

        Map<String, List<CareerRoleNodeDto>> response = new HashMap<>();
        response.put("ic", ic);
        response.put("management", management);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private CareerRoleNodeDto mapToDto(CareerRoleNode entity) {
        return new CareerRoleNodeDto(
            entity.getId(),
            entity.getTitle(),
            entity.getLevel(),
            entity.getTrackType(),
            new BigDecimal[]{ entity.getBaseMin(), entity.getBaseMax() },
            entity.getStatus(),
            entity.getDescription(),
            entity.getRequirements()
        );
    }

    public record CareerRoleNodeDto(
        String id,
        String title,
        String level,
        String track,
        BigDecimal[] baseRange,
        String status,
        String description,
        List<String> requirements
    ) {}
}
