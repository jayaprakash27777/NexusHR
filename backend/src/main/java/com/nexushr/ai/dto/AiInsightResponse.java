package com.nexushr.ai.dto;

import com.nexushr.ai.model.InsightPriority;
import com.nexushr.ai.model.InsightType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiInsightResponse {

    private UUID id;
    private InsightType insightType;
    private String title;
    private String description;
    private InsightPriority priority;
    private String category;
    private String dataJson;
    private UUID employeeId;
    private String employeeName;
    private UUID departmentId;
    private String departmentName;
    private boolean actionable;
    private boolean dismissed;
    private LocalDateTime generatedAt;
}
