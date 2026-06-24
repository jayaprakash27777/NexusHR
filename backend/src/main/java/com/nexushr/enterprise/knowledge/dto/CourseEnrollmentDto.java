package com.nexushr.enterprise.knowledge.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CourseEnrollmentDto {
    private UUID id;
    private UUID courseId;
    private String title;
    private String category;
    private String duration;
    private Integer totalModules;
    private String thumbnail;
    
    private UUID employeeId;
    private String status;
    private Integer progress;
    private LocalDateTime dueDate;
    private LocalDateTime completedAt;
}
