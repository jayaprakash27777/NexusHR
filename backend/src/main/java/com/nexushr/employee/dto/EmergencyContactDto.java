package com.nexushr.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyContactDto {
    private UUID id;
    private UUID employeeId;
    private String name;
    private String relationship;
    private String phoneNumber;
    private String email;
    private boolean isPrimary;
}
