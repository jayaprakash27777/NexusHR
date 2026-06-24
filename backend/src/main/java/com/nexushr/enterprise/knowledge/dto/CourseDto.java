package com.nexushr.enterprise.knowledge.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CourseDto {
    private UUID id;
    private String title;
    private String category;
    private String duration;
    private Integer totalModules;
    private String thumbnail;
}
