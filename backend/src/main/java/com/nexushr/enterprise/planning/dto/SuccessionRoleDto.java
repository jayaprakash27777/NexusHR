package com.nexushr.enterprise.planning.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class SuccessionRoleDto {
    private UUID id;
    private String title;
    private String departmentName;
    private String incumbentName;
    private String incumbentRisk;
    private Boolean isCritical;
}
