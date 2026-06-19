package com.nexushr.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDocumentDto {
    private UUID id;
    private UUID employeeId;
    private String documentType;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private OffsetDateTime uploadDate;
}
