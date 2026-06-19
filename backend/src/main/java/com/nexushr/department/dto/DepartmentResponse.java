package com.nexushr.department.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {

    private UUID id;
    private String name;
    private String code;
    private String description;
    private UUID managerId;
    private String managerName;
    private boolean active;
    private long employeeCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
