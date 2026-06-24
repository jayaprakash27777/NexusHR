package com.nexushr.enterprise.knowledge.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class TourStepDto {
    private UUID id;
    private String title;
    private String content;
    private String targetSelector;
    private Integer stepOrder;
}
