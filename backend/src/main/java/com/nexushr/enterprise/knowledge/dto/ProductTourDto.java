package com.nexushr.enterprise.knowledge.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProductTourDto {
    private UUID id;
    private String name;
    private String description;
    private Boolean active;
    private List<TourStepDto> steps;
}
